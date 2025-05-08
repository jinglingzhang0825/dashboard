document.addEventListener('DOMContentLoaded', function() {
    // Initialize all widgets
    initTodoWidget();
    initNotesWidget();
    initWeatherWidget();
    updateCurrentTime();
    
    // Update time every second
    setInterval(updateCurrentTime, 1000);
});

// Current Time
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString();
    document.getElementById('current-time').textContent = `${dateString} ${timeString}`;
}

// Todo Widget
function initTodoWidget() {
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo');
    const todoList = document.getElementById('todo-list');
    
    // Load saved todos
    const savedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    savedTodos.forEach(todo => {
        addTodoItem(todo.text, todo.completed);
    });
    
    // Add new todo
    addTodoBtn.addEventListener('click', function() {
        const todoText = todoInput.value.trim();
        if (todoText) {
            addTodoItem(todoText, false);
            saveTodos();
            todoInput.value = '';
        }
    });
    
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodoBtn.click();
        }
    });
    
    function addTodoItem(text, completed) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = completed;
        checkbox.addEventListener('change', function() {
            todoText.classList.toggle('completed', this.checked);
            saveTodos();
        });
        
        const todoText = document.createElement('span');
        todoText.className = 'todo-text' + (completed ? ' completed' : '');
        todoText.textContent = text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-todo';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function() {
            li.remove();
            saveTodos();
        });
        
        li.appendChild(checkbox);
        li.appendChild(todoText);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    }
    
    function saveTodos() {
        const todos = [];
        document.querySelectorAll('.todo-item').forEach(item => {
            todos.push({
                text: item.querySelector('.todo-text').textContent,
                completed: item.querySelector('input[type="checkbox"]').checked
            });
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }
}

// Notes Widget
function initNotesWidget() {
    const noteTitle = document.getElementById('note-title');
    const noteContent = document.getElementById('note-content');
    const saveNoteBtn = document.getElementById('save-note');
    const notesList = document.getElementById('notes-list');
    
    let currentNoteId = null;
    
    // Load saved notes
    const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    savedNotes.forEach(note => {
        addNoteToList(note);
    });
    
    // Save note
    saveNoteBtn.addEventListener('click', function() {
        const title = noteTitle.value.trim();
        const content = noteContent.value.trim();
        
        if (title || content) {
            const note = {
                id: currentNoteId || Date.now(),
                title: title || 'Untitled',
                content: content,
                createdAt: new Date().toISOString()
            };
            
            saveNote(note);
            clearNoteEditor();
        }
    });
    
    function addNoteToList(note) {
        // Check if note already exists in the list
        const existingNote = document.querySelector(`.note-card[data-id="${note.id}"]`);
        if (existingNote) {
            existingNote.remove();
        }
        
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.dataset.id = note.id;
        
        const noteHeader = document.createElement('h3');
        noteHeader.textContent = note.title;
        
        const notePreview = document.createElement('p');
        notePreview.textContent = note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '');
        
        noteCard.appendChild(noteHeader);
        noteCard.appendChild(notePreview);
        
        noteCard.addEventListener('click', function() {
            currentNoteId = note.id;
            noteTitle.value = note.title;
            noteContent.value = note.content;
        });
        
        // Insert at the beginning of the list
        notesList.insertBefore(noteCard, notesList.firstChild);
    }
    
    function saveNote(note) {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        
        // Update existing note or add new one
        const noteIndex = notes.findIndex(n => n.id === note.id);
        if (noteIndex >= 0) {
            notes[noteIndex] = note;
        } else {
            notes.unshift(note);
        }
        
        localStorage.setItem('notes', JSON.stringify(notes));
        addNoteToList(note);
    }
    
    function clearNoteEditor() {
        currentNoteId = null;
        noteTitle.value = '';
        noteContent.value = '';
    }
}

// Weather Widget (API Example)
function initWeatherWidget() {
    const weatherDisplay = document.getElementById('weather-display');
    const locationInput = document.getElementById('location-input');
    const searchBtn = document.getElementById('search-location');
    
    // OpenWeatherMap API key - Get one for free at https://openweathermap.org/api
    const API_KEY = ''; // You need to add your API key here
    
    // Load last location or default to user's location
    const lastLocation = localStorage.getItem('lastWeatherLocation') || 'London';
    locationInput.value = lastLocation;
    
    // Get weather data on page load
    if (API_KEY) {
        getWeatherData(lastLocation);
    } else {
        getFreeWeatherData(lastLocation);
    }
    
    // Search button click
    searchBtn.addEventListener('click', function() {
        const location = locationInput.value.trim();
        if (location) {
            if (API_KEY) {
                getWeatherData(location);
            } else {
                getFreeWeatherData(location);
            }
        }
    });
    
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
    
    // Function to get weather using OpenWeatherMap API
    function getWeatherData(location) {
        weatherDisplay.innerHTML = '<p>Loading weather data...</p>';
        
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=metric`;
        
        axios.get(url)
            .then(response => {
                displayWeatherData(response.data);
                localStorage.setItem('lastWeatherLocation', location);
            })
            .catch(error => {
                weatherDisplay.innerHTML = `<p>Error: ${error.response?.data?.message || 'Could not fetch weather data'}</p>`;
            });
    }
    
    // Function to get free simulated weather data without API key
    function getFreeWeatherData(location) {
        weatherDisplay.innerHTML = '<p>Loading weather data...</p>';
        
        // This is a simulated response
        setTimeout(() => {
            const mockWeatherData = {
                name: location,
                main: {
                    temp: Math.round(10 + Math.random() * 20),
                    humidity: Math.round(40 + Math.random() * 40)
                },
                weather: [
                    { 
                        main: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)],
                        description: 'Weather description'
                    }
                ]
            };
            
            displayWeatherData(mockWeatherData);
            
            // Save last location
            localStorage.setItem('lastWeatherLocation', location);
        }, 500);
    }
    
    // Display weather data in the widget
    function displayWeatherData(data) {
        const weatherHTML = `
            <h3>${data.name}</h3>
            <div class="weather-info">
                <p><strong>Temperature:</strong> ${data.main.temp}°C</p>
                <p><strong>Weather:</strong> ${data.weather[0].main}</p>
                <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
            </div>
        `;
        
        weatherDisplay.innerHTML = weatherHTML;
    }
}