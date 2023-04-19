const express = require('express');
const router = express.Router();
const register_controller = require('../controller/auth_account')

router.post('/register', register_controller.addAcount)
router.post('/login', register_controller.loginAccount)
router.get('/updateForm/:student_id', register_controller.updateForm)
router.post('/updateUser', register_controller.updateUser)
router.get('/deleteUser/:student_id', register_controller.deleteUser);
router.get('/logout', register_controller.logoutAccount)
router.get('/addStudentForm', register_controller.studentForm);
router.post('/addStudentForm', register_controller.addStudent);
router.get('/viewStudents', register_controller.toRecord);
module.exports = router;