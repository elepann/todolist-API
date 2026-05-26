const express = require('express');
const routes = express.Router();
const { verifyToken, validateCreateSchema, validateUpdateSchema } = require('../middleWare/middleWare.js');
const { registerUser, userLogin, getAllTasks, createTasks, deleteTasks, updateTasks, getSingleTasks } = require('../controller/itemController.js');
require('dotenv').config()

routes.post('/register', registerUser);
routes.post('/login', userLogin);
routes.get('/todos', verifyToken, getAllTasks);
routes.get('/todos/:id', verifyToken, getSingleTasks);
routes.post('/todos', verifyToken, validateCreateSchema, createTasks);
routes.delete('/todos/:id', verifyToken, deleteTasks);
routes.put('/todos/:id', verifyToken, validateUpdateSchema, updateTasks);

module.exports = routes;