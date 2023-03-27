let DATOS={};

const { createBot, 
        createProvider,
        createFlow,
        addKeyword,
        EVENTS,
        CoreClass } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const axios = require('axios')
//const { v4: uuidv4 } = require('uuid');
const ChatGPTClass = require('./chatgpt.class')
const mysql = require('mysql2/promise');

const MYSQL_DB_HOST = 'localhost';
const MYSQL_DB_USER = 'root';
const MYSQL_DB_PASSWORD = '';
const MYSQL_DB_NAME = 'chatbot';
const MYSQL_DB_PORT = '3306';

const flowSecundario = addKeyword(['Finalizar esta opción 🔚🤓'])
.addAnswer('👍 Muchas gracias por utilizar el chat Bot del programa de *Ingeniería de sistemas* de la *Universidad Mariana*. 👍')
.addAnswer('Elige una opción:', {capture:true, buttons:[{body: 'Cronogramas 📑'},{body: 'Menú 🔙😃'},{body: 'Finalizar BotIS 👋😉'}]}, async (ctx,{fallBack,endFlow}) =>{

    if(ctx.body !== 'Menú 🔙😃' && ctx.body !== 'Finalizar BotIS 👋😉'){
        return fallBack()
    }

    if(ctx.body === 'Finalizar BotIS 👋😉'){
        return endFlow({body:'Chat Bot finalizado, nos vemos luego. 👋🤓'});
    }

})

//const mysql = require('mysql');
const db = mysql.createConnection({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    password: MYSQL_DB_PASSWORD,
    database: MYSQL_DB_NAME,
    port: MYSQL_DB_PORT
});

const flowPregunta = addKeyword(['Preguntas sobre el proceso investigativo 🤔❓', 'Realizar otra pregunta🤔📜'])
.addAnswer('La respuesta puede demorar según la complejidad de tú pregunta. 🕗')
.addAnswer('Realiza tu pregunta sobre el proceso investigativo. 🤖❓',{capture:true}, async (ctx, {flowDynamic}) => {
    let message = ctx.body;
    DATOS[ctx.from] = {...DATOS[ctx.from], MSGPregunta:ctx.body}
    DATOS[ctx.from] = {...DATOS[ctx.from], Movil:ctx.from}
    console.log('=====>>', DATOS[ctx.from])
    try {
        const result = await ChatGPTClass.runCompletion(message);

        const connection = await pool.getConnection();
      const [rows, fields] = await connection.execute(
        'INSERT INTO preguntasgpt (telefono, pregunta, respuesta) VALUES (?, ?, ?)',
        [DATOS[ctx.from].Movil, DATOS[ctx.from].MSGPregunta, result]
      );

        return flowDynamic('*La respuesta a tu pregunta es:*\n'+result);
    } catch (error) {
        console.log(error);
        return flowDynamic('⚠ Lo siento, ocurrió un error al procesar tu pregunta. Por favor, inténtalo de nuevo más tarde.');
    }
})
.addAnswer('Selecciona una opción:', {capture:true, buttons:
    [{body: 'Realizar otra pregunta🤔📜'},
    {body: 'Menú 🔙😃'},
    {body: 'Finalizar esta opción 🔚🤓'}]})
    
    async function obtenerGrado() {
      // Conecta a la base de datos MySQL
      const connection = await mysql.createConnection({
        host: MYSQL_DB_HOST,
        user: MYSQL_DB_USER,
        password: MYSQL_DB_PASSWORD,
        database: MYSQL_DB_NAME,
        port: MYSQL_DB_PORT,
      });

      try {
        // Ejecuta una consulta SQL para obtener los datos de la tabla 'tesisProgramadas'
        const [rows, fields] = await connection.execute('SELECT * FROM fechagrado');
        return rows;
      } catch (error) {
        console.error(error);
      } finally {
        // Cierra la conexión a la base de datos MySQL
        connection.close();
      }
    }

    const flowFechaGrado=addKeyword(['Fechas para grados 📆🎓'])
    .addAnswer('Estas son las fechas de grados:')
    .addAction(async (ctx, {flowDynamic}) => {
        const data = await obtenerGrado();
        if (!data.length) {
          // Si no se encontraron fechas, envía un mensaje informativo
          return flowDynamic('En este momento no hay fechas de grados registradas.');
        }
        let message = '';
        for (let i = 0; i < data.length; i++) {
          const {Fecha, Lugar, Nota} = data[i];
          message += `*Fecha:* ${Fecha} \n*Lugar:* ${Lugar} \n*Último día para socializar:* ${Nota} \n\n`;
        }
        return flowDynamic(message);
  })
  .addAnswer('Si deseas consultar los requisitos para graduarte presiona en cronogramas, de lo contrario escoge una de las otras opciones:',{capture:true, buttons:[{body:'Cronogramas 📑'},{body: 'Menú 🔙😃'}, 
  {body: 'Finalizar esta opción 🔚🤓'}]})

async function obtenerFila() {
  // Conecta a la base de datos MySQL
  const connection = await mysql.createConnection({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    password: MYSQL_DB_PASSWORD,
    database: MYSQL_DB_NAME,
    port: MYSQL_DB_PORT,
  });

  try {
    // Ejecuta una consulta SQL para obtener los datos de la tabla 'tesisProgramadas'
    const [rows, fields] = await connection.execute('SELECT * FROM fechaprogtesis');
    return rows;
  } catch (error) {
    console.error(error);
  } finally {
    // Cierra la conexión a la base de datos MySQL
    connection.close();
  }
}


    const flowFechaProgramadasTesis=addKeyword(['Fechas de sustentación programadas 📆📑'])
    .addAnswer('Estas son las fechas programadas:')
    .addAction(async (ctx, {flowDynamic}) => {
        const data = await obtenerFila();
        if (!data.length) {
          // Si no se encontraron fechas, envía un mensaje informativo
          return flowDynamic('En este momento no hay fechas de sustentaciones programadas.');
        }
        let message = '';
        for (let i = 0; i < data.length; i++) {
          const {Fecha, Hora, Nombre, Fase, Lugar, Jurados, Expositores, Asesor} = data[i];
          message += `*Fecha:* ${Fecha} \n*Hora:* ${Hora} \n*Proyecto:* ${Nombre} \n*Fase:* ${Fase} \n*Lugar:* ${Lugar} \n*Jurados:* ${Jurados} \n*Expositores:* ${Expositores} \n*Asesor/a:* ${Asesor} \n\n`;
        }
        return flowDynamic(message);
  })
    .addAnswer('Si deseas consultar los requisitos para sustentar presiona en cronogramas, de lo contrario escoge una de las otras opciones:',{capture:true, buttons:[{body:'Cronogramas 📑'},{body: 'Menú 🔙😃'}, 
    {body: 'Finalizar esta opción 🔚🤓'}]})


const flowFechas = addKeyword(['Consultar las fechas de tesis o grados 🧑‍🎓📜'])
.addAnswer('Aquí podrá consultar las fechas de grados o de tesis programadas para sustentar.', null, async (ctx, { provider }) => {

  const id = ctx.key.remoteJid

  const sections = [
      {
          title: "Selecciona una opción y presiona enviar",
          rows: [
              { title: "Fechas para grados 📆🎓", rowId : "Fechas para grados 📆🎓"},
              { title: "Fechas de sustentación programadas 📆📑", rowId: "Fechas de sustentación programadas 📆📑" },              
              { title: "Menú princial 🔙😃", rowId: "Menu"},
              { title: "Finalizar esta opción 🔚🤓", rowId: "Finalizar esta opción 🔚🤓"},
          ]
      }
  ]

  const listMessage = {
      text: "Por favor selecciona un opción",
      buttonText: "Menú de fechas 📆",
      sections
  }
  const sendMsg = await provider.getInstance()
  await sendMsg.sendMessage(id, listMessage)
  //console.log('->', sendMsg)
  return
})
/**.addAnswer('Que deseas consultar:', {capture:true, buttons:[
{body: 'Fechas de sustentacion programadas 📆📑'},
{body: 'Fechas para grados 📆🎓'},
{body: 'Menú 🔙😃'},
{body: 'Finalizar esta opcion 🔚🤓'}]})*/

const pool = mysql.createPool({
  host: MYSQL_DB_HOST,
  user: MYSQL_DB_USER,
  password: MYSQL_DB_PASSWORD,
  database: MYSQL_DB_NAME,
  port: MYSQL_DB_PORT
});

