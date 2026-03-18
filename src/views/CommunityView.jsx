// src/views/CommunityView.jsx
import React, { useState, useEffect } from 'react';

const CommunityView = ({ user }) => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchCode, setSearchCode] = useState('');

  // ==========================================
  // RÉCUPÉRATION DES DEMANDES (GET - pluriel)
  // ==========================================
  useEffect(() => {
    // Faux classement en attendant la route d'Evan
    const fakeLeaderboard = [
      { id: 2, prenom: "Evan", totalKg: 15.2, isMe: false },
      { id: user?.id_user || 1, prenom: user ? user.prenom : "Moi", totalKg: 18.5, isMe: true },
      { id: 3, prenom: "Alice", totalKg: 22.1, isMe: false }
    ];
    setLeaderboard(fakeLeaderboard);

    const fetchDemandes = async () => {
      try {
        const token = localStorage.getItem('octo_token');
        if (!token) return;

        // On interroge la route GET en PLURIEL
        const response = await fetch(`http://192.168.1.143:5000/amis/demandes`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          
          // CORRECTION ICI : On cible "data.demandes" (le tableau) au lieu de "data" (l'objet complet)
          // On rajoute "|| []" par sécurité au cas où l'API renvoie vide
          setPendingRequests(data.demandes || []); 
        }
      } catch (err) {
        console.error("Erreur récupération des demandes :", err);
      }
    };

    fetchDemandes();
  }, [user]);

  // ==========================================
  // ENVOYER UNE DEMANDE (POST - singulier)
  // ==========================================
  const handleCopyCode = () => {
    const code = user?.friend_code || "XXXX-XXXX";
    navigator.clipboard.writeText(code);
    alert(`Code ${code} copié dans le presse-papier !`);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!searchCode) return;

    const codeAmiFormate = searchCode.toUpperCase();

    if (codeAmiFormate === user?.friend_code) {
      alert("Vous ne pouvez pas vous ajouter vous-même !");
      setSearchCode('');
      return;
    }

    try {
      const token = localStorage.getItem('octo_token');
      if (!token) return;

      // On interroge la route POST en SINGULIER
      const response = await fetch(`http://192.168.1.143:5000/amis/demande`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friend_code: codeAmiFormate })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Demande d'ami envoyée avec succès !");
        setSearchCode(''); 
      } else {
        alert(`Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      alert("Impossible de joindre le serveur.");
    }
  };

  // ==========================================
  // ACCEPTER / REFUSER UNE DEMANDE (POST - gestion)
  // ==========================================
  const handleReponse = async (friendCode, action) => {
    try {
      const token = localStorage.getItem('octo_token');
      if (!token) return;

      // Nouvelle route "gestion" d'Evan (POST)
      const response = await fetch(`http://192.168.1.143:5000/amis/gestion`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friend_code: friendCode, action: action })
      });

      if (response.ok) {
        // Mise à jour de l'affichage local si succès
        setPendingRequests(pendingRequests.filter(req => req.friend_code !== friendCode));
        alert(action === 'accepter' ? "Nouvel ami ajouté à votre réseau !" : "Demande refusée.");
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      alert("Impossible de joindre le serveur.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mes Amis 🤝</h1>
        <p style={styles.subtitle}>Comparez vos performances écologiques avec votre entourage.</p>
      </div>

      <div style={styles.tabMenu}>
        <button style={activeTab === 'leaderboard' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('leaderboard')}>
          <i className="fa-solid fa-trophy"></i> Classement
        </button>
        <button style={activeTab === 'add' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('add')}>
          <i className="fa-solid fa-user-plus"></i> Ajouter un ami
        </button>
        <button style={activeTab === 'requests' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('requests')}>
          <i className="fa-solid fa-bell"></i> Demandes 
          {pendingRequests.length > 0 && <span style={styles.badge}>{pendingRequests.length}</span>}
        </button>
      </div>

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

        {/* ONGLET 2 : AJOUTER VIA CODE AMI */}
        {activeTab === 'add' && (
          <div>
            <h2 style={styles.sectionTitle}>Réseau Éco-Citoyen</h2>
            
            <div style={styles.myCodeBox}>
              <p style={styles.myCodeLabel}>Votre Code Ami à partager :</p>
              <div style={styles.codeDisplayWrapper}>
                <span style={styles.myCodeValue}>{user?.friend_code || "XXXX-XXXX"}</span>
                <button onClick={handleCopyCode} style={styles.copyBtn} title="Copier le code">
                  <i className="fa-regular fa-copy"></i> Copier
                </button>
              </div>
            </div>

            <p style={{ marginTop: '25px', marginBottom: '10px', color: 'var(--text-main)', fontWeight: 'bold' }}>
              Ajouter un foyer :
            </p>
            <form onSubmit={handleSendRequest} style={styles.form}>
              <input 
                type="text" 
                placeholder="Ex: ABC-1234" 
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                style={styles.input}
                maxLength={10}
                required
              />
              <button type="submit" style={styles.submitBtn}>
                <i className="fa-solid fa-paper-plane"></i> Envoyer
              </button>
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
                <div key={req.friend_code} style={styles.listItem}>
                  <div style={{ flex: 1 }}>
                    <strong>{req.prenom} {req.nom}</strong> <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>({req.friend_code})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleReponse(req.friend_code, 'accepter')} style={styles.acceptBtn}><i className="fa-solid fa-check"></i></button>
                    <button onClick={() => handleReponse(req.friend_code, 'refuser')} style={styles.declineBtn}><i className="fa-solid fa-xmark"></i></button>
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
  myCodeBox: { background: 'rgba(46, 204, 113, 0.1)', padding: '20px', borderRadius: '12px', border: '1px dashed var(--primary)', textAlign: 'center' },
  myCodeLabel: { margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' },
  codeDisplayWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' },
  myCodeValue: { fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '2px', fontFamily: 'monospace' },
  copyBtn: { background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '8px' },
  form: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '1.1rem', letterSpacing: '1px', textTransform: 'uppercase' },
  submitBtn: { padding: '12px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' },
  acceptBtn: { background: '#2ecc71', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' },
  declineBtn: { background: '#e74c3c', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' }
};

export default CommunityView;