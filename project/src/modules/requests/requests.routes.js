import express from 'express';
import { requests, generateId } from './requests.store.js';

const router = express.Router();

// This router is mounted at /requests in app.js, so '/' here means GET /requests.

// GET /requests — List all requests
router.get('/', (req, res) => {
  res.status(200).json(requests);
});

// GET /requests/:id — Get a single request by id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const request = requests.find((item) => item.id === id);

  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }

  res.status(200).json(request);
});

// POST /requests — Create a new request
router.post('/', (req, res) => {
  const { title, description, priority } = req.body ?? {};

  if (typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const request = {
    id: generateId(),
    title: title.trim(),
    description: typeof description === 'string' ? description : '',
    status: 'open',
    priority: typeof priority === 'string' ? priority : 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  requests.push(request);
  res.status(201).json(request);
});

export default router;