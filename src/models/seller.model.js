const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');

const sellerSchema = mongoose.Schema(
  {
    userId:{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    categary: {
      type: Array,
      required: true,
    },
    city: {
      type: String,
    },
    area: {
      type: String,
    },
    streetNo: {
      type: String,
    },
    shopNo: {
      type: String,
    },
    description:{
      type:String,
      required:true
    },
    email:{
      type:String,
      required:true
    },
    phone:{
      type:String,
      required:true
    },
    cnicFront:{
      type:String,
      required:true
    },
    cnicBack:{
      type:String,
      required:true
    },
    bankName:{
      type:String
    },
    accountOrIban:{
      type:String,
    },
    checkbook:{
      type:String,
      required:true
    },
    paymentShedule:{
      type:String,
      required:true
    },
    passCode:{
      private: true,
      type:String,
      required:true,
      trim:true
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
sellerSchema.plugin(toJSON);
sellerSchema.plugin(paginate);


/**
 * @typedef Seller
 */
const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;
