const path = require('path')
const express = require('express')
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {rootDir} = require('../utils/path')
const {classSchema, subjectSchema} = require('../model/adminschema');
const student = require('../routers/mainpage');
app.set('view engine','ejs')
app.set('view',path.join(rootDir,'views'))


const subject = mongoose.model('subject',subjectSchema,'subjectlist');
const studentClass = mongoose.model('studentClass',classSchema,'classlist');

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
          await subject.create(req.body)
          res.render('FormPostMessage') 
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