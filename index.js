const PdfExtractor = require("pdf-extractor").PdfExtractor;
const {processPDFDataIntoBD} = require("./utils/mysqlUtil");
const convertPDFToObject = require("./utils/pdfToObject.js");
const fs = require('fs');
const path = require('path');
require ('colors');
const directoryPath = path.join('F:', 'Personal', 'Documents', 'Onikom','Argumentalia', 'MuestrasPDFfds');
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
            await pdfExtractor.parse(filePath);
            console.log("# End of Document");
            const body = fs.readFileSync(path.resolve(__dirname, "./", "text-1.html")).toString();
            const x = body.replace(/(<([^>]+)>)/gi, "\n");
            const pdfElements = x.split("\n");
            const filteredElements = pdfElements.filter((element) => {
                return element !== "" && element !== " ";
            });
            const pdfObject = convertPDFToObject(filteredElements);
            const processPDFResult = await processPDFDataIntoBD(pdfObject);
            console.log(processPDFResult);
        } catch (error) {
            console.log(error);
        }
    });
});


