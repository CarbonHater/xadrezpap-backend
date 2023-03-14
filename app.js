const express = require('express')
const https = require('https')
const socketio = require('socket.io')
const gameLogic = require('./game-logic')
const app = express()

// https
const port = 443

/*
* backend flow: 
* - verifique se o ID do jogo codificado no URL pertence a uma sessão de jogo válida. 
* - se sim, junte o cliente a esse jogo. 
* - caso contrário, crie uma nova instância do jogo. 
* - O caminho '/' deve levar a uma nova instância do jogo.
* - O caminho '/game/:gameid' deve primeiro procurar por uma instância do jogo, depois juntá-la. Caso contrário, lance o erro 404. 
*/

const server = https.createServer(app)
const io = socketio(server)

// obtém o gameID codificado na URL.
// verifica se esse gameID corresponde a todos os jogos atualmente em sessão.
// junte-se à sessão de jogo existente.
// cria uma nova sessão.
// executa quando o cliente se conecta


// Quando connecta no socket, vai para o ficheiro game-logic e utiliza a função initializeGame
io.on('connection', client => {gameLogic.initializeGame(io, client)})

server.listen(port)