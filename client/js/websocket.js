class WsClient {
    constructor() {
        this.client = io();
    }

    // Websocket Listeners
    onGameDeleted = (handler) => this.client.on('deleted', handler);
    onGameCreated = (handler) => this.client.on('created', handler);
    onGameUpdated = (handler) => this.client.on('updated', handler);
    onChatMsgReceived = (handler) => this.client.on('chat-msg', handler);
    onServerMsgReceived = (handler) => this.client.on('server-msg', handler);

    // Actions
    sendChatMessage(data) { this.client.emit('chat-msg', JSON.stringify(data)) }
    login(username) { this.client.emit('client-login', username) }

}