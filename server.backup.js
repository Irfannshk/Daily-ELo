const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3001;
// User model
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    eloRating: { type: Number, default: 1200 }
  }));
  
  // Auth routes
  app.post('/api/register', async (req, res) => {
    // Implementation here
  });
// Essential Middleware
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});
app.patch('/api/tasks/:id/complete', async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { completed: true },
        { new: true }
      );
      // Add ELO update logic here
      res.json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

// Database Connection
mongoose.connect("mongodb://127.0.0.1:27017/elo-tracker")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("Connection failed:", err));

// Task Model
const Task = mongoose.model('Task', new mongoose.Schema({
    name: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    completed: { type: Boolean, default: false },
    eloImpact: Number,
    createdAt: { type: Date, default: Date.now }
}));

// Routes
app.get('/api', (req, res) => res.json({ status: 'active' }));

// Tasks Router
const tasksRouter = express.Router();
tasksRouter.route('/')
    .get(async (req, res) => {
        try {
            const tasks = await Task.find();
            res.json(tasks);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    })
    .post(async (req, res) => {
        try {
            const task = new Task(req.body);
            await task.save();
            res.status(201).json(task);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    });

app.use('/api/tasks', tasksRouter);

// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// Add to your existing routes
app.delete('/api/tasks/:id', async (req, res) => {
    try {
      await Task.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });