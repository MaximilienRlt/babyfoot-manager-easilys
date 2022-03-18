class DialogFormView {
    constructor(){
        this.$dialog = document.getElementById("newGameDialog");
        this.$displayBtn = document.getElementById("openNewGameDialogBtn");

        // register dialogs (cross browser hack)
        dialogPolyfill.registerDialog(this.$dialog);

        this.$newGameForm = document.getElementById('newGameForm');
        
        this.$displayBtn.addEventListener("click", () => this.$dialog.showModal());
        
        Array.from(this.$dialog.getElementsByClassName('close-dialog-btn')).forEach((elt) => elt.addEventListener("click", () => {
            this.$dialog.close();
        }));

    }

    bindGameCreation(handler) {
        this.$newGameForm.addEventListener('submit', async () => {
            let player1 = document.getElementById("new-game-player1").value;
            let player2 = document.getElementById("new-game-player2").value;
            let description = document.getElementById("new-game-description").value;

            let data = {
                player1,
                player2,
                description
            };

            await handler(data);

            this.$newGameForm.reset();
        })
    }
}