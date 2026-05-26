const crypto = require('crypto');
const db = require("../config/db.js");
const jwt = require('jsonwebtoken');
const { generateToken } = require('../middleWare/middleWare.js');
const { hashing, pagination } = require('../utils/util.js');
require('dotenv').config();
const { createSchema, updateSchema } = require('../config/schema.js');

//controller untuk mendaftarkan and login user
const registerUser = (req, res) => {
    //inisiasi variable name, email sama password
    const { name, email, password } = req.body;

    //inisiasi sql
    const sql = 'INSERT INTO Users(user_name, user_email, user_password) VALUES(?, ?, ?)';

    //hasing
    const passwordForDB = hashing('sha256', password);

    //validasi kondisi password, email, name tidak terisi
    if (!name || !email || !password) {
        console.log("Error Input");
        return res.status(400).json({
            success: false,
            message: "Field Should Be Filed"
        });
    };

    db.query(sql, [name, email, passwordForDB], (err, result) => {
        if (err) {
            console.log(err.message);
            return res.status(500).json({ success: false, message: 'error db' });
        }

        res.status(201).json({
            success: true,
            message: 'Users Account Created',
        });
    });
};

const userLogin = (req, res) => {
    //inisiasi email dan password;
    const { email, password } = req.body;
    const hashedPassword = hashing('sha256', password); //generate hashed password

    //inisiasi sql
    const sql = "SELECT user_id, user_password FROM users WHERE user_email = ?"; //aviel@gmail.com -> user_id, user_password;

    
    
    //ngambil password 
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.log(err.message);
            return res.status(500).json({
                success: false,
                message: 'db query error',
                errMess: err.message
            });
        };
        
        //inisiasi JWT TOKEN
        const token = generateToken({ id: result[0].user_id, email: email }, process.env.PRIVATE_KEY, 'HS256');
        
        //validasi akun || email dan password
        if (result.length === 0) { //kondisi akun belom ada.
            console.log('account not found');
            return res.status(400).json({
                success: false,
                message: 'account not found'
            });
        }
        if (result[0].user_password !== hashedPassword) {
            console.log('wrong password input');
            return res.status(400).json({
                success: false,
                message: 'wrong password'
            });
        };
        return res.status(200).json({
            success: true,
            message: 'Login Succes',
            accessGranted: true,
            token: token
        });
    });
};

//CRUD Controller
const getAllTasks = (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const sql = 'SELECT * FROM Tasks';

    console.log(req.u); //buat ngasih identitas siapa yang punya token yang dikirim via header.

    db.query(sql, (err, result) => {
        //inisiasi data paginated
        const data = pagination(page, limit, result);

        if (err) {
            console.log(err.message);
            return res.status(500).json({
                success: false,
                message: 'db query error',
                errMess: err.message
            });
        };

        res.status(200).json({
            success: true,
            message: 'succesfully retrieved all tasks',
            data: data,
            page: page,
            limit: limit,
            total: data.length
        });
    });
};

const getSingleTasks = (req, res) => {
    const id = parseInt(req.params.id);
    const sql = 'select task_id, task_title, task_description from Tasks where task_id = ?';

    //sql execution
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err.message);
            return res.status(500).json({
                success: false,
                message: 'db query error',
                errMess: err.message
            });
        };

        res.status(200).json({
            success: true,
            message: 'Tasks Founded',
            data: result
        });
    });
};

const createTasks = (req, res) => {
    const { task_title, task_description } = req.body;
    const sql = 'insert into Tasks(task_title, task_description) values(?, ?)';

    db.query(sql, [title, description], (err, result) => {
        if (err) {
            console.log(err.message);
            return res.status(500).json({
                success: false,
                message: 'db query error',
                errMess: err.message
            });
        };

        res.status(201).json({
            success: true,
            message: 'tasks created',
        });
    });
};


//controller harus ada validasi user...
const deleteTasks = (req, res) => {
    const id = parseInt(req.params.id);
    const user = req.user;

    console.log(user);
    const sql = 'delete from Tasks where task_id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log('db query error');
            return res.status(500).json({
                success: false,
                message: 'db query error',
                errMess: err.message
            });
        };

        res.status(203).json({
            success: true,
            message: 'Tasks deleted'
        });
    });
};

//controller harus ada validasi user...
const updateTasks = (req, res) => {
    const id = parseInt(req.params.id);
    const { error } = updateSchema.validate(req.body);
    const rawData = req.body;
    //clean setClause
    const setClause = Object.entries(rawData).map((item) => item[0] + ` = ?`).join(', ');
    //value 
    const value = Object.entries(rawData).map(([_key, val]) => val).join(', ');
    const sql = `update Tasks set ${setClause} where task_id = ?`;

    if (error) {
        console.log(error.message);
        return res.status(401).json({
            success: false,
            message: 'validation error',
            errMess: error.message
        });
    };
    db.query(sql, [value, id], (err, result) => {
        if (err) {
            console.log(err.message);
            return res.status(500).json({
                success: false,
                message: 'db query error'
            });
        };

        res.status(200).json({
            success: true,
            message: 'Tasks Updated'
        });
    });
};


//exports module, controller. 
module.exports = { registerUser, userLogin, getAllTasks, createTasks, deleteTasks, updateTasks, getSingleTasks };