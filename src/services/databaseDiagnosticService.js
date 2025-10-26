import { supabase } from '../lib/supabase';

/**
 * Service de diagnostic de la base de données
 * Permet d'identifier et de résoudre les problèmes de permissions
 */
export class DatabaseDiagnosticService {
  /**
   * Vérifier les permissions de l'utilisateur courant
   */
  static async checkUserPermissions() {
    try {
      console.log('🔍 Diagnostic des permissions utilisateur...');
      
      // 1. Vérifier l'utilisateur authentifié
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        return {
          success: false,
          error: 'Utilisateur non authentifié',
          authUser: null,
          userDetails: null
        };
      }
      
      console.log('✅ Utilisateur authentifié:', authUser.user.email);
      
      // 2. Vérifier si l'utilisateur existe dans la table users
      const { data: tableUser, error: tableUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.user.id)
        .single();
      
      if (tableUserError) {
        console.warn('⚠️ Erreur accès table users:', tableUserError);
      }
      
      console.log('👤 Utilisateur dans table users:', tableUser ? '✅ Présent' : '❌ Absent');
      
      // 3. Tester l'accès aux différentes tables
      const tableAccessTests = [
        { name: 'users', query: () => supabase.from('users').select('id').eq('id', authUser.user.id) },
        { name: 'schools', query: () => supabase.from('schools').select('id').limit(1) },
        { name: 'students', query: () => supabase.from('students').select('id').limit(1) },
        { name: 'teachers', query: () => supabase.from('teachers').select('id').limit(1) },
        { name: 'classes', query: () => supabase.from('classes').select('id').limit(1) }
      ];
      
      const accessResults = {};
      for (const test of tableAccessTests) {
        try {
          const { data, error } = await test.query();
          accessResults[test.name] = {
            accessible: !error,
            error: error?.message || null
          };
          console.log(`📋 ${test.name}: ${!error ? '✅ Accès OK' : '❌ Accès refusé'}`);
        } catch (err) {
          accessResults[test.name] = {
            accessible: false,
            error: err.message
          };
          console.log(`📋 ${test.name}: ❌ Erreur - ${err.message}`);
        }
      }
      
      // 4. Vérifier les écoles du directeur
      let schoolData = null;
      let schoolError = null;
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id, name, status, director_user_id')
          .eq('director_user_id', authUser.user.id);
        
        schoolData = data;
        schoolError = error;
        
        if (error) {
          console.warn('🏫 Erreur accès écoles directeur:', error);
        } else {
          console.log(`🏫 Écoles du directeur: ${data?.length || 0} trouvée(s)`);
        }
      } catch (err) {
        schoolError = err;
        console.warn('🏫 Exception accès écoles:', err);
      }
      
      return {
        success: true,
        authUser: authUser.user,
        tableUser,
        tableAccess: accessResults,
        schools: schoolData,
        schoolError,
        summary: {
          authenticated: true,
          userInTable: !!tableUser,
          tablesAccessible: Object.values(accessResults).filter(t => t.accessible).length,
          totalTables: tableAccessTests.length
        }
      };
      
    } catch (error) {
      console.error('❌ Erreur diagnostic permissions:', error);
      return {
        success: false,
        error: error.message,
        authUser: null,
        userDetails: null
      };
    }
  }
  
  /**
   * Réparer les permissions de l'utilisateur
   */
  static async repairUserPermissions(userId, userEmail, userMetadata = {}) {
    try {
      console.log('🔧 Réparation des permissions pour:', userEmail);
      
      // 1. S'assurer que l'utilisateur existe dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: userEmail,
          full_name: userMetadata.full_name || userEmail.split('@')[0],
          role: userMetadata.role || 'student',
          phone: userMetadata.phone || '',
          is_active: true,
          active: true,
          photo: '/assets/images/no_image.png',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (userError) {
        console.error('❌ Erreur réparation utilisateur:', userError);
        throw new Error(`Erreur création utilisateur: ${userError.message}`);
      }
      
      console.log('✅ Utilisateur réparé:', userData);
      
      // 2. Si c'est un directeur, vérifier/initialiser l'école
      if (userMetadata.role === 'principal') {
        const { data: schools, error: schoolError } = await supabase
          .from('schools')
          .select('id, name')
          .eq('director_user_id', userId);
        
        if (schoolError) {
          console.warn('⚠️ Erreur vérification école:', schoolError);
        } else if (!schools || schools.length === 0) {
          console.log('🆕 Aucune école trouvée pour ce directeur');
        } else {
          console.log('🏫 École existante:', schools[0]?.name);
        }
      }
      
      return {
        success: true,
        user: userData
      };
      
    } catch (error) {
      console.error('❌ Erreur réparation permissions:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Exécuter un diagnostic complet
   */
  static async runFullDiagnostic() {
    console.log('🚀 Lancement diagnostic complet base de données...');
    
    const results = {
      timestamp: new Date().toISOString(),
      steps: {}
    };
    
    // 1. Vérifier les permissions
    results.steps.permissions = await this.checkUserPermissions();
    
    // 2. Autres diagnostics...
    console.log('✅ Diagnostic terminé');
    
    return results;
  }
}

export default DatabaseDiagnosticService;