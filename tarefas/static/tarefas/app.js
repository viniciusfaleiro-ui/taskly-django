const state = { token: localStorage.getItem("todo_token"), username: localStorage.getItem("todo_user"), tasks: [] };
const $ = (id) => document.getElementById(id);

function applyTheme(theme) {
  const selected = ["garden", "amber", "neon"].includes(theme) ? theme : "garden";
  document.body.classList.remove("theme-amber", "theme-neon");
  if (selected !== "garden") document.body.classList.add(`theme-${selected}`);
  $("theme-select").value = selected;
  localStorage.setItem("todo_theme", selected);
}

function showApp() {
  $("login-view").classList.toggle("hidden", Boolean(state.token));
  $("app-view").classList.toggle("hidden", !state.token);
  $("user-name").textContent = state.username || "usuário";
  $("profile-name").textContent = state.username || "usuário";
  $("user-avatar").textContent = (state.username || "U").charAt(0).toUpperCase();
  $("date-label").textContent = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date()).toUpperCase();
}

function csrfToken() {
  return document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("csrftoken="))?.split("=")[1] || "";
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Token ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  if (response.status === 401) { logout(); throw new Error("Sua sessão expirou. Entre novamente."); }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || Object.values(data).flat().join(" ") || "Não foi possível concluir a operação.");
  return data;
}

function renderTasks() {
  const list = $("task-list");
  const status = $("status-filter").value;
  const priority = $("priority-filter").value;
  const search = $("search-filter").value.toLowerCase().trim();
  const visible = state.tasks.filter((task) => (!status || String(task.concluida) === status) && (!priority || task.prioridade === priority) && (!search || `${task.titulo} ${task.descricao}`.toLowerCase().includes(search)));
  $("total-count").textContent = state.tasks.length;
  $("done-count").textContent = state.tasks.filter((task) => task.concluida).length;
  $("pending-count").textContent = state.tasks.filter((task) => !task.concluida).length;
  if (!visible.length) { list.innerHTML = '<div class="empty">Nenhuma tarefa encontrada. Que tal criar uma?</div>'; return; }
  list.innerHTML = visible.map((task) => {
    const priorityLabel = { ALTA: "Alta", MEDIA: "Média", BAIXA: "Baixa" }[task.prioridade];
    const due = task.data_limite ? new Date(`${task.data_limite}T00:00:00`).toLocaleDateString("pt-BR") : "Sem prazo";
    return `<article class="task-card ${task.concluida ? "is-done" : ""}"><div class="task-main"><button class="check" data-action="toggle" data-id="${task.id}" aria-label="Marcar tarefa como ${task.concluida ? "pendente" : "concluída"}">${task.concluida ? "✓" : ""}</button><div><h3 class="task-title">${escapeHtml(task.titulo)}</h3>${task.descricao ? `<p class="task-description">${escapeHtml(task.descricao)}</p>` : ""}</div></div><div class="task-meta"><span class="badge ${task.prioridade.toLowerCase()}">${priorityLabel}</span><span class="badge">⌁ ${due}</span></div><div class="task-actions"><button class="text-button" data-action="edit" data-id="${task.id}">Editar</button><button class="text-button delete" data-action="delete" data-id="${task.id}">Excluir</button></div></article>`;
  }).join("");
}

function escapeHtml(value) { const div = document.createElement("div"); div.textContent = value; return div.innerHTML; }
async function loadTasks() { $("task-list").innerHTML = '<div class="loading">Atualizando...</div>'; try { state.tasks = await api("/api/tarefas/"); renderTasks(); } catch (error) { $("task-list").innerHTML = `<div class="empty">${escapeHtml(error.message)}</div>`; } }
function resetForm() { $("task-form").reset(); $("task-id").value = ""; $("task-priority").value = "MEDIA"; $("save-task").textContent = "Adicionar tarefa"; $("cancel-edit").classList.add("hidden"); }
function logout() { localStorage.removeItem("todo_token"); localStorage.removeItem("todo_user"); state.token = null; state.username = null; showApp(); }

$("login-form").addEventListener("submit", async (event) => { event.preventDefault(); $("login-error").textContent = ""; try { const data = await fetch("/api/login/", { method:"POST", headers:{"Content-Type":"application/json","X-CSRFToken":csrfToken()}, body:JSON.stringify({username:$("username").value,password:$("password").value}) }); const result = await data.json(); if (!data.ok) throw new Error("Usuário ou senha inválidos."); state.token = result.token; state.username = result.usuario; localStorage.setItem("todo_token", state.token); localStorage.setItem("todo_user", state.username); showApp(); loadTasks(); } catch (error) { $("login-error").textContent = error.message; } });
$("task-form").addEventListener("submit", async (event) => { event.preventDefault(); $("task-error").textContent = ""; const id = $("task-id").value; const payload = { titulo:$("task-title").value, descricao:$("task-description").value, prioridade:$("task-priority").value, data_limite:$("task-due-date").value || null }; try { await api(id ? `/api/tarefas/${id}/` : "/api/tarefas/", { method:id ? "PATCH" : "POST", body:JSON.stringify(payload) }); resetForm(); await loadTasks(); } catch (error) { $("task-error").textContent = error.message; } });
$("task-list").addEventListener("click", async (event) => { const button = event.target.closest("button[data-action]"); if (!button) return; const task = state.tasks.find((item) => String(item.id) === button.dataset.id); if (!task) return; try { if (button.dataset.action === "toggle") await api(`/api/tarefas/${task.id}/`, { method:"PATCH", body:JSON.stringify({ concluida:!task.concluida }) }); if (button.dataset.action === "delete" && confirm("Excluir esta tarefa?")) await api(`/api/tarefas/${task.id}/`, { method:"DELETE" }); if (button.dataset.action === "edit") { $("task-id").value=task.id; $("task-title").value=task.titulo; $("task-description").value=task.descricao; $("task-priority").value=task.prioridade; $("task-due-date").value=task.data_limite || ""; $("save-task").textContent="Salvar alterações"; $("cancel-edit").classList.remove("hidden"); window.scrollTo({top:0,behavior:"smooth"}); return; } await loadTasks(); } catch (error) { alert(error.message); } });
$("cancel-edit").addEventListener("click", resetForm); $("logout-button").addEventListener("click", logout); $("refresh-button").addEventListener("click", loadTasks); $("status-filter").addEventListener("change", renderTasks); $("priority-filter").addEventListener("change", renderTasks); $("search-filter").addEventListener("input", renderTasks); $("theme-select").addEventListener("change", (event) => applyTheme(event.target.value)); applyTheme(localStorage.getItem("todo_theme") || "garden"); showApp(); if (state.token) loadTasks();
