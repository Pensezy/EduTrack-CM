-- ============================================================
-- ACTIVATION DE LA SÉCURITÉ ROW LEVEL SECURITY (RLS)
-- EduTrack-CM - Migration de Sécurité Critique
-- Date: 2025-12-25
-- ============================================================
--
-- OBJECTIF:
--   Activer RLS sur toutes les tables pour isoler les données
--   par école et par rôle utilisateur.
--
-- PRINCIPE:
--   - Chaque école voit uniquement SES données
--   - Chaque utilisateur voit uniquement CE QUI LE CONCERNE
--   - Les admins ont accès à tout
--
-- EXÉCUTION:
--   Copier-coller ce script dans Supabase SQL Editor
--   et exécuter
--
-- ============================================================

-- ============================================================
-- ÉTAPE 1: ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================================

-- Tables principales
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

-- Tables académiques
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;

-- Tables d'évaluation
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_periods ENABLE ROW LEVEL SECURITY;

-- Tables de présence
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_types ENABLE ROW LEVEL SECURITY;

-- Tables financières
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_types ENABLE ROW LEVEL SECURITY;

-- Tables relationnelles
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_schools ENABLE ROW LEVEL SECURITY;

-- Tables administratives
ALTER TABLE public.secretaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ÉTAPE 2: FONCTION HELPER POUR RÉCUPÉRER L'ÉCOLE ACTUELLE
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  school_id UUID;
BEGIN
  -- Récupérer l'école de l'utilisateur connecté
  SELECT current_school_id INTO school_id
  FROM public.users
  WHERE id = auth.uid();

  RETURN school_id;
END;
$$;

-- ============================================================
-- ÉTAPE 3: POLITIQUES POUR LA TABLE USERS
-- ============================================================

-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (id = auth.uid());

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Les directeurs peuvent voir tous les utilisateurs de leur école
CREATE POLICY "Principals can view users in their school"
ON public.users
FOR SELECT
USING (
  current_school_id IN (
    SELECT id FROM public.schools WHERE director_user_id = auth.uid()
  )
);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all users"
ON public.users
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- ÉTAPE 4: POLITIQUES POUR LA TABLE SCHOOLS
-- ============================================================

-- Les directeurs peuvent voir leur propre école
CREATE POLICY "Directors can view their own school"
ON public.schools
FOR SELECT
USING (director_user_id = auth.uid());

-- Les directeurs peuvent modifier leur propre école
CREATE POLICY "Directors can update their own school"
ON public.schools
FOR UPDATE
USING (director_user_id = auth.uid())
WITH CHECK (director_user_id = auth.uid());

-- Les utilisateurs peuvent voir l'école où ils sont inscrits
CREATE POLICY "Users can view their school"
ON public.schools
FOR SELECT
USING (
  id IN (
    SELECT current_school_id FROM public.users WHERE id = auth.uid()
  )
);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all schools"
ON public.schools
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- ÉTAPE 5: POLITIQUES POUR LES ÉTUDIANTS
-- ============================================================

-- Les étudiants peuvent voir leur propre profil
CREATE POLICY "Students can view their own profile"
ON public.students
FOR SELECT
USING (user_id = auth.uid());

-- Les parents peuvent voir leurs enfants
CREATE POLICY "Parents can view their children"
ON public.students
FOR SELECT
USING (
  id IN (
    SELECT student_id
    FROM public.parent_student_schools pss
    JOIN public.parents p ON p.id = pss.parent_id
    WHERE p.user_id = auth.uid()
  )
);

-- Les enseignants peuvent voir les étudiants de leurs classes
CREATE POLICY "Teachers can view students in their classes"
ON public.students
FOR SELECT
USING (
  class_id IN (
    SELECT DISTINCT c.id
    FROM public.classes c
    JOIN public.teacher_subjects ts ON ts.school_id = c.school_id
    JOIN public.teachers t ON t.id = ts.teacher_id
    WHERE t.user_id = auth.uid()
  )
);

-- Les directeurs et secrétaires peuvent voir les étudiants de leur école
CREATE POLICY "Staff can view students in their school"
ON public.students
FOR SELECT
USING (
  school_id IN (
    SELECT current_school_id FROM public.users
    WHERE id = auth.uid() AND role IN ('principal', 'secretary')
  )
);

-- ============================================================
-- ÉTAPE 6: POLITIQUES POUR LES NOTES
-- ============================================================

-- Les étudiants peuvent voir leurs propres notes
CREATE POLICY "Students can view their own grades"
ON public.grades
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- Les parents peuvent voir les notes de leurs enfants
CREATE POLICY "Parents can view their children grades"
ON public.grades
FOR SELECT
USING (
  student_id IN (
    SELECT student_id
    FROM public.parent_student_schools pss
    JOIN public.parents p ON p.id = pss.parent_id
    WHERE p.user_id = auth.uid()
  )
);

-- Les enseignants peuvent gérer les notes de leurs matières
CREATE POLICY "Teachers can manage grades for their subjects"
ON public.grades
FOR ALL
USING (
  teacher_id IN (
    SELECT id FROM public.teachers WHERE user_id = auth.uid()
  )
);

-- Les directeurs peuvent voir toutes les notes de leur école
CREATE POLICY "Principals can view all grades in their school"
ON public.grades
FOR SELECT
USING (
  school_id IN (
    SELECT id FROM public.schools WHERE director_user_id = auth.uid()
  )
);

