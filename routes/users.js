var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');
var auth = require('../config/auth');
var isUser = auth.isUser;
var amIUser = auth.amIUser;

// Get Users Model
var User = require('../models/user');
// Get Invoice Model
var Invoice = require('../models/invoice');

/*
 * GET register
 */
router.get('/register', function(req, res) {
    
    if (res.locals.user) res.redirect('/products');
    res.render('register', {
        title: 'Sign In'
    });

});

/*
 * POST register
 */
router.post('/register', function(req, res) {
    
    var name = req.body.name;
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;
    var password2 = req.body.password2;
    var address = req.body.address;
    var address2 = req.body.address2;
    var address3 = req.body.address3;
    var zip = req.body.zip;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('email', 'email is required!').notEmpty();
    req.checkBody('password', 'password is required!').notEmpty();
    req.checkBody('password2', "Passwords don't match").equals(password);
    req.checkBody('address', 'Address line 1 is required!').notEmpty();
    req.checkBody('address2', 'Address line 2 is required!').notEmpty();
    req.checkBody('address3', 'Address line 3 is required!').notEmpty();
    req.checkBody('zip', 'Zip is required!').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Sign In'
        });
    }
    else {
        User.findOne({username: username}, function(err, user) {

            if (err) console.log(err);

            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                res.redirect('/users/register');
            }
            else {
                var user = new User({
                    name: name,
                    username: username,
                    email: email,
                    password: password,
                    address: address,
                    address2: address2,
                    address3: address3,
                    zip: zip,
                    admin: 0
                });

                bcrypt.genSalt(10, function(err, salt) {
                    bcrypt.hash(user.password, salt, function(err, hash){
                        if (err) console.log(err);

                        user.password = hash;

                        user.save(function(err) {
                            if (err) {
                                console.log(err);
                            } 
                            else {
                                req.flash('success', 'You are now registered! Log in to continue.');
                                res.redirect('/users/register');
                            }
                        });
                    });

                });

            }

        });
    }

});

/*
 * POST login
 */
router.post('/login', function(req, res, next) {
    
    passport.authenticate('local', {
        successRedirect: '/products',
        failureRedirect: '/users/register',
        failureFlash: true
    })(req, res, next);

});

/*
 * GET logout
 */
router.get('/logout', isUser, function(req, res) {
    
    req.logout();
    req.flash('success', 'You are now logged out.');
    res.redirect('/users/register')

});

/*
 * Get account
 */
 router.get('/account', isUser, function(req, res) {

    Invoice.find({user: req.user}, function(err, invoices) {
        if (err) {
            console.log(err);
        }

        var cart;
        var cartObj = [];
        invoices.forEach(function(invoice) {
            var cart = cartObj.push(invoice.cart);
            invoice.items = generateArray(cart);
        });

        User.findOne({username: req.user.username}, function(err, user) {
            if (err) {
                console.log(err);
            }

            res.render('account', {
               title: 'Account',
               invoices: invoices,
               user: user
            });
        });

    });
 });

/*
* POST edit account
*/

/*
* POST edit shipping
*/

/*
* POST edit password
*/


/*
 * GET invoice
 */
router.get('/account/invoice/:id', isUser, function(req, res) {
    
    Invoice.find({user: req.user}, function(err, invoices) {
        if (err) console.log(err);

        Invoice.findById((req.params.id), function(err, invoice) {
            if (err) {
                console.log(err);
                res.redirect('/users/account');
            } else {

                var cart;
                var cartObj = [];
                invoices.forEach(function(invoice) {
                    var cart = cartObj.push(invoice.cart);
                    invoice.items = generateArray(cart);
                });
                
                res.render('invoice', {
                   title: 'Invoice',
                   invoice: invoice
                });
            }

        });
    });

});

var generateArray = function(cart) {
    var items = cart.items || {};
    var arr = [];
    for (var id in items) {
        arr.push(items[id]);
    }
    return arr;
}


// Exports
module.exports = router;