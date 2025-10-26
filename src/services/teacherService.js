import { supabase } from '../lib/supabase';
import { getCurrentAcademicYear } from '../utils/academicYear';

class TeacherService {
  // ================== TEACHER ACCOUNT MANAGEMENT ==================
  
  // Create teacher account (Secretary function)
  async createTeacherAccount(teacherData) {
    try {
      const { data, error } = await supabase?.from('users')?.insert({
          full_name: teacherData?.full_name,
          email: teacherData?.email,
          phone: teacherData?.phone,
          role: 'teacher',
          password_hash: await this.hashPassword(teacherData?.password),
          current_school_id: teacherData?.school_id,
          pin_code: teacherData?.pin_code
        })?.select()?.single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get all teachers in school
  async getSchoolTeachers(schoolId) {
    try {
      const { data, error } = await supabase?.from('users')?.select(`
          id, full_name, email, phone, avatar_url, created_at,
          teacher_assignments (
            id, class_name, subject, school_year, is_active
          )
        `)?.eq('role', 'teacher')?.eq('current_school_id', schoolId)?.order('full_name');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Update teacher profile
  async updateTeacherProfile(teacherId, updateData) {
    try {
      const { data, error } = await supabase?.from('users')?.update(updateData)?.eq('id', teacherId)?.select()?.single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // ================== TEACHER ASSIGNMENT SYSTEM ==================
  
  // Assign teacher to class/subject (Principal function)
  async assignTeacherToClass(assignmentData) {
    try {
      const { data, error } = await supabase?.from('teacher_assignments')?.insert({
          teacher_id: assignmentData?.teacher_id,
          school_id: assignmentData?.school_id,
          class_name: assignmentData?.class_name,
          subject: assignmentData?.subject,
          school_year: assignmentData?.school_year || getCurrentAcademicYear(),
          assigned_by: assignmentData?.assigned_by
        })?.select(`
          *,
          teacher:teacher_id (full_name, email),
          assigner:assigned_by (full_name)
        `)?.single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get teacher assignments
  async getTeacherAssignments(teacherId, schoolId) {
    try {
      const { data, error } = await supabase?.from('teacher_assignments')?.select(`
          *,
          school:school_id (name, code),
          assigner:assigned_by (full_name)
        `)?.eq('teacher_id', teacherId)?.eq('school_id', schoolId)?.eq('is_active', true)?.order('class_name');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get all assignments for school (Principal view)
  async getSchoolAssignments(schoolId) {
    try {
      const { data, error } = await supabase?.from('teacher_assignments')?.select(`
          *,
          teacher:teacher_id (full_name, email, phone),
          school:school_id (name, code)
        `)?.eq('school_id', schoolId)?.eq('is_active', true)?.order('class_name, subject');

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Remove teacher assignment
  async removeTeacherAssignment(assignmentId) {
    try {
      const { data, error } = await supabase?.from('teacher_assignments')?.update({ is_active: false })?.eq('id', assignmentId)?.select()?.single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // ================== DOCUMENT MANAGEMENT ==================
  
  // Upload document file to storage
  async uploadDocument(file, teacherId, folderPath) {
    try {
      const fileExt = file?.name?.split('.')?.pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${teacherId}/${folderPath}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase?.storage?.from('documents')?.upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      return { success: true, data: { path: uploadData?.path, fullPath: filePath } };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Create document record
  async createDocument(documentData) {
    try {
      const { data, error } = await supabase?.from('teacher_documents')?.insert(documentData)?.select(`
          *,
          teacher:teacher_id (full_name),
          school:school_id (name, code)
        `)?.single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get teacher's documents
  async getTeacherDocuments(teacherId, filters = {}) {
    try {
      let query = supabase?.from('teacher_documents')?.select(`
          *,
          school:school_id (name, code)
        `)?.eq('teacher_id', teacherId);

      if (filters?.class_name) {
        query = query?.eq('class_name', filters?.class_name);
      }
      if (filters?.subject) {
        query = query?.eq('subject', filters?.subject);
      }
      if (filters?.category) {
        query = query?.eq('category', filters?.category);
      }

      const { data, error } = await query?.order('uploaded_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get student accessible documents
  async getStudentDocuments(studentClass, filters = {}) {
    try {
      let query = supabase?.from('teacher_documents')?.select(`
          *,
          teacher:teacher_id (full_name),
          school:school_id (name)
        `)?.eq('class_name', studentClass);

      if (filters?.subject) {
        query = query?.eq('subject', filters?.subject);
      }
      if (filters?.category) {
        query = query?.eq('category', filters?.category);
      }

      const { data, error } = await query?.order('uploaded_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Get signed URL for private document
  async getDocumentSignedUrl(filePath, expiresIn = 3600) {
    try {
      const { data, error } = await supabase?.storage?.from('documents')?.createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return { success: true, url: data?.signedUrl };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Delete document
  async deleteDocument(documentId, filePath) {
    try {
      // Delete from storage first
      const { error: storageError } = await supabase?.storage?.from('documents')?.remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { data, error } = await supabase?.from('teacher_documents')?.delete()?.eq('id', documentId)?.select()?.single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // Log document access
  async logDocumentAccess(documentId, studentId, action = 'view') {
    try {
      const { data, error } = await supabase?.from('document_access_log')?.insert({
          document_id: documentId,
          student_id: studentId,
          action: action
        });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error?.message };
    }
  }

  // ================== UTILITY FUNCTIONS ==================
  
  // Get available classes
  getAvailableClasses() {
    return [
      'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2',
      '6ème', '5ème', '4ème', '3ème', 
      '2nd', '1ère', 'Terminale'
    ];
  }

  // Get available subjects
  getAvailableSubjects() {
    return [
      'Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie',
      'Sciences Physiques', 'Sciences Naturelles', 'Chimie', 'Biologie',
      'Éducation Physique', 'Arts Plastiques', 'Musique', 'Philosophie',
      'Économie', 'Comptabilité', 'Informatique'
    ];
  }

  // Get document categories
  getDocumentCategories() {
    return [
      { value: 'cours', label: 'Cours' },
      { value: 'exercices', label: 'Exercices' },
      { value: 'devoirs', label: 'Devoirs' },
      { value: 'corrections', label: 'Corrections' },
      { value: 'evaluations', label: 'Évaluations' },
      { value: 'ressources', label: 'Ressources' },
      { value: 'annonces', label: 'Annonces' },
      { value: 'programmes', label: 'Programmes' }
    ];
  }

  // Hash password (simple implementation)
  async hashPassword(password) {
    // In production, use proper bcrypt or similar
    return btoa(password); // Base64 encoding for demo
  }
}

export const teacherService = new TeacherService();