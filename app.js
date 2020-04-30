const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const md5 = require('md5');
const randomstring = require("randomstring");
var app = express();
const expressSwagger = require('express-swagger-generator')(app);
const {validationResult} = require('express-validator');
let constants = require('./src/config/config');
let sql_con = require('./src/config/sql_db');
const { encode,decode } = require('./src/helper/utility').utility_obj;

let options = {
    swaggerDefinition: {
        info: {
            description: 'This is a sample server',
            title: 'Swagger',
            version: '1.0.0',
        },
        host:constants.baseURL,
        basePath: '/',
        produces: [
            "application/json",
            "application/xml"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./src/routes/**/*.js', './src/controllers/**/*.js'] //Path to the API handle folder
};
expressSwagger(options)

// Add headers
app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});




var admin_routes = require('./src/routes/admin_routes')
var restaurant_routes = require('./src/routes/restaurant_routes')
var vendor_routes = require('./src/routes/vendor_routes')

// view engine setup
app.set('views', path.join(__dirname, './src/views'));
app.set('view engine', 'pug');
app.set('validationResult', validationResult);
app.set('sql_con', sql_con);
app.set('md5', md5);
app.set('randomstring', randomstring);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));


app.use(async (req,res, next)=>{
    await encode(req);
    global.origin = req.headers.origin;
    next();
});
app.use(async (req, res, next) => {  //adding validator middleware
    await decode(req);
    next();
});
//app.get('/',(req,res)=>{res.send('hello')})
app.use('/admin', admin_routes);
app.use('/vendor', vendor_routes);
app.use('/restaurant', restaurant_routes)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(4000,()=>console.log('listening to port'))
module.exports = app;