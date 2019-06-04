const { Router } = require('express');


//Affichage et création des produits
module.exports = (mongoose, passport) => {
    const Product = mongoose.model('Product');

    const productsRouter = Router();
    
    productsRouter
    //Affichage de tous les produits
    .get('/', (req, res) => {
        //Recuperer tous les produits correspondants au modele Product dans la base de données
        Product.find() 
            //Renvoie la page products
            .then(products => res.render('products', { title: 'Produits', user: req.user, products: products }))
            .catch(console.error);

    })
    //Ajout d'un produit
    .post('/', (req, res) => {
        let name = req.body.pname;
        let description = req.body.pdescription;
        
        let product = new Product();

        product.name = name;
        product.description = description;

        //Sauvegarde du nouveau produit dans la bdd
        product.save(err => {
            if(err){
                res.send(err);
            }
            //Renvoie sur la page du produit ajouté
            Product.find() 
            .then(res.redirect(`./products/${name}`))
            .catch(console.error);
        })
    })
    //Page de création de produit
    .get('/add_product', (req, res) => {
        if(req.user){
            res.render('add_product', { title: 'Ajouter produit', user: req.user});
        }

    })
    //Affichage du produit de nom 'product_id'
    .get('/:product_id', (req, res) => {
        let product_id = req.params.product_id

        //Recherche du produit
        Product.find({ name: product_id })
            //Renvoie la page de produit correspondant au produit 'product_id'  
            .then(product => {res.render('product', { title: 'Page produit', user: req.user,  product: product})})
            .catch(console.error);

    })
    //Affichage de l'historique des modifications du produit de nom 'product_id'
    .get('/:product_id/historic', (req, res) => {
        //Si l'utilisateur est connecté
        if(req.user){
            let product_id = req.params.product_id;

            //Recherche du produit
            Product.find({ name: product_id }) 
                //Renvoie la page d'historiqe correspondant au produit
                .then(product => res.render('histo_product', { title: 'Historique', dir:"../", user: req.user,  product: product}))
                .catch(console.error);
        }
        else{
            res.send("interdit");
        }

    })
    //Page de création de composant pour le produit 'product_id'
    .get('/:product_id/add_component', (req, res) => {
        //Si l'utilisateur est connecté
        if(req.user){
            let product_id = req.params.product_id

            Product.find({ name: product_id }) 
                .then(product => res.render('add_component', { title: 'Ajouter composant', dir:"../", user: req.user,  product_id: product_id}))
                .catch(console.error);
        }
        else{
            res.send("interdit");
        }

    })
    //Création de composant pour le produit 'product_id'
    .post('/:product_id/add_component', (req, res) => {
        //Si l'utilisateur est connecté
        if(req.user){
            let product_id = req.params.product_id
            let name = req.body.cname;
            let value = req.body.cval;

            //Recherche du produit auquel on souhaite aujouter un composant 
            Product.find({name: product_id})
                //Ajout des champs du composant 
                .then(products => {
                    products[0].composition.push({
                        ename: name,
                        modifications: []
                    });
                    products[0].composition[products[0].composition.length-1].modifications.push({
                        mvalue: value, mdate: Date()
                    });
                    products[0].save();
                    //res.redirect(`/:${product_id}`);
                
                })
                //Redirection vers la page du produit
                .then(res.redirect(`/products/${product_id}`));
        }
        else{
            res.send("interdit");
        }


    })
    //Suppresion d'un composant
    .get('/:product_id/:component_id/remove', (req, res) => {
        //Si l'utilisateur est connecté
        if(req.user){
            let product_id = req.params.product_id;
            let component_id = req.params.component_id;

            Product.find({ name: product_id }) 
                .then(product => {
                    //On garde le composant dans la bdd, mais on le marque comme supprimé (pour l'historique)
                    product[0].composition[component_id].isDeleted = true;
                    product[0].save();
                    //Redirection vers la page du produit dont le composant a été supprimé
                    res.redirect(`/products/${product_id}`);
                })
                .catch(console.error);
        }
        else{
            res.send("interdit");
        }

    })
    //Page d'édition du composant component_id du produit product_id
    .get('/:product_id/:component_id', (req, res) => {
        //Si l'utilisateur est connecté
        if(req.user){
            let product_id = req.params.product_id;
            let component_id = req.params.component_id;
            let mvalue, ename;

            //Recherche du produit
            Product.find({ name: product_id }) 
                .then(product => {
                    let length = product[0].composition[component_id].modifications.length;

                    //Récuperer les valeurs actuelles du composant
                    ename = product[0].composition[component_id].ename;
                    mvalue = product[0].composition[component_id].modifications[length-1].mvalue;

                    //Renvoie la page edit_component
                    res.render('edit_component', { title: 'Editer composant', dir:"../", user: req.user,  product_id: product_id, component_id: component_id, ename: ename, mvalue: mvalue})
                })
                .catch(console.error);
        }
        else{
            res.send("interdit");
        }


    })
    //Edition d'un composant
    .post('/:product_id/:component_id', (req, res) => {
        //Si l'utilisateur est connecté
        if(req.user){
            let product_id = req.params.product_id;
            let component_id = req.params.component_id;
            let mvalue = req.body.mvalue;
            let date = Date();

            //Recherche du produit
            Product.find({ name: product_id }) 
                .then(product => {
                    //Ajout de la modification
                    product[0].composition[component_id].modifications.push({
                        mvalue: mvalue,
                        mdate: date
                    });

                    product[0].save();

                    //Redirection vers la page du produit dont l'un des composants a été modifié
                    res.redirect(`/products/${product_id}`);
                })
                .catch(console.error);
        }
        else{
            res.send("interdit");
        }

    })
    .get('/:product_id/:component_id/:modification_id/del_component', (req, res) => {
        //Si l'utilisateur est connecté et administrateur
        if(req.user.isAdmin){
            let product_id = req.params.product_id;
            let component_id = req.params.component_id;
            let modification_id = req.params.modification_id;

            Product.find({name: product_id}) 
                .then(product => {
                    let len = product[0].composition[component_id].modifications.length;

                    for(let i=len-1; product[0].composition[component_id].modifications[i]._id != modification_id; i--){
                        product[0].composition[component_id].modifications.pop();
                    }

                    product[0].composition[component_id].modifications.pop();

                    product[0].save();
                
                })
                .then(res.redirect(`/products/${product_id}/historic`));
        }
        else{
            res.send("interdit");
        }

    });
    

    return productsRouter;
}

