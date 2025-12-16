import { supabase } from '../lib/supabase';

class DocumentService {
  // Helper method to get current user with valid database ID
  async getCurrentUserWithDbId() {
    let user = null;
    let dbUserId = null;
    
    // Try Supabase Auth first
    try {
      const res = await supabase?.auth?.getUser();
      user = res?.data?.user;
      console.log('🔐 Supabase Auth user:', user?.email || 'none');
    } catch (e) {
      user = null;
    }

    // Fallback to localStorage-stored user for EmailJS/persisted sessions
    if (!user) {
      try {
        const saved = localStorage.getItem('edutrack-user');
        if (saved) {
          user = JSON.parse(saved);
          console.log('📦 localStorage user:', user?.email, 'id:', user?.id);
        }
      } catch (e) {
        // ignore
      }
    }

    if (!user) return { user: null, dbUserId: null };

    // Get the actual user ID from the database by email
    // This ensures we use an ID that exists in the users table (for FK constraint)
    if (user?.email) {
      try {
        console.log('🔍 Searching user in DB by email:', user.email);
        const { data: dbUser, error: dbError } = await supabase
          ?.from('users')
          ?.select('id, current_school_id')
          ?.eq('email', user.email)
          ?.single();
        
        if (dbError) {
          console.error('❌ Error fetching user from DB:', dbError);
        }
        
        if (dbUser) {
          dbUserId = dbUser.id;
          // Also attach school_id if available
          user.db_school_id = dbUser.current_school_id;
          console.log('✅ Found user in DB - dbUserId:', dbUserId, 'school:', dbUser.current_school_id);
        } else {
          console.warn('⚠️ User not found in DB for email:', user.email);
        }
      } catch (e) {
        console.warn('Could not fetch user from database:', e);
      }
    }

    // Fallback to user.id if no dbUserId found (for Supabase Auth users)
    if (!dbUserId && user?.id) {
      console.log('⚠️ Using fallback user.id:', user.id);
      dbUserId = user.id;
    }

    console.log('📋 getCurrentUserWithDbId result - dbUserId:', dbUserId);
    return { user, dbUserId };
  }

