// Supabase Edge Function pour permettre à un directeur de changer le mot de passe d'un utilisateur
// Endpoint: POST /update-user-password
// Body: { user_id: string, new_password: string, requester_user_id: string }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Créer un client Supabase avec les credentials admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Parser le body
    const { user_id, new_password, requester_user_id } = await req.json()

    // Validation
    if (!user_id || !new_password || !requester_user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id, new_password et requester_user_id sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new_password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Le mot de passe doit contenir au moins 8 caractères' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier les permissions du demandeur
    const { data: requester, error: requesterError } = await supabaseAdmin
      .from('users')
      .select('id, role, current_school_id')
      .eq('id', requester_user_id)
      .single()

    if (requesterError || !requester) {
      return new Response(
        JSON.stringify({ error: 'Demandeur non trouvé' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Seuls les admins et directeurs peuvent modifier les mots de passe
    if (!['admin', 'principal'].includes(requester.role)) {
      return new Response(
        JSON.stringify({ error: 'Permission refusée. Seuls les administrateurs et directeurs peuvent modifier les mots de passe.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Récupérer l'utilisateur cible
    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from('users')
      .select('id, role, current_school_id, created_by_user_id')
      .eq('id', user_id)
      .single()

    if (targetError || !targetUser) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur cible non trouvé' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifications de sécurité pour les directeurs
    if (requester.role === 'principal') {
      // Un directeur ne peut modifier que les utilisateurs de son école
      if (targetUser.current_school_id !== requester.current_school_id) {
        return new Response(
          JSON.stringify({ error: 'Vous ne pouvez modifier que les utilisateurs de votre école' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Un directeur ne peut modifier que certains rôles
      const allowedRoles = ['teacher', 'secretary', 'parent', 'student']
      if (!allowedRoles.includes(targetUser.role)) {
        return new Response(
          JSON.stringify({ error: 'Vous ne pouvez pas modifier le mot de passe de cet utilisateur' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Mettre à jour le mot de passe via l'API admin
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { password: new_password }
    )

    if (updateError) {
      console.error('Erreur update password:', updateError)
      return new Response(
        JSON.stringify({ error: `Erreur lors de la mise à jour: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Succès
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mot de passe mis à jour avec succès',
        user_id: user_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erreur générale:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
