var mongoose = require('mongoose');

// Product Schema
var ProductSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    shortDesc: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    colour: {
        type: String,
        required: true
    },
    material: {
        type: String,
        required: true
    },
    image1: {
        type: String,
        required: true
    },
    image2: {
        type: String,
        required: true
    },
    image3: {
        type: String,
        required: true
    }

});

var Product = module.exports = mongoose.model('Product', ProductSchema);