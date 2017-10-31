var express = require('express');
var router = express.Router();
var fs = require('fs-extra');

// Get Product Model
var Product = require('../models/product');
// Get Invoice model
var Invoice = require('../models/invoice');

/*
 * GET all products
 */
router.get('/', function(req, res) {
    
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Product.find(function (err, products) {
        if (err) console.log(err);

        res.render('admin/reports', {
            title: 'Reports',
            products: products,
            loggedIn: loggedIn
        });
    });

});

// Exports
module.exports = router;