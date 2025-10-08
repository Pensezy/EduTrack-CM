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

  async getSchoolDetails(schoolId = null, userId = null) {
    try {
      // Si on a un schoolId spécifique, on l'utilise directement
      if (schoolId) {
        console.log("Recuperation des details de l'ecole par ID: " + schoolId);

        const { data: schoolData, error: schoolError } = await supabase
          .from("schools")
          .select("*, users!director_user_id (id, full_name, email)")
          .eq("id", schoolId)
          .single();

        if (schoolError) {
          console.error("Erreur recuperation ecole par ID:", schoolError);
          return { data: null, error: schoolError };
        }

        console.log("Details ecole recuperes par ID:", schoolData);
        return { data: schoolData, error: null };
      }
      
      // Si on a un userId, chercher l'école par directeur
      if (userId) {
        console.log("Recherche ecole par directeur: " + userId);

        const { data: schoolData, error: schoolError } = await supabase
          .from("schools")
          .select("*, users!director_user_id (id, full_name, email)")
          .eq("director_user_id", userId)
          .single();

        if (schoolError) {
          console.error("Erreur recherche ecole par directeur:", schoolError);
          return { data: null, error: schoolError };
        }

        console.log("Ecole trouvee par directeur:", schoolData);
        return { data: schoolData, error: null };
      }

      // Fallback: utiliser le contexte existant
      this.ensureContext();
      const targetSchoolId = this.currentSchoolId;

      console.log("Recuperation des details de l'ecole (contexte): " + targetSchoolId);

      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .select("*, users!director_user_id (id, full_name, email)")
        .eq("id", targetSchoolId)
        .single();

      if (schoolError) {
        console.error("Erreur recuperation ecole (contexte):", schoolError);
        throw schoolError;
      }

      console.log("Details ecole recuperes (contexte):", schoolData);
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

      // Récupérer les classes depuis le champ available_classes de l'école
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .select("available_classes, type")
        .eq("id", targetSchoolId)
        .single();

      if (schoolError) {
        console.error("Erreur recuperation ecole pour classes:", schoolError);
        throw schoolError;
      }

      // Convertir available_classes (array) en format attendu par les composants
      const availableClasses = schoolData.available_classes || [];
      const classesData = availableClasses.map((className, index) => ({
        id: `class_${index}`,
        name: className,
        level: className.replace(/[^0-9]/g, '') || className, // Extraire le niveau (6, 5, 4, 3...)
        section: className.replace(/[0-9]/g, '').replace('ème', '').trim() || null, // Extraire la section (A, B...)
        capacity: 30, // Capacité par défaut
        is_active: true,
        created_at: new Date().toISOString()
      }));

      console.log("Classes recuperees depuis available_classes:", classesData);
      return { data: classesData, error: null };

    } catch (error) {
      console.error("Erreur recuperation classes:", error);
      return { data: [], error };
    }
  }
};

export default productionDataService;