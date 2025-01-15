"use strict";

var mongoose = require('mongoose');

var adminSchema = new mongoose.Schema({
  "username": String,
  "password": String
});
module.exports = {
  adminSchema: adminSchema
};