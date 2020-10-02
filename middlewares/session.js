
const sessionChecker = (req, res, next) => {
console.log(req.session.userid)
    if (!req.session.logged) {
        res.redirect('/filmova');
    } else {
        next();
    }    
};

module.exports = sessionChecker;