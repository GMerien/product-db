const { Router } = require('express');
module.exports = (mongoose, passport) => {
    const Product = mongoose.model('Product');

    const searchRouter = Router();
    
    searchRouter
    //Page de recherche basique d'un produit par son nom
    .post('/', (req, res) => {
        let searched = req.body.search;
        //Recherche des produits contenant le terme recherché dans leur nom
        Product.find({$or: [{name : {$regex: searched, $options: 'i'}}, {composition: { $elemMatch: { ename : searched } }}]})
            //Renvoie de la page résultante de la recherche
            .then(products => res.render('recherche', { title: 'Recherche', user: req.user , searched: searched, products: products}))
            .catch(console.error);

    })

    return searchRouter;
}

