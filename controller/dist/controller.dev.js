"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var path = require("path");

var express = require("express");

var app = express();

var mongoose = require("mongoose");

var bodyParser = require("body-parser");

var _require = require("../utils/path"),
    rootDir = _require.rootDir;

var _require2 = require("../model/schema"),
    studentSchema = _require2.studentSchema;

var _require3 = require("../model/adminschema"),
    classSchema = _require3.classSchema,
    subjectSchema = _require3.subjectSchema; // const {subject} = require('../controller/admincontroller')
// const {studentClass} = require('../controller/admincontroller')


var subjectlist = mongoose.model("subjectlist", subjectSchema, "subjectlist");
var studentClass = mongoose.model("studentClass", classSchema, "classlist");

var _require4 = require("mongoose"),
    mongo = _require4.mongo; // const subjects = await subject.find({})
// let availablesubject = ['math','science','english','computer','social','optmath','health']


app.set("view engine", "ejs");
app.set("view", path.join(rootDir, "views"));

exports.homePage = function _callee(req, res, next) {
  var subjects;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(subjectlist.find({}));

        case 2:
          subjects = _context.sent;
          res.render("index", {
            currentPage: "home",
            subjects: subjects
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
};

exports.teacherPage = function _callee2(req, res, next) {
  var subjects, controller;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(subjectlist.find({}));

        case 2:
          subjects = _context2.sent;
          controller = req.params.controller;
          res.render("teacher", {
            controller: controller,
            currentPage: "teacher",
            subjects: subjects
          });

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  });
};

exports.studentclass = function _callee3(req, res, next) {
  var studentClassdata, _req$params, subject, controller;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(studentClass.find({}));

        case 2:
          studentClassdata = _context3.sent;
          _req$params = req.params, subject = _req$params.subject, controller = _req$params.controller;
          res.render("class", {
            subject: subject,
            controller: controller,
            studentClassdata: studentClassdata
          });

        case 5:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.terminal = function (req, res, next) {
  var _req$params2 = req.params,
      controller = _req$params2.controller,
      subject = _req$params2.subject,
      studentClass = _req$params2.studentClass,
      section = _req$params2.section;
  res.render("terminal", {
    subject: subject,
    controller: controller,
    studentClass: studentClass,
    section: section
  });
};

var getSubjectModel = function getSubjectModel(subjectinput) {
  // to Check if model already exists
  if (mongoose.models[subjectinput]) {
    return mongoose.models[subjectinput];
  }

  return mongoose.model(subjectinput, studentSchema, subjectinput);
};

exports.showForm = function _callee4(req, res, next) {
  var subjects, _req$params3, subjectinput, studentClass, section, terminal;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return regeneratorRuntime.awrap(subjectlist.find({}));

        case 2:
          subjects = _context4.sent;
          global.availablesubject = subjects.map(function (sub) {
            return sub.subject;
          });
          _req$params3 = req.params, subjectinput = _req$params3.subjectinput, studentClass = _req$params3.studentClass, section = _req$params3.section, terminal = _req$params3.terminal;

          if (availablesubject.includes(subjectinput)) {
            _context4.next = 9;
            break;
          }

          return _context4.abrupt("return", res.render("404"));

        case 9:
          res.render("form", {
            subjectname: subjectinput,
            section: section,
            studentClass: studentClass,
            terminal: terminal
          });

        case 10:
        case "end":
          return _context4.stop();
      }
    }
  });
};

exports.saveForm = function _callee5(req, res, next) {
  var subjectinput, _req$params4, studentclass, section, terminal, _model;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          subjectinput = req.params.subjectinput;
          _req$params4 = req.params, studentclass = _req$params4.studentclass, section = _req$params4.section, terminal = _req$params4.terminal;

          if (availablesubject.includes(subjectinput)) {
            _context5.next = 6;
            break;
          }

          return _context5.abrupt("return", res.render("404"));

        case 6:
          _context5.prev = 6;
          _model = getSubjectModel(subjectinput);
          _context5.next = 10;
          return regeneratorRuntime.awrap(_model.create(req.body));

        case 10:
          res.render("FormPostMessage", {
            subjectinput: subjectinput,
            studentclass: studentclass,
            section: section,
            terminal: terminal
          });
          _context5.next = 16;
          break;

        case 13:
          _context5.prev = 13;
          _context5.t0 = _context5["catch"](6);
          console.log(_context5.t0);

        case 16:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[6, 13]]);
};

