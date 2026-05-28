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
    const { user_name, user_email, user_password } = req.body;

    //inisiasi sql
    const sql = 'INSERT INTO Users(user_name, user_email, user_password) VALUES(?, ?, ?)';

    //hashing
    const passwordForDB = hashing('sha256', user_password);

    //validasi kondisi password, email, name tidak terisi
    if (!user_name || !user_email || !user_password) {
        console.log("Error Input");
        return res.status(400).json({
            success: false,
            message: "Field Should Be Filed"
        });
    };

    db.query(sql, [user_name, user_email, passwordForDB], (err, result) => {
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
    const { user_email, user_password } = req.body;
    const hashedPassword = hashing('sha256', user_password);
    const sql = 'select user_id, user_password from users where user_email = ?';

    db.query(sql, [user_email], (err, result) => {
        if (err) {
            console.log("db query error");
            return res.status(500).json({
                success: false,
                message: 'db query error'
            });
        };

        
        if (result.length === 0) {
            console.log("account not found");
            return res.status(404).json({
                success: false,
                message: 'account not found',
            });
        }else {
            //validasi password user.
            if (result[0].user_password !== hashedPassword) {
                console.log('wrong password input');
                return res.status(404).json({
                    success: false,
                    message: "wrong password input"
                });
            };
            
            //inisialisasi token JWT
            const token = generateToken({ id: result[0].user_id, email: user_email}, process.env.PRIVATE_KEY, 'HS256')
            
            return res.status(200).json({
                success: true,
                message: 'Login Successful',
                token: token
            });
        };
    });
};


//CRUD Controller
const getAllTasks = (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const sql = 'SELECT * FROM Tasks';

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

    //inisiasi user_id
    const user_id = parseInt(req.user.id);
    const sql = 'insert into Tasks(task_title, task_description, Created_By) values(?, ?, ?)';

    db.query(sql, [task_title, task_description, user_id], (err, result) => {
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
    const task_id = parseInt(req.params.id);
    const user_id = parseInt(req.user.id);
    const sql = 'SELECT Created_By FROM Tasks WHERE Task_id = ?'; //output: user_id yang buat task dengan id Task_id;

    db.query(sql, [task_id], (err, result) => {
        if (err) {
            console.log(err.message);
            return res.status(500).json({
                success: false,
                message: 'db query error',
                errMess: err.message
            });
        };
        if (result[0].Created_By !== user_id) {
            console.log('Forbidden access');
            return res.status(403).json({
                success: false,
                message: "forbidden access"
            });
        };

        //inisiasi sql delete
        const deleteSql = 'delete from Tasks where Task_id = ?';

        db.query(deleteSql, [task_id], (err, result) => {
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
    });

};

//controller harus ada validasi user...
const updateTasks = (req, res) => {
    const task_id = parseInt(req.params.id);
    const { error } = updateSchema.validate(req.body);
    const user_id = req.user.id;

    //clean setClause
    //inisiasi value
    const rawData = req.body;
    const setClause = Object.entries(rawData).map((item) => item[0] + ` = ?`).join(', ');
    const value = Object.entries(rawData).map(([_key, val]) => val).join(', ');

    //inisiasi sql select dan update;
    const sql = 'select Created_By from Tasks where task_id = ?';
    const updateSql = `update Tasks set ${setClause} where Task_id = ${task_id}`;

    //validasi input error via schema
    if (error) {
        console.log(error.message);
        return res.status(401).json({
            success: false,
            message: 'validation error',
            errMess: error.message
        });
    };

    //eksekusi query
    db.query(sql, [task_id], (err, result) => {
        if (err) {
            console.log(err.message, "db query error");
            return res.status(500).json({
                success: false,
                message: 'db query error',
                errMess: err.message
            });
        };

        if (result[0].Created_By !== user_id) {
            console.log("forbidden access");
            return res.status(403).json({
                success: false,
                message: 'forbidden access'
            });
        };

        db.query(updateSql, [value], (err, result) => {
            if (err) {
                console.log('update query error');
                return res.status(500).json({
                    success: false,
                    message: 'db update query error'
                });
            };

            res.status(200).json({
                success: true,
                message: 'Task Updated'
            });
        });
    });
};


//exports module, controller. 
module.exports = { registerUser, userLogin, getAllTasks, createTasks, deleteTasks, updateTasks, getSingleTasks };