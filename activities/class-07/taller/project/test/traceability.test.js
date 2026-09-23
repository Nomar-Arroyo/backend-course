// Traceability tests for OPS-703.
//
// They assert not only what the logs contain, but what they do NOT
// contain: capture console.log/console.error during a request and inspect
// the lines. (The request logger writes on the response 'finish' event, so
// we wait a few milliseconds before restoring the console.)
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as sleep } from 'node:timers/promises';
import request from 'supertest';
import app from '../src/app.js';
import { createUser, createRequestAs } from './helpers/test-data.js';
import { loginAs } from './helpers/test-auth.js';
import { cleanupCreatedData, closePool } from './helpers/cleanup.js';

after(async () => {
  await cleanupCreatedData();
  await closePool();
});

async function captureLogs(run) {
  const lines = [];
  const realLog = console.log;
  const realError = console.error;
  console.log = (line) => lines.push(String(line));
  console.error = (line) => lines.push(String(line));
  try {
    const response = await run();
    // The request logger subscribes to the 'finish' event; give it a moment.
    await sleep(50);
    return { response, lines };
  } finally {
    console.log = realLog;
    console.error = realError;
  }
}

test('every response carries an X-Request-Id header', async () => {
  const response = await request(app).get('/health');
  assert.equal(typeof response.headers['x-request-id'], 'string');
  assert.equal(response.headers['x-request-id'].length > 0, true);
});

test('an error body carries the same requestId as the header', async () => {
  const owner = await createUser({ name: 'trace404' });
  const token = await loginAs(owner);

  const response = await request(app)
    .get('/requests/999999999')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(response.status, 404);
  assert.equal(response.body.requestId, response.headers['x-request-id']);
});

test('a well-formed client X-Request-Id is kept', async () => {
  const response = await request(app)
    .get('/health')
    .set('X-Request-Id', 'frontend-trace-42');

  assert.equal(response.headers['x-request-id'], 'frontend-trace-42');
});

test('a suspicious client X-Request-Id is replaced, never trusted', async () => {
  const junk = 'x'.repeat(300);
  const response = await request(app)
    .get('/health')
    .set('X-Request-Id', junk);

  const header = response.headers['x-request-id'];
  assert.notEqual(header, junk);
  assert.equal(header.startsWith('req_'), true);
  assert.equal(header.length <= 40, true, 'a server id is short, unlike the 300-byte probe');
});

test('the log line of a request carries the same requestId as the response', async () => {
  const { response, lines } = await captureLogs(() => request(app).get('/health'));
  const headerId = response.headers['x-request-id'];

  const jsonLines = lines.map((line) => {
    try { return JSON.parse(line); } catch { return null; }
  }).filter(Boolean);

  const match = jsonLines.find((entry) => entry.requestId === headerId);
  assert.ok(match, `no JSON log line carries requestId ${headerId}`);
  assert.equal(match.method, 'GET');
  assert.equal(match.status, 200);
  assert.equal(typeof match.durationMs, 'number');
});

test('the Authorization header and the token never reach the log', async () => {
  const owner = await createUser({ name: 'traceLeak' });
  const token = await loginAs(owner);
  await createRequestAs(token, { priority: 'high' });

  const { lines } = await captureLogs(async () => {
    await request(app)
      .get('/requests')
      .set('Authorization', `Bearer ${token}`);
    await request(app)
      .get('/requests/999999999')
      .set('Authorization', `Bearer ${token}`);
  });

  const leaky = lines.filter((line) =>
    line.includes(token) || /Bearer /.test(line) || /authorization/i.test(line));
  assert.equal(leaky.length, 0,
    `Authorization/token leaked into ${leaky.length} log line(s)`);
});