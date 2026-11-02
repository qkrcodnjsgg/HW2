const STORAGE_KEY = "hw2-todo-list";
let todos = loadTodos();
let currentFilter = "all";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const progressText = document.querySelector("#progress-text");
const progressBar = document.querySelector("#progress-bar");

document.querySelector("#today-date").textContent = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date());
document.querySelector("#day-name").textContent = new Intl.DateTimeFormat("ko-KR", { weekday: "long" }).format(new Date());

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.unshift({ id: Date.now(), text, completed: false });
  saveAndRender();
  input.value = "";
  input.focus();
});

list.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) return;
  const id = Number(item.dataset.id);
  if (event.target.closest(".check-button")) {
    todos = todos.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
  } else if (event.target.closest(".delete-button")) {
    todos = todos.filter((todo) => todo.id !== id);
  }
  saveAndRender();
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
});

document.querySelector("#clear-completed").addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveAndRender();
});

function loadTodos() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  render();
}

function render() {
  const visibleTodos = todos.filter((todo) => currentFilter === "all" || (currentFilter === "completed" ? todo.completed : !todo.completed));
  list.innerHTML = visibleTodos.map((todo) => `
    <li class="todo-item ${todo.completed ? "completed" : ""}" data-id="${todo.id}">
      <button class="check-button" type="button" aria-label="${todo.completed ? "완료 취소" : "완료 처리"}">${todo.completed ? "✓" : ""}</button>
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="delete-button" type="button" aria-label="할 일 삭제">×</button>
    </li>`).join("");
  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;
  progressText.textContent = todos.length ? `${activeCount}개 남음 · ${completedCount}개 완료` : "0개의 할 일";
  progressBar.style.width = todos.length ? `${(completedCount / todos.length) * 100}%` : "0%";
  emptyState.hidden = visibleTodos.length > 0;
  if (!todos.length) emptyTitle.textContent = "아직 등록된 할 일이 없어요";
  else if (currentFilter === "completed") emptyTitle.textContent = "완료한 할 일이 없어요";
  else if (currentFilter === "active") emptyTitle.textContent = "모든 할 일을 완료했어요!";
  else emptyTitle.textContent = "표시할 할 일이 없어요";
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

render();
