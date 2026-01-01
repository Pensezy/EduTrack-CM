-- =====================================================
-- MIGRATION: Mise à Jour Prix Réalistes
-- Date: 2026-01-01
-- Description: Augmentation des prix pour refléter la vraie valeur du service
-- =====================================================

-- =====================================================
-- MISE À JOUR PRIX APPLICATIONS
-- =====================================================

UPDATE apps SET price_yearly = 30000, price_monthly = 3000 WHERE id = 'academic';     -- 15k → 30k
UPDATE apps SET price_yearly = 35000, price_monthly = 3500 WHERE id = 'schedule';     -- 12k → 35k (était "grades")
UPDATE apps SET price_yearly = 40000, price_monthly = 4000 WHERE id = 'financial';    -- 20k → 40k
UPDATE apps SET price_yearly = 27000, price_monthly = 2700 WHERE id = 'discipline';   -- 10k → 27k (était "attendance")
UPDATE apps SET price_yearly = 33000, price_monthly = 3300 WHERE id = 'hr';           -- 18k → 33k
UPDATE apps SET price_yearly = 33000, price_monthly = 3300 WHERE id = 'communication';-- 8k → 33k
UPDATE apps SET price_yearly = 37000, price_monthly = 3700 WHERE id = 'reporting';    -- 15k → 37k (était "analytics")

-- =====================================================
-- MISE À JOUR PRIX BUNDLES AVEC NOUVELLES ÉCONOMIES
-- =====================================================

-- Bundle Starter: 2 apps (academic 30k + discipline 27k = 57k total)
-- Prix: 55k → Économie: 2k (au lieu de 10k)
UPDATE bundles
SET price_yearly = 55000,
    savings = 2000
WHERE id = 'starter';

-- Bundle Standard: 4 apps (academic 30k + discipline 27k + financial 40k + communication 33k = 130k total)
-- Prix: 120k → Économie: 10k (au lieu de 15k)
UPDATE bundles
SET price_yearly = 120000,
    savings = 10000
WHERE id = 'standard';

-- Bundle Premium: 7 apps (academic 30k + discipline 27k + financial 40k + communication 33k + schedule 35k + reporting 37k + hr 33k = 235k total)
-- Prix: 200k → Économie: 35k (maintenu)
UPDATE bundles
SET price_yearly = 200000,
    savings = 35000
WHERE id = 'premium';

-- =====================================================
-- VÉRIFICATION DES NOUVEAUX PRIX
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '📊 NOUVEAUX PRIX APPLICATIONS (par an)';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

SELECT
  name,
  CASE
    WHEN is_core THEN '🆓 GRATUIT'
    ELSE price_yearly || ' FCFA/an'
  END as price_display,
  category
FROM apps
ORDER BY sort_order;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '📦 NOUVEAUX PRIX BUNDLES (par an)';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

SELECT
  name,
  price_yearly || ' FCFA/an' as price,
  'Économie: ' || savings || ' FCFA' as savings_display,
  array_length(app_ids, 1) as nb_apps
FROM bundles
ORDER BY sort_order;

-- =====================================================
-- CALCUL ET AFFICHAGE DES ÉCONOMIES RÉELLES
-- =====================================================

DO $$
DECLARE
  bundle_record RECORD;
  total_individual INTEGER;
  economy INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '💰 VÉRIFICATION ÉCONOMIES';
  RAISE NOTICE '═══════════════════════════════════════════════════════';

  FOR bundle_record IN
    SELECT b.id, b.name, b.price_yearly, b.savings, b.app_ids
    FROM bundles b
    ORDER BY b.sort_order
  LOOP
    -- Calculer le prix total si acheté individuellement
    SELECT COALESCE(SUM(a.price_yearly), 0) INTO total_individual
    FROM apps a
    WHERE a.id = ANY(bundle_record.app_ids);

    economy := total_individual - bundle_record.price_yearly;

    RAISE NOTICE '';
    RAISE NOTICE '📦 %', bundle_record.name;
    RAISE NOTICE '   Prix bundle: % FCFA', bundle_record.price_yearly;
    RAISE NOTICE '   Prix à la carte: % FCFA', total_individual;
    RAISE NOTICE '   Économie réelle: % FCFA', economy;
    RAISE NOTICE '   Économie affichée: % FCFA', bundle_record.savings;

    IF economy != bundle_record.savings THEN
      RAISE WARNING '   ⚠️ ATTENTION: Différence de % FCFA!', (economy - bundle_record.savings);
    ELSE
      RAISE NOTICE '   ✅ Économie correcte';
    END IF;
  END LOOP;

  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;

-- =====================================================
-- RÉSUMÉ FINAL
-- =====================================================

DO $$
DECLARE
  total_apps_revenue INTEGER;
  avg_app_price INTEGER;
BEGIN
  SELECT SUM(price_yearly) INTO total_apps_revenue
  FROM apps
  WHERE is_core = false;

  SELECT AVG(price_yearly)::INTEGER INTO avg_app_price
  FROM apps
  WHERE is_core = false;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE '📈 STATISTIQUES PRICING';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
  RAISE NOTICE 'Total toutes apps (à la carte): % FCFA/an', total_apps_revenue;
  RAISE NOTICE 'Prix moyen par app: % FCFA/an', avg_app_price;
  RAISE NOTICE 'Bundle Premium (toutes apps): 200 000 FCFA/an';
  RAISE NOTICE 'Économie bundle premium: 35 000 FCFA (15%)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Migration terminée avec succès';
  RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
