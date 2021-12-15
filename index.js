// Import express
var express = require('express')
// Import ejs
var ejs = require('ejs')
// Import body-parser
var bodyParser = require('body-parser')
// Getting handle of mySQLDAO file
var dao = require('./mySQLDAO')
// Getting handle on mongoDAO
var mDAO = require('./mongoDAO')
// Handle on express
var app = express()
// Use body-parser
app.use(bodyParser.urlencoded({ extended: false }))
// Import vaidator
const { body, validationResult, check } = require('express-validator');

// using ejs via app - npm install ejs - NOTE no need to require it
app.set('view engine', 'ejs')

// Homepage - /
app.get('/', (req, res)=>{
    // Returns the html file to display
    res.sendFile(__dirname + "/views/homepage.html")
})


app.get('/module', (req, res)=>{
    var mod = 'module'
    // This function returns a promise, need a promise here to handle two situations
    dao.getModules()
    .then((result)=>{
        // render showStudents.ejs, students variable in ejs with our result
        res.render('showModules', {details:result})
    })
    .catch((error)=>{
        res.send(error)
    })
})

app.get('/module/edit/:mID', (req, res) => {
    // Using find() to search through my array and comparing them to the passed parameter object
    dao.getModules()
    .then((result)=>{
        var e = result.find((entry)=>{
            if(entry.mid == req.params.mID){
                return entry
            }
        })
        // Now I have my correct entry, I use the variable to pre define the updateModule.ejs
        res.render("updateModule", {mid:e.mid, moduleName:e.name, moduleCredits:e.credits, errors:undefined })
    })
    .catch((error)=>{
        res.send(error)
    })
})

app.post('/updateModule', 
    // Express validator at work, checking fields of entry
    [check('name').isLength({min:5}).withMessage("Module name must be at least 5 characters"),
    check('credits').isIn([5,10,15]).withMessage("The Credits should be 5, 10 or 15")],
     (req, res) =>{
        var errors = validationResult(req)
        if (!errors.isEmpty()){
            res.render("updateModule", {mid:req.body.module, moduleName:req.body.name, moduleCredits:req.body.credits, errors:errors.errors })
        } else{
            dao.editModule(req.body.name, req.body.credits, req.body.module)
            res.redirect('/module')
        }
})

// Student link within module page
app.get('/module/students/:mID', (req, res)=>{
    dao.studentDisp(req.params.mID)
    .then((result)=>{
        // sending back the result of my query
        res.render('showStudent', {details:result, module:req.params.mID})
    })
    .catch((error)=>{
        res.send(error)
    })
})

app.get('/listStudents', (req, res)=>{
    var mod = 'module'
    // This function returns a promise, need a promise here to handle two situations
    dao.getStudents()
    .then((result)=>{
        // render listStudents.ejs, students variable in ejs with our result
        res.render('listStudents', {details:result})
    })
    .catch((error)=>{
        res.send(error)
    })
})

// Delete student clicked
app.get('/student/delete/:sID', (req, res) => {
    // Using find() to search through my array and comparing them to the passed parameter object
    dao.deleteStudent(req.params.sID)
    .then((result)=>{
        // If delete was successful, user gets returned to the student lists page
        res.redirect("/listStudents")
    })
    .catch((error)=>{
        // Delete unsuccessful, error message will be displayed with a link below it to return to homepage
        res.send('<h3>Error Message</h3><br><h2>'+ req.params.sID + 
        ' has associated modules, he/she cannot be deleted</h2><br><a href="/">Home</a>')
        console.log(error)
    })
})

// Add student cliked, page to add is rendered
app.get('/addStudent', (req, res)=>{
    res.render("addStudent", {errors:undefined, errorsTwo:undefined, studentID:undefined, name:undefined, gpa:undefined})
})

app.post('/addStudent', 
    // Express validator at work, checking fields of entry
    [check('studentID').isLength({min:4, max:4}).withMessage("Student ID must be 4 characters"),
    check('name').isLength({min:5}).withMessage("Name must be at least 5 characters"),
    check('gpa').isFloat({min:0.0, max:4.0}).withMessage("The GPA should be between 0.0 & 4.0")],
     (req, res) =>{
        var errors = validationResult(req)
        // Note both the if and the else have their own handles on unique error displays
        if (!errors.isEmpty()){
            res.render("addStudent", { errors:errors.errors, errorsTwo:undefined, studentID:req.body.studentID, name:req.body.name, gpa:req.body.gpa})
        } else{
            dao.addStudent(req.body.studentID, req.body.name, req.body.gpa)
            .then(()=>{
                res.redirect("/listStudents")
            })
            .catch((error)=>{
                var errorString = ("Error: " + error.code + " " + error.sqlMessage + ".")
                res.render("addStudent", {errors:undefined, errorsTwo:errorString, studentID:req.body.studentID, name:req.body.name, gpa:req.body.gpa})
            })
        }
})

// mDao function returns all the lecturers information and details are passed to showLecturers page
app.get('/listLecturers', (req, res)=>{
    mDAO.findLecturers()
        .then((result)=>{
            res.render("showLecturers", {allData:result})
        })
        .catch((error)=>{
        })
})

// add lecture clicked, render page with initial undefined values
app.get('/addLecturer', (req, res)=>{
    res.render("addLecturer", {errors:undefined, errorsTwo:undefined, _id:undefined, name:undefined, dept:undefined})
})

app.post('/addLecturer', 
    // Express validator at work, checking fields of entry
    [check('_id').isLength({min:4}).withMessage("Lecturer ID must be 4 characters"),
    check('name').isLength({min:5}).withMessage("Name must be at least 5 characters"),
    check('dept').isLength({min:3, max:3}).withMessage("Dept must be 3 characters")],
     (req, res) =>{
        var errors = validationResult(req)
        
        // Note both the if and the else have their own handles on unique error displays
        if (!errors.isEmpty()){
            res.render("addLecturer", { errors:errors.errors, errorsTwo:undefined, _id:req.body._id, name:req.body.name, dept:req.body.dept })
        }
        else{
            mDAO.findDept(req.body.dept)
            // Checking if there is any values returned, zero if non so it will trigger "Dept doesn't exist"
            .then((result)=>{
                if(result.length == 0)
                {
                    var errorString = ("Dept doesn't exist")
                    res.render("addLecturer", {errors:undefined, errorsTwo:errorString, _id:req.body._id, name:req.body.name, dept:req.body.dept })
                }
                else{
                    // all checks are passed, adding new lecturer
                    mDAO.addLecturer(req.body)
                    .then(()=>{
                        res.redirect('/listLecturers')
                    })
                    .catch((err)=>{
                        // Error E11000 is a duplicate key error. This will notify the user and render the screen with message
                        if(err.message.includes("E11000")){
                            var errorString = ("_id already exists")
                            res.render("addLecturer", {errors:undefined, errorsTwo:errorString, _id:req.body._id, name:req.body.name, dept:req.body.dept })
                        }
                    })
                }
            })
            .catch((err)=>{
                console.log(err)
            })
        }
})

// Now listenning on port 3000
app.listen(3000, ()=>{
    console.log("Listening on port 3000")
})
// Author: David Mulhern - G00268549