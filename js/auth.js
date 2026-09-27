// Script para la interacción de Login y Registro en TicketPro

document.addEventListener('DOMContentLoaded', () => {
  // Manejo de mostrar / ocultar contraseñas
  const toggleButtons = document.querySelectorAll('.toggle-password-btn');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');

      // Cambiar icono SVG (ojo abierto / ojo cerrado)
      btn.innerHTML = isPassword ? getEyeOffSvg() : getEyeSvg();
    });
  });

  // Manejo del formulario de Login (index.html)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userInput = document.getElementById('username').value.trim();
      const passwordInput = document.getElementById('password').value.trim();
      const alertBox = document.getElementById('authAlert');

      if (!userInput || !passwordInput) {
        if (alertBox) {
          alertBox.textContent = 'Por favor ingresa usuario y contraseña.';
          alertBox.style.display = 'block';
        }
        return;
      }

      // Validar credenciales contra la base de datos
      enviarJson('api/login.php', { usuario: userInput, password: passwordInput })
        .then(res => {
          if (!res.ok) {
            mostrarAlerta(alertBox, res.mensaje);
            return;
          }
          localStorage.setItem('ticketpro_user', res.username);
          window.location.href = 'dashboard.html';
        })
        .catch(() => mostrarAlerta(alertBox, 'No se pudo conectar con el servidor.'));
    });
  }

  // Manejo del formulario de Registro (registro.html)
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('fullName').value.trim();
      const email = document.getElementById('email').value.trim();
      const username = document.getElementById('regUsername').value.trim();
      const pass = document.getElementById('regPassword').value;
      const confirmPass = document.getElementById('regConfirmPassword').value;
      const alertBox = document.getElementById('regAlert');

      if (!fullName || !email || !username || !pass || !confirmPass) {
        if (alertBox) {
          alertBox.textContent = 'Por favor completa todos los campos.';
          alertBox.style.display = 'block';
        }
        return;
      }

      if (pass !== confirmPass) {
        if (alertBox) {
          alertBox.textContent = 'Las contraseñas no coinciden.';
          alertBox.style.display = 'block';
        }
        return;
      }

      // Guardar el usuario en la base de datos
      enviarJson('api/registro.php', { nombre: fullName, email: email, username: username, password: pass })
        .then(res => {
          if (!res.ok) {
            mostrarAlerta(alertBox, res.mensaje);
            return;
          }
          localStorage.setItem('ticketpro_user', res.username);
          alert('¡Cuenta creada exitosamente! Bienvenido a TicketPro.');
          window.location.href = 'dashboard.html';
        })
        .catch(() => mostrarAlerta(alertBox, 'No se pudo conectar con el servidor.'));
    });
  }
});

// Envía datos en JSON a un archivo PHP y devuelve la respuesta
function enviarJson(url, datos) {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  }).then(r => r.json());
}

function mostrarAlerta(alertBox, mensaje) {
  if (!alertBox) return;
  alertBox.textContent = mensaje;
  alertBox.style.display = 'block';
}

function getEyeSvg() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>`;
}

function getEyeOffSvg() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>`;
}
