const { PrismaClient } = require('../src/generated/prisma');
const { faker } = require('@faker-js/faker');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

// Configurer faker en français
faker.locale = 'fr';

async function seedDemoData() {
  console.log('🌱 Démarrage du seed avec des données de démonstration...');

  try {
    // 1. Créer des écoles
    console.log('📚 Création des écoles...');
    
    const schools = [];
    const schoolsData = [
      {
        name: 'École Primaire les Palmiers',
        code: 'EPP_PALMIERS',
        type: 'primaire',
        city: 'Yaoundé',
        directorName: 'Mme Marie Koanga'
      },
      {
        name: 'Collège-Lycée Excellence',
        code: 'CL_EXCELLENCE',
        type: 'college_lycee',
        city: 'Douala',
        directorName: 'M. Paul Ngono'
      },
      {
        name: 'Institution Sainte-Thérèse',
        code: 'IST_BAFOUSSAM',
        type: 'college',
        city: 'Bafoussam',
        directorName: 'Sœur Anne Mbarga'
      }
    ];

    for (const schoolData of schoolsData) {
      // Créer l'utilisateur directeur
      const directorUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: `director.${schoolData.code.toLowerCase()}@edutrack.cm`,
          fullName: schoolData.directorName,
          phone: faker.phone.number('+237 6## ## ## ##'),
          role: 'principal',
          photo: '/assets/images/no_image.png',
          isActive: true,
          language: 'fr',
          timezone: 'Africa/Douala'
        }
      });

      // Créer l'école
      const school = await prisma.school.create({
        data: {
          name: schoolData.name,
          code: schoolData.code,
          type: schoolData.type,
          directorName: schoolData.directorName,
          phone: faker.phone.number('+237 2## ## ## ##'),
          email: `contact@${schoolData.code.toLowerCase()}.cm`,
          address: faker.address.streetAddress(),
          city: schoolData.city,
          country: 'Cameroun',
          website: `https://www.${schoolData.code.toLowerCase()}.cm`,
          availableClasses: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
          directorUserId: directorUser.id,
          settings: {
            maxStudentsPerClass: 35,
            gradeScale: 20,
            language: 'fr'
          }
        }
      });

      schools.push(school);
      console.log(`✅ École créée: ${school.name}`);
    }

    // 2. Créer des années académiques
    console.log('📅 Création des années académiques...');
    
    const academicYears = [];
    for (const school of schools) {
      const academicYear = await prisma.academicYear.create({
        data: {
          schoolId: school.id,
          name: '2024-2025',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2025-06-30'),
          isCurrent: true
        }
      });
      academicYears.push(academicYear);
    }

    // 3. Créer des classes
    console.log('🏫 Création des classes...');
    
    const classes = [];
    const classNames = ['CP A', 'CP B', 'CE1 A', 'CE1 B', 'CE2 A', 'CM1 A', 'CM2 A'];
    
    for (const school of schools) {
      const academicYear = academicYears.find(ay => ay.schoolId === school.id);
      
      for (const className of classNames) {
        const classData = await prisma.class.create({
          data: {
            schoolId: school.id,
            academicYearId: academicYear.id,
            name: className,
            level: className.split(' ')[0],
            section: className.split(' ')[1] || 'A',
            capacity: 35,
            currentEnrollment: faker.number.int({ min: 20, max: 35 })
          }
        });
        classes.push(classData);
      }
    }

    // 4. Créer des parents avec système multi-établissements
    console.log('👨‍👩‍👧‍👦 Création des parents (système multi-établissements)...');
    
    const parents = [];
    const globalParents = [
      {
        firstName: 'Jean',
        lastName: 'Mballa',
        email: 'jean.mballa@gmail.com',
        phone: '+237678123456',
        address: 'Quartier Melen, Yaoundé',
        profession: 'Ingénieur'
      },
      {
        firstName: 'Marie',
        lastName: 'Ngono',
        email: 'marie.ngono@yahoo.fr',
        phone: '+237699234567',
        address: 'Bonanjo, Douala',
        profession: 'Médecin'
      },
      {
        firstName: 'Paul',
        lastName: 'Tchoupi',
        email: 'paul.tchoupi@outlook.com',
        phone: '+237655345678',
        address: 'Centre-ville, Bafoussam',
        profession: 'Commerçant'
      },
      {
        firstName: 'Françoise',
        lastName: 'Koum',
        email: 'francoise.koum@gmail.com',
        phone: '+237677456789',
        address: 'Emana, Yaoundé',
        profession: 'Enseignante'
      },
      {
        firstName: 'André',
        lastName: 'Biya',
        email: 'andre.biya@hotmail.com',
        phone: '+237698567890',
        address: 'Akwa, Douala',
        profession: 'Directeur Commercial'
      }
    ];

    for (const parentData of globalParents) {
      // Créer l'utilisateur parent
      const parentUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: parentData.email,
          fullName: `${parentData.firstName} ${parentData.lastName}`,
          phone: parentData.phone,
          role: 'parent',
          photo: '/assets/images/no_image.png',
          isActive: true,
          language: 'fr',
          timezone: 'Africa/Douala'
        }
      });

      // Créer le profil parent avec globalParentId unique
      const parent = await prisma.parent.create({
        data: {
          userId: parentUser.id,
          firstName: parentData.firstName,
          lastName: parentData.lastName,
          phone: parentData.phone,
          email: parentData.email,
          address: parentData.address,
          profession: parentData.profession,
          globalParentId: randomUUID() // Identifiant global unique
        }
      });

      parents.push(parent);
      console.log(`✅ Parent créé: ${parent.firstName} ${parent.lastName} (ID Global: ${parent.globalParentId})`);
    }

    // 5. Créer des étudiants et les lier aux parents
    console.log('👨‍🎓 Création des étudiants et liaison avec les parents...');
    
    const students = [];
    
    // Scénario 1: Jean Mballa a 2 enfants dans 2 écoles différentes
    const jean = parents.find(p => p.firstName === 'Jean');
    
    // Enfant 1 de Jean à Yaoundé (École Primaire les Palmiers)
    const school1 = schools.find(s => s.city === 'Yaoundé');
    const class1 = classes.find(c => c.schoolId === school1.id && c.name === 'CE1 A');
    
    const student1User = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `kevin.mballa@student.edutrack.cm`,
        fullName: 'Kevin Mballa',
        role: 'student',
        currentSchoolId: school1.id
      }
    });

    const student1 = await prisma.student.create({
      data: {
        userId: student1User.id,
        schoolId: school1.id,
        classId: class1.id,
        studentId: 'YDE001',
        firstName: 'Kevin',
        lastName: 'Mballa',
        dateOfBirth: new Date('2016-03-15'),
        gender: 'male',
        address: jean.address,
        parentEmail: jean.email,
        parentPhone: jean.phone,
        enrollmentDate: new Date('2024-09-01')
      }
    });

    // Lier Kevin à son parent Jean dans cette école
    await prisma.parentStudentSchool.create({
      data: {
        parentId: jean.id,
        studentId: student1.id,
        schoolId: school1.id,
        relationshipType: 'père',
        isPrimaryContact: true,
        canPickup: true,
        emergencyContact: true
      }
    });

    students.push(student1);
    console.log(`✅ Étudiant créé: ${student1.firstName} ${student1.lastName} à ${school1.name}`);

    // Enfant 2 de Jean à Douala (Collège-Lycée Excellence)
    const school2 = schools.find(s => s.city === 'Douala');
    const class2 = classes.find(c => c.schoolId === school2.id && c.name === 'CM2 A');
    
    const student2User = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `sandra.mballa@student.edutrack.cm`,
        fullName: 'Sandra Mballa',
        role: 'student',
        currentSchoolId: school2.id
      }
    });

    const student2 = await prisma.student.create({
      data: {
        userId: student2User.id,
        schoolId: school2.id,
        classId: class2.id,
        studentId: 'DLA001',
        firstName: 'Sandra',
        lastName: 'Mballa',
        dateOfBirth: new Date('2013-07-22'),
        gender: 'female',
        address: 'Bonanjo, Douala', // Adresse différente car elle vit avec sa grand-mère
        parentEmail: jean.email,
        parentPhone: jean.phone,
        enrollmentDate: new Date('2024-09-01')
      }
    });

    // Lier Sandra à son parent Jean dans cette école
    await prisma.parentStudentSchool.create({
      data: {
        parentId: jean.id,
        studentId: student2.id,
        schoolId: school2.id,
        relationshipType: 'père',
        isPrimaryContact: true,
        canPickup: true,
        emergencyContact: true
      }
    });

    students.push(student2);
    console.log(`✅ Étudiant créé: ${student2.firstName} ${student2.lastName} à ${school2.name}`);

    // Scénario 2: Marie Ngono a un enfant à Douala et un autre à Bafoussam
    const marie = parents.find(p => p.firstName === 'Marie');
    
    // Enfant 1 de Marie à Douala
    const student3User = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `alex.ngono@student.edutrack.cm`,
        fullName: 'Alex Ngono',
        role: 'student',
        currentSchoolId: school2.id
      }
    });

    const student3 = await prisma.student.create({
      data: {
        userId: student3User.id,
        schoolId: school2.id,
        classId: classes.find(c => c.schoolId === school2.id && c.name === 'CP A').id,
        studentId: 'DLA002',
        firstName: 'Alex',
        lastName: 'Ngono',
        dateOfBirth: new Date('2018-11-10'),
        gender: 'male',
        address: marie.address,
        parentEmail: marie.email,
        parentPhone: marie.phone,
        enrollmentDate: new Date('2024-09-01')
      }
    });

    await prisma.parentStudentSchool.create({
      data: {
        parentId: marie.id,
        studentId: student3.id,
        schoolId: school2.id,
        relationshipType: 'mère',
        isPrimaryContact: true,
        canPickup: true,
        emergencyContact: true
      }
    });

    students.push(student3);

    // Enfant 2 de Marie à Bafoussam
    const school3 = schools.find(s => s.city === 'Bafoussam');
    const student4User = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `laura.ngono@student.edutrack.cm`,
        fullName: 'Laura Ngono',
        role: 'student',
        currentSchoolId: school3.id
      }
    });

    const student4 = await prisma.student.create({
      data: {
        userId: student4User.id,
        schoolId: school3.id,
        classId: classes.find(c => c.schoolId === school3.id && c.name === 'CE2 A').id,
        studentId: 'BAF001',
        firstName: 'Laura',
        lastName: 'Ngono',
        dateOfBirth: new Date('2015-05-18'),
        gender: 'female',
        address: 'Centre-ville, Bafoussam',
        parentEmail: marie.email,
        parentPhone: marie.phone,
        enrollmentDate: new Date('2024-09-01')
      }
    });

    await prisma.parentStudentSchool.create({
      data: {
        parentId: marie.id,
        studentId: student4.id,
        schoolId: school3.id,
        relationshipType: 'mère',
        isPrimaryContact: true,
        canPickup: true,
        emergencyContact: true
      }
    });

    students.push(student4);

    // Créer quelques autres étudiants pour les autres parents
    for (let i = 0; i < 8; i++) {
      const randomParent = faker.helpers.arrayElement(parents.slice(2)); // Exclure Jean et Marie déjà traités
      const randomSchool = faker.helpers.arrayElement(schools);
      const randomClass = faker.helpers.arrayElement(classes.filter(c => c.schoolId === randomSchool.id));
      
      const studentUser = await prisma.user.create({
        data: {
          id: randomUUID(),
          email: faker.internet.email(),
          fullName: `${faker.person.firstName()} ${randomParent.lastName}`,
          role: 'student',
          currentSchoolId: randomSchool.id
        }
      });

      const student = await prisma.student.create({
        data: {
          userId: studentUser.id,
          schoolId: randomSchool.id,
          classId: randomClass.id,
          studentId: `${randomSchool.code.slice(0,3)}${String(i + 10).padStart(3, '0')}`,
          firstName: faker.person.firstName(),
          lastName: randomParent.lastName,
          dateOfBirth: faker.date.between({ from: '2010-01-01', to: '2018-12-31' }),
          gender: faker.helpers.arrayElement(['male', 'female']),
          address: randomParent.address,
          parentEmail: randomParent.email,
          parentPhone: randomParent.phone,
          enrollmentDate: new Date('2024-09-01')
        }
      });

      await prisma.parentStudentSchool.create({
        data: {
          parentId: randomParent.id,
          studentId: student.id,
          schoolId: randomSchool.id,
          relationshipType: faker.helpers.arrayElement(['père', 'mère', 'tuteur']),
          isPrimaryContact: true,
          canPickup: true,
          emergencyContact: false
        }
      });

      students.push(student);
    }

    console.log(`✅ ${students.length} étudiants créés avec leurs relations parents`);

    // 6. Afficher un résumé des données créées
    console.log('\n📊 RÉSUMÉ DES DONNÉES DE DÉMONSTRATION:');
    console.log('=====================================');
    
    for (const school of schools) {
      console.log(`\n🏫 ${school.name} (${school.city})`);
      
      const schoolStudents = students.filter(s => s.schoolId === school.id);
      console.log(`   👨‍🎓 ${schoolStudents.length} étudiants`);
      
      // Afficher les relations parents multi-établissements
      const parentRelations = await prisma.parentStudentSchool.findMany({
        where: { schoolId: school.id },
        include: {
          parent: true,
          student: true
        }
      });
      
      console.log(`   👨‍👩‍👧‍👦 Relations parents:`);
      for (const relation of parentRelations) {
        console.log(`      - ${relation.parent.firstName} ${relation.parent.lastName} → ${relation.student.firstName} ${relation.student.lastName} (${relation.relationshipType})`);
      }
    }

    // Cas spéciaux multi-établissements
    console.log('\n🔗 PARENTS MULTI-ÉTABLISSEMENTS:');
    console.log('================================');
    
    // Jean Mballa
    const jeanRelations = await prisma.parentStudentSchool.findMany({
      where: { parentId: jean.id },
      include: {
        student: true,
        school: true
      }
    });
    
    console.log(`👨 Jean Mballa (ID Global: ${jean.globalParentId}):`);
    for (const relation of jeanRelations) {
      console.log(`   - ${relation.student.firstName} à ${relation.school.name} (${relation.school.city})`);
    }

    // Marie Ngono
    const marieRelations = await prisma.parentStudentSchool.findMany({
      where: { parentId: marie.id },
      include: {
        student: true,
        school: true
      }
    });
    
    console.log(`👩 Marie Ngono (ID Global: ${marie.globalParentId}):`);
    for (const relation of marieRelations) {
      console.log(`   - ${relation.student.firstName} à ${relation.school.name} (${relation.school.city})`);
    }

    console.log('\n✅ Données de démonstration créées avec succès!');
    console.log('🎯 Le système multi-établissements est prêt pour les tests.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des données:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour nettoyer les données existantes
async function cleanDatabase() {
  console.log('🧹 Nettoyage de la base de données...');
  
  try {
    // Supprimer dans l'ordre des dépendances
    await prisma.parentStudentSchool.deleteMany();
    await prisma.student.deleteMany();
    await prisma.parent.deleteMany();
    await prisma.class.deleteMany();
    await prisma.academicYear.deleteMany();
    await prisma.school.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('✅ Base de données nettoyée');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--clean')) {
    await cleanDatabase();
    return;
  }
  
  if (args.includes('--reset')) {
    await cleanDatabase();
  }
  
  await seedDemoData();
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error('❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { seedDemoData, cleanDatabase };