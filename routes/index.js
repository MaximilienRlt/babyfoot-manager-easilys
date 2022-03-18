const express = require('express');
let gameController = require('../Games/Game.controller');
const { body, param } = require('express-validator');

// Input validation result middleware
let { inputValidation } = require('../middlewares');

let router = express.Router();

//API routes declarations

router.get('/games', gameController.getGames);
router.post('/games',
    // Input validation
    /*
    body : {
            {string} player1 : Player 1 name
            {string} player2 : Player 2 name
            {string} description : Game description 
        }
    */
    [
        body('player1')
            .exists().withMessage('player1 attribute must be provided.').bail()
            .notEmpty().withMessage('Player 1 username must not be empty.').bail()
            .isString().withMessage('Player 1 username must be a string.')
            .trim(),
        body('player2')
            .exists().withMessage('player2 attribute must be provided.').bail()
            .notEmpty().withMessage('Player 2 username must not be empty.').bail()
            .isString().withMessage('Player 2 username must be a string.')
            .trim(),
        body('description').exists().withMessage('description attribute must be provided').bail(),
        body('description').isString().optional({ nullable: true, checkFalsy: true })//.trim()
    ], inputValidation, gameController.createGame);

// verif id dans db
router.delete('/games/:id', [
    /**
    * params: { {number} id : Game identifier }
    */
    param('id').isInt()
],
    inputValidation, gameController.deleteGame);

// verif id dans db
router.patch('/games/:id', [
    /*
    * body: {
        {boolean} completed: true,
        {number | null} id_winner
    }
    */
    param('id').isInt(),
    body('id_winner').exists().isInt().optional({ nullable: true })
],
    inputValidation, gameController.updateGame);

module.exports = router;