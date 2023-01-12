const PdfExtractor = require("pdf-extractor").PdfExtractor;
// const {processPDFDataIntoBD} = require("./utils/mysqlUtil");
const {convertPDFToObject} = require("./utils/pdfToObject.js");
const fs = require('fs');
const path = require('path');
require ('colors');
const directoryPath = path.join('F:', 'Personal', 'Documents', 'Onikom','Argumentalia', 'MuestrasPDF');
fs.readdir(directoryPath, async (err, files) => {

    if (err) {
        return console.log(`No se encontró el directorio: ${directoryPath} `.red + err);
    }

    for (let i = 0; i < files.length; i++) {
        const filePath = path.join(directoryPath, files[i]);
        await extractPDFData(filePath);
        const pdfObject = await convertPDFToObject(filePath);
        console.log(pdfObject.bgGreen);

    }
});

async function extractPDFData(filePath) {
    try {
        let outputDir = "./archivosPrueba", pdfExtractor = new PdfExtractor(outputDir, {pageRange: [1, 5],});
        await pdfExtractor.parse(filePath);
        return `Elementos extraidos del archivo: ${filePath} `.bgGreen;
    } catch (error) {
        throw error;
    }
}


