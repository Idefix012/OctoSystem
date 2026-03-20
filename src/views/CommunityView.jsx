// src/views/CommunityView.jsx
import React, { useState, useEffect } from 'react';

const CommunityView = ({ user }) => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  
  const [blockedList, setBlockedList] = useState([]);
  const [isViewingBlocked, setIsViewingBlocked] = useState(false);

  const getNomDuMois = () => {
    const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return mois[new Date().getMonth()];
  };

  const maxWeight = leaderboard.length > 0 ? Math.max(...leaderboard.map(p => p.totalKg)) : 1;
  const safeMaxWeight = maxWeight > 0 ? maxWeight : 1;

  useEffect(() => {
    const fetchDonneesCommunaute = async () => {
      try {
        const token = localStorage.getItem('octo_token');
        if (!token) return;

        const repDemandes = await fetch(`http://192.168.1.143:5000/amis/demandes`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (repDemandes.ok) {
          const dataDemandes = await repDemandes.json();
          setPendingRequests(dataDemandes.demandes || []); 
        }

        const repListe = await fetch(`http://192.168.1.143:5000/amis`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (repListe.ok) {
          const dataListe = await repListe.json();
          setLeaderboard(dataListe || []);
        }
      } catch (err) {
        console.error("Erreur réseau Communauté :", err);
      }
    };

    fetchDonneesCommunaute();
  }, [user]);

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
      const response = await fetch(`http://192.168.1.143:5000/amis/demande`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
      alert("Impossible de joindre le serveur.");
    }
  };

  const handleReponse = async (friendCode, action) => {
    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/amis/gestion`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_code: friendCode, action: action })
      });
      if (response.ok) {
        setPendingRequests(pendingRequests.filter(req => req.friend_code !== friendCode));
        alert(action === 'accepter' ? "Nouvel ami ajouté à votre réseau !" : "Demande refusée.");
        if(action === 'accepter') window.location.reload();
      } else {
        const data = await response.json();
        alert(`Erreur : ${data.error}`);
      }
    } catch (err) {
      alert("Impossible de joindre le serveur.");
    }
  };

  const handleDeleteFriend = async (friendCode) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet ami de votre réseau ?")) return;
    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/amis/supprimer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_code: friendCode })
      });
      if (response.ok) {
        setLeaderboard(leaderboard.filter(person => person.friend_code !== friendCode));
        alert("Ami retiré avec succès.");
      }
    } catch (err) {}
  };

  const handleBlockFriend = async (friendCode) => {
    if (!window.confirm("Bloquer cet utilisateur ? Il disparaîtra de vos listes et ne pourra plus interagir avec vous.")) return;
    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/amis/bloquer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_code: friendCode })
      });
      if (response.ok) {
        setLeaderboard(leaderboard.filter(person => person.friend_code !== friendCode));
        setPendingRequests(pendingRequests.filter(req => req.friend_code !== friendCode));
        alert("Utilisateur bloqué avec succès.");
      }
    } catch (err) {
      console.error("Erreur lors du blocage :", err);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/amis/bloques`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBlockedList(data.bloques || []);
        setIsViewingBlocked(true);
      }
    } catch (err) {}
  };

  const handleUnblock = async (friendCode) => {
    if (!window.confirm("Voulez-vous débloquer cet utilisateur ?")) return;
    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/amis/debloquer`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_code: friendCode })
      });
      if (response.ok) {
        setBlockedList(blockedList.filter(person => person.friend_code !== friendCode));
        alert("Utilisateur débloqué.");
      }
    } catch (err) {}
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mes Amis 🤝</h1>
        <p style={styles.subtitle}>Comparez vos performances écologiques avec votre entourage.</p>
      </div>

      <div style={styles.tabMenu}>
        <button style={activeTab === 'leaderboard' ? styles.tabActive : styles.tab} onClick={() => {setActiveTab('leaderboard'); setIsViewingBlocked(false);}}>
          <i className="fa-solid fa-trophy"></i> Podium
        </button>
        <button style={activeTab === 'friends' ? styles.tabActive : styles.tab} onClick={() => {setActiveTab('friends'); setIsViewingBlocked(false);}}>
          <i className="fa-solid fa-user-group"></i> Mes Amis
        </button>
        <button style={activeTab === 'add' ? styles.tabActive : styles.tab} onClick={() => {setActiveTab('add'); setIsViewingBlocked(false);}}>
          <i className="fa-solid fa-user-plus"></i> Ajouter
        </button>
        <button style={activeTab === 'requests' ? styles.tabActive : styles.tab} onClick={() => {setActiveTab('requests'); setIsViewingBlocked(false);}}>
          <i className="fa-solid fa-bell"></i> Demandes 
          {pendingRequests.length > 0 && <span style={styles.badge}>{pendingRequests.length}</span>}
        </button>
      </div>

      <div style={styles.contentCard}>
        
        {/* ONGLET 1 : CLASSEMENT GAMIFIÉ */}
        {activeTab === 'leaderboard' && (
          <div>
            <h2 style={styles.sectionTitle}>Podium de {getNomDuMois()}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Celui qui a la barre la plus courte est le plus écologique ! 🌱
            </p>
            {leaderboard.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Chargement des données...</p>
            ) : (
              leaderboard.map((person, index) => {
                const percent = (person.totalKg / safeMaxWeight) * 100;
                let barColor = '#2ecc71'; 
                if (index === leaderboard.length - 1 && leaderboard.length > 1 && person.totalKg > 0) barColor = '#e74c3c'; 
                else if (index > 0 && person.totalKg > 0) barColor = '#f39c12'; 

                return (
                  <div key={person.id_user} style={{...styles.listItem, flexDirection: 'column', alignItems: 'stretch', backgroundColor: person.isMe ? 'var(--bg-main)' : 'transparent', borderLeft: person.isMe ? '4px solid var(--primary)' : '4px solid transparent'}}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '10px' }}>
                      <div style={styles.rankCircle}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                      <div style={{ flex: 1, marginLeft: '15px' }}>
                        <strong>{person.prenom} {person.nom} {person.isMe && '(Vous)'}</strong>
                      </div>
                      <div style={{...styles.scoreBadge, backgroundColor: barColor}}>{person.totalKg} kg</div>
                    </div>
                    <div style={styles.barTrack}>
                      <div style={{...styles.barFill, width: `${percent}%`, backgroundColor: barColor}}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ONGLET 1.5 : LISTE DES AMIS / BLOQUÉS */}
        {activeTab === 'friends' && (
          <div>
            {!isViewingBlocked ? (
              <>
                <h2 style={styles.sectionTitle}>Ma liste d'amis</h2>
                {leaderboard.filter(p => p.friend_code !== user?.friend_code).length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Vous n'avez pas encore d'amis dans votre réseau.</p>
                ) : (
                  leaderboard.filter(p => p.friend_code !== user?.friend_code).map(person => (
                    <div key={person.id_user} style={styles.listItem}>
                      <div style={styles.rankCircle}><i className="fa-solid fa-user"></i></div>
                      <div style={{ flex: 1, marginLeft: '15px' }}>
                        <strong>{person.prenom} {person.nom}</strong> 
                        <div style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Code : {person.friend_code}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleBlockFriend(person.friend_code)} style={styles.blockBtn} title="Bloquer cet utilisateur">
                          <i className="fa-solid fa-shield-halved"></i>
                        </button>
                        <button onClick={() => handleDeleteFriend(person.friend_code)} style={styles.deleteBtn} title="Supprimer cet ami">
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))
                )}
                
                <button onClick={fetchBlockedUsers} style={styles.discreetLink}>
                  <i className="fa-solid fa-lock"></i> Gérer les utilisateurs bloqués
                </button>
              </>
            ) : (
              <>
                <h2 style={{...styles.sectionTitle, color: '#e74c3c'}}>Utilisateurs bloqués</h2>
                <button onClick={() => setIsViewingBlocked(false)} style={styles.backBtn}>
                  <i className="fa-solid fa-arrow-left"></i> Retour aux amis
                </button>
                
                {blockedList.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>Aucun utilisateur bloqué.</p>
                ) : (
                  blockedList.map(person => (
                    <div key={person.friend_code} style={{...styles.listItem, opacity: 0.7}}>
                      <div style={{ flex: 1 }}>
                        <strong>{person.prenom} {person.nom}</strong> 
                        <div style={{fontSize: '0.85rem'}}>Code : {person.friend_code}</div>
                      </div>
                      <button onClick={() => handleUnblock(person.friend_code)} style={styles.unblockBtn}>
                        Débloquer
                      </button>
                    </div>
                  ))
                )}
              </>
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
            <p style={{ marginTop: '25px', marginBottom: '10px', color: 'var(--text-main)', fontWeight: 'bold' }}>Ajouter un foyer :</p>
            <form onSubmit={handleSendRequest} style={styles.form}>
              <input type="text" placeholder="Ex: ABC-1234" value={searchCode} onChange={(e) => setSearchCode(e.target.value.toUpperCase())} style={styles.input} maxLength={10} required />
              <button type="submit" style={styles.submitBtn}><i className="fa-solid fa-paper-plane"></i> Envoyer</button>
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
                    <button onClick={() => handleReponse(req.friend_code, 'accepter')} style={styles.acceptBtn} title="Accepter">
                      <i className="fa-solid fa-check"></i>
                    </button>
                    <button onClick={() => handleReponse(req.friend_code, 'refuser')} style={styles.declineBtn} title="Refuser">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                    <button onClick={() => handleBlockFriend(req.friend_code)} style={styles.blockBtn} title="Bloquer directement">
                      <i className="fa-solid fa-shield-halved"></i>
                    </button>
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
  declineBtn: { background: '#e74c3c', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer' },
  deleteBtn: { background: '#e74c3c', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  blockBtn: { background: '#34495e', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  barTrack: { width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '4px', transition: 'width 1s ease-in-out, background-color 0.5s' },
  discreetLink: { background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem', marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' },
  backBtn: { background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' },
  unblockBtn: { background: '#2ecc71', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }
};

export default CommunityView;