import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define the storage configuration
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        // Set the path to the uploads directory
        const uploadPath = path.join(__dirname, 'uploads/');
        
        // Log the upload path for debugging
        console.log('Resolved upload path:', uploadPath);

        // Ensure the upload directory exists; create it if necessary
        if (!fs.existsSync(uploadPath)) {
            console.log('Creating uploads directory');
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        // Pass the upload directory to Multer
        cb(null, uploadPath);  
    },
    filename: (_req, file, cb) => {
        // Set the filename to include timestamp to avoid conflicts
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File filter to accept only Excel files
const fileFilter = (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.xlsx' && ext !== '.xls') {
        return cb(new Error('Only Excel files are allowed'));
    }

    cb(null, true);
};

// Initialize Multer with storage and file filter configurations
export const upload = multer({ storage, fileFilter });