const flowPqrs = addKeyword(['Observaciones para el Chat Bot 🧐🤖'])
  .addAnswer('🙌 Deja tu observación o sugerencia para el *Chat Bot*.')
  .addAnswer('¿Cuál es tu mensaje?', {capture:true}, async (ctx) => {
    DATOS[ctx.from] = {...DATOS[ctx.from], MSGFelicitaciones:ctx.body}
    DATOS[ctx.from] = {...DATOS[ctx.from], Movil:ctx.from}
    console.log('=====>>', DATOS[ctx.from])
  })
  .addAnswer('Procesando...', null, async (ctx, {flowDynamic}) => { 
    try {
      const connection = await pool.getConnection();
      const [rows, fields] = await connection.execute(
        'INSERT INTO sugerencias (Telefono, Sugerencia) VALUES (?, ?)',
        [DATOS[ctx.from].Movil, DATOS[ctx.from].MSGFelicitaciones]
      );
      connection.release();
      console.log(rows);
      return flowDynamic('✅ Mensaje Guardado con éxito ✅');
    } catch (error) {
      console.log(error);
      return flowDynamic('❌ Ha ocurrido un error. Por Favor, intentalo más tarde. ❌');
    }
  })
  .addAnswer('Elige una opción:',{capture:true, buttons:[{body: 'Menú 🔙😃'}, 
    {body: 'Finalizar esta opción 🔚🤓'}]})

const flowMenu = addKeyword(['Volver al menú principal 🔙😃','❌ Cancelar ❌','Menu','Menu BotIS 😃','Menú 🚀','Menú 🔙😃'])
.addAnswer('🙌 Menú principal', null, async (ctx, { provider }) => {

  const id = ctx.key.remoteJid

  const sections = [
      {
          title: "Selecciona una opción y presiona enviar",
          rows: [
              { title: "Preguntas sobre el proceso investigativo 🤔❓", rowId: "Preguntas sobre el proceso investigativo 🤔❓" },
              { title: "Consultar las fechas de tesis o grados 🧑‍🎓📜", rowId : "Consultar las fechas de tesis o grados 🧑‍🎓📜"},
              { title: "Observaciones para el Chat Bot 🧐🤖", rowId: "Observaciones para el Chat Bot 🧐🤖"},
              { title: "Finalizar esta opción 🔚🤓", rowId: "Finalizar esta opción 🔚🤓"},
          ]
      }
  ]

  const listMessage = {
      text: "Por favor selecciona un opción.",
      buttonText: "Menú *BotIS*",
      sections
  }

  const sendMsg = await provider.getInstance()
  await sendMsg.sendMessage(id, listMessage)
  //console.log('->', sendMsg)
  return
})
    /**.addAnswer('🙌 Menú principal')
    .addAnswer('Selecciona la opción de tu interés:', 
    {capture:true, buttons:[{body: 'Preguntas sobre el proceso investigativo 🤔❓'}, 
    {body: 'Consultar las fechas de tesis o grados 🧑‍🎓📜'},
    {body: 'Observaciones para el Chat Bot 🧐🤖'},
    {body: 'Finalizar esta opcion 🔚🤓'}]})*/



// Configura los parámetros de conexión a la base de datos MySQL


async function cronogramaB() {
  // Conecta a la base de datos MySQL
  const connection = await mysql.createConnection({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    password: MYSQL_DB_PASSWORD,
    database: MYSQL_DB_NAME,
    port: MYSQL_DB_PORT,
  });

  try {
    // Ejecuta una consulta SQL para obtener los datos de la tabla 'tesisProgramadas'
    const [rows, fields] = await connection.execute('SELECT * FROM cronogramab');
    return rows;
  } catch (error) {
    console.error(error);
  } finally {
    // Cierra la conexión a la base de datos MySQL
    connection.close();
  }
}

    const flowSemestreB = addKeyword('Semestre B')
    .addAnswer('Este es el cronograma del Semestre B:')
    .addAction(async (ctx, {flowDynamic}) => {
        const data = await cronogramaB();
        let message = '';
        for (let i = 0; i < data.length; i++) {
          const {Fecha, Actividad, Requisitos} = data[i];
          message += `*Fecha Límite:* ${Fecha}\n*Actividad:* ${Actividad}\n*Requisitos:* ${Requisitos}\n\n`;
        }
        return flowDynamic(message);
  })
    .addAnswer('Elige una opción:',{capture:true, buttons:[{body:'Cronogramas 📑'},{body: 'Menú BotIS 😃'}, 
    {body: 'Finalizar esta opción 🔚🤓'}]})




