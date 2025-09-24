import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProfileCard = ({ student, onPhotoUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    // Simulate photo upload
    setTimeout(() => {
      const newPhotoUrl = URL.createObjectURL(file);
      onPhotoUpdate(newPhotoUrl);
      setUploadingPhoto(false);
    }, 2000);
  };

  return (
    <div className="bg-card rounded-lg shadow-card p-6 border border-border">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Profile Photo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-4 border-primary/20">
            <Image
              src={student?.photo}
              alt={`Photo de ${student?.name}`}
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full shadow-md hover:bg-primary/90"
            onClick={() => document.getElementById('photo-upload')?.click()}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <Icon name="Loader2" size={16} className="animate-spin" />
            ) : (
              <Icon name="Camera" size={16} />
            )}
          </Button>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        {/* Student Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="font-heading font-heading-bold text-2xl text-card-foreground mb-2">
            {student?.name}
          </h2>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="flex items-center justify-center sm:justify-start space-x-2">
              <Icon name="Hash" size={14} />
              <span>ID Étudiant: {student?.studentId}</span>
            </p>
            <p className="flex items-center justify-center sm:justify-start space-x-2">
              <Icon name="GraduationCap" size={14} />
              <span>Classe: {student?.class}</span>
            </p>
            <p className="flex items-center justify-center sm:justify-start space-x-2">
              <Icon name="Calendar" size={14} />
              <span>Année scolaire: {student?.academicYear}</span>
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-success/10 rounded-lg p-3">
            <div className="font-heading font-heading-bold text-lg text-success">
              {student?.stats?.averageGrade}
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Moyenne
            </div>
          </div>
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="font-heading font-heading-bold text-lg text-primary">
              {student?.stats?.attendanceRate}%
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Présence
            </div>
          </div>
          <div className="bg-accent/10 rounded-lg p-3">
            <div className="font-heading font-heading-bold text-lg text-accent-foreground">
              {student?.stats?.assignmentsDue}
            </div>
            <div className="font-caption font-caption-normal text-xs text-muted-foreground">
              Devoirs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;