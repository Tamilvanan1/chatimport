import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { dataBase } from '../config/db';
import jwt from 'jsonwebtoken';
import path from 'path';
import * as XLSX from 'xlsx';
import fs from 'fs';

type UserInput = {
    userName: string;
    email: string;
    password: string;
};

type LoginInput = {
    email: string;
    password: string;
};

type ChatMessage = {
    sender: string;
    receiver: string;
    message: string;
};

// Register a new user
const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userName, email, password }: UserInput = req.body;

        if (!userName || !email || !password) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        const [getUser] = await dataBase.query('SELECT email FROM users WHERE email = ?', [email]);
        const existingUser = getUser as { email: string }[];

        if (existingUser.length > 0) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await dataBase.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [userName, email, hashedPassword]
        );

        const { insertId: userId } = result as { insertId: number };

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            res.status(500).json({ message: 'Missing JWT secret' });
            return;
        }

        const token = jwt.sign({ id: userId, email }, JWT_SECRET);

        res.status(201).json({ message: 'User registered successfully', token });
    } catch (error) {
        console.error('Error in register:', error);
        next(error);
    }
};

// Login user
const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password }: LoginInput = req.body;

        if (!email || !password) {
            res.status(400).json({ message: 'All fields are required' });
            return;
        }

        const [getUser] = await dataBase.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = (getUser as any[])[0];

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            res.status(500).json({ message: 'Missing JWT secret' });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error in login:', error);
        next(error);
    }
};

// Import chat history from Excel
const importChatHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const uploadPath = path.join(process.cwd(), 'uploads');
        const filePath = path.join(uploadPath, req.file.filename);

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const data: ChatMessage[] = XLSX.utils.sheet_to_json(worksheet, {
            header: ['sender', 'receiver', 'message'],
            range: 1
        });

        const insertPromises = data.map(({ sender, receiver, message }) => {
            if (!sender || !receiver || !message) return null;
            return dataBase.query(
                'INSERT INTO chat_messages (sender, receiver, message) VALUES (?, ?, ?)',
                [sender, receiver, message]
            );
        });

        await Promise.all(insertPromises.filter(Boolean));

        fs.unlinkSync(filePath);

        res.status(200).json({ message: 'Chat history imported successfully' });
    } catch (error) {
        console.error('Error in importChatHistory:', error);
        next(error);
    }
};

export {
    register,
    login,
    importChatHistory
};
