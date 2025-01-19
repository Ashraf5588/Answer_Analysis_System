"use strict";

var mongoose = require('mongoose');

var studentSchema = new mongoose.Schema({
  "name": {
    type: String,
    required: false
  },
  "roll": {
    type: Number,
    required: false
  },
  "studentClass": {
    type: String,
    required: false
  },
  "section": {
    type: String,
    required: false
  },
  "subject": {
    type: String,
    required: false
  },
  "terminal": {
    type: String,
    required: false
  },
  "q1a": {
    type: String,
    required: false
  },
  "q1b": {
    type: String,
    required: false
  },
  "q1c": {
    type: String,
    required: false
  },
  "q1d": {
    type: String,
    required: false
  },
  "q2a": {
    type: String,
    required: false
  },
  "q2b": {
    type: String,
    required: false
  },
  "q2c": {
    type: String,
    required: false
  },
  "q2d": {
    type: String,
    required: false
  },
  "q3a": {
    type: String,
    required: false
  },
  "q3b": {
    type: String,
    required: false
  },
  "q3c": {
    type: String,
    required: false
  },
  "q3d": {
    type: String,
    required: false
  },
  "q4a": {
    type: String,
    required: false
  },
  "q4b": {
    type: String,
    required: false
  },
  "q4c": {
    type: String,
    required: false
  },
  "q4d": {
    type: String,
    required: false
  },
  "q5a": {
    type: String,
    required: false
  },
  "q5b": {
    type: String,
    required: false
  },
  "q5c": {
    type: String,
    required: false
  },
  "q5d": {
    type: String,
    required: false
  },
  "q6a": {
    type: String,
    required: false
  },
  "q6b": {
    type: String,
    required: false
  },
  "q6c": {
    type: String,
    required: false
  },
  "q6d": {
    type: String,
    required: false
  },
  "q7a": {
    type: String,
    required: false
  },
  "q7b": {
    type: String,
    required: false
  },
  "q7c": {
    type: String,
    required: false
  },
  "q7d": {
    type: String,
    required: false
  },
  "q8a": {
    type: String,
    required: false
  },
  "q8b": {
    type: String,
    required: false
  },
  "q8c": {
    type: String,
    required: false
  },
  "q8d": {
    type: String,
    required: false
  },
  "q9a": {
    type: String,
    required: false
  },
  "q9b": {
    type: String,
    required: false
  },
  "q9c": {
    type: String,
    required: false
  },
  "q9d": {
    type: String,
    required: false
  },
  "q10a": {
    type: String,
    required: false
  },
  "q10b": {
    type: String,
    required: false
  },
  "q10c": {
    type: String,
    required: false
  },
  "q10d": {
    type: String,
    required: false
  },
  "q11a": {
    type: String,
    required: false
  },
  "q11b": {
    type: String,
    required: false
  },
  "q11c": {
    type: String,
    required: false
  },
  "q11d": {
    type: String,
    required: false
  },
  "q12a": {
    type: String,
    required: false
  },
  "q12b": {
    type: String,
    required: false
  },
  "q12c": {
    type: String,
    required: false
  },
  "q12d": {
    type: String,
    required: false
  },
  "q13a": {
    type: String,
    required: false
  },
  "q13b": {
    type: String,
    required: false
  },
  "q13c": {
    type: String,
    required: false
  },
  "q13d": {
    type: String,
    required: false
  },
  "q14a": {
    type: String,
    required: false
  },
  "q14b": {
    type: String,
    required: false
  },
  "q14c": {
    type: String,
    required: false
  },
  "q14d": {
    type: String,
    required: false
  },
  "q15a": {
    type: String,
    required: false
  },
  "q15b": {
    type: String,
    required: false
  },
  "q15c": {
    type: String,
    required: false
  },
  "q15d": {
    type: String,
    required: false
  },
  "q16a": {
    type: String,
    required: false
  },
  "q16b": {
    type: String,
    required: false
  },
  "q16c": {
    type: String,
    required: false
  },
  "q16d": {
    type: String,
    required: false
  },
  "q17a": {
    type: String,
    required: false
  },
  "q17b": {
    type: String,
    required: false
  },
  "q17c": {
    type: String,
    required: false
  },
  "q17d": {
    type: String,
    required: false
  },
  "q18a": {
    type: String,
    required: false
  },
  "q18b": {
    type: String,
    required: false
  },
  "q18c": {
    type: String,
    required: false
  },
  "q18d": {
    type: String,
    required: false
  },
  "q19a": {
    type: String,
    required: false
  },
  "q19b": {
    type: String,
    required: false
  },
  "q19c": {
    type: String,
    required: false
  },
  "q19d": {
    type: String,
    required: false
  },
  "q20a": {
    type: String,
    required: false
  },
  "q20b": {
    type: String,
    required: false
  },
  "q20c": {
    type: String,
    required: false
  },
  "q20d": {
    type: String,
    required: false
  },
  "q21a": {
    type: String,
    required: false
  },
  "q21b": {
    type: String,
    required: false
  },
  "q21c": {
    type: String,
    required: false
  },
  "q21d": {
    type: String,
    required: false
  },
  "q22a": {
    type: String,
    required: false
  },
  "q22b": {
    type: String,
    required: false
  },
  "q22c": {
    type: String,
    required: false
  },
  "q22d": {
    type: String,
    required: false
  }
},{ versionKey: false });
module.exports = {
  studentSchema: studentSchema
};