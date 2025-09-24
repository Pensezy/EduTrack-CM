import { supabase } from '../lib/supabase';

// User and Authentication Services
export const userService = {
  // Get user by PIN
  async getUserByPin(pin) {
    try {
      const { data, error } = await supabase
        ?.from('users')
        ?.select(`
          *,
          students:students(*),
          school:schools(*)
        `)
        ?.eq('pin_code', pin)
        ?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user by phone
  async getUserByPhone(phone) {
    try {
      const { data, error } = await supabase
        ?.from('users')
        ?.select(`
          *,
          students:students(*),
          school:schools(*)
        `)
        ?.eq('phone', phone)
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user profile with relationships
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        ?.from('users')
        ?.select(`
          *,
          students:students(*),
          school:schools(*)
        `)
        ?.eq('id', userId)
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Student Services
export const studentService = {
  // Get all students
  async getStudents() {
    try {
      const { data, error } = await supabase
        ?.from('students')
        ?.select(`
          *,
          school:schools(*),
          user:users(*)
        `)
        ?.order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get student by ID with all relations
  async getStudentById(studentId) {
    try {
      const { data, error } = await supabase
        ?.from('students')
        ?.select(`
          *,
          school:schools(*),
          user:users(*),
          grades:grades(*),
          absences:absences(*),
          payments:payments(*)
        `)
        ?.eq('id', studentId)
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get students by parent ID
  async getStudentsByParent(parentId) {
    try {
      // D'abord, obtenir l'ID parent depuis app_users
      const { data: parentData, error: parentError } = await supabase
        .from('parents')
        .select('id')
        .eq('user_id', parentId)
        .single();

      if (parentError || !parentData) {
        console.error('Parent non trouvé:', parentError);
        throw new Error('Parent non trouvé');
      }

      // Obtenir les informations des étudiants depuis la vue
      const { data, error } = await supabase
        .from('parent_students_view')
        .select(`
          student_id,
          matricule,
          full_name,
          email,
          phone,
          class_name,
          class_level,
          school_name
        `)
        .eq('parent_id', parentData.id);

      if (error) {
        console.error('Erreur lors de la récupération des étudiants:', error);
        throw error;
      }

      // Formater les données pour correspondre à la structure attendue
      const formattedData = data.map(student => ({
        id: student.student_id,
        name: student.full_name,
        matricule: student.matricule,
        current_class: student.class_name,
        school: {
          name: student.school_name
        },
        email: student.email,
        phone: student.phone,
        level: student.class_level
      }));

      console.log('Étudiants trouvés:', formattedData);
      return { data: formattedData, error: null };
    } catch (error) {
      console.error('Erreur dans getStudentsByParent:', error);
      return { data: [], error };
    }
  },

  // Get student details (grades, absences, payments)
  async getStudentDetails(studentId) {
    try {
      const { data, error } = await supabase
        .rpc('get_student_details', {
          student_id: studentId
        });

      if (error) throw error;

      return {
        data: {
          grades: data.grades || [],
          absences: data.absences || [],
          payments: data.payments || []
        },
        error: null
      };
    } catch (error) {
      console.error('Erreur dans getStudentDetails:', error);
      return {
        data: {
          grades: [],
          absences: [],
          payments: []
        },
        error
      };
    }
  },

  // Create new student
  async createStudent(studentData) {
    try {
      const { data, error } = await supabase
        ?.from('students')
        ?.insert([studentData])
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update student
  async updateStudent(studentId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('students')
        ?.update(updates)
        ?.eq('id', studentId)
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Grade Services
export const gradeService = {
  // Get grades for a student
  async getGradesByStudent(studentId) {
    try {
      const { data, error } = await supabase
        ?.from('grades')
        ?.select(`
          *,
          student:students(*),
          teacher:users(*)
        `)
        ?.eq('student_id', studentId)
        ?.order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Create new grade
  async createGrade(gradeData) {
    try {
      const { data, error } = await supabase
        ?.from('grades')
        ?.insert([gradeData])
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get grades by teacher
  async getGradesByTeacher(teacherId) {
    try {
      const { data, error } = await supabase
        ?.from('grades')
        ?.select(`
          *,
          student:students(*)
        `)
        ?.eq('teacher_id', teacherId)
        ?.order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Update grade
  async updateGrade(gradeId, updates) {
    try {
      const { data, error } = await supabase
        ?.from('grades')
        ?.update(updates)
        ?.eq('id', gradeId)
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Absence Services
export const absenceService = {
  // Get absences for a student
  async getAbsencesByStudent(studentId) {
    try {
      const { data, error } = await supabase
        ?.from('absences')
        ?.select(`
          *,
          student:students(*),
          justified_by_user:users!justified_by(*)
        `)
        ?.eq('student_id', studentId)
        ?.order('date_absence', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Create new absence
  async createAbsence(absenceData) {
    try {
      const { data, error } = await supabase
        ?.from('absences')
        ?.insert([absenceData])
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Justify absence
  async justifyAbsence(absenceId, justifiedBy, reason) {
    try {
      const { data, error } = await supabase
        ?.from('absences')
        ?.update({
          justified: true,
          justified_by: justifiedBy,
          reason,
          justification_date: new Date()?.toISOString()
        })
        ?.eq('id', absenceId)
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Payment Services
export const paymentService = {
  // Get payments for a student
  async getPaymentsByStudent(studentId) {
    try {
      const { data, error } = await supabase
        ?.from('payments')
        ?.select(`
          *,
          student:students(*)
        `)
        ?.eq('student_id', studentId)
        ?.order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Create new payment
  async createPayment(paymentData) {
    try {
      const { data, error } = await supabase
        ?.from('payments')
        ?.insert([paymentData])
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update payment status
  async updatePaymentStatus(paymentId, status, completedAt = null) {
    try {
      const updateData = { status };
      if (completedAt) {
        updateData.completed_at = completedAt;
      }

      const { data, error } = await supabase
        ?.from('payments')
        ?.update(updateData)
        ?.eq('id', paymentId)
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Notification Services
export const notificationService = {
  // Get notifications for a user
  async getNotificationsByUser(userId) {
    try {
      const { data, error } = await supabase
        ?.from('notifications')
        ?.select(`
          *,
          school:schools(*),
          student:students(*)
        `)
        ?.eq('user_id', userId)
        ?.order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Create new notification
  async createNotification(notificationData) {
    try {
      const { data, error } = await supabase
        ?.from('notifications')
        ?.insert([notificationData])
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        ?.from('notifications')
        ?.update({ status: 'read' })
        ?.eq('id', notificationId)
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        ?.from('notifications')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('user_id', userId)
        ?.eq('status', 'unread');

      return { count: count || 0, error };
    } catch (error) {
      return { count: 0, error };
    }
  }
};

// School Services
export const schoolService = {
  // Get all schools
  async getSchools() {
    try {
      const { data, error } = await supabase
        ?.from('schools')
        ?.select(`
          *,
          principal:users(*)
        `)
        ?.order('name', { ascending: true });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Get school by ID
  async getSchoolById(schoolId) {
    try {
      const { data, error } = await supabase
        ?.from('schools')
        ?.select(`
          *,
          principal:users(*),
          students:students(*)
        `)
        ?.eq('id', schoolId)
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Transfer Services
export const transferService = {
  // Get transfers by student
  async getTransfersByStudent(studentId) {
    try {
      const { data, error } = await supabase
        ?.from('transfers')
        ?.select(`
          *,
          student:students(*),
          from_school:schools!from_school_id(*),
          to_school:schools!to_school_id(*),
          requested_by_user:users!requested_by(*),
          approved_by_origin_user:users!approved_by_origin(*),
          approved_by_destination_user:users!approved_by_destination(*)
        `)
        ?.eq('student_id', studentId)
        ?.order('request_date', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  },

  // Create transfer request
  async createTransfer(transferData) {
    try {
      const { data, error } = await supabase
        ?.from('transfers')
        ?.insert([transferData])
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Approve/reject transfer
  async updateTransferStatus(transferId, status, approvedBy, rejectionReason = null) {
    try {
      const updateData = {
        status,
        approval_date: new Date()?.toISOString()
      };

      if (status === 'approved_origin') {
        updateData.approved_by_origin = approvedBy;
      } else if (status === 'approved_destination') {
        updateData.approved_by_destination = approvedBy;
      }

      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { data, error } = await supabase
        ?.from('transfers')
        ?.update(updateData)
        ?.eq('id', transferId)
        ?.select()
        ?.single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Analytics Services
export const analyticsService = {
  // Get dashboard stats
  async getDashboardStats() {
    try {
      // Get total students
      const { count: studentsCount } = await supabase
        ?.from('students')
        ?.select('*', { count: 'exact', head: true });

      // Get total payments this month
      const currentMonth = new Date();
      currentMonth?.setDate(1);
      
      const { data: paymentsData } = await supabase
        ?.from('payments')
        ?.select('amount')
        ?.gte('created_at', currentMonth?.toISOString())
        ?.eq('status', 'completed');

      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + parseFloat(payment?.amount || 0), 0) || 0;

      // Get pending transfers
      const { count: pendingTransfers } = await supabase
        ?.from('transfers')
        ?.select('*', { count: 'exact', head: true })
        ?.eq('status', 'requested');

      // Get absences this week
      const weekStart = new Date();
      weekStart?.setDate(weekStart?.getDate() - weekStart?.getDay());
      
      const { count: weeklyAbsences } = await supabase
        ?.from('absences')
        ?.select('*', { count: 'exact', head: true })
        ?.gte('date_absence', weekStart?.toISOString()?.split('T')?.[0]);

      return {
        data: {
          totalStudents: studentsCount || 0,
          totalRevenue,
          pendingTransfers: pendingTransfers || 0,
          weeklyAbsences: weeklyAbsences || 0
        },
        error: null
      };
    } catch (error) {
      return {
        data: {
          totalStudents: 0,
          totalRevenue: 0,
          pendingTransfers: 0,
          weeklyAbsences: 0
        },
        error
      };
    }
  }
};