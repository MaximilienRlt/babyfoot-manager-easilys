const { validationResult } = require('express-validator');

/* App-level middlewares */

module.exports = {
    // Validation result evaluation 
    inputValidation: (req, res, next) => {
        let validationReport = validationResult(req);
        if (validationReport.errors.length > 0) {
            let errors = validationReport.errors.map(({ msg }) => msg);
            let error = new Error("Invalid input values : " + errors.join(', '));
            error.type = 'invalid-input';
            next(error);
        } else {
            next();
        }
    }
}