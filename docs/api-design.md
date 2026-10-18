# QuickNotes REST API Specification

This document details the production REST API specification for the QuickNotes backend platform.

## 1. Endpoints Overview

| Method | Path | Description | Success Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/notes` | List all notes for authenticated user (supports query filters) | `200 OK` |
| `GET` | `/api/v1/notes/:id` | Retrieve a single note by ID | `200 OK` |
| `POST` | `/api/v1/notes` | Create a new note | `201 Created` |
| `PUT` | `/api/v1/notes/:id` | Completely update an existing note | `200 OK` |
| `DELETE` | `/api/v1/notes/:id` | Delete a note by ID | `204 No Content` |
| `GET` | `/api/v1/notes/search` | Search notes by keyword query parameter `?q=` | `200 OK` |

---

## 2. Request & Response Payload Examples

### A. Create Note (`POST /api/v1/notes`)
**Request Header:** `Content-Type: application/json`, `Authorization: Bearer <token>`
**Request Body:**
```json
{
  "title": "Data Science Workshop Preparation",
  "body": "Prepare slides for Pandas and NumPy intro session.",
  "tag_ids": [1, 3]
}