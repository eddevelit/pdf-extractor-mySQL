const PdfExtractor = require("pdf-extractor").PdfExtractor;
let pool = require("./utils/mysqlUtil");
let convertPDFToObject = require("./utils/pdfToObject.js");

let outputDir = "./",
  pdfExtractor = new PdfExtractor(outputDir, {
    viewportScale: (width, height) => {
      //dynamic zoom based on rendering a page to a fixed page size
      if (width > height) {
        //landscape: 1100px wide
        return 1100 / width;
      }
      //portrait: 800px wide
      return 800 / width;
    },
    pageRange: [1, 5],
  });

pdfExtractor
  .parse("test.pdf")
  .then(function () {
    console.log("# End of Document");
    const fs = require('fs');
    const path = require('path');
    const body = fs
      .readFileSync(path.resolve(__dirname, "./", "text-1.html"))
      .toString();
    const x = body.replace(/(<([^>]+)>)/gi, "\n");
    const pdfElements = x.split("\n");
    const filteredElements = pdfElements.filter((element) => {
      return element !== "" && element !== " ";
    });
    // console.log(`filteredElements: ${filteredElements}`);
    const pdfObject = convertPDFToObject(filteredElements);
    console.log(`Componentes del PDF: ${JSON.stringify(pdfObject)}`);
    processPDFDataIntoBD(pdfObject)
        .then(console.log)
        .catch(console.warn);
  })
  .catch(function (err) {
    console.error("Error: " + err);
  });


const obtenerId = (campo, valor, tabla) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error){
                reject(`No se pudo encontrar el id de ${tabla}: ${error}`);
            }
            else {
                console.log(`Conexion correcta, buscando id de tabla: ${tabla} con los datos => campo: ${campo}, valor: ${valor} `)
                connection.query(`SELECT id FROM ${tabla} WHERE ${campo} = '${valor}'`, (err, result) => {
                   if (err) {
                       reject(`No se pudo encontrar el id de ${tabla}: ${err}`);
                   } else {
                       resolve(result[0].id);
                   }
                });
            }
        });
    });
};

const mysqlSelect = (table, fields, where, extraParams) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error){
                reject(`No se pudo realizar la consulta: ${error}`);
            }
            else {
                const selectQuery = `SELECT ${fields} FROM ${table} ${where} ${extraParams}`;
                console.log(`Conexion correcta, realizando consulta => ${selectQuery} `)
                connection.query(selectQuery, (err, result) => {
                   if (err) {
                       reject(`No se pudo realizar la consulta: ${err}`);
                   } else {
                       resolve(result);
                   }
                });
            }
        });
    });
}



const mySQLInsert = (table, fields, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error){
                reject(`No se pudo realizar el insert: ${error}`);
            }
            else {
                console.log(`Conexion correcta, realizando insert `)
                const insertQuery = `INSERT INTO ${table} (${fields}) VALUES (${values})`;
                connection.query(insertQuery, (err, result)=>{
                    if (err){
                        reject(err);
                    } else {
                        resolve(`Insercion correcta: ${JSON.stringify(result)}`);
                    }
                });
            }
        });
    });
}

const processPDFDataIntoBD = async (pdfObject) => {

    let insertFields;
    let insertValues;
    let personal = [];

    try {

        // Inserting expediente
        const tipoJuicioId = await obtenerId('nombre', pdfObject.datosGenerales.tipoJuicio, 'tipo_juicios')
        insertFields = `numero_expediente, folio, juez, actor, demandado, secretario, juicio_id, estado, created_at, updated_at`;
        insertValues = `'${pdfObject.datosGenerales.numeroExpediente}', '${pdfObject.datosGenerales.folio}', '${pdfObject.datosGenerales.juez}', '${pdfObject.datosGenerales.parteActora}', '${pdfObject.datosGenerales.parteDemandada}', '${pdfObject.datosGenerales.secretario}', '${tipoJuicioId}', '1', NOW(), NOW()`
        const insercionExpediente = await mySQLInsert(`expedientes`, insertFields, insertValues);
        console.log(insercionExpediente);

        // Inserting tokens
        const [expediente] = await mysqlSelect(`expedientes`, `id`, ``, `order by id desc limit 1`);
        console.log(`ExpedienteId: ${JSON.stringify(expediente.id)}`);

        insertFields = `token, expediente_id, created_at, updated_at`;
        insertValues = `'${pdfObject.tokenInvitado}', '${expediente.id}', NOW(), NOW()`
        const insercionTokenInvitado = await mySQLInsert(`token_audiencia_invitados`, insertFields, insertValues);
        console.log(insercionTokenInvitado);

        insertValues = `'${pdfObject.tokenAcceso}', '${expediente.id}', NOW(), NOW()`
        const insercionTokenAcceso = await mySQLInsert(`token_audiencias`, insertFields, insertValues);
        console.log(insercionTokenAcceso);

        // Inserting audiencias

        const salaId = await obtenerId('sala', pdfObject.sala, 'salas');
        console.log(salaId);

        const centroDeJusticiaId = await obtenerId('nombre', pdfObject.datosGenerales.centroJusticia, 'centro_justicias');
        console.log(centroDeJusticiaId);

        // TODO Determine what audience status should be added
        // const estadoAudienciaId = await obtenerId('nombre', 'Pendiente', 'estado_audiencias');

        const tipoAudienciaId = await obtenerId('nombre', pdfObject.datosGenerales.tipoAudicencia, 'tipo_audiencias');
        console.log(tipoAudienciaId);

        insertFields = `centroJusticia_id, sala_id, tipo_id, expediente_id, estadoAudiencia_id, fechaCelebracion, horaInicio, horaFinalizar, created_at, updated_at`;
        insertValues = `'${centroDeJusticiaId}', '${salaId}', '${tipoAudienciaId}', '${expediente.id}', '1', '${pdfObject.datosGenerales.fechaCelebracion}', '${pdfObject.datosGenerales.horaInicio}', '${pdfObject.datosGenerales.horaAFinalizar}', NOW(), NOW()`
        const insercionAudiencia = await mySQLInsert(`audiencias`, insertFields, insertValues);
        console.log(insercionAudiencia);

        // Inserting personal

        const [audiencia] = await mysqlSelect(`audiencias`, `id`, ``, `order by id desc limit 1`);
        console.log(`AudienciaId: ${JSON.stringify(audiencia.id)}`);

        const juezRoleId = await obtenerId('tipo_personal', 'Juez', 'roles_personals');
        const juez = {
            name: pdfObject.datosGenerales.juez,
            role: juezRoleId
        }
        personal.push(juez);

        const secretarioRoleId = await obtenerId('tipo_personal', 'Secretario', 'roles_personals');
        const secretario = {
            name: pdfObject.datosGenerales.secretario,
            role: secretarioRoleId
        }
        personal.push(secretario);

        const testigoRoleId = await obtenerId('tipo_personal', 'Testigo', 'roles_personals');
        const testigo = {
            name: pdfObject.datosGenerales.testigo,
            role: testigoRoleId
        }
        personal.push(testigo);

        const parteActoraRoleId = await obtenerId('tipo_personal', 'Parte Actora', 'roles_personals');
        const parteActora = {
            name: pdfObject.datosGenerales.parteActora,
            role: parteActoraRoleId
        }
        personal.push(parteActora);

        const parteDemandadaRoleId = await obtenerId('tipo_personal', 'Parte Demandada', 'roles_personals');
        const parteDemandada = {
            name: pdfObject.datosGenerales.parteDemandada,
            role: parteDemandadaRoleId
        }
        personal.push(parteDemandada);

        personal.map(async (p) => {
            insertFields = `nombre, rol_personal_id, audiencia_id, created_at, updated_at`;
            insertValues = `'${p.name}', '${p.role}', '${audiencia.id}', NOW(), NOW()`
            const insercionPersonal = await mySQLInsert(`personal_audiencias`, insertFields, insertValues);
            console.log(insercionPersonal);
        });

        return `PDF procesado a base de datos de forma exitosa :)`;

    } catch (e) {
        throw e;
    }
}
