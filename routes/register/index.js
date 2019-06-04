const { Router } = require('express');

module.exports = (mongoose, passport, bcrypt) => {
    const User = mongoose.model('User');
    
    const registerRouter = Router();

    //Fonction de création d'utilisateur 
    createUser = (newUser, callback) => {
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            newUser.password = hash;
            newUser.save(callback);
          });
        });
    }

    registerRouter
    //Page d'inscription
    .get('/', (req, res) => {
        res.render('register', {title: "Inscription", user: req.user});
    })
    //Ajout d'un utilisateur
    .post('/', (req, res) => {
        let password = req.body.password;
        let password2 = req.body.password2;

        if (password == password2){
            let newUser = new User({
                name: req.body.name,
                email: req.body.email,
                username: req.body.username,
                password: req.body.password,
                isAdmin: false
            });

            //Ajout de l'utilisateur dans la bdd
            createUser(newUser, (err, user) => {
                if(err) throw err;
                //Redirection vers la page des produits
                res.redirect('../products');
            });

        }
        else{
            res.status(500).send("{erreur : \"les deux mots de passe ne correspondent pas\"}").end();
        }
    });
    

    return registerRouter;
}