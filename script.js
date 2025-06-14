document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const todoInput = document.getElementById("todoInput");
  const dueDateInput = document.getElementById("dueDate");
  const prioritySelect = document.getElementById("priority");
  const categoryInput = document.getElementById("category");
  const addBtn = document.getElementById("addBtn");
  const todoList = document.getElementById("todoList");
  const searchInput = document.getElementById("searchInput");
  const taskCounter = document.getElementById("taskCounter");
  const clearCompletedBtn = document.getElementById("clearCompleted");
  const themeToggle = document.querySelector(".theme-toggle");
  const menuItems = document.querySelectorAll(".menu-item");
  const categoryItems = document.querySelectorAll(".category-item");
  const tabs = document.querySelectorAll(".tab");
  const addTaskBtn = document.querySelector(".add-task-btn");
  const taskInputContainer = document.querySelector(".task-input-container");
  const completeAndAddBtn = document.getElementById("completeAndAddBtn");

  // New Auth Elements (Top Bar)
  const authEntryBtn = document.getElementById("authEntryBtn");
  const usernameDisplay = document.getElementById("usernameDisplay");
  const logoutBtn = document.getElementById("logoutBtn");

  // Combined Auth Modal Elements
  const authModal = document.getElementById("authModal");
  const authModalTitle = document.getElementById("authModalTitle");
  const authForm = document.getElementById("authForm");
  const authUsernameInput = document.getElementById("authUsername");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const toggleAuthMode = document.getElementById("toggleAuthMode");
  const closeAuthModalBtn = document.querySelector("#authModal .close-button");

  // State
  let todos = JSON.parse(localStorage.getItem("todos")) || [];
  let currentFilter = "all";
  let currentCategory = "all";
  let searchQuery = "";
  let isDarkMode = localStorage.getItem("darkMode") === "true";
  let currentUser = localStorage.getItem("currentUser");
  let currentAuthMode = "login"; // 'login' or 'signup'

  // Initialize theme
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  // Auth Functions
  function handleAuth(event) {
    event.preventDefault();
    const username = authUsernameInput.value.trim();

    if (!username) {
      alert("Username cannot be empty.");
      return;
    }

    localStorage.setItem("currentUser", username);
    currentUser = username;
    checkAuthStatus();
    authModal.style.display = "none";
    authUsernameInput.value = "";

    if (currentAuthMode === "signup") {
      alert("Signed up successfully! You are now logged in.");
    }
  }

  function logoutUser() {
    localStorage.removeItem("currentUser");
    currentUser = null;
    checkAuthStatus();
  }

  function checkAuthStatus() {
    if (currentUser) {
      usernameDisplay.textContent = `Welcome, ${currentUser}!`;
      usernameDisplay.style.display = "inline-block";
      authEntryBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
    } else {
      usernameDisplay.style.display = "none";
      authEntryBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
    }
  }

  // Function to toggle between Login and Sign Up UI in the modal
  function toggleAuthModalUI() {
    if (currentAuthMode === "login") {
      authModalTitle.textContent = "Sign Up";
      authSubmitBtn.textContent = "Sign Up";
      toggleAuthMode.textContent = "Already a user? Login";
      currentAuthMode = "signup";
    } else {
      authModalTitle.textContent = "Login";
      authSubmitBtn.textContent = "Login";
      toggleAuthMode.textContent = "New User? Sign Up";
      currentAuthMode = "login";
    }
  }

  // Format date for display
  function formatDate(dateString) {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  // Update task counter
  function updateTaskCounter() {
    const activeTasks = todos.filter((todo) => !todo.completed).length;
    taskCounter.textContent = `${activeTasks} task${
      activeTasks !== 1 ? "s" : ""
    } remaining`;
  }

  // Toggle task input container
  function toggleTaskInput() {
    taskInputContainer.classList.toggle("show");
    if (taskInputContainer.classList.contains("show")) {
      todoInput.focus();
    }
  }

  // Add task with animation
  function addTaskWithAnimation(todo) {
    const li = createTodoElement(todo);
    li.style.opacity = "0";
    li.style.transform = "translateY(20px)";
    todoList.insertBefore(li, todoList.firstChild);

    requestAnimationFrame(() => {
      li.style.transition = "all 0.3s ease";
      li.style.opacity = "1";
      li.style.transform = "translateY(0)";
    });
  }

  // Create todo element
  function createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.dataset.id = todo.id;

    const completeBtn = document.createElement("button");
    completeBtn.className = "complete-btn";
    completeBtn.innerHTML = '<i class="fas fa-check"></i>';
    completeBtn.onclick = () => toggleComplete(todo.id);

    const todoContent = document.createElement("div");
    todoContent.className = "todo-content";

    const todoText = document.createElement("span");
    todoText.className = "todo-text";
    todoText.textContent = todo.text;

    const todoMeta = document.createElement("div");
    todoMeta.className = "todo-meta";

    if (todo.dueDate) {
      const dueDate = document.createElement("span");
      dueDate.innerHTML = `<i class="far fa-calendar"></i> ${formatDate(
        todo.dueDate
      )}`;
      todoMeta.appendChild(dueDate);
    }

    if (todo.category) {
      const category = document.createElement("span");
      category.innerHTML = `<i class="fas fa-tag"></i> ${todo.category}`;
      todoMeta.appendChild(category);
    }

    const priorityBadge = document.createElement("span");
    priorityBadge.className = `priority-badge priority-${todo.priority}`;
    priorityBadge.textContent =
      todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);
    todoMeta.appendChild(priorityBadge);

    todoContent.appendChild(todoText);
    todoContent.appendChild(todoMeta);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.onclick = () => deleteTodo(todo.id);

    li.appendChild(todoContent);
    li.appendChild(completeBtn);
    li.appendChild(deleteBtn);

    return li;
  }

  // Render todos
  function renderTodos() {
    todoList.innerHTML = "";
    const filteredTodos = todos.filter((todo) => {
      const matchesFilter =
        currentFilter === "all"
          ? true
          : currentFilter === "active"
          ? !todo.completed
          : currentFilter === "completed"
          ? todo.completed
          : currentFilter === "high"
          ? todo.priority === "high"
          : currentFilter === "medium"
          ? todo.priority === "medium"
          : currentFilter === "low"
          ? todo.priority === "low"
          : true;

      const matchesCategory =
        currentCategory === "all" || todo.category === currentCategory;

      const matchesSearch =
        todo.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.category &&
          todo.category.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesFilter && matchesCategory && matchesSearch;
    });

    filteredTodos.forEach((todo) => {
      const li = createTodoElement(todo);
      todoList.appendChild(li);
    });

    updateTaskCounter();
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  // Add new todo
  function addTodo(isCompleted = false) {
    const text = todoInput.value.trim();
    if (text) {
      const newTodo = {
        id: Date.now().toString(),
        text,
        completed: isCompleted,
        dueDate: dueDateInput.value,
        priority: prioritySelect.value,
        category:
          categoryInput.value.trim() === "" ? "" : categoryInput.value.trim(),
        createdAt: new Date().toISOString(),
      };

      todos.unshift(newTodo);
      addTaskWithAnimation(newTodo);

      todoInput.value = "";
      dueDateInput.value = "";
      categoryInput.value = "";
      prioritySelect.value = "low";

      taskInputContainer.classList.remove("show");
      updateTaskCounter();
    }
  }

  // Toggle todo completion
  function toggleComplete(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      const todoElement = document.querySelector(`[data-id="${id}"]`);
      todoElement.classList.toggle("completed");

      if (todo.completed) {
        todoElement.style.animation = "completeTask 0.3s ease";
      }

      updateTaskCounter();
      localStorage.setItem("todos", JSON.stringify(todos));
    }
  }

  // Delete todo
  function deleteTodo(id) {
    const todoElement = document.querySelector(`[data-id="${id}"]`);
    todoElement.style.animation = "slideOut 0.3s ease";

    setTimeout(() => {
      todos = todos.filter((todo) => todo.id !== id);
      renderTodos();
    }, 300);
  }

  // Clear completed todos
  function clearCompleted() {
    const completedTodos = document.querySelectorAll(".todo-item.completed");
    completedTodos.forEach((todo) => {
      todo.style.animation = "slideOut 0.3s ease";
    });

    setTimeout(() => {
      todos = todos.filter((todo) => !todo.completed);
      renderTodos();
    }, 300);
  }

  // Toggle dark mode
  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle("dark-mode");
    themeToggle.innerHTML = isDarkMode
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    localStorage.setItem("darkMode", isDarkMode);
  }

  // Event Listeners
  addBtn.addEventListener("click", () => addTodo());
  addTaskBtn.addEventListener("click", toggleTaskInput);
  todoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTodo();
  });
  clearCompletedBtn.addEventListener("click", clearCompleted);
  themeToggle.addEventListener("click", toggleDarkMode);
  completeAndAddBtn.addEventListener("click", () => addTodo(true));

  // Auth Event Listeners
  authEntryBtn.addEventListener("click", () => {
    currentAuthMode = "login";
    toggleAuthModalUI();
    authModal.style.display = "flex";
  });
  logoutBtn.addEventListener("click", logoutUser);

  authForm.addEventListener("submit", handleAuth);
  toggleAuthMode.addEventListener("click", toggleAuthModalUI);
  closeAuthModalBtn.addEventListener(
    "click",
    () => (authModal.style.display = "none")
  );

  window.addEventListener("click", (event) => {
    if (event.target === authModal) {
      authModal.style.display = "none";
    }
  });

  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderTodos();
  });

  // Fix for menu items and category items not setting filter/category correctly
  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      currentFilter = item.dataset.filter || "all";
      // Reset category filter when changing main menu filter
      currentCategory = "all";
      categoryItems.forEach((i) => i.classList.remove("active"));
      renderTodos();
    });
  });

  categoryItems.forEach((item) => {
    item.addEventListener("click", () => {
      categoryItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      currentCategory =
        item.dataset.category === "all" ? "all" : item.dataset.category;
      // Reset main menu filter when changing category filter
      currentFilter = "all";
      menuItems.forEach((i) => i.classList.remove("active"));
      document
        .querySelector('.menu-item[data-filter="all"]')
        .classList.add("active");
      renderTodos();
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilter = tab.dataset.filter || "all"; // Use data-filter attribute for tabs
      renderTodos();
    });
  });

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];
  dueDateInput.min = today;

  // Initial calls
  checkAuthStatus();
  renderTodos();
});
