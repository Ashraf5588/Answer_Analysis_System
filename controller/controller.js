const path = require("path");
var docxConverter = require('docx-pdf');
const fs= require("fs");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { rootDir } = require("../utils/path");
const { studentSchema } = require("../model/schema");
const { classSchema, subjectSchema } = require("../model/adminschema");
const subjectlist = mongoose.model("subjectlist", subjectSchema, "subjectlist");
const studentClass = mongoose.model("studentClass", classSchema, "classlist");
const filePath = require("./admincontroller");

app.set("view engine", "ejs");
app.set("view", path.join(rootDir, "views"));
const getSubjectModel = (subjectinput) => {
  // to Check if model already exists
  if (mongoose.models[subjectinput]) {
    return mongoose.models[subjectinput];
  }
  return mongoose.model(subjectinput, studentSchema, subjectinput);
};

// Helper function to safely get subject data and handle errors with case insensitivity
const getSubjectData = async (subjectinput, res) => {
  try {
    
    
    // First try exact match
    let currentSubject = await subjectlist.find({'subject': `${subjectinput}`});
    
    // If no results, try case-insensitive search
    if (!currentSubject || currentSubject.length === 0) {
      // Try case-insensitive search using a regular expression
      currentSubject = await subjectlist.find({
        'subject': { $regex: new RegExp(`^${subjectinput}$`, 'i') }
      });
    }
    
    if (!currentSubject || currentSubject.length === 0) {
      // Check if any subjects exist at all
      const allSubjects = await subjectlist.find({}).lean();
      const subjectsList = allSubjects.map(s => s.subject).join(', ');
      
      if (res) {
        res.status(404).render('404', {
          errorMessage: `Subject '${subjectinput}' not found in the database. Available subjects: ${subjectsList || 'None'}`,
          currentPage: 'teacher'
        });
      }
      return null;
    }
    
  
    return currentSubject[0];
  } catch (err) {
    console.error(`Error in getSubjectData: ${err.message}`);
    if (res) {
      res.status(500).render('404', {
        errorMessage: `Server error while looking up subject '${subjectinput}': ${err.message}`,
        currentPage: 'teacher'
      });
    }
    return null;
  }
};
exports.homePage = async (req, res, next) => {
  const subject = await subjectlist.find({}).lean();
  

  res.render("index", { currentPage: "home",subjects:subject});
};


// Edit student (get data for the form)
exports.editStudent = async (req, res, next) => {
  const { studentId, subjectinput} = req.params;
  try {
    // Find student by ID
    const model = getSubjectModel(subjectinput);
    const studentToEdit = await model.findById(studentId).lean();
    
    if (!studentToEdit) {
      return res.status(404).render('404', {
        errorMessage: `Student record with ID ${studentId} not found`,
        currentPage: 'teacher'
      });
    }
    
    
    res.render("admin/edit-student", { student: studentToEdit });
  } catch (err) {
    console.error(`Error editing student: ${err.message}`);
    res.status(500).render('404', {
      errorMessage: `Error editing student: ${err.message}`,
      currentPage: 'teacher'
    });
  }
};

