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
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Profile Photo */}
        <div className="relative group">
          <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-blue-200 shadow-lg group-hover:shadow-xl transition-shadow">
            <Image
              src={student?.photo}
              alt={`Photo de ${student?.name}`}
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-700 hover:scale-110 transition-all"
            onClick={() => document.getElementById('photo-upload')?.click()}
            disabled={uploadingPhoto}
          >
            {uploadingPhoto ? (
              <Icon name="Loader2" size={18} className="animate-spin" />
            ) : (
              <Icon name="Camera" size={18} />
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
          <h2 className="font-heading font-heading-bold text-2xl text-gray-900 mb-3">
            {student?.name}
          </h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="Hash" size={14} className="text-blue-600" />
              </div>
              <span className="font-medium">ID Étudiant: <span className="text-gray-900 font-semibold">{student?.studentId}</span></span>
            </p>
            <p className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={14} className="text-green-600" />
              </div>
              <span className="font-medium">Classe: <span className="text-gray-900 font-semibold">{student?.class}</span></span>
            </p>
            <p className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600">
              <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="Calendar" size={14} className="text-purple-600" />
              </div>
              <span className="font-medium">Année: <span className="text-gray-900 font-semibold">{student?.academicYear}</span></span>
            </p>
          </div>
        </div>

        {/* Quick Stats - Modernisées */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md">
              <Icon name="Award" size={20} className="text-white" />
            </div>
            <div className="font-heading font-heading-bold text-xl text-green-900">
              {student?.stats?.averageGrade}
            </div>
            <div className="font-caption font-caption-normal text-xs text-green-700 font-medium">
              Moyenne
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md">
              <Icon name="CalendarCheck" size={20} className="text-white" />
            </div>
            <div className="font-heading font-heading-bold text-xl text-blue-900">
              {student?.stats?.attendanceRate}%
            </div>
            <div className="font-caption font-caption-normal text-xs text-blue-700 font-medium">
              Présence
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md">
              <Icon name="BookOpen" size={20} className="text-white" />
            </div>
            <div className="font-heading font-heading-bold text-xl text-orange-900">
              {student?.stats?.assignmentsDue}
            </div>
            <div className="font-caption font-caption-normal text-xs text-orange-700 font-medium">
              Devoirs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;