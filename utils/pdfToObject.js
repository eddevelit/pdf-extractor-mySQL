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

module.exports = convertPDFToObject;
