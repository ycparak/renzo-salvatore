var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Invoice Schema
var InvoiceSchema = new Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cart: {
        type: Object,
        Required: true
    },
    name: {
        type: String,
        Required: true
    },
    date: {
        type: Date,
        required: true
    }

});

var Invoice = module.exports = mongoose.model('Invoice', InvoiceSchema);