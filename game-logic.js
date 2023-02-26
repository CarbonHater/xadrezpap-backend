/**
 * game-logic.js
 * 
 * Aqui é onde devemos registrar os event listeners e emitters (connexão com o frontend). 
 */

var io
var gameSocket

// gamesInSession armazena uma matriz de todas as conexões de "socket" ativas.
// Ou seja, todas as sessões de jogo.
var gamesInSession = []


const initializeGame = (sio, socket) => {
    /*
    * initializeGame configura todos os event listeners e emitters.
    * Quando o utilizador ativar um evento (disconnectar/connectar ou fazer um movimento no jogo)
    * é pasado como um POST HTTP e é ouvido por o socket.
    */
   
    // Inicialização das variáveis global.
    io = sio 
    gameSocket = socket 

    // Aditiona esse socket para uma matriz que armazena todos os sockets ativos.
    gamesInSession.push(gameSocket)

    // Execute o código quando o cliente se desconectar de sua sessão. 
    gameSocket.on("disconnect", onDisconnect)

    // Envia novo movimento no jogo para a outra sessão na mesma sala.
    gameSocket.on("new move", newMove)

    // O utilizador cria uma nova sala de jogo depois de ter clicado no botão "começar" no frontend
    gameSocket.on("createNewGame", createNewGame)

    // O utilizador entra numa sala de jogo depois de ir para um URL com '/game/:gameId'
    gameSocket.on("playerJoinGame", playerJoinsGame)

    gameSocket.on('request username', requestUserName)

    gameSocket.on('recieved userName', recievedUserName)
}

function playerJoinsGame(idData) {
    // Entra o socket dado a uma sessão com seu gameId (id de jogo)
    
    // Uma referência ao objeto de soquete Socket.IO do jogador
    var sock = this
    
    // Procure o ID da sala no objeto gerado por Socket.IO.
    var room = io.sockets.adapter.rooms[idData.gameId]

    // Se a sala não existe...
    if (room === undefined) {
        this.emit('status' , "Esta sessão de jogo não existe." );
        return
    }
    // Se a sala tiver 2 ou menos jogadores...
    if (room.length <= 2) {
        // Anexe o id do socket ao objeto.
        idData.mySocketId = sock.id;

        // Entra na sala
        sock.join(idData.gameId);

        // Se a sala tiver 2 jogadores...
        if (room.length === 2) {
            io.sockets.in(idData.gameId).emit('start game', idData.userName)
        }

        // Emitir um evento notificando os clientes de que o jogador entrou na sala.
        io.sockets.in(idData.gameId).emit('playerJoinedRoom', idData);

    } else {
        // Caso contrário, envie uma mensagem de erro de volta para o jogador.
        this.emit('status' , "Já há 2 pessoas a jogar nesta sala." );
    }
}

function createNewGame(gameId) {
    // Retorna o ID da sala (gameId) e o ID do socket (mySocketId) para o cliente do navegador
    this.emit('createNewGame', {gameId: gameId, mySocketId: this.id});

    // Junte-se à Sala e aguarde o outro jogador
    this.join(gameId)
}


function newMove(move) {
    /*
    * Primeiro, precisamos obter o ID da sala para enviar esta mensagem.
    * Em seguida, enviamos esta mensagem para todos, exceto o remetente nesta sala. 
    */
    
    const gameId = move.gameId 
    
    io.to(gameId).emit('opponent move', move);
}

function onDisconnect() {
    // disconecta o jogador
    var i = gamesInSession.indexOf(gameSocket);
    gamesInSession.splice(i, 1);
}


function requestUserName(gameId) {
    io.to(gameId).emit('give userName', this.id);
}

function recievedUserName(data) {
    data.socketId = this.id
    io.to(data.gameId).emit('get Opponent UserName', data);
}

exports.initializeGame = initializeGame