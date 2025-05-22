const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { rootDir } = require("../utils/path");
const { studentSchema } = require("../model/schema");
const { classSchema, subjectSchema } = require("../model/adminschema");
const subjectlist = mongoose.model("subjectlist", subjectSchema, "subjectlist");
const studentClass = mongoose.model("studentClass", classSchema, "classlist");

app.set("view engine", "ejs");
app.set("view", path.join(rootDir, "views"));
const getSubjectModel = (subjectinput) => {
  // to Check if model already exists
  if (mongoose.models[subjectinput]) {
    return mongoose.models[subjectinput];
  }
  return mongoose.model(subjectinput, studentSchema, subjectinput);
};
exports.homePage = async (req, res, next) => {
  const subject = await subjectlist.find({}).lean();
  

  res.render("index", { currentPage: "home",subjects:subject});
};


// Edit student (get data for the form)
exports.editStudent = async (req, res, next) => {
  const { studentId ,subjectinput} = req.params;
  try {
    // Find student by ID
    const model = getSubjectModel(subjectinput);
    const studentToEdit = await model.findById(studentId);
    res.render("admin/edit-student", { student: studentToEdit });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Update student (save the modified data)
exports.updateStudent = async (req, res, next) => {
  const { studentId } = req.params;
  const updatedData = req.body;  // The updated data comes from the form
  try {
    // Update the student record
    await student.findByIdAndUpdate(studentId, updatedData, { new: true });
    res.redirect('/admin');  // Redirect to admin dashboard or any page you prefer
  } catch (err) {
    console.error(err);
    next(err);
  }
};

// Delete student
exports.deleteStudent = async (req, res, next) => {
  
  const { studentId,subjectinput,studentClass,section,terminal} = req.params;
  const model = getSubjectModel(subjectinput);
  try {
   
    // Delete the student record
    await model.findByIdAndDelete(studentId);
    res.redirect(`/totalStudent/${subjectinput}/${studentClass}/${section}/${terminal}`);  // Redirect to admin dashboard or any page you prefer
  } catch (err) {
    console.error(err);
    next(err);
  }
};

exports.teacherPage = async (req, res, next) => {
  const subjects = await subjectlist.find({});
  const { controller } = req.params;
  res.render("teacher", { controller, currentPage: "teacher", subjects });
};

exports.studentclass = async (req, res, next) => {
  const studentClassdata = await studentClass.find({});

  const { subject, controller } = req.params;

  res.render("class", { subject, controller, studentClassdata });
};
exports.terminal = (req, res, next) => {
  const { controller, subject, studentClass, section } = req.params;
  res.render("terminal", { subject, controller, studentClass, section });
};


exports.showForm = async (req, res, next) => {
  const subjects = await subjectlist.find({});
  global.availablesubject = subjects.map((sub) => sub.subject);

let { subjectinput, studentClass, section, terminal } = req.params;

  if(!terminal || terminal === "''" || terminal=== '"')
  {
    terminal=''
  }
  
  // Get total entries count for this subject, class, and section
  let totalEntries = 0;
  if (availablesubject.includes(subjectinput)) {
    try {
      const model = getSubjectModel(subjectinput);
      const entriesCount = await model.aggregate([
        {
          $match: {
            $and: [
              { studentClass: studentClass },
              { section: section },
              { terminal: terminal }
            ],
          },
        },
        { $count: "count" },
      ]);
      
      totalEntries = entriesCount.length > 0 && entriesCount[0].count
        ? entriesCount[0].count
        : 0;
    } catch (err) {
      console.log(err);
    }
  }  if (!availablesubject.includes(subjectinput)) {
    return res.render("404");
  } else {
    res.render("form", {
      subjectname: subjectinput,
      section,
      studentClass,
      terminal,
      subjects,
      totalEntries
    });
  }
};

exports.saveForm = async (req, res, next) => {
  const { subjectinput } = req.params;
  const { studentclass, section, terminal } = req.params;

  if (!availablesubject.includes(subjectinput)) {
    return res.render("404");
  } else {
    try {
      const model = getSubjectModel(subjectinput);
      await model.create(req.body);
      res.render("FormPostMessage", {
        subjectinput,
        studentclass,
        section,
        terminal,
      });
    } catch (err) {
      console.log(err);
    }
  }
};

exports.findData = async (req, res) => {
  try {
    const {
      subjectinput,
      studentClass,
      section,
      terminal,
    } = req.params;
    const model = getSubjectModel(subjectinput);
    const totalstudent = await model.aggregate([
      {
        $match: {
          $and: [{ section: `${section}` }, { terminal: `${terminal}` }, { studentClass: `${studentClass}` }],
        },
      },
      { $count: "count" },
    ]);
    const totalStudent =
      totalstudent.length > 0 && totalstudent[0].count
        ? totalstudent[0].count
        : 0;

    let result = [];
    const currentSubject = await subjectlist.find({'subject':`${subjectinput}`})
    const max = parseInt(currentSubject[0].max)

    for (let i = 1; i <= max; i++) {
      let n = currentSubject[0][i]
      if(currentSubject[0][i]===0){n=1}
      for (j = 0; j <= n; j++) {

        
        const analysis = await model.aggregate([
          {
            $facet: {
              correct: [
                {
                  $match: {
                    $and: [
                      { [`q${i}${String.fromCharCode(97+j)}`]: "correct" },
                      { section: `${section}` },
                      { terminal: `${terminal}` },
                    ],
                  },
                },
                { $count: "count" },
              ],
              incorrect: [
                {
                  $match: {
                    $and: [
                      { [`q${i}${String.fromCharCode(97+j)}`]: "incorrect" },
                      { section: `${section}` },
                      { terminal: `${terminal}` },
                    ],
                  },
                },
                { $count: "count" },
              ],
              notattempt: [
                {
                  $match: {
                    $and: [
                      { [`q${i}${String.fromCharCode(97+j)}`]: "notattempt" },
                      { section: section },
                      { terminal: `${terminal}` },
                    ],
                  },
                },
                { $count: "count" },
              ],
              correctabove50: [
                {
                  $match: {
                    $and: [
                      { [`q${i}${String.fromCharCode(97+j)}`]: "correctabove50" },
                      { section: section },
                      { terminal: `${terminal}` },
                    ],
                  },
                },
                { $count: "count" },
              ],
              correctbelow50: [
                {
                  $match: {
                    $and: [
                      { [`q${i}${String.fromCharCode(97+j)}`]: "correctbelow50" },
                      { section: section },
                      { terminal: `${terminal}` },
                    ],
                  },
                },
                { $count: "count" },
              ],
              
            },
          },
          {
            $project: {
              correct: {
                $ifNull: [{ $arrayElemAt: ["$correct.count", 0] }, 0],
              },
              incorrect: {
                $ifNull: [{ $arrayElemAt: ["$incorrect.count", 0] }, 0],
              },
              notattempt: {
                $ifNull: [{ $arrayElemAt: ["$notattempt.count", 0] }, 0],
              },
              correctabove50: {
                $ifNull: [{ $arrayElemAt: ["$correctabove50.count", 0] }, 0],
              },
              correctbelow50: {
                $ifNull: [{ $arrayElemAt: ["$correctbelow50.count", 0] }, 0],
              },
             
            },
          },
        ]);

        result.push({
          questionNo: `q${i}${String.fromCharCode(97+j)}`,
          correct: analysis[0].correct,
          wrong: analysis[0].incorrect,
          notattempt: analysis[0].notattempt,
          correctabove50: analysis[0].correctabove50,
          correctbelow50: analysis[0].correctbelow50,
        });
       
      }
    }

    result.sort((a, b) => b.wrong - a.wrong);
  
    res.render("analysis", {
      results: result,
      
      subjectname: subjectinput,
      studentClass,
      section,
      totalStudent,
      terminal,
    
    });
  } catch (err) {
    console.log(err);
  }
};

exports.termwisestatus = async (req,res,next)=>{
  res.render('termstatus')
};

exports.termwisedata = async (req,res,next)=>{
let term = [];
const {subjectinput,studentClass,section,status} = req.params; 
const model = getSubjectModel(subjectinput);
 
  const currentSubject = await subjectlist.find({'subject':`${subjectinput}`})
  const max = parseInt(currentSubject[0].max)
  try {
  for (let i = 1; i <= max; i++) {
    let n = currentSubject[0][i]
    if(currentSubject[0][i]===0){n=1}
    for (j = 0; j < n; j++) {
     
        const term1data = await model.find(
          {
            [`q${i}${String.fromCharCode(97+j)}`]: `${status}`,
            terminal: "first",studentClass:`${studentClass}`,section:`${section}`
          },
          { roll: 1, name: 1, _id: 0, [`q${i}${String.fromCharCode(97+j)}`]: 1 }
        );

        const term2data = await model.find(
          {
            [`q${i}${String.fromCharCode(97+j)}`]: `${status}`,
            terminal: "second",studentClass:`${studentClass}`,section:`${section}`
          },
          { roll: 1, name: 1, _id: 0, [`q${i}${String.fromCharCode(97+j)}`]: 1 }
        );
        const term3data = await model.find(
          {
            [`q${i}${String.fromCharCode(97+j)}`]: `${status}`,
            terminal: "third",studentClass:`${studentClass}`,section:`${section}`
          },
          { roll: 1, name: 1, _id: 0, [`q${i}${String.fromCharCode(97+j)}`]: 1 }
        );
        

        const incorrect2roll = new Set(term2data.map(item=>item.roll))
        const incorrect3roll = new Set(term3data.map(item=>item.roll))
        const common12 = term1data.filter(student=>incorrect2roll.has(student.roll))
        const count12 = common12.length
        const common13 = term1data.filter(student=>incorrect3roll.has(student.roll))
        const count13 = common13.length
        const common23 = term2data.filter(student=>incorrect3roll.has(student.roll))
        const count23 = common23.length
        const common123 = term1data.filter(student=>incorrect2roll.has(student.roll) && incorrect3roll.has(student.roll))
        const count123 = common123.length
        
        term.push({
          questionNo: `q${i}${String.fromCharCode(97+j)}`,
          data12:count12,
          data13:count13,
          data23:count23,
          data123:count123,
          namedata12:common12,
          namedata13:common13,
          namedata23:common23,
          namedata123:common123,

        });
      }
    }
    res.render('termwiseanalysis',{term,status})
  }catch(err)
  {
    console.log(err)
  }
  
};
exports.termdetail = async (req,res,next)=>
{
  const {subjectinput,studentClass,section,status,qno,terminal} = req.params;
  let term = [];
  const model = getSubjectModel(subjectinput);
   
    
    
    try {
    
       
          const term1data = await model.find(
            {
              [`${qno}`]: `${status}`,
              terminal: "first",studentClass:`${studentClass}`,section:`${section}`
            },
            { roll: 1, name: 1, _id: 0, [`${qno}`]: 1 }
          );
  
          const term2data = await model.find(
            {
              [`${qno}`]: `${status}`,
              terminal: "second",studentClass:`${studentClass}`,section:`${section}`
            },
            { roll: 1, name: 1, _id: 0, [`${qno}`]: 1 }
          );
          const term3data = await model.find(
            {
              [`${qno}`]: `${status}`,
              terminal: "third",studentClass:`${studentClass}`,section:`${section}`
            },
            { roll: 1, name: 1, _id: 0, [`${qno}`]: 1 }
          );
          
  
          const incorrect2roll = new Set(term2data.map(item=>item.roll))
          const incorrect3roll = new Set(term3data.map(item=>item.roll))
          const common12 = term1data.filter(student=>incorrect2roll.has(student.roll))
          
          const common13 = term1data.filter(student=>incorrect3roll.has(student.roll))
         
          const common23 = term2data.filter(student=>incorrect3roll.has(student.roll))
          
          const common123 = term1data.filter(student=>incorrect2roll.has(student.roll) && incorrect3roll.has(student.roll))
   
          
          term.push({
            questionNo: qno,
           
            namedata12:common12,
            namedata13:common13,
            namedata23:common23,
            namedata123:common123,
          });
          
          
      res.render('termdetail',{term,subjectinput,studentClass,section,status,qno,terminal})
    }catch(err)
    {
      console.log(err)
    }




}
exports.search = async (req, res, next) => {
  const { subject, studentClass, section, terminal } = req.params;
  const { roll } = req.body;

  const model = getSubjectModel(subject);
  const individualData = await model
    .find(
      {
        subject: `${subject}`,
        section: `${section}`,
        terminal: `${terminal}`,
        roll: roll,
        studentClass: `${studentClass}`,
      },
      { _id: 0, __v: 0 }
    )
    .lean();

  res.render("search", {
    individualData,
    subject,
    studentClass,
    section,
    terminal,
  });
};
exports.studentData = async (req, res, next) => {
  const { subjectinput, studentClass, section, qno, status, terminal } =
    req.params;
  model = getSubjectModel(subjectinput);
  const StudentData = await model.find({
    $and: [
      { [`${qno}`]: `${status}` },
      { section: `${section}` },
      { terminal: `${terminal}` },
    ],
  });

  res.render("studentdata", {
    subjectinput,
    qno,
    status,
    StudentData,
    studentClass,
    section,
    terminal,
  });
};


  exports.totalStudent = async (req, res, next) => {
    const { subjectinput, studentClass, section, terminal } = req.params;
    const model = getSubjectModel(subjectinput);
    const incorrectdata = [];
    
    try {
      const currentSubject = await subjectlist.find({ subject: subjectinput });
  
      if (!currentSubject || currentSubject.length === 0) {
        return res.status(404).json({ message: "Subject not found" });
      }
  
      const max = parseInt(currentSubject[0].max);
      
      for (let i = 1; i <= max; i++) {
        let n = currentSubject[0][i] || 1;  // Ensure n is at least 1
  
        for (let j = 0; j <= n; j++) {
          const incorrectname = await model.find({
            studentClass: studentClass,
            section: section,
            terminal: terminal,
            [`q${i}${String.fromCharCode(97 + j)}`]: "incorrect",
          });
  
          incorrectname.forEach(student => {
            incorrectdata.push({
              questionNo: `q${i}${String.fromCharCode(97 + j)}`,
              studentname: student.name,  // Extract names correctly
            });
          });
  
          console.log("Incorrect Students for", `q${i}${String.fromCharCode(97 + j)}`, incorrectname);
        }
      }
  
      const totalStudent = await model
        .find({ studentClass, section, terminal })
        .lean();
  
      res.render("totalstudent", {
        totalStudent,
        subjectinput,
        studentClass,
        section,
        terminal,
        incorrectdata,  // Pass incorrect answers list to the frontend
      });
  
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


exports.updateQuestion = async (req, res, next) => {
  const { no } = req.params;
  console.log(no);
};