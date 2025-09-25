import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SchoolLoginForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      // Verify if user is a school director
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (schoolError) throw schoolError;

      if (!schoolData) {
        throw new Error('Compte direction non trouvé');
      }

      if (schoolData.status === 'pending') {
        throw new Error('Votre compte est en attente de validation');
      }

      if (schoolData.status === 'suspended') {
        throw new Error('Votre compte a été suspendu');
      }

      onSuccess?.(schoolData);
    } catch (error) {
      console.error('Login error:', error.message);
      setError(error.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <Input
        label="Mot de passe"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      {error && (
        <div className="bg-error/10 text-error p-3 rounded-lg flex items-center gap-2">
          <Icon name="AlertTriangle" size={16} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        loading={loading}
      >
        <Icon name="LogIn" size={16} className="mr-2" />
        Se connecter
      </Button>

      <div className="text-center">
        <a href="#reset-password" className="text-sm text-primary hover:underline">
          Mot de passe oublié ?
        </a>
      </div>
    </form>
  );
};

export default SchoolLoginForm;