exports.findData = function _callee7(req, res) {
  var _req$params5, subjectinput, _studentClass, section, terminal, terminal2, terminal3, _model2, totalstudent, totalStudent, result, term, i, _ref6, _ref7, analysis;

  return regeneratorRuntime.async(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.prev = 0;
          _req$params5 = req.params, subjectinput = _req$params5.subjectinput, _studentClass = _req$params5.studentClass, section = _req$params5.section, terminal = _req$params5.terminal, terminal2 = _req$params5.terminal2, terminal3 = _req$params5.terminal3;
          _model2 = getSubjectModel(subjectinput);
          _context7.next = 5;
          return regeneratorRuntime.awrap(_model2.aggregate([{
            $match: {
              $and: [{
                section: "".concat(section)
              }, {
                terminal: "".concat(terminal)
              }]
            }
          }, {
            $count: "count"
          }]));

        case 5:
          totalstudent = _context7.sent;
          totalStudent = totalstudent.length > 0 && totalstudent[0].count ? totalstudent[0].count : 0;
          result = [];
          term = [];
          question_list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
          i = 1;

        case 11:
          if (!(i <= 25)) {
            _context7.next = 33;
            break;
          }

          j = 1;

        case 13:
          if (!(j <= 10)) {
            _context7.next = 30;
            break;
          }

          _context7.prev = 14;
          _context7.next = 17;
          return regeneratorRuntime.awrap(function _callee6() {
            var _model2$find, _model2$find3, _model2$find5;

            var term1Incorrect, term2Incorrect, term3Incorrect, firstSecondTerm, firstThirdTerm, secondThirdTerm, firstSecondThirdTerm;
            return regeneratorRuntime.async(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    _context6.next = 2;
                    return regeneratorRuntime.awrap(_model2.find((_model2$find = {}, _defineProperty(_model2$find, "q".concat(i).concat(question_list[j - 1]), "incorrect"), _defineProperty(_model2$find, "terminal", "first"), _model2$find), _defineProperty({
                      roll: 1,
                      name: 1,
                      _id: 0
                    }, "q".concat(i).concat(question_list[j - 1]), 1)));

                  case 2:
                    term1Incorrect = _context6.sent;
                    _context6.next = 5;
                    return regeneratorRuntime.awrap(_model2.find((_model2$find3 = {}, _defineProperty(_model2$find3, "q".concat(i).concat(question_list[j - 1]), "incorrect"), _defineProperty(_model2$find3, "terminal", "second"), _model2$find3), _defineProperty({
                      roll: 1,
                      name: 1,
                      _id: 0
                    }, "q".concat(i).concat(question_list[j - 1]), 1)));

                  case 5:
                    term2Incorrect = _context6.sent;
                    _context6.next = 8;
                    return regeneratorRuntime.awrap(_model2.find((_model2$find5 = {}, _defineProperty(_model2$find5, "q".concat(i).concat(question_list[j - 1]), "incorrect"), _defineProperty(_model2$find5, "terminal", "third"), _model2$find5), _defineProperty({
                      roll: 1,
                      name: 1,
                      _id: 0
                    }, "q".concat(i).concat(question_list[j - 1]), 1)));

                  case 8:
                    term3Incorrect = _context6.sent;
                    firstSecondTerm = term1Incorrect.filter(function (data1) {
                      var term1 = term2Incorrect.find(function (data2) {
                        return data2.roll === data1.roll ? true : false;
                      });
                      return term1;
                    });
                    firstThirdTerm = term1Incorrect.filter(function (data1) {
                      var term13 = term3Incorrect.find(function (data3) {
                        data3.roll === data1.roll ? true : false;
                      });
                      return term13;
                    });
                    secondThirdTerm = term2Incorrect.filter(function (data2) {
                      var term23 = term3Incorrect.find(function (data3) {
                        data3.roll === data1.roll ? true : false;
                      });
                      return term23;
                    });
                    firstSecondThirdTerm = term1Incorrect.filter(function (data1) {
                      var term23 = term3Incorrect.find(function (data3) {
                        data3.roll === data1.roll ? true : false;
                      });
                      return term23;
                    });

                  case 13:
                  case "end":
                    return _context6.stop();
                }
              }
            });
          }());

        case 17:
          _context7.next = 22;
          break;

        case 19:
          _context7.prev = 19;
          _context7.t0 = _context7["catch"](14);
          console.log(_context7.t0);

        case 22:
          _context7.next = 24;
          return regeneratorRuntime.awrap(_model2.aggregate([{
            $facet: {
              correct: [{
                $match: {
                  $and: [_defineProperty({}, "q".concat(i).concat(question_list[j - 1]), "correct"), {
                    section: "".concat(section)
                  }, {
                    terminal: "".concat(terminal)
                  }]
                }
              }, {
                $count: "count"
              }],
              incorrect: [{
                $match: {
                  $and: [_defineProperty({}, "q".concat(i).concat(question_list[j - 1]), "incorrect"), {
                    section: "".concat(section)
                  }, {
                    terminal: "".concat(terminal)
                  }]
                }
              }, {
                $count: "count"
              }],
              notattempt: [{
                $match: {
                  $and: [_defineProperty({}, "q".concat(i).concat(question_list[j - 1]), "notattempt"), {
                    section: section
                  }, {
                    terminal: "".concat(terminal)
                  }]
                }
              }, {
                $count: "count"
              }],
              correctabove50: [{
                $match: {
                  $and: [_defineProperty({}, "q".concat(i).concat(question_list[j - 1]), "correctabove50"), {
                    section: section
                  }, {
                    terminal: "".concat(terminal)
                  }]
                }
              }, {
                $count: "count"
              }],
              correctbelow50: [{
                $match: {
                  $and: [_defineProperty({}, "q".concat(i).concat(question_list[j - 1]), "correctbelow50"), {
                    section: section
                  }, {
                    terminal: "".concat(terminal)
                  }]
                }
              }, {
                $count: "count"
              }],
              incorrectTerminal: [{
                $match: {
                  $and: [(_ref6 = {}, _defineProperty(_ref6, "q".concat(i).concat(question_list[j - 1]), "incorrect"), _defineProperty(_ref6, "terminal", "".concat(terminal)), _ref6), {
                    section: section
                  }, (_ref7 = {}, _defineProperty(_ref7, "q".concat(i).concat(question_list[j - 1]), "incorrect"), _defineProperty(_ref7, "terminal", "".concat(terminal2)), _ref7)]
                }
              }, {
                $count: "count"
              }],
              correctTerminal: [{
                $match: {
                  $or: [_defineProperty({}, "q".concat(i).concat(question_list[j - 1]), "correct"), {
                    section: section
                  }, {
                    terminal: "".concat(terminal)
                  }, {
                    terminal: "".concat(terminal2)
                  }]
                }
              }, {
                $count: "count"
              }],
              notattemptTerminal: [{
                $match: {
                  $or: [_defineProperty({}, "q".concat(i).concat(question_list[j - 1]), "notattempt"), {
                    section: section
                  }, {
                    terminal: "".concat(terminal)
                  }, {
                    terminal: "".concat(terminal2)
                  }]
                }
              }, {
                $count: "count"
              }]
            }
          }, {
            $project: {
              correct: {
                $ifNull: [{
                  $arrayElemAt: ["$correct.count", 0]
                }, 0]
              },
              incorrect: {
                $ifNull: [{
                  $arrayElemAt: ["$incorrect.count", 0]
                }, 0]
              },
              notattempt: {
                $ifNull: [{
                  $arrayElemAt: ["$notattempt.count", 0]
                }, 0]
              },
              correctabove50: {
                $ifNull: [{
                  $arrayElemAt: ["$correctabove50.count", 0]
                }, 0]
              },
              correctbelow50: {
                $ifNull: [{
                  $arrayElemAt: ["$correctbelow50.count", 0]
                }, 0]
              },
              incorrectTerminal: {
                $ifNull: [{
                  $arrayElemAt: ["$incorrectTerminal.count", 0]
                }, 0]
              },
              correctTerminal: {
                $ifNull: [{
                  $arrayElemAt: ["$correctTerminal.count", 0]
                }, 0]
              },
              notattemptTerminal: {
                $ifNull: [{
                  $arrayElemAt: ["$notattemptTerminal.count", 0]
                }, 0]
              }
            }
          }]));

        case 24:
          analysis = _context7.sent;
          result.push({
            questionNo: "q".concat(i).concat(question_list[j - 1]),
            correct: analysis[0].correct,
            wrong: analysis[0].incorrect,
            notattempt: analysis[0].notattempt,
            correctabove50: analysis[0].correctabove50,
            correctbelow50: analysis[0].correctbelow50
          });
          term.push({
            questionNo: "q".concat(i).concat(question_list[j - 1]),
            terminal1: terminal,
            terminal2: terminal2,
            wrong: analysis[0].incorrectTerminal,
            correct: analysis[0].correctTerminal,
            notattempt: analysis[0].notattemptTerminal
          });

        case 27:
          j++;
          _context7.next = 13;
          break;

        case 30:
          i++;
          _context7.next = 11;
          break;

        case 33:
          result.sort(function (a, b) {
            return b.wrong - a.wrong;
          });
          term.sort(function (a, b) {
            return b.wrong - a.wrong;
          });
          res.render("analysis", {
            results: result,
            term: term,
            subjectname: subjectinput,
            studentClass: _studentClass,
            section: section,
            totalStudent: totalStudent,
            terminal: terminal,
            terminal2: terminal2,
            terminal3: terminal3
          });
          _context7.next = 41;
          break;

        case 38:
          _context7.prev = 38;
          _context7.t1 = _context7["catch"](0);
          console.log(_context7.t1);

        case 41:
        case "end":
          return _context7.stop();
      }
    }
  }, null, null, [[0, 38], [14, 19]]);
};

