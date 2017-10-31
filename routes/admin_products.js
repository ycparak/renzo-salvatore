var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Product model
var Product = require('../models/product');
// Get Product model
var Category = require('../models/category');

/*
 * GET products index
 */
router.get('/', isAdmin, function (req, res) {
    var count;

    Product.count(function(err, c) {
        count = c;
    });

    Product.find(function(err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        })
    })
});

/*
 * GET add product
 */
router.get('/add-product', isAdmin, function(req, res) {

    var title = "";
    var shortDesc = "";
    var desc = "";
    var price = "";    
    var colour = "";    
    var material = "";    

    Category.find(function(err, categories) {
        res.render('admin/add_product', {
            title: title,
            categories: categories,
            shortDesc: shortDesc,
            desc: desc,
            price: price,
            colour: colour,
            material: material
        });
    });
});

/*
 * POST add product
 */
router.post('/add-product', function(req, res) {

    var imageFile1 = typeof req.files.image1 !== "undefined" ? req.files.image1.name : "";
    var imageFile2 = typeof req.files.image2 !== "undefined" ? req.files.image2.name : "";
    var imageFile3 = typeof req.files.image3 !== "undefined" ? req.files.image3.name : "";

    var pimage1 = imageFile1;
    var pimage2 = imageFile2;
    var pimage3 = imageFile3;

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('shortDesc', 'Short Description must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('colour', 'Colour must have a value.').notEmpty();
    req.checkBody('material', 'Material must have a value.').notEmpty();
    req.checkBody('image1', 'You must upload a primary image.').isImage(imageFile1);
    req.checkBody('image2', 'You must upload a secondary image.').isImage(imageFile2);
    req.checkBody('image3', 'You must upload a tertiary image.').isImage(imageFile3);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var ctg = req.body.category;
    var shortDesc = req.body.shortDesc;
    var desc = req.body.desc;
    var price = req.body.price;
    var colour = req.body.colour;
    var material = req.body.material;

    var errors = req.validationErrors();
    if (errors) {
        Category.find(function(err, categories) {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                categories: categories,
                shortDesc: shortDesc,
                desc: desc,
                price: price,
                colour: colour,
                material: material
            });
        });
    }
    else {
        Product.findOne({slug: slug}, function(err, category) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.')
                Category.find(function(err, categories) {
                    res.render('admin/add_product', {
                        title: title,
                        categories: categories,
                        shortDesc: shortDesc,
                        desc: desc,
                        price: price,
                        colour: colour,
                        material: material
                    });
                });
            }
            else {
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    category: ctg,
                    shortDesc: shortDesc,
                    desc: desc,
                    price: price2,
                    colour: colour,
                    material: material,
                    image1: imageFile1,
                    image2: imageFile2,
                    image3: imageFile3
                });

                product.save(function(err) {
                    if (err) return console.log("Product Save Error:" + err);

                    mkdirp('public/product_images/' + product._id, function(err) {
                        return console.log("Directory Create Error:" + err);
                    });

                    if (imageFile1 != "") {
                        var productImage1 = req.files.image1;
                        var path = 'public/product_images/' + product._id + '/' + imageFile1;

                        productImage1.mv(path, function(err) {
                            return console.log("Image1 Create Error:" + err);
                        });
                    }
                    if (imageFile2 != "") {
                        var productImage2 = req.files.image2;
                        var path = 'public/product_images/' + product._id + '/' + imageFile2;

                        productImage2.mv(path, function(err) {
                            return console.log("Image2 Create Error:" + err);
                        });
                    }
                    if (imageFile3 != "") {
                        var productImage3 = req.files.image3;
                        var path = 'public/product_images/' + product._id + '/' + imageFile3;

                        productImage3.mv(path, function(err) {
                            return console.log("Image3 Create Error:" + err);
                        });
                    }

                    req.flash('success', 'Product added');
                    res.redirect('/admin/products');
                });
            }
        });
    }
    
});

/*
 * GET edit product
 */
