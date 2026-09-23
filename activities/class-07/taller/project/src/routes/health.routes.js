// OPS-703 · Operational endpoints.
//
// Two DIFFERENT questions:
//   GET /health  "Is the process alive?"        -> never touches PostgreSQL
//   GET /ready   "Can it do useful work now?"   -> checks PostgreSQL cheaply
// Reference: https://expressjs.com/en/advanced/healthcheck-graceful-shutdown/
//
// The database check is INJECTABLE: createHealthRouter accepts an optional
// checkDatabase, and defaults to the cheapest possible real query (SELECT 1
// through the shared pool). A test hands in a failing check to prove that
// /ready degrades into a DELIBERATE 503 — a controlled answer, not a crash —
// without touching real credentials.
import express from 'express';
import { pool } from '../database/pool.js';

async function defaultCheckDatabase() {
  await pool.query('SELECT 1');
}

export function createHealthRouter({ checkDatabase } = {}) {
  const router = express.Router();
  const check = checkDatabase ?? defaultCheckDatabase;

  router.get('/health', (req, res) => {
    // The process is alive and answering HTTP. Nothing more is true here —
    // it must keep answering even when the database is down.
    res.status(200).json({ status: 'ok' });
  });

  router.get('/ready', async (req, res) => {
    try {
      await check();
      res.status(200).json({ status: 'ready', database: 'available' });
    } catch {
      // Deliberate, controlled 503: "the process lives but cannot do useful
      // work right now". It reveals nothing about the dependency: no host,
      // no port, no user, no SQL.
      res.status(503).json({ status: 'not_ready', database: 'unavailable' });
    }
  });

  return router;
}

export const healthRoutes = createHealthRouter();