const jwt = require('jsonwebtoken');
const { createSchema, updateSchema } = require('../config/schema.js');

// function untuk buat token based on data dan privateKey
const generateToken = (data, privateKey, algorithm) => {
    return jwt.sign(data, privateKey, { algorithm });
};

const verifyToken = (req, res, next) => {
    const authHead = req.headers['authorization'];
    const token = authHead && authHead.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'token not found, unauthorized',
            success: false
        });
    };

    jwt.verify(token, process.env.PRIVATE_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({
                message: 'token invalid',
                success: false
            });
        };

        req.u = user; //ngasih ktp, identitas buat si token. dia verify token, decode token, lalu nempelin isi token ke req.user. jadi bisa dipake buat authorized nanti.
        next();
    });
};

const validateCreateSchema = (req, res, next) => {
    const { error } = createSchema.validate(req.body);
    if (error) {
        console.log(error.message);
        return res.status(400).json({
            success: false,
            message: 'create validation error'
        });
    };

    next();
};

const validateUpdateSchema = (req, res, next) => {
    const { error } = updateSchema.validate(req.body);
    if (error) {
        console.log(error.message);
        return res.status(400).json({
            success: false,
            message: 'update validation error'
        });
    };

    next();
};

module.exports = { generateToken, verifyToken, validateCreateSchema, validateUpdateSchema };