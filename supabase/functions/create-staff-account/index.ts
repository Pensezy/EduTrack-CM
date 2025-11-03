// Supabase Edge Function pour créer des comptes personnel sans email automatique
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { 
      email, 
      password, 
      fullName, 
      phone, 
      role, 
      schoolId, 
      createdByUserId,
      firstName,
      lastName
    } = await req.json()

    // Validation
    if (!email || !password || !role || !schoolId) {
      return new Response(
        JSON.stringify({ error: 'Données manquantes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Créer le compte sans email de confirmation
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: {
        full_name: fullName,
        phone,
        role
      }
    })

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Erreur création utilisateur')
    }

    const userId = authData.user.id

    // Créer l'entrée dans users
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        phone,
        role,
        current_school_id: schoolId,
        created_by_user_id: createdByUserId,
        is_active: true
      })

    if (userError) {
      throw new Error(`Erreur création users: ${userError.message}`)
    }

    // Créer l'entrée dans la table spécifique selon le rôle
    let roleTableError = null

    if (role === 'secretary') {
      const { error } = await supabaseAdmin
        .from('secretaries')
        .insert({
          user_id: userId,
          school_id: schoolId,
          first_name: firstName,
          last_name: lastName,
          hire_date: new Date().toISOString(),
          is_active: true
        })
      roleTableError = error
    } else if (role === 'teacher') {
      const { error } = await supabaseAdmin
        .from('teachers')
        .insert({
          user_id: userId,
          school_id: schoolId,
          first_name: firstName,
          last_name: lastName,
          hire_date: new Date().toISOString(),
          is_active: true
        })
      roleTableError = error
    } else if (role === 'student') {
      const { error } = await supabaseAdmin
        .from('students')
        .insert({
          user_id: userId,
          school_id: schoolId,
          first_name: firstName,
          last_name: lastName,
          enrollment_date: new Date().toISOString(),
          created_by_user_id: createdByUserId,
          is_active: true
        })
      roleTableError = error
    } else if (role === 'parent') {
      const { error } = await supabaseAdmin
        .from('parents')
        .insert({
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
          phone: phone || '',
          email
        })
      roleTableError = error
    }

    if (roleTableError) {
      throw new Error(`Erreur création table ${role}: ${roleTableError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: 'Compte créé avec succès'
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
        error: error.message || 'Erreur interne' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
