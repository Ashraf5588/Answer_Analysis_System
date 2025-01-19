const path = require('path')
const express = require('express')
const app = express();
const jwt = require("jsonwebtoken");

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {rootDir} = require('../utils/path')
const {classSchema, subjectSchema} = require('../model/adminschema');
const {adminSchema} = require('../model/admin')
const student = require('../routers/mainpage');
app.set('view engine','ejs')
app.set('view',path.join(rootDir,'views'))


const subject = mongoose.model('subject',subjectSchema,'subjectlist');
const studentClass = mongoose.model('studentClass',classSchema,'classlist');
const admin = mongoose.model('admin',adminSchema,'admin');
exports.adminsign = async(req,res,next)=>
  {
    try{
    
      res.render('admin/signup')

    }catch(err)
    {
      console.log(err)
    }
  }
  exports.adminsignpost = async(req,res,next)=>
    {
      try{
      
        const {username,password} = req.body;
        console.log(username,password)
       const user = await admin.findOne({'username':`${username}`})
       console.log(user)
       if(user)
       {
        res.send("User Already Exist")
       }
       else
       {
       await admin.create(req.body)
        res.redirect('/admin/login')
       }
  
      }catch(err)
      {
        console.log(err)
      }
    }
exports.adminlogin = async(req,res,next)=>
  {
    try{
    
      res.render('admin/login')

    }catch(err)
    {
      console.log(err)
    }
  }
  exports.adminloginpost = async(req,res,next)=>
    {
      try{
      
        const {username,password} = req.body;
        const user = await admin.findOne({'username':`${username}`,'password':`${password}`})
        if(!user)
        {
          res.send("invalid credentials")
        }
        else
        {

          const token = jwt.sign({user:user.username,role:user.role}, "mynameisashraf!23_9&", { expiresIn: "24h" });
          console.log("Generated Token:", token); // Log the generated token

          res.cookie("token", token, { httpOnly: true, secure: false });
          res.redirect('/admin')
        }
        
  
      }catch(err)
      {
        console.log(err)
      }
    }
    exports.admin = async(req,res,next)=>
      {
        try{
          const subjects = await subject.find({})
          const studentClasslist = await studentClass.find({})
          res.render('admin/adminpannel',{subjects,studentClasslist,editing:false})
        }catch(err)
        {
          console.log(err)
        }
       
      }

      exports.addSubject = async(req,res,next)=>
        {
          const {subId} = req.params
          const updateSubject = req.body.subject;
          console.log(updateSubject,subId)
          if(subId && !undefined)
          {
            await subject.findByIdAndUpdate(subId,{updateSubject},{ new: true, runValidators: true })
            const subjects = await subject.find({})
          const studentClasslist = await studentClass.find({})
            res.render('admin/adminpannel',{editing:false,subjects,studentClasslist}) 
            
          }
          else
          {

          await subject.create(req.body)
          res.render('admin/adminpannel') 
        }
        }
        
        exports.addClass = async(req,res,next)=>
          {
            await studentClass.create(req.body)
            res.render('FormPostMessage')
          }
    exports.deleteSubject = async(req,res,next)=>
    {
      const {subjectId}= req.params;
      
      await subject.findByIdAndDelete(subjectId)
      res.render('FormPostMessage');

    }
    exports.deleteStudentClass = async(req,res,next)=>
      {
        const {classId}= req.params;
        
        await studentClass.findByIdAndDelete(classId)
        res.render('FormPostMessage');
  
      }
      exports.editSub = async(req,res,next)=>
        {
        
          const {subId}= req.params;
          const editing = req.query.editing==='true';
          console.log(editing)
          const subjectedit = await subject.findOne({_id:`${subId}`})

            const subjects = await subject.find({})
            const studentClasslist = await studentClass.find({})
          
          res.render('admin/adminpannel',{editing,subId,subjectedit,subjects,studentClasslist})
          
          // await studentClass.findByIdAndUpdate(subId)
          
    
        }