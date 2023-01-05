const PdfExtractor = require("pdf-extractor").PdfExtractor;
const { processPDFDataIntoBD, pool} = require("./utils/mysqlUtil");
const convertPDFToObject = require("./utils/pdfToObject.js");
const fs = require('fs');
const path = require('path');

const directoryPath = path.join('C:', 'Rotoplas', 'Argumentalia', 'PDFs de Audiencias');

fs.readdir(directoryPath, (err, files) => {

    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    let outputDir = "./",
        pdfExtractor = new PdfExtractor(
            outputDir, { viewportScale: (width, height) => {
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

    files.forEach(file => {
        let filePath = path.join(directoryPath, file);
        console.log(filePath);
        pdfExtractor
            .parse(filePath)
            .then(() => {
                console.log("# End of Document");
                const body = fs.readFileSync(path.resolve(__dirname, "./", "text-1.html")).toString();
                const x = body.replace(/(<([^>]+)>)/gi, "\n");
                const pdfElements = x.split("\n");
                const filteredElements = pdfElements.filter((element) => {
                    return element !== "" && element !== " ";
                });
                const pdfObject = convertPDFToObject(filteredElements);
                console.log(`Componentes del PDF: ${JSON.stringify(pdfObject)}`);
                processPDFDataIntoBD(pdfObject)
                    .then((res) => {
                        console.log(res);
                    })
                    .catch(console.error);
            })
            .catch(function (err) {
                console.error("Error: " + err);
            });
    });
});


