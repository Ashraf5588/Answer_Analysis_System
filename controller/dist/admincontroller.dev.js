"use strict";

var path = require('path');

var express = require('express');

var app = express();

var mongoose = require('mongoose');

var bodyParser = require('body-parser');

var _require = require('../utils/path'),
    rootDir = _require.rootDir;

var _require2 = require('../model/adminschema'),
    classSchema = _require2.classSchema,
    subjectSchema = _require2.subjectSchema;

var student = require('../routers/mainpage');

app.set('view engine', 'ejs');
app.set('view', path.join(rootDir, 'views'));
var subject = mongoose.model('subject', subjectSchema, 'subjectlist');
var studentClass = mongoose.model('studentClass', classSchema, 'classlist');

exports.admin = function _callee(req, res, next) {
  var subjects, studentClasslist;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(subject.find({}));

        case 3:
          subjects = _context.sent;
          _context.next = 6;
          return regeneratorRuntime.awrap(studentClass.find({}));

        case 6:
          studentClasslist = _context.sent;
          res.render('admin/adminpannel', {
            subjects: subjects,
            studentClasslist: studentClasslist,
            editing: false
          });
          _context.next = 13;
          break;

        case 10:
          _context.prev = 10;
          _context.t0 = _context["catch"](0);
          console.log(_context.t0);

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

exports.addSubject = function _callee2(req, res, next) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(subject.create(req.body));

        case 2:
          res.render('FormPostMessage');

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.addClass = function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(studentClass.create(req.body));

        case 2:
          res.render('FormPostMessage');

        case 3:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.deleteSubject = function _callee4(req, res, next) {
  var subjectId;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          subjectId = req.params.subjectId;
          _context4.next = 3;
          return regeneratorRuntime.awrap(subject.findByIdAndDelete(subjectId));

        case 3:
          res.render('FormPostMessage');

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  });
};

exports.deleteStudentClass = function _callee5(req, res, next) {
  var classId;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          classId = req.params.classId;
          _context5.next = 3;
          return regeneratorRuntime.awrap(studentClass.findByIdAndDelete(classId));

        case 3:
          res.render('FormPostMessage');

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  });
};

exports.editSub = function _callee6(req, res, next) {
  var subId, editing, subjectedit, subjects, studentClasslist;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          subId = req.params.subId;
          editing = req.query.editing === 'true';
          console.log(editing);
          _context6.next = 5;
          return regeneratorRuntime.awrap(subject.findOne({
            _id: "".concat(subId)
          }));

        case 5:
          subjectedit = _context6.sent;
          _context6.next = 8;
          return regeneratorRuntime.awrap(subject.find({}));

        case 8:
          subjects = _context6.sent;
          _context6.next = 11;
          return regeneratorRuntime.awrap(studentClass.find({}));

        case 11:
          studentClasslist = _context6.sent;
          res.render('admin/adminpannel', {
            editing: editing,
            subId: subId,
            subjectedit: subjectedit,
            subjects: subjects,
            studentClasslist: studentClasslist
          }); // await studentClass.findByIdAndUpdate(subId)

        case 13:
        case "end":
          return _context6.stop();
      }
    }
  });
};