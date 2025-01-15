"use strict";

var path = require('path');

var express = require('express');

var app = express();

var jwt = require("jsonwebtoken");

var mongoose = require('mongoose');

var bodyParser = require('body-parser');

var _require = require('../utils/path'),
    rootDir = _require.rootDir;

var _require2 = require('../model/adminschema'),
    classSchema = _require2.classSchema,
    subjectSchema = _require2.subjectSchema;

var _require3 = require('../model/admin'),
    adminSchema = _require3.adminSchema;

var student = require('../routers/mainpage');

app.set('view engine', 'ejs');
app.set('view', path.join(rootDir, 'views'));
var subject = mongoose.model('subject', subjectSchema, 'subjectlist');
var studentClass = mongoose.model('studentClass', classSchema, 'classlist');
var admin = mongoose.model('admin', adminSchema, 'admin');

exports.adminsign = function _callee(req, res, next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          try {
            res.render('admin/signup');
          } catch (err) {
            console.log(err);
          }

        case 1:
        case "end":
          return _context.stop();
      }
    }
  });
};

exports.adminsignpost = function _callee2(req, res, next) {
  var _req$body, username, password, user;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          _req$body = req.body, username = _req$body.username, password = _req$body.password;
          console.log(username, password);
          _context2.next = 5;
          return regeneratorRuntime.awrap(admin.findOne({
            'username': "".concat(username)
          }));

        case 5:
          user = _context2.sent;
          console.log(user);

          if (!user) {
            _context2.next = 11;
            break;
          }

          res.send("User Already Exist");
          _context2.next = 14;
          break;

        case 11:
          _context2.next = 13;
          return regeneratorRuntime.awrap(admin.create(req.body));

        case 13:
          res.redirect('/admin/login');

        case 14:
          _context2.next = 19;
          break;

        case 16:
          _context2.prev = 16;
          _context2.t0 = _context2["catch"](0);
          console.log(_context2.t0);

        case 19:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[0, 16]]);
};

exports.adminlogin = function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          try {
            res.render('admin/login');
          } catch (err) {
            console.log(err);
          }

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.adminloginpost = function _callee4(req, res, next) {
  var _req$body2, username, password, user, token;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.prev = 0;
          _req$body2 = req.body, username = _req$body2.username, password = _req$body2.password;
          _context4.next = 4;
          return regeneratorRuntime.awrap(admin.findOne({
            'username': "".concat(username),
            'password': "".concat(password)
          }));

        case 4:
          user = _context4.sent;

          if (!user) {
            res.send("invalid credentials");
          } else {
            token = jwt.sign({
              user: user.username
            }, "mynameisashraf!23_9&", {
              expiresIn: "24h"
            });
            console.log("Generated Token:", token); // Log the generated token

            res.cookie("token", token, {
              httpOnly: true,
              secure: false
            });
            res.redirect('/admin');
          }

          _context4.next = 11;
          break;

        case 8:
          _context4.prev = 8;
          _context4.t0 = _context4["catch"](0);
          console.log(_context4.t0);

        case 11:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[0, 8]]);
};

exports.admin = function _callee5(req, res, next) {
  var subjects, studentClasslist;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.prev = 0;
          _context5.next = 3;
          return regeneratorRuntime.awrap(subject.find({}));

        case 3:
          subjects = _context5.sent;
          _context5.next = 6;
          return regeneratorRuntime.awrap(studentClass.find({}));

        case 6:
          studentClasslist = _context5.sent;
          res.render('admin/adminpannel', {
            subjects: subjects,
            studentClasslist: studentClasslist,
            editing: false
          });
          _context5.next = 13;
          break;

        case 10:
          _context5.prev = 10;
          _context5.t0 = _context5["catch"](0);
          console.log(_context5.t0);

        case 13:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[0, 10]]);
};

exports.addSubject = function _callee6(req, res, next) {
  var subId, updateSubject, subjects, studentClasslist;
  return regeneratorRuntime.async(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          subId = req.params.subId;
          updateSubject = req.body.subject;
          console.log(updateSubject, subId);

          if (!(subId && !undefined)) {
            _context6.next = 15;
            break;
          }

          _context6.next = 6;
          return regeneratorRuntime.awrap(subject.findByIdAndUpdate(subId, {
            updateSubject: updateSubject
          }, {
            "new": true,
            runValidators: true
          }));

        case 6:
          _context6.next = 8;
          return regeneratorRuntime.awrap(subject.find({}));

        case 8:
          subjects = _context6.sent;
          _context6.next = 11;
          return regeneratorRuntime.awrap(studentClass.find({}));

        case 11:
          studentClasslist = _context6.sent;
          res.render('admin/adminpannel', {
            editing: false,
            subjects: subjects,
            studentClasslist: studentClasslist
          });
          _context6.next = 18;
          break;

        case 15:
          _context6.next = 17;
          return regeneratorRuntime.awrap(subject.create(req.body));

        case 17:
          res.render('admin/adminpannel');

        case 18:
        case "end":
          return _context6.stop();
      }
    }
  });
};

exports.addClass = function _callee7(req, res, next) {
  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return regeneratorRuntime.awrap(studentClass.create(req.body));

        case 2:
          res.render('FormPostMessage');

        case 3:
        case "end":
          return _context7.stop();
      }
    }
  });
};

exports.deleteSubject = function _callee8(req, res, next) {
  var subjectId;
  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          subjectId = req.params.subjectId;
          _context8.next = 3;
          return regeneratorRuntime.awrap(subject.findByIdAndDelete(subjectId));

        case 3:
          res.render('FormPostMessage');

        case 4:
        case "end":
          return _context8.stop();
      }
    }
  });
};

exports.deleteStudentClass = function _callee9(req, res, next) {
  var classId;
  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          classId = req.params.classId;
          _context9.next = 3;
          return regeneratorRuntime.awrap(studentClass.findByIdAndDelete(classId));

        case 3:
          res.render('FormPostMessage');

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  });
};

exports.editSub = function _callee10(req, res, next) {
  var subId, editing, subjectedit, subjects, studentClasslist;
  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          subId = req.params.subId;
          editing = req.query.editing === 'true';
          console.log(editing);
          _context10.next = 5;
          return regeneratorRuntime.awrap(subject.findOne({
            _id: "".concat(subId)
          }));

        case 5:
          subjectedit = _context10.sent;
          _context10.next = 8;
          return regeneratorRuntime.awrap(subject.find({}));

        case 8:
          subjects = _context10.sent;
          _context10.next = 11;
          return regeneratorRuntime.awrap(studentClass.find({}));

        case 11:
          studentClasslist = _context10.sent;
          res.render('admin/adminpannel', {
            editing: editing,
            subId: subId,
            subjectedit: subjectedit,
            subjects: subjects,
            studentClasslist: studentClasslist
          }); // await studentClass.findByIdAndUpdate(subId)

        case 13:
        case "end":
          return _context10.stop();
      }
    }
  });
};