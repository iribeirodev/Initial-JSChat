let Peer = require('simple-peer')
let socket = io()
const video = document.querySelector('video')
let client = {}

// Obtendo Stream
// Solicitando permissão
navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then(stream => {
    // Obtem a transmissão e começa a exibir no video
    socket.emit('NewClient')
    video.srcObject = stream
    video.play()

    /**
     * Configurar um objeto peer
     * @param {} type 
     */
    function InitPeer(type) {
        let peer = new Peer(
            { 
                initiator: (type == 'init') ? true : false,
                stream: stream,
                trickle: false
            }
        )
        peer.on('stream', function(stream){
            CreateVideo(stream)
        })

        // Transmissão encerrada
        peer.on('close', function(){
            document.getElementById('peerVideo').remove();
            peer.destroy()
        })

        return peer
    }

    /**
     * Iniciar um peer do tipo Init
     */
    function MakePeer() {
        client.gotAnswer = false // Oferta sem Resposta
        let peer = InitPeer('init')
        peer.on('signal', function(data){
            if (!client.gotAnswer) {
                socket.emit('Offer', data) // Enviar uma oferta
            }
        })
        client.peer = peer
    }

    /**
     * Iniciar um peer do tipo NotInit
     * @param {*} offer 
     */
    function FrontAnswer(offer) {
        let peer = InitPeer('notInit')
        peer.on('signal', data => {
            // Enviar uma resposta
            socket.emit('Answer', data)
        })
        peer.signal(offer)
    }

    /**
     * Obteve uma Resposta
     * @param {} answer 
     */
    function SignalAnswer(answer) {
        client.gotAnswer = true;
        let peer = client.peer
        peer.signal(answer)
    }

    // Criar dinamicamente objeto video quando obtiver uma transmissão
    function CreateVideo(stream) {
        let video = document.createElement('video')
        video.id = 'peerVideo'
        video.srcObject = stream
        video.class = 'embed-responsive-item'
        document.querySelector('#peerDiv').appendChild(video)
        video.play()
    }

    function SessionActive() {
        document.write('Sessão Ativa. Por favor, retorne mais tarde.');
    }

    socket.on('BackOffer', FrontAnswer) // Quando a oferta retornar do backend
    socket.on('BackAnswer', SignalAnswer) // Quando a resposta retornar do backend
    socket.on('SessionActive', SessionActive)
    socket.on('CreatePeer', MakePeer)

})
.catch(err => document.write(err))