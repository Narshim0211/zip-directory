const express = require('express');
const router = express.Router();
const { randomUUID } = require('crypto');

// In-memory store (per-process, ephemeral)
const store = {
  tasks: [],
};

function toISODateOnly(d) {
  return new Date(d).toISOString().split('T')[0];
}

function getWeekRange(startMondayISO) {
  const start = new Date(startMondayISO);
  const end = new Date(startMondayISO);
  end.setDate(end.getDate() + 6);
  return { start: toISODateOnly(start), end: toISODateOnly(end) };
}

// Seed with a friendly example for today
(function seed() {
  const today = toISODateOnly(new Date());
  store.tasks.push({
    _id: randomUUID(),
    title: 'Welcome to Time Manager',
    description: 'This is a sample task. Create your own to get started!',
    date: today,
    session: 'Morning',
    priority: 'medium',
    status: 'pending',
    estimatedDuration: 30,
    scope: 'daily',
  });
})();

// GET /tasks/daily?date=YYYY-MM-DD
router.get('/tasks/daily', (req, res) => {
  const date = req.query.date ? toISODateOnly(req.query.date) : toISODateOnly(new Date());
  const tasks = store.tasks.filter(t => toISODateOnly(t.date) === date);
  return res.json({ tasks });
});

// GET /tasks/weekly?startDate=YYYY-MM-DD (Monday)
router.get('/tasks/weekly', (req, res) => {
  const startDate = req.query.startDate || toISODateOnly(new Date());
  const { start, end } = getWeekRange(startDate);
  const tasks = store.tasks.filter(t => {
    const d = toISODateOnly(t.date);
    return d >= start && d <= end;
  });
  return res.json({ tasks });
});

// POST /tasks
router.post('/tasks', (req, res) => {
  const body = req.body || {};
  const nowISO = toISODateOnly(new Date());
  const task = {
    _id: randomUUID(),
    title: body.title || 'Untitled Task',
    description: body.description || '',
    date: body.date ? toISODateOnly(body.date) : nowISO,
    session: body.session || 'Morning',
    priority: body.priority || 'medium',
    estimatedDuration: typeof body.estimatedDuration === 'number' ? body.estimatedDuration : 30,
    status: body.status || 'pending',
    scope: body.scope || 'daily',
  };
  store.tasks.unshift(task);
  return res.status(201).json(task);
});

// PUT /tasks/:id
router.put('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const idx = store.tasks.findIndex(t => t._id === id);
  if (idx === -1) return res.status(404).json({ message: 'Task not found' });
  const current = store.tasks[idx];
  const patch = req.body || {};
  const updated = { ...current, ...patch };
  store.tasks[idx] = updated;
  return res.json(updated);
});

// DELETE /tasks/:id
router.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  const idx = store.tasks.findIndex(t => t._id === id);
  if (idx === -1) return res.status(404).json({ message: 'Task not found' });
  const [removed] = store.tasks.splice(idx, 1);
  return res.json({ deleted: true, id: removed._id });
});

// Placeholder endpoints to satisfy UI wrappers
router.get('/goals', (_req, res) => res.json({ goals: [] }));
router.get('/reminders', (_req, res) => res.json({ reminders: [] }));
router.get('/reflections', (_req, res) => res.json({ reflections: [] }));
router.get('/analytics', (_req, res) => res.json({}));
router.get('/quote', (_req, res) => res.json({ quote: 'Make each day your masterpiece.' }));

module.exports = router;
