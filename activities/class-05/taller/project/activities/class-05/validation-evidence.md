# Evidencia de validación — Clase 05

Pega aquí la salida del validador al cerrar cada estación (SIN secretos: el
validador ya evita imprimirlos, no agregues capturas de tu `.env`).

Base de datos: Supabase (PostgreSQL 17.6) — proyecto nuevo, migraciones 001→005
aplicadas en orden vía `scripts/_apply-migrations.mjs`.

> Nota de conexión: el session pooler (5432) reseteaba la conexión
> (`ECONNRESET`); se usa el transaction pooler (puerto 6543, `?pgbouncer=true`),
> que funciona de forma estable y cumple el mismo contrato.

## stage setup

```
CLASS 05 VALIDATION — stage: setup
✓ Database connection
✓ Previous schema
✓ Authentication migrations
✓ Existing request endpoints
✓ No committed secrets
RESULT: 5/5
```

## stage access-design

```
CLASS 05 VALIDATION — stage: access-design
[01/03] access-matrix.md completed ....... PASS
[02/03] auth-contract.md completed ....... PASS
[03/03] threat-cases.md completed ........ PASS
RESULT: 3/3

Checkpoint class-05-access-design reached.
Your access design is on record — AI assistance is now allowed.
```

## stage register

```
CLASS 05 VALIDATION — stage: register
[01/02] Public registration .............. PASS
[02/02] Role escalation protection ....... PASS
RESULT: 2/2
```

## stage password

```
CLASS 05 VALIDATION — stage: password
[01/01] Password storage ................. PASS
RESULT: 1/1
```

## stage login

```
CLASS 05 VALIDATION — stage: login
[01/02] Login contract ................... PASS
[02/02] JWT claims and lifetime .......... PASS
RESULT: 2/2
```

## stage authentication

```
CLASS 05 VALIDATION — stage: authentication
[01/02] Protected endpoints .............. PASS
[02/02] Token verification ............... PASS
RESULT: 2/2
```

## stage ownership

```
CLASS 05 VALIDATION — stage: ownership
[01/02] Trusted request ownership ........ PASS
[02/02] Requester isolation .............. PASS
RESULT: 2/2
```

## stage authorization

```
CLASS 05 VALIDATION — stage: authorization
[01/02] Agent permissions ................ PASS
[02/02] Status rules preserved ........... PASS
RESULT: 2/2
```

## Boss battle (integral)

```
CLASS 05 VALIDATION
[01/12] Database and migrations .......... PASS
[02/12] Public registration .............. PASS
[03/12] Role escalation protection ....... PASS
[04/12] Password storage ................. PASS
[05/12] Login contract ................... PASS
[06/12] JWT verification ................. PASS
[07/12] Protected endpoints .............. PASS
[08/12] Trusted request ownership ........ PASS
[09/12] Requester isolation .............. PASS
[10/12] Agent permissions ................ PASS
[11/12] Status rules preserved ........... PASS
[12/12] Sensitive data protection ........ PASS
RESULT: 12/12
CLASS 05 COMPLETED
```