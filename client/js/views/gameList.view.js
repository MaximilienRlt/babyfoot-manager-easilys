const tropheeImgPath = "../assets/trophee.png";
const missingTropheeImgPath = "../assets/missing_trophee.png";
const TIMESTAMP_UPDATE_INTERVAL = 60000;
const LOADING = 0, READY = 1, ERROR = 2, SUCCESS = 3; INFO = 4;

class GameListView {

    timestampIntervals = [];

    constructor(){
        this.$list = document.createElement('ul');
        this.$list.className = 'game-list';
        document.getElementById('games-list-container').appendChild(this.$list);
    }

    createGame({ id, description, completed, player1, player2, created_at }) {
        // create list item (li)
        let gameItem = document.createElement('li');
        gameItem.classList.add(completed ? 'done' : 'in-progress');
        gameItem.setAttribute('data-id', id);

        // create game item content = action buttons + content (scoreboard, game description, ...)
        let gameItemContent = document.createElement('div');
        gameItemContent.className = 'card-content';
        let contentElt = document.createElement('div');

        // scoreboard creation composed of 2 players (buttons)
        let scoreboard = document.createElement('div');
        scoreboard.className = "scoreboard-card";

        let p1Button = this.createPlayerElt(player1, completed);
        let p2Button = this.createPlayerElt(player2, completed);

        let vs = document.createElement('span');

        vs.textContent = 'vs';
        vs.style['font-size'] = '1.2em';
        vs.style['font-variant'] = "small-caps";

        scoreboard.appendChild(p1Button);
        scoreboard.appendChild(vs);
        scoreboard.appendChild(p2Button);        
        contentElt.className = 'game-content';
        
        contentElt.appendChild(scoreboard);

        if (description !== null && description !== '') {
            let descElt = this.createDescriptionElt(description);
            contentElt.prepend(descElt);
        }

        let deleteButton = this.createButtonElt('x', ['delete-game-btn']);
        deleteButton.title = "Supprimer";

        if(completed){
            let restoreBtn = this.createRestoreBtn();
            gameItem.appendChild(restoreBtn);
        }
        gameItemContent.appendChild(contentElt);
        gameItemContent.appendChild(deleteButton);

        // footer showing timestamps
        let footerElement = document.createElement('div');
        footerElement.className = 'card-footer';
        footerElement.textContent = 'Créée ' + moment(new Date(created_at)).fromNow();
        
        this.createUpdateInterval({ id, created_at }, footerElement);

        gameItem.appendChild(gameItemContent);
        gameItem.appendChild(footerElement);

        this.setGameState(gameItem, { completed });

        this.$list.prepend(gameItem);
    }

    setGameState(elt, { completed }){
        let restoreElt = elt.getElementsByClassName('restore-btn')[0];

        if (completed) {
            elt.className = 'done';
            if(!restoreElt){
                restoreElt = this.createRestoreBtn();
                restoreElt.disabled = !completed;
                elt.appendChild(restoreElt);
            }
        } else {
            elt.className = 'in-progress';
            if(restoreElt) restoreElt.remove();
        }
    }
    setPlayerState(elt, { name, winner }, disabled){
        if (winner) elt.classList.add('winner');
        else elt.classList.remove('winner');
        elt.disabled = disabled;

        if (!disabled || winner) {
            let tropheeImg = elt.getElementsByClassName('trophee-icon')[0]
            if(!tropheeImg) {
                tropheeImg = new Image();
                tropheeImg.src = tropheeImgPath;
                tropheeImg.alt = "Trophée";
                tropheeImg.className = "trophee-icon";
                elt.title = "🏆 " + name;
            }

            if(!winner) tropheeImg.classList.add('grayscale');
            else tropheeImg.classList.remove('grayscale');
            
            elt.appendChild(tropheeImg);
        } 
        else {
            elt.getElementsByClassName('trophee-icon')[0].remove();
            elt.disabled = true;
        }

        if (disabled) elt.disabled = true;
    }

    updateGame({ id, completed, player1, player2 }){
        let $updatedGame = this._getGameEltById(id);
        this.setGameState($updatedGame, { completed });
        let players = Array.from($updatedGame.getElementsByClassName('player-picker-btn'));
        players.forEach((p) => {
            let playerData = (parseInt(p.dataset.id) === parseInt(player1.id_player)) ? player1 : player2;
            this.setPlayerState(p, playerData, completed);
        });
    }

    createRestoreBtn(){
        let element = document.createElement('button');
        element.className = 'restore-btn';
        element.title = "Restaurer";
        element.textContent = '↺';
        return element;
    }

    createDescriptionElt(desc){
        let descriptionElt = document.createElement('div');
        descriptionElt.classList.add("description-btn");
        let tooltipWrapperElt = document.createElement('div');

        let infoBtn = document.createElement('span');
        infoBtn.textContent = 'i';
        
        infoBtn.classList.add('tooltip-activator');
        tooltipWrapperElt.classList.add("tooltip-wrapper");
        
        let tooltipElt = this.createTooltipElt(desc);

        
        infoBtn.addEventListener('mouseover', this._onTooltipActivatorHover);
        infoBtn.addEventListener('click', this._onTooltipActivatorClick);
        infoBtn.addEventListener('mouseout', this._onTooltipActivatorOut);
        
        tooltipWrapperElt.appendChild(tooltipElt);
        descriptionElt.appendChild(infoBtn);
        descriptionElt.appendChild(tooltipWrapperElt);

        return descriptionElt;

    }

    createTooltipElt(desc){
        let tooltipElt = document.createElement('div');
        tooltipElt.className = "tooltip";
        tooltipElt.textContent = '📋 ' + desc;
        return tooltipElt;
    }


    _onTooltipActivatorClick(e){
        let tooltipElt = e.target.parentNode.getElementsByClassName('tooltip-wrapper')[0].getElementsByClassName('tooltip')[0];
        tooltipElt.style.display = (tooltipElt.style.display === 'block' ? 'none' : 'block');
        window.addEventListener('mouseup', (e) => tooltipElt.style.display = 'none')
    }

    _onTooltipActivatorHover(e){
        let tooltipElt = e.target.parentNode.getElementsByClassName('tooltip-wrapper')[0].getElementsByClassName('tooltip')[0];
        tooltipElt.style.display = 'block';
    }
    _onTooltipActivatorOut(e){
        let tooltipElt = e.target.parentNode.getElementsByClassName('tooltip-wrapper')[0].getElementsByClassName('tooltip')[0];
        tooltipElt.style.display = 'none';        
    }

    createUpdateInterval({ id, created_at }, $footer){
        this.timestampIntervals.push(
            [id,
                setInterval(() => {
                    $footer.textContent = 'Créée ' + moment(new Date(created_at)).fromNow();
                }, TIMESTAMP_UPDATE_INTERVAL)
            ]
        );
    }

    clearUpdateInterval(id){
        let idx = this.timestampIntervals.findIndex((intervalData) => intervalData[0] === id);
        if(idx > -1){
            clearInterval(this.timestampIntervals[idx][1]);
        }
    }

    deleteGame(id){
        let $deletableGame = Array.from(this.$list.children).filter((item) => parseInt(item.dataset.id) === parseInt(id))[0];
        if($deletableGame){
            $deletableGame.classList.add("deleted-item");
            this.clearUpdateInterval(id);
            Array.from($deletableGame.getElementsByTagName('button')).forEach((b) => b.disabled = true);
            setTimeout(() => $deletableGame.remove(), 300)
        }
    }

    createButtonElt(text, classList) {
        let item = document.createElement('button');
        /*let textElt = document.createElement('span');
        textElt.textContent = text;*/
        item.textContent = text;
        classList.forEach((cls) => item.classList.add(cls));
        //item.appendChild(textElt);
        return item;
    }

    createPlayerElt({ id_player, name, winner }, disabled) {
        let player = document.createElement('button');
        player.classList.add("player-picker-btn");
        player.setAttribute('data-id', id_player);

        if (winner) player.classList.add('winner');
        if (disabled) player.disabled = true;

        let playerText = document.createElement('span');
        playerText.className = 'player-picker-text';
        playerText.textContent = name;
        
        if (winner || !disabled) {
            let tropheeImg = new Image();
            tropheeImg.src = tropheeImgPath;
            tropheeImg.alt = "Trophée";
            tropheeImg.className = "trophee-icon";
            
            if(disabled)  player.disabled = true;
            else {
                tropheeImg.classList.add('grayscale');
            }
            
            player.title = "🏆 " + name;
            player.appendChild(tropheeImg);
            
        }
        

        player.appendChild(playerText);

        return player;
    }

    bindGameDeletion(handler) {
        this.$list.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.target.className === "delete-game-btn"){
                let parent = e.target.closest('li');
                const { id } = parent.dataset;
                handler(id);
            }
        });
    }

    bindCompletionChange(handler) {
        this.$list.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.target.className === "restore-btn") {
                let parent = e.target.closest('li');
                const { id } = parent.dataset;
                handler(id);
            }
        });
    }

    bindWinnerChange(handler) {
        this.$list.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (["player-picker-btn", "player-picker-text"].includes(e.target.className)) {
                let id_player = e.target.closest('button').dataset.id;
                let parent = e.target.closest('li');
                const { id } = parent.dataset;
                handler({ id, id_player });
            }
        });
    }

    _getGameEltById(id){
        return Array.from(this.$list.children).filter((item) => parseInt(item.dataset.id) === parseInt(id))[0];
    }

}