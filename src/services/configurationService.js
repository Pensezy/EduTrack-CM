import { supabase } from "../lib/supabase.js";

export class ConfigurationService {
  static async initializeSchoolConfigurations(schoolId) {
    console.log("Ecole " + schoolId + " creee. Aucune donnee par defaut ajoutee.");
    
    return {
      gradeTypes: [],
      attendanceTypes: [],
      userRoles: [],
      errors: [],
      success: true
    };
  }

  static async getDefaultConfigurations() {
    return {
      gradeTypes: [],
      attendanceTypes: [],
      userRoles: []
    };
  }
}

export default ConfigurationService;