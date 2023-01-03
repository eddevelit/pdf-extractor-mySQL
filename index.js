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
    const fs = require("fs");
    const path = require("path");
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

    processPDFDataIntoBD(pdfObject);

  })
  .catch(function (err) {
    console.error("Error: " + err);
  });


const obtenerId = (campo, valor, tabla) => {
  pool.getConnection(function (error, connection) {
    if (error) {
      throw error;
    } else {
      console.log("Conexion correcta.");

      return new Promise((resolve, reject) => {
        connection.query(
          `SELECT id FROM ${tabla} WHERE ${campo} = '${valor}'`,
          (err, result) => {
            if (err) {
              return reject(err);
            }
            console.log(`Id de ${tabla}: ${result[0].id}`);
            return resolve(result[0].id);
          }
        );
      });
    }
  });
};

async function processPDFDataIntoBD(pdfObject) {
   
}


// async processPDFDataIntoBD(pdfObject) => {
//   obtenerId("nombre", pdfObject.datosGenerales.tipoJuicio, "tipo_juicios").then(
//     (id) => {
//       console.log(`id: ${id}`);
//     }
//   );
// }

// Raw insert
// pool.getConnection(function (error, connection) {
//    if (error) {
//      throw error;
//    } else {
//      console.log("Conexion correcta.");

//      let tipoJuiciosId;

//      // Getting tipoJuiciosId
//      let tipoJuicioQuery = `SELECT id FROM tipo_juicios WHERE nombre = '${pdfObject.datosGenerales.tipoJuicio}'`;
//      connection.query(tipoJuicioQuery, function (err, result) {
//        if (result.length > 0) {
//          console.log(`${result[0].id}`);
//          tipoJuiciosId = result[0].id;
//          // Inserting into expedientes
//          let expedienteQuery = `INSERT INTO expedientes (numero_expediente, folio, juez, juzgado, actor, demandado, secretario, juicio_id, estado, created_at, updated_at) 
//             VALUES ('${pdfObject.datosGenerales.numeroExpediente}', '${pdfObject.datosGenerales.folio}', '${pdfObject.datosGenerales.juez}', '${pdfObject.sala}', '${pdfObject.datosGenerales.parteActora}', '${pdfObject.datosGenerales.parteDemandada}', '${pdfObject.datosGenerales.secretario}', '${tipoJuiciosId}', '1', NOW(), NOW())`;
//          connection.query(expedienteQuery, function (err, result) {
//            if (err) {
//              throw new Error(`Error al insertar en expedientes: ${err}`);
//            } else {
//              console.log(
//                `Expediente insertado correctamente: ${JSON.stringify(
//                  result
//                )}`
//              );
//            }
//          });
//        } else {
//          throw new Error(`Id no encontrado: ${err}`);
//        }
//      });
//    }
//  });