  // Document CRUD operations
  async uploadDocument(documentData, file) {
    try {
      const { user, dbUserId } = await this.getCurrentUserWithDbId();

      if (!user) throw new Error('Non authentifié');
      if (!dbUserId) throw new Error('Utilisateur non trouvé dans la base de données. Veuillez vous reconnecter.');

      // Bucket name configurable via Vite env var VITE_SUPABASE_STORAGE_BUCKET
      const STORAGE_BUCKET = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_STORAGE_BUCKET)
        || (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_STORAGE_BUCKET)
        || 'documents';

      // Create file path using database user ID
      const timestamp = Date.now();
      const fileExtension = file?.name?.split('.')?.pop() || '';
      const fileName = `${documentData?.title?.replace(/\s+/g, '_')}_${timestamp}.${fileExtension}`;
      const subjectSegment = (documentData?.subject || 'general').toString().replace(/\s+/g, '_').toLowerCase();
      const filePath = `teacher/${dbUserId}/${subjectSegment}/${fileName}`;

      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase?.storage?.from(STORAGE_BUCKET)?.upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // Determine school_id: use provided, or from user profile, or from database
      const schoolId = documentData?.school_id || user?.current_school_id || user?.db_school_id;

      // Insert document record with the valid database user ID
      const { data, error } = await supabase?.from('documents')?.insert({
        title: documentData?.title,
        description: documentData?.description,
        file_name: file?.name,
        file_path: filePath,
        file_size: file?.size,
        mime_type: file?.type,
        document_type: documentData?.document_type,
        uploaded_by: dbUserId, // Use the database user ID (valid FK)
        class_name: documentData?.class_name,
        subject: documentData?.subject,
        school_id: schoolId,
        is_public: documentData?.is_public || false
      })?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur upload document:', error);
      return { data: null, error: error?.message };
    }
  }

  async getDocuments(filters = {}) {
    try {
        let query = supabase?.from('documents')?.select(`
          id, title, description, file_name, file_path, file_size, mime_type,
          document_type, class_name, subject, is_public, created_at, updated_at,
          uploader:uploaded_by(id, full_name),
          school:school_id(id, name)
        `)?.order('created_at', { ascending: false });

      // Apply filters
      if (filters?.class_name) {
        query = query?.eq('class_name', filters?.class_name);
      }
      if (filters?.subject) {
        query = query?.eq('subject', filters?.subject);
      }
      if (filters?.document_type) {
        query = query?.eq('document_type', filters?.document_type);
      }
      if (filters?.school_id) {
        query = query?.eq('school_id', filters?.school_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur récupération documents:', error);
      return { data: [], error: error?.message };
    }
  }

  async getTeacherDocuments() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Non authentifié');

      return await this.getDocuments({ uploaded_by: user?.id });
    } catch (error) {
      console.error('Erreur récupération documents professeur:', error);
      return { data: [], error: error?.message };
    }
  }

  async getStudentDocuments() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Non authentifié');

      // Get student's class information
      const { data: studentData, error: studentError } = await supabase?.from('students')?.select('current_class, current_school_id')?.eq('user_id', user?.id)?.single();

      if (studentError || !studentData) {
        return { data: [], error: 'Informations étudiant non trouvées' };
      }

      return await this.getDocuments({
        class_name: studentData?.current_class,
        school_id: studentData?.current_school_id
      });
    } catch (error) {
      console.error('Erreur récupération documents étudiant:', error);
      return { data: [], error: error?.message };
    }
  }

  async deleteDocument(documentId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Non authentifié');

      // Get document info first
      const { data: document, error: fetchError } = await supabase?.from('documents')?.select('file_path, uploaded_by')?.eq('id', documentId)?.single();

      if (fetchError || !document) {
        throw new Error('Document non trouvé');
      }

      // Check if user owns the document
      if (document?.uploaded_by !== user?.id) {
        throw new Error('Non autorisé à supprimer ce document');
      }

      // Delete from storage
      const STORAGE_BUCKET = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_STORAGE_BUCKET)
        || (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_STORAGE_BUCKET)
        || 'documents';

      const { error: storageError } = await supabase?.storage?.from(STORAGE_BUCKET)?.remove([document?.file_path]);

      if (storageError) {
        console.error('Erreur suppression storage:', storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase?.from('documents')?.delete()?.eq('id', documentId);

      if (dbError) throw dbError;
      return { data: true, error: null };
    } catch (error) {
      console.error('Erreur suppression document:', error);
      return { data: false, error: error?.message };
    }
  }

  async downloadDocument(documentId, action = 'download') {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Non authentifié');

      // Get document info
      const { data: document, error: fetchError } = await supabase?.from('documents')?.select('file_path, file_name, title')?.eq('id', documentId)?.single();

      if (fetchError || !document) {
        throw new Error('Document non trouvé');
      }

      // Create signed URL for download
      const STORAGE_BUCKET = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_STORAGE_BUCKET)
        || (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_STORAGE_BUCKET)
        || 'documents';

      const { data: signedUrlData, error: urlError } = await supabase?.storage?.from(STORAGE_BUCKET)?.createSignedUrl(document?.file_path, 3600); // 1 hour expiry

      if (urlError || !signedUrlData) {
        throw new Error('Impossible de générer l\'URL de téléchargement');
      }

      // Log access
      await this.logDocumentAccess(documentId, action);

      return { 
        data: {
          url: signedUrlData?.signedUrl,
          fileName: document?.file_name,
          title: document?.title
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Erreur téléchargement document:', error);
      return { data: null, error: error?.message };
    }
  }

  // Upload file and create a record in documents table (used by teacher dashboard)
  // Utilise la table `documents` existante avec les colonnes correctes
  async uploadTeacherDocument(documentData, file) {
    try {
      // Utiliser la méthode centralisée pour obtenir l'utilisateur avec son ID de la base de données
      const { user, dbUserId } = await this.getCurrentUserWithDbId();

      if (!user) throw new Error('Non authentifié');
      if (!dbUserId) throw new Error('Utilisateur non trouvé dans la base de données. Veuillez vous reconnecter.');

      // Récupérer school_id depuis plusieurs sources possibles
      let schoolId = user?.current_school_id || user?.school_id || user?.db_school_id || documentData?.school_id;

      // Si pas de schoolId, le chercher dans la base de données
      if (!schoolId && dbUserId) {
        try {
          const { data: userData } = await supabase?.from('users')?.select('current_school_id')?.eq('id', dbUserId)?.single();
          schoolId = userData?.current_school_id;
        } catch (e) {
          console.warn('Impossible de récupérer school_id:', e);
        }
      }

      if (!schoolId) {
        throw new Error('École non trouvée - veuillez vous reconnecter');
      }

      // Nom du bucket Storage (configurable via env ou défaut 'documents')
      const STORAGE_BUCKET = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_STORAGE_BUCKET)
        || (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_STORAGE_BUCKET)
        || 'documents';

      console.log('📤 Upload document - bucket:', STORAGE_BUCKET, 'dbUserId:', dbUserId, 'school:', schoolId);

      // Construire le chemin du fichier (utiliser dbUserId pour le path)
      const timestamp = Date.now();
      const fileExtension = file?.name?.split('.')?.pop() || '';
      const safeTitle = (documentData?.title || 'document').toString().replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${safeTitle}_${timestamp}.${fileExtension}`;
      const filePath = `teacher/${dbUserId}/${fileName}`;

      // Upload vers Supabase Storage
      const { data: storageData, error: storageError } = await supabase?.storage?.from(STORAGE_BUCKET)?.upload(filePath, file, { 
        cacheControl: '3600', 
        upsert: false 
      });
      
      if (storageError) {
        console.error('❌ Storage error:', storageError);
        throw storageError;
      }

      console.log('✅ Fichier uploadé:', filePath);

      // Insérer dans la table `documents` avec les colonnes existantes
      // Colonnes disponibles: id, school_id, document_type, visibility, is_public, 
      // uploaded_by, target_student_id, target_class_id, title, file_name, file_path, mime_type, class_name
      
      // Déterminer la visibilité selon le choix utilisateur
      // - 'private' : seul l'enseignant voit
      // - 'class' : élèves de la classe voient
      // - 'school' : toute l'école voit (parents inclus si is_public=true)
      let visibility = 'class'; // défaut: visible par la classe
      if (documentData?.visibility === 'students') {
        visibility = 'class';
      } else if (documentData?.visibility === 'students_parents') {
        visibility = 'school'; // visible par élèves ET parents
      } else if (documentData?.visibility === 'private') {
        visibility = 'private';
      }

      // DEBUG: Voir ce qui est envoyé
      console.log('📋 documentData reçu:', documentData);

      // Pour l'instant, on ne met pas target_class_id pour éviter les erreurs FK
      // On utilise class_name pour stocker le nom de la classe (pas besoin de FK)
      const record = {
        school_id: schoolId,
        document_type: documentData?.document_type || documentData?.type || 'cours',
        visibility: visibility,
        is_public: documentData?.visibility === 'students_parents', // parents peuvent voir
        uploaded_by: dbUserId, // 👤 QUI a uploadé le document (ID de la table users)
        // target_class_id: null, // Désactivé temporairement - pas de FK problématique
        title: documentData?.title,
        file_name: file?.name,
        file_path: filePath,
        mime_type: file?.type,
        class_name: documentData?.class_name || documentData?.class_id // Nom de la classe pour affichage
      };

      console.log('📝 Insertion document record:', record);

      const { data, error } = await supabase?.from('documents')?.insert(record)?.select()?.single();
      
      if (error) {
        console.error('❌ DB insert error:', error);
        throw error;
      }

      console.log('✅ Document enregistré:', data?.id);
      return { data, error: null };
    } catch (error) {
      console.error('Erreur upload teacher document:', error);
      return { data: null, error: error?.message || String(error) };
    }
  }

  async logDocumentAccess(documentId, action) {
    try {
      const { error } = await supabase?.rpc('log_document_access', {
        doc_id: documentId,
        access_action: action
      });

      if (error) {
        console.error('Erreur log accès document:', error);
      }
    } catch (error) {
      console.error('Erreur log accès document:', error);
    }
  }

  // Teacher assignment operations
  async getTeacherAssignments() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase?.from('teacher_assignments')?.select(`
          id, class_name, subject, assigned_at, is_active,
          school:school_id(id, name),
          assigned_by_user:assigned_by(id, full_name)
        `)?.eq('teacher_id', user?.id)?.eq('is_active', true)?.order('assigned_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur récupération assignments:', error);
      return { data: [], error: error?.message };
    }
  }

  async assignTeacherToClass(assignmentData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase?.from('teacher_assignments')?.insert({
          teacher_id: assignmentData?.teacher_id,
          school_id: assignmentData?.school_id,
          class_name: assignmentData?.class_name,
          subject: assignmentData?.subject,
          assigned_by: user?.id
        })?.select()?.single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Erreur assignation professeur:', error);
      return { data: null, error: error?.message };
    }
  }

  async removeTeacherAssignment(assignmentId) {
    try {
      const { error } = await supabase?.from('teacher_assignments')?.update({ is_active: false })?.eq('id', assignmentId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Erreur suppression assignation:', error);
      return { data: false, error: error?.message };
    }
  }

  // Utility functions
  async getClassesAndSubjects() {
    try {
      const { data: assignments, error } = await supabase?.from('teacher_assignments')?.select('class_name, subject')?.eq('is_active', true);

      if (error) throw error;

      const classes = [...new Set(assignments?.map(a => a.class_name) || [])];
      const subjects = [...new Set(assignments?.map(a => a.subject) || [])];

      return { data: { classes, subjects }, error: null };
    } catch (error) {
      console.error('Erreur récupération classes/matières:', error);
      return { data: { classes: [], subjects: [] }, error: error?.message };
    }
  }

  async getDocumentStats() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase?.from('documents')?.select('document_type, created_at')?.eq('uploaded_by', user?.id);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        byType: {},
        thisMonth: 0
      };

      const currentMonth = new Date()?.getMonth();
      const currentYear = new Date()?.getFullYear();

      data?.forEach(doc => {
        // Count by type
        stats.byType[doc.document_type] = (stats?.byType?.[doc?.document_type] || 0) + 1;

        // Count this month
        const docDate = new Date(doc.created_at);
        if (docDate?.getMonth() === currentMonth && docDate?.getFullYear() === currentYear) {
          stats.thisMonth++;
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      console.error('Erreur statistiques documents:', error);
      return { data: null, error: error?.message };
    }
  }

  // Get all school documents for secretary
  async getAllSchoolDocuments() {
    try {
      let schoolId = null;
      let userId = null;

      // Essayer avec Auth Supabase d'abord
      const { data: { user: authUser } } = await supabase?.auth?.getUser();
      
      if (authUser) {
        userId = authUser.id;
        const { data: userData } = await supabase
          ?.from('users')
          ?.select('current_school_id')
          ?.eq('id', authUser.id)
          ?.single();
        schoolId = userData?.current_school_id;
      } else {
        // Fallback : localStorage (pour comptes personnel EmailJS)
        const savedUser = localStorage.getItem('edutrack-user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          userId = userData.id;
          schoolId = userData.current_school_id || userData.school_id;
          console.log('✅ Utilisation localStorage pour documents:', { userId, schoolId });
        }
      }

      if (!schoolId) {
        return { success: false, documents: [], error: 'École non trouvée' };
      }

      // Get documents for the school
      const { data, error } = await supabase
        ?.from('documents')
        ?.select(`
          id,
          title,
          document_type,
          created_at,
          file_name,
          file_path,
          mime_type,
          class_name
        `)
        ?.eq('school_id', schoolId)
        ?.order('created_at', { ascending: false });

      if (error) throw error;

      // Format documents to match expected structure
      const documents = (data || []).map(doc => ({
        id: doc.id,
        name: doc.title,
        type: doc.document_type || 'administratif',
        dateCreated: new Date(doc.created_at).toLocaleDateString('fr-FR'),
        status: 'generated',
        studentName: doc.class_name || 'Document général',
        class: doc.class_name || 'N/A',
        format: doc.mime_type?.split('/')[1]?.toUpperCase() || 'PDF',
        file_path: doc.file_path, // Garder pour savoir si le fichier existe
        file_name: doc.file_name
      }));

      return { success: true, documents, error: null };
    } catch (error) {
      console.error('Erreur récupération documents école:', error);
      
      // Si la table n'existe pas, retourner un message clair
      if (error.message?.includes('Could not find the table')) {
        return { 
          success: false, 
          documents: [], 
          error: 'TABLE_NOT_EXISTS',
          message: 'La table documents n\'existe pas encore dans Supabase. Créez-la pour activer cette fonctionnalité.'
        };
      }
      
      return { success: false, documents: [], error: error?.message };
    }
  }

  // Generate a certificate or administrative document
  async generateDocument(documentType, options = {}) {
    try {
      const { studentId = null, classId = null, visibility = 'private', isPublic = false } = options;
      
      let schoolId = null;
      let userId = null;

      // Essayer avec Auth Supabase d'abord
      const { data: { user: authUser } } = await supabase?.auth?.getUser();
      
      if (authUser) {
        userId = authUser.id;
        const { data: userData } = await supabase
          ?.from('users')
          ?.select('current_school_id')
          ?.eq('id', authUser.id)
          ?.single();
        schoolId = userData?.current_school_id;
      } else {
        // Fallback : localStorage
        const savedUser = localStorage.getItem('edutrack-user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          userId = userData.id;
          schoolId = userData.current_school_id || userData.school_id;
        }
      }

      if (!schoolId) {
        throw new Error('École non trouvée');
      }

      const docTitle = `${documentType}_${Date.now()}`;
      
      // Insert document record avec visibilité
      const documentData = {
        title: docTitle,
        document_type: documentType,
        school_id: schoolId,
        file_name: `${docTitle}.pdf`,
        mime_type: 'application/pdf',
        visibility: visibility,
        is_public: isPublic
      };
      
      // Ajouter target_student_id si fourni
      if (studentId) {
        documentData.target_student_id = studentId;
      }
      
      // Ajouter target_class_id si fourni
      if (classId) {
        documentData.target_class_id = classId;
      }
      
      // N'ajouter uploaded_by que si on a un vrai userId Supabase
      if (userId && userId.length === 36) {
        documentData.uploaded_by = userId;
      }
      
      const { data, error } = await supabase
        ?.from('documents')
        ?.insert(documentData)
        ?.select()
        ?.single();

      if (error) throw error;
      
      return { success: true, document: data, error: null };
    } catch (error) {
      console.error('Erreur génération document:', error);
      return { success: false, document: null, error: error?.message };
    }
  }
}

export const documentService = new DocumentService();