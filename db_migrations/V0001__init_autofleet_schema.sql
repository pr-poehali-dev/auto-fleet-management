-- Создание таблицы автомобилей
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) UNIQUE NOT NULL,
    brand VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    fuel_level INTEGER DEFAULT 100,
    location VARCHAR(255) NOT NULL,
    driver_name VARCHAR(255),
    mileage_today INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы водителей
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    license VARCHAR(100) NOT NULL,
    experience INTEGER,
    rating DECIMAL(3,2) DEFAULT 5.0,
    trips INTEGER DEFAULT 0,
    efficiency INTEGER DEFAULT 100,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы графика ТО
CREATE TABLE IF NOT EXISTS maintenance_schedule (
    id SERIAL PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    maintenance_type VARCHAR(255) NOT NULL,
    scheduled_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    vehicle_id VARCHAR(50),
    severity VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка тестовых данных автомобилей
INSERT INTO vehicles (vehicle_id, brand, status, fuel_level, location, driver_name, mileage_today) VALUES
('A-101', 'Mercedes Sprinter', 'active', 85, 'Москва, ул. Тверская', 'Иванов И.И.', 234),
('A-102', 'Ford Transit', 'active', 62, 'Санкт-Петербург, Невский пр.', 'Петров П.П.', 189),
('A-103', 'Volkswagen Crafter', 'maintenance', 15, 'СТО №4', '—', 12),
('A-104', 'Iveco Daily', 'inactive', 0, 'Парковка центральная', '—', 0),
('A-105', 'GAZ Next', 'active', 91, 'Казань, пр. Победы', 'Сидоров С.С.', 312);

-- Вставка тестовых данных водителей
INSERT INTO drivers (name, phone, license, experience, rating, trips, efficiency, status) VALUES
('Иванов Иван Иванович', '+7 (999) 123-45-67', '99 01 123456', 10, 4.9, 234, 96, 'active'),
('Петров Петр Петрович', '+7 (999) 234-56-78', '99 02 234567', 8, 4.7, 198, 92, 'active'),
('Сидоров Сергей Сергеевич', '+7 (999) 345-67-89', '99 03 345678', 12, 4.8, 267, 94, 'active'),
('Кузнецов Алексей Павлович', '+7 (999) 456-78-90', '99 04 456789', 5, 4.6, 156, 89, 'inactive');

-- Вставка тестовых данных графика ТО
INSERT INTO maintenance_schedule (vehicle_id, maintenance_type, scheduled_date, status) VALUES
('A-101', 'ТО-2', '2026-02-15', 'scheduled'),
('A-103', 'Ремонт подвески', CURRENT_DATE, 'inProgress'),
('A-102', 'Замена масла', '2026-02-22', 'scheduled');

-- Вставка тестовых уведомлений
INSERT INTO notifications (type, title, message, vehicle_id, severity) VALUES
('fuel', 'Критический уровень топлива', 'A-103 • 15%', 'A-103', 'error'),
('maintenance', 'Плановое ТО сегодня', 'A-101 • 14:00', 'A-101', 'warning'),
('insurance', 'Истекает страховка', 'A-107 • через 5 дней', 'A-107', 'info');

-- Создание индексов для производительности
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_schedule(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);