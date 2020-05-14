// Express
//-----------------------------------------------------------------------------
const express = require('express')
const app = express()
const http = require('http').Server(app)

app.use(express.static(__dirname + '/public'))

// Socket.IO
//-----------------------------------------------------------------------------
const io = require('socket.io')(http)
const port = process.env.PORT || 3000

// Main
//-----------------------------------------------------------------------------
let clients = 0

io.on('connection', function(socket){
    socket.on('NewClient', function(){

        ShowInfo('Nova Conexão');

        if (clients < 2) {
            if (clients == 1) {
                this.emit('CreatePeer')
            }

            clients++
        } else {
            this.emit('SessionActive')
            ShowInfo('Sessão já ativa')
        }
        
    })

    socket.on('Offer', SendOffer)
    socket.on('Answer', SendAnswer)
    socket.on('disconnect', Disconnect)
})

function Disconnect() {
    if (clients > 0)
        clients--

    ShowInfo('Cliente terminou a sessão');
}

function SendOffer(offer) {
    this.broadcast.emit('BackOffer', offer)
}

function SendAnswer(data) {
    this.broadcast.emit('BackAnswer', data)
}

function ShowInfo(msg){
    let now = new Date().toISOString()

    console.log('*'.repeat(70))
    if (msg) console.log(`${now} - ${msg}`)
    console.log(`${now} - clientes conectados: ${clients}`)
    console.log('*'.repeat(70))
}

http.listen(port, () => {
    console.log(`Active on ${port}`)
})
