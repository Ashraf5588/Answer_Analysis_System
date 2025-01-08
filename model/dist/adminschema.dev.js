"use strict";

var _require = require("mongoose"),
    mongoose = _require["default"];

var subjectSchema = new mongoose.Schema({
  "subject": {
    type: String,
    required: false
  }
});
var classSchema = new mongoose.Schema({
  "studentClass": {
    type: String,
    required: false
  },
  "section": {
    type: String,
    required: false
  }
});
module.exports = {
  subjectSchema: subjectSchema,
  classSchema: classSchema
};