router.get('/edit-product/:id', isAdmin, function(req, res) {

    var errors;

    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;

    Category.find(function(err, categories) {

        Product.findById(req.params.id, function(err, p) {
            if (err) {
                console.log(err);
                res.redirect('/admin/products');
            }
            else {
                var imageDir = 'public/product_images/' + p._id + "/";
                var imagesAcc = null;

                fs.readdir(imageDir, function(err, files) {
                    if (err) {
                        console.log("imageDir Error:" + err);
                    } else {
                        imagesAcc = files;
                        res.render('admin/edit_product', {
                            errors: errors,
                            title: p.title,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(), // Might have to change
                            shortDesc: p.shortDesc,
                            desc: p.desc,
                            price: parseFloat(p.price).toFixed(2),
                            colour: p.colour,
                            material: p.material,
                            image1: p.image1,
                            image2: p.image2,
                            image3: p.image3,
                            imagesAcc: imagesAcc,
                            id: p._id
                        });
                    }
                });
            }
        });
    });
});

/*
 * POST edit product
 */
router.post('/edit-product/:id', function(req, res) {
    
    var imageFile1 = typeof req.files.image1 !== "undefined" ? req.files.image1.name : "";
    var imageFile2 = typeof req.files.image2 !== "undefined" ? req.files.image2.name : "";
    var imageFile3 = typeof req.files.image3 !== "undefined" ? req.files.image3.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('shortDesc', 'Short Description must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('colour', 'Colour must have a value.').notEmpty();
    req.checkBody('material', 'Material must have a value.').notEmpty();
    req.checkBody('image1', 'You must upload a primary image.').isImage(imageFile1);
    req.checkBody('image2', 'You must upload a secondary image.').isImage(imageFile2);
    req.checkBody('image3', 'You must upload a tertiary image.').isImage(imageFile3);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var ctg = req.body.category;
    var shortDesc = req.body.shortDesc;
    var desc = req.body.desc;
    var price = req.body.price;
    var colour = req.body.colour;
    var material = req.body.material;
    var id = req.params.id;

    var errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    }
    else {
        Product.findOne({slug: slug, _id:{'$ne': id}}, function(err, p) {
            if (err) console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            }
            else {
                Product.findById(id, function (err, p) {
                    if (err) console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.category = ctg;
                    p.shortDesc = shortDesc;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.colour = colour;
                    p.material = material;
                    if (imageFile1 != "") p.image1 = imageFile1;
                    if (imageFile2 != "") p.image2 = imageFile2;
                    if (imageFile3 != "") p.image3 = imageFile3;

                    p.save(function(err) {
                        if (err) console.log(err);

                        if (imageFile1 != "") {
                            fs.remove('public/product_images/' + id + '/' + pimage1, function(err) {
                                if (err) console.log(err);
                            });

                            var productImage1 = req.files.image1;
                            var path = 'public/product_images/' + id + '/' + imageFile1;
                            productImage1.mv(path, function(err) {
                                return console.log("Image1 Create Error:" + err);
                            });
                        }

                        if (imageFile2 != "") {
                            fs.remove('public/product_images/' + id + pimage2, function(err) {
                                if (err) console.log(err);
                            }); 

                            var productImage2 = req.files.image2;
                            var path = 'public/product_images/' + product._id + '/' + imageFile2;
                            productImage2.mv(path, function(err) {
                                return console.log("Image2 Create Error:" + err);
                            });
                        }

                        if (imageFile3 != "") {
                            fs.remove('public/product_images/' + id + pimage3, function(err) {
                                if (err) console.log(err);
                            }); 

                            var productImage3 = req.files.image3;
                            var path = 'public/product_images/' + product._id + '/' + imageFile3;
                            productImage3.mv(path, function(err) {
                                return console.log("Image3 Create Error:" + err);
                            });
                        }


                        req.flash('success', 'Product edited');
                        res.redirect('/admin/products/edit-product/' + id);
                    });
                });
            }
        });
    }

});

/*
 * GET delete product
 */
router.get('/delete-product/:id', isAdmin, function(req, res) {
    
    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function(err) {
        if (err) {
            console.log(err);
        }
        else {
            Product.findByIdAndRemove(id, function(err) {
                console.log(err);
            });

            req.flash('success', 'Product deleted');
            res.redirect('/admin/products');
        }
    })

});


// Exports
module.exports = router;