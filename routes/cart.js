var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isUser = auth.isUser;

// Get Product model
var Product = require('../models/product');
// Get Invoice model
var Invoice = require('../models/invoice');
// Get User model

/*
 * GET add product to cart
 */
router.get('/add/:product', function(req, res) {

    var slug = req.params.product;

    Product.findOne({slug: slug}, function(err, p) {
        if (err) console.log(err);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                slug: slug,
                title: p.title,
                qty: 1,
                shortDesc: p.shortDesc,
                desc: p.desc,
                price: parseFloat(p.price).toFixed(2),
                colour: p.colour,
                material: p.material,
                image1: '/product_images/' + p._id + "/" + p.image1
            });
        } 
        else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart.length; i++) {
                if (cart[i].slug == slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }

            if (newItem) {
                cart.push({
                    slug: slug,
                    title: p.title,
                    qty: 1,
                    shortDesc: p.shortDesc,
                    desc: p.desc,
                    price: parseFloat(p.price).toFixed(2),
                    colour: p.colour,
                    material: p.material,
                    image1: '/product_images/' + p._id + p.image1
                });
            }

        }

        res.redirect('back');
    });

});

/*
 * GET checkout page
 */
router.get('/checkout', isUser, function(req, res) {

    // Check if cart is empty and delete session
    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    }
    else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart
        });
    }

});

/*
 * GET update product
 */
router.get('/update/:product', isUser, function(req, res) {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].slug == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;
                    break;                
                case "remove":
                    cart[i].qty--;
                    if (cart[i].qty < 1) cart.splice(i, 1);
                    break;                
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0) delete req.session.cart;
                    break;
                default:
                console.log("Update problem");
                break;
            }
            break;
        }
    }

    req.flash('success', 'Cart Updated!');
    res.redirect('/cart/checkout');

});

/*
 * POST checkout
 */
router.post('/checkout', function(req, res) {
    
    var card = req.body.card;
    var month = req.body.month;
    var year = req.body.year;
    var cvv = req.body.cvv;
    console.log(card + " " + month + " " + year + " " + cvv);

    req.checkBody('card', 'Card Number is required!').notEmpty();
    req.checkBody('month', 'Month is required!').notEmpty();
    req.checkBody('year', 'Year is required!').notEmpty();
    req.checkBody('cvv', 'CVV is required!').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('checkout', {
            errors: errors,
            user: null,
            title: 'Checkout',
            cart: req.session.cart
        });
    } else {
        var date = new Date();

        // Create invoice
        var invoice = new Invoice({
            user: req.user,
            cart: req.session.cart,
            date: date
        });

        // AJAX spinner

        invoice.save(function(err, result) {
            if (err) {
                console.log(err);
                res.redirect('/checkout');
            }

            // Delete session and redirect user to invoice
            delete req.session.cart;
            res.redirect('/users/account/invoice/' + invoice._id);
        });
    }

});

// Exports
module.exports = router;