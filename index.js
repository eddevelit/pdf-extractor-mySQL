const {processPDFDataIntoBD, pool} = require("./utils/mysqlUtil");
const {convertPDFToObject} = require("./utils/pdfToObject.js");
const {extractPDFData} = require("./utils/pdfExtractor.js");

const fs = require('fs');
const path = require('path');
require('colors');
const argv = require('./config/yargs');

const directoryPath = argv.p.replace(/\\/g, '/');
fs.readdir(directoryPath, async (err, files) => {

    if (err) {
        return console.log(`No se encontró el directorio: ${directoryPath}, `.red + err);
    }

    for (let i = 0; i < files.length; i++) {
        if (!files[i].endsWith('.pdf'))  continue;
        const filePath = path.join(directoryPath, files[i]);
        await extractPDFData(filePath);
        const pdfObject = await convertPDFToObject(filePath);
        const bdResult = await processPDFDataIntoBD(pdfObject);
        console.log(bdResult);
    }

    await pool.end();

});



