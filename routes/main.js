module.exports = function(app){
    //-----------Session-------------
    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
            res.redirect('./login')
        }  
        else { next (); }
    }
    
    //-----------Validator-------------
    const { check, validationResult } = require('express-validator');
    //-----------Home-------------
    app.get('/',function(req,res){
        res.render('index.html')
    });

    //-----------Search-------------
    app.get('/search', redirectLogin, function(req,res){
        res.render("search.html");
    });
    // create text index to search multiple recipes that have
    // the same keyword in them, rather than only showing the first result
    //------Search-Results-----query-database--------
    app.get('/search-result', redirectLogin, function(req, res) {
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('recipebank');
            db.collection('recipes').createIndex( { name: "text" });
            db.collection('recipes').find({$text: {$search: req.query.keyword}}).toArray((findErr, results) => {      
                if (findErr) throw findErr
                else
                    res.render('searchdb.ejs', {searchKW: results});
                client.close();
            });
        });
    });

    //-----------Register-------------
    app.get('/register', function (req,res) {
        res.render('register.html');                                                                     
    });
    //validation on form entry
    //-----------Registered-------------
    app.post('/registered', [
        check('email').isEmail(), check('username').isLength({ min: 4 }), 
        check('password').isLength({ min: 6 }) ],
      function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./register');
        }
        else{ 
            // saving data in database
            const bcrypt = require('bcrypt');
            const saltRounds = 10;
            const firstName = req.sanitize(req.body.firstname);
            const lastName = req.sanitize(req.body.lastname);
            const userName = req.sanitize(req.body.username);
            const plainPassword = req.sanitize(req.body.password);
            var MongoClient = require('mongodb').MongoClient;
            var url = 'mongodb://localhost';
                                                                                                                                                           
            MongoClient.connect(url, function(err, client) {
                if (err) throw err;
                var db = client.db ('recipebank');
                db.collection('users').findOne( {username: userName}, function(error, user){
                    if (error) throw error;
                    if(user == null){
                        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
                            if (err) throw err;
                            // Store hashed password in your database.
                            db.collection('users').insertOne({
                                firstname: firstName,
                                lastname: lastName,
                                email: req.body.email,
                                username: userName,
                                passwordHashed: hashedPassword
	                    });
                            // A message is passed through message.ejs
                            // rather than using res.send, for a more uniform design
                            // styling and links applied to message.ejs
                            res.render('message.ejs', {message: firstName+" has successfully been registered"});
                            client.close();
                        });//end bcrypt
                    }//end if statement
                    else{
                        res.render('message.ejs', {message:"Username was already in use"});
                    }
                });//end findone()                                                                                                             
            });//end mongoClient
        }

    });//end registered
    
    //-----------Login-Page-------------
    app.get('/login', function (req,res) {
        res.render('login.html');
    });

    //-----------Logged-in-------------
    app.post('/loggedin', function(req, res) {
        const bcrypt = require('bcrypt');
        const userName = req.sanitize(req.body.username);// sanitizing form entries
        const plainPassword = req.sanitize(req.body.password); 
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('recipebank');
	    // Load hashed password from your password database. (hint: use find() similar to search-result page)
            db.collection('users').findOne( {username: userName}, function(err, user){  
                // Load hashed password from your password database. (hint: use find() similar to search-result page)
                if(err) throw err;
		if(user != null){
                    bcrypt.compare(plainPassword,  user.passwordHashed, function(err, result){
                        if (result){
                            req.session.userId = userName;
                            res.render('message.ejs', {message:"You have Successfully logged in"});
                        }
                        else{
                            res.send('1. Incorrect Username or password.'); 
                        }
                    });
                }
                else{
                    res.send('2. Incorrect Username.');
                }
            });
            client.close();      
        });
    });
    
    //-----------Logout___Page-------------
    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('./')
            }
            res.render('message.ejs', {message:"You have successfully logged out"});
        })
    }) 
    


    //---------Recipe-list----------
    app.get('/recipes', redirectLogin, function(req, res) {
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('recipebank');
            db.collection('recipes').find().toArray((findErr, results) => {                                                                                                                  
                if (findErr) throw findErr;
                else
                    res.render('list.ejs', {recipebook:results});
                client.close();                                                                                                                                      
           });
       });
    });

    //----------Add-Recipe---------------
    app.get('/addrecipe', redirectLogin, function (req, res) {
        res.render('addrecipe.html');
    });
    app.post('/recipeadded',[check('name').isLength({ min: 2 })], function (req,res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./addrecipe');
        }
        else{
            // saving data in database
            var MongoClient = require('mongodb').MongoClient;
            var url = 'mongodb://localhost';
            const recipeName = req.sanitize(req.body.name);
            const time = req.sanitize(req.body.time);
            const difficulty = req.sanitize(req.body.difficulty);
            const ingredients = req.sanitize(req.body.ingredients);
            const method = req.sanitize(req.body.method);
            const publisher = req.sanitize(req.body.publisher);
            MongoClient.connect(url, function(err, client) {
                if (err) throw err;
                var db = client.db ('recipebank');
                db.collection('recipes').findOne( {name: recipeName}, function(err, recipe){
                    if(recipe == null){// checks if recipe/recipename already exists
                        db.collection('recipes').insertOne({
                            name: recipeName,
                            time: time,
                            difficulty: difficulty,
                            ingredients: ingredients,
                            method: method,
                            publisher: publisher,
                            userAuth: req.session.userId // stores the current logged in user for later edit access
                        });
                    }
                    else{
                        res.redirect('./addrecipe');
                    }
                client.close(); 
                });
                                                                                                                                                  
                res.render('message.ejs', {message:"The " + recipeName +" recipe has successfully been added"});
            });
        }
    });
   
    //---------update----------
    app.get('/update', redirectLogin, function(req, res) {
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('recipebank');
            db.collection('recipes').find().toArray((findErr, results) => {
                if (findErr) throw findErr;
                else
                    res.render('select.ejs', {recipebook:results});// all recipes passed through
                client.close();
           });
       });
    }); 
    
    app.post('/updateRecipe', redirectLogin, function (req,res) {
        const recipeName = req.sanitize(req.body.recipeUpdate);
        if (recipeName == null) {
            res.redirect('./update');
        }
        else{
            // saving data in database
            var MongoClient = require('mongodb').MongoClient;
            var url = 'mongodb://localhost';
            MongoClient.connect(url, function(err, client) {
                if (err) throw err;
                var db = client.db ('recipebank');
                db.collection('recipes').findOne( {name: recipeName}, function(err, recipe){
                    // checks the session.userId (who is logged in) against the stored username of the creator of the recipe
                    if(recipe != null && recipe.userAuth == req.session.userId){// only the user who created recipe can update
                        db.collection('recipes').find({ name: recipe.name}).toArray((findErr, results) => {
                            if (findErr) throw findErr
                            else{
                                // storing the recipe name in a global variable
                                // can be used in another route (updated) 
                                app.locals.update = recipe.name;
                                // selected recipe to be updated passed through to update.ejs
                                res.render('update.ejs', {updating: results});
                            }
                        });
                    }
                    else{
                        res.redirect('./update');
                    }
                client.close();
                });
            });
        }
    });    
    
    app.post('/updated', function (req,res) {
        // saving data in database
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        const recipeName = req.sanitize(req.body.name);
        const time = req.sanitize(req.body.time);
        const difficulty = req.sanitize(req.body.difficulty);
        const ingredients = req.sanitize(req.body.ingredients);
        const method = req.sanitize(req.body.method);
        const publisher = req.sanitize(req.body.publisher);
        MongoClient.connect(url, function(err, client) {
            if (err) throw err;
            var db = client.db ('recipebank');
            // prior selected recipe being updated with any new data
            db.collection('recipes').updateOne(
                {"name": req.app.locals.update},
                {$set:{
                    name: recipeName,
                    time: time,
                    difficulty: difficulty,
                    ingredients: ingredients,
                    method: method,
                    publisher: publisher}
                });
            res.render('message.ejs', {message: "The " + recipeName +" recipe has successfully been updated"}); 
            client.close();
                
        });
        
    });    

    
    //---------delete----------
    app.get('/delete', redirectLogin, function(req, res) {
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        MongoClient.connect(url, function (err, client) {
            if (err) throw err;
            var db = client.db('recipebank');
            db.collection('recipes').find().toArray((findErr, results) => {                                                    
                if (findErr) throw findErr;
                else
                    // all recipes passed through, to choose which to delete
                    res.render('delete.ejs', {recipebook:results});
                client.close();                                                                                                
           });
       });
    });

    app.post('/deleted', function (req,res) {
        const errors = validationResult(req);
        const recipeName = req.sanitize(req.body.recipeDelete);
       
        if (recipeName == null) {
            res.redirect('./delete');
        }
        else{
            // saving data in database
            var MongoClient = require('mongodb').MongoClient;
            var url = 'mongodb://localhost';
           
            MongoClient.connect(url, function(err, client) {
                if (err) throw err;
                var db = client.db ('recipebank');
                db.collection('recipes').findOne( {name: recipeName}, function(err, recipe){
                    if(recipe != null && recipe.userAuth == req.session.userId){// only the user who created recipe can delete
                        // successful deletion
                        db.collection('recipes').deleteOne( {name: recipe.name} );
                        res.render('message.ejs', {message: "The " + recipeName +" recipe has now been deleted"});
                    }
                    else{
                        // incorrect name entered
                        // user trying to delete another users recipe
                        res.redirect('./delete');
                    }
                client.close();
                });
            });
        }
    });
    // api GET HTTP method
    // accessed through URL ending usr/247/api
    // link to API on each page
    app.get('/api', function (req,res) {
        var MongoClient = require('mongodb').MongoClient;
        var url = 'mongodb://localhost';
        MongoClient.connect(url, function (err, client) {
            if (err) throw err                                                                                                                           
            var db = client.db('recipebank');
            db.collection('recipes').find().toArray((findErr, results) => {
                if (findErr) throw findErr;
                else
                    res.json(results);                                                                                                                   
                client.close();                                                                                                                          
            });
        });
    });
          
}
