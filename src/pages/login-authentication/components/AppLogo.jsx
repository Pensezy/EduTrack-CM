import React from 'react';
import Icon from '../../../components/AppIcon';


const AppLogo = ({ className = '' }) => {
  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Logo Image */}
      <img
        src="/assets/images/mon_logo.png"
        alt="Logo EduTrack CM"
        className="w-20 h-20 object-contain rounded-2xl shadow-lg"
      />
      {/* App Name */}
      <div className="text-center">
        <h1 className="font-heading font-heading-bold text-3xl text-primary mb-2">
          EduTrack CM
        </h1>
        <p className="font-body font-body-normal text-sm text-text-secondary">
          Plateforme de gestion éducative sécurisée
        </p>
      </div>
    </div>
  );
};

export default AppLogo;