// Update student (save the modified data)
exports.updateStudent = async (req, res, next) => {
  const { studentId } = req.params;
  const updatedData = req.body;  // The updated data comes from the form
  
  try {
    // Find the student first to get the subject
    let subjectModel;
    let student;
    
    // Iterate through all subject collections
    const subjects = await subjectlist.find({}).lean();
    for (const subject of subjects) {
      const model = getSubjectModel(subject.subject);
      const foundStudent = await model.findById(studentId);
      if (foundStudent) {
        subjectModel = model;
        student = foundStudent;
        break;
      }
    }
    
    if (!subjectModel || !student) {
      return res.status(404).render('404', {
        errorMessage: `Student record with ID ${studentId} not found in any subject`,
        currentPage: 'teacher'
      });
    }
    
    // Update the student record
    await subjectModel.findByIdAndUpdate(studentId, updatedData, { new: true });
    
    // Redirect back to the student list
    res.redirect(`/totalStudent/${student.subject}/${student.studentClass}/${student.section}/${student.terminal}`);
  } catch (err) {
    console.error(`Error updating student: ${err.message}`);
    res.status(500).render('404', {
      errorMessage: `Error updating student: ${err.message}`,
      currentPage: 'teacher'
    });
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
  const forClass = req.params.studentClass;
  const subjects = await subjectlist.find({'forClass':`${forClass}`}).lean();
  console.log(subjects);
 
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

    
//    docxConverter('./../aes/uploads/question.docx','./../aes/public/output.pdf',function(err,result){

//   if(err){
//     console.log(err);
//   }
//   //remove file after conversion
//   fs.unlink('./../aes/public/question.docx', (err) => {
//     if (err) {
//       console.error('Error deleting file:', err);
//     }
//   });

//   console.log('result'+result);
// });
    
   
    const subjectData = await getSubjectData(subjectinput, res);
    
    
    if (!subjectData) {
      console.log(`No subject data found for ${subjectinput}`);
      return;
    }
    
    const model = getSubjectModel(subjectinput);

   



//check the data of collection social
    




const paper = await subjectlist.findOne({ subject: subjectinput ,class: studentClass}, { questionPaperOfClass: 1 }).lean().questionPaperOfClass;




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
    // let obtained=[];
    let Correct=[], inCorrect=[], fifty=[], CorrectAbove50=[], CorrectBelow50=[];
    const max = parseInt(subjectData.max)

    for (let i = 1; i <= max; i++) {
      let n = subjectData[i][0]
      if(subjectData[i]===0){n=1}
      for (j = 0; j < n; j++) {
          
           let fullMarks=parseFloat(subjectData[i.toString()][j+1]) 
             let s= 0;
 const data = await model.find({}, { _id: 0, __v: 0 }).lean();
 data.forEach((item) => {
  
    s=s+item[`q${i}${String.fromCharCode(97+j)}`];
    


 })

 const inCorrectData = await model.find({
  subject: `${subjectinput}`,studentClass: `${studentClass}`, section: `${section}`, terminal: `${terminal}`,
  [`q${i}${String.fromCharCode(97+j)}`]: 0,
}, { _id: 0,[`q${i}${String.fromCharCode(97+j)}`]:1,name:1,roll:1 }).lean();
inCorrect.push({
 qno: `q${i}${String.fromCharCode(97+j)}`,
 studentName: inCorrectData.map(item => item.name),
 total: inCorrectData.length,
  fullMarks: fullMarks,
obtainedMarks:inCorrectData.map(item=>item[`q${i}${String.fromCharCode(97+j)}`]),
});
const CorrectData = await model.find({
  subject: `${subjectinput}`,studentClass: `${studentClass}`, section: `${section}`, terminal: `${terminal}`,
  [`q${i}${String.fromCharCode(97+j)}`]: fullMarks,
}, { _id: 0,[`q${i}${String.fromCharCode(97+j)}`]:1,name:1,roll:1 }).lean();
Correct.push({
  qno: `q${i}${String.fromCharCode(97+j)}`,
  studentName: CorrectData.map(item => item.name),
  total: CorrectData.length,
  fullMarks: fullMarks,
  obtainedMarks:CorrectData.map(item=>item[`q${i}${String.fromCharCode(97+j)}`]),
});
const fiftyData = await model.find({
  subject: `${subjectinput}`,studentClass: `${studentClass}`, section: `${section}`, terminal: `${terminal}`,
  [`q${i}${String.fromCharCode(97+j)}`]:  0.5 * fullMarks,
}, { _id: 0,[`q${i}${String.fromCharCode(97+j)}`]:1,name:1,roll:1 }).lean();

fifty.push({
  qno: `q${i}${String.fromCharCode(97+j)}`,
  studentName: fiftyData.map(item => item.name),
  total: fiftyData.length,
  fullMarks: fullMarks,
  obtainedMarks:fiftyData.map(item=>item[`q${i}${String.fromCharCode(97+j)}`]),
});

const CorrectAbove50Data = await model.find({
  subject: `${subjectinput}`,studentClass: `${studentClass}`, section: `${section}`, terminal: `${terminal}`,
  [`q${i}${String.fromCharCode(97+j)}`]: { $gt: 0.5 * fullMarks, $lt: fullMarks },
}, { _id: 0,[`q${i}${String.fromCharCode(97+j)}`]:1,name:1,roll:1 }).lean();
CorrectAbove50.push({ 
  qno: `q${i}${String.fromCharCode(97+j)}`,
  studentName: CorrectAbove50Data.map(item => item.name),
  total: CorrectAbove50Data.length,
  fullMarks: fullMarks,
  obtainedMarks:CorrectAbove50Data.map(item=>item[`q${i}${String.fromCharCode(97+j)}`]),
});
const CorrectBelow50Data = await model.find({
  subject: `${subjectinput}`,studentClass: `${studentClass}`, section: `${section}`, terminal: `${terminal}`,
  [`q${i}${String.fromCharCode(97+j)}`]: { $lt: 0.5 * fullMarks, $gt: 0 },
}, { _id: 0,[`q${i}${String.fromCharCode(97+j)}`]:1,name:1,roll:1 }).lean();

CorrectBelow50.push({
  qno: `q${i}${String.fromCharCode(97+j)}`,
  studentName: CorrectBelow50Data.map(item => item.name),
  total: CorrectBelow50Data.length,
  fullMarks: fullMarks,
  obtainedMarks:CorrectBelow50Data.map(item=>item[`q${i}${String.fromCharCode(97+j)}`]),
});

       const analysis = await model.aggregate([
         {
           $facet: {
             correct: [
               {
                 $match: {
                   $and: [
                      { [`q${i}${String.fromCharCode(97+j)}`]: fullMarks },
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
                      { [`q${i}${String.fromCharCode(97+j)}`]: 0 },
                      { section: `${section}` },
                      { terminal: `${terminal}` },
                    ],
                  },
                },
                { $count: "count" },
              ],
              averageMarks: [
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
                      { [`q${i}${String.fromCharCode(97+j)}`]: { $gt: 0.5 * fullMarks, $lt: fullMarks } },
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
                      { [`q${i}${String.fromCharCode(97+j)}`]: { $lt: 0.5 * fullMarks, $gt: 0 } },
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
          fullMarks
        });
       
      }
    }

    result.sort((a, b) => b.wrong - a.wrong);
    
   
// showing q1a = incorrect student name





    const allArr = [];


  for (let i = 1; i <= max; i++) {
    let n = subjectData[i]
    if(subjectData[i]===0){n=1}
    for (j = 0; j < n; j++) {

  const incorrectStudentData = await model.find({subject:`${subjectinput}`,section:`${section}`,terminal:`${terminal}`,studentClass:`${studentClass}`,[`q${i}${String.fromCharCode(97+j)}`]:'incorrect'})
allArr.push({
  questionNo: `q${i}${String.fromCharCode(97+j)}`,
  studentClass: studentClass,
  section: section,
  terminal: terminal,
  studentname:incorrectStudentData.name
    });
}

  }



const totalcountmarks = await model.find({ subject: `${subjectinput}`, section: `${section}`, terminal: `${terminal}`, studentClass: `${studentClass}` },
      { roll: 1, name: 1 ,totalMarks: 1,_id:0}).lean();

    res.render("analysis", {
      results: result,
      totalcountmarks,
      subjectname: subjectinput,
      studentClass,
      section,
      totalStudent,
      terminal,
      Correct,
      inCorrect,  
      fifty,
      CorrectAbove50,
      CorrectBelow50,
      paper,
    
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
 
  // Use the helper function to safely get subject data
  const subjectData = await getSubjectData(subjectinput, res);
  
  // If subject data is null, the helper function has already sent a response
  if (!subjectData) {
    return;
  }
    const max = parseInt(subjectData.max)
  try {
  for (let i = 1; i <= max; i++) {
    let n = subjectData[i]
    if(subjectData[i]===0){n=1}
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
   
  // Explicitly extract questionNo from the route parameter qno for the view
  const questionNo = qno;
    
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
          
          
      res.render('termdetail',{term,subjectinput,studentClass,section,status,qno,terminal,questionNo})
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
      // Use the helper function to safely get subject data
      const subjectData = await getSubjectData(subjectinput, res);
      
      // If subject data is null, the helper function has already sent a response
      if (!subjectData) {
        return;
      }
  
      const max = parseInt(subjectData.max);
      
      for (let i = 1; i <= max; i++) {
        let n = subjectData[i] || 1;  // Ensure n is at least 1
  
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
  
};