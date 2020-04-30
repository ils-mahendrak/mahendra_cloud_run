const {validationResult} = require('express-validator');

function validate (req, res, next){
    let error= validationResult(req);
    if(!error.isEmpty()) res.status(401).json(error);
    else next();
}
module.exports = validate;

