import React from 'react';
import { 
  computeSubjectAverage, 
  computeOverallAverage, 
  computeRank, 
  getMention, 
  getMentionHonorifique,
  detectLanguageSystem,
  detectSchoolLevel
} from '../../../utils/grading';

const GradesSummaryPanel = ({ classData, students = [] }) => {
  const schoolType = classData?.school_type || 'secondaire';
  const lang = detectLanguageSystem(schoolType);
  const level = detectSchoolLevel(schoolType);
  const scale = (level === 'primaire' || level === 'maternelle') ? 10 : 20;

  // Calculer moyenne de chaque élève avec les nouvelles fonctions
  const studentsWithAvg = students.map(s => {
    const recent = s.recentGrades || [];
    
    // Utiliser computeSubjectAverage pour normaliser
    const avg = recent && recent.length > 0
      ? computeSubjectAverage(recent.map(g => ({
          grade: g.grade,
          max_grade: g.max_grade || scale,
          coefficient: g.coefficient || 1
        })), { schoolType, targetScale: scale })
      : 0;

    const mentionInfo = getMention(avg, schoolType);
    const honorMention = getMentionHonorifique(avg, null, schoolType);

    return { 
      ...s, 
      avg, 
      mention: mentionInfo.mention,
      code: mentionInfo.code || mentionInfo.grade || mentionInfo.letter,
      honorMention
    };
  });

  // Calculer les rangs
  const allAverages = studentsWithAvg.map(s => s.avg);
  const studentsWithRank = studentsWithAvg.map(s => {
    const rankInfo = computeRank(s.avg, allAverages);
    return { ...s, rank: rankInfo.rank, rankSuffix: rankInfo.suffix };
  }).sort((a, b) => a.rank - b.rank);

  const classAvg = studentsWithRank.length > 0
    ? (studentsWithRank.reduce((a, b) => a + b.avg, 0) / studentsWithRank.length).toFixed(2)
    : '0.00';

  const highest = studentsWithRank.length > 0 ? Math.max(...studentsWithRank.map(s => s.avg)) : 0;
  const lowest = studentsWithRank.length > 0 ? Math.min(...studentsWithRank.map(s => s.avg)) : 0;
  const passCount = studentsWithRank.filter(s => s.avg >= (scale / 2)).length;
  const failCount = studentsWithRank.length - passCount;

  const getMentionColor = (mention) => {
    if (!mention) return 'text-gray-500';
    const m = mention.toLowerCase();
    if (m.includes('très bien') || m.includes('excellent')) return 'text-green-600';
    if (m.includes('bien') || m.includes('very good') || m.includes('good')) return 'text-blue-600';
    if (m.includes('assez') || m.includes('credit') || m.includes('fair')) return 'text-yellow-600';
    if (m.includes('passable') || m.includes('pass')) return 'text-orange-500';
    return 'text-red-600';
  };

  const getHonorBadge = (honorMention) => {
    if (!honorMention) return null;
    const colors = {
      'Félicitations du Conseil': 'bg-yellow-400 text-yellow-900',
      'Encouragements': 'bg-blue-400 text-blue-900',
      "Tableau d'Honneur": 'bg-green-400 text-green-900',
      'Avertissement Travail': 'bg-red-400 text-red-900'
    };
    return (
      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${colors[honorMention] || 'bg-gray-200'}`}>
        {honorMention}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-border">
      {/* Header avec infos système */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-xl">Synthèse des Notes</h3>
          <p className="text-sm text-muted-foreground">
            {classData?.name} — {classData?.subject}
            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
              {lang === 'anglophone' ? 'Système Anglophone' : 'Système Francophone'} • Sur {scale}
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Moyenne de la classe</div>
          <div className="font-heading font-bold text-2xl">{classAvg}/{scale}</div>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="text-sm text-muted-foreground">Élèves</div>
          <div className="font-bold text-lg">{studentsWithRank.length}</div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-700">Admis (≥{scale/2})</div>
          <div className="font-bold text-lg text-green-700">{passCount}</div>
        </div>
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-sm text-red-700">Non admis</div>
          <div className="font-bold text-lg text-red-700">{failCount}</div>
        </div>
        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="text-sm text-muted-foreground">Meilleure</div>
          <div className="font-bold text-lg">{highest}/{scale}</div>
        </div>
        <div className="p-4 bg-surface rounded-lg border border-border">
          <div className="text-sm text-muted-foreground">Plus basse</div>
          <div className="font-bold text-lg">{lowest}/{scale}</div>
        </div>
      </div>

      {/* Tableau des élèves avec rang et mention */}
      <div>
        <h4 className="font-heading font-semibold mb-3">Classement des élèves</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3">Rang</th>
                <th className="text-left py-2 px-3">Élève</th>
                <th className="text-left py-2 px-3">Matricule</th>
                <th className="text-right py-2 px-3">Moyenne</th>
                <th className="text-left py-2 px-3">Mention</th>
              </tr>
            </thead>
            <tbody>
              {studentsWithRank.map(s => (
                <tr key={s.id} className="border-b border-border hover:bg-gray-50">
                  <td className="py-2 px-3 font-semibold">
                    {s.rank}<sup>{s.rankSuffix}</sup>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-medium">{s.name}</span>
                    {getHonorBadge(s.honorMention)}
                  </td>
                  <td className="py-2 px-3 text-muted-foreground">{s.matricule}</td>
                  <td className="py-2 px-3 text-right font-bold">{s.avg}/{scale}</td>
                  <td className={`py-2 px-3 font-semibold ${getMentionColor(s.mention)}`}>
                    {lang === 'anglophone' && s.code ? `${s.code} — ` : ''}{s.mention}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradesSummaryPanel;