exports.search = function _callee8(req, res, next) {
  var _req$params6, subject, studentClass, section, terminal, roll, model, individualData;

  return regeneratorRuntime.async(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _req$params6 = req.params, subject = _req$params6.subject, studentClass = _req$params6.studentClass, section = _req$params6.section, terminal = _req$params6.terminal;
          roll = req.body.roll;
          model = getSubjectModel(subject);
          _context8.next = 5;
          return regeneratorRuntime.awrap(model.find({
            subject: "".concat(subject),
            section: "".concat(section),
            terminal: "".concat(terminal),
            roll: roll,
            studentClass: "".concat(studentClass)
          }, {
            _id: 0,
            __v: 0
          }).lean());

        case 5:
          individualData = _context8.sent;
          res.render("search", {
            individualData: individualData,
            subject: subject,
            studentClass: studentClass,
            section: section,
            terminal: terminal
          });

        case 7:
        case "end":
          return _context8.stop();
      }
    }
  });
};

exports.studentData = function _callee9(req, res, next) {
  var _req$params7, subjectinput, studentClass, section, qno, status, terminal, StudentData;

  return regeneratorRuntime.async(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _req$params7 = req.params, subjectinput = _req$params7.subjectinput, studentClass = _req$params7.studentClass, section = _req$params7.section, qno = _req$params7.qno, status = _req$params7.status, terminal = _req$params7.terminal;
          model = getSubjectModel(subjectinput);
          _context9.next = 4;
          return regeneratorRuntime.awrap(model.find({
            $and: [_defineProperty({}, "".concat(qno), "".concat(status)), {
              section: "".concat(section)
            }, {
              terminal: "".concat(terminal)
            }]
          }));

        case 4:
          StudentData = _context9.sent;
          res.render("studentdata", {
            subjectinput: subjectinput,
            qno: qno,
            status: status,
            StudentData: StudentData,
            studentClass: studentClass,
            section: section,
            terminal: terminal
          });

        case 6:
        case "end":
          return _context9.stop();
      }
    }
  });
};

