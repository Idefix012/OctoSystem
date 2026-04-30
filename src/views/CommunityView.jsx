// src/views/CommunityView.jsx
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import BadgeShowcase from './widgets/BadgeShowcase';
import { calculateBadges } from '../controllers/badgeEngine';

const CommunityView = ({ user }) => {
  const [activeTab, setActiveTab] = useState('leaderboard');
  
  // États pour le classement
  const [leaderboardTab, setLeaderboardTab] = useState('friends');
  const [cityLeaderboard, setCityLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState('month');
  const [isLoadingCity, setIsLoadingCity] = useState(false);

  // États pour le réseau social
  const [leaderboard, setLeaderboard] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchCode, setSearchCode] = useState('');
  
  const [blockedList, setBlockedList] = useState([]);
  const [isViewingBlocked, setIsViewingBlocked] = useState(false);

  const [ownedBadges, setOwnedBadges] = useState([]);
  
  // NOUVEAU : État pour la flamme (Streak)
  const [myStreak, setMyStreak] = useState(0);
  const [mySensorCount, setMySensorCount] = useState(0);
  const [myLastThrowDate, setMyLastThrowDate] = useState(null);

  const getNomDuMois = () => {
    const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    return mois[new Date().getMonth()];
  };

  const maxWeight = leaderboard.length > 0 ? Math.max(...leaderboard.map(p => p.totalKg)) : 1;
  const safeMaxWeight = maxWeight > 0 ? maxWeight : 1;

  // --- CALCUL DES STATS DU JOUEUR ---
  const myProfile = leaderboard.find(p => p.isMe);
  const myTotalKg = myProfile ? myProfile.totalKg : 0;
  const myRank = myProfile ? leaderboard.findIndex(p => p.isMe) + 1 : 0;
  const myFriendsCount = leaderboard.length > 0 ? leaderboard.length - 1 : 0;

  const myCityProfile = cityLeaderboard.find(p => p.isMe);
  const myCityRank = myCityProfile ? myCityProfile.rank : 0;

  const myHouseholdSize = user?.household_size || 1;

  // 1. CHARGEMENT INITIAL ET ÉCOUTE WEBSOCKET
  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const token = localStorage.getItem('octo_token');
        if (!token) return;

        const repRequests = await fetch(`http://192.168.1.143:5000/friends/requests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (repRequests.ok) {
          const dataRequests = await repRequests.json();
          setPendingRequests(dataRequests.requests || []); 
        }

        const repLeaderboard = await fetch(`http://192.168.1.143:5000/friends`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (repLeaderboard.ok) {
          const dataLeaderboard = await repLeaderboard.json();
          setLeaderboard(dataLeaderboard || []);
        }

        // Récupération de la Flamme (Streak)
        const repStreak = await fetch(`http://192.168.1.143:5000/user/streak`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (repStreak.ok) {
          const dataStreak = await repStreak.json();
          setMyStreak(dataStreak.streak || 0);
          setMySensorCount(dataStreak.sensor_count || 0);
          setMyLastThrowDate(dataStreak.last_throw_date || null); // <-- LIGNE À AJOUTER
        }

      } catch (err) {
        console.error("Erreur réseau Communauté :", err);
      }
    };

    fetchCommunityData();

    const socket = io('http://192.168.1.143:5000');
    socket.on('new_sensor_data', () => {
      console.log("🔔 WebSocket : Une poubelle a été mise à jour ! Actualisation...");
      fetchCommunityData();
    });

    return () => {
      socket.disconnect();
    };

  }, [user]);

  // 1.bis. FETCH DYNAMIQUE POUR LE CLASSEMENT DE LA VILLE
  useEffect(() => {
    const fetchCityLeaderboard = async () => {
      // CORRECTION : On a supprimé le "if (leaderboardTab !== 'city') return;"
      setIsLoadingCity(true);
      try {
        const token = localStorage.getItem('octo_token');
        const response = await fetch(`http://192.168.1.143:5000/city/leaderboard?period=${timeframe}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setCityLeaderboard(data.leaderboard || []);
        }
      } catch (err) {
        console.error("Erreur récupération classement ville :", err);
      } finally {
        setIsLoadingCity(false);
      }
    };

    fetchCityLeaderboard();
  }, [timeframe]); // CORRECTION : On a aussi retiré 'leaderboardTab' de ce tableau à la fin

  // 2. SYNCHRONISATION INTELLIGENTE DES BADGES
  useEffect(() => {
    const syncBadges = async () => {
      const token = localStorage.getItem('octo_token');
      if (!token) return;

      try {
        const rep = await fetch(`http://192.168.1.143:5000/badges/owned`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let dbBadges = [];
        if (rep.ok) {
          const data = await rep.json();
          dbBadges = data.owned_badges.map(b => b.label); 
        }

        // Appel du moteur avec TOUTES les nouvelles variables (incluant myStreak)
        const badgesMerites = calculateBadges(myTotalKg, myRank, myFriendsCount, myCityRank, myHouseholdSize, mySensorCount, myLastThrowDate, myStreak);
        let activeBadgeIds = [...dbBadges]; 
        
        for (const badge of badgesMerites) {
          if (badge.isPermanent && badge.unlocked && !dbBadges.includes(badge.id)) {
            const unlockRep = await fetch(`http://192.168.1.143:5000/badges/unlock`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ label: badge.id })
            });
            if (unlockRep.ok) {
              activeBadgeIds.push(badge.id);
              toast.success(`🏆 Nouveau trophée permanent : ${badge.name} !`);
            }
          } 
          else if (!badge.isPermanent && badge.unlocked) {
            activeBadgeIds.push(badge.id);
          }
        }
        
        setOwnedBadges(activeBadgeIds);

      } catch (err) {
        console.error("Erreur synchro badges:", err);
      }
    };

    if (leaderboard.length > 0) {
      syncBadges();
    }
  }, [leaderboard, myTotalKg, myRank, myFriendsCount, myCityRank, myHouseholdSize, mySensorCount, myLastThrowDate, myStreak]);

  const handleCopyCode = () => {
    const code = user?.friend_code || "XXXX-XXXX";
    navigator.clipboard.writeText(code);
    toast.info(`Code ami ${code} copié dans le presse-papier !`);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!searchCode) return;
    const formattedCode = searchCode.toUpperCase();
    if (formattedCode === user?.friend_code) {
      toast.warning("Vous ne pouvez pas vous ajouter vous-même !");
      setSearchCode('');
      return;
    }

    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/friends/request`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_code: formattedCode })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Demande d'ami envoyée avec succès !");
        setSearchCode(''); 
      } else {
        toast.error(`Erreur : ${data.error}`);
      }
    } catch (err) {
      toast.error("Impossible de joindre le serveur.");
    }
  };

  const handleManageRequest = async (friendCode, action) => {
    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/friends/manage`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_code: friendCode, action: action })
      });
      if (response.ok) {
        setPendingRequests(pendingRequests.filter(req => req.friend_code !== friendCode));
        if (action === 'accepter') {
            toast.success("Nouvel ami ajouté à votre réseau !");
            window.location.reload();
        } else {
            toast.info("Demande refusée.");
        }
      } else {
        const data = await response.json();
        toast.error(`Erreur : ${data.error}`);
      }
    } catch (err) {
      toast.error("Impossible de joindre le serveur.");
    }
  };

  const handleDeleteFriend = async (friendCode) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet ami de votre réseau ?")) return;
    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/friends/delete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_code: friendCode })
      });
      if (response.ok) {
        setLeaderboard(leaderboard.filter(person => person.friend_code !== friendCode));
        toast.success("Ami retiré avec succès.");
      }
    } catch (err) {}
  };

  const handleBlockFriend = async (friendCode) => {
    if (!window.confirm("Bloquer cet utilisateur ? Il disparaîtra de vos listes et ne pourra plus interagir avec vous.")) return;
    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/friends/block`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_code: friendCode })
      });
      if (response.ok) {
        setLeaderboard(leaderboard.filter(person => person.friend_code !== friendCode));
        setPendingRequests(pendingRequests.filter(req => req.friend_code !== friendCode));
        toast.success("Utilisateur bloqué avec succès.");
      }
    } catch (err) {
      console.error("Erreur lors du blocage :", err);
    }
  };

  const fetchBlockedUsers = async () => {
    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/friends/blocked`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBlockedList(data.blocked || []);
        setIsViewingBlocked(true);
      }
    } catch (err) {}
  };

  const handleUnblock = async (friendCode) => {
    if (!window.confirm("Voulez-vous débloquer cet utilisateur ?")) return;
    try {
      const token = localStorage.getItem('octo_token');
      const response = await fetch(`http://192.168.1.143:5000/friends/unblock`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ friend_code: friendCode })
      });
      if (response.ok) {
        setBlockedList(blockedList.filter(person => person.friend_code !== friendCode));
        toast.success("Utilisateur débloqué.");
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
        <button style={activeTab === 'badges' ? styles.tabActive : styles.tab} onClick={() => {setActiveTab('badges'); setIsViewingBlocked(false);}}>
          <i className="fa-solid fa-medal"></i> Trophées
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
            <div style={styles.leaderboardHeaderWrapper}>
              <h2 style={{...styles.sectionTitle, borderBottom: 'none', marginBottom: 0, paddingBottom: 0}}>
                {leaderboardTab === 'friends' ? `Podium de ${getNomDuMois()}` : 'Classement Local'}
              </h2>
              <div style={styles.subTabButtons}>
                <button style={leaderboardTab === 'friends' ? styles.subTabActive : styles.subTab} onClick={() => setLeaderboardTab('friends')}>
                  Mes Amis
                </button>
                <button style={leaderboardTab === 'city' ? styles.subTabActive : styles.subTab} onClick={() => setLeaderboardTab('city')}>
                  Ma Ville (Public)
                </button>
              </div>
            </div>

            {/* SOUS-ONGLET : MES AMIS */}
            {leaderboardTab === 'friends' && (
              <>
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
                            <strong>{person.first_name} {person.last_name} {person.isMe && '(Vous)'}</strong>
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
              </>
            )}

            {/* SOUS-ONGLET : VILLE */}
            {leaderboardTab === 'city' && (
              <div style={styles.cityLeaderboardList}>
                
                {/* Filtres Temporels */}
                <div style={styles.timeframeFilterContainer}>
                  <button style={timeframe === 'day' ? styles.timeBtnActive : styles.timeBtn} onClick={() => setTimeframe('day')}>
                    Aujourd'hui
                  </button>
                  <button style={timeframe === 'month' ? styles.timeBtnActive : styles.timeBtn} onClick={() => setTimeframe('month')}>
                    Ce Mois-ci
                  </button>
                </div>

                <p style={styles.cityInfoText}>
                  <i className="fa-solid fa-circle-info"></i> Seuls les foyers ayant accepté le partage public apparaissent ici.
                </p>
                
                {isLoadingCity ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                    <i className="fa-solid fa-spinner fa-spin"></i> Chargement du classement...
                  </p>
                ) : cityLeaderboard.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                    <h3 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>Aucune donnée 📭</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                      Personne n'a encore jeté de déchets {timeframe === 'day' ? "aujourd'hui" : "ce mois-ci"} avec le partage activé.
                    </p>
                  </div>
                ) : (
                  cityLeaderboard.map((user, index) => (
                    <div key={user.id_user} style={{...styles.cityLeaderboardItem, ...(user.isMe ? styles.cityHighlightMe : {})}}>
                      <div style={styles.cityItemRank}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>
                      <div style={styles.cityItemName}>
                        {user.name} {user.isMe && <span style={{fontSize: '0.8rem', color: 'var(--primary)'}}>(Vous)</span>}
                      </div>
                      <div style={styles.cityItemScore}>{user.score} kg sauvés</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* ONGLET : VITRINE À TROPHÉES */}
        {activeTab === 'badges' && (
          <div>
            <h2 style={styles.sectionTitle}>Ma Salle des Trophées</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Retrouvez ici l'ensemble des récompenses que vous avez débloquées grâce à vos actions éco-citoyennes.
            </p>
            {/* INJECTION DE TOUTES LES DONNÉES DANS LA VITRINE */}
            <BadgeShowcase 
                ownedBadges={ownedBadges} 
                totalKg={myTotalKg} 
                rank={myRank} 
                friendsCount={myFriendsCount} 
                cityRank={myCityRank} 
                householdSize={myHouseholdSize}
                sensorCount={mySensorCount}
                lastThrowDate={myLastThrowDate}
                streakDays={myStreak}
            />
          </div>
        )}

        {/* ONGLET : LISTE DES AMIS / BLOQUÉS */}
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
                        <strong>{person.first_name} {person.last_name}</strong> 
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
                        <strong>{person.first_name} {person.last_name}</strong> 
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

        {/* ONGLET : AJOUTER VIA CODE AMI */}
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

        {/* ONGLET : DEMANDES EN ATTENTE */}
        {activeTab === 'requests' && (
          <div>
            <h2 style={styles.sectionTitle}>Invitations reçues</h2>
            {pendingRequests.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Aucune demande en attente.</p>
            ) : (
              pendingRequests.map(req => (
                <div key={req.friend_code} style={styles.listItem}>
                  <div style={{ flex: 1 }}>
                    <strong>{req.first_name} {req.last_name}</strong> <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>({req.friend_code})</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleManageRequest(req.friend_code, 'accepter')} style={styles.acceptBtn} title="Accepter">
                      <i className="fa-solid fa-check"></i>
                    </button>
                    <button onClick={() => handleManageRequest(req.friend_code, 'refuser')} style={styles.declineBtn} title="Refuser">
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
  unblockBtn: { background: '#2ecc71', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' },

  leaderboardHeaderWrapper: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', flexWrap: 'wrap', gap: '15px' },
  subTabButtons: { display: 'flex', gap: '10px', background: 'var(--bg-main)', padding: '5px', borderRadius: '8px' },
  subTab: { padding: '8px 16px', border: 'none', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-muted)', transition: 'all 0.2s ease' },
  subTabActive: { padding: '8px 16px', border: 'none', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  
  timeframeFilterContainer: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' },
  timeBtn: { padding: '6px 15px', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', transition: '0.2s' },
  timeBtnActive: { padding: '6px 15px', borderRadius: '20px', border: '1px solid var(--primary)', background: 'rgba(46, 204, 113, 0.1)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' },

  cityInfoText: { fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px', fontStyle: 'italic', textAlign: 'center' },
  cityLeaderboardList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  cityLeaderboardItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', transition: 'transform 0.2s' },
  cityHighlightMe: { backgroundColor: 'rgba(46, 204, 113, 0.1)', borderColor: 'var(--primary)', fontWeight: 'bold' },
  cityItemRank: { width: '40px', fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-muted)' },
  cityItemName: { flex: 1, fontSize: '1rem', color: 'var(--text-main)', fontWeight: 'bold' },
  cityItemScore: { fontWeight: 'bold', color: 'var(--primary)' }
};

export default CommunityView;