// promise-mysql will handle callback functions as promises instead
var mysql = require('promise-mysql')

// variable to store pool result
var pool;
// Pool created for multiple user access
mysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'collegedb'
})
    .then((result) => {
        pool = result
    })
    .catch((error) => {
        console.log(error)
    });

    // made this function more flexible to take a table as a parameter 
var getModules = function () {
    // This function promise, returns another promise and everything remains async - returns an array
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'select * from  ??',
            values: ['module']
        }
        pool.query(myQuery)
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            });
    })
}

var editModule = function(mod_Name, mod_Credits, mod_ID){
    return new Promise((resolve, reject) => {
        // Putting a query inside an object which in turn gets passed below (protects entry) values match the ?(s)
        var myQuery = {
            sql: 'update module set name = ?, credits = ? where mid = ?',
            values: [mod_Name, mod_Credits, mod_ID]
        }
        pool.query(myQuery)
        .then((result) => {
            // Resolving the surrounding promise with the result of another promise
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        });
    })
}

// Student display function within module link clicked
var studentDisp = function(mod_ID){
    return new Promise((resolve, reject) => {
        // Putting a query inside an object which in turn gets passed below (protects entry) values match the ?(s)
        var myQuery = {
            sql: 'select s.sid, s.name, s.gpa from student s inner join student_module m on s.sid = m.sid where m.mid = ?',
            values: [mod_ID]
        }
        pool.query(myQuery)
        .then((result) => {
            // Resolving the surrounding promise with the result of another promise
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        });
    })
}

// Get student function, returns an array to display
var getStudents = function () {
    // This function promise, returns another promise and everything remains async - returns an array
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'select * from ?? order by sid',
            values: ['student']
        }
        pool.query(myQuery)
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            });
    })
}

// Delete student functions
var deleteStudent = function (sID) {
    // This function promise, returns another promise and everything remains async - returns an array
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'delete from student where sid = ?',
            values: [sID]
        }
        pool.query(myQuery)
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            });
    })
}

var addStudent = function (sID, sName, sGpa) {
    // This function promise, returns another promise and everything remains async - returns an array
    // insert into student values (g999, "Bill Bill", 1.1);
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'insert into student values (?, ?, ?)',
            values: [sID, sName, sGpa]
        }
        pool.query(myQuery)
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            });
    })
}

// Exporting functions for exterior use
module.exports = { getModules, editModule, studentDisp, getStudents, deleteStudent, addStudent }
