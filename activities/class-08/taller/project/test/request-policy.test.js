// Policy tests — the payoff of this class: canClaimRequest depends on
// nothing, so its entire behavior matrix runs here with plain objects.
// No HTTP. No PostgreSQL. No server. Every row of the FEATURE-801 matrix
// becomes one assertion.
import test from 'node:test';
import assert from 'node:assert/strict';
import { canClaimRequest } from '../src/modules/requests/request.policy.js';

const agent = { role: 'agent', userId: 'agent-1' };
const requester = { role: 'requester', userId: 'requester-1' };

// A request representation as the mapper builds it: plain object.
const openUnassigned = { id: 1, title: 'x', status: 'open', assignedTo: null };

test('an agent can claim an open, unassigned request', () => {
  const verdict = canClaimRequest({ actor: agent, request: openUnassigned });
  assert.deepEqual(verdict, { allowed: true });
});

test('a requester cannot claim, even an open request', () => {
  const verdict = canClaimRequest({ actor: requester, request: openUnassigned });
  assert.deepEqual(verdict, { allowed: false, reason: 'NOT_AGENT' });
});

test('an already assigned request cannot be claimed again', () => {
  const claimed = { ...openUnassigned, assignedTo: 'another-agent' };
  const verdict = canClaimRequest({ actor: agent, request: claimed });
  assert.deepEqual(verdict, { allowed: false, reason: 'ALREADY_ASSIGNED' });
});

test('a request that is not open cannot be claimed', () => {
  for (const status of ['in_progress', 'resolved', 'closed', 'cancelled']) {
    const verdict = canClaimRequest({
      actor: agent,
      request: { ...openUnassigned, status }
    });
    assert.deepEqual(verdict, { allowed: false, reason: 'NOT_OPEN' },
      `status ${status} must not be claimable`);
  }
});

test('the role rule wins over the state rules', () => {
  // requester + assigned request -> the reported reason is NOT_AGENT.
  // (The caller answers 403 before any state conflict.)
  const assigned = { ...openUnassigned, assignedTo: 'another-agent' };
  const verdict = canClaimRequest({ actor: requester, request: assigned });
  assert.deepEqual(verdict, { allowed: false, reason: 'NOT_AGENT' });
});