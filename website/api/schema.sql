-- Daily Dua MariaDB Schema

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name_bangla VARCHAR(150) NOT NULL,
    subtitle_bangla VARCHAR(255) DEFAULT '',
    time_bangla VARCHAR(100) DEFAULT '',
    icon VARCHAR(50) DEFAULT 'sunny-outline',
    has_progress TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS duas (
    id VARCHAR(50) PRIMARY KEY,
    title_bangla VARCHAR(255) NOT NULL,
    arabic TEXT NOT NULL,
    uccharon_bangla TEXT NOT NULL,
    meaning_bangla TEXT NOT NULL,
    fazilat_bangla TEXT NOT NULL,
    reference_bangla VARCHAR(255) NOT NULL,
    repetition_count INT DEFAULT 1,
    repetition_text VARCHAR(50) DEFAULT '১ বার',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS category_duas (
    category_id VARCHAR(50) NOT NULL,
    dua_id VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    PRIMARY KEY (category_id, dua_id),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (dua_id) REFERENCES duas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(50) PRIMARY KEY,
    setting_value TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initialize data_version if not present
INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('data_version', '1');
INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('last_updated', NOW());
