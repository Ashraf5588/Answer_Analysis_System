const path = require('path')
const express = require('express')
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {rootDir} = require('../utils/path')
const {studentSchema} = require('../model/schema');
const {classSchema, subjectSchema} = require('../model/adminschema');
// const {subject} = require('../controller/admincontroller')
// const {studentClass} = require('../controller/admincontroller')
const subjectlist = mongoose.model('subjectlist',subjectSchema,'subjectlist');
const studentClass = mongoose.model('studentClass',classSchema,'classlist');
const { mongo } = require('mongoose');
// const subjects = await subject.find({})
// let availablesubject = ['math','science','english','computer','social','optmath','health']


app.set('view engine','ejs')
app.set('view',path.join(rootDir,'views'))



exports.homePage = async(req, res,next) => 
  {
     const subjects = await subjectlist.find({})
    res.render('index',{currentPage:'home',subjects})
}
exports.teacherPage = async(req,res,next)=>
  {
    const subjects = await subjectlist.find({})
    const {controller} = req.params;
    res.render('teacher',{controller,currentPage:'teacher',subjects})
  }

exports.studentclass = async(req,res,next)=>
{
  const studentClassdata = await studentClass.find({});
  
  const {subject,controller} = req.params;
 
  res.render('class',{subject,controller,studentClassdata})
}
exports.terminal = (req,res,next)=>
  {
    const {controller,subject,studentClass,section} = req.params;
    res.render('terminal',{subject,controller,studentClass,section})
  }
const getSubjectModel = (subjectinput) => {
  // to Check if model already exists
  if (mongoose.models[subjectinput]) {
      return mongoose.models[subjectinput];
  }
  return mongoose.model(subjectinput,studentSchema, subjectinput);
};

exports.showForm= async(req,res,next)=>
{
  const subjects = await subjectlist.find({})
  global.availablesubject = subjects.map((sub)=>sub.subject);
   
  const {subjectinput,studentClass,section,terminal} = req.params;
  if(!availablesubject.includes(subjectinput))
  {
    return res.render('404')
  }
  else
  {
    res.render('form',{subjectname:subjectinput,section,studentClass,terminal})
  }
}
exports.saveForm = async (req,res,next)=>
  {
    const {subjectinput} = req.params;
    console.log(subjectinput)
  if(!availablesubject.includes(subjectinput))
  {
    return res.render('404')
  }
  else
  {
    
    try
    {
      const model = getSubjectModel(subjectinput);
      await model.create(req.body)
      res.render('FormPostMessage',{subjectinput})
  }catch(err)
  {
    console.log(err)
  }  
  }
}

