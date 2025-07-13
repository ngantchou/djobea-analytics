-- Schéma de base de données pour Djobea Analytics

-- Table des utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des prestataires
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  zone VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  hourly_rate_min INTEGER,
  hourly_rate_max INTEGER,
  avatar_url TEXT,
  joined_date DATE DEFAULT CURRENT_DATE,
  last_active TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des compétences des prestataires
CREATE TABLE provider_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des demandes de service
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(20) NOT NULL,
  client_email VARCHAR(255),
  service_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  address TEXT,
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(20) DEFAULT 'pending',
  estimated_duration INTEGER,
  estimated_cost DECIMAL(10,2),
  assigned_provider_id UUID REFERENCES providers(id),
  scheduled_date TIMESTAMP,
  completed_at TIMESTAMP,
  cancel_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des avis
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES service_requests(id),
  provider_id UUID REFERENCES providers(id),
  client_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des transactions financières
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES service_requests(id),
  provider_id UUID REFERENCES providers(id),
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'payment', 'commission', 'refund'
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les performances
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_specialty ON providers(specialty);
CREATE INDEX idx_providers_zone ON providers(zone);
CREATE INDEX idx_requests_status ON service_requests(status);
CREATE INDEX idx_requests_created_at ON service_requests(created_at);
CREATE INDEX idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX idx_transactions_created_at ON transactions(transaction_date);

-- Vues pour les statistiques
CREATE VIEW provider_stats AS
SELECT 
  p.id,
  p.name,
  p.specialty,
  p.zone,
  p.status,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COUNT(DISTINCT sr.id) as total_requests,
  COUNT(DISTINCT CASE WHEN sr.status = 'completed' THEN sr.id END) as completed_requests,
  COALESCE(SUM(t.amount), 0) as total_earnings
FROM providers p
LEFT JOIN service_requests sr ON p.id = sr.assigned_provider_id
LEFT JOIN reviews r ON p.id = r.provider_id
LEFT JOIN transactions t ON p.id = t.provider_id AND t.type = 'payment' AND t.status = 'completed'
GROUP BY p.id, p.name, p.specialty, p.zone, p.status;

-- Vue pour les métriques du dashboard
CREATE VIEW dashboard_metrics AS
SELECT 
  COUNT(DISTINCT p.id) as total_providers,
  COUNT(DISTINCT CASE WHEN p.status = 'active' THEN p.id END) as active_providers,
  COUNT(DISTINCT sr.id) as total_requests,
  COUNT(DISTINCT CASE WHEN sr.status = 'pending' THEN sr.id END) as pending_requests,
  COUNT(DISTINCT CASE WHEN sr.status = 'completed' THEN sr.id END) as completed_requests,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  COALESCE(SUM(t.amount), 0) as total_revenue
FROM providers p
CROSS JOIN service_requests sr
LEFT JOIN reviews r ON sr.id = r.request_id
LEFT JOIN transactions t ON sr.id = t.request_id AND t.type = 'payment' AND t.status = 'completed';
