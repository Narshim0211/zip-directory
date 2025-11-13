const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');

const store = {
  tasks: [],
  goals: [],
};

(function seed() {
  store.tasks.push({
    _id: randomUUID(),
    title: 'Owner task: Review weekly bookings',
    description: 'Check overbooking and adjust staff schedule',
    session: 'Afternoon',
    priority: 'high',
    status: 'pending',
    estimatedDuration: 45,
  });
  store.goals.push({
    _id: randomUUID(),
    title: 'Increase monthly recurring clients by 10% ',
    progress: 20,
    status: 'active',
  });
})();

// TASKS
router.get('/tasks', (req, res) => {
  res.json({ tasks: store.tasks });
});

router.post('/tasks', (req, res) => {
  const body = req.body || {};
  const task = {
    _id: randomUUID(),
    title: body.title || 'Untitled',
    description: body.description || '',
    session: body.session || 'Morning',
    priority: body.priority || 'medium',
    status: body.status || 'pending',
    estimatedDuration: typeof body.estimatedDuration === 'number' ? body.estimatedDuration : 30,
  };
  store.tasks.unshift(task);
  res.status(201).json(task);
});

router.put('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const idx = store.tasks.findIndex(t => t._id === id);
  if (idx === -1) return res.status(404).json({ message: 'Task not found' });
  const updated = { ...store.tasks[idx], ...req.body };
  store.tasks[idx] = updated;
  res.json(updated);
});

router.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const idx = store.tasks.findIndex(t => t._id === id);
  if (idx === -1) return res.status(404).json({ message: 'Task not found' });
  store.tasks.splice(idx, 1);
  res.json({ deleted: true, id });
});

// GOALS
router.get('/goals', (req, res) => {
  res.json({ goals: store.goals });
});

router.post('/goals', (req, res) => {
  const body = req.body || {};
  const goal = {
    _id: randomUUID(),
    title: body.title || 'Untitled Goal',
    description: body.description || '',
    targetDate: body.targetDate || null,
    status: body.status || 'active',
    category: body.category || 'business',
  };
  store.goals.unshift(goal);
  res.status(201).json(goal);
});

router.put('/goals/:id', (req, res) => {
  const id = req.params.id;
  const idx = store.goals.findIndex(g => g._id === id);
  if (idx === -1) return res.status(404).json({ message: 'Goal not found' });
  const updated = { ...store.goals[idx], ...req.body };
  store.goals[idx] = updated;
  res.json(updated);
});

module.exports = router;
