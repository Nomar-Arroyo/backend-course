import express from 'express';
import { requests, generateId } from '../data/requests.js';

const router = express.Router();

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
  if (!req.body.title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newRequest = {
    id: generateId(),
    title: req.body.title,
    description: req.body.description,
    status: 'open',
    priority: req.body.priority
  };

  requests.push(newRequest);
  res.status(201).json(newRequest);
});

export default router;
