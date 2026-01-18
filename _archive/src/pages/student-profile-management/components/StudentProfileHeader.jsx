import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StudentProfileHeader = ({ student, onPhotoUpdate, onEdit, isEditing }) => {
  const [photoUploadLoading, setPhotoUploadLoading] = useState(false);

  const handlePhotoUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      setPhotoUploadLoading(true);
      // Simulate photo upload
      setTimeout(() => {
        const photoUrl = URL.createObjectURL(file);
        onPhotoUpdate(photoUrl);
        setPhotoUploadLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
        {/* Student Photo */}
        <div className="flex-shrink-0 mb-4 lg:mb-0">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-primary/20">
              <Image
                src={student?.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'}
                alt={`Photo de ${student?.firstName} ${student?.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0">
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-micro">
                  {photoUploadLoading ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Camera" size={16} />
                  )}
                </div>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={photoUploadLoading}
              />
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
            <div>
              <h1 className="font-heading font-heading-bold text-2xl text-card-foreground mb-2">
                {student?.firstName} {student?.lastName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Icon name="Hash" size={16} />
                  <span>ID: {student?.studentId}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Calendar" size={16} />
                  <span>Né le {student?.dateOfBirth}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="GraduationCap" size={16} />
                  <span>Classe {student?.class}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button
                variant={isEditing ? "secondary" : "default"}
                onClick={onEdit}
                iconName={isEditing ? "X" : "Edit"}
                iconPosition="left"
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-caption font-caption-normal ${
              student?.status === 'active' ?'bg-success/10 text-success' :'bg-warning/10 text-warning'
            }`}>
              <Icon 
                name={student?.status === 'active' ? 'CheckCircle' : 'AlertCircle'} 
                size={12} 
                className="mr-1" 
              />
              {student?.status === 'active' ? 'Actif' : 'Inactif'}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-caption font-caption-normal bg-primary/10 text-primary">
              <Icon name="Users" size={12} className="mr-1" />
              {student?.section}
            </span>
            {student?.hasSpecialNeeds && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-caption font-caption-normal bg-accent/10 text-accent-foreground">
                <Icon name="Heart" size={12} className="mr-1" />
                Besoins spéciaux
              </span>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-heading font-heading-semibold text-lg text-card-foreground">
                {student?.attendance}%
              </div>
              <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                Présence
              </div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-heading font-heading-semibold text-lg text-card-foreground">
                {student?.averageGrade}/20
              </div>
              <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                Moyenne
              </div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-heading font-heading-semibold text-lg text-card-foreground">
                {student?.behaviorScore}
              </div>
              <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                Comportement
              </div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-heading font-heading-semibold text-lg text-card-foreground">
                {student?.parentMeetings}
              </div>
              <div className="font-caption font-caption-normal text-xs text-muted-foreground">
                Réunions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileHeader;