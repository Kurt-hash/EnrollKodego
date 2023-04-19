const encrypt = require('bcrypt');
const mySql = require('mysql2');
const jwt = require('jsonwebtoken');
const db = mySql.createConnection({
    host : process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT 
});

exports.addAcount = (req,res) => {
    // console.log(req.body)
    // res.send('Form_Submitted');
    // let first_name = req.body.first_name
    // let last_name = req.body.last_name
    // let email = req.body.email
    // let password = req.body.password

    let { email, password, conpassword} = req.body;

    db.query('SELECT * FROM user WHERE email = ?', email,
    async (err, result) => {
        if (err) {
            console.log('Error MESSAGE:' + err)
        }
        else {
            if (result.length > 0){
                console.log(result);
                res.render('register', {
                    message : "Email Already Exist"
                })
            }
            else{
                if(password != conpassword){
                    res.render('register', {
                        message : "Password does not match"
                    })
                }
                else{
                    const hashPassword = await encrypt.hash(password, 8)
                    console.log(hashPassword)

                db.query ('INSERT INTO user SET ?', { email: email, password : hashPassword},
                (err, result) => {
                    if (err) {
                        console.log('Error' + err);
                    }
                    else {
                        console.log(result);
                        res.render('register', {
                            message : "User Account Has Been Added Successfully"
                        })
                    }
                })
            }
            }
        }
    })

}

exports.loginAccount = async (req, res) => {
    // let isAdmin = req.session.isAdmin;
    try {
        const {email, password} = req.body 
            if (email == ''){
                res.render('index', {message: "Fields should not be empty"});
        } else {
            db.query('SELECT * FROM user WHERE email = ?',
                [email],
                async (err, result) => {
                    if (!result[0]) {
                        res.render('index', {
                            message: "Email is incorrect!"
                        })
                    } else if (!(await encrypt.compare(password, result[0].password))) {
                        res.render('index', {
                            message: "Password is Incorrect"
                        })
                    } 

                    db.query(`CALL get_student_info()`,
                            (err, result) => {
                                if (err) {
                                    console.log(`Error: ${err}`);
                                } else if (!result[0]) {
                                    res.render('viewStudents', {
                                        // admin: isAdmin,
                                        message: "No result found!"
                                    });
                                } else {
                                    res.render('viewStudents', {
                                        // admin: isAdmin,
                                        title: "List of Users",
                                        data: result
                                    })
                                }
                            }
                        )
                    }
                
            );
        }
    } catch (err) {
        console.log(`Error: ${err}`);
    }
}


exports.updateForm = (req, res) => {
    const student_id = req.params.student_id; 
    console.log(student_id)
    db.query('SELECT * FROM students WHERE student_id = ?', [student_id],
    (err, data) => {
        if (err) {
            console.log("Error:" + err)
        }
        else {
            res.render('updateForm', {
                title: "Update User Account",
                data: data[0]
            });
        }
    })
}

exports.updateUser = (req, res) => {
    const isAdmin = req.session.isAdmin;
    const {first_name, last_name, student_id} = req.body;

    db.query(`UPDATE students SET first_name = ?, last_name = ?, course_id = ? WHERE student_id = ?`,
    [first_name, last_name, course_id, student_id],
    (err,data) => {
        if (err){
            console.log("Error:", + err)
        }
        else {
            db.query(`CALL get_student_info();`,
            (err,data) => {
                if (err){
                    console.log('Error:', + err)
                }
                else if (!data[0]) {
                    res.render('viewStudents', {
                        message: 'No results found'
                    })
                }
                else {
                    res.render('viewStudents', {
                        admin: isAdmin,
                        title: 'List of students',
                        data: data[0]
                    } )
                }
            })
        }
    })
}

exports.deleteUser = (req, res) => {

   const student_id = req.params.student_id;
   const isAdmin = req.session.isAdmin;
   console.log(student_id);

    db.query('DELETE FROM students WHERE student_id = ?',
    [student_id],
    (err, data) => {
        if (err) {
            console.log("Error", + err);
        }
        else {
            db.query('SELECT * FROM students',
            (err, result) => {
                if (err) {
                    console.log('Error:', + err)
                }
                else if (!result[0]) {
                    res.render('viewStudents', {
                        admin: isAdmin,
                        message: "No result found!"
                    });
                }
                else {
                    res.render('viewStudents', {
                        admin: isAdmin,
                        title: "List of students",
                        data: result
                    })
                }
            }
            )
        }
    
    })
}
exports.studentForm = (req, res) => {
    res.render('addStudent', {
        message: "Add Student"
    })
}

exports.addStudent = (req, res) => {
    let { first_name, last_name, email, course_id } = req.body;
    first_name = first_name.trim().charAt(0).toUpperCase() + first_name.trim().slice(1);
   last_name = last_name.trim().charAt(0).toUpperCase() + last_name.trim().slice(1);
   

    if (!first_name || !last_name || !email || !course_id) {
        return res.render('addStudent', {
            message: "Please fill in all fields"
        });
    }

    db.query(`CALL add_student(?, ?, ?, ?)`,
        [first_name, last_name, email, course_id],
        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.render(`addStudent`, {
                    message: "Success!"
                })
            }
        })
}

exports.toRecord = (req, res) => {
    const isAdmin = req.session.isAdmin;

    db.query(`CALL get_student_info();`,
        (err, result) => {
            if (err) {
                console.log(`Error: ${err}`);
            } else if (!result[0]) {
                res.render('studentsRecord', {
                    message: "No result found!"
                });
            } else {
                res.render('studentsRecord', {
                    admin: isAdmin,
                    title: "List of Students",
                    data: result[0]
                })
            }
        }
    )
}

exports.logoutAccount = (req, res) => {
    console.log(req.session);
    // if (req.session) {
    //     req.session.destroy((error) => {
    //         if (error) {
    //             res.status(400).send("Unable to logout!");
    //         } else {

    //         }
    //     })
    // } else {
    //     console.log(`No Session!`);
    //     res.end();
    // }

    res.clearCookie("cookie_access_token").status(200);
    res.render('index');
}