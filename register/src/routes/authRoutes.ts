import express from 'express';
import { importChatHistory, login, register } from '../controllers/authController';
import { upload } from '../middleWare/uploadFile';
import { verifyToken } from '../middleWare/verifyToken';

const router = express.Router();

// Register user route
router.post('/registerUser', register);
router.post('/login', login);
router.post('/importChatHistory',verifyToken, upload.single('file'), importChatHistory)



export default router;

