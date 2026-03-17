// src/views/CommunityView.jsx
import React, { useState, useEffect } from 'react';

const CommunityView = ({ user }) => {
  // Gestion des onglets (leaderboard, add, requests)
  const [activeTab, setActiveTab] = useState('leaderboard');
  
  // États pour stocker les données (avec fausses données pour l'instant)
  const [leaderboard, setLeaderboard] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');

  // Simulation du chargement initial
  useEffect(() => {
    // ⚠️ Plus tard, on fera les vrais fetch() vers l'API d'Evan ici
    const fakeLeaderboard = [
      { id: 2, prenom: "Evan", totalKg: 15.2, isMe: false },
      { id: user?.id_user || 1, prenom: user ? user.prenom : "Moi", totalKg: 18.5, isMe: true },
      { id: 3, prenom: "Marie", totalKg: 22.1, isMe: false }
    ];
    
    const fakeRequests = [
      { id: 4, prenom: "Thomas", email: "thomas@mail.com" }
    ];

    setLeaderboard(fakeLeaderboard);
    setPendingRequests(fakeRequests);
  }, [user]);

  // Actions simulées
  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!searchEmail) return;
    alert(`Demande d'ami envoyée à ${searchEmail} ! (Simulation)`);
    setSearchEmail('');
  };

  const handleAcceptRequest = (id) => {
    alert(`Demande acceptée ! (Simulation)`);
    setPendingRequests(pendingRequests.filter(req => req.id !== id));
  };

  const handleDeclineRequest = (id) => {
    alert(`Demande refusée. (Simulation)`);
    setPendingRequests(pendingRequests.filter(req => req.id !== id));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mes Amis 🤝</h1>
        <p style={styles.subtitle}>Comparez vos performances écologiques avec votre entourage.</p>
      </div>

      {/* Menu des onglets */}
      <div style={styles.tabMenu}>
        <button 
          style={activeTab === 'leaderboard' ? styles.tabActive : styles.tab} 
          onClick={() => setActiveTab('leaderboard')}
        >
          <i className="fa-solid fa-trophy"></i> Classement
        </button>
        <button 
          style={activeTab === 'add' ? styles.tabActive : styles.tab} 
          onClick={() => setActiveTab('add')}
        >
          <i className="fa-solid fa-user-plus"></i> Ajouter un ami
        </button>
        <button 
          style={activeTab === 'requests' ? styles.tabActive : styles.tab} 
          onClick={() => setActiveTab('requests')}
        >
          <i className="fa-solid fa-bell"></i> Demandes 
          {pendingRequests.length > 0 && <span style={styles.badge}>{pendingRequests.length}</span>}
        </button>
      </div>

      {/* Contenu de l'onglet actif */}
      <div style={styles.contentCard}>
        
        {/* ONGLET 1 : CLASSEMENT */}
        {activeTab === 'leaderboard' && (
          <div>
            <h2 style={styles.sectionTitle}>Podium du mois</h2>
            {leaderboard.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Vous n'avez pas encore d'amis pour comparer.</p>
            ) : (
              leaderboard.map((person, index) => (
                <div key={person.id} style={{...styles.listItem, backgroundColor: person.isMe ? 'var(--bg-main)' : 'transparent', borderLeft: person.isMe ? '4px solid var(--primary)' : '4px solid transparent'}}>
                  <div style={styles.rankCircle}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div style={{ flex: 1, marginLeft: '15px' }}>
                    <strong>{person.prenom} {person.isMe && '(Vous)'}</strong>
                  </div>
                  <div style={styles.scoreBadge}>{person.totalKg} kg</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ONGLET 2 : AJOUTER */}
        {activeTab === 'add' && (
          <div>
            <h2 style={styles.sectionTitle}>Envoyer une invitation</h2>
            <form onSubmit={handleSendRequest} style={styles.form}>
              <input 
                type="email" 
                placeholder="Email de votre ami..." 
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                style={styles.input}
                required
              />
              <button type="submit" style={styles.submitBtn}>Envoyer</button>
            </form>
          </div>
        )}

        {/* ONGLET 3 : DEMANDES EN ATTENTE */}
        {activeTab === 'requests' && (
          <div>
            <h2 style={styles.sectionTitle}>Invitations reçues</h2>
            {pendingRequests.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aucune demande en attente.</p>
            ) : (
              pendingRequests.map(req => (
                <div key={req.id} style={styles.listItem}>
                  <div style={{ flex: 1 }}>
                    <strong>{req.prenom}</strong> ({req.email})
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleAcceptRequest(req.id)} style={styles.acceptBtn}><i className="fa-solid fa-check"></i></button>
                    <button onClick={() => handleDeclineRequest(req.id)} style={styles.declineBtn}><i className="fa-solid fa-xmark"></i></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// Styles internes
const styles = {
  container: { padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' },
  header: { marginBottom: '20px', textAlign: 'center' },
  title: { fontSize: '2rem', color: 'var(--text-main)', marginBottom: '5px' },
  subtitle: { color: 'var(--text-muted)' },
  tabMenu: { display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' },
  tab: { flex: 1, padding: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', borderBottom: '3px solid transparent', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', whiteSpace: 'nowrap' },
  tabActive: { flex: 1, padding: '12px', border: 'none', background: 'var(--bg-card)', color: 'var(--primary)', cursor: 'pointer', borderRadius: '8px', fontWeight: 'bold', borderBottom: '3px solid var(--primary)', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', whiteSpace: 'nowrap' },
  badge: { background: '#e74c3c', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' },
  contentCard: { background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)', minHeight: '300px' },
  sectionTitle: { marginTop: 0, color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' },
  listItem: { display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid var(--border-color)', transition: '0.2s' },
  rankCircle: { width: '40px', height: '40px', background: 'var(--bg-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
  scoreBadge: { background: 'var(--primary)', color: 'white', padding: '5px 10px', borderRadius: '8px', fontWeight: 'bold' },
  form: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' },
  submitBtn: { padding: '12px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  acceptBtn: { background: '#2ecc71', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' },
  declineBtn: { background: '#e74c3c', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' }
};

export default CommunityView;