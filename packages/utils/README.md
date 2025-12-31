# @edutrack/utils

Package contenant les utilitaires partagés pour l'application EduTrack.

## Installation

```bash
npm install @edutrack/utils
```

## Utilisation

### Formatters

#### `formatDate(date, formatString)`
Formate une date en chaîne de caractères lisible avec localisation française.

```javascript
import { formatDate } from '@edutrack/utils';

const date = new Date('2024-01-15');
console.log(formatDate(date)); // "15 janvier 2024"
console.log(formatDate(date, 'dd/MM/yyyy')); // "15/01/2024"
```

#### `formatDateShort(date)`
Formate une date au format court français (jj/mm/aaaa).

```javascript
import { formatDateShort } from '@edutrack/utils';

const date = new Date('2024-01-15');
console.log(formatDateShort(date)); // "15/01/2024"
```

#### `formatDateTime(date)`
Formate une date avec l'heure.

```javascript
import { formatDateTime } from '@edutrack/utils';

const date = new Date('2024-01-15T14:30:00');
console.log(formatDateTime(date)); // "15 janvier 2024 14:30"
```

### Validators

#### `validateEmail(email)`
Valide une adresse email avec une expression régulière basique.

```javascript
import { validateEmail } from '@edutrack/utils';

console.log(validateEmail('user@example.com')); // true
console.log(validateEmail('invalid.email')); // false
```

#### `normalizeEmail(email)`
Normalise une adresse email (minuscules et espaces supprimés).

```javascript
import { normalizeEmail } from '@edutrack/utils';

console.log(normalizeEmail('  User@Example.COM  ')); // "user@example.com"
```

#### `validateAndNormalizeEmail(email)`
Valide et normalise une adresse email en une seule opération.

```javascript
import { validateAndNormalizeEmail } from '@edutrack/utils';

const result = validateAndNormalizeEmail('  User@Example.COM  ');
console.log(result);
// {
//   isValid: true,
//   normalizedEmail: "user@example.com"
// }
```

## Structure

```
packages/utils/
├── src/
│   ├── index.js              # Point d'entrée principal
│   ├── formatters/
│   │   ├── index.js          # Exports des formatters
│   │   └── dateFormatter.js   # Fonctions de formatage de dates
│   └── validators/
│       ├── index.js          # Exports des validators
│       └── emailValidator.js  # Fonctions de validation d'email
├── package.json
└── README.md
```

## Dépendances

- `date-fns`: Utilitaires pour la manipulation et le formatage de dates

## Licence

ISC
