import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRoutes, permissionRoutes, userRoutes } from './routes';

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/permissions', permissionRoutes);
app.use('/users', userRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
