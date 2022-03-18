const SERVER_MSG_TYPE = 0;
const CLIENT_MSG_TYPE = 1;
class GameListController {
    constructor(
        gameListModel = new GameListModel(),
        chatModel = new ChatModel(),
        gameListView = new GameListView(),
        feedbackAlertView = new FeedbackAlertView(),
        statsCardsView = new StatsCardsView(),
        dialogFormView = new DialogFormView(),
        dialogChatView = new DialogChatView()
    ) {


        /* Game List manager */

        // Model and view
        this.gameListModel = gameListModel;
        this.gameListView = gameListView;

        // Models Bindings
        this.gameListModel.bindAdded((game) => {
            this.gameListView.createGame(game);
            this.updateStatsCardsValues();
        })

        this.gameListModel.bindUpdated((game) => {
            this.gameListView.updateGame(game);
            this.updateStatsCardsValues();
        })

        this.gameListModel.bindDeleted((id) => {
            this.gameListView.deleteGame(id);
            this.updateStatsCardsValues();
        })

        // Views Bindings
        this.gameListView.bindGameDeletion((id) => this.deleteGame(id));
        this.gameListView.bindCompletionChange((id) => this.updateGame(id, { id_winner: null }));
        this.gameListView.bindWinnerChange(({ id, id_player }) => this.updateGame(id, { id_winner: id_player }));


        /* Chat dialog and actions */

        // Model and View
        this.dialogChatView = dialogChatView;
        this.chatModel = chatModel;

        // Models bindings
        this.chatModel.bindUsernameChange((name) => {
            this.dialogChatView.updateUsername(name);
            this.ws.login(this.chatModel.getUsername());
        });
        this.chatModel.bindMsgAdded((data) => this.dialogChatView.addNewMsg(data))

        // Views bindings
        this.dialogChatView.bindUsernameChanged((name) => this.chatModel.setUsername(name))
        this.dialogChatView.bindMsgSent(this.sendChatMsg.bind(this));


        /* Feedback action alert */
        // View
        this.feedbackAlertView = feedbackAlertView;

        /* Stats Cards */
        // View
        this.statsCardsView = statsCardsView;

        /* New game dialog */
        // View
        this.dialogFormView = dialogFormView;

        // Views Bindings
        this.dialogFormView.bindGameCreation(({ player1, player2, description }) => this.createGame({ player1, player2, description }));

        /* Websocket */
        this.ws = new WsClient();

        // Listeners
        this.ws.onGameDeleted(this.onDeletedGame.bind(this));
        this.ws.onGameCreated(this.onNewGame.bind(this));
        this.ws.onGameUpdated(this.onUpdatedGame.bind(this));
        this.ws.onChatMsgReceived((data) => this.onNewMsg(data, CLIENT_MSG_TYPE));
        this.ws.onServerMsgReceived((data) => this.onNewMsg(data, SERVER_MSG_TYPE));

        // Initialise data
        this.init();
    }

    async init() {
        // login to global chat service
        this.chatModel.setUsername(basicRandomUsernameGen());

        // fetch game list and update view
        let games = await this.fetchGameList();
        games.forEach((g) => this.gameListModel.addGame(g));
    }

    /**
     * Update card type counters depending on models data
     */
    updateStatsCardsValues() {
        let [inProgressCount, finishedCount] = [
            this.gameListModel.getInProgressGamesCount(),
            this.gameListModel.getFinishedGamesCount()
        ];
        this.statsCardsView.updateInProgressGames(inProgressCount);
        this.statsCardsView.updateFinishedGames(finishedCount);
    }

    /* WS callbacks triggering model changes*/
    onNewGame(game) { this.gameListModel.addGame(game) }
    onDeletedGame(id) { this.gameListModel.deleteGame(id) }
    onUpdatedGame({ id, data }) { this.gameListModel.updateGame(id, data) }
    onNewMsg(data, type) {
        let { user, message, timestamp } = JSON.parse(data);
        this.chatModel.addMessage({ user, message, timestamp, server: (SERVER_MSG_TYPE === type) });
    }

    /* API Calls functions */
    fetchGameList() {
        return fetch('/api/games', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then((resp) => {
                if (!resp.ok) throw resp.statusText;
                return resp.json();
            })
            .catch((e) => this.feedbackAlertView.displayFeedback(ERROR, e))
    }

    createGame(data) {
        return fetch('/api/games', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((resp) => {
                if (!resp.ok) throw resp.statusText;
                this.feedbackAlertView.displayFeedback(SUCCESS, "La partie a bien été créée !")
                return resp.json();
            })
            .then(() => { })
            .catch((e) => this.feedbackAlertView.displayFeedback(ERROR, e))
    }

    deleteGame(gameId) {
        return fetch(`api/games/${gameId}`, {
            method: 'DELETE',
        })
            .then((resp) => {
                if (!resp.ok) throw resp.statusText;
                this.feedbackAlertView.displayFeedback(SUCCESS, "La partie a bien été supprimée !");
                return;
            })
            .then(() => { })
            .catch((e) => this.feedbackAlertView.displayFeedback(ERROR, e))
    }

    updateGame(gameId, data) {
        return fetch(`api/games/${gameId}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then((resp) => {
                if (!resp.ok) throw resp.statusText;
                this.feedbackAlertView.displayFeedback(SUCCESS, "Les données de la partie ont bien été mises à jour !");
                return resp.json();
            })
            .then(() => { })
            .catch((e) => this.feedbackAlertView.displayFeedback(ERROR, e))
    }

    /* Websocket interface functions */
    sendChatMsg(message) {
        let msg = { message, timestamp: Date.now() };
        this.ws.sendChatMessage(msg);
    }
}

