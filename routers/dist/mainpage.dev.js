"use strict";

var express = require('express');

var student = express.Router();

var controller = require('../controller/controller');

var admincontrol = require('../controller/admincontroller');

var _require = require('../middleware/loginmiddleware'),
    authenticateToken = _require.authenticateToken;

student.get('/', controller.homePage);
student.get('/admin/login', admincontrol.adminlogin);
student.post('/admin/login', admincontrol.adminloginpost);
student.get('/admin', authenticateToken, admincontrol.admin);
student.post('/admin/subject/:subId?', authenticateToken, admincontrol.addSubject);
student.post('/admin/class/:classId?', authenticateToken, admincontrol.addClass);
student.get('/delete/subject/:subjectId', authenticateToken, admincontrol.deleteSubject);
student.get('/delete/class/:classId', authenticateToken, admincontrol.deleteStudentClass);
student.get('/admin/editsub/:subId/:editing?', authenticateToken, admincontrol.editSub);
student.get('/admin/editclass/:classId/:editing?', authenticateToken, admincontrol.editClass); // student.post('/admin/editsub/:subId/:editing?',admincontrol.editSub)

student.get('/teacher/:controller?', authenticateToken, controller.teacherPage);
student.get('/teacher/:subject/:controller', authenticateToken, controller.studentclass);
student.get('/findData/:subjectinput/:studentClass/:section/:terminal/:terminal2?/:terminal3?', authenticateToken, controller.findData);
student.post('/search/:subject/:studentClass/:section/:terminal', controller.search);
student.get('/:controller/:subject', controller.studentclass);
student.get('/:controller/:subject/:studentClass/:section', controller.terminal);
student.get('/forms/:subjectinput/:studentClass/:section/:terminal', controller.showForm);
student.post('/forms/:subjectinput/:studentclass?/:section?/:terminal?', controller.saveForm);
student.get('/studentData/:subjectinput/:studentClass/:section/:qno/:status/:terminal', controller.studentData);
student.get('/totalStudent/:subjectinput/:studentClass/:section/:terminal', controller.totalStudent);
student.get('/updatequestion/:no', controller.updateQuestion);
module.exports = student;