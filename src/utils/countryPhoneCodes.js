// Indicatifs téléphoniques des pays
export const countryPhoneCodes = {
  'Cameroun': '+237',
  'France': '+33',
  'Sénégal': '+221',
  'Côte d\'Ivoire': '+225',
  'Mali': '+223',
  'Burkina Faso': '+226',
  'Niger': '+227',
  'Tchad': '+235',
  'République Centrafricaine': '+236',
  'Gabon': '+241',
  'République du Congo': '+242',
  'République Démocratique du Congo': '+243',
  'Guinée Équatoriale': '+240',
  'São Tomé-et-Príncipe': '+239',
  'Maroc': '+212',
  'Algérie': '+213',
  'Tunisie': '+216',
  'Libye': '+218',
  'Égypte': '+20',
  'Soudan': '+249',
  'Éthiopie': '+251',
  'Kenya': '+254',
  'Ouganda': '+256',
  'Tanzanie': '+255',
  'Rwanda': '+250',
  'Burundi': '+257',
  'Somalie': '+252',
  'Djibouti': '+253',
  'Érythrée': '+291',
  'Madagascar': '+261',
  'Maurice': '+230',
  'Seychelles': '+248',
  'Comores': '+269',
  'Afrique du Sud': '+27',
  'Namibie': '+264',
  'Botswana': '+267',
  'Zimbabwe': '+263',
  'Zambie': '+260',
  'Malawi': '+265',
  'Mozambique': '+258',
  'Angola': '+244',
  'Ghana': '+233',
  'Nigeria': '+234',
  'Bénin': '+229',
  'Togo': '+228',
  'Liberia': '+231',
  'Sierra Leone': '+232',
  'Guinée': '+224',
  'Guinée-Bissau': '+245',
  'Cap-Vert': '+238',
  'Gambie': '+220',
  'Mauritanie': '+222'
};

/**
 * Obtenir l'indicatif téléphonique d'un pays
 */
export const getCountryPhoneCode = (country) => {
  return countryPhoneCodes[country] || '+237'; // Par défaut Cameroun
};

/**
 * Formater un numéro de téléphone avec l'indicatif du pays
 */
export const formatPhoneWithCountryCode = (phone, country) => {
  if (!phone || !country) return phone;
  
  const countryCode = getCountryPhoneCode(country);
  
  // Nettoyer le numéro (enlever espaces, tirets, etc.)
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si le numéro commence déjà par un indicatif, le remplacer
  if (cleanPhone.startsWith('+')) {
    // Trouver où l'indicatif se termine (après le + et les chiffres)
    const match = cleanPhone.match(/^\+\d+/);
    if (match) {
      cleanPhone = cleanPhone.substring(match[0].length);
    }
  }
  
  // Si le numéro commence par 0, l'enlever (format national)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // Retourner le numéro formaté avec le nouvel indicatif
  return `${countryCode} ${cleanPhone}`;
};

/**
 * Valider un numéro de téléphone selon le pays
 */
export const validatePhoneNumber = (phone, country) => {
  if (!phone) return false;
  
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  // Validation basique : doit contenir entre 8 et 15 chiffres
  if (!/^\d{8,15}$/.test(cleanPhone)) {
    return false;
  }
  
  // Validations spécifiques par pays (exemples)
  switch (country) {
    case 'Cameroun':
      // Les numéros camerounais font 9 chiffres (sans indicatif)
      return /^\d{9}$/.test(cleanPhone.replace(/^237/, ''));
    case 'France':
      // Les numéros français font 10 chiffres (sans indicatif)
      return /^\d{10}$/.test(cleanPhone.replace(/^33/, ''));
    case 'Sénégal':
      // Les numéros sénégalais font 9 chiffres (sans indicatif)
      return /^\d{9}$/.test(cleanPhone.replace(/^221/, ''));
    default:
      // Validation générique
      return cleanPhone.length >= 8 && cleanPhone.length <= 15;
  }
};

/**
 * Obtenir la liste des pays supportés
 */
export const getSupportedCountries = () => {
  return Object.keys(countryPhoneCodes).sort();
};

export default {
  countryPhoneCodes,
  getCountryPhoneCode,
  formatPhoneWithCountryCode,
  validatePhoneNumber,
  getSupportedCountries
};