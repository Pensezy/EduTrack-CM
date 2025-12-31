-- =====================================================
-- MIGRATION: Architecture Modulaire EduTrack CM
-- Date: 2025-12-31
-- Description: Tables et fonctions pour système d'applications modulaires
-- =====================================================

-- =====================================================
-- HELPER FUNCTIONS (Pré-requis pour RLS)
-- =====================================================

-- Fonction pour récupérer l'ID de l'école de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  school_id UUID;
BEGIN
  -- Récupérer school_id de l'utilisateur connecté
  SELECT u.school_id INTO school_id
  FROM public.users u
  WHERE u.id = auth.uid();

  RETURN school_id;
END;
$$;

-- Fonction pour récupérer le rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Récupérer le rôle de l'utilisateur connecté
  SELECT u.role INTO user_role
  FROM public.users u
  WHERE u.id = auth.uid();

  RETURN user_role;
END;
$$;

COMMENT ON FUNCTION get_user_school_id IS 'Retourne l''ID de l''école de l''utilisateur authentifié';
COMMENT ON FUNCTION get_user_role IS 'Retourne le rôle de l''utilisateur authentifié';

-- =====================================================
-- TABLE: apps (Catalogue des applications)
-- =====================================================
CREATE TABLE IF NOT EXISTS apps (
  id TEXT PRIMARY KEY,                -- 'academic', 'financial', etc.
  name TEXT NOT NULL,                 -- 'Gestion Académique'
  description TEXT,
  category TEXT NOT NULL,             -- 'pedagogy', 'administration', 'analytics', 'communication'
  icon TEXT,                          -- Emoji '📚'
  price_yearly INTEGER NOT NULL DEFAULT 0, -- Prix en FCFA
  price_monthly INTEGER,              -- Prix mensuel (optionnel)
  is_core BOOLEAN DEFAULT false,      -- App core gratuite?
  features JSONB DEFAULT '[]'::jsonb, -- ['notes', 'bulletins', ...]
  dependencies TEXT[] DEFAULT ARRAY[]::TEXT[], -- Apps requises ['academic']
  routes JSONB DEFAULT '[]'::jsonb,   -- ['/notes', '/bulletins']
  components JSONB DEFAULT '[]'::jsonb, -- ['NotesManager', ...]
  limitations JSONB DEFAULT '{}'::jsonb, -- Limitations version gratuite
  credits JSONB DEFAULT '{}'::jsonb,  -- Crédits inclus (SMS, etc.)
  status TEXT DEFAULT 'active',       -- active, beta, deprecated
  sort_order INTEGER DEFAULT 0,       -- Ordre affichage
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_sort_order ON apps(sort_order);

COMMENT ON TABLE apps IS 'Catalogue des applications disponibles dans EduTrack CM';
COMMENT ON COLUMN apps.is_core IS 'true = toujours accessible gratuitement';
COMMENT ON COLUMN apps.features IS 'Liste des fonctionnalités de l''app';
COMMENT ON COLUMN apps.dependencies IS 'Apps requises pour cette app';

-- =====================================================
-- TABLE: bundles (Packs prédéfinis)
-- =====================================================
CREATE TABLE IF NOT EXISTS bundles (
  id TEXT PRIMARY KEY,                -- 'starter', 'standard', 'premium'
  name TEXT NOT NULL,
  description TEXT,
  app_ids TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], -- ['academic', 'discipline']
  price_yearly INTEGER NOT NULL DEFAULT 0,
  savings INTEGER DEFAULT 0,          -- Économie vs à la carte
  recommended_for TEXT,               -- 'primary', 'secondary', 'large'
  features_extra JSONB DEFAULT '{}'::jsonb, -- Avantages bundle (support, etc.)
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_bundles_active ON bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_bundles_sort_order ON bundles(sort_order);

COMMENT ON TABLE bundles IS 'Packs d''applications prédéfinis avec pricing avantageux';
COMMENT ON COLUMN bundles.app_ids IS 'IDs des apps incluses dans ce bundle';
COMMENT ON COLUMN bundles.savings IS 'Économie en FCFA vs achat à la carte';

-- =====================================================
-- TABLE: school_subscriptions (Abonnements)
-- =====================================================
CREATE TABLE IF NOT EXISTS school_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  bundle_id TEXT REFERENCES bundles(id) ON DELETE SET NULL,  -- NULL si à la carte

  status TEXT NOT NULL DEFAULT 'trial',   -- trial, active, expired, cancelled

  -- Dates
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Paiement
  payment_method TEXT,                    -- mobile_money, bank_transfer, cash
  payment_reference TEXT,
  amount_paid INTEGER DEFAULT 0,

  -- Renouvellement
  auto_renew BOOLEAN DEFAULT true,

  -- Usage
  usage_stats JSONB DEFAULT '{}'::jsonb, -- Stats utilisation
  last_used_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(school_id, app_id)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_school_subs_school ON school_subscriptions(school_id);
CREATE INDEX IF NOT EXISTS idx_school_subs_app ON school_subscriptions(app_id);
CREATE INDEX IF NOT EXISTS idx_school_subs_status ON school_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_school_subs_expires ON school_subscriptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_school_subs_bundle ON school_subscriptions(bundle_id);

COMMENT ON TABLE school_subscriptions IS 'Abonnements des écoles aux différentes applications';
COMMENT ON COLUMN school_subscriptions.status IS 'trial = essai gratuit, active = payé actif, expired = expiré, cancelled = annulé';

-- =====================================================
-- FONCTION: Vérifier si école a accès à une app
-- =====================================================
CREATE OR REPLACE FUNCTION has_active_app(
  p_school_id UUID,
  p_app_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  -- App core toujours accessible
  IF EXISTS (SELECT 1 FROM apps WHERE id = p_app_id AND is_core = true) THEN
    RETURN true;
  END IF;

  -- Vérifier abonnement actif ou en trial
  RETURN EXISTS (
    SELECT 1 FROM school_subscriptions
    WHERE school_id = p_school_id
      AND app_id = p_app_id
      AND status IN ('trial', 'active')
      AND (
        (status = 'trial' AND trial_ends_at > now())
        OR
        (status = 'active' AND expires_at > now())
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION has_active_app IS 'Vérifie si une école a accès à une application (core ou abonnement actif)';

-- =====================================================
-- FONCTION: Obtenir apps actives d'une école
-- =====================================================
CREATE OR REPLACE FUNCTION get_school_active_apps(p_school_id UUID)
RETURNS TABLE(
  app_id TEXT,
  app_name TEXT,
  status TEXT,
  is_trial BOOLEAN,
  days_remaining INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    COALESCE(ss.status, 'available') as status,
    COALESCE(ss.status = 'trial', false) as is_trial,
    CASE
      WHEN ss.status = 'trial' THEN
        GREATEST(0, EXTRACT(DAY FROM (ss.trial_ends_at - now()))::INTEGER)
      WHEN ss.status = 'active' THEN
        GREATEST(0, EXTRACT(DAY FROM (ss.expires_at - now()))::INTEGER)
      ELSE 0
    END as days_remaining
  FROM apps a
  LEFT JOIN school_subscriptions ss
    ON a.id = ss.app_id
    AND ss.school_id = p_school_id
    AND ss.status IN ('trial', 'active')
  WHERE a.is_core = true
    OR ss.id IS NOT NULL
  ORDER BY a.sort_order, a.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_school_active_apps IS 'Retourne toutes les apps actives pour une école (core + abonnements)';

-- =====================================================
-- FONCTION: Démarrer essai gratuit d'une app
-- =====================================================
CREATE OR REPLACE FUNCTION start_trial(
  p_school_id UUID,
  p_app_id TEXT,
  p_trial_days INTEGER DEFAULT 30
) RETURNS school_subscriptions AS $$
DECLARE
  v_subscription school_subscriptions;
BEGIN
  -- Vérifier que l'app existe et n'est pas core
  IF NOT EXISTS (SELECT 1 FROM apps WHERE id = p_app_id AND is_core = false) THEN
    RAISE EXCEPTION 'App inexistante ou déjà gratuite';
  END IF;

  -- Vérifier qu'il n'y a pas déjà un abonnement
  IF EXISTS (SELECT 1 FROM school_subscriptions WHERE school_id = p_school_id AND app_id = p_app_id) THEN
    RAISE EXCEPTION 'Abonnement déjà existant pour cette app';
  END IF;

  -- Créer l'abonnement trial
  INSERT INTO school_subscriptions (
    school_id,
    app_id,
    status,
    trial_started_at,
    trial_ends_at
  ) VALUES (
    p_school_id,
    p_app_id,
    'trial',
    now(),
    now() + (p_trial_days || ' days')::INTERVAL
  )
  RETURNING * INTO v_subscription;

  RETURN v_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION start_trial IS 'Démarre un essai gratuit de 30 jours pour une app';

-- =====================================================
-- FONCTION: Activer abonnement payant
-- =====================================================
CREATE OR REPLACE FUNCTION activate_subscription(
  p_school_id UUID,
  p_app_id TEXT,
  p_payment_method TEXT,
  p_payment_reference TEXT,
  p_amount_paid INTEGER,
  p_duration_months INTEGER DEFAULT 12
) RETURNS school_subscriptions AS $$
DECLARE
  v_subscription school_subscriptions;
BEGIN
  -- Vérifier que l'app existe
  IF NOT EXISTS (SELECT 1 FROM apps WHERE id = p_app_id) THEN
    RAISE EXCEPTION 'App inexistante';
  END IF;

  -- Mettre à jour ou créer l'abonnement
  INSERT INTO school_subscriptions (
    school_id,
    app_id,
    status,
    activated_at,
    expires_at,
    payment_method,
    payment_reference,
    amount_paid
  ) VALUES (
    p_school_id,
    p_app_id,
    'active',
    now(),
    now() + (p_duration_months || ' months')::INTERVAL,
    p_payment_method,
    p_payment_reference,
    p_amount_paid
  )
  ON CONFLICT (school_id, app_id) DO UPDATE SET
    status = 'active',
    activated_at = now(),
    expires_at = now() + (p_duration_months || ' months')::INTERVAL,
    payment_method = EXCLUDED.payment_method,
    payment_reference = EXCLUDED.payment_reference,
    amount_paid = EXCLUDED.amount_paid,
    updated_at = now()
  RETURNING * INTO v_subscription;

  RETURN v_subscription;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION activate_subscription IS 'Active un abonnement payant pour une app';

-- =====================================================
-- RLS: Row Level Security
-- =====================================================

-- Apps: lecture publique (tous peuvent voir le catalogue)
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Apps are viewable by everyone" ON apps;
CREATE POLICY "Apps are viewable by everyone"
  ON apps FOR SELECT
  USING (true);

-- Bundles: lecture publique
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Bundles are viewable by everyone" ON bundles;
CREATE POLICY "Bundles are viewable by everyone"
  ON bundles FOR SELECT
  USING (true);

-- Subscriptions: école voit uniquement ses abonnements
ALTER TABLE school_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view their school subscriptions" ON school_subscriptions;
CREATE POLICY "Users view their school subscriptions"
  ON school_subscriptions FOR SELECT
  USING (school_id = get_user_school_id());

DROP POLICY IF EXISTS "School admins manage subscriptions" ON school_subscriptions;
CREATE POLICY "School admins manage subscriptions"
  ON school_subscriptions FOR ALL
  USING (
    school_id = get_user_school_id()
    AND get_user_role() IN ('principal', 'admin')
  );

-- =====================================================
-- SEED DATA: Apps et Bundles
-- =====================================================

-- Apps
INSERT INTO apps (id, name, description, category, icon, price_yearly, price_monthly, is_core, features, sort_order) VALUES
-- App Core (gratuite)
('core', 'EduTrack Base', 'Dashboard de base, gestion utilisateurs limitée, profil école', 'core', '🏫', 0, 0, true,
  '["dashboard", "users_basic", "profile", "notes_basic"]'::jsonb, 0),

-- Apps Pédagogiques
('academic', 'Gestion Académique', 'Notes illimitées, bulletins automatiques, moyennes, classements, statistiques', 'pedagogy', '📚', 15000, 1500, false,
  '["notes_unlimited", "bulletins_auto", "rankings", "statistics_academic", "exports_pdf"]'::jsonb, 1),

('schedule', 'Emplois du Temps', 'Génération automatique, gestion salles, détection conflits, exports PDF', 'pedagogy', '📅', 12000, 1200, false,
  '["schedule_generator", "rooms_management", "conflicts_detection", "schedule_exports"]'::jsonb, 4),

-- Apps Administration
('financial', 'Gestion Financière', 'Paiements, reçus automatiques, relances, statistiques financières, exports comptables', 'administration', '💰', 20000, 2000, false,
  '["payments_unlimited", "receipts_auto", "payment_reminders", "financial_stats", "accounting_exports"]'::jsonb, 2),

('discipline', 'Discipline & Absences', 'Pointage absences, retards, sanctions, notifications parents, rapports assiduité', 'administration', '⏰', 10000, 1200, false,
  '["attendance_tracking", "tardiness", "sanctions", "parent_notifications", "attendance_reports"]'::jsonb, 3),

('hr', 'Ressources Humaines', 'Gestion enseignants, contrats, salaires, bulletins paie, évaluations', 'administration', '👥', 18000, 1800, false,
  '["teachers_management", "contracts", "salaries", "payslips", "evaluations"]'::jsonb, 7),

-- App Communication
('communication', 'Communication', 'Messagerie interne, SMS groupés, notifications push, annonces, calendrier partagé', 'communication', '📧', 8000, 1000, false,
  '["messaging", "sms_bulk", "push_notifications", "announcements", "shared_calendar"]'::jsonb, 5),

-- App Analytics
('reporting', 'Reporting Avancé', 'Tableaux de bord analytics, rapports personnalisés, exports ministère, prédictions IA', 'analytics', '📊', 15000, 1500, false,
  '["analytics_advanced", "custom_reports", "ministry_exports", "ai_predictions"]'::jsonb, 6)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  price_yearly = EXCLUDED.price_yearly,
  price_monthly = EXCLUDED.price_monthly,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Bundles
INSERT INTO bundles (id, name, description, app_ids, price_yearly, savings, recommended_for, features_extra, sort_order) VALUES
('starter', 'Bundle Starter', 'Idéal pour les écoles primaires et petites structures',
  ARRAY['academic', 'discipline'], 25000, 10000, 'primary',
  '{"support": "email", "training": "video", "features": ["Notes et bulletins", "Gestion absences"]}'::jsonb, 1),

('standard', 'Bundle Standard', 'Solution complète pour collèges et lycées',
  ARRAY['academic', 'discipline', 'financial', 'communication'], 50000, 15000, 'secondary',
  '{"support": "priority_email", "training": "video", "sms_monthly": 1000, "features": ["Notes", "Absences", "Paiements", "Communication parents"]}'::jsonb, 2),

('premium', 'Bundle Premium', 'Tout inclus pour grands établissements et réseaux d''écoles',
  ARRAY['academic', 'discipline', 'financial', 'communication', 'schedule', 'reporting', 'hr'], 80000, 18000, 'large',
  '{"support": "phone", "training": "onsite", "sms_monthly": 2000, "backup": "daily", "features": ["Toutes les applications", "Formation sur site", "Support téléphonique"]}'::jsonb, 3)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  app_ids = EXCLUDED.app_ids,
  price_yearly = EXCLUDED.price_yearly,
  savings = EXCLUDED.savings,
  recommended_for = EXCLUDED.recommended_for,
  features_extra = EXCLUDED.features_extra,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- =====================================================
-- PERMISSIONS SUPPLÉMENTAIRES
-- =====================================================

-- Permettre aux admins système de gérer le catalogue
DROP POLICY IF EXISTS "System admins manage apps" ON apps;
CREATE POLICY "System admins manage apps"
  ON apps FOR ALL
  USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "System admins manage bundles" ON bundles;
CREATE POLICY "System admins manage bundles"
  ON bundles FOR ALL
  USING (get_user_role() = 'admin');

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue: Apps avec leur pricing
CREATE OR REPLACE VIEW v_apps_catalog AS
SELECT
  a.id,
  a.name,
  a.description,
  a.category,
  a.icon,
  a.price_yearly,
  a.price_monthly,
  a.is_core,
  a.features,
  a.status,
  a.sort_order,
  CASE
    WHEN a.is_core THEN 'Gratuit'
    WHEN a.price_yearly > 0 THEN a.price_yearly || ' FCFA/an'
    ELSE 'Prix sur demande'
  END as price_label
FROM apps a
WHERE a.status = 'active'
ORDER BY a.sort_order, a.name;

COMMENT ON VIEW v_apps_catalog IS 'Vue formatée du catalogue d''apps pour affichage frontend';

-- Vue: Bundles avec détails
CREATE OR REPLACE VIEW v_bundles_catalog AS
SELECT
  b.id,
  b.name,
  b.description,
  b.app_ids,
  b.price_yearly,
  b.savings,
  b.recommended_for,
  b.features_extra,
  b.sort_order,
  (
    SELECT SUM(a.price_yearly)
    FROM apps a
    WHERE a.id = ANY(b.app_ids)
  ) as price_individual_total,
  ARRAY(
    SELECT a.name
    FROM apps a
    WHERE a.id = ANY(b.app_ids)
    ORDER BY a.sort_order
  ) as app_names
FROM bundles b
WHERE b.is_active = true
ORDER BY b.sort_order;

COMMENT ON VIEW v_bundles_catalog IS 'Vue formatée des bundles avec calcul économie et noms des apps';

-- =====================================================
-- TRIGGERS: Auto-update updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_apps_updated_at ON apps;
CREATE TRIGGER update_apps_updated_at
    BEFORE UPDATE ON apps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bundles_updated_at ON bundles;
CREATE TRIGGER update_bundles_updated_at
    BEFORE UPDATE ON bundles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_school_subscriptions_updated_at ON school_subscriptions;
CREATE TRIGGER update_school_subscriptions_updated_at
    BEFORE UPDATE ON school_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTAIRES FINAUX
-- =====================================================

COMMENT ON SCHEMA public IS 'EduTrack CM - Architecture Modulaire';

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================
