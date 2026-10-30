import  express  from "express";
import logger from "morgan";

import { Server } from 'socket.io';
import { createServer } from 'node:http';
import dotenv from "dotenv";
import prisma from "./db/prisma.ts";
dotenv.config();    

const app = express();

const server = createServer(app); // creando el servidor http
const io = new Server(server, {
  cors: {
    origin: "*",
  },

  connectionStateRecovery: {}
}); // con esto tenemos el servidor de socket.io y http juntos y  listo para usar

io.on('connection', async ( socket ) => {

  // socket.on('message', ( message ) => {
  //   console.log('lo que llego mensaje : ' + message);
  //   io.emit('message', message); // enviando el mensaje a todos los clientes conectados
  // });

  // recuperar mensajes deespues de una reconexion
  const history = await prisma.message.findMany({
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  socket.emit("history", history);

  // Guardando el mensaje en la base de datos
  socket.on("message", async ({text  , usuario} : { text : string , usuario : string }) => {

    if (typeof text !== "string" || text.trim() === "") return; // una pequeña validacion para que no se guarden mensajes vacios o que no sean string
    
    try {

      const saved = await prisma.message.create({ // se crea un nuevo mensaje en la base de datos usando prisma
        data: { text: text.trim() , usuario },
      });

      io.emit("message", saved ); // enviando el mensaje a todos los clientes conectados);

    } catch (error) {

      console.error("Error guardando mensaje:", error);

    }
  });
});

app.use( logger("dev") );

app.get("/", (req, res) => {
  res.send("Hello World");
});

export { app, server };