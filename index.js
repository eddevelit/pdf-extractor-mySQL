const PdfExtractor = require("pdf-extractor").PdfExtractor;
// const {processPDFDataIntoBD} = require("./utils/mysqlUtil");
const {convertPDFToObject} = require("./utils/pdfToObject.js");
const fs = require('fs');
const path = require('path');
require ('colors');
const directoryPath = path.join('F:', 'Personal', 'Documents', 'Onikom','Argumentalia', 'MuestrasPDF');
fs.readdir(directoryPath, (err, files) => {

    if (err) {
        return console.log(`No se encontró el directorio: ${directoryPath} `.red + err);
    }

    let outputDir = "./",
        pdfExtractor = new PdfExtractor(
            outputDir, {
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

    files.forEach(async file => {
        try {
            let filePath = path.join(directoryPath, file);
            console.log(`Procesando archivo: ${filePath} `.bgCyan);
            await pdfExtractor.parse(filePath);
            const body = fs.readFileSync(path.resolve(__dirname, "./", "text-1.html")).toString();
            const pdfObject = convertPDFToObject(body, filePath);
            // const processPDFResult = await processPDFDataIntoBD(pdfObject);
            // console.log(processPDFResult);
        } catch (error) {
            console.log(error);
        }
    });
});


