// API tests for FEATURE-801 — the behavior matrix of the claim, through
// HTTP. Each test uses the existing helpers: unique data per run and
// cleanup of what it creates.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { createUser, createRequestAs } from './helpers/test-data.js';
import { loginAs } from './helpers/test-auth.js';
import { cleanupCreatedData, closePool } from './helpers/cleanup.js';

after(async () => {
  await cleanupCreatedData();
  await closePool();
});

test('claim requires authentication', async () => {
  const response = await request(app).post('/requests/1/claim');
  assert.equal(response.status, 401);
});

test('a requester cannot claim a request', async () => {
  const owner = await createUser({ name: 'noagent' });
  const token = await loginAs(owner);
  const created = await createRequestAs(token);

  const response = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 403);
});

test('an agent claims an open request: 200, assignedTo from the token, in_progress', async () => {
  const owner = await createUser({ name: 'cowner' });
  const agent = await createUser({ name: 'cagent', role: 'agent' });
  const ownerToken = await loginAs(owner);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(ownerToken);

  const response = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`);

  assert.equal(response.status, 200);
  assert.equal(response.body.assignedTo, agent.id);
  assert.equal(response.body.status, 'in_progress');

  const after = await request(app)
    .get(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${agentToken}`);
  assert.ok(new Date(after.body.updatedAt) > new Date(created.updatedAt),
    'updatedAt must advance with the claim');
});

test('claiming a nonexistent request answers 404', async () => {
  const agent = await createUser({ name: 'nobody', role: 'agent' });
  const token = await loginAs(agent);

  const response = await request(app)
    .post('/requests/999999999/claim')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 404);
  assert.equal(response.body.error.code, 'REQUEST_NOT_FOUND');
});

test('a second claim answers 409 REQUEST_ALREADY_ASSIGNED', async () => {
  const owner = await createUser({ name: 'secondo' });
  const agent = await createUser({ name: 'seconda', role: 'agent' });
  const ownerToken = await loginAs(owner);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(ownerToken);

  const first = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`);
  assert.equal(first.status, 200);

  const second = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`);

  assert.equal(second.status, 409);
  assert.equal(second.body.error.code, 'REQUEST_ALREADY_ASSIGNED');
  // The class 07 contract survives: errors and logs carry the requestId.
  assert.equal(typeof second.body.requestId, 'string');
});

test('a terminal request cannot be claimed', async () => {
  const owner = await createUser({ name: 'downer' });
  const agent = await createUser({ name: 'dagent', role: 'agent' });
  const ownerToken = await loginAs(owner);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(ownerToken);

  const cancel = await request(app)
    .patch(`/requests/${created.id}`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ status: 'cancelled' });
  assert.equal(cancel.status, 200);

  const response = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`);

  assert.equal(response.status, 409);
});

test('assignedTo in the body is rejected as a server-controlled field', async () => {
  const owner = await createUser({ name: 'fowner' });
  const agent = await createUser({ name: 'fagent', role: 'agent' });
  const other = await createUser({ name: 'fother', role: 'agent' });
  const ownerToken = await loginAs(owner);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(ownerToken);

  const response = await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ assignedTo: other.id });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, 'SERVER_CONTROLLED_FIELD');
});

test('the claim leaves a request_claimed event in the history', async () => {
  const owner = await createUser({ name: 'hfirst' });
  const agent = await createUser({ name: 'hsecond', role: 'agent' });
  const ownerToken = await loginAs(owner);
  const agentToken = await loginAs(agent);
  const created = await createRequestAs(ownerToken);

  await request(app)
    .post(`/requests/${created.id}/claim`)
    .set('Authorization', `Bearer ${agentToken}`);

  const history = await request(app)
    .get(`/requests/${created.id}/history`)
    .set('Authorization', `Bearer ${ownerToken}`);

  assert.equal(history.status, 200);
  const claimEvent = history.body.find((event) => event.type === 'request_claimed');
  assert.ok(claimEvent, 'the history must contain a request_claimed event');
  assert.equal(claimEvent.fromStatus, 'open');
  assert.equal(claimEvent.toStatus, 'in_progress');
});