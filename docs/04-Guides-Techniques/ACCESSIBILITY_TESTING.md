# Guide de Test des Paramètres d'Accessibilité

## Vue d'ensemble
Ce document décrit comment tester tous les paramètres d'accessibilité du dashboard principal.

## Paramètres d'Accessibilité Disponibles

### ✅ 1. High Contrast (Contraste Élevé)
**Ce qui devrait se produire :**
- Fond noir (#000000)
- Texte blanc (#FFFFFF)
- Bordures blanches visibles
- Boutons avec bordures blanches de 2px
- Couleurs primaires en jaune doré (#FFD700)

**Test :**
1. Cliquez sur l'icône d'accessibilité (♿)
2. Activez "High Contrast"
3. **Vérification :** Le fond doit devenir noir et tout le texte blanc

---

### ✅ 2. Large Text (Texte Agrandi)
**Ce qui devrait se produire :**
- Taille de police augmentée de 18%
- Tous les textes agrandis (titres, paragraphes, boutons)
- Hauteur de ligne augmentée (1.6)
- Boutons avec padding augmenté

**Test :**
1. Activez "Large Text"
2. **Vérification :** Tous les textes doivent être notablement plus grands

---

### ✅ 3. Reduce Motion (Réduire les Animations)
**Ce qui devrait se produire :**
- Toutes les animations CSS désactivées
- Transitions instantanées (0.01ms)
- Pas d'animations de pulse, spin, bounce
- Défilement automatique au lieu de smooth scroll

**Test :**
1. Activez "Reduce Motion"
2. **Vérification :** 
   - Les animations de chargement doivent disparaître
   - Les transitions entre onglets doivent être instantanées
   - Le point vert "animate-pulse" du statut système doit s'arrêter
3. **Console :** Vérifiez que les propriétés CSS sont bien appliquées

---

### ✅ 4. Audio Support (Support Audio)
**Ce qui devrait se produire :**
- Indicateur visuel "🔊 Audio Support Actif" en bas à droite
- Attribut `data-audio-enabled="true"` sur le HTML root
- Attribut `role="application"` sur le root
- Attribut `aria-live="polite"` sur le body
- Contours jaunes de 3px sur les éléments focus
- Message dans la console

**Test :**
1. Activez "Audio Support"
2. **Vérification :** 
   - Un badge vert "🔊 Audio Support Actif" doit apparaître en bas à droite
   - Ouvrez la console : vous devez voir "✅ Audio Support activé..."
   - Cliquez sur des boutons : ils doivent avoir un contour jaune (#FFD700) au focus
3. **Console DevTools :** 
   ```javascript
   document.documentElement.getAttribute('data-audio-enabled') // doit retourner "true"
   document.documentElement.getAttribute('role') // doit retourner "application"
   document.body.getAttribute('aria-live') // doit retourner "polite"
   ```

---

### ✅ 5. Theme (Thème Sombre/Clair)
**Ce qui devrait se produire :**
- **Dark :** Fond bleu foncé (#0f172a), texte clair (#f1f5f9)
- **Light :** Fond blanc, texte foncé (par défaut)

**Test :**
1. Changez le thème de "Light" à "Dark"
2. **Vérification :** Le fond doit devenir bleu foncé

---

## Tests de Persistance

### Test de Sauvegarde LocalStorage
1. Activez plusieurs paramètres
2. Rafraîchissez la page (F5)
3. **Vérification :** Tous les paramètres doivent être conservés

**Console DevTools :**
```javascript
localStorage.getItem('accessibility-settings')
// Devrait afficher un objet JSON avec vos paramètres
```

---

## Test du Bouton Reset

1. Activez tous les paramètres
2. Cliquez sur "Reset"
3. **Vérification :** Tous les paramètres doivent revenir à leur état initial

---

## Tests Combinés

### Combinaison recommandée pour malvoyants
- ✅ High Contrast
- ✅ Large Text
- ✅ Audio Support

### Combinaison pour sensibilité au mouvement
- ✅ Reduce Motion
- ✅ Theme Dark

---

## Résolution des Problèmes

### Si un paramètre ne fonctionne pas :

1. **Ouvrez la Console DevTools (F12)**
2. **Vérifiez les attributs :**
   ```javascript
   document.documentElement.classList // voir les classes actives
   document.documentElement.getAttribute('data-accessibility-contrast')
   document.documentElement.getAttribute('data-audio-enabled')
   ```

3. **Vérifiez le localStorage :**
   ```javascript
   JSON.parse(localStorage.getItem('accessibility-settings'))
   ```

4. **Vérifiez les styles appliqués :**
   - Inspectez un élément
   - Regardez dans l'onglet "Computed" les propriétés finales

---

## Checklist de Validation ✅

- [ ] High Contrast : Fond noir, texte blanc
- [ ] Large Text : Texte 18% plus grand
- [ ] Reduce Motion : Pas d'animations
- [ ] Audio Support : Badge visible + console log
- [ ] Theme Dark : Fond bleu foncé
- [ ] Persistance : Paramètres sauvegardés après refresh
- [ ] Reset : Tout revient par défaut
- [ ] Badge indicateur : Visible quand au moins 1 paramètre actif

---

## Notes Techniques

### Implémentation
- **Fichier :** `src/components/ui/AccessibilityControls.jsx`
- **Stockage :** `localStorage` avec la clé `accessibility-settings`
- **Application :** Classes CSS sur `document.documentElement`

### Améliorations Apportées
1. **Reduce Motion :** Injection dynamique d'une balise `<style>` pour forcer les animations à 0.01ms
2. **Audio Support :** Ajout d'attributs ARIA et d'un indicateur visuel
3. **High Contrast :** Styles CSS améliorés avec !important pour forcer l'application
4. **Large Text :** Augmentation du font-size root + tous les éléments individuels

---

## Support Navigateurs

✅ Chrome/Edge (Recommandé)
✅ Firefox
✅ Safari
⚠️ IE11 (Non supporté)

---

**Date de mise à jour :** 1er décembre 2025
**Version :** 2.0 - Tous les paramètres fonctionnels
