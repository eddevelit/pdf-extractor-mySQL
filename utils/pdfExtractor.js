const {PdfExtractor} = require("pdf-extractor");

async function extractPDFData(filePath) {
    try {
        let outputDir = "./archivosPrueba", pdfExtractor = new PdfExtractor(outputDir, {pageRange: [1, 5],});
        await pdfExtractor.parse(filePath);
        return `Elementos extraidos del archivo: ${filePath} `.bgGreen;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    extractPDFData
}
