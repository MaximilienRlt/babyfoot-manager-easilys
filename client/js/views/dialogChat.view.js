/**
 * View managing chat dialog components
 */
const ENTER_KEY_CARRIAGE_RETURN = 13;

class DialogChatView {
    previousUsername=null;
    unseenMsgCounter=0;
    
    constructor() {

        /* Chat dialog components references */

        this.$dialog = document.getElementById("chatDialog");
        // register dialogs (cross browser hack)
        dialogPolyfill.registerDialog(this.$dialog);

        this.$msgList = document.querySelector('#chat > ul');
        
        this.$displayBtn = document.getElementById("openChatDialogBtn");
        this.$unseenMsgCounterBadge = document.querySelector('#openChatDialogBtn > .badge');
        this.$usernameInput = document.getElementById('usernameInput');
        
        this.$msgInput = document.querySelector('#chatForm > input[type=text]');
        this.$msgSubmitBtn = document.querySelector('#chatForm > button');

        /* Event listeners registration */

        // Open modal on activator click
        this.$displayBtn.addEventListener("click", () => {
            this.$unseenMsgCounterBadge.style.display = 'none';
            this.$dialog.showModal();
        });

        // Close modal on click
        Array.from(this.$dialog.getElementsByClassName('close-dialog-btn')).forEach((elt) => elt.addEventListener("click", () => {
            this.$dialog.close();
            this._resetChatInput();
        }));
    }
    
    /* Controller binders */
    
    // Username value change binder
    bindUsernameChanged(handler) {
        // Locally save previous username value on focus
        this.$usernameInput.addEventListener('focus', async (e) => {
            this.previousUsername = this.$usernameInput.value;
        })
    
        // Update current username on input blur
        this.$usernameInput.addEventListener('blur', async (e) => {
            let currentValue = this.$usernameInput.value.trim();
            if (this.previousUsername !== currentValue) {
                if (currentValue !== null && currentValue !== undefined && currentValue !== ''){
                    handler(currentValue);
                    this.previousUsername = currentValue;
                } else {
                    this.$usernameInput.value = this.previousUsername;
                }
            }
        });
    }
    
    // New Message submission binder
    bindMsgSent(handler){
        // on submit button click
        this.$msgSubmitBtn.addEventListener('click', (e) => {
            this._onMsgSent(e, handler);
            this._resetChatInput();
        })
        // on "Enter" key click
        this.$msgInput.addEventListener('keyup', (e) => {
            if (e.keyCode === ENTER_KEY_CARRIAGE_RETURN) {
                this._onMsgSent(e, handler);
                this._resetChatInput();
            }
        })
    }

    /* Setters */

    /**
     * Set new username to display
     * 
     * @param {string} name : New username 
     */
    updateUsername(name) {
        if (this.$usernameInput.value !== name) this.$usernameInput.value = name;
    }

    /**
     * Create new message from received data and append it to chat list
     * 
     * @param {Message} : Message object to add in chat list
     *  
     */
    addNewMsg({ user, message, timestamp, server }){

        // display notification badge on new message
        if (!this.$dialog.open && !server) this._displayNotifBadge();
        
        // create message item
        let messageItem = (server ? this._createNewServerMessage(message)
                                  : this._createNewClientMessage({ user, message, timestamp})); 

        this.$msgList.appendChild(messageItem);
        this.$msgList.parentNode.scrollTo(0, this.$msgList.scrollHeight);
    }
    
    _createNewServerMessage(message){
        let item = document.createElement('li');
        item.classList.add('server-msg');

        let msgElt = document.createElement('div');
        msgElt.classList.add("content-msg-card");
        msgElt.textContent = message;

        item.appendChild(msgElt);

        return item;

    }
    _createNewClientMessage({ user, message, timestamp }){
        let item = document.createElement('li');
        let headerElt = document.createElement('div');
        headerElt.className = "header-msg-card";

        item.classList.add('client-msg');

        let timestampElt = document.createElement('span');
        timestampElt.className = "timestamp-msg";
        timestampElt.textContent = `${new Date(timestamp).toLocaleTimeString("fr-FR")}`;


        let userElt = document.createElement('span');
        userElt.className = "user-msg";
        userElt.textContent = user;

        headerElt.appendChild(userElt);
        headerElt.appendChild(timestampElt);

        let msgElt = document.createElement('div');
        msgElt.classList.add("content-msg-card");

        msgElt.textContent = message;

        item.appendChild(headerElt);
        item.appendChild(msgElt);
        
        return item;
    }
    _displayNotifBadge(){
        if (
            !this.$unseenMsgCounterBadge.style.display ||
            this.$unseenMsgCounterBadge.style.display === 'none'
        ) this.$unseenMsgCounterBadge.style.display = "initial";
    }

    // Reset chat input value
    _resetChatInput(){
        this.$msgInput.value = '';
    }

    // Check if chat input is empty
    _isEmptyInputValue($elt){
        return ($elt.value !== null
            && $elt.value !== undefined
            && $elt.value !== '');
    }

    /**
     * Trim and check if input value is empty 
     * 
     * @param {MouseEvent} event : click event
     * @param {function} cb : callback
     */
    _onMsgSent(event, cb) {
        let currentInputValue = this.$msgInput.value.trim();
        if (this._isEmptyInputValue(this.$msgInput)) cb(currentInputValue);
    }
}