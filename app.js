const { version } = require('./package.json');

const mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);

//Construction de l'uri mongodb à partir du fichier de configuration
const { user, password, domain, port, database } = require('./config/database.json');
const auth = user && password ? `${user}:${password}@` : '';
const mongoUrl = `mongodb://${auth}${domain}:${port}/${database}`;

mongoose.connect(mongoUrl, (err) => { if (err) console.error("Echec de connexion à la BDD", err.name) });

require('./models/product')(mongoose);
require('./models/user')(mongoose);

const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const passport = require('passport');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const User = mongoose.model('User');

const productsRouter = require('./routes/products')(mongoose, passport);
const authRouter = require('./routes/auth')(mongoose, passport);
const registerRouter = require('./routes/register')(mongoose, passport, bcrypt);
const searchRouter = require('./routes/search')(mongoose, passport);

app.use(expressSession({
    secret: 'iuyfyubtuvsrtv',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());


app.set('view engine', 'pug');
app.use(express.static('public'));


let LocalStrategy = require('passport-local').Strategy;


getUserByUsername = (username, callback) => {
    let query = {username: username};
    User.findOne(query, callback);
}
  
getUserById = (id, callback) => {
    User.findById(id, callback);
}
  
comparePassword = (candidatePassword, hash, callback) => {
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
      if(err) throw err;
      callback(null, isMatch);
    });
}

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
      getUserByUsername(username, function(err, user){
        if(err) throw err;
        if(!user){
          return done(null, false, {message: 'Utilisateur inconnu'});
        }
        comparePassword(password, user.password, function(err, isMatch){
          if(err) throw err;
           if(isMatch){
             return done(null, user);
           } else {
             return done(null, false, {message: 'Mot de passe invalide'});
           }
       });
     });
    }
  ));


app.get('/', (req, res) => {
    res.send(req.user);
});

app.get('/signout', (req, res) =>{
    req.logout();
    res.redirect('/products');
})

//Construction des routes

app.use('/products', productsRouter);

app.use('/test', productsRouter);

app.use('/products/:product_id', productsRouter);

app.use('/products/test', productsRouter);

app.use('/products/:product_id/add_component', productsRouter);

app.use('/products/:product_id/historic', productsRouter);

app.use('/auth', authRouter);

app.use('/register', registerRouter);

app.use('/recherche', searchRouter);

app.listen(3000, () => console.log('--'));