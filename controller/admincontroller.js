const path = require("path");
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");


const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { rootDir } = require("../utils/path");
const { classSchema, subjectSchema, terminalSchema } = require("../model/adminschema");
const { adminSchema } = require("../model/admin");
const { studentSchema } = require("../model/schema");
const student = require("../routers/mainpage");
const { terminal } = require("./controller");
app.set("view engine", "ejs");
app.set("view", path.join(rootDir, "views"));


const multer = require('multer')
const fs = require('fs')

// Configure storage with better file naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads')
    }
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + file.originalname
    cb(null, uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

// Create mongoose models
const subject = mongoose.model("subject", subjectSchema, "subjectlist");
const studentClass = mongoose.model("studentClass", classSchema, "classlist");
const studentTerminal = mongoose.model("studentTerminal", classSchema, "terminal");
const admin = mongoose.model("admin", adminSchema, "admin");
let entryArray = [];

/**
 * Transform entry array data into a pivoted format for better data visualization
 * 
 * This function takes the MongoDB aggregation results and creates a pivot table structure:
 * - Rows represent unique subjects (math, science, etc.)
 * - Columns represent unique class-section combinations (4-janak, 2-chanakya, etc.)
 * - Each cell contains the totalentry value for that subject and class-section
 * - Empty cells are represented as 0
 * 
 * The returned object has three properties:
 * - subjects: Array of unique subject names sorted alphabetically
 * - headers: Array of class-section combinations sorted by class number then section name
 * - pivotTable: Nested object where pivotTable[subject][classSection] gives the entry count
 * 
 * Example output:
 * {
 *   subjects: ["English", "Math", "Science"],
 *   headers: ["1-A", "1-B", "2-A"],
 *   pivotTable: {
 *     "English": { "1-A": 20, "1-B": 15, "2-A": 18 },
 *     "Math": { "1-A": 22, "1-B": 17, "2-A": 19 },
 *     "Science": { "1-A": 21, "1-B": 16, "2-A": 17 }
 *   }
 * }
 * 
 * @param {Array} entries - The original entry array data from MongoDB aggregation
 * @returns {Object} Object containing subjects, headers and pivoted table data
 */
function transformToPivotedFormat(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { subjects: [], headers: [], pivotTable: {} };
  }

  try {
    // Extract unique subjects and class-section combinations
    const subjects = [...new Set(entries.map(entry => entry.subject))].sort();
    
    // Create headers by combining class and section (e.g., "4-janak")
    const classSections = [...new Set(entries.map(entry => `${entry.studentClass}-${entry.section}`))];
    
    // Sort headers by class number first, then section
    const headers = classSections.sort((a, b) => {
      try {
        const classA = parseInt(a.split('-')[0]);
        const classB = parseInt(b.split('-')[0]);
        
        // If classes are different, sort by class number
        if (classA !== classB) {
          return classA - classB;
        }
        
        // If classes are the same, sort
        const sectionA = a.split('-')[1];
        const sectionB = b.split('-')[1];
        return sectionA.localeCompare(sectionB);
      } catch (error) {
        console.error("Error sorting headers:", error);
        return 0;
      }
    });
    
    // Create a pivot table as an object
    const pivotTable = {};
    
    // Initialize the pivot table with zeros for all combinations
    subjects.forEach(subject => {
      pivotTable[subject] = {};
      headers.forEach(header => {
        pivotTable[subject][header] = 0;
      });
    });
    
    // Fill in the pivot table with actual values
    entries.forEach(entry => {
      try {
        const subject = entry.subject;
        const header = `${entry.studentClass}-${entry.section}`;
        pivotTable[subject][header] = entry.totalentry;
      } catch (error) {
        console.error("Error setting pivot table value:", error);
      }
    });
    
    return {
      subjects,
      headers,
      pivotTable
    };
  } catch (error) {
    console.error("Error in transformToPivotedFormat:", error);
    return { subjects: [], headers: [], pivotTable: {} };
  }
}

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









