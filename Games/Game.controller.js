const gameService = require('./Game.service');

module.exports = {
    /**
     * Find all stored Games
     * 
     * @param {HTTPRequest} req : Request Object 
     * @param {HTTPResponse} res : Response Object 
     * @param {function} next : Function calling next middleware (error handler)
     */
    getGames: async (req, res, next) => {
        try {
            let data = await gameService.getGameList();
            res.status(200).json(data);
        } catch (e) {
            next(e);
        }
    },

    /**
     * Create a new Game
     * 
     * @param {HTTPRequest} req : Request Object 
     * @param {HTTPResponse} res : Response Object 
     * @param {function} next : Function calling next middleware (error handler)
    */
    createGame: async (req, res, next) => {
        try {
            let { player1, player2, description } = req.body;
            let newGame = await gameService.createNewGame(description, player1, player2);
            res.status(200).json(newGame);
            res.ws.emitCreatedGame(newGame);
        } catch (e) {
            next(e);
        }
    },

    /**
     * Delete an existing Game by its identifier
     * 
     * @param {HTTPRequest} req : Request Object 
     * @param {HTTPResponse} res : Response Object 
     * @param {function} next : Function calling next middleware (error handler)
    */
    deleteGame: async (req, res, next) => {
        try {
            let { id } = req.params;
            await gameService.deleteGame(id);
            res.status(204).json({});
            res.ws.emitDeletedGame(id);
        } catch (e) {
            next(e);
        }
    },
    /**
     * Update an existing Game by its identifier
     * 
     * @param {HTTPRequest} req : Request Object 
     * @param {HTTPResponse} res : Response Object 
     * @param {function} next : Function calling next middleware (error handler)
    */
    updateGame: async (req, res, next) => {
        try {
            let { id } = req.params;
            let { id_winner } = req.body;
            let updatedGame = await gameService.updateGame(id, id_winner);
            res.status(200).json(updatedGame);
            res.ws.emitUpdatedGame(id, updatedGame);
        } catch (e) {
            next(e);
        }
    },

}