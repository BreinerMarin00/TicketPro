<?php
require 'conexion.php';

// Solo usuarios con sesión iniciada
if (empty($_SESSION['usuario_id'])) {
  responder(['ok' => false, 'mensaje' => 'Debes iniciar sesión.'], 401);
}
$usuarioId = $_SESSION['usuario_id'];
$metodo = $_SERVER['REQUEST_METHOD'];

// Listar los tickets del usuario
if ($metodo === 'GET') {
  $stmt = $pdo->prepare(
    "SELECT id, titulo, descripcion, prioridad, estado,
            DATE_FORMAT(fecha_creacion, '%d/%m/%Y') AS fecha
     FROM tickets WHERE usuario_id = ? ORDER BY id DESC"
  );
  $stmt->execute([$usuarioId]);
  responder(['ok' => true, 'username' => $_SESSION['username'], 'tickets' => $stmt->fetchAll()]);
}

// Crear un ticket nuevo
if ($metodo === 'POST') {
  $datos = leerJson();
  $titulo      = trim($datos['titulo'] ?? '');
  $descripcion = trim($datos['descripcion'] ?? '');
  $prioridad   = $datos['prioridad'] ?? 'Media';

  if (!$titulo) {
    responder(['ok' => false, 'mensaje' => 'El título es obligatorio.'], 400);
  }
  if (!in_array($prioridad, ['Baja', 'Media', 'Alta'])) {
    $prioridad = 'Media';
  }

  $stmt = $pdo->prepare('INSERT INTO tickets (usuario_id, titulo, descripcion, prioridad) VALUES (?, ?, ?, ?)');
  $stmt->execute([$usuarioId, $titulo, $descripcion ?: 'Sin descripción adicional.', $prioridad]);
  responder(['ok' => true, 'id' => $pdo->lastInsertId()]);
}

// Cambiar el estado de un ticket
if ($metodo === 'PUT') {
  $datos = leerJson();
  $estado = $datos['estado'] ?? '';
  if (!in_array($estado, ['Abierto', 'En proceso', 'Resuelto'])) {
    responder(['ok' => false, 'mensaje' => 'Estado no válido.'], 400);
  }

  $stmt = $pdo->prepare('UPDATE tickets SET estado = ? WHERE id = ? AND usuario_id = ?');
  $stmt->execute([$estado, $datos['id'] ?? 0, $usuarioId]);
  responder(['ok' => true]);
}

// Eliminar un ticket
if ($metodo === 'DELETE') {
  $datos = leerJson();
  $stmt = $pdo->prepare('DELETE FROM tickets WHERE id = ? AND usuario_id = ?');
  $stmt->execute([$datos['id'] ?? 0, $usuarioId]);
  responder(['ok' => true]);
}

responder(['ok' => false, 'mensaje' => 'Método no permitido.'], 405);
