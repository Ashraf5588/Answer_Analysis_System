const path = require("path");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { rootDir } = require("../utils/path");
const { classSchema, subjectSchema } = require("../model/adminschema");
const { adminSchema } = require("../model/admin");
const {studentSchema} = require("../model/schema");
const student = require("../routers/mainpage");
const { terminal } = require("./controller");
app.set("view engine", "ejs");
app.set("view", path.join(rootDir, "views"));

const subject = mongoose.model("subject", subjectSchema, "subjectlist");
const studentClass = mongoose.model("studentClass", classSchema, "classlist");
const admin = mongoose.model("admin", adminSchema, "admin");

exports.adminlogin = async (req, res, next) => {
  try {
    res.render("admin/login");
  } catch (err) {
    console.log(err);
  }
};
exports.adminloginpost = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await admin.findOne({
      username: `${username}`,
      password: `${password}`,
    });
    if (!user) {
      res.send("invalid credentials");
    } else {
      const token = jwt.sign(
        { user: user.username, role: user.role },
        "mynameisashraf!23_9&",
        { expiresIn: "24h" }
      );
      console.log("Generated Token:", token); // Log the generated token

      res.cookie("token", token, { httpOnly: true, secure: false });
      res.redirect("/admin");
    }
  } catch (err) {
    console.log(err);
  }
};
exports.admin = async (req, res, next) => {
  try {
    const entryArray = [];
    const subjects = await subject.find({});
    const studentClasslist = await studentClass.find({});

    // Loop through each subject
    for (const sub of subjects) {
      const model = mongoose.model(sub.subject, studentSchema, sub.subject);

      // Loop through each class
      for (const stuclass of studentClasslist) {
        const section = stuclass.section;

        // Aggregate query for total entries
        const totalstudentthirdterminal = await model.aggregate([
          { $match: { $and: [{ section: section }, { terminal: 'third' }] } },
          { $count: 'count' },
        ]);

        entryArray.push({
          studentClass: stuclass.studentClass,
          section: stuclass.section,
          subject: sub.subject,
          terminal: 'third',
          totalentry: totalstudentthirdterminal[0]?.count || 0, // Default to 0 if no data
        });
      }
    }

 
    req.entryArray = entryArray;

    res.render("admin/adminpannel", {
      editing: false,
      subjects,
      studentClasslist,
      entryArray,
    });
  } catch (err) {
    console.log(err);
    next(err); // Pass the error to the next middleware
  }
};

exports.addSubject = async (req, res, next) => {
  const { subId } = req.params;
  const updateSubject = req.body.subject;

  if (subId && !undefined) {
    await subject.findByIdAndUpdate(
      subId,
      { subject: `${updateSubject}` },
      { new: true, runValidators: true }
    );
    const subjects = await subject.find({});
    const studentClasslist = await studentClass.find({});
    res.render("admin/adminpannel", {
      editing: false,
      subjects,
      studentClasslist,
      entryArray: req.entryArray,
    });
  } else {
    await subject.create(req.body);
    res.render("admin/adminpannel", { editing: false });
  }
};

exports.addClass = async (req, res, next) => {
  const { classId } = req.params;
  const updateClass = req.body.studentClass;
  if (classId && !undefined) {
    await studentClass.findByIdAndUpdate(
      classId,
      { studentClass: `${updateClass}` },
      { new: true, runValidators: true }
    );
    const studentclass = await studentClass.find({});
    const studentClasslist = await studentClass.find({});
    res.render("admin/adminpannel", {
      editing: false,
      studentclass,
      studentClasslist,
      entryArray: req.entryArray,
    });
  }

  await studentClass.create(req.body);
  res.render("FormPostMessage");
};
exports.deleteSubject = async (req, res, next) => {
  const { subjectId } = req.params;

  await subject.findByIdAndDelete(subjectId);

  res.redirect("/admin");
};
exports.deleteStudentClass = async (req, res, next) => {
  const { classId } = req.params;

  await studentClass.findByIdAndDelete(classId);
  res.redirect("/admin");
};
exports.editSub = async (req, res, next) => {
  const { subId } = req.params;
  const editing = req.query.editing === "true";

  const subjectedit = await subject.findOne({ _id: `${subId}` });

  const subjects = await subject.find({});
  const studentClasslist = await studentClass.find({});

  res.render("admin/adminpannel", {
    editing,
    subId,
    subjectedit,
    subjects,
    studentClasslist,
    entryArray: req.entryArray,
    
  });
};
exports.editClass = async (req, res, next) => {
  const { classId } = req.params;
  const editing = req.query.editing === "true";

  const classedit = await studentClass.findOne({ _id: `${classId}` });

  const subjects = await studentClass.find({});
  const studentClasslist = await studentClass.find({});

  res.render("admin/adminpannel", {
    editing,
    classedit,
    classId,
    subjects,
    studentClasslist,
    entryArray: req.entryArray,
  });
};
