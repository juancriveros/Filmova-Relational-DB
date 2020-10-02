require('dotenv').config();
const path = require('path')
const http = require('http');

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const session = require('express-session');

const userRouterApi = require('./routes/api/user')
const userRouter = require('./routes/web/user')

const app = express();

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main'
}));
app.set('view engine', '.hbs');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}))

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(__dirname + '/node_modules/jquery/dist'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(__dirname + '/node_modules/bootstrap-datepicker/dist'));
app.use(express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));
app.use(express.static(__dirname + '/node_modules/bootstrap-star-rating'));

app.use('/api/user', userRouterApi)
app.use('/filmova', userRouter)



app.use((req, res, next) => {
    const error = new Error('Not Found !');
    error.status = 400;
    next(error);
})

app.listen(process.env.PORT, function () {
    console.log("Express started: Port " + process.env.PORT);

    var qs = require('querystring');

    const options = {
        hostname: process.env.APIHOST,
        port: process.env.APIPORT,
        path: process.env.APITOKENPATH,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }

    console.log(options)
    var request = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function (chunk) {
            console.log(Buffer.concat(chunks))
            var body = JSON.parse(Buffer.concat(chunks).toString());
            process.env.APITOKEN = body.access_token;
            
        });

        res.on("error", function (error) {
            console.error(error);
        });
    });

    const data = qs.stringify({
        'client_id': process.env.APICLIENTID,
        'grant_type': process.env.APIGRANTTYPE,
        'username': process.env.APIUSER,
        'password': process.env.APIPASSWORD
    });

    request.write(data)
    request.end()
})
