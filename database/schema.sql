-- AminchiData Database Schema
-- Run this SQL to set up the MySQL database.

CREATE DATABASE IF NOT EXISTS aminchidata
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE aminchidata;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(100)   NOT NULL,
  email          VARCHAR(255)   NOT NULL UNIQUE,
  phone          VARCHAR(20)    NOT NULL,
  password       VARCHAR(255)   NOT NULL,
  wallet_balance DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  is_admin       TINYINT(1)     NOT NULL DEFAULT 0,
  created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME       NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT            NOT NULL,
  reference   VARCHAR(50)    NOT NULL UNIQUE,
  type        VARCHAR(30)    NOT NULL COMMENT 'Data, Airtime, Education, Electricity',
  description VARCHAR(255)   NOT NULL,
  amount      DECIMAL(12,2)  NOT NULL,
  status      VARCHAR(20)    NOT NULL DEFAULT 'Pending' COMMENT 'Pending, Success, Failed',
  phone       VARCHAR(20)    DEFAULT '',
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Education PINs table
CREATE TABLE IF NOT EXISTS education_pins (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          NOT NULL,
  service      VARCHAR(20)  NOT NULL COMMENT 'WAEC, NECO, NABTEB',
  pin          VARCHAR(30)  NOT NULL,
  serial_number VARCHAR(30) NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Payments table (for payment gateway records)
CREATE TABLE IF NOT EXISTS payments (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT            NOT NULL,
  gateway         VARCHAR(30)    NOT NULL COMMENT 'paystack, flutterwave',
  gateway_ref     VARCHAR(100)   NOT NULL,
  amount          DECIMAL(12,2)  NOT NULL,
  status          VARCHAR(20)    NOT NULL DEFAULT 'pending',
  metadata        JSON           NULL,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Platform settings table (admin-managed)
CREATE TABLE IF NOT EXISTS settings (
  setting_key   VARCHAR(100)  PRIMARY KEY,
  setting_value TEXT          NOT NULL,
  updated_at    DATETIME      NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Indexes for performance
CREATE INDEX idx_transactions_user   ON transactions(user_id);
CREATE INDEX idx_transactions_type   ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_education_pins_user ON education_pins(user_id);
CREATE INDEX idx_payments_user       ON payments(user_id);
CREATE INDEX idx_payments_gateway    ON payments(gateway_ref);

-- Seed demo user (password: password123)
INSERT INTO users (name, email, phone, password, wallet_balance, is_admin) VALUES
('Demo User', 'demo@aminchidata.com', '08012345678', '$2y$10$6TebKN58e4rp5W5ti2X9Xe5mmsV9Q889MunbshmLF5TANON2yO7tq', 5000.00, 0);

-- Seed admin user (password: admin123)
INSERT INTO users (name, email, phone, password, wallet_balance, is_admin) VALUES
('Admin User', 'admin@aminchidata.com', '08098765432', '$2y$10$fydVkD9.9QEwr2mW8cDcv.ZHK/T6tCED4JX5xNAHI0XYWy8hg.wcO', 0.00, 1);

-- Seed default settings
INSERT INTO settings (setting_key, setting_value) VALUES
('site_name', 'AminchiData'),
('airtime_discount', '2'),
('min_wallet_fund', '100'),
('min_electricity_amount', '1000');
