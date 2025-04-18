import express, { Application } from 'express';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
const port: number = 3001;

const JWT_SECRET = process.env.JWT_SECRET
console.log("JWT_SECRETJWT_SECRET",JWT_SECRET)


// Middleware to parse JSON bodies
app.use(express.json());

// Use the authRoutes for '/api/auth' endpoint
app.use('/api/auth', authRoutes);  // Correctly use app.use()

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});



