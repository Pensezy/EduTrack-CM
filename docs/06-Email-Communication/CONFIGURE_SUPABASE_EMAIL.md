# 📧 Configuration des Emails Supabase

## 🐛 Problème

Les emails de confirmation affichent "**supabaseAuth**" comme expéditeur au lieu du nom de la plateforme "**EduTrack**".

---

## ✅ Solution

### 1️⃣ Changer le Nom de l'Expéditeur

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** EduTrack
3. **Allez dans** : **Settings** → **Authentication** → **Email Templates**

4. **Modifier le "Sender name"** :
   - Cherchez le champ **"Sender name"** (en haut)
   - Changez `supabaseAuth` → `EduTrack`
   - Cliquez **"Save"**

---

### 2️⃣ Personnaliser l'Adresse Email (Optionnel)

Par défaut, Supabase utilise `noreply@mail.app.supabase.co`

Pour utiliser votre propre domaine (ex: `noreply@edutrack.cm`):

1. **Allez dans** : **Settings** → **Authentication** → **SMTP Settings**
2. **Activez** "Enable Custom SMTP"
3. **Configurez votre serveur SMTP** :
   ```
   Host: smtp.gmail.com (ou votre provider)
   Port: 587
   Username: votre-email@gmail.com
   Password: mot-de-passe-application
   Sender email: noreply@edutrack.cm
   Sender name: EduTrack
   ```

⚠️ **Note** : Ceci nécessite un compte email professionnel (Gmail, SendGrid, AWS SES, etc.)

---

### 3️⃣ Personnaliser les Templates d'Email

Pour rendre les emails plus professionnels avec le logo et les couleurs EduTrack :

1. **Allez dans** : **Email Templates**
2. **Sélectionnez** : **Confirm signup**
3. **Modifiez le template HTML** :

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Confirmez votre inscription - EduTrack</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background-color: #f3f4f6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f9fafb;
      padding: 20px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 EduTrack</h1>
    </div>
    <div class="content">
      <h2 style="color: #111827; margin-bottom: 16px;">
        Bienvenue sur EduTrack !
      </h2>
      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
        Merci de vous être inscrit. Pour activer votre compte et commencer à utiliser notre plateforme de gestion scolaire, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
      </p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">
          Confirmer mon email
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
        <a href="{{ .ConfirmationURL }}" style="color: #2563eb;">{{ .ConfirmationURL }}</a>
      </p>
      <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
        Ce lien expirera dans 24 heures.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">
        © 2026 EduTrack - Solution modulaire de gestion scolaire
      </p>
      <p style="margin: 8px 0 0 0;">
        <a href="https://edutrack.cm" style="color: #2563eb; text-decoration: none;">
          edutrack.cm
        </a>
      </p>
    </div>
  </div>
</body>
</html>
```

4. **Cliquez "Save"**

---

## 📊 Résultat Attendu

Après configuration, les emails afficheront :

**Expéditeur** :
```
EduTrack <noreply@mail.app.supabase.co>
```

**Sujet** :
```
Confirmez votre inscription - EduTrack
```

**Contenu** :
- En-tête bleu avec logo EduTrack
- Message personnalisé
- Bouton de confirmation stylisé
- Footer avec lien vers le site

---

## 🔧 Variables Disponibles dans les Templates

Vous pouvez utiliser ces variables dans vos templates email :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `{{ .SiteURL }}` | URL du site | `https://edutrack.cm` |
| `{{ .ConfirmationURL }}` | URL de confirmation complète | `https://edutrack.cm/auth/confirm?token=...` |
| `{{ .TokenHash }}` | Hash du token | `abc123def456...` |
| `{{ .Email }}` | Email de l'utilisateur | `directeur@ecole.com` |

---

## ✅ Checklist de Configuration

- [ ] **Sender name** changé de `supabaseAuth` → `EduTrack`
- [ ] **Template "Confirm signup"** personnalisé avec HTML
- [ ] **Site URL** configuré (`http://localhost:5173` en dev)
- [ ] **Redirect URLs** ajoutées
- [ ] **Test** : Créer un compte et vérifier l'email reçu

---

## 🎯 Test

1. Créez un nouveau compte sur `http://localhost:5173/signup`
2. Vérifiez l'email reçu
3. L'expéditeur devrait être **"EduTrack"**
4. Le design devrait avoir le header bleu et le bouton stylisé
5. Le lien devrait pointer vers `http://localhost:5173/auth/confirm`

---

**Dernière mise à jour** : 2026-01-01
