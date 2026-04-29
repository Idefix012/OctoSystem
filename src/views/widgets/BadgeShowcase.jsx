// src/views/widgets/BadgeShowcase.jsx
import React from 'react';
import { calculateBadges } from '../../controllers/badgeEngine';

const BadgeShowcase = ({ ownedBadges = [], totalKg = 0, rank = 0, friendsCount = 0, cityRank = 0, householdSize = 1, sensorCount = 0, lastThrowDate = null, streakDays = 0 }) => {
  
  // On passe toutes les variables au moteur
  const allBadges = calculateBadges(totalKg, rank, friendsCount, cityRank, householdSize, sensorCount, lastThrowDate, streakDays).map(badge => ({
    ...badge,
    unlocked: badge.isProgressive ? badge.unlocked : (ownedBadges.includes(badge.id) || badge.unlocked)
  }));

  const unlockedCount = allBadges.filter(b => b.unlocked).length;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          <i className="fa-solid fa-medal" style={{ color: '#f1c40f', marginRight: '8px' }}></i> 
          Mes Arbres de Compétences
        </h3>
        <span style={styles.counter}>{unlockedCount} / {allBadges.length} débloqués</span>
      </div>
      
      <div style={styles.grid}>
        {allBadges.map(badge => (
          <div 
            key={badge.id} 
            style={{
              ...styles.badgeItem,
              borderColor: badge.unlocked ? badge.color : 'var(--border-color)',
              background: badge.unlocked ? `${badge.color}15` : 'var(--bg-main)', 
              opacity: badge.unlocked ? 1 : 0.6
            }}
          >
            <div style={{
              ...styles.iconWrapper,
              background: badge.unlocked ? badge.color : 'var(--border-color)',
              color: badge.unlocked ? 'white' : 'var(--text-muted)'
            }}>
              <i className={`fa-solid ${badge.icon} ${badge.unlocked ? 'fa-beat-fade' : ''}`} style={badge.unlocked ? { '--fa-animation-duration': '3s' } : {}}></i>
            </div>
            
            <div style={styles.badgeInfo}>
              <h4 style={styles.badgeName}>
                {badge.name}
                {!badge.unlocked && <i className="fa-solid fa-lock" style={styles.lockIcon}></i>}
              </h4>
              
              {/* LA CORRECTION EST ICI : On utilise progressLabel et progressPercent */}
              {badge.isProgressive ? (
                <div style={styles.progressContainer}>
                  <div style={styles.progressHeader}>
                    <span style={{color: badge.unlocked ? badge.color : 'var(--text-muted)'}}>
                      {badge.level > 0 ? `Niveau ${badge.level}` : 'Verrouillé'}
                    </span>
                    <span>{badge.progressLabel}</span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div style={{
                      ...styles.progressBarFill, 
                      width: `${badge.progressPercent}%`,
                      backgroundColor: badge.isDanger ? '#e74c3c' : badge.color
                    }}></div>
                  </div>
                </div>
              ) : (
                <p style={styles.badgeDesc}>{badge.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' },
  title: { margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px' },
  counter: { background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: 'bold', padding: '4px 10px', borderRadius: '20px', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' },
  badgeItem: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', borderRadius: '12px', border: '1px solid', transition: 'all 0.3s ease' },
  iconWrapper: { width: '45px', height: '45px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '1.2rem', flexShrink: 0 },
  badgeInfo: { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  badgeName: { margin: 0, fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' },
  badgeDesc: { margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.3' },
  lockIcon: { fontSize: '0.7rem', color: 'var(--text-muted)' },
  
  progressContainer: { marginTop: '5px', width: '100%' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px', fontWeight: 'bold' },
  progressBarBg: { height: '8px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: '4px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s' }
};

export default BadgeShowcase;