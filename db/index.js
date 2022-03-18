const { Client } = require('pg')
/**
 * Database interface called in services
 */
class DbClient {

    constructor() {
        this.client = new Client({
            host: process.env.DB_HOST,
            user: "postgres",
            password: "NULL"
        });
        this.client.connect();
    }

    /**
     * Find all stored games and include associated players
     * @returns {Array<Game>}
     */
    async getAllGames() {
        let { rows } = await this.client.query(`
        SELECT id,
               description,
               id_winner,
               p1.id_player AS id_p1,
               p2.id_player AS id_p2,
               p1.name AS name_p1,
               p2.name AS name_p2,
               created_at
        FROM Games AS g JOIN Players AS p1 ON g.player1 = p1.id_player
                        JOIN Players p2 ON g.player2 = p2.id_player
        ORDER BY created_at;
        `);
        return rows;
    }

    /**
    * Create a game
    *
    * @param {string} description : Game description
    * @param {number} player1 : Identifier of 1st player
    * @param {number} player2 : Identifier of 2nd player
    * @returns {Game} : created Game
    */
    async insertGame(description, player1, player2) {
        try {
            await this.client.query('BEGIN');

            let [res1, res2] = await Promise.all([
                this.createPlayer(player1),
                this.createPlayer(player2)
            ]);

            let p1Data = res1.rows[0];
            let p2Data = res2.rows[0];

            let res = await this.client.query(`INSERT INTO Games (description, player1, player2) VALUES ('${description}', '${p1Data.id_player}', '${p2Data.id_player}') RETURNING *`);
            await this.client.query('COMMIT');

            return { ...res.rows[0], player1: p1Data, player2: p2Data };
        } catch (e) {
            await this.client.query('ROLLBACK');
            throw e;
        }
    }

    /**
     * Create a player
     * 
     * @param {string} name : Player name
     * @private
     * @returns {Player} : Created player
     */
    createPlayer(name) {
        return this.client.query(`INSERT INTO Players (name) VALUES ('${name}') RETURNING *`);
    }

    /**
     * Delete a game
     * 
     * @param {number} id : Game identifier
     */
    async deleteGame(id) {
        await this.client.query(`DELETE FROM Games WHERE id=${id}`);
    }


    /**
     * Update game winner
     * 
     * @param {number} id : Game identifier to set as "completed" 
     * @param {number | null} id_winner : Player winner identifier 
     * @returns {Game} : Updated game
     */
    async updateGame(id, id_winner) {
        try {
            await this.client.query(`BEGIN`);
            await this.client.query(`UPDATE Games SET id_winner=${id_winner} WHERE id=${id}`);
            let { rows } = await this._getGame(id);
            await this.client.query(`COMMIT`);
            return rows[0];
        } catch (e) {
            await this.client.query(`ROLLBACK`);
            throw e;
        }
    }
    /**
     * Retrieve full data of a Game including players details
     * 
     * @param {number} id : Game identifier to retrieve 
     * @returns {Game} : Game object
     */
    _getGame(id) {
        return this.client.query(`
        SELECT id,
               description,
               id_winner,
               p1.id_player AS id_p1,
               p2.id_player AS id_p2,
               p1.name AS name_p1,
               p2.name AS name_p2,
               created_at
        FROM Games AS g JOIN Players AS p1 ON g.player1 = p1.id_player
                        JOIN Players p2 ON g.player2 = p2.id_player
        WHERE id=${id}
        `)
    }
    /**
     * Close database connection
     */
    close() {
        this.client.close();
    }
}

module.exports = new DbClient();
