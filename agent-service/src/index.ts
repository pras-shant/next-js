import express from 'express';
import mongoose from 'mongoose';
import { AIAgentRoutes } from './routes/AIAgentRoutes'; // Make sure this is a named import

const app = express();
app.use(express.json());

// Instantiate the routes class and use the router it exposes
const agentRoutes = new AIAgentRoutes();
app.use('/api/agents', agentRoutes.router);

const PORT = 5000;

mongoose
  .connect('mongodb://localhost:27017/', {
    // Optional Mongoose options can be added here
  })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
