document.addEventListener("DOMContentLoaded", () => {
  fetchTasks();
});
let currentElo = 1200;

async function fetchTasks() {
  try {
      const response = await fetch('http://localhost:3001/api/tasks');
      if (!response.ok) {
          throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }
      
      const tasks = await response.json();
      displayTasks(tasks);
  } catch (err) {
      console.error("Failed to fetch tasks:", err);
      alert("Failed to load tasks. Please try again later.");
  }
}

function displayTasks(tasks) {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  
  tasks.forEach(task => {
      const taskItem = document.createElement("li");
      taskItem.textContent = `${task.name} - ${task.difficulty.toUpperCase()} ${task.completed ? '(Completed)' : ''}`;
      
      if (!task.completed) {
          const completeButton = document.createElement("button");
          completeButton.textContent = "Complete";
          completeButton.onclick = () => completeTask(task._id);
          taskItem.appendChild(completeButton);
      }
      
      taskList.appendChild(taskItem);
  });
}

async function completeTask(taskId) {
  try {
    const response = await fetch(`http://localhost:3001/api/tasks/${taskId}/complete`, {
      method: 'PATCH'
    });
    const result = await response.json();
    
    // Update ELO display
    currentElo += result.eloChange;
    document.getElementById('eloScore').textContent = currentElo;
    
    // Visual feedback
    const eloElement = document.getElementById('eloScore');
    eloElement.style.transform = 'scale(1.2)';
    eloElement.style.color = '#4CAF50';
    setTimeout(() => {
      eloElement.style.transform = '';
      eloElement.style.color = '';
    }, 1000);
    
    refreshTasks(); // Reload the task list
  } catch (err) {
    console.error("Completion failed:", err);
  }
}

async function addTask() {
  const taskName = document.getElementById("taskInput").value;
  const difficulty = document.getElementById("difficultySelect").value;
  const eloImpact = { easy: 5, medium: 10, hard: 20 }[difficulty];
  
  if (!taskName.trim()) {
      alert("Task name is required.");
      return;
  }
  
  try {
      const response = await fetch('http://localhost:3001/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: taskName, difficulty, eloImpact })
      });
      
      if (!response.ok) throw new Error('Failed to add task');
      
      document.getElementById("taskInput").value = "";
      fetchTasks(); // Refresh list
  } catch (err) {
      console.error("Task creation failed:", err);
  }
}
function renderTask(task) {
  return `
    <div class="task ${task.completed ? 'completed' : ''}">
      <span class="difficulty-${task.difficulty}">${task.name}</span>
      ${!task.completed ? 
        `<button onclick="completeTask('${task._id}')">✓ Done</button>` : 
        '<span class="completed-badge">Completed</span>'}
    </div>
  `;
}