exports.findData= async(req,res)=>
  {
    try
    {
      const {subjectinput,studentClass,section,terminal,terminal2,terminal3} = req.params;
      const model = getSubjectModel(subjectinput);

const totalstudent = await model.aggregate([
  {$match:{$and:[{'section':`${section}`},{'terminal':`${terminal}`}]}},
  {$count: 'count'}
]);
const totalStudent = totalstudent.length > 0 && totalstudent[0].count 
  ? totalstudent[0].count 
  : 0;
console.log(totalStudent)

      let result = [];
      let term = [];
      question_list = ['a','b','c','d'];
      for (let i = 1; i <= 20; i++)
        {
        for(j=1;j<=4;j++)
        { 

  try
  {     

    const term1Incorrect = await model.find(
      { [`q${i}${question_list[j-1]}`]: 'incorrect', terminal: 'first' },
      { roll: 1, name: 1, _id: 0,[`q${i}${question_list[j-1]}`]:1 }
    );
    
    const term2Incorrect = await model.find(
      { [`q${i}${question_list[j-1]}`]: 'incorrect', terminal: 'second' },
      { roll: 1, name: 1, _id: 0, [`q${i}${question_list[j-1]}`]:1}
    );
    const term3Incorrect = await model.find(
      { [`q${i}${question_list[j-1]}`]: 'incorrect', terminal: 'third' },
      { roll: 1, name: 1, _id: 0 ,[`q${i}${question_list[j-1]}`]:1}
    );
    
    console.log(term1Incorrect)
    console.log(term2Incorrect)
    console.log(term3Incorrect)


    const firstSecondTerm= term1Incorrect.filter((data1)=>
    {
      const term1 = term2Incorrect.find((data2)=>{
        return data2.roll===data1.roll?true:false

      })

      return term1

    })
const firstThirdTerm = term1Incorrect.filter((data1)=>{

     const term13 =  term3Incorrect.find((data3)=>{
          data3.roll === data1.roll?true:false
      })
      return term13;
})
const secondThirdTerm = term2Incorrect.filter((data2)=>{

  const term23 =  term3Incorrect.find((data3)=>{
       data3.roll === data1.roll?true:false
   })
   return term23;
})
const firstSecondThirdTerm = term1Incorrect.filter((data1)=>{

  const term23 =  term3Incorrect.find((data3)=>{
       data3.roll === data1.roll?true:false
   })
   return term23;
})
console.log(firstSecondTerm)
console.log(firstThirdTerm)
    
    // Convert results into Map objects with roll as the key and name as the value
    // const term1Map = new Map(term1Incorrect.map(student => [student.roll, student.name]));
    // const term2Map = new Map(term2Incorrect.map(student => [student.roll, student.name]));
    
    // // Find intersection (rolls that exist in both maps)
    // const intersection = [...term1Map.keys()].filter(roll => term2Map.has(roll));
    
    // // Extract details of intersecting students (roll and name)
    // const intersectingStudents = intersection.map(roll => ({
    //   roll,
    //   name: term1Map.get(roll) // Name is the same in both terms; retrieve from term1Map
    // }));
    
    // console.log(`Students who made incorrect answers for q1a in both first and second terms:`, intersectingStudents);
    // console.log(term1Incorrect)
    // console.log(term2Incorrect)
    


        }catch(err)
        {
          console.log(err)
        }





       const analysis = await model.aggregate([
        {

          



          $facet:
          {
            correct: [
           {$match:{$and:[{[`q${i}${question_list[j-1]}`]:'correct'},{'section':`${section}`},
           {'terminal':`${terminal}`},
          ]}},
           {$count: 'count'}],
          incorrect: [
            {$match:{$and:[{[`q${i}${question_list[j-1]}`]:'incorrect'},{'section':`${section}`},
            {'terminal':`${terminal}`},
          ]}},
            {$count: 'count'}],
        notattempt: [
            {$match:{$and:[{[`q${i}${question_list[j-1]}`]:'notattempt'},{'section':section},
            {'terminal':`${terminal}`},
          ]}},
            {$count: 'count'}],
        incorrectTerminal: [
              {$match:{$and:[{[`q${i}${question_list[j-1]}`]:'incorrect','terminal':`${terminal}`},{'section':section},
              {[`q${i}${question_list[j-1]}`]:'incorrect','terminal':`${terminal2}`},
            ]}},
              {$count: 'count'}],
        correctTerminal: [
                {$match:{$or:[{[`q${i}${question_list[j-1]}`]:'correct'},{'section':section},
                {'terminal':`${terminal}`},{'terminal':`${terminal2}`},
              ]}},
                {$count: 'count'}],
        notattemptTerminal: [
                  {$match:{$or:[{[`q${i}${question_list[j-1]}`]:'notattempt'},{'section':section},
                  {'terminal':`${terminal}`},{'terminal':`${terminal2}`},
                ]}},
                  {$count: 'count'}],
            
            
          }
        },
        {
          
    $project:
          {
    correct: {$ifNull: [{$arrayElemAt: ["$correct.count",0]},0]},
  incorrect: {$ifNull:[{$arrayElemAt: ["$incorrect.count", 0]},0]},
notattempt:{$ifNull:[{ $arrayElemAt: ["$notattempt.count", 0]},0 ]},
incorrectTerminal:{$ifNull:[{ $arrayElemAt: ["$incorrectTerminal.count", 0]},0 ]},
correctTerminal:{$ifNull:[{ $arrayElemAt: ["$correctTerminal.count", 0]},0 ]},
notattemptTerminal:{$ifNull:[{ $arrayElemAt: ["$notattemptTerminal.count", 0]},0 ]},


          }
        }
        
       ]);

    result.push({
      questionNo: `q${i}${question_list[j-1]}`,
      correct:analysis[0].correct,
      wrong: analysis[0].incorrect,
      notattempt:analysis[0].notattempt,
      
  
      
    })
    term.push({
      questionNo: `q${i}${question_list[j-1]}`,
      terminal1: terminal,
      terminal2: terminal2,
      wrong:analysis[0].incorrectTerminal,
      correct:analysis[0].correctTerminal,
      notattempt:analysis[0].notattemptTerminal,


    })
  }}

  
   
    result.sort((a,b)=>b.wrong-a.wrong)
    term.sort((a,b)=>b.wrong-a.wrong)
   
    
    
    
 

    res.render('analysis',{results:result,term,subjectname:subjectinput,studentClass,section,totalStudent,terminal,terminal2,terminal3})
    }catch(err)
  {
    console.log(err)
  }
  
  
  }

exports.studentData = async (req,res,next)=>
  {
    const {subjectinput,studentClass,section,qno,status,terminal} = req.params;
    model = getSubjectModel(subjectinput)
    const StudentData = await model.find(
      {$and:[{[`${qno}`]:`${status}`},{'section':`${section}`},{'terminal':`${terminal}`}]})
    
    
    res.render('studentdata',{subjectinput,qno,status,StudentData,studentClass,section,terminal})
  } 
  
  exports.totalStudent = async (req,res,next)=>
    {
      const {subjectinput,studentClass,section,terminal,terminal2,terminal3} = req.params;
      model = getSubjectModel(subjectinput)
      
      
      const totalStudent = await model.find(
        {$and:[{'studentClass':`${studentClass}`},{'section':`${section}`},{'terminal':`${terminal}`}]})
        


      res.render('totalstudent',{totalStudent,subjectinput,studentClass,section,terminal,terminal2,terminal3})
    } 