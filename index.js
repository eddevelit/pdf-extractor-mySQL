const PdfExtractor = require("pdf-extractor").PdfExtractor;
let { processPDFDataIntoBD } = require("./utils/mysqlUtil");
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
    const pdfObject = convertPDFToObject(filteredElements);
    console.log(`Componentes del PDF: ${JSON.stringify(pdfObject)}`);
    processPDFDataIntoBD(pdfObject)
        .then(console.log)
        .catch(console.warn);
  })
  .catch(function (err) {
    console.error("Error: " + err);
  });

