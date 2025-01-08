const { default: mongoose } = require("mongoose");

const subjectSchema = new mongoose.Schema({
  "subject":{ type: String,required: false},
  


})
const classSchema = new mongoose.Schema({

  
"studentClass":{ type: String,required: false},
  "section":{ type: String,required: false},

})
module.exports = {subjectSchema,classSchema}
