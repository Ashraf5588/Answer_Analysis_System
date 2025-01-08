"use strict";

var express = require('express');

var student = express.Router();

var controller = require('../controller/controller');

var admincontrol = require('../controller/admincontroller');

student.get('/', controller.homePage);
student.get('/admin', admincontrol.admin);
student.post('/admin/subject', admincontrol.addSubject);
student.post('/admin/class', admincontrol.addClass);
student.get('/delete/subject/:subjectId', admincontrol.deleteSubject);
student.get('/delete/class/:classId', admincontrol.deleteStudentClass);
student.get('/admin/editsub/:subId/:editing?', admincontrol.editSub); // student.post('/admin/editsub/:subId/:editing?',admincontrol.editSub)

student.get('/teacher/:controller', controller.teacherPage);
student.get('/teacher/:subject/:controller', controller.studentclass);
student.get('/findData/:subjectinput/:studentClass/:section/:terminal/:terminal2?/:terminal3?', controller.findData);
student.get('/:controller/:subject', controller.studentclass);
student.get('/:controller/:subject/:studentClass/:section', controller.terminal);
student.get('/forms/:subjectinput/:studentClass/:section/:terminal', controller.showForm);
student.post('/forms/:subjectinput', controller.saveForm);
student.get('/studentData/:subjectinput/:studentClass/:section/:qno/:status/:terminal', controller.studentData);
student.get('/totalStudent/:subjectinput/:studentClass/:section/:terminal', controller.totalStudent);
module.exports = student;