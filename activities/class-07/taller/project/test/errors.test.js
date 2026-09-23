// Error contract tests for INC-701, INC-702 and the central error handler.
//
// Each regression test states the contract the fix must keep: invalid input
// is the consumer's problem (400), a missing well-formed resource is a 404,
// and unexpected internal failures are a generic 500 that reveals nothing.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { createUser, createRequestAs } from './helpers/test-data.js';
import { loginAs } from './helpers/test-auth.js';
import { cleanupCreatedData, closePool } from './helpers/cleanup.js';
import { pool } from '../src/database/pool.js';

after(async () => {
  await cleanupCreatedData();
  await closePool();
});

// ------------------------------------------------- INC-701 regression

test('an alphabetic id answers 400 INVALID_REQUEST_ID, not 500', async () => {
  const owner = await createUser({ name: 'inc701-alpha' });
  const token = await loginAs(owner);

  const response = await request(app)
    .get('/requests/not-a-number')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_REQUEST_ID');
  assert.equal(response.body.error.message, 'Request id must be a positive integer.');
});

test('decimal, zero and negative ids are rejected the same way', async () => {
  const owner = await createUser({ name: 'inc701-edge' });
  const token = await loginAs(owner);

  for (const bad of ['1.5', '0', '-3', '12abc']) {
    const response = await request(app)
      .get(`/requests/${bad}`)
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 400, `GET /requests/${bad} should be 400`);
    assert.equal(response.body.error.code, 'INVALID_REQUEST_ID',
      `GET /requests/${bad} should be INVALID_REQUEST_ID, not a parsed integer`);
  }
});

test('a well-formed id that matches nothing still answers 404', async () => {
  const owner = await createUser({ name: 'inc701-missing' });
  const token = await loginAs(owner);

  const response = await request(app)
    .get('/requests/999999999')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'REQUEST_NOT_FOUND');
});

// ------------------------------------------------- INC-702 regression

async function agentWithOpenRequest() {
  const owner = await createUser({ name: 'inc702-owner' });
  const agent = await createUser({ name: 'inc702-agent', role: 'agent' });
  const ownerToken = await loginAs(owner);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(ownerToken);
  return { agentToken, created };
}

test('an invalid priority answers 400 INVALID_PRIORITY before touching SQL', async () => {
  const { agentToken, created } = await agentWithOpenRequest();

  const response = await request(app)
    .patch(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ priority: 'critical' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_PRIORITY');
  // The message copies the contract so a human can act on it.
  assert.equal(response.body.error.message, 'Priority must be low, medium or high.');
});

test('a valid priority change still works after the fix', async () => {
  const { agentToken, created } = await agentWithOpenRequest();

  const response = await request(app)
    .patch(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ priority: 'high' });

  assert.equal(response.status, 200);
  assert.equal(response.body.priority, 'high');
});

// ------------------------------------------------- central error handler

test('POST with an invalid priority is rejected the same way', async () => {
  const owner = await createUser({ name: 'inc702-post' });
  const token = await loginAs(owner);

  const response = await request(app)
    .post('/requests')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'late validation check', priority: 'urgent' });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'INVALID_PRIORITY');
});

test('an unexpected error answers a generic 500 without internal details', async () => {
  const owner = await createUser({ name: 'inc500' });
  const token = await loginAs(owner);

  // Sabotage the pool for ONE request the way the validator does: the
  // handler then fails for a reason unrelated to the client's input.
  const realQuery = pool.query.bind(pool);
  pool.query = async () => { throw new Error('secret internal detail az42q'); };
  try {
    const response = await request(app)
      .get('/requests')
      .set('Authorization', `Bearer ${token}`);

    assert.equal(response.status, 500);
    assert.equal(response.body.error.code, 'INTERNAL_ERROR');
    const raw = JSON.stringify(response.body);
    assert.equal(raw.includes('secret internal detail az42q'), false,
      'the response must not repeat the internal error message');
    assert.equal(raw.includes('at '), false, 'the response must not contain a stack frame');
  } finally {
    pool.query = realQuery;
  }
});

test('every error body shares the same shape: error.code, error.message, requestId', async () => {
  const owner = await createUser({ name: 'incshape' });
  const token = await loginAs(owner);

  const response = await request(app)
    .get('/requests/999999999')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 404);
  assert.equal(typeof response.body.error.code, 'string');
  assert.equal(typeof response.body.error.message, 'string');
  assert.equal(typeof response.body.requestId, 'string');
});