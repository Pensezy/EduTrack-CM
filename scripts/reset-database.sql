-- ==========================================
-- SCRIPT DE RESET COMPLET DE LA BASE DE DONNÉES
-- ⚠️ ATTENTION: Ce script SUPPRIME TOUTES LES DONNÉES
-- ==========================================

-- 1. Désactiver temporairement RLS pour permettre la suppression
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.school_years DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.terms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classrooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.timetable DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.report_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payroll DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schools DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les données des tables (en respectant l'ordre des dépendances)
-- Commencer par les tables dépendantes

-- Tables de liaison et données métier
DELETE FROM public.report_cards;
DELETE FROM public.grades;
DELETE FROM public.attendance;
DELETE FROM public.payments;
DELETE FROM public.assignments;
DELETE FROM public.timetable;
DELETE FROM public.schedules;
DELETE FROM public.student_documents;
DELETE FROM public.teacher_documents;
DELETE FROM public.leave_requests;
DELETE FROM public.payroll;

-- Tables principales
DELETE FROM public.students;
DELETE FROM public.teachers;
DELETE FROM public.parents;
DELETE FROM public.fees;
DELETE FROM public.announcements;
DELETE FROM public.subjects;
DELETE FROM public.classes;
DELETE FROM public.classrooms;
DELETE FROM public.terms;
DELETE FROM public.school_years;
DELETE FROM public.schools;

-- 3. Supprimer les utilisateurs de auth.users (ATTENTION: ceci supprime tous les comptes)
-- Note: Vous devez exécuter cette commande avec des privilèges admin
-- DELETE FROM auth.users;

-- 4. Réactiver RLS
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.school_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.report_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;

-- 5. Réinitialiser les séquences (pour repartir à 1 pour les IDs auto-incrémentés)
-- Note: À ajuster selon vos tables qui ont des séquences

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Base de données nettoyée avec succès!';
  RAISE NOTICE '📝 Prochaines étapes:';
  RAISE NOTICE '   1. Allez dans Supabase Dashboard > Authentication > Users';
  RAISE NOTICE '   2. Supprimez manuellement tous les utilisateurs';
  RAISE NOTICE '   3. Créez un nouveau compte via la page Signup du Hub';
  RAISE NOTICE '   4. Testez le parcours complet: Signup → Onboarding → Admin';
END $$;
