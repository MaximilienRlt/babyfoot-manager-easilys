const BROADCAST=0, SENDER_ONLY=1, ALL=2;

// Websocket & handlers declaration
class WsClient {
    constructor(http){
        this.client = require('socket.io')(http);
        this.client.on('connect', (socket) => {
            
            // saved logged in user name
            let loggedUser = null;
            
            socket.on('client-login', (username) => {
                
                // set current username
                let prevUsername = loggedUser;
                loggedUser = username.trim();

                // if first chat login
                if (prevUsername === null) {
                    // notify other clients
                    this.emitServerMsg({ message: `Nouvel utilisateur connecté : ${loggedUser}.` }, socket, BROADCAST);
                    // send connexion confirmation to client
                    socket.emit('server-msg', JSON.stringify({ message: `Connecté en tant que ${loggedUser}.` }))
                }
                // notify all of username change
                else this.emitServerMsg({ message: `${prevUsername} a changé son pseudo en ${loggedUser}.`}, socket, ALL);
            });

            // broadcast chat message to all clients
            socket.on('chat-msg', (data) => {
                if(loggedUser) this.emitNewChatMsg(JSON.parse(data), loggedUser);
            });

            // notify a client disconnection to others
            socket.on('disconnect', () => {
                if(loggedUser !== null) this.emitServerMsg({ message: `Utilisateur ${loggedUser} déconnecté.` }, socket, BROADCAST);
            });
        });

    }

    emitServerMsg(data, socket, type=BROADCAST){
        switch(type){
            case BROADCAST:
                socket.broadcast.emit('server-msg', JSON.stringify(data))
                break;
            case SENDER_ONLY:
                socket.emit('server-msg', JSON.stringify(data));
            case ALL:
                this.client.sockets.emit('server-msg', JSON.stringify(data));
            default:
                break;
        }
    }

    emitNewChatMsg(data, user){
        this.client.sockets.emit('chat-msg', JSON.stringify({ ...data, user }))        
    }


    // API action propagation
    emitDeletedGame(id){
        this.client.sockets.emit('deleted', id)
    }

    emitCreatedGame(game){
        this.client.sockets.emit('created', game)
    }
    
    emitUpdatedGame(id, data){
        this.client.sockets.emit('updated', { id, data });
    }
}

module.exports = WsClient;