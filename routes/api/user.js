const express = require('express');
const Router = express.Router();

const post = require('../../middlewares/postgres');

Router.get('/user', (req, res) => {

    res.status(200).send('user');

})

Router.get('/recommendations', (req, res) => {

    const query = `
    select * from public."MOVIES" order by "DATE_ADDED" desc limit 10;
    `;
    
    const queryLastSeen = `
    select * from public."SEENMOVIE"
    JOIN public."MOVIES" ON "ID" = "MOVIE_ID"
    order by "DATE" desc limit 10;
    `;

    const queryMostSeen = `
    select COUNT("MOVIE_ID") AS NUMBER_SEEN, "MOVIE_ID", "TITLE" from public."SEENMOVIE" 
        JOIN public."MOVIES" ON "ID" = "MOVIE_ID"
    GROUP BY "MOVIE_ID", "TITLE" ORDER BY NUMBER_SEEN desc limit 10
    `;

    const moviesResult = {}

    post.query(query, (err, resdb) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        }

        moviesResult.newMovies = resdb.rows
        post.query(queryLastSeen, (err, resdb) => {
            if (err) {
                console.error(err);
                res.status(500).json(err);
            }

            moviesResult.lastSeen = resdb.rows
            post.query(queryMostSeen, (err, resdb) => {
                if (err) {
                    console.error(err);
                    res.status(500).json(err);
                }

                moviesResult.mostSeen = resdb.rows
                res.status(200).json(moviesResult);
            });
        });
    });

})

Router.get('/movies/:id', (req, res) => {

    const query = `
        SELECT "ID", "TITLE", "DATE_ADDED"
        FROM public."MOVIES"
        WHERE "ID" = `+ req.params.id.toString() + ";";

    post.query(query, (err, resdb) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        }

        res.status(200).json(resdb.rows);
    });

})

Router.post('/signup', (req, res) => {

    console.log(req.body)

    const query = `
    CALL public."InsertUser"( '`+
        req.body.username + "','" +
        req.body.password + "'," +
        1 + ",'" +
        req.body.contact_user.name + "','" +
        req.body.contact_user.birthdate + "','" +
        req.body.contact_user.gender + "','" +
        req.body.contact_user.email + "','" +
        req.body.contact_user.address_contact.street + "','" +
        req.body.contact_user.address_contact.country + "','" +
        req.body.contact_user.address_contact.city + "','" +
        req.body.contact_user.address_contact.area + "','" +
        req.body.contact_user.address_contact.number + "')"

    console.log(query)

    post.query(query, (err, resdb) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        }

        console.log(resdb)
        res.status(200).json(resdb);
    });

})

Router.post('/seenmovie', (req, res) => {
    console.log(req.body)

    const query = `
    CALL public."movieseen"( `+
        req.body.userid + "," +
        req.body.movieid + ");"

    console.log(query)

    post.query(query, (err, resdb) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        }

        console.log(resdb)
        res.status(200).json(resdb);
    });


})

Router.post('/login', (req, res) => {

    const query = `
        SELECT "ID", "PASSWORD"
        FROM public."USER"
        WHERE "USERNAME" = '`+ req.body.username + `';`

        console.log(query)
    post.query(query, (err, resdb) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        }

        console.log("DATABASE")
        console.log(resdb.rows)
        res.status(200).json(resdb.rows);
    });

})

module.exports = Router;