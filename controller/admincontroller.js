const path = require("path");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { rootDir } = require("../utils/path");
const { classSchema, subjectSchema } = require("../model/adminschema");
const { adminSchema } = require("../model/admin");
const { studentSchema } = require("../model/schema");
const student = require("../routers/mainpage");
const { terminal } = require("./controller");
app.set("view engine", "ejs");
app.set("view", path.join(rootDir, "views"));

const subject = mongoose.model("subject", subjectSchema, "subjectlist");
const studentClass = mongoose.model("studentClass", classSchema, "classlist");
const studentTerminal = mongoose.model("studentTerminal", classSchema, "terminal");
const admin = mongoose.model("admin", adminSchema, "admin");
let entryArray = [];
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
        { expiresIn: "720h" }
      );
      console.log("Generated Token:", token); // Log the generated token

      res.cookie("token", token, { httpOnly: true, secure: false });
      res.redirect("/admin/term/first");
    }
  } catch (err) {
    console.log(err);
  }
};


exports.teacherlogin = async (req, res, next) => {
  try {
    res.render("admin/teacherlogin");
  } catch (err) {
    console.log(err);
  }
};
exports.teacherloginpost = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await admin.findOne({
      username: `${username}`,
      password: `${password}`,
    });
    if (!user) {
      res.send("invalid credentials. Username or Password Does not Match");
    } else {
      const teachertoken = jwt.sign(
        { user: user.username, role: user.role },
        "mynameisashrafteacher!23_9&",
        { expiresIn: "720h" }
      );
      // Log the generated token

      res.cookie("teachertoken", teachertoken, { httpOnly: true, secure: false });
      res.redirect("/teacher/findData");
    }
  } catch (err) {
    console.log(err);
  }
};









exports.admin = async (req, res, next) => {
  try {
    // Initialize array
    entryArray = [];
    const subjects = await subject.find({});
    const studentClasslist = await studentClass.find({});
    const terminal = req.params.terminal;
    console.log(terminal)

    // Populate entryArray
    for (const sub of subjects) {
      const model = mongoose.model(sub.subject, studentSchema, `${sub.subject}`);

      for (const stuclass of studentClasslist) {
        const section = stuclass.section;

        const totalstudentthirdterminal = await model.aggregate([
          { $match: { $and: [{ section }, { terminal: `${terminal}` }, { studentClass: stuclass.studentClass }] } },
          { $count: "count" },
        ]);

        entryArray.push({
          studentClass: stuclass.studentClass,
          section: stuclass.section,
          subject: sub.subject,
          terminal: `${terminal}`,
          totalentry: totalstudentthirdterminal[0]?.count || 0,
        });
      }
    }

    // Render with entryArray
    res.render("admin/adminpannel", {
      editing: false,
      subjects,
      studentClasslist,
      entryArray,
      terminal, // Ensure entryArray is passed to the template
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.showSubject = async (req, res, next) => {
  const subjects = await subject.find({}).lean();
  res.render("admin/subjectlist", { subjects, editing: false });
};
exports.addSubject = async (req, res, next) => {
  try{
  const { subId } = req.params;
  
  const oldSubjectName = await subject.findById(subId)
 
  const updates = req.body;
  if (subId && !undefined) {

    await subject.findByIdAndUpdate(
      subId,updates,
      { new: true, runValidators: true }
    
    );

    const db = mongoose.connection.db;

    const newSubjectName = await subject.findById(subId)
    if(oldSubjectName.subject!=newSubjectName.subject)
    {
    await db.collection(oldSubjectName.subject).rename(newSubjectName.subject);
    }
   

    res.redirect("/admin/subject");
  }
  
   else {
    await subject.create(req.body);
    res.redirect("/admin/subject");
  }
  }catch(err)
  {
    throw err
  }
};

exports.showClass = async (req, res, next) => {
  const studentClasslist = await studentClass.find({});
  res.render("admin/classlist", {
    editing: false,
    studentClasslist,
  });
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
    res.redirect('/admin/class')
  } else {
    await studentClass.create(req.body);
    res.redirect("/admin/class");
  }
};

exports.deleteSubject = async (req, res, next) => {
  const { subjectId,subjectname } = req.params;
  await mongoose.connection.db.dropCollection(`${subjectname}`);
 

  await subject.findByIdAndDelete(subjectId);

  res.redirect("/admin/subject");
};

exports.deleteStudentClass = async (req, res, next) => {
  const { classId } = req.params;
  await studentClass.findByIdAndDelete(classId);
  res.redirect("/admin/class");
};

exports.editSub = async (req, res, next) => {
  const { subId } = req.params;
  const editing = req.query.editing === "true";
  const subjects = await subject.find({}).lean();
  const subjectedit = await subject.findOne({ _id: `${subId}` });
  res.render("admin/subjectlist", {
    editing,
    subId,
    subjectedit,
    subjects,
  });
};
exports.editClass = async (req, res, next) => {
  const { classId } = req.params;
  const editing = req.query.editing === "true";
  const classedit = await studentClass.findOne({ _id: `${classId}` });
  const studentClasslist = await studentClass.find({});
   res.render("admin/classlist", {
      editing,
      classedit,
      classId,
      studentClasslist
    });
  } 

exports.showTerminal = async (req, res, next) => {
  const terminalList = await studentTerminal.find({});
  res.render("admin/terminallist", {
    editing: false,
    terminalList,
  });
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
    res.redirect('/admin/class')
  } else {
    await studentClass.create(req.body);
    res.redirect("/admin/class");
  }
};
