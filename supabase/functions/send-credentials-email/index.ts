// Supabase Edge Function pour envoyer les identifiants par email
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface RequestBody {
  email: string
  fullName: string
  password: string
  role: string
  schoolName: string
}

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, fullName, password, role, schoolName }: RequestBody = await req.json()

    // Validation des données
    if (!email || !fullName || !password || !role || !schoolName) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Mapper les rôles en français
    const roleLabels: { [key: string]: string } = {
      'secretary': 'Secrétaire',
      'teacher': 'Enseignant',
      'student': 'Élève',
      'parent': 'Parent',
      'principal': 'Directeur',
      'admin': 'Administrateur'
    }

    const roleLabel = roleLabels[role] || role

    // URL de connexion selon le rôle
    const origin = req.headers.get('origin') || 'https://your-app.com';
    const loginUrl = `${origin}/staff-login`

    // Template HTML de l'email
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vos identifiants EduTrack-CM</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                                🎓 Bienvenue sur EduTrack-CM
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; font-size: 16px; color: #333; line-height: 1.6;">
                                Bonjour <strong>${fullName}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px; font-size: 16px; color: #333; line-height: 1.6;">
                                Votre compte <strong>${roleLabel}</strong> a été créé avec succès pour <strong>${schoolName}</strong>.
                            </p>
                            
                            <p style="margin: 0 0 30px; font-size: 16px; color: #333; line-height: 1.6;">
                                Voici vos identifiants de connexion :
                            </p>
                            
                            <!-- Credentials Box -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f9fa; border-radius: 8px; border: 2px solid #e9ecef; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <p style="margin: 0 0 15px; font-size: 14px; color: #6c757d; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                            📧 Email
                                        </p>
                                        <p style="margin: 0 0 25px; font-size: 18px; color: #212529; font-weight: 500; word-break: break-all;">
                                            ${email}
                                        </p>
                                        
                                        <p style="margin: 0 0 15px; font-size: 14px; color: #6c757d; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                            🔑 Mot de passe
                                        </p>
                                        <p style="margin: 0; font-size: 18px; color: #212529; font-weight: 500; background-color: #ffffff; padding: 15px; border-radius: 6px; border: 1px solid #dee2e6; font-family: 'Courier New', monospace;">
                                            ${password}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                                <tr>
                                    <td align="center">
                                        <a href="${loginUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                            🚀 Se connecter maintenant
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Notice -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 6px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px; font-size: 14px; color: #856404; font-weight: 600;">
                                            ⚠️ Important - Sécurité
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                                            Pour votre sécurité, nous vous recommandons de <strong>changer votre mot de passe</strong> lors de votre première connexion. 
                                            Vous pouvez le faire depuis votre profil après vous être connecté.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 10px; font-size: 14px; color: #666; line-height: 1.6;">
                                Si vous rencontrez des difficultés pour vous connecter, contactez votre administrateur.
                            </p>
                            
                            <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                                Cordialement,<br>
                                <strong>L'équipe EduTrack-CM</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px; font-size: 12px; color: #6c757d;">
                                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                © ${new Date().getFullYear()} EduTrack-CM. Tous droits réservés.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `

    // Envoyer l'email avec Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'EduTrack-CM <onboarding@resend.dev>',
        to: [email],
        subject: `🎓 Vos identifiants EduTrack-CM - ${schoolName}`,
        html: htmlContent,
      })
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Erreur Resend:', error)
      throw new Error(`Erreur lors de l'envoi de l'email: ${error}`)
    }

    const data = await res.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email envoyé avec succès',
        emailId: data.id 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
