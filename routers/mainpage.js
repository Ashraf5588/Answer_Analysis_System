const express = require('express');
const student = express.Router();
const controller = require('../controller/controller')

const {authenticateToken} = require('../middleware/loginmiddleware')
const {authenticateTokenTeacher} = require('../middleware/loginmiddleware')
const admincontrol = require('../controller/admincontroller')
student.get('/',controller.homePage)

student.get('/admin/login',admincontrol.adminlogin)
student.post('/admin/login',admincontrol.adminloginpost)
student.get('/teacher/login',admincontrol.teacherlogin)
student.post('/teacher/logins',admincontrol.teacherloginpost)

student.get('/admin/term/:terminal',authenticateToken,admincontrol.admin)

student.get('/admin/subject/:subId?',authenticateToken,admincontrol.showSubject)
student.post('/admin/subjectadd/:subId?',authenticateToken,admincontrol.addSubject)

student.get('/admin/class/:classId?',authenticateToken,admincontrol.showClass)
student.post('/admin/class/:classId?',authenticateToken,admincontrol.addClass)

student.get('/delete/subject/:subjectId/:subjectname?',authenticateToken,admincontrol.deleteSubject)
student.get('/delete/class/:classId',authenticateToken,admincontrol.deleteStudentClass)
student.get('/admin/editsub/:subId/:editing?',authenticateToken,admincontrol.editSub)
student.get('/admin/editclass/:classId/:editing?',authenticateToken,admincontrol.editClass)
// Route for editing a student
student.get('/edit-student/:studentId/:subjectinput?', controller.editStudent);

// Route for updating a student
student.post('/update-student/:studentId', controller.updateStudent);

// Route for deleting a student
student.get('/delete-student/:studentId/:subjectinput?/:studentClass?/:section?/:terminal?', controller.deleteStudent);

student.get('/teacher/:controller?',authenticateTokenTeacher,controller.teacherPage)
student.get('/teacher/:subject/:controller',authenticateTokenTeacher,controller.studentclass)

student.get('/findData/:subjectinput/:studentClass/:section/:terminal',controller.findData)
student.get('/findData/:subjectinput/:studentClass/:section/:termwise/:status',controller.termwisestatus)
student.get('/findData/:subjectinput/:studentClass/:section/:termwise/:termwisereport/:status',controller.termwisedata)
student.get('/findData/:subjectinput/:studentClass/:section/:termwise/:termwisereport/:status/:qno/:terminal',controller.termdetail)


student.post('/search/:subject/:studentClass/:section/:terminal',controller.search)
student.get('/:controller/:subject',controller.studentclass)
student.get('/:controller/:subject/:studentClass/:section',controller.terminal)

student.get('/forms/:subjectinput/:studentClass/:section/:terminal?',controller.showForm)
student.post('/forms/:subjectinput/:studentclass?/:section?/:terminal?',controller.saveForm)

// Temporary debug route
student.get('/debug/:subjectinput/:studentClass/:section/:terminal', (req, res) => {
  const { subjectinput, studentClass, section, terminal } = req.params;
  
  // Get subject data similar to the showForm controller
  const Model = require('../model/schema');
  Model.find({ subject: subjectinput })
    .then(subjects => {
      if (!subjects) {
        return res.status(404).render('404');
      }
      res.render('debug', {
        subjects,
        subjectname: subjectinput,
        studentClass,
        section,
        terminal,
        totalEntries: 0
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Server Error');
    });
});

student.get('/studentData/:subjectinput/:studentClass/:section/:qno/:status/:terminal',controller.studentData)
student.get('/totalStudent/:subjectinput/:studentClass/:section/:terminal',controller.totalStudent)

// Debug route to check available subjects
student.get('/debug/subjects', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { subjectSchema } = require('../model/adminschema');
    const subjectlist = mongoose.model("subjectlist", subjectSchema, "subjectlist");
    
    // Get all subjects
    const subjects = await subjectlist.find({}).lean();
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    res.json({
      totalSubjects: subjects.length,
      subjects: subjects.map(s => ({
        name: s.subject,
        max: s.max,
        existsAsCollection: collectionNames.includes(s.subject)
      })),
      availableCollections: collectionNames
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = student;