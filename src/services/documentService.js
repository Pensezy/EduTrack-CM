import { supabase } from '../lib/supabase';

class DocumentService {
  // Document CRUD operations
  async uploadDocument(documentData, file) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Non authentifié');

      // Create file path
      const timestamp = Date.now();
      const fileExtension = file?.name?.split('.')?.pop() || '';
      const fileName = `${documentData?.title?.replace(/\s+/g, '_')}_${timestamp}.${fileExtension}`;
      const filePath = `teacher/${user?.id}/${documentData?.subject?.toLowerCase()}/${fileName}`;

      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase?.storage?.from('documents')?.upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      // Insert document record
      const { data, error } = await supabase?.from('documents')?.insert({
          title: documentData?.title,
          description: documentData?.description,
          file_name: file?.name,
          file_path: filePath,
          file_size: file?.size,
          mime_type: file?.type,
          document_type: documentData?.document_type,
          uploaded_by: user?.id,
          class_name: documentData?.class_name,
          subject: documentData?.subject,
          school_id: documentData?.school_id,
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
      const { error: storageError } = await supabase?.storage?.from('documents')?.remove([document?.file_path]);

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
      const { data: signedUrlData, error: urlError } = await supabase?.storage?.from('documents')?.createSignedUrl(document?.file_path, 3600); // 1 hour expiry

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
}

export const documentService = new DocumentService();