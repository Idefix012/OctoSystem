// src/views/widgets/MiniBadgeCard.jsx
import React from 'react';
import { calculateBadges } from '../../controllers/badgeEngine';
import { useNavigate } from 'react-router-dom';

/**
 * Composant MiniBadgeCard
 * Affiche un aperçu rapide (widget) de la progression de l'utilisateur dans le système de gamification.
 * Ce composant est conçu pour s'intégrer dans le tableau de bord principal.
 */
const MiniBadgeCard = ({ totalKg, rank, friendsCount }) => {
  // Initialisation du hook de navigation de React Router pour permettre la redirection au clic
  const navigate = useNavigate();
  
  // Appel du contrôleur métier pour récupérer la liste complète des badges et leur statut actuel
  // basé sur les statistiques fournies en props (totalKg, rank, friendsCount).
  const badges = calculateBadges(totalKg, rank, friendsCount);

  // Séparation logique : création de deux tableaux distincts pour séparer les badges débloqués des badges verrouillés
  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  // Extraction des données spécifiques pour l'affichage :
  // On récupère le dernier élément du tableau des badges débloqués pour afficher l'accomplissement le plus récent.
  const latestBadge = unlockedBadges[unlockedBadges.length - 1];
  // On récupère le premier élément du tableau des badges verrouillés pour afficher le prochain objectif à atteindre.
  const nextBadge = lockedBadges.length > 0 ? lockedBadges[0] : null;

  return (
    // Le conteneur principal capture l'événement onClick pour rediriger l'utilisateur vers la vue détaillée (/community)
    <div style={styles.card} onClick={() => navigate('/community')} title="Voir tous mes trophées">
      <div style={styles.header}>
        <h4 style={styles.title}>MES TROPHÉES</h4>
        <div style={styles.iconBox}>
          <i className="fa-solid fa-medal"></i>
        </div>
      </div>

      <div style={styles.content}>
        {/* Rendu conditionnel : s'affiche uniquement si l'utilisateur a débloqué au moins un badge */}
        {latestBadge && (
          <div style={styles.badgeRow}>
            <div style={{...styles.iconWrapper, background: latestBadge.color, color: 'white'}}>
              <i className={`fa-solid ${latestBadge.icon}`}></i>
            </div>
            <div style={styles.info}>
              <span style={styles.label}>Dernier débloqué</span>
              <span style={styles.name}>{latestBadge.name}</span>
            </div>
          </div>
        )}

        {/* Rendu conditionnel : s'affiche si un badge reste à débloquer, 
            sinon affiche un message de complétion totale (branche false du ternaire) */}
        {nextBadge ? (
          <div style={{...styles.badgeRow, opacity: 0.6, marginTop: '10px'}}>
            <div style={{...styles.iconWrapper, background: 'var(--border-color)', color: 'var(--text-muted)'}}>
              <i className={`fa-solid ${nextBadge.icon}`}></i>
            </div>
            <div style={styles.info}>
              <span style={styles.label}>Prochain objectif <i className="fa-solid fa-lock" style={{fontSize: '0.7rem'}}></i></span>
              <span style={styles.name}>{nextBadge.name}</span>
            </div>
          </div>
        ) : (
          <div style={{marginTop: '10px', fontSize: '0.85rem', color: '#2ecc71', fontWeight: 'bold'}}>
            <i className="fa-solid fa-check-double"></i> Tous les trophées obtenus !
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'transform 0.2s' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  title: { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', margin: 0 },
  iconBox: { width: '35px', height: '35px', borderRadius: '8px', background: 'rgba(52, 152, 219, 0.15)', color: '#3498db', display: 'grid', placeItems: 'center' },
  content: { display: 'flex', flexDirection: 'column' },
  badgeRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  iconWrapper: { width: '35px', height: '35px', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: '1rem' },
  info: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' },
  name: { fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }
};

export default MiniBadgeCard;