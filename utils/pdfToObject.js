const fs = require("fs");
const path = require("path");

const getParticipantsFromHTML = (body) => {

    const parteDemandadaIndex = body.indexOf('Parte Demandada');
    const centroDeJusticiaIndex = body.lastIndexOf('Centro de justicia</');
    let personalSection = body.substring(parteDemandadaIndex + 22, centroDeJusticiaIndex);

    // Removing br tags
    personalSection = personalSection.replace(/(<br role="presentation">)/gi, "\n");

    // Removing empty span tags
    while (personalSection.includes('> </span>')) {

        let emptySpanSection = personalSection.substring(0, personalSection.indexOf('> </span>') + 9);
        personalSection = personalSection.slice(0, emptySpanSection.lastIndexOf('<span')) + personalSection.slice(emptySpanSection.length, personalSection.length);
    }

//     Ordening personal
    personalSection = personalSection.trim();
    let personalArray = personalSection.split("</span>");
    let personal = [];

    for (let i = 0; i < personalArray.length - 1; i++) {

        let miembroPersonal = personalArray[i].substring(personalArray[i].indexOf('>') + 1, personalArray[i].length);

        while ((parseFloat(personalArray[i + 1].substring(personalArray[i + 1].indexOf('left:') + 6, personalArray[i + 1].indexOf('px'))) -
            parseFloat(personalArray[i].substring(personalArray[i].indexOf('left:') + 6, personalArray[i].indexOf('px')))
            < 130)) {

            let siguienteElemento = personalArray[i + 1].substring(personalArray[i + 1].indexOf('>') + 1, personalArray[i + 1].length);
            miembroPersonal = miembroPersonal + " " + siguienteElemento;
            i++;

            if (i === personalArray.length - 1) {
                break;
            }
        }
        personal.push(miembroPersonal.trim());
    }

    return personal;
};

const convertPDFToObject = async (pdfName) => {

    try {
        console.log(`Tranformando archivo: ${pdfName} `.cyan);

        const body = fs.readFileSync(path.resolve(__dirname, "../archivosPrueba", "text-1.html")).toString();
        const personal = getParticipantsFromHTML(body);
        const x = body.replace(/(<([^>]+)>)/gi, "\n");
        const pdfElements = x.split("\n");

        const filteredElements = pdfElements.filter((element) => {
            return element !== "" && element !== " ";
        });

        const titulo = filteredElements[0];
        const centroDeJusticia = filteredElements[2].replace(":", "").trim();
        const sala = filteredElements[4].replace(":", "").trim();
        const agendada = filteredElements[6].replace(":", "").trim();
        const numeroExpediente = filteredElements[10];
        const folio = filteredElements[11];
        const juez = personal[0];
        const secretario = personal[1];
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

        return pdfObject;
    } catch (error) {
        throw new Error(error);
    }

};

module.exports = {getParticipantsFromHTML, convertPDFToObject};
