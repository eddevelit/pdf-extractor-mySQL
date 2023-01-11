// const fs = require("fs");

const getParticipantsFromHTML = (body) => {

    const parteDemandadaIndex = body.indexOf('Parte Demandada');
    const centroDeJusticiaIndex = body.lastIndexOf('Centro de justicia</');
    let personalSection = body.substring(parteDemandadaIndex + 22, centroDeJusticiaIndex);
    // console.log(personalSection.bgCyan);

    // Removing br tags
    personalSection = personalSection.replace(/(<br role="presentation">)/gi, "\n");
    // console.log(`Removing br tags`.blue);
    // console.log(personalSection.bgCyan);

    // console.log(`emptySpan?: ${personalSection.includes('> </span>')}`.yellow);

    // Removing empty span tags
    while (personalSection.includes('> </span>')) {

        let emptySpanSection = personalSection.substring(0, personalSection.indexOf('> </span>') + 9);
        // fs.writeFileSync(`emptySection.txt`, emptySpanSection);
        console.log(`emptySpanSection`.blue);
        console.log(emptySpanSection.bgGreen);

        personalSection = personalSection.slice(0, emptySpanSection.lastIndexOf('<span')) + personalSection.slice(emptySpanSection.length, personalSection.length);
        console.log(`personalSection`.blue);
        console.log(personalSection.bgBlue);
    }

//     Ordening personal
    personalSection = personalSection.trim();

    // fs.writeFileSync(`personalSection.txt`, personalSection);

    let personalArray = personalSection.split("</span>");
    // personalArray.pop();
    // console.table(personalArray);

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

        console.log(`personal: ${personal}`.bgGreen);

    }
};

const convertPDFToObject = (pdfElementsArray) => {
    const titulo = pdfElementsArray[0];
    const centroDeJusticia = pdfElementsArray[2].replace(":", "").trim();
    const sala = pdfElementsArray[4].replace(":", "").trim();
    const agendada = pdfElementsArray[6].replace(":", "").trim();
    const numeroExpediente = pdfElementsArray[10];
    const folio = pdfElementsArray[11];
    const juez = pdfElementsArray[17];
    const secretario = pdfElementsArray[18];
    const testigo = pdfElementsArray[19];
    const parteActora = pdfElementsArray[20];
    const parteDemandada = pdfElementsArray[21];
    const centroJusticia = pdfElementsArray[26];
    const tipoAudicencia = pdfElementsArray[28];
    const tipoJuicio = pdfElementsArray[29];
    const fechaCelebracion = pdfElementsArray[33];
    const horaInicio = pdfElementsArray[34];
    const horaAFinalizar = pdfElementsArray[35];

    // Getting participants
    const participantes = [];
    const participanteInicial = pdfElementsArray.indexOf(
        "Lista de participantes"
    );
    const tokenIndex = pdfElementsArray.indexOf("Token de acceso");
    for (let i = participanteInicial + 1; i < tokenIndex; i++) {
        participante = {
            nombre: "",
            rol: "",
        };
        if (pdfElementsArray[i] === "Rol") {
            participante.nombre = pdfElementsArray[i + 1];
            participante.rol = pdfElementsArray[i + 2];
            participantes.push(participante);
        }
    }

    const tokenAcceso = pdfElementsArray[tokenIndex + 1];
    const tokenInvitado = pdfElementsArray[tokenIndex + 3];

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
            testigo: testigo,
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

    console.log(`PDF Object: ${JSON.stringify(pdfObject)}`);

    return pdfObject;
};

module.exports = {getParticipantsFromHTML, convertPDFToObject};
