import express from "express"
import http from "http"
import axios from "axios"
import multer from "multer"
import expressWS from "express-ws"

const app = express()
expressWS(app)
const roomMap = new Map()

const upload = multer({dest: './uploads/'})

app.use(express.static('public'));
app.use("/file", express.static('./uploads'));

app.post("/v1/upload/:id", upload.single('file'), async (req, res) => {
  console.log(req.file.filename, req.params.id)
  res.send(req.file)

  const room = roomMap.get("/v1/room/" +  req.params.id)
  if (!room) return
  room.forEach((client) => {
    client.send("http://localhost:3000/file/" + req.file.filename)
  })
})

app.ws('/v1/room/:id', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
  });
  console.log("connection")
  const room = req.url.replace("/.websocket","")
  console.log(room)
  if (!roomMap.has(room)) {
    roomMap.set(room, [ws])
  } else {
    roomMap.set(room, [ws, ...roomMap.get(room)])
  }
});

// wss.on('connection', (ws, request) => {
//   console.log("connection")
//   const room = request.url
//
//   if (!roomMap.has(room)) {
//     roomMap.set(room, [ws])
//   } else {
//     roomMap.set(room, [ws, ...roomMap.get(room)])
//   }
//   // ws.on('message', (message) => {
//   //   const room = roomMap.get(request.url)
//   //   if (!room) return
//   //   room.forEach((client) => {
//   //     client.send(message.toString())
//   //   })
//   // });
// });
//
// app.on('upgrade', function (request, socket, head) {
//   console.log("upgrade")
//   wss.handleUpgrade(request, socket, head, (ws) => {
//     wss.emit('connection', ws, request);
//   });
// });

app.listen(3000)
