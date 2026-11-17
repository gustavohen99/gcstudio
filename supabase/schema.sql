-- ==============================================================================
-- SISTEMA G&C STUDIO — ESQUEMA COMPLETO DO BANCO DE DADOS SUPABASE (POSTGRESQL)
-- ==============================================================================

-- Habilita extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE CONFIGURAÇÕES DO ESTÚDIO
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'G&C Studio',
  tagline TEXT DEFAULT 'Fotografia & Vídeo de Eventos',
  logo_url TEXT,
  phone TEXT DEFAULT '(11) 98765-4321',
  whatsapp TEXT DEFAULT '5511987654321',
  email TEXT DEFAULT 'contato@gcstudio.com.br',
  instagram TEXT DEFAULT '@gcstudio',
  website TEXT DEFAULT 'https://gcstudio.com.br',
  address TEXT DEFAULT 'São Paulo, SP',
  bank_details JSONB DEFAULT '{
    "bank": "Nubank",
    "agency": "0001",
    "account": "1234567-8",
    "pix_key": "contato@gcstudio.com.br",
    "beneficiary": "G&C Studio Produções Audiovisuais"
  }'::jsonb,
  contract_defaults JSONB DEFAULT '{
    "jurisdiction": "Comarca de São Paulo/SP",
    "late_fee_percentage": 2,
    "interest_rate": 1
  }'::jsonb,
  gallery_defaults JSONB DEFAULT '{
    "expiration_days": 60,
    "download_enabled": true,
    "favorites_enabled": true,
    "selection_enabled": true,
    "default_selection_max": 80
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CLIENTES
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  partner_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'Casamento',
  status TEXT NOT NULL DEFAULT 'ativo',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CRM / LEADS
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT,
  event_type TEXT NOT NULL DEFAULT 'Casamento',
  event_date DATE,
  location TEXT,
  guest_count INTEGER,
  estimated_value NUMERIC(12,2) DEFAULT 0,
  origin TEXT DEFAULT 'Instagram',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'NOVO CONTATO',
  converted_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  converted_event_id UUID,
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PACOTES E SERVIÇOS
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'Casamento',
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'Adicionais',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENTOS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Casamento',
  date DATE NOT NULL,
  time TIME NOT NULL DEFAULT '16:00',
  location TEXT NOT NULL,
  value NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmado',
  package_name TEXT,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORÇAMENTOS
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE,
  package_name TEXT NOT NULL,
  services JSONB DEFAULT '[]'::jsonb,
  total_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'Entrada + Parcelas via PIX/Boleto',
  deposit_value NUMERIC(12,2) DEFAULT 0,
  installments_count INTEGER DEFAULT 1,
  validity_date DATE,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'enviado',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CONTRATOS
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  template_title TEXT NOT NULL DEFAULT 'Contrato Padrão de Prestação de Serviços',
  content TEXT NOT NULL,
  external_url TEXT,
  status TEXT NOT NULL DEFAULT 'rascunho',
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FINANCEIRO / PARCELAS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  paid_at TIMESTAMPTZ,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BRIEFINGS
CREATE TABLE IF NOT EXISTS briefings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  status TEXT NOT NULL DEFAULT 'nao_enviado',
  current_step INTEGER DEFAULT 1,
  completed_at TIMESTAMPTZ,
  event_info JSONB DEFAULT '{}'::jsonb,
  ceremony_info JSONB DEFAULT '{}'::jsonb,
  special_moments JSONB DEFAULT '{}'::jsonb,
  party_info JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  video_info JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS briefing_people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  briefing_id UUID NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS briefing_required_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  briefing_id UUID NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  people_involved TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CRONOGRAMA
CREATE TABLE IF NOT EXISTS timeline_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  time TIME NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  description TEXT,
  responsible TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CHECKLIST INTERNO
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  phase TEXT NOT NULL, -- 'antes', 'durante', 'pos'
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. GALERIAS DE FOTOS
CREATE TABLE IF NOT EXISTS galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  cover_url TEXT,
  description TEXT,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  password_hash TEXT,
  download_enabled BOOLEAN DEFAULT TRUE,
  favorites_enabled BOOLEAN DEFAULT TRUE,
  selection_enabled BOOLEAN DEFAULT TRUE,
  selection_max INTEGER DEFAULT 80,
  selection_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  title TEXT,
  filename TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  client_identifier TEXT DEFAULT 'client',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gallery_id, photo_id, client_identifier)
);

CREATE TABLE IF NOT EXISTS gallery_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gallery_id, photo_id)
);

-- 13. ENTREGAS
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'a_fazer',
  deadline DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DOCUMENTOS
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  file_url TEXT NOT NULL,
  file_size TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. MODELOS DE MENSAGENS
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_required_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Admins têm acesso irrestrito
CREATE POLICY "Admin full access settings" ON settings FOR ALL USING (true);
CREATE POLICY "Admin full access clients" ON clients FOR ALL USING (true);
CREATE POLICY "Admin full access leads" ON leads FOR ALL USING (true);
CREATE POLICY "Admin full access events" ON events FOR ALL USING (true);
CREATE POLICY "Admin full access packages" ON packages FOR ALL USING (true);
CREATE POLICY "Admin full access services" ON services FOR ALL USING (true);
CREATE POLICY "Admin full access quotes" ON quotes FOR ALL USING (true);
CREATE POLICY "Admin full access contracts" ON contracts FOR ALL USING (true);
CREATE POLICY "Admin full access payments" ON payments FOR ALL USING (true);
CREATE POLICY "Admin full access briefings" ON briefings FOR ALL USING (true);
CREATE POLICY "Admin full access briefing_people" ON briefing_people FOR ALL USING (true);
CREATE POLICY "Admin full access briefing_required_photos" ON briefing_required_photos FOR ALL USING (true);
CREATE POLICY "Admin full access timeline_items" ON timeline_items FOR ALL USING (true);
CREATE POLICY "Admin full access checklist_items" ON checklist_items FOR ALL USING (true);
CREATE POLICY "Admin full access galleries" ON galleries FOR ALL USING (true);
CREATE POLICY "Admin full access gallery_photos" ON gallery_photos FOR ALL USING (true);
CREATE POLICY "Admin full access gallery_favorites" ON gallery_favorites FOR ALL USING (true);
CREATE POLICY "Admin full access gallery_selections" ON gallery_selections FOR ALL USING (true);
CREATE POLICY "Admin full access deliveries" ON deliveries FOR ALL USING (true);
CREATE POLICY "Admin full access documents" ON documents FOR ALL USING (true);
CREATE POLICY "Admin full access message_templates" ON message_templates FOR ALL USING (true);
CREATE POLICY "Admin full access notifications" ON notifications FOR ALL USING (true);
