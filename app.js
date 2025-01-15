const express = require('express');
const student  = require('./routers/mainpage');
const app = express();
const connection = require('./config/connection')
const path = require('path')

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({extended:true}))

connection();

app.use(student)

app.listen(3000,()=>{
    console.log('Server is running on port 3000')
    
})
