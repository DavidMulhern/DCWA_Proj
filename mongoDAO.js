const MongoClient = require('mongodb').MongoClient

var coll;

MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser: true, useUnifiedTopology: true})
    .then((client) => {
        db = client.db('lecturersDB')
        coll = db.collection('lecturers')
    })
    .catch((error) => {
        console.log(error.message)
    })


    // Function to return all lecturer information
    function findLecturers(){
        return new Promise((resolve, reject)=>{
            var cursor = coll.find()
            cursor.toArray()
                .then((data)=>{
                    resolve(data)
                })
                .catch((error)=>{
                    reject(error)
                })
        })
    }

    // Function to add lecturer to mongoDB
    function addLecturer(lecturer){
        return new Promise((resolve, reject)=>{
            coll.insertOne(lecturer)
                .then((data)=>{
                    resolve(data)
                })
                .catch((error)=>{
                    reject(error)
                })
        })
    }

// Function which ensures that "a new" dept is not added. This will return, the .length will in turn be checked
    function findDept(bodyIn){
        return new Promise((resolve, reject)=>{
            var cursor = coll.find({dept:bodyIn})
            cursor.toArray()
                .then((data)=>{
                    resolve(data)
                })
                .catch((error)=>{
                    reject(error)
                })
        })
    }

    // Exporting functions for exterior use
    module.exports = {findLecturers, addLecturer, findDept}
