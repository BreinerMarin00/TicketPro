-- Base de datos de TicketPro

CREATE DATABASE IF NOT EXISTS ticketpro CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ticketpro;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  prioridad ENUM('Baja', 'Media', 'Alta') NOT NULL DEFAULT 'Media',
  estado ENUM('Abierto', 'En proceso', 'Resuelto') NOT NULL DEFAULT 'Abierto',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) AUTO_INCREMENT = 101;
