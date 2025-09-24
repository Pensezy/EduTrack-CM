import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AchievementBadges = ({ achievements }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDetails, setShowDetails] = useState(null);

  const categories = [
    { value: 'all', label: 'Tous', icon: 'Award' },
    { value: 'academic', label: 'Académique', icon: 'BookOpen' },
    { value: 'behavior', label: 'Comportement', icon: 'Heart' },
    { value: 'participation', label: 'Participation', icon: 'Users' },
    { value: 'improvement', label: 'Progrès', icon: 'TrendingUp' }
  ];

  const getBadgeColor = (category, rarity) => {
    const baseColors = {
      academic: 'from-blue-400 to-blue-600',
      behavior: 'from-green-400 to-green-600',
      participation: 'from-purple-400 to-purple-600',
      improvement: 'from-orange-400 to-orange-600'
    };

    const rarityColors = {
      common: 'from-gray-400 to-gray-600',
      rare: 'from-yellow-400 to-yellow-600',
      epic: 'from-purple-500 to-purple-700',
      legendary: 'from-gradient-start to-gradient-end'
    };

    return rarityColors?.[rarity] || baseColors?.[category] || 'from-gray-400 to-gray-600';
  };

  const getBadgeIcon = (category) => {
    switch (category) {
      case 'academic':
        return 'BookOpen';
      case 'behavior':
        return 'Heart';
      case 'participation':
        return 'Users';
      case 'improvement':
        return 'TrendingUp';
      default:
        return 'Award';
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'Commun';
      case 'rare':
        return 'Rare';
      case 'epic':
        return 'Épique';
      case 'legendary':
        return 'Légendaire';
      default:
        return 'Standard';
    }
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements?.filter(achievement => achievement?.category === selectedCategory);

  const earnedAchievements = filteredAchievements?.filter(a => a?.earned);
  const availableAchievements = filteredAchievements?.filter(a => !a?.earned);

  return (
    <div className="bg-card rounded-lg shadow-card border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
              Badges & Réussites
            </h3>
            <p className="font-body font-body-normal text-sm text-muted-foreground">
              {earnedAchievements?.length} sur {filteredAchievements?.length} badges obtenus
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories?.map((category) => (
              <button
                key={category?.value}
                onClick={() => setSelectedCategory(category?.value)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-body font-body-normal transition-micro ${
                  selectedCategory === category?.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon name={category?.icon} size={14} />
                <span>{category?.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body font-body-semibold text-sm text-card-foreground">
              Progression
            </span>
            <span className="font-caption font-caption-normal text-xs text-muted-foreground">
              {Math.round((earnedAchievements?.length / filteredAchievements?.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${(earnedAchievements?.length / filteredAchievements?.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Earned Achievements */}
        {earnedAchievements?.length > 0 && (
          <div className="mb-8">
            <h4 className="font-body font-body-semibold text-card-foreground mb-4 flex items-center space-x-2">
              <Icon name="Trophy" size={16} className="text-accent" />
              <span>Badges Obtenus</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {earnedAchievements?.map((achievement) => (
                <div
                  key={achievement?.id}
                  className="relative group cursor-pointer"
                  onClick={() => setShowDetails(achievement)}
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getBadgeColor(achievement?.category, achievement?.rarity)} flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110`}>
                    <Icon name={getBadgeIcon(achievement?.category)} size={24} color="white" />
                  </div>
                  <div className="text-center mt-2">
                    <p className="font-caption font-caption-normal text-xs text-card-foreground line-clamp-2">
                      {achievement?.name}
                    </p>
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                      {new Date(achievement.earnedDate)?.toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {achievement?.rarity !== 'common' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                      <Icon name="Star" size={10} color="white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Achievements */}
        {availableAchievements?.length > 0 && (
          <div>
            <h4 className="font-body font-body-semibold text-card-foreground mb-4 flex items-center space-x-2">
              <Icon name="Target" size={16} className="text-muted-foreground" />
              <span>Badges Disponibles</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {availableAchievements?.map((achievement) => (
                <div
                  key={achievement?.id}
                  className="relative group cursor-pointer opacity-60 hover:opacity-80 transition-opacity"
                  onClick={() => setShowDetails(achievement)}
                >
                  <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-muted-foreground flex items-center justify-center">
                    <Icon name={getBadgeIcon(achievement?.category)} size={24} className="text-muted-foreground" />
                  </div>
                  <div className="text-center mt-2">
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground line-clamp-2">
                      {achievement?.name}
                    </p>
                    <p className="font-caption font-caption-normal text-xs text-muted-foreground">
                      {achievement?.progress}% complété
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievement Details Modal */}
        {showDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-modal p-4">
            <div className="bg-card rounded-lg shadow-modal max-w-md w-full border border-border">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-heading-semibold text-lg text-card-foreground">
                    Détails du Badge
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDetails(null)}
                  >
                    <Icon name="X" size={16} />
                  </Button>
                </div>

                <div className="text-center mb-6">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getBadgeColor(showDetails?.category, showDetails?.rarity)} flex items-center justify-center shadow-lg mx-auto mb-4 ${
                    !showDetails?.earned ? 'opacity-60 grayscale' : ''
                  }`}>
                    <Icon name={getBadgeIcon(showDetails?.category)} size={32} color="white" />
                  </div>
                  <h4 className="font-heading font-heading-semibold text-xl text-card-foreground mb-2">
                    {showDetails?.name}
                  </h4>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className={`text-xs font-caption font-caption-normal px-2 py-1 rounded-full ${
                      showDetails?.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                      showDetails?.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                      showDetails?.rarity === 'rare'? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getRarityLabel(showDetails?.rarity)}
                    </span>
                    <span className="text-xs font-caption font-caption-normal px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {categories?.find(c => c?.value === showDetails?.category)?.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-body font-body-semibold text-sm text-card-foreground mb-2">
                      Description
                    </h5>
                    <p className="font-body font-body-normal text-sm text-muted-foreground">
                      {showDetails?.description}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-body font-body-semibold text-sm text-card-foreground mb-2">
                      Critères
                    </h5>
                    <p className="font-body font-body-normal text-sm text-muted-foreground">
                      {showDetails?.criteria}
                    </p>
                  </div>

                  {showDetails?.earned ? (
                    <div className="p-3 bg-success/10 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Icon name="CheckCircle" size={16} className="text-success" />
                        <span className="font-body font-body-semibold text-sm text-success">
                          Badge obtenu le {new Date(showDetails.earnedDate)?.toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-body font-body-semibold text-sm text-card-foreground">
                          Progression
                        </span>
                        <span className="font-caption font-caption-normal text-xs text-muted-foreground">
                          {showDetails?.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${showDetails?.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementBadges;