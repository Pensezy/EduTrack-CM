// Supabase Edge Function pour permettre à un parent de changer le mot de passe de son enfant
// Endpoint: POST /update-student-password
// Body: { student_user_id: string, new_password: string, parent_user_id: string }

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
    const { student_user_id, new_password, parent_user_id } = await req.json()

    // Validation
    if (!student_user_id || !new_password) {
      return new Response(
        JSON.stringify({ error: 'student_user_id et new_password sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (new_password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Le mot de passe doit contenir au moins 8 caractères' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que le parent a bien la permission de modifier cet enfant
    // Chercher dans la table parent_students
    const { data: relationship, error: relationshipError } = await supabaseAdmin
      .from('parent_students')
      .select('*')
      .eq('student_id', student_user_id)
      .single()

    if (relationshipError || !relationship) {
      return new Response(
        JSON.stringify({ error: 'Relation parent-enfant non trouvée' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Optionnel: vérifier que le parent_user_id correspond au parent dans la relation
    // Pour plus de sécurité, vous pouvez ajouter cette vérification
    if (parent_user_id) {
      const { data: parentData } = await supabaseAdmin
        .from('parents')
        .select('id')
        .eq('user_id', parent_user_id)
        .single()

      if (!parentData || parentData.id !== relationship.parent_id) {
        return new Response(
          JSON.stringify({ error: 'Vous n\'avez pas la permission de modifier cet enfant' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Mettre à jour le mot de passe de l'élève via l'API admin
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      student_user_id,
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
        user_id: student_user_id
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
