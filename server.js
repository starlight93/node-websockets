'use strict';

const express = require('express');
const { Server } = require('ws');

const PORT = process.env.PORT || 3000;
var wss
const server = express()
  .use((req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    const path = req.url.split("?")[0]
    if(path==='/' || !req.query['msg']){
      res.end(JSON.stringify({
        message:"Hi, Thanks for using my personal service",
        how_to_use:req.headers.host+"/yourPrivateChannel?msg=yourTextMessage",
        clientWebsocket:`const wss =  new WebSocket("wss://${req.headers.host}/yourPrivateChannel")`
      }))
      return
    }
    wss.clients.forEach(function each(client) {
      try{
        if (path===client._socket.path) {
          client.send(req.query['msg']);
        }
      }catch(e){
        console.log("err",e)
      }
    })
    res.end(`message was sent to ${req.url} successfully`);
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

wss = new Server({ server });

wss.on('connection', (ws, request) => {
  ws.send(`you are connected on ${request.url}!`)
  ws.on('message', function incoming(message) {
    wss.clients.forEach(function each(client) {
      try{
        if (ws._socket.path===client._socket.path && client !== ws) {
          client.send(message);
        }
      }catch(e){
        console.log("err",e)
      }
    })
  })
});

server.on('upgrade', function upgrade(request, socket, head) {
  socket.path = request.url
})