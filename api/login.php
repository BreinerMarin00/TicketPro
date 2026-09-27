<?php
require 'conexion.php';

$datos = leerJson();
$usuario  = trim($datos['usuario'] ?? '');
$password = $datos['password'] ?? '';

if (!$usuario || !$password) {
  responder(['ok' => false, 'mensaje' => 'Por favor ingresa usuario y contraseña.'], 400);
}

// Se puede entrar con nombre de usuario o correo
$stmt = $pdo->prepare('SELECT id, username, password FROM usuarios WHERE username = ? OR email = ?');
$stmt->execute([$usuario, $usuario]);
$fila = $stmt->fetch();

if (!$fila || !password_verify($password, $fila['password'])) {
  responder(['ok' => false, 'mensaje' => 'Usuario o contraseña incorrectos.'], 401);
}

$_SESSION['usuario_id'] = $fila['id'];
$_SESSION['username'] = $fila['username'];

responder(['ok' => true, 'username' => $fila['username']]);
