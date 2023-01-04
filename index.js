const PdfExtractor = require("pdf-extractor").PdfExtractor;
let pool = require("./mysqlUtil");
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
    console.log(`object: ${JSON.stringify(pdfObject)}`);
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
                console.log(`Conexion correcta, buscando id de tabla: ${tabla} con los datos => campo: ${campo} valor: ${valor} `)
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

const mySQLInsert = (insertQuery) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error){
                reject(`No se pudo realizasr el insert: ${error}`);
            }
            else {
                console.log(`Conexion correcta, realizando insert `)
                connection.query(insertQuery, (err, result)=>{
                    if (err){
                        reject(err);
                    } else {
                        resolve(`Insercion correcta: ${result}`);
                    }
                });
            }
        });
    });
}

const processPDFDataIntoBD = async (pdfObject) => {
    try {
        const tipoJuicioId = await obtenerId('nombre', pdfObject.datosGenerales.tipoJuicio, 'tipo_juicios')
        console.log(`tipoJuicioId: ${tipoJuicioId}`);

        let expedienteQuery = `INSERT INTO expedientes (numero_expediente, folio, juez, actor, demandado, secretario, juicio_id, estado, created_at, updated_at) 
            VALUES ('${pdfObject.datosGenerales.numeroExpediente}', '${pdfObject.datosGenerales.folio}', '${pdfObject.datosGenerales.juez}', '${pdfObject.datosGenerales.parteActora}', '${pdfObject.datosGenerales.parteDemandada}', '${pdfObject.datosGenerales.secretario}', '${tipoJuicioId}', '1', NOW(), NOW())`;
        const insercionExpediente = await mySQLInsert(expedienteQuery);
        console.log(insercionExpediente);

        return `PDF procesado a base de datos de forma exitosa`;

    } catch (e) {
        throw e;
    }
}
