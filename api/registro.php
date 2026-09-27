<?php
require 'conexion.php';

$datos = leerJson();
$nombre   = trim($datos['nombre'] ?? '');
$email    = trim($datos['email'] ?? '');
$username = trim($datos['username'] ?? '');
$password = $datos['password'] ?? '';

if (!$nombre || !$email || !$username || !$password) {
  responder(['ok' => false, 'mensaje' => 'Por favor completa todos los campos.'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  responder(['ok' => false, 'mensaje' => 'El correo electrónico no es válido.'], 400);
}

// Verificar que el usuario o correo no existan
$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE username = ? OR email = ?');
$stmt->execute([$username, $email]);
if ($stmt->fetch()) {
  responder(['ok' => false, 'mensaje' => 'El usuario o correo ya está registrado.'], 409);
}

$stmt = $pdo->prepare('INSERT INTO usuarios (nombre_completo, email, username, password) VALUES (?, ?, ?, ?)');
$stmt->execute([$nombre, $email, $username, password_hash($password, PASSWORD_DEFAULT)]);

// Dejar la sesión iniciada después del registro
$_SESSION['usuario_id'] = $pdo->lastInsertId();
$_SESSION['username'] = $username;

responder(['ok' => true, 'username' => $username]);
