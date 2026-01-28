# Interview Coordinator

A full‑stack application for tracking interviews, interview rounds, and follow‑ups, built with a focus on **clear system design**, **fast iteration**, and **AI‑augmented development**.

This project is intentionally scoped as a realistic, production‑style system rather than a toy demo.

---

## Why this project exists

Managing multiple interview processes quickly becomes fragmented: spreadsheets, notes, emails, reminders, and status updates spread across tools.

Interview Coordinator centralizes this flow into a single system:

* Structured interview pipelines
* Explicit interview rounds
* Clear ownership of state and progress
* Automated, asynchronous tasks for reminders and notifications

The goal is to reduce coordination overhead so humans focus on decisions, not logistics.

---

## Architecture Overview

**Backend**

* Django 5 + Django REST Framework
* JWT authentication (access + refresh tokens)
* PostgreSQL for persistence
* Celery + Redis for asynchronous tasks (emails, background work)

**Frontend**

* React 18 + TypeScript
* Vite for fast builds
* Tailwind CSS for styling
* Axios with interceptors for authenticated API access

The frontend and backend are fully decoupled and communicate via a REST API.

---

## Development Philosophy

This project was built using an **intent‑first workflow**:

1. Define what the system needs to do (features, constraints, edge cases)
2. Break work into explicit iterations (v0 → v1)
3. Write structured Markdown task specs to clarify intent
4. Use AI tools (Cursor) to accelerate implementation
5. Review, refactor, and correct AI‑generated code manually

AI is used as a **force multiplier**, not a replacement for understanding. Speed is valuable only when correctness and clarity are preserved.

---

## Repositories

* `/backend` — Django REST API, authentication, async tasks
* `/frontend` — React + TypeScript client application

Each directory contains its own README with setup and implementation details.

---

## Status

This project currently represents a solid v1:

* Core functionality implemented
* Clean separation of concerns
* Security‑aware defaults
* Ready to evolve further if needed

It is intentionally not over‑engineered beyond what the problem requires.
