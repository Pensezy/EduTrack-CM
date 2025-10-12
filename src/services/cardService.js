// Service de démonstration pour la gestion des cartes scolaires
// En production, ces données viendraient d'une base de données

// Données d'exemple pour les étudiants
const studentsData = [
  {
    id: "STU001",
    name: "Amina Nkomo",
    class: "CM2",
    photo: "/public/assets/images/no_image.png",
    parentName: "Paul Nkomo",
    emergencyContact: "+237 6 78 90 12 34",
    bloodType: "O+",
    medicalNotes: "Aucune allergie connue",
    hasCard: true
  },
  {
    id: "STU002",
    name: "Junior Mbarga",
    class: "CM1",
    photo: "/public/assets/images/no_image.png",
    parentName: "Marie Mbarga",
    emergencyContact: "+237 6 89 01 23 45",
    bloodType: "A+",
    medicalNotes: "Asthme léger",
    hasCard: true
  },
  {
    id: "STU006",
    name: "Marie Douala",
    class: "CE2",
    photo: "/public/assets/images/no_image.png",
    parentName: "Jean Douala",
    emergencyContact: "+237 6 55 44 33 22",
    bloodType: "B-",
    medicalNotes: "Aucune",
    hasCard: false
  },
  {
    id: "STU007",
    name: "Paul Yaounde",
    class: "CM1",
    photo: "/public/assets/images/no_image.png",
    parentName: "Sophie Yaounde",
    emergencyContact: "+237 6 66 55 44 33",
    bloodType: "AB-",
    medicalNotes: "Allergie au pollen",
    hasCard: false
  }
];

// Données d'exemple pour les cartes existantes
let cardsData = [
  {
    id: 1,
    studentId: "STU001",
    studentName: "Amina Nkomo",
    class: "CM2",
    photo: "/public/assets/images/no_image.png",
    cardNumber: "CM2024001",
    issueDate: "15/11/2024",
    expiryDate: "30/06/2025",
    status: "issued",
    parentName: "Paul Nkomo",
    emergencyContact: "+237 6 78 90 12 34",
    bloodType: "O+",
    medicalNotes: "Aucune allergie connue"
  },
  {
    id: 2,
    studentId: "STU002",
    studentName: "Junior Mbarga",
    class: "CM1",
    photo: "/public/assets/images/no_image.png",
    cardNumber: "CM2024002",
    issueDate: "14/11/2024",
    expiryDate: "30/06/2025",
    status: "pending_validation",
    parentName: "Marie Mbarga",
    emergencyContact: "+237 6 89 01 23 45",
    bloodType: "A+",
    medicalNotes: "Asthme léger"
  },
  {
    id: 3,
    studentId: "STU003",
    studentName: "Grace Fouda",
    class: "CE2",
    photo: "/public/assets/images/no_image.png",
    cardNumber: "CM2024003",
    issueDate: "12/11/2024",
    expiryDate: "30/06/2025",
    status: "draft",
    parentName: "Jean Fouda",
    emergencyContact: "+237 6 90 12 34 56",
    bloodType: "B+",
    medicalNotes: "Allergie aux arachides"
  },
  {
    id: 4,
    studentId: "STU004",
    studentName: "Kevin Biya",
    class: "CM2",
    photo: "/public/assets/images/no_image.png",
    cardNumber: "CM2024004",
    issueDate: "10/11/2024",
    expiryDate: "30/06/2025",
    status: "expired",
    parentName: "Esther Biya",
    emergencyContact: "+237 6 01 23 45 67",
    bloodType: "AB+",
    medicalNotes: "Aucune"
  },
  {
    id: 5,
    studentId: "STU005",
    studentName: "Sarah Atangana",
    class: "CE1",
    photo: "/public/assets/images/no_image.png",
    cardNumber: "CM2024005",
    issueDate: "08/11/2024",
    expiryDate: "30/06/2025",
    status: "printed",
    parentName: "Michel Atangana",
    emergencyContact: "+237 6 12 34 56 78",
    bloodType: "O-",
    medicalNotes: "Diabète type 1"
  }
];

// Générateur de numéro de carte
const generateCardNumber = () => {
  const year = new Date().getFullYear();
  const nextNumber = cardsData.length + 1;
  return `CM${year}${nextNumber.toString().padStart(3, '0')}`;
};

// Formatage des dates
const formatDate = (date) => {
  return date.toLocaleDateString('fr-FR');
};

// Calcul de la date d'expiration (fin d'année scolaire)
const getExpiryDate = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Si on est entre septembre et décembre, l'expiration est en juin de l'année suivante
  // Sinon, c'est en juin de l'année courante
  const expiryYear = currentMonth >= 8 ? currentYear + 1 : currentYear;
  return new Date(expiryYear, 5, 30); // 30 juin
};

