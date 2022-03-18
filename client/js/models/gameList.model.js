class GameListModel {
    constructor(_games = []) {
        this.games = _games;
    }

    // Setters
    addGame(game) {
        this.games.unshift(game);
        this.onAddedGame(game);
    }
    updateGame(id, game) {
        let idx = this.games.findIndex((g) => parseInt(id) === parseInt(g.id));
        this.games[idx] = game;
        this.onUpdatedGame(game);
    }
    deleteGame(id) {
        let idx = this.games.findIndex((game) => parseInt(game.id) === parseInt(id));
        if (idx > -1) {
            this.games.splice(idx, 1);
            this.onDeletedGame(id);
        }
    }

    // Getters
    getInProgressGamesCount() {
        return this.games.filter((g) => !g.completed).length;
    }

    getFinishedGamesCount() {
        return this.games.filter((g) => g.completed).length;
    }

    // Controller binders
    bindAdded(handler) {
        this.onAddedGame = handler;
    }
    bindUpdated(handler) {
        this.onUpdatedGame = handler;
    }
    bindDeleted(handler) {
        this.onDeletedGame = handler;
    }

}