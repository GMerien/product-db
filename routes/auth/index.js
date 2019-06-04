const { Router } = require('express');

module.exports = (mongoose, passport) => {
    const authRouter = Router();
    
    authRouter
    //Page de connexion
    .get('/', (req, res) => {
        res.render('auth', {title: "Connexion"});
    })
    //Connexion
    .post('/', passport.authenticate('local', {
        //Si la connexion est réussi, redirection vers la page des produits
        successRedirect: '../products',
        //Sinon, redirection vers la page de connexion
        failureRedirect: '/'
    }))
    

    return authRouter;
}
