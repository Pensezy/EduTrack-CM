# Configuration des Templates Email EduTrack-CM

## 📧 Personnalisation des emails de confirmation

### Accès à la configuration :
1. Aller sur https://app.supabase.com
2. Sélectionner votre projet EduTrack-CM  
3. Aller dans **Settings** → **Auth** → **Email Templates**

### Templates à personnaliser :

#### 1. **Confirm signup** (Email de confirmation d'inscription)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Confirmez votre compte EduTrack-CM</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
        .button { 
            display: inline-block; 
            background: #2563eb; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            margin: 20px 0;
        }
        .footer { background: #64748b; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎓 EduTrack-CM</h1>
            <p>Système de Gestion Scolaire</p>
        </div>
        
        <div class="content">
            <h2>Bienvenue sur EduTrack-CM ! 🎉</h2>
            
            <p>Bonjour <strong>{{ .Name }}</strong>,</p>
            
            <p>Merci de vous être inscrit sur <strong>EduTrack-CM</strong>, la plateforme de gestion scolaire moderne et intuitive.</p>
            
            <p>Pour activer votre compte de directeur d'établissement et accéder à votre tableau de bord, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="button">
                    ✅ Confirmer mon compte
                </a>
            </div>
            
            <p><strong>Informations de votre compte :</strong></p>
            <ul>
                <li>📧 Email : {{ .Email }}</li>
                <li>👤 Rôle : Directeur d'établissement</li>
                <li>🏫 Plateforme : EduTrack-CM</li>
            </ul>
            
            <hr>
            
            <p><small>
                ⏰ Ce lien est valide pendant 24 heures.<br>
                🔒 Si vous n'avez pas créé ce compte, vous pouvez ignorer cet email en toute sécurité.
            </small></p>
        </div>
        
        <div class="footer">
            <p>© 2025 EduTrack-CM - Système de Gestion Scolaire</p>
            <p>📞 Support : support@edutrack-cm.com</p>
        </div>
    </div>
</body>
</html>
```

#### 2. **Variables disponibles :**
- `{{ .Email }}` - Email de l'utilisateur
- `{{ .Name }}` - Nom complet 
- `{{ .ConfirmationURL }}` - Lien de confirmation
- `{{ .SiteURL }}` - URL du site
- `{{ .Token }}` - Token de confirmation

## 🎨 Configuration recommandée

### Subject (Sujet) :
```
🎓 EduTrack-CM : Confirmez votre compte de directeur d'établissement
```

### From (Expéditeur) :
```
EduTrack-CM <noreply@votre-domaine.com>
```

## 🔧 Étapes de configuration :

1. **Connexion au dashboard Supabase**
2. **Sélection du projet**
3. **Settings → Auth → Email Templates**  
4. **Modifier "Confirm signup"**
5. **Coller le template HTML personnalisé**
6. **Personnaliser le sujet**
7. **Tester avec un compte de test**
8. **Sauvegarder**

## 📱 Aperçu mobile-friendly

Le template est responsive et s'adapte aux mobiles pour une meilleure expérience utilisateur.

## ⚠️ Notes importantes :

- Toujours tester les emails avant la mise en production
- Vérifier la délivrabilité dans les dossiers spam
- Configurer SPF/DKIM pour améliorer la délivrabilité
- Utiliser un domaine personnalisé pour les emails (optionnel)