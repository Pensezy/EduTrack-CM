// Exemple d'utilisation du service de gestion multi-établissements des parents
import { parentMultiSchoolService } from './services/parentMultiSchoolService.js';

// EXEMPLE D'USAGE : Comment éviter les doublons de parents et gérer multi-établissements

async function exempleInscriptionEtudiant() {
  console.log('🎯 EXEMPLE : Inscription d\'un étudiant avec gestion centralisée des parents');
  console.log('='.repeat(70));

  try {
    // ÉTAPE 1: Données d'inscription reçues du formulaire
    const donneesInscription = {
      // Données de l'étudiant
      student: {
        firstName: 'Paul',
        lastName: 'Kamga',
        dateOfBirth: '2010-03-15',
        gender: 'male',
        schoolId: 'school-001', // Lycée Bilingue Biyem-Assi
        classId: 'class-terminale-c'
      },
      // Données du parent
      parent: {
        firstName: 'Jean',
        lastName: 'Kamga',
        email: 'jean.kamga@gmail.com',
        phone: '+237678901234',
        address: 'Yaoundé, Cameroun',
        profession: 'Ingénieur'
      }
    };

    // ÉTAPE 2: Vérifier si le parent existe déjà dans le système
    console.log('\n🔍 ÉTAPE 2: Vérification du parent existant...');
    
    const parentExistant = await parentMultiSchoolService.checkExistingParent(
      donneesInscription.parent.email,
      donneesInscription.parent.phone
    );

    if (parentExistant) {
      console.log('✅ Parent existant trouvé !');
      console.log(`   - Nom: ${parentExistant.firstName} ${parentExistant.lastName}`);
      console.log(`   - Email: ${parentExistant.email}`);
      console.log(`   - Enfants actuels: ${parentExistant.studentRelations.length}`);
      
      // Afficher les écoles où ce parent a déjà des enfants
      const ecolesParent = [...new Set(parentExistant.studentRelations.map(rel => rel.school.name))];
      console.log(`   - Écoles: ${ecolesParent.join(', ')}`);
      
      console.log('\n🎯 ACTION: Utilisation du compte parent existant (pas de doublon créé)');
    } else {
      console.log('➕ Nouveau parent - Création d\'un compte centralisé');
    }

    // ÉTAPE 3: Créer ou récupérer le parent (gestion centralisée)
    console.log('\n🔧 ÉTAPE 3: Gestion centralisée du parent...');
    
    const parent = await parentMultiSchoolService.getOrCreateParent({
      ...donneesInscription.parent,
      userId: 'user-parent-kamga' // ID utilisateur Supabase Auth
    });

    console.log(`✅ Parent géré: ${parent.firstName} ${parent.lastName} (ID: ${parent.globalParentId})`);

    // ÉTAPE 4: Créer l'étudiant (logique normale)
    console.log('\n👨‍🎓 ÉTAPE 4: Création de l\'étudiant...');
    // Ici vous utiliseriez votre logique normale de création d'étudiant
    console.log('✅ Étudiant créé (simulé)');

    // ÉTAPE 5: Lier le parent à l'étudiant dans cette école spécifique
    console.log('\n🔗 ÉTAPE 5: Liaison parent-étudiant-école...');
    
    const relationParentEtudiant = await parentMultiSchoolService.linkParentToStudentInSchool(
      parent.id,
      'student-paul-kamga-id', // ID de l'étudiant créé
      donneesInscription.student.schoolId,
      {
        relationshipType: 'parent',
        isPrimaryContact: true,
        canPickup: true,
        emergencyContact: true
      }
    );

    console.log('✅ Relation créée avec succès !');
    console.log(`   - Parent: ${relationParentEtudiant.parent.firstName} ${relationParentEtudiant.parent.lastName}`);
    console.log(`   - Étudiant: ${relationParentEtudiant.student.firstName} ${relationParentEtudiant.student.lastName}`);
    console.log(`   - École: ${relationParentEtudiant.school.name}`);

    // ÉTAPE 6: Vérifier le résultat - Parent peut maintenant voir tous ses enfants
    console.log('\n📊 ÉTAPE 6: Vue du parent sur tous ses enfants...');
    
    const enfantsParent = await parentMultiSchoolService.getParentChildren(parent.id);
    
    console.log(`✅ Le parent ${parent.firstName} ${parent.lastName} peut maintenant voir:`);
    enfantsParent.forEach((relation, index) => {
      console.log(`   ${index + 1}. ${relation.student.firstName} ${relation.student.lastName}`);
      console.log(`      - École: ${relation.school.name} (${relation.school.city})`);
      console.log(`      - Classe: ${relation.student.class?.name || 'Non assignée'}`);
      console.log(`      - Relation: ${relation.relationshipType}`);
      console.log(`      - Contact principal: ${relation.isPrimaryContact ? 'Oui' : 'Non'}`);
    });

    // ÉTAPE 7: Statistiques du parent
    console.log('\n📈 ÉTAPE 7: Statistiques du parent...');
    
    const statsParent = await parentMultiSchoolService.getParentStatistics(parent.id);
    
    console.log('✅ Statistiques:');
    console.log(`   - Total enfants: ${statsParent.totalChildren}`);
    console.log(`   - Enfants actifs: ${statsParent.activeChildren}`);
    console.log(`   - Nombre d'écoles: ${statsParent.schoolsCount}`);
    console.log('   - Écoles:');
    statsParent.schools.forEach(school => {
      console.log(`     • ${school.name}: ${school.childrenCount} enfant(s)`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'exemple:', error.message);
  }
}

// EXEMPLE 2: Recherche de parents existants lors de l'inscription
async function exempleRechercheParents() {
  console.log('\n🔍 EXEMPLE 2: Recherche de parents existants');
  console.log('='.repeat(50));

  try {
    // Simuler une recherche par nom
    const resultatsRecherche = await parentMultiSchoolService.searchExistingParents('Kamga');
    
    console.log(`✅ ${resultatsRecherche.length} parent(s) trouvé(s) pour "Kamga":`);
    
    resultatsRecherche.forEach((parent, index) => {
      console.log(`\n${index + 1}. ${parent.firstName} ${parent.lastName}`);
      console.log(`   - Email: ${parent.email}`);
      console.log(`   - Téléphone: ${parent.phone}`);
      console.log(`   - Profession: ${parent.profession || 'Non renseignée'}`);
      console.log(`   - Total enfants: ${parent.totalChildren}`);
      console.log(`   - Écoles: ${parent.schools.join(', ')}`);
      console.log(`   - Enfants: ${parent.children.join(', ')}`);
    });

    console.log('\n💡 L\'établissement peut maintenant:');
    console.log('   ✅ Proposer au secrétaire de sélectionner un parent existant');
    console.log('   ✅ Éviter la création de doublons');
    console.log('   ✅ Maintenir l\'historique du parent dans tous les établissements');

  } catch (error) {
    console.error('❌ Erreur lors de la recherche:', error.message);
  }
}

// EXEMPLE 3: Cas d'usage réel - Parent avec enfants dans 2 écoles différentes
async function exempleParentMultiEcoles() {
  console.log('\n🏫 EXEMPLE 3: Parent avec enfants dans plusieurs écoles');
  console.log('='.repeat(55));

  try {
    // Le parent Jean Kamga a déjà Paul au Lycée Biyem-Assi
    // Maintenant il inscrit Aminata au Collège La Rochelle

    const donneesNouvelleInscription = {
      student: {
        firstName: 'Aminata',
        lastName: 'Kamga',
        dateOfBirth: '2012-07-20',
        gender: 'female',
        schoolId: 'school-002', // Collège La Rochelle Douala
        classId: 'class-2nde-a'
      },
      parent: {
        email: 'jean.kamga@gmail.com', // Même email que pour Paul
        phone: '+237678901234'
      }
    };

    console.log('🔍 Vérification du parent pour la nouvelle inscription...');
    
    // Le système trouve automatiquement le parent existant
    const parentExistant = await parentMultiSchoolService.checkExistingParent(
      donneesNouvelleInscription.parent.email,
      donneesNouvelleInscription.parent.phone
    );

    if (parentExistant) {
      console.log('✅ Parent Jean Kamga déjà dans le système !');
      console.log('   - Pas besoin de créer un nouveau compte');
      console.log('   - Les 2 écoles peuvent communiquer avec le même parent');
      console.log('   - Le parent voit tous ses enfants dans un seul dashboard');

      // Créer la nouvelle relation pour Aminata
      await parentMultiSchoolService.linkParentToStudentInSchool(
        parentExistant.id,
        'student-aminata-kamga-id',
        donneesNouvelleInscription.student.schoolId
      );

      console.log('\n🎯 RÉSULTAT FINAL:');
      const enfantsFinaux = await parentMultiSchoolService.getParentChildren(parentExistant.id);
      
      console.log(`Parent ${parentExistant.firstName} ${parentExistant.lastName} voit maintenant:`);
      enfantsFinaux.forEach(relation => {
        console.log(`   • ${relation.student.firstName} - ${relation.school.name} (${relation.school.city})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'exemple multi-écoles:', error.message);
  }
}

// Exporter les fonctions d'exemple
export {
  exempleInscriptionEtudiant,
  exempleRechercheParents,
  exempleParentMultiEcoles
};

// Pour tester, décommentez ces lignes:
// exempleInscriptionEtudiant();
// exempleRechercheParents(); 
// exempleParentMultiEcoles();