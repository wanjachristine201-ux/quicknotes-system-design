# QuickNotes Data Model Specification

## 1. Entities & Schema Definitions

1. **`users`**: Stores user authentication and profile data.
2. **`notes`**: Stores user note titles and text body.
3. **`tags`**: Stores organizational categories.
4. **`note_tags`**: Join table managing the many-to-many relationship between notes and tags.

---

## 2. Relationships Explanation
* **One-to-Many (`users` $\rightarrow$ `notes`):** One user can own multiple notes, but each note belongs strictly to one user (`notes.user_id` foreign key).
* **Many-to-Many (`notes` $\leftrightarrow$ `tags`):** A note can have multiple tags, and a tag can be attached to multiple notes. This is resolved using the `note_tags` join table containing foreign keys `note_id` and `tag_id`.

---

## 3. CREATE TABLE Statements (SQL)

```sql
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    note_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE tags (
    tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(note_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(tag_id) ON DELETE CASCADE
);