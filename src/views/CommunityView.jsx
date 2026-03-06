// src/views/CommunityView.jsx
import React from 'react';

const CommunityView = () => {
  // Fausses données pour le classement
  const leaderboard = [
    { rank: 1, name: 'Théo Urvoy le GOAT', points: 1250, badge: '🥇', isMe: false },
    { rank: 2, name: 'Evan (Moi)', points: 1120, badge: '🥈', isMe: true }, // C'est toi !
    { rank: 3, name: 'Maxence Le Roy', points: 980, badge: '🥉', isMe: false },
    { rank: 4, name: 'Gurwan Thomas', points: 840, badge: '', isMe: false },
    { rank: 5, name: 'Adrien Lamoureux', points: 710, badge: '', isMe: false },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Espace Communauté 🌍</h1>
      <p style={styles.subtitle}>Comparez vos performances de tri avec les autres utilisateurs d'Octo'System.</p>

      {/* Bloc principal du classement */}
      <div className="leaderboard-container">
        <div className="leaderboard-header">
            <h3>Classement Général</h3>
            <span className="points-label">Points Eco</span>
        </div>

        <ul className="leaderboard-list">
          {leaderboard.map((user) => (
            <li key={user.rank} className={`leaderboard-item ${user.isMe ? 'highlight-me' : ''}`}>
              
              <div className="user-info">
                <span className="rank">{user.badge || `#${user.rank}`}</span>
                
                {/* Avatar généré avec la première lettre du nom */}
                <div className="mini-avatar">{user.name.charAt(0)}</div>
                
                <span className="name">{user.name}</span>
              </div>

              <span className="points">{user.points} pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' },
  title: { fontSize: '1.8rem', color: '#2C3E50', marginBottom: '5px' },
  subtitle: { color: '#888', marginBottom: '30px' }
};

export default CommunityView;