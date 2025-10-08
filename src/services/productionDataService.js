import { supabase } from "../lib/supabase";

export const productionDataService = {
  currentSchoolId: null,
  currentUserId: null,

  setUserContext(userId, schoolId) {
    this.currentUserId = userId;
    this.currentSchoolId = schoolId;
    console.log("Contexte utilisateur defini: User=" + userId + ", School=" + schoolId);
  },

  ensureContext() {
    if (!this.currentUserId || !this.currentSchoolId) {
      throw new Error("Contexte utilisateur non defini");
    }
  },

  async getDashboardMetrics(schoolId = null) {
    try {
      this.ensureContext();
      const targetSchoolId = schoolId || this.currentSchoolId;

      console.log("Recuperation des metriques pour l'ecole: " + targetSchoolId);

      const [studentsCount, teachersCount, classesCount] = await Promise.allSettled([
        supabase.from("students").select("id", { count: "exact" }).eq("school_id", targetSchoolId).eq("is_active", true),
        supabase.from("teachers").select("id", { count: "exact" }).eq("school_id", targetSchoolId).eq("is_active", true),
        supabase.from("classes").select("id", { count: "exact" }).eq("school_id", targetSchoolId)
      ]);

      const students = studentsCount.status === "fulfilled" ? (studentsCount.value.count || 0) : 0;
      const teachers = teachersCount.status === "fulfilled" ? (teachersCount.value.count || 0) : 0;
      const classes = classesCount.status === "fulfilled" ? (classesCount.value.count || 0) : 0;

      const metrics = [
        { title: "Eleves", value: students, icon: "Users", trend: null },
        { title: "Presence Moyenne", value: 0, unit: "%", icon: "Calendar", trend: null },
        { title: "Moyenne Generale", value: 0, unit: "/20", icon: "BookOpen", trend: null },
        { title: "Recettes", value: 0, unit: "FCFA", icon: "DollarSign", trend: null }
      ];

      console.log("Metriques recuperees:", metrics);
      return { data: metrics, error: null };

    } catch (error) {
      console.error("Erreur recuperation metriques:", error);
      return {
        data: [
          { title: "Eleves", value: 0, icon: "Users", trend: null },
          { title: "Presence Moyenne", value: 0, unit: "%", icon: "Calendar", trend: null },
          { title: "Moyenne Generale", value: 0, unit: "/20", icon: "BookOpen", trend: null },
          { title: "Recettes", value: 0, unit: "FCFA", icon: "DollarSign", trend: null }
        ],
        error: null
      };
    }
  },

  async getClassAverages() {
    try {
      this.ensureContext();
      return { data: [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getAttendanceData() {
    try {
      this.ensureContext();
      return { data: [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getPaymentData() {
    try {
      this.ensureContext();
      return { data: [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getPersonnel() {
    try {
      this.ensureContext();
      return { data: [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getStudents() {
    try {
      this.ensureContext();
      return { data: [], error: null };
    } catch (error) {
      return { data: [], error };
    }
  },

  async getSchoolStats() {
    try {
      this.ensureContext();
      return {
        data: {
          students: 0,
          teachers: 0,
          classes: 0,
          totalRevenue: 0
        },
        error: null
      };
    } catch (error) {
      return {
        data: {
          students: 0,
          teachers: 0,
          classes: 0,
          totalRevenue: 0
        },
        error
      };
    }
  },

  async getSchoolDetails(schoolId = null) {
    try {
      this.ensureContext();
      const targetSchoolId = schoolId || this.currentSchoolId;

      console.log("Recuperation des details de l'ecole: " + targetSchoolId);

      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .select("*, users!schools_director_id_fkey (id, full_name, email)")
        .eq("id", targetSchoolId)
        .single();

      if (schoolError) {
        console.error("Erreur recuperation ecole:", schoolError);
        throw schoolError;
      }

      console.log("Details ecole recuperes:", schoolData);
      return { data: schoolData, error: null };

    } catch (error) {
      console.error("Erreur recuperation details ecole:", error);
      return { data: null, error };
    }
  },

  async getClasses(schoolId = null) {
    try {
      this.ensureContext();
      const targetSchoolId = schoolId || this.currentSchoolId;

      console.log("Recuperation des classes pour l'ecole: " + targetSchoolId);

      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("id, name, level, section, capacity, is_active, created_at")
        .eq("school_id", targetSchoolId)
        .eq("is_active", true)
        .order("level", { ascending: true })
        .order("name", { ascending: true });

      if (classesError) {
        console.error("Erreur recuperation classes:", classesError);
        throw classesError;
      }

      console.log("Classes recuperees:", classesData);
      return { data: classesData || [], error: null };

    } catch (error) {
      console.error("Erreur recuperation classes:", error);
      return { data: [], error };
    }
  }
};

export default productionDataService;