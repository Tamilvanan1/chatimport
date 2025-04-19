import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { dataBase } from '../config/db';
import jwt from 'jsonwebtoken'
import path from 'path';
import * as XLSX from 'xlsx'
import fs from "fs"


const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userName, email, password } = req.body;

        
        if (!userName || !email || !password) {
        res.status(400).json({ message: 'All fields are required' });
        }

       
        const [getUser] = await dataBase.query('SELECT email FROM users WHERE email = ?', [email]);
        console.log('getUser:', getUser , ([getUser] as any[]).length);

        if ( (getUser as any[]).length > 0) {
            res.status(400).json({ message: 'User already exists' });  // Exit after sending response
            return
            
        }
        // Hash password (you can uncomment the next line if using bcrypt)
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await dataBase.query(`INSERT INTO users (username , email, password) VALUES (? , ? , ?)`, [userName, email , hashedPassword])

        console.log("result123" , result)
        const userId = (result as any)?.insertId;
        console.log("userIduserIduserId",userId)
        const JWT_SECRET =  process.env.JWT_SECRET;

        const token = jwt.sign({ id: userId, email }, `${JWT_SECRET}`);

        console.log("tokentoken",token , JWT_SECRET , process.env.JWT_SECRET)


        

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log('Error:', error);
        next(error);  // Pass the error to global error handler
    }
};


  
const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        
        if (!email || !password) {
            res.status(400).json({ message: 'All fields are required' });
            return
        }

        
        const [getUser] = await dataBase.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('getUser:', getUser);

        const user = (getUser as any[])?.[0];  // Access the first user from the result

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' }); // Return if user doesn't exist
            return
        }

       
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' }); // Return if passwords don't match
            return
        }

        // JWT token
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!JWT_SECRET) {
            res.status(500).json({ message: 'Server error: Missing JWT secret' });
            return
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);

        console.log('Generated token:', token);

        res.status(200).json({ message: 'Login successful', token });
        return
        
    } catch (error) {
        console.log('Error:', error);
        next(error);
    }
};

  
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

        
        const data: { sender: string; receiver: string; message: string }[] =
            XLSX.utils.sheet_to_json(worksheet, {
                header: ['sender', 'receiver', 'message'], // manually set headers
                range: 1 // skip the header row in Excel
            });

        // Insert messages into DB
        const insertPromises = data.map(async ({ sender, receiver, message }) => {
            if (!sender || !receiver || !message) return null;

            return dataBase.query(
                'INSERT INTO chat_messages (sender, receiver, message) VALUES (?, ?, ?)',
                [sender, receiver, message]
            );
        });

        await Promise.all(insertPromises);

       
        fs.unlinkSync(filePath);

        res.status(200).json({ message: 'Chat history imported successfully' });
    } catch (error) {
        console.error('Error importing chat history:', error);
        next(error);
    }
};

  
  

export { 
    register ,
    login,
    importChatHistory
};