exports.admin = async (req, res, next) => {    try {
    // Initialize array
    entryArray = [];
    const subjects = await subject.find({});
    const studentClasslist = await studentClass.find({});
    const terminal = req.params.terminal;
 
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
      // Transform entryArray into pivoted format
    let pivotedData;
    try {
      const studentClassdata = await studentClass.find({});
      // Only use the transformation function if it exists
      if (typeof transformToPivotedFormat === 'function') {
        pivotedData = transformToPivotedFormat(entryArray);
        console.log("Pivoted data generated successfully");
      } else {
        console.error("transformToPivotedFormat function is not defined");
        // Create a simple pivoted data format manually
        pivotedData = { subjects: [], headers: [], pivotTable: {} };
        
        // Extract unique subjects and class-sections
        const subjects = [...new Set(entryArray.map(e => e.subject))].sort();
        const headers = [...new Set(entryArray.map(e => `${e.studentClass}-${e.section}`))].sort();
        
        // Create pivot table
        const pivotTable = {};
        subjects.forEach(subject => {
          pivotTable[subject] = {};
          headers.forEach(header => {
            pivotTable[subject][header] = 0;
          });
        });
        
        // Fill in values
        entryArray.forEach(entry => {
          const header = `${entry.studentClass}-${entry.section}`;
          if (pivotTable[entry.subject]) {
            pivotTable[entry.subject][header] = entry.totalentry;
          }
        });
        
        pivotedData = { subjects, headers, pivotTable };
      }
    } catch (error) {
      console.error("Error transforming data:", error);
      pivotedData = { subjects: [], headers: [], pivotTable: {} };
    }
const studentClassdata = await studentClass.find({});
    // Render with entryArray and pivotedData
    res.render("admin/adminpannel", {
      editing: false,
      subjects,
      studentClasslist,
      entryArray,
      pivotedData,
      terminal, 
      studentClassdata// Ensure entryArray is passed to the template
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.showSubject = async (req, res, next) => {
  const subjects = await subject.find({}).lean();
  const studentClassdata = await studentClass.find({});
  res.render("admin/subjectlist", { 
    subjects, 
    editing: false,
    currentPage: 'adminSubject',
    studentClassdata
  });
};
exports.addSubject = async (req, res, next) => {  try {
    const { subId } = req.params;
    console.log("File uploaded:", req.file);
    console.log("Form data:", req.body);

    // Process the form data
    const formData = req.body;
    
    // Create a clean object with ONLY the fields we want
    const processedData = {
      // Basic fields
      subject: formData.subject,
      forClass: formData.forClass,
      max: formData.max
    };

    // Handle file upload
    if (req.file) {
      processedData.questionPaperOfClass = req.file.filename;
      console.log(`New file uploaded: ${req.file.filename}`);
    } else if (formData.currentQuestionPaper) {
      processedData.questionPaperOfClass = formData.currentQuestionPaper;
      console.log(`Keeping existing file: ${formData.currentQuestionPaper}`);
    }
    
    // We don't need to delete or filter anything since we're building a new object
    
    // Process questions with their marks
    const numericKeys = Object.keys(formData)
      .filter(key => /^\d+$/.test(key))
      .map(key => parseInt(key))
      .sort((a, b) => a - b);
    
    console.log("Question numbers found:", numericKeys);

    // Process all questions that have mark inputs
    for (const qNum of numericKeys) {
      // Get the marks array which now includes the count as first element
      if (Array.isArray(formData[qNum])) {
        // Convert all values to numbers
        processedData[qNum] = formData[qNum].map(val => 
          !isNaN(parseFloat(val)) ? parseFloat(val) : val
        );
        console.log(`Question ${qNum} values (array):`, processedData[qNum]);
      } else {
        // If it's a single value, convert to a one-element array
        const value = !isNaN(parseFloat(formData[qNum])) ? 
          parseFloat(formData[qNum]) : formData[qNum];        processedData[qNum] = [value];
        console.log(`Question ${qNum} value (single):`, processedData[qNum]);
      }
    }

    if (subId) {
      // Edit mode
      console.log("Edit mode - updating subject");
      const oldSubject = await subject.findById(subId);
      
      if (!oldSubject) {
        return res.status(404).send("Subject not found");
      }

      // Update the subject
      await subject.findByIdAndUpdate(
        subId,
        processedData,
        { new: true, runValidators: true }
      );

      // Handle collection rename if subject name changed
      if (oldSubject.subject !== processedData.subject) {
        try {
          const db = mongoose.connection.db;
          await db.collection(oldSubject.subject).rename(processedData.subject);
          console.log(`Renamed collection from ${oldSubject.subject} to ${processedData.subject}`);
        } catch (err) {
          console.error(`Error renaming collection: ${err.message}`);
          // Continue anyway as the document is updated
        }
      }

      res.redirect("/admin/subject");
    } else {
      // Create mode
      console.log("Create mode - adding new subject with data:", processedData);
      await subject.create(processedData);
      res.redirect("/admin/subject");
    }
  } catch (err) {
    console.error("Error in addSubject:", err);
    res.status(500).send("An error occurred while processing the subject data: " + err.message);
  }
};


exports.showClass = async (req, res, next) => {
  const studentClasslist = await studentClass.find({});
  res.render("admin/classlist", {
    editing: false,
    studentClasslist,
    currentPage: 'adminClass'
  });
};

exports.addClass = async (req, res, next) => {
  const { classId } = req.params;

  const updateClass = req.body.studentClass;
  const updateSection = req.body.section;
  console.log(updateClass)
  
  if (classId && !undefined) {
    await studentClass.findByIdAndUpdate(
      classId,
      { studentClass: `${updateClass}`, section: `${updateSection}` },
      { new: true, runValidators: true }
    );

    const studentclass = await studentClass.find({});
    res.redirect('/admin/class')
  } 
  else {
    console.log(req.body)
    await studentClass.create(req.body);
    console.log(req.body)
    res.redirect("/admin/class");
  }
};

exports.deleteSubject = async (req, res, next) => {
  const { subjectId,subjectname } = req.params;
  try
  {

 
  await mongoose.connection.db.dropCollection(`${subjectname}`);
 

  await subject.findByIdAndDelete(subjectId);
  res.redirect("/admin/subject");
 } catch (err) {
  console.error("Error deleting subject collection:", err);
  res.status(500).send("Error deleting subject: " + err.message);
 }
};

exports.deleteStudentClass = async (req, res, next) => {
  const { classId } = req.params;
  await studentClass.findByIdAndDelete(classId);
  res.redirect("/admin/class");
};

exports.editSub = async (req, res, next) => {
  try {
    const { subId } = req.params;
    const editing = req.query.editing === "true";
    const subjects = await subject.find({}).lean();
    const subjectedit = await subject.findOne({ _id: `${subId}` });
     const studentClassdata = await studentClass.find({});
    
    if (!subjectedit) {
      return res.status(404).send("Subject not found");
    }
    
    console.log("Editing subject:", subjectedit);
    
    // Get student class data for form dropdown
    res.render("admin/subjectlist", {
      editing,
      subId,
      subjectedit,
      subjects,
      studentClassdata
    });
  } catch (err) {
    console.error("Error in editSub function:", err);
    res.status(500).send("Error loading subject edit form: " + err.message);
  }
};
exports.editClass = async (req, res, next) => {
  const { classId } = req.params;
  const editing = req.query.editing === "true";
  const classedit = await studentClass.findOne({ _id: `${classId}` });
  console.log(classedit)
  const studentClasslist = await studentClass.find({});
   res.render("admin/classlist", {
      editing,
      classedit,
      classId,
      studentClasslist,
      currentPage: 'adminClass'
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
  console.log(updateClass)
  if (classId && !undefined) {
    await studentClass.findByIdAndUpdate(
      classId,
      { studentClass: `${updateClass}`,section: `${req.body.section}` },
      { new: true, runValidators: true }
    );
   
    const studentclass = await studentClass.find({});
    res.redirect('/admin/class')
  } else {
    await studentClass.create(req.body);
    res.redirect("/admin/class");
  }
};
