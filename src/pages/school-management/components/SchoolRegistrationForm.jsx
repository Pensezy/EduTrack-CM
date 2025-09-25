import React, { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SchoolRegistrationForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: '',
    directorName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    schoolType: '',
    country: '',
    city: ''
  });
  const [error, setError] = useState(null);

  // Données des pays et villes
  const countryData = {
    'cameroon': {
      label: 'Cameroun',
      cities: [
        { value: 'yaounde', label: 'Yaoundé' },
        { value: 'douala', label: 'Douala' },
        { value: 'bamenda', label: 'Bamenda' },
        { value: 'bafoussam', label: 'Bafoussam' },
        { value: 'garoua', label: 'Garoua' },
        { value: 'maroua', label: 'Maroua' },
        { value: 'ngaoundere', label: 'Ngaoundéré' },
        { value: 'bertoua', label: 'Bertoua' },
        { value: 'ebolowa', label: 'Ebolowa' },
        { value: 'kumba', label: 'Kumba' }
      ]
    },
    'france': {
      label: 'France',
      cities: [
        { value: 'paris', label: 'Paris' },
        { value: 'marseille', label: 'Marseille' },
        { value: 'lyon', label: 'Lyon' },
        { value: 'toulouse', label: 'Toulouse' },
        { value: 'nice', label: 'Nice' },
        { value: 'nantes', label: 'Nantes' },
        { value: 'strasbourg', label: 'Strasbourg' },
        { value: 'montpellier', label: 'Montpellier' },
        { value: 'bordeaux', label: 'Bordeaux' },
        { value: 'lille', label: 'Lille' }
      ]
    },
    'senegal': {
      label: 'Sénégal',
      cities: [
        { value: 'dakar', label: 'Dakar' },
        { value: 'thies', label: 'Thiès' },
        { value: 'kaolack', label: 'Kaolack' },
        { value: 'ziguinchor', label: 'Ziguinchor' },
        { value: 'saint_louis', label: 'Saint-Louis' },
        { value: 'tambacounda', label: 'Tambacounda' },
        { value: 'mbour', label: 'Mbour' },
        { value: 'diourbel', label: 'Diourbel' }
      ]
    }
  };

  const countryOptions = Object.keys(countryData).map(key => ({
    value: key,
    label: countryData[key].label
  }));

  const getCityOptions = () => {
    if (!formData.country || !countryData[formData.country]) {
      return [];
    }
    return countryData[formData.country].cities;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.schoolName || !formData.directorName || !formData.email || 
        !formData.password || !formData.phone || !formData.address || 
        !formData.schoolType || !formData.country || !formData.city) {
      setError('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'school_director',
          }
        }
      });

      if (authError) throw authError;

      // Create school profile
      const { error: profileError } = await supabase
        .from('schools')
        .insert([
          {
            name: formData.schoolName,
            director_name: formData.directorName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            type: formData.schoolType,
            country: formData.country,
            city: formData.city,
            user_id: authData.user.id,
            status: 'pending'
          }
        ]);

      if (profileError) throw profileError;

      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error.message);
      setError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nom de l'établissement"
          name="schoolName"
          value={formData.schoolName}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Nom du directeur"
          name="directorName"
          value={formData.directorName}
          onChange={handleChange}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Téléphone"
          type="tel"
          name="phone"
          value={formData.phone}
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

        <Input
          label="Confirmer le mot de passe"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <Select
          label="Type d'établissement"
          name="schoolType"
          value={formData.schoolType}
          onChange={(value) => setFormData(prev => ({ ...prev, schoolType: value }))}
          placeholder="Sélectionner un type"
          required
          options={[
            { value: 'primary', label: 'École Primaire' },
            { value: 'secondary', label: 'Établissement Secondaire' },
            { value: 'college', label: 'Collège' },
            { value: 'high_school', label: 'Lycée' },
            { value: 'institut', label: 'Institut' },
            { value: 'university', label: 'Université' }
          ]}
        />

        <Select
          label="Pays"
          name="country"
          value={formData.country}
          onChange={(value) => setFormData(prev => ({ ...prev, country: value, city: '' }))}
          placeholder="Sélectionner un pays"
          required
          options={countryOptions}
        />

        <Select
          label="Ville"
          name="city"
          value={formData.city}
          onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
          placeholder={formData.country ? "Sélectionner une ville" : "Sélectionnez d'abord un pays"}
          disabled={!formData.country}
          required
          options={getCityOptions()}
        />

        <div className="md:col-span-2">
          <Input
            label="Adresse complète"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
      </div>

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
        <Icon name="School" size={16} className="mr-2" />
        Inscrire l'établissement
      </Button>
    </form>
  );
};

export default SchoolRegistrationForm;