const fs = require("fs");
const path = require("path");

const getParticipantsFromHTML = (body) => {

        const parteDemandadaIndex = body.indexOf('Parte Demandada');
        const centroDeJusticiaIndex = body.lastIndexOf('Centro de justicia</');
        let personalSection = body.substring(parteDemandadaIndex + 22, centroDeJusticiaIndex);
        // console.log(personalSection.bgCyan);

        // Removing br tags
        personalSection = personalSection.replace(/(<br role="presentation">)/gi, "\n");
        // console.log(`Removing br tags`.blue);
        // console.log(personalSection.bgCyan);

        // Removing empty span tags
        while (personalSection.includes('> </span>')) {

            let emptySpanSection = personalSection.substring(0, personalSection.indexOf('> </span>') + 9);
            // fs.writeFileSync(`emptySection.txt`, emptySpanSection);
            // console.log(`emptySpanSection`.blue);
            // console.log(emptySpanSection.bgGreen);

            personalSection = personalSection.slice(0, emptySpanSection.lastIndexOf('<span')) + personalSection.slice(emptySpanSection.length, personalSection.length);
            // console.log(`personalSection`.blue);
            // console.log(personalSection.bgBlue);
        }

//     Ordening personal
        personalSection = personalSection.trim();

        // fs.writeFileSync(`personalSection.txt`, personalSection);

        let personalArray = personalSection.split("</span>");
        // personalArray.pop();
        // console.table(personalArray);

        let completedPersonal = [];

        for (let i = 0; i < personalArray.length - 1; i++) {

            let personal = personalArray[i].substring(personalArray[i].indexOf('>') + 1, personalArray[i].length);

            while ((parseFloat(personalArray[i + 1].substring(personalArray[i + 1].indexOf('left:') + 6, personalArray[i + 1].indexOf('px'))) -
                parseFloat(personalArray[i].substring(personalArray[i].indexOf('left:') + 6, personalArray[i].indexOf('px')))
                < 130)) {

                let nextPersonal = personalArray[i + 1].substring(personalArray[i + 1].indexOf('>') + 1, personalArray[i + 1].length);
                // console.log(`currentPersonal: ${currentPersonal}`.blue);
                // console.log(`nextPersonal: ${nextPersonal}`.blue);

                personal = personal + " " + nextPersonal;

                i++;
                if (i === personalArray.length - 1) {
                    break;
                }
            }

            // console.log(`personal: ${personal}`.bgGreen);
            completedPersonal.push(personal);

        }

        // console.log(`completedPersonal: ${completedPersonal}`.bgBlue);
        return completedPersonal;
};

const convertPDFToObject = async (pdfName) => {

    try {
        console.log(`Tranformando archivo: ${pdfName} `.cyan);

        const body = fs.readFileSync(path.resolve(__dirname, "../archivosPrueba", "text-1.html")).toString();

        const personal = getParticipantsFromHTML(body);

        const x = body.replace(/(<([^>]+)>)/gi, "\n");
        const pdfElements = x.split("\n");
        // console.table(pdfElements);
        const filteredElements = pdfElements.filter((element) => {
            return element !== "" && element !== " ";
        });
        // console.table(filteredElements);

        const titulo = filteredElements[0];
        const centroDeJusticia = filteredElements[2].replace(":", "").trim();
        const sala = filteredElements[4].replace(":", "").trim();
        const agendada = filteredElements[6].replace(":", "").trim();
        const numeroExpediente = filteredElements[10];
        const folio = filteredElements[11];
        const juez = personal[0];
        const secretario = personal[1];
        // const testigo = filteredElements[19];
        const parteActora = personal[2];
        const parteDemandada = personal[3];
        const tipoDeJuicioIndex = filteredElements.indexOf('Tipo de Juicio');
        const centroJusticia = filteredElements[tipoDeJuicioIndex + 1];
        const tipoAudicencia = filteredElements[tipoDeJuicioIndex + 3];
        const tipoJuicio = filteredElements[tipoDeJuicioIndex + 4];
        const horaFinalizarIndex = filteredElements.indexOf('Hora a Finalizar');
        const fechaCelebracion = filteredElements[horaFinalizarIndex + 1];
        const horaInicio = filteredElements[horaFinalizarIndex + 2];
        const horaAFinalizar = filteredElements[horaFinalizarIndex + 3];

        // Getting participants
        const participantes = [];
        const participanteInicial = filteredElements.indexOf(
            "Lista de participantes"
        );
        const tokenIndex = filteredElements.indexOf("Token de acceso");
        for (let i = participanteInicial + 1; i < tokenIndex; i++) {
            participante = {
                nombre: "",
                rol: "",
            };
            if (filteredElements[i] === "Rol") {
                participante.nombre = filteredElements[i + 1];
                participante.rol = filteredElements[i + 2];
                participantes.push(participante);
            }
        }

        const tokenAcceso = filteredElements[tokenIndex + 1];
        const tokenInvitado = filteredElements[tokenIndex + 3];

        const pdfObject = {
            titulo: titulo,
            centroDeJusticia: centroDeJusticia,
            sala: sala,
            agendada: agendada,
            datosGenerales: {
                numeroExpediente: numeroExpediente,
                folio: folio,
                juez: juez,
                secretario: secretario,
                // testigo: testigo,
                parteActora: parteActora,
                parteDemandada: parteDemandada,
                centroJusticia: centroJusticia,
                tipoAudicencia: tipoAudicencia,
                tipoJuicio: tipoJuicio,
                fechaCelebracion: fechaCelebracion,
                horaInicio: horaInicio,
                horaAFinalizar: horaAFinalizar,
            },
            participantes: participantes,
            tokenAcceso: tokenAcceso,
            tokenInvitado: tokenInvitado
        }

        console.log(`PDF Object: ${JSON.stringify(pdfObject)}`.bgCyan);

        console.log(`PDF transformado de manera exitosa`.green);

        // const fileName = /[^\\]*$/.exec(pdfName)[0];

        // fs.writeFileSync(`./archivosPrueba/pdfObject-${fileName.replace(" ","")}.txt`, JSON.stringify(pdfObject));

        return 'pdfObject';
    } catch (error) {
        throw new Error(error);
    }

};

module.exports = {getParticipantsFromHTML, convertPDFToObject};