exports.totalStudent = function _callee10(req, res, next) {
  var _req$params8, subjectinput, studentClass, section, terminal, terminal2, terminal3, totalStudent;

  return regeneratorRuntime.async(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _req$params8 = req.params, subjectinput = _req$params8.subjectinput, studentClass = _req$params8.studentClass, section = _req$params8.section, terminal = _req$params8.terminal, terminal2 = _req$params8.terminal2, terminal3 = _req$params8.terminal3;
          model = getSubjectModel(subjectinput);
          _context10.next = 4;
          return regeneratorRuntime.awrap(model.find({
            $and: [{
              studentClass: "".concat(studentClass)
            }, {
              section: "".concat(section)
            }, {
              terminal: "".concat(terminal)
            }]
          }).lean());

        case 4:
          totalStudent = _context10.sent;
          res.render("totalstudent", {
            totalStudent: totalStudent,
            subjectinput: subjectinput,
            studentClass: studentClass,
            section: section,
            terminal: terminal,
            terminal2: terminal2,
            terminal3: terminal3
          });

        case 6:
        case "end":
          return _context10.stop();
      }
    }
  });
};

exports.updateQuestion = function _callee11(req, res, next) {
  var no;
  return regeneratorRuntime.async(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          no = req.params.no;
          console.log(no);

        case 2:
        case "end":
          return _context11.stop();
      }
    }
  });
};