async function cronogramaA() {
  // Conecta a la base de datos MySQL
  const connection = await mysql.createConnection({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    password: MYSQL_DB_PASSWORD,
    database: MYSQL_DB_NAME,
    port: MYSQL_DB_PORT,
  });

  try {
    // Ejecuta una consulta SQL para obtener los datos de la tabla 'tesisProgramadas'
    const [rows, fields] = await connection.execute('SELECT * FROM cronogramaA');
    return rows;
  } catch (error) {
    console.error(error);
  } finally {
    // Cierra la conexión a la base de datos MySQL
    connection.close();
  }
}

    const flowSemestreA = addKeyword('Semestre A')
    .addAnswer('Este es el cronograma del Semestre A:')
    .addAction(async (ctx, {flowDynamic}) => {
        const data = await cronogramaA();
        let message = '';
        for (let i = 0; i < data.length; i++) {
          const {Fecha, Actividad, Requisito} = data[i];
          message += `*Fecha Límite:* ${Fecha}\n*Actividad:* ${Actividad}\n*Requisitos:* ${Requisito}\n\n`;
        }
        return flowDynamic(message);
  })
    .addAnswer('Elige una opción:',{capture:true, buttons:[{body:'Cronogramas 📑'},{body: 'Menú BotIS 😃'}, 
    {body: 'Finalizar esta opción 🔚🤓'}]})


    const flowInfo = addKeyword(['Info 🧐', 'Cronograma', 'Cronogramas','Volver a cronogramas 📑','Cronogramas 📑'])
    .addAnswer('¿Qué semestre deseas consultar?', 
    {capture:true, buttons:[{body: 'Semestre A'}, 
    {body: 'Semestre B'}]})

    

    const flowSi = addKeyword(['Si'])
    .addAnswer(['*_INFORMACION DE BotIS_* 🤖\n\n','Botis es un chatbot en WhatsApp que ayuda a responder preguntas sobre el proceso investigativo en *Ingeniería de Sistemas* de la *Universidad Mariana*.',
    ' Puede responder preguntas comunes, complejas, recibir información, ofrecer detalles sobre fechas de grados y sustentaciones de tesis.',
    ' Botis es fácil de usar, siempre puede volver al menú principal o finalizar la sesión.'])
    .addAnswer(['*🔹* Inicialmente, se presentan dos opciones en el bot: *Info* para ver los cronogramas de los semestres A y B del año actual, o *Menú* para ver las diferentes funciones disponibles.\n\n',
                '*🔹* En el menú de Botis, hay una opción llamada "Preguntas sobre el proceso investigativo". Si la seleccionas, podrás ingresar tu pregunta y recibir una respuesta generada por inteligencia artificial.\n\n',
                '*🔹* En el menú también podrás consultar las fechas de grado y las sustentaciones de tesis programadas.\n\n',
                '*🔹* Finalmente, encontrarás la opción de dejar una sugerencia para *BotIS*.\n\n',
                '*🔹* En todas las opciones podrás volver al menú principal o finalizar la opción seleccionada.\n\n',
                '*🔹* Al finalizar la opción podrás terminar la conversación con *BotIS*.'],{delay:8000})
    .addAnswer('¿A donde quieres ir? 👇👇', {capture:true, buttons:[
    {body: 'Info 🧐'}, 
    {body: 'Menú 🚀'}]})

    const flowNo = addKeyword(['No'])
    .addAnswer(['*_DESCRIPCIÓN_*\n',
                '*Info* : Podrás consultar el cronograma investigativo y requisitos para sustentar.\n',
                '*Menú* : Podrás hacer preguntas sobre el proceso investigativo, consultar fechas o dejar sugerencias para *BotIS*.'])
    .addAnswer()
    .addAnswer('Selecciona la opción de tu interés:', {capture:true, buttons:[
    {body: 'Info 🧐'}, 
    {body: 'Menú 🚀'}]})
    
    const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAnswer('🙌 Hola, bienvenido al Chat Bot del proceso investigativo de *Ingeniería de Sistemas* de la *Universidad Mariana*')
    .addAnswer('Mi nombre es *BotIS*')
    .addAnswer('¿Cuál es tu correo institucional?',{capture:true},(ctx, {fallBack})=>
    {        
        if(!ctx.body.includes('@umariana.edu.co'))
        
            return fallBack()
        
        console.log('Mensaje entrante', ctx.body)
    })
    .addAnswer('¿Deseas conocer como funciona *BotIS*?', {capture:true, buttons:[
    {body: 'Si'}, 
    {body: 'No'}]})


const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal, flowMenu, flowSecundario,flowPregunta,flowPqrs,
    flowFechas,flowFechaProgramadasTesis,flowFechaGrado,flowInfo,flowSemestreA,flowSemestreB,flowNo,flowSi])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()