// Service principal
export const cardService = {
  // Obtenir toutes les cartes
  getAllCards: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...cardsData]), 300);
    });
  },

  // Obtenir une carte par ID
  getCardById: async (cardId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const card = cardsData.find(c => c.id === cardId);
        resolve(card || null);
      }, 200);
    });
  },

  // Rechercher des étudiants disponibles (sans carte ou avec carte expirée)
  searchAvailableStudents: async (searchTerm = '') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = studentsData.filter(student => {
          const matchesSearch = searchTerm === '' || 
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.class.toLowerCase().includes(searchTerm.toLowerCase());
          
          return matchesSearch;
        });
        resolve(filtered);
      }, 300);
    });
  },

  // Générer une nouvelle carte pour un étudiant
  generateCard: async (studentId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const student = studentsData.find(s => s.id === studentId);
        if (!student) {
          reject(new Error('Étudiant non trouvé'));
          return;
        }

        // Vérifier si l'étudiant a déjà une carte active
        const existingCard = cardsData.find(c => 
          c.studentId === studentId && 
          ['draft', 'pending_validation', 'issued', 'printed'].includes(c.status)
        );

        if (existingCard) {
          reject(new Error('Cet étudiant a déjà une carte active'));
          return;
        }

        const newCard = {
          id: Math.max(...cardsData.map(c => c.id), 0) + 1,
          studentId: student.id,
          studentName: student.name,
          class: student.class,
          photo: student.photo,
          cardNumber: generateCardNumber(),
          issueDate: formatDate(new Date()),
          expiryDate: formatDate(getExpiryDate()),
          status: 'draft',
          parentName: student.parentName,
          emergencyContact: student.emergencyContact,
          bloodType: student.bloodType,
          medicalNotes: student.medicalNotes
        };

        cardsData.push(newCard);
        resolve(newCard);
      }, 500);
    });
  },

  // Valider une carte (passer de draft ou pending_validation à issued)
  validateCard: async (cardId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cardIndex = cardsData.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
          reject(new Error('Carte non trouvée'));
          return;
        }

        const card = cardsData[cardIndex];
        if (!['draft', 'pending_validation'].includes(card.status)) {
          reject(new Error('Cette carte ne peut pas être validée dans son état actuel'));
          return;
        }

        cardsData[cardIndex] = {
          ...card,
          status: 'issued'
        };

        resolve(cardsData[cardIndex]);
      }, 400);
    });
  },

  // Imprimer une carte (passer de issued à printed)
  printCard: async (cardId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cardIndex = cardsData.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
          reject(new Error('Carte non trouvée'));
          return;
        }

        const card = cardsData[cardIndex];
        if (card.status !== 'issued' && card.status !== 'printed') {
          reject(new Error('Cette carte ne peut pas être imprimée dans son état actuel'));
          return;
        }

        cardsData[cardIndex] = {
          ...card,
          status: 'printed'
        };

        resolve(cardsData[cardIndex]);
      }, 600);
    });
  },

  // Imprimer plusieurs cartes en lot
  bulkPrintCards: async (cardIds) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const results = [];
        const errors = [];

        cardIds.forEach(cardId => {
          const cardIndex = cardsData.findIndex(c => c.id === cardId);
          if (cardIndex === -1) {
            errors.push(`Carte ${cardId} non trouvée`);
            return;
          }

          const card = cardsData[cardIndex];
          if (card.status !== 'issued' && card.status !== 'printed') {
            errors.push(`Carte ${card.cardNumber} ne peut pas être imprimée`);
            return;
          }

          cardsData[cardIndex] = {
            ...card,
            status: 'printed'
          };
          results.push(cardsData[cardIndex]);
        });

        if (errors.length > 0) {
          reject(new Error(errors.join(', ')));
          return;
        }

        resolve(results);
      }, 800);
    });
  },

  // Régénérer une carte (créer une nouvelle version)
  regenerateCard: async (studentId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const student = studentsData.find(s => s.id === studentId);
        if (!student) {
          reject(new Error('Étudiant non trouvé'));
          return;
        }

        // Marquer l'ancienne carte comme expirée
        const oldCardIndex = cardsData.findIndex(c => c.studentId === studentId);
        if (oldCardIndex !== -1) {
          cardsData[oldCardIndex].status = 'expired';
        }

        // Créer une nouvelle carte
        const newCard = {
          id: Math.max(...cardsData.map(c => c.id), 0) + 1,
          studentId: student.id,
          studentName: student.name,
          class: student.class,
          photo: student.photo,
          cardNumber: generateCardNumber(),
          issueDate: formatDate(new Date()),
          expiryDate: formatDate(getExpiryDate()),
          status: 'draft',
          parentName: student.parentName,
          emergencyContact: student.emergencyContact,
          bloodType: student.bloodType,
          medicalNotes: student.medicalNotes
        };

        cardsData.push(newCard);
        resolve(newCard);
      }, 500);
    });
  },

  // Valider plusieurs cartes en lot
  bulkValidateCards: async (cardIds) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const results = [];
        const errors = [];

        cardIds.forEach(cardId => {
          const cardIndex = cardsData.findIndex(c => c.id === cardId);
          if (cardIndex === -1) {
            errors.push(`Carte ${cardId} non trouvée`);
            return;
          }

          const card = cardsData[cardIndex];
          if (!['draft', 'pending_validation'].includes(card.status)) {
            errors.push(`Carte ${card.cardNumber} ne peut pas être validée`);
            return;
          }

          cardsData[cardIndex] = {
            ...card,
            status: 'issued'
          };
          results.push(cardsData[cardIndex]);
        });

        if (errors.length > 0) {
          reject(new Error(errors.join(', ')));
          return;
        }

        resolve(results);
      }, 600);
    });
  },

  // Obtenir les statistiques des cartes
  getCardStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = {
          total: cardsData.length,
          draft: cardsData.filter(c => c.status === 'draft').length,
          pending_validation: cardsData.filter(c => c.status === 'pending_validation').length,
          issued: cardsData.filter(c => c.status === 'issued').length,
          printed: cardsData.filter(c => c.status === 'printed').length,
          expired: cardsData.filter(c => c.status === 'expired').length
        };
        resolve(stats);
      }, 200);
    });
  }
};

export default cardService;