const PdfExtractor = require('pdf-extractor').PdfExtractor;
const mysql = require ('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Edmysql6792.',
    database: 'bebbia_pdf_test',
    port: 3306
});

let outputDir = './',

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
    pageRange: [1,5],
});

pdfExtractor.parse('test.pdf').then(function () {
	console.log('# End of Document');
    const fs = require('fs');
    const path = require('path');
    const body = fs.readFileSync(path.resolve(__dirname, './', "text-1.html")).toString();
    const x = body.replace(/(<([^>]+)>)/ig, '\n');
    // console.log(`x: ${x}`);
    const pdfElements = x.split('\n');
    const filteredElements = pdfElements.filter((element) => {
        return element !== '' && element !== ' ';
    });
    // console.log(`filteredElements: ${filteredElements}`);
    const pdfObject = convertPDFToObject(filteredElements);
    console.log(`object: ${JSON.stringify(pdfObject)}`);

    connection.connect(function(error){
        if(error){
            throw error;
        }else{
            console.log('Conexion correcta.');
            var sql = `INSERT INTO Audiencias (CentroDeJusticia, Sala, Agendada, TokenDeAcceso, TokenDeInvitado) VALUES ('${pdfObject.centroDeJusticia}', '${pdfObject.sala}', '${pdfObject.agendada}', '${pdfObject.tokenAcceso}', '${pdfObject.tokenInvitado}')`;
            connection.query(sql, function (err, result) {
                if (err) throw err;
                console.log("1 record inserted");
            });
        }
    });

    // Close the MySQL connection
// connection.end(function(error){
//     if(error){
//         throw error;
//     }else{
//         console.log('Conexion finalizada.');
//     }
// });
    

}).catch(function (err) {
	console.error('Error: ' + err);
});

function convertPDFToObject(pdfElementsArray) {
    const titulo = pdfElementsArray[0];
    const centroDeJusticia = pdfElementsArray[2].replace(':', '').trim();
    const sala = pdfElementsArray[4].replace(':', '').trim();
    const agendada = pdfElementsArray[6].replace(':', '').trim();
    const numeroExpediente = pdfElementsArray[10];
    const folio = pdfElementsArray[11];
    const juez = pdfElementsArray[17];
    const secretario = pdfElementsArray[18];
    const testigo = pdfElementsArray[19];
    const parteActora = pdfElementsArray[20];
    const parteDemandada = pdfElementsArray[21];
    const centroJusticia = pdfElementsArray[26];
    const tipoAudicencia = pdfElementsArray[28];
    const tipoJuicio = pdfElementsArray[29];
    const fechaCelebracion = pdfElementsArray[33];
    const horaInicio = pdfElementsArray[34];
    const horaAFinalizar = pdfElementsArray[35];

    // Getting participants
    const participantes = [];
    const participanteInicial = pdfElementsArray.indexOf('Lista de participantes');
    const tokenIndex = pdfElementsArray.indexOf('Token de acceso');
    for (let i = participanteInicial + 1; i < tokenIndex; i++) {
        participante = {
            nombre : '',
            rol: ''
        }
        if (pdfElementsArray[i] === 'Rol') {
            participante.nombre = pdfElementsArray[i + 1];
            participante.rol = pdfElementsArray[i + 2];
            participantes.push(participante);
        }
    }   

    const tokenAcceso = pdfElementsArray[tokenIndex + 1];
    const tokenInvitado = pdfElementsArray[tokenIndex + 3];

    return {
        titulo : titulo,
        centroDeJusticia : centroDeJusticia,
        sala : sala,
        agendada : agendada,
        datosGenerales : {
            numeroExpediente : numeroExpediente,
            folio : folio,
            juez : juez,
            secretario : secretario,
            testigo : testigo,
            parteActora : parteActora,
            parteDemandada : parteDemandada,
            centroJusticia : centroJusticia,
            tipoAudicencia : tipoAudicencia,
            tipoJuicio : tipoJuicio,
            fechaCelebracion : fechaCelebracion,
            horaInicio : horaInicio,
            horaAFinalizar : horaAFinalizar
        },
        participantes : participantes,
        tokenAcceso : tokenAcceso,
        tokenInvitado : tokenInvitado
    }
}
