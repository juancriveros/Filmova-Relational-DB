const express = require('express');
const https = require('https');
const http = require('http');
const bcrypt = require('bcrypt');
const Router = express.Router();

const post = require('../../middlewares/postgres');
const User = require('../../models/user');
const CheckSession = require('../../middlewares/session');

Router.get('/', (req, res) => {

    console.log(process.env.APITOKEN)
    res.render('./user/login', {
        login: false
    });

})

Router.get('/signup', (req, res) => {
    res.render('./user/signup', {
        login: false
    });
})

Router.get('/home', CheckSession, (req, res) => {

    const options = {
        hostname: process.env.APIHOST,
        port: process.env.APIPORT,
        path: process.env.APINOSQLPATH + '/best/seen/?apikey=' + process.env.APIKEY,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + process.env.APITOKEN
        }
    }

    const optionsSql = {
        hostname: process.env.APIHOST,
        port: process.env.APIPORT,
        path: process.env.APISQLPATH + '/recommendations?apikey=' + process.env.APIKEY,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + process.env.APITOKEN
        }
    }

    console.log(optionsSql)
    var moviesSql = {}
    var request = http.request(optionsSql, function (response) {
        var chunks = [];

        response.on("data", function (chunk) {
            chunks.push(chunk);
        });

        response.on("end", function (chunk) {
            moviesSql = JSON.parse(Buffer.concat(chunks).toString())
            var requestNoSql = http.request(options, function (responseNoSql) {
                var chunks = [];

                responseNoSql.on("data", function (chunk) {
                    chunks.push(chunk);
                });

                responseNoSql.on("end", function (chunk) {
                    moviesSql.bests = JSON.parse(Buffer.concat(chunks).toString())

                    console.log(moviesSql)
                    res.render('./movie/home', {
                        movies: moviesSql,
                        login: true
                    });
                });

                responseNoSql.on("error", function (error) {
                    console.error(error);
                });
            });

            requestNoSql.end();

        });

        response.on("error", function (error) {
            console.error(error);
        });
    });

    request.end();

})

Router.get('/detail/:id', CheckSession, (req, res) => {

    const options = {
        hostname: process.env.APIHOST,
        port: process.env.APIPORT,
        path: process.env.APINOSQLPATH + '/' + + req.params.id.toString() + '?apikey=' + process.env.APIKEY,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + process.env.APITOKEN
        }
    }

    var request = http.request(options, function (response) {
        var chunks = [];

        response.on("data", function (chunk) {
            chunks.push(chunk);
        });

        response.on("end", function (chunk) {
            const r = JSON.parse(chunks)

            res.render('./movie/detail', {
                movie: JSON.parse(chunks),
                login: true
            });
        });

        response.on("error", function (error) {
            console.error(error);
        });
    });

    request.end();
    /*http.get('http://localhost:3010/api/movie/' + req.params.id.toString(), (response) => {
        let todo = '';

        // called when a data chunk is received.
        response.on('data', (chunk) => {
            todo += chunk;
        });

        // called when the complete response is received.
        response.on('end', () => {
            const r = JSON.parse(todo)

            res.render('./movie/detail', {
                movie: JSON.parse(todo),
                login: true
            });
        });

    }).on("error", (error) => {
        console.log("Error: " + error.message);
    });*/
})

Router.post('/signup', (req, res) => {

    const data = JSON.stringify({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 10),
        role: 1,
        contact_user: {
            name: req.body.name,
            birthdate: req.body.birthdate,
            gender: req.body.inlineRadioOptions,
            email: req.body.email,
            address_contact: {
                street: req.body.street,
                country: req.body.country,
                city: req.body.city,
                area: req.body.area,
                number: req.body.number
            }
        }
    });

    const options = {
        hostname: process.env.APIHOST,
        port: process.env.APIPORT,
        path: process.env.APISQLPATH + '/signup?apikey=' + process.env.APIKEY,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': 'Bearer ' + process.env.APITOKEN
        }
    }


    const request = http.request(options, (result) => {
        console.log(`statusCode: ${result.statusCode}`)

        result.on('data', (d) => {
            res.redirect('/filmova');
        })
    })

    request.on('error', (error) => {
        console.error(error)
    })

    request.write(data)
    request.end()
})

Router.post('/login', (req, res) => {

    const data = JSON.stringify({
        username: req.body.username
    });

    const options = {
        hostname: process.env.APIHOST,
        port: process.env.APIPORT,
        path: process.env.APISQLPATH + '/login?apikey=' + process.env.APIKEY,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': 'Bearer ' + process.env.APITOKEN
        }
    }

    console.log(options)
    const request = http.request(options, (result) => {
        console.log(`statusCode: ${result.statusCode}`)

        result.on('data', (d) => {
            const results = JSON.parse(d)
            if (results.length > 0) {
                console.log(results[0])
                if (bcrypt.compareSync(req.body.password, results[0].PASSWORD)) {
                    req.session.userid = results[0].ID
                    req.session.logged = true
                    res.redirect('/filmova/home');
                } else {
                    res.redirect('/filmova');
                }
            }
            else
                res.redirect('/filmova');
        })
    })

    request.on('error', (error) => {
        console.error(error)
    })

    request.write(data)
    request.end()
})

Router.post('/home', (req, res, next) => {

    const data = JSON.stringify({
        movieid: req.body.movieId,
        userid: req.session.userid
    });

    const options = {
        hostname: process.env.APIHOST,
        port: process.env.APIPORT,
        path: process.env.APISQLPATH + '/seenmovie?apikey=' + process.env.APIKEY,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': 'Bearer ' + process.env.APITOKEN
        }
    }

    const request = http.request(options, (result) => {
        console.log(`statusCode: ${result.statusCode}`)

        result.on('data', (d) => {
            res.sendStatus(200);
        })
    })

    request.on('error', (error) => {
        console.error(error)
    })

    request.write(data)
    request.end()
})

Router.post('/detail', CheckSession, (req, res) => {

    const data = JSON.stringify({
        movieId: req.body.movieId,
        commentDate: new Date(),
        title: req.body.title,
        comment: req.body.comment,
        rating: req.body.userRating,
        userId: req.session.userid//TODO: req.body.userId 
    });

    let externalMovieId = req.body.externalId

    const options = {
        hostname: process.env.APIHOST,
        port: process.env.APIPORT,
        path: process.env.APINOSQLPATH + '/rating/?apikey=' + process.env.APIKEY,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': 'Bearer ' + process.env.APITOKEN
        }
    }

    const request = http.request(options, (result) => {
        console.log(`statusCode: ${result.statusCode}`)

        result.on('data', (d) => {
            res.redirect('/filmova/detail/' + externalMovieId);
        })
    })

    request.on('error', (error) => {
        console.error(error)
    })

    request.write(data)
    request.end()

});

Router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return console.log(err)
    })
    res.render('./user/login', {
        login: false
    });
})


module.exports = Router;