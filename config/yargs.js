const argv = require("yargs")
    .option("p", {
        alias: "path",
        type: "string",
        demandOption: true,
        describe: 'Path de la carpeta donde se encuentran los archivos PDF que se quiren procesar, ejemplo: F:/Documents/PDF',
    }).argv;

module.exports = argv;
