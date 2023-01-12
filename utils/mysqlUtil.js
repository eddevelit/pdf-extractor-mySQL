const util = require('util')
const mysql = require('mysql')

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'Edmysql6792.',
    database: 'db_argumentalia',
    port: 3306
})

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.');
        }
    }

    if (connection) connection.release();
})

pool.query = util.promisify(pool.query)

const obtenerId = async (campo, valor, tabla) => {
    try {
        console.log(`buscando id de tabla: ${tabla} con los datos => campo: ${campo}, valor: ${valor} `.blue)
        const [result] = await pool.query(`SELECT id FROM ${tabla} WHERE ${campo} = '${valor}'`);
        console.log(`id de ${tabla} obtenido: ${result.id}`.blue)
        return result.id;
    } catch (error) {
        throw error;
    }
}

const mysqlSelect = async (table, fields, where, extraParams) => {
    try {
        const selectQuery = `SELECT ${fields} FROM ${table} ${where} ${extraParams}`;
        console.log(`Realizando consulta => ${selectQuery} `.blue)
        const [result] = await pool.query(selectQuery);
        console.log(`Consulta realizada, resultado: ${JSON.stringify(result)}`.blue)
        return result;
    } catch (error) {
        throw error;
    }
}

const mySQLInsert = async (table, fields, values) => {
    try {
        const insertQuery = `INSERT INTO ${table} (${fields}) VALUES (${values})`;
        console.log(`Realizando insercion => ${insertQuery} `.blue)
        const insertResult = await pool.query(insertQuery);
        return `Insercion a tabla: ${table}, id: ${insertResult.insertId}`.blue;
    } catch (error) {
        throw error;
    }
}

const processPDFDataIntoBD = async (pdfObject) => {

    let insertFields;
    let insertValues;

    try {

        // Inserting expediente
        const tipoJuicio = await obtenerId('nombre', pdfObject.datosGenerales.tipoJuicio, 'tipo_juicios')
        insertFields = `numero_expediente, folio, juez, actor, demandado, secretario, juicio_id, created_at, updated_at`;
        insertValues = `'${pdfObject.datosGenerales.numeroExpediente}', '${pdfObject.datosGenerales.folio}', '${pdfObject.datosGenerales.juez}', '${pdfObject.datosGenerales.parteActora}', '${pdfObject.datosGenerales.parteDemandada}', '${pdfObject.datosGenerales.secretario}', '${tipoJuicio}', NOW(), NOW()`
        const insercionExpediente = await mySQLInsert(`expedientes`, insertFields, insertValues);
        console.log(insercionExpediente.blue);

        // Inserting tokens
        const expediente = await mysqlSelect(`expedientes`, `id`, ``, `order by id desc limit 1`);
        insertFields = `token, expediente_id, created_at, updated_at`;

        insertValues = `'${pdfObject.tokenInvitado}', '${expediente.id}', NOW(), NOW()`
        const insercionTokenInvitado = await mySQLInsert(`token_audiencia_invitados`, insertFields, insertValues);
        console.log(insercionTokenInvitado.blue);

        insertValues = `'${pdfObject.tokenAcceso}', '${expediente.id}', NOW(), NOW()`
        const insercionTokenAcceso = await mySQLInsert(`token_audiencias`, insertFields, insertValues);
        console.log(insercionTokenAcceso.blue);

        // Inserting audiencias
        const salaId = await obtenerId('sala', pdfObject.sala, 'salas');
        const centroDeJusticiaId = await obtenerId('nombre', pdfObject.datosGenerales.centroJusticia, 'centro_justicias');
        // TODO Determine what audience status should be added
        // const estadoAudienciaId = await obtenerId('nombre', 'Pendiente', 'estado_audiencias');
        const tipoAudienciaId = await obtenerId('nombre', pdfObject.datosGenerales.tipoAudicencia, 'tipo_audiencias');

        insertFields = `centroJusticia_id, sala_id, tipo_id, expediente_id, estadoAudiencia_id, fechaCelebracion, horaInicio, horaFinalizar, created_at, updated_at`;
        insertValues = `'${centroDeJusticiaId}', '${salaId}', '${tipoAudienciaId}', '${expediente.id}', '1', '${pdfObject.datosGenerales.fechaCelebracion}', '${pdfObject.datosGenerales.horaInicio}', '${pdfObject.datosGenerales.horaAFinalizar}', NOW(), NOW()`
        const insercionAudiencia = await mySQLInsert(`audiencias`, insertFields, insertValues);
        console.log(insercionAudiencia.blue);

        // Inserting personal
        insertFields = `nombre, rol_personal_id, audiencia_id, created_at, updated_at`;
        let insercionPersonal;
        const audiencia = await mysqlSelect(`audiencias`, `id`, ``, `order by id desc limit 1`);

        const juezRoleId = await obtenerId('tipo_personal', 'Juez', 'roles_personals');
        insertValues = `'${pdfObject.datosGenerales.juez}', '${juezRoleId}', '${audiencia.id}', NOW(), NOW()`
        insercionPersonal = await mySQLInsert(`personal_audiencias`, insertFields, insertValues);
        console.log(insercionPersonal.blue);

        const secretarioRoleId = await obtenerId('tipo_personal', 'Secretario', 'roles_personals');
        insertValues = `'${pdfObject.datosGenerales.secretario}', '${secretarioRoleId}', '${audiencia.id}', NOW(), NOW()`
        insercionPersonal = await mySQLInsert(`personal_audiencias`, insertFields, insertValues);
        console.log(insercionPersonal.blue);

        const parteActoraRoleId = await obtenerId('tipo_personal', 'Parte Actora', 'roles_personals');
        insertValues = `'${pdfObject.datosGenerales.parteActora}', '${parteActoraRoleId}', '${audiencia.id}', NOW(), NOW()`
        insercionPersonal = await mySQLInsert(`personal_audiencias`, insertFields, insertValues);
        console.log(insercionPersonal.blue);

        const parteDemandadaRoleId = await obtenerId('tipo_personal', 'Parte Demandada', 'roles_personals');
        insertValues = `'${pdfObject.datosGenerales.parteDemandada}', '${parteDemandadaRoleId}', '${audiencia.id}', NOW(), NOW()`
        insercionPersonal = await mySQLInsert(`personal_audiencias`, insertFields, insertValues);
        console.log(insercionPersonal.blue);

        return `PDF procesado a base de datos de forma exitosa :)`.green;

    } catch (error) {
        throw error;
    }
}

module.exports = {
    processPDFDataIntoBD,
    pool
}
