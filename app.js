const path = require('path');

let express = require('express');

// Router-level middlewares declaration
const helmet = require('helmet');
const cors = require('cors');
var bodyParser = require('body-parser');
const WsClient = require('./ws');
const PORT = 8080;

var app = express();

var http = require('http').Server(app);
var ws = new WsClient(http);

// Router-level middlewares registration
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));

// include websocket object in response object
app.use((req, res, next) => {
    res.ws = ws;
    next();
})

// serving static folder 'client'
app.use(express.static(path.join(__dirname, '/client')));

// serving app page
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});

//  API routes registration
app.use('/api', require('./routes'));


/* Router-level middlewares */
// Error handling middleware
app.use(function (err, req, res, next) {
    // log error(s)
    console.error(err);

    // send response with correct status depending on error type
    let msg = err?.message ?? 'Unknown error occurred';
    switch (err?.type) {
        // Input validation error type
        case 'invalid-input':
            res.status(400).send(msg);
            break;
        default:
            res.status(err?.statusCode ?? 500).send(msg);
    }
});

http.listen(PORT, function () {
    console.log('Listening on port ' + PORT);
});