-- ============================================================
-- ÉTAPE 7: POLITIQUES POUR LES PRÉSENCES
-- ============================================================

-- Les étudiants peuvent voir leurs propres présences
CREATE POLICY "Students can view their own attendance"
ON public.attendances
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- Les parents peuvent voir les présences de leurs enfants
CREATE POLICY "Parents can view their children attendance"
ON public.attendances
FOR SELECT
USING (
  student_id IN (
    SELECT student_id
    FROM public.parent_student_schools pss
    JOIN public.parents p ON p.id = pss.parent_id
    WHERE p.user_id = auth.uid()
  )
);

-- Les enseignants peuvent gérer les présences
CREATE POLICY "Teachers can manage attendance"
ON public.attendances
FOR ALL
USING (
  class_id IN (
    SELECT DISTINCT c.id
    FROM public.classes c
    JOIN public.teacher_subjects ts ON ts.school_id = c.school_id
    JOIN public.teachers t ON t.id = ts.teacher_id
    WHERE t.user_id = auth.uid()
  )
);

-- ============================================================
-- ÉTAPE 8: POLITIQUES POUR LES PAIEMENTS
-- ============================================================

-- Les parents peuvent voir les paiements de leurs enfants
CREATE POLICY "Parents can view their children payments"
ON public.payments
FOR SELECT
USING (
  student_id IN (
    SELECT student_id
    FROM public.parent_student_schools pss
    JOIN public.parents p ON p.id = pss.parent_id
    WHERE p.user_id = auth.uid()
  )
);

-- Les étudiants peuvent voir leurs propres paiements
CREATE POLICY "Students can view their own payments"
ON public.payments
FOR SELECT
USING (
  student_id IN (
    SELECT id FROM public.students WHERE user_id = auth.uid()
  )
);

-- Les secrétaires et directeurs peuvent gérer les paiements
CREATE POLICY "Staff can manage payments in their school"
ON public.payments
FOR ALL
USING (
  school_id IN (
    SELECT current_school_id FROM public.users
    WHERE id = auth.uid() AND role IN ('principal', 'secretary')
  )
);

-- ============================================================
-- ÉTAPE 9: POLITIQUES POUR LES TABLES DE RÉFÉRENCE
-- ============================================================

-- Tout le monde peut lire les types (grade_types, attendance_types, etc.)
-- mais seuls les directeurs peuvent les modifier

CREATE POLICY "Everyone can view grade types"
ON public.grade_types FOR SELECT USING (true);

CREATE POLICY "Principals can manage grade types"
ON public.grade_types FOR ALL
USING (
  school_id IN (
    SELECT id FROM public.schools WHERE director_user_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view attendance types"
ON public.attendance_types FOR SELECT USING (true);

CREATE POLICY "Principals can manage attendance types"
ON public.attendance_types FOR ALL
USING (
  school_id IN (
    SELECT id FROM public.schools WHERE director_user_id = auth.uid()
  )
);

CREATE POLICY "Everyone can view payment types"
ON public.payment_types FOR SELECT USING (true);

CREATE POLICY "Principals can manage payment types"
ON public.payment_types FOR ALL
USING (
  school_id IN (
    SELECT id FROM public.schools WHERE director_user_id = auth.uid()
  )
);

-- ============================================================
-- ÉTAPE 10: POLITIQUES POUR LES NOTIFICATIONS
-- ============================================================

-- Les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (user_id = auth.uid());

-- Les utilisateurs peuvent marquer leurs notifications comme lues
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Les directeurs peuvent créer des notifications pour leur école
CREATE POLICY "Principals can create notifications for their school"
ON public.notifications
FOR INSERT
WITH CHECK (
  school_id IN (
    SELECT id FROM public.schools WHERE director_user_id = auth.uid()
  )
);

-- ============================================================
-- ÉTAPE 11: POLITIQUES POUR LES AUDIT LOGS
-- ============================================================

-- Seuls les admins peuvent voir les logs
CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Les directeurs peuvent voir les logs de leur école
CREATE POLICY "Principals can view their school audit logs"
ON public.audit_logs
FOR SELECT
USING (
  school_id IN (
    SELECT id FROM public.schools WHERE director_user_id = auth.uid()
  )
);

-- ============================================================
-- ÉTAPE 12: PERMISSION SPÉCIALE POUR LE TRIGGER
-- ============================================================

-- Le trigger handle_new_user_automatic() doit pouvoir insérer
-- même avec RLS activé. Il utilise SECURITY DEFINER donc OK.

-- ============================================================
-- VÉRIFICATION FINALE
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'RLS ACTIVÉ AVEC SUCCÈS !';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Toutes les tables sont maintenant protégées';
  RAISE NOTICE 'Les politiques sont appliquées par rôle';
  RAISE NOTICE '';
  RAISE NOTICE 'TESTEZ MAINTENANT:';
  RAISE NOTICE '1. Connexion en tant que directeur';
  RAISE NOTICE '2. Vérifier accès uniquement à SON école';
  RAISE NOTICE '3. Connexion en tant qu''étudiant';
  RAISE NOTICE '4. Vérifier accès uniquement à SES données';
  RAISE NOTICE '==============================================';
END $$;
