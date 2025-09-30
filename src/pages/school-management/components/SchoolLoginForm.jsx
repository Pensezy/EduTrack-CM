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
      // Utiliser le nouveau service d'authentification compatible Prisma
      const { loginDirector } = await import('../../../services/authService.js');
      
      const result = await loginDirector(formData.email, formData.password);

      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('✅ Connexion réussie:', {
        user: result.user.email,
        school: result.school.name,
        status: result.school.status
      });

      // Passer les données de l'école au composant parent
      onSuccess?.(result.school);
      
    } catch (error) {
      console.error('Erreur de connexion:', error.message);
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