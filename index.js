const {processPDFDataIntoBD, pool} = require("./utils/mysqlUtil");
const {convertPDFToObject} = require("./utils/pdfToObject.js");
const {extractPDFData} = require("./utils/pdfExtractor.js");

const fs = require('fs');
const path = require('path');
require('colors');

const directoryPath = path.join('F:', 'Personal', 'Documents', 'Onikom', 'Argumentalia', 'MuestrasPDF');
fs.readdir(directoryPath, async (err, files) => {

    if (err) {
        return console.log(`No se encontró el directorio: ${directoryPath} `.red + err);
    }

    for (let i = 0; i < files.length; i++) {
        const filePath = path.join(directoryPath, files[i]);
        await extractPDFData(filePath);
        const pdfObject = await convertPDFToObject(filePath);
        const bdResult = await processPDFDataIntoBD(pdfObject);
        console.log(bdResult);
    }
    await pool.end();
});



