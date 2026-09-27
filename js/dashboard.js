// Lógica interactiva simple para el Dashboard de TicketPro

let currentFilter = 'todos';
let tickets = [];

// Llamada generica a api/tickets.php
function apiTickets(method, datos) {
  const opciones = { method: method, headers: { 'Content-Type': 'application/json' } };
  if (datos) opciones.body = JSON.stringify(datos);

  return fetch('api/tickets.php', opciones).then(r => {
    // Sin sesión iniciada
    if (r.status === 401) {
      localStorage.removeItem('ticketpro_user');
      window.location.href = 'index.html';
    }
    return r.json();
  });
}

// Cargar tickets desde la base de datos
function cargarTickets() {
  return apiTickets('GET').then(res => {
    if (!res.ok) return;
    tickets = res.tickets;

    const userNameElem = document.getElementById('userNameDisplay');
    if (userNameElem) userNameElem.textContent = res.username;

    renderTickets();
    updateCounters();
  });
}

// Inicialización de la página
document.addEventListener('DOMContentLoaded', () => {
  // Cargar nombre de usuario
  const loggedUser = localStorage.getItem('ticketpro_user') || 'Usuario';
  const userNameElem = document.getElementById('userNameDisplay');
  if (userNameElem) {
    userNameElem.textContent = loggedUser;
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('ticketpro_user');
      fetch('api/logout.php').finally(() => {
        window.location.href = 'index.html';
      });
    });
  }

  // Carga inicial
  cargarTickets();

  // Filtros
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderTickets();
    });
  });

  // Modal Nuevo Ticket
  const modal = document.getElementById('ticketModal');
  const btnOpenModal = document.getElementById('btnOpenModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCancelModal = document.getElementById('btnCancelModal');
  const newTicketForm = document.getElementById('newTicketForm');

  if (btnOpenModal && modal) {
    btnOpenModal.addEventListener('click', () => {
      modal.classList.add('open');
      document.getElementById('ticketTitle').focus();
    });
  }

  const closeModal = () => {
    if (modal) modal.classList.remove('open');
    if (newTicketForm) newTicketForm.reset();
  };

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Formulario nuevo ticket: se guarda en la base de datos
  if (newTicketForm) {
    newTicketForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('ticketTitle').value.trim();
      const desc = document.getElementById('ticketDesc').value.trim();
      const priority = document.getElementById('ticketPriority').value;

      if (!title) return;

      apiTickets('POST', { titulo: title, descripcion: desc, prioridad: priority })
        .then(res => {
          if (!res.ok) {
            alert(res.mensaje);
            return;
          }
          closeModal();
          cargarTickets();
        })
        .catch(() => alert('No se pudo guardar el ticket.'));
    });
  }
});

// Renderizar tabla de tickets
function renderTickets() {
  const tableBody = document.getElementById('ticketsTableBody');
  const emptyState = document.getElementById('emptyState');
  if (!tableBody) return;

  let filtered = tickets;

  if (currentFilter === 'abiertos') {
    filtered = tickets.filter(t => t.estado === 'Abierto' || t.estado === 'En proceso');
  } else if (currentFilter === 'resueltos') {
    filtered = tickets.filter(t => t.estado === 'Resuelto');
  }

  tableBody.innerHTML = '';

  if (filtered.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  filtered.forEach(ticket => {
    const tr = document.createElement('tr');

    let badgeClass = 'badge-open';
    if (ticket.estado === 'En proceso') badgeClass = 'badge-progress';
    if (ticket.estado === 'Resuelto') badgeClass = 'badge-resolved';

    let priorityClass = 'badge-priority-baja';
    if (ticket.prioridad === 'Media') priorityClass = 'badge-priority-media';
    if (ticket.prioridad === 'Alta') priorityClass = 'badge-priority-alta';

    tr.innerHTML = `
      <td class="ticket-id">TK-${ticket.id}</td>
      <td>
        <div class="ticket-title">${escapeHtml(ticket.titulo)}</div>
        <div class="ticket-desc">${escapeHtml(ticket.descripcion)}</div>
      </td>
      <td><span class="badge ${priorityClass}">${ticket.prioridad}</span></td>
      <td><span class="badge ${badgeClass}">${ticket.estado}</span></td>
      <td>${ticket.fecha}</td>
      <td>
        <div class="table-actions">
          <button class="btn-action" onclick="toggleTicketStatus(${ticket.id})" title="Cambiar estado">
            ${ticket.estado === 'Resuelto' ? 'Reabrir' : 'Resolver'}
          </button>
          <button class="btn-action btn-delete" onclick="deleteTicket(${ticket.id})" title="Eliminar ticket">
            Eliminar
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// Actualizar contadores
function updateCounters() {
  const total = tickets.length;
  const abiertos = tickets.filter(t => t.estado === 'Abierto' || t.estado === 'En proceso').length;
  const resueltos = tickets.filter(t => t.estado === 'Resuelto').length;

  const countTotal = document.getElementById('countTotal');
  const countOpen = document.getElementById('countOpen');
  const countClosed = document.getElementById('countClosed');

  if (countTotal) countTotal.textContent = total;
  if (countOpen) countOpen.textContent = abiertos;
  if (countClosed) countClosed.textContent = resueltos;
}

// Cambiar estado de un ticket
window.toggleTicketStatus = function(ticketId) {
  const ticket = tickets.find(t => t.id == ticketId);
  if (!ticket) return;

  let nuevoEstado = 'Abierto';
  if (ticket.estado === 'Abierto') nuevoEstado = 'En proceso';
  else if (ticket.estado === 'En proceso') nuevoEstado = 'Resuelto';

  apiTickets('PUT', { id: ticketId, estado: nuevoEstado }).then(cargarTickets);
};

// Eliminar un ticket
window.deleteTicket = function(ticketId) {
  if (!confirm('¿Deseas eliminar este ticket?')) return;
  apiTickets('DELETE', { id: ticketId }).then(cargarTickets);
};

// Escapar texto para seguridad
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
