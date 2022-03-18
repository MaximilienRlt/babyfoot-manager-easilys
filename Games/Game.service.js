const dbClient = require('../db');

module.exports = {
    /**
     * Find all games
     * 
     * @returns {Array<Game>} : Array of Games including associated Players
     */
    getGameList: async () => {
        let games = await dbClient.getAllGames();
        return games.map(_formatGameData);
    },
    /**
     * Create a new game
     * 
     * @param {string} description : Game description
     * @param {string} player1 : Name of 1st player
     * @param {string} player2 : Name of 2nd player
     * @returns {Game} : New game
     */
    createNewGame: (description, player1, player2) => {
        return dbClient.insertGame(description, player1, player2);
    },

    /**
     * 
     * @param {number} id : Identifier of game to delete 
     */
    deleteGame: (id) => dbClient.deleteGame(id),

    updateGame: async (id, id_winner) => {
        let updatedGame = await dbClient.updateGame(id, id_winner);
        return _formatGameData(updatedGame);
    }
}
function _formatGameData({
    id_p1,
    id_winner,
    id_p2,
    name_p1,
    name_p2,
    ...gameData
}) {
    return ({
        ...gameData,
        completed: id_winner !== null,
        player1: {
            id_player: id_p1,
            name: name_p1,
            ...(id_winner === id_p1 && { winner: true })
        },
        player2: {
            id_player: id_p2,
            name: name_p2,
            ...(id_winner === id_p2 && { winner: true })
        }
    });
}