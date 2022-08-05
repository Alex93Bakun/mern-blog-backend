import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';

import { getMe, login, register } from './controllers/UserController.js';
import { create, getAll, getOne, remove, update } from './controllers/PostController.js';
import { loginValidation, postCreateValidation, registerValidation } from './validations.js';
import { checkAuth, handleValidationErrors } from './utils/index.js';

mongoose
    .connect(
        'mongodb+srv://admin:admin@cluster0.fdnfe.mongodb.net/blog?retryWrites=true&w=majority',
    )
    .then(() => {
        console.log('DB connected');
    })
    .catch((err) => {
        console.log('DB error', err);
    });

const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.post('/auth/login', loginValidation, handleValidationErrors, login);
app.post('/auth/register', registerValidation, handleValidationErrors, register);
app.get('/auth/me', checkAuth, getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
});

app.get('/posts', getAll);
app.get('/posts/:id', getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, create);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, update);
app.delete('/posts/:id', checkAuth, remove);

app.listen(4000, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Server started on port 4000');
});
