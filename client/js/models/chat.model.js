class ChatModel {
    constructor(_username = null) {
        this.username = null;
        this.messages = [];
    }

    // Setters
    setUsername(username) {
        this.username = username;
        this.onUsernameChange(username);
    }

    addMessage(msg) {
        this.messages.push(msg);
        this.onMsgAdded(msg);
    }

    // Getters
    getUsername() {
        return this.username;
    }

    // Controller binders
    bindUsernameChange(handler) {
        this.onUsernameChange = handler;
    }

    bindMsgAdded(handler) { this.onMsgAdded = handler }

}