// Health and readiness tests.
//
// The interesting case is "/ready when the database is down" WITHOUT
// touching real credentials: createHealthRouter accepts an injectable
// checkDatabase function — hand it one that throws, mounted on a tiny
// throwaway express() app.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { createHealthRouter } from '../src/routes/health.routes.js';
import { pool } from '../src/database/pool.js';

after(async () => {
  await pool.end();
});

function failingCheck() {
  throw new Error('connection refused to db.internal.example:5432');
}

test('GET /health answers 200 ok without touching PostgreSQL', async () => {
  // Mount the router on a throwaway app, as production does.
  const app = express();
  app.use(createHealthRouter());

  // Sabotage the real pool for the duration of the test: /health must keep
  // answering because it never consults the database.
  const realQuery = pool.query.bind(pool);
  pool.query = async () => { throw new Error('database is down right now'); };
  try {
    const response = await request(app).get('/health');
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: 'ok' });
  } finally {
    pool.query = realQuery;
  }
});

test('GET /ready answers 200 when PostgreSQL responds', async () => {
  const app = express();
  app.use(createHealthRouter());

  const response = await request(app).get('/ready');
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ready', database: 'available' });
});

test('GET /ready answers 503 when the database check fails', async () => {
  const app = express();
  app.use('/ops', createHealthRouter({ checkDatabase: failingCheck }));

  const response = await request(app).get('/ops/ready');

  assert.equal(response.status, 503);
  assert.deepEqual(response.body, { status: 'not_ready', database: 'unavailable' });
});

test('the readiness response never reveals connection details', async () => {
  const app = express();
  app.use('/ops', createHealthRouter({ checkDatabase: failingCheck }));

  const response = await request(app).get('/ops/ready');

  const raw = JSON.stringify(response.body);
  for (const needle of ['db.internal.example', '5432', 'connection refused', 'SELECT']) {
    assert.equal(raw.includes(needle), false,
      `the readiness answer must not reveal "${needle}"`);
  }
});