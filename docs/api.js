const API_URL = "https://jsonplaceholder.typicode.com/posts";


const loadBtn = document.getElementById("load-btn");
const statusP = document.getElementById("status");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");
const notesList = document.getElementById("notes-list");


function showStatus(message, type) {
    statusP.textContent = message;
    statusP.className = type; // success, error, or info
}


async function request(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    return response;
}


function renderNotes(notes) {
    notesList.innerHTML = "";

    if (!notes || notes.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.className = "empty-message";
        emptyLi.textContent = "No notes available to display.";
        notesList.appendChild(emptyLi);
        return;
    }

    notes.forEach((note) => {
        const li = document.createElement("li");
        li.dataset.id = note.id;

        const h3 = document.createElement("h3");
        h3.textContent = note.title;

        const p = document.createElement("p");
        p.textContent = note.body || "(No body provided)";

        const delBtn = document.createElement("button");
        delBtn.className = "delete-btn";
        delBtn.textContent = "Delete Note";
        delBtn.addEventListener("click", () => deleteNote(note.id, li));

        li.appendChild(h3);
        li.appendChild(p);
        li.appendChild(delBtn);

        notesList.appendChild(li);
    });
}


async function loadNotes() {
    loadBtn.disabled = true;
    showStatus("Loading notes...", "info");

    try {
        const res = await request(`${API_URL}?_limit=10`);
        const data = await res.json();
        renderNotes(data);
        showStatus("Loaded 10 notes from the server.", "success");
    } catch (error) {
        showStatus(`Failed to load notes: ${error.message}`, "error");
    } finally {
        loadBtn.disabled = false;
    }
}


async function createNote(e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    
    if (!title) {
        showStatus("Validation Error: Title is required.", "error");
        return;
    }
    if (title.length > 100) {
        showStatus("Validation Error: Title must be 100 characters or less.", "error");
        return;
    }

    submitBtn.disabled = true;
    showStatus("Creating note...", "info");

    try {
        const res = await request(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, body, userId: 1 })
        });
        
        const newNote = await res.json();

       
        const li = document.createElement("li");
        li.dataset.id = newNote.id;

        const h3 = document.createElement("h3");
        h3.textContent = newNote.title;

        const p = document.createElement("p");
        p.textContent = newNote.body || "(No body provided)";

        const delBtn = document.createElement("button");
        delBtn.className = "delete-btn";
        delBtn.textContent = "Delete Note";
        delBtn.addEventListener("click", () => deleteNote(newNote.id, li));

        li.appendChild(h3);
        li.appendChild(p);
        li.appendChild(delBtn);

        
        if (notesList.querySelector(".empty-message")) {
            notesList.innerHTML = "";
        }

        notesList.insertBefore(li, notesList.firstChild);

        showStatus(`Note created (status ${res.status}, id ${newNote.id}).`, "success");
        noteForm.reset();
    } catch (error) {
        showStatus(`Failed to create note: ${error.message}`, "error");
    } finally {
        submitBtn.disabled = false;
    }
}

async function deleteNote(id, element) {
    showStatus(`Deleting note #${id}...`, "info");

    try {
        const res = await request(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        // NOTE ON JSONPLACEHOLDER: JSONPlaceholder is a mock/fake REST API.
        // It returns a 200 OK status on DELETE requests, but it does NOT alter server-side state.
        // Therefore, we simulate successful deletion locally by removing the DOM node.
        element.remove();

        if (notesList.children.length === 0) {
            renderNotes([]);
        }

        showStatus(`Note #${id} deleted successfully (status ${res.status}).`, "success");
    } catch (error) {
        showStatus(`Failed to delete note #${id}: ${error.message}`, "error");
    }
}


loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);