const state = {
  editingId: null,
  atendClienteId: null,
};

async function apiFetch(path, options = {}) {
  try {
    const res = await fetch(path, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json() : null;
    if (!res.ok) {
      const msg = data && data.error ? data.error : "Falha na requisição";
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    alert(err.message || "Erro inesperado");
    return null;
  }
}

function clearForm() {
  state.editingId = null;
  document.getElementById("cliente-id").value = "";
  document.getElementById("nome").value = "";
  document.getElementById("telefone").value = "";
  document.getElementById("email").value = "";
  document.getElementById("servico").value = "";
  document.getElementById("observacoes").value = "";
  document.getElementById("btn-salvar").textContent = "Salvar";
}

async function loadClientes(term = "") {
  const q = term ? `?q=${encodeURIComponent(term)}` : "";
  const list = await apiFetch(`/api/clientes${q}`);
  if (!list) return;
  const container = document.getElementById("lista-clientes");
  container.innerHTML = "";
  list.forEach((c) => {
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="info">
        <div class="title">${escapeHtml(c.nome || "")}</div>
        <div class="sub">${escapeHtml(c.telefone || "")} ${c.email ? "• " + escapeHtml(c.email) : ""}</div>
        <div class="sub">${c.servico ? escapeHtml(c.servico) : ""}</div>
      </div>
      <div class="actions">
        <button class="small" data-action="editar">Editar</button>
        <button class="small" data-action="atendimentos">Atendimentos</button>
        <button class="small danger" data-action="excluir">Excluir</button>
      </div>
    `;
    el.querySelector('[data-action="editar"]').addEventListener("click", () => fillForm(c));
    el.querySelector('[data-action="excluir"]').addEventListener("click", () => deleteCliente(c.id));
    el.querySelector('[data-action="atendimentos"]').addEventListener("click", () => openAtendimentos(c));
    container.appendChild(el);
  });
}

function fillForm(c) {
  state.editingId = c.id;
  document.getElementById("cliente-id").value = c.id;
  document.getElementById("nome").value = c.nome || "";
  document.getElementById("telefone").value = c.telefone || "";
  document.getElementById("email").value = c.email || "";
  document.getElementById("servico").value = c.servico || "";
  document.getElementById("observacoes").value = c.observacoes || "";
  document.getElementById("btn-salvar").textContent = "Atualizar";
}

async function saveCliente(e) {
  e.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const email = document.getElementById("email").value.trim();
  const servico = document.getElementById("servico").value.trim();
  const observacoes = document.getElementById("observacoes").value.trim();
  const body = { nome, telefone, email, servico, observacoes };
  if (state.editingId) {
    const ok = await apiFetch(`/api/clientes/${state.editingId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    if (ok) {
      alert("Cliente atualizado");
      clearForm();
      loadClientes(document.getElementById("busca").value.trim());
    }
  } else {
    const created = await apiFetch("/api/clientes", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (created) {
      alert("Cliente cadastrado");
      clearForm();
      loadClientes(document.getElementById("busca").value.trim());
    }
  }
}

async function deleteCliente(id) {
  if (!confirm("Excluir cliente? Esta ação não pode ser desfeita.")) return;
  const ok = await apiFetch(`/api/clientes/${id}`, { method: "DELETE" });
  if (ok) {
    alert("Cliente excluído");
    loadClientes(document.getElementById("busca").value.trim());
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function openAtendimentos(cliente) {
  state.atendClienteId = cliente.id;
  document.getElementById("modal-title").textContent = `Atendimentos • ${cliente.nome}`;
  document.getElementById("modal-atendimentos").classList.remove("hidden");
  document.getElementById("at-data").value = new Date().toISOString().slice(0, 10);
  document.getElementById("at-servico").value = "";
  document.getElementById("at-valor").value = "";
  document.getElementById("at-observacoes").value = "";
  loadAtendimentos(cliente.id);
}

function closeAtendimentos() {
  state.atendClienteId = null;
  document.getElementById("modal-atendimentos").classList.add("hidden");
}

async function loadAtendimentos(clienteId) {
  const list = await apiFetch(`/api/clientes/${clienteId}/atendimentos`);
  if (!list) return;
  const container = document.getElementById("lista-atendimentos");
  container.innerHTML = "";
  if (list.length === 0) {
    const empty = document.createElement("div");
    empty.className = "item";
    empty.innerHTML = `<div class="info"><div class="sub">Nenhum atendimento registrado</div></div>`;
    container.appendChild(empty);
    return;
  }
  list.forEach((a) => {
    const date = new Date(a.data);
    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="info">
        <div class="title">${date.toLocaleDateString("pt-BR")}${a.servico ? " • " + escapeHtml(a.servico) : ""}</div>
        <div class="sub">${a.valor != null ? "R$ " + Number(a.valor).toFixed(2) : ""}</div>
        <div class="sub">${a.observacoes ? escapeHtml(a.observacoes) : ""}</div>
      </div>
    `;
    container.appendChild(el);
  });
}

async function addAtendimento(e) {
  e.preventDefault();
  if (!state.atendClienteId) return;
  const data = document.getElementById("at-data").value;
  const servico = document.getElementById("at-servico").value.trim();
  const valor = document.getElementById("at-valor").value.trim();
  const observacoes = document.getElementById("at-observacoes").value.trim();
  const created = await apiFetch(`/api/clientes/${state.atendClienteId}/atendimentos`, {
    method: "POST",
    body: JSON.stringify({ data, servico, valor, observacoes }),
  });
  if (created) {
    alert("Atendimento adicionado");
    loadAtendimentos(state.atendClienteId);
    const s = document.getElementById("at-servico");
    const v = document.getElementById("at-valor");
    const o = document.getElementById("at-observacoes");
    if (s) s.value = "";
    if (v) v.value = "";
    if (o) o.value = "";
  }
}

function setupEvents() {
  const fc = document.getElementById("form-cliente");
  if (fc) fc.addEventListener("submit", saveCliente);
  const bc = document.getElementById("btn-cancelar");
  if (bc) bc.addEventListener("click", clearForm);
  const b = document.getElementById("busca");
  if (b)
    b.addEventListener("input", (e) => {
      const term = e.target.value.trim();
      loadClientes(term);
    });
  const mf = document.getElementById("modal-fechar");
  if (mf) mf.addEventListener("click", closeAtendimentos);
  const fa = document.getElementById("form-atendimento");
  if (fa) fa.addEventListener("submit", addAtendimento);
}

function init() {
  setupEvents();
  loadClientes();
}

try {
  init();
} catch (err) {
  alert("Falha ao iniciar a aplicação");
}

