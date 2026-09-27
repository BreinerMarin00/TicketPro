<?php
// Conexión a la base de datos MySQL de TicketPro
// Cambia estos datos según tu instalación de MySQL.
$host = 'localhost';
$db   = 'ticketpro';
$user = 'root';
$pass = 'root';

header('Content-Type: application/json; charset=utf-8');
session_start();

try {
  $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'mensaje' => 'No se pudo conectar a la base de datos.']);
  exit;
}

// Responde en JSON y termina la ejecución
function responder($datos, $codigo = 200)
{
  http_response_code($codigo);
  echo json_encode($datos);
  exit;
}

// Lee el cuerpo JSON enviado con fetch
function leerJson()
{
  return json_decode(file_get_contents('php://input'), true) ?? [];
}
