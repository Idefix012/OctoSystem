// src/views/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import WeightCard from './widgets/WeightCard';
import HistoryChart from './widgets/HistoryChart';
import GoalChart from './widgets/GoalChart'; 
import MiniBadgeCard from './widgets/MiniBadgeCard'; 

const DashboardView = ({ user }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // ÉTATS POUR LA SÉLECTION DE LA POUBELLE
  const [garbages, setGarbages] = useState([]);
  const [selectedDeveui, setSelectedDeveui] = useState('');

  const [latestMass, setLatestMass] = useState(0);
  const [totalMass, setTotalMass] = useState(0); 
  const [latestDate, setLatestDate] = useState("Chargement...");
  
  const [chartLabels, setChartLabels] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [statsMois, setStatsMois] = useState({ totalKg: 0, rank: 0, totalParticipants: 0 });

  const MAX_CAPACITY = 40;
  const ALERT_THRESHOLD = 36; 

  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // 1. CHARGEMENT DU CLASSEMENT ET DE LA LISTE DES POUBELLES
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem('octo_token');
        if (!token) return;
        
        // A. Récupérer le classement mensuel
        const repRank = await fetch(`http://192.168.1.143:5000/friends`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (repRank.ok) {
          const classement = await repRank.json();
          const monProfil = classement.find(p => p.isMe === true);
          if (monProfil) {
            setStatsMois({
              totalKg: monProfil.totalKg,
              rank: classement.findIndex(p => p.isMe === true) + 1,
              totalParticipants: classement.length
            });
          }
        }

        // B. Récupérer la liste des poubelles de l'utilisateur
        const repGarbages = await fetch(`http://192.168.1.143:5000/garbages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (repGarbages.ok) {
          const listGarbages = await repGarbages.json();
          setGarbages(listGarbages);
          if (listGarbages.length > 0) {
            setSelectedDeveui(listGarbages[0].deveui);
          } else {
            setIsLoading(false); 
          }
        }
      } catch (err) {
        console.error("Erreur Init Dashboard :", err);
      }
    };
    
    fetchInitialData();
  }, []);

  // 2. ÉCOUTE TEMPS RÉEL VIA WEBSOCKET
  useEffect(() => {
    if (!selectedDeveui) return;

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('octo_token');
        const today = getTodayString();

        const response = await fetch(`http://192.168.1.143:5000/garbage/data_by_date?date=${today}&deveui=${selectedDeveui}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const donnees = await response.json();
          
          if (Array.isArray(donnees) && donnees.length > 0) {
            const poidsPhysiqueKg = parseFloat(donnees[0].weight) / 1000;
            setTotalMass(parseFloat(poidsPhysiqueKg.toFixed(2)));

            let dernierJetKg = 0;
            if (donnees.length === 1) {
              dernierJetKg = poidsPhysiqueKg;
            } else {
              for (let i = 0; i < donnees.length - 1; i++) {
                const actuel = parseFloat(donnees[i].weight);
                const precedent = parseFloat(donnees[i+1].weight);
                if (actuel > precedent) {
                  dernierJetKg = (actuel - precedent) / 1000;
                  break; 
                }
              }
            }
            setLatestMass(parseFloat(dernierJetKg.toFixed(3)));

            const dateObj = new Date(donnees[0].date);
            const heure = `${dateObj.getHours()}h${dateObj.getMinutes().toString().padStart(2, '0')}`;
            setLatestDate(`Aujourd'hui à ${heure}`);

            const donneesChronologiques = [...donnees].reverse();
            setChartLabels(donneesChronologiques.map(item => {
              const d = new Date(item.date);
              return `${d.getHours()}h${d.getMinutes().toString().padStart(2, '0')}`;
            }));
            setChartData(donneesChronologiques.map(item => parseFloat(item.weight) / 1000));
            
          } else {
            setLatestDate("Poubelle vide aujourd'hui");
            setLatestMass(0);
            setTotalMass(0);
            setChartLabels([]);
            setChartData([]);
          }
        }
      } catch (err) {
        console.error("Erreur Fetch Dashboard :", err);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchDashboardData();

    const socket = io('http://192.168.1.143:5000');

    socket.on('new_sensor_data', (data) => {
      if (data.deveui === selectedDeveui) {
        console.log("🔔 Ding Dong ! Nouvelle pesée détectée sur la poubelle en temps réel !");
        fetchDashboardData();
      }
    });

    return () => {
      socket.disconnect();
    };

  }, [selectedDeveui]);

  return (
    <div style={styles.dashboard}>
      {totalMass >= ALERT_THRESHOLD && !isLoading && (
        <div className="toast-alert">
          <i className="fa-solid fa-triangle-exclamation" style={{fontSize: '1.5rem'}}></i>
          <div>
            Alerte Capteur : {totalMass} kg atteints.<br/>
            <span style={{fontSize: '0.9rem', fontWeight: 'normal'}}>Veuillez vider la poubelle.</span>
          </div>
        </div>
      )}

      <div style={styles.headerRow}>
        <div style={styles.welcome}>
          <h1 style={styles.title}>Bonjour {user ? user.first_name : 'Utilisateur'} ! 👋</h1>
          
          {garbages.length > 0 ? (
            <div style={styles.selectWrapper}>
              <i className="fa-solid fa-microchip" style={styles.selectIcon}></i>
              <select 
                value={selectedDeveui} 
                onChange={(e) => setSelectedDeveui(e.target.value)} 
                style={styles.selectInput}
              >
                {garbages.map((g, index) => (
                  <option key={g.deveui} value={g.deveui}>
                    Capteur {index + 1} ({g.deveui})
                  </option>
                ))}
              </select>
            </div>
          ) : (
             <p style={styles.subtitle}>Supervision en temps réel du capteur de masse.</p>
          )}
        </div>
      </div>

      {garbages.length === 0 && !isLoading ? (
        <div style={styles.emptyStateCard}>
          <i className="fa-solid fa-link-slash" style={{ fontSize: '3rem', color: 'var(--border-color)', marginBottom: '15px' }}></i>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Aucun capteur détecté</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '400px', margin: '0 auto 20px auto' }}>
            Vous n'avez pas encore lié de poubelle connectée OctoSystem à votre compte.
          </p>
          <button onClick={() => navigate('/settings')} style={styles.primaryBtn}>
            <i className="fa-solid fa-gear"></i> Aller dans les paramètres
          </button>
        </div>
      ) : (
        <>
          <div style={styles.topGrid}>
            {isLoading ? (
              <>
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-doughnut"></div>
              </>
            ) : (
              <>
                {statsMois.rank > 0 && (
                  <div style={styles.rankCard}>
                    <div style={styles.rankHeader}>
                      <h4 style={styles.rankTitle}>CLASSEMENT MENSUEL</h4>
                      <div style={styles.rankIconBox}>
                        <i className="fa-solid fa-trophy"></i>
                      </div>
                    </div>
                    <div style={styles.rankContent}>
                      <span style={styles.rankValue}>{statsMois.rank}</span>
                      <span style={styles.rankUnit}> / {statsMois.totalParticipants}</span>
                    </div>
                    <div style={styles.rankFooter}>
                      <p style={styles.rankDate}>Vous avez jeté : <span style={{color: 'var(--primary)', fontWeight: 'bold'}}>{statsMois.totalKg} kg</span></p>
                    </div>
                  </div>
                )}
                
                <MiniBadgeCard 
                  totalKg={statsMois.totalKg} 
                  rank={statsMois.rank} 
                  friendsCount={statsMois.totalParticipants > 0 ? statsMois.totalParticipants - 1 : 0} 
                />
                
                <WeightCard title="DERNIÈRE MASSE" weight={latestMass} date={latestDate} />
                {/* CORRECTION : Le widget doublon MASSE TOTALE a été supprimé d'ici */}
                <GoalChart currentMass={totalMass} maxCapacity={MAX_CAPACITY} />
              </>
            )}
          </div>

          <div style={styles.bottomGrid}>
            {isLoading ? (
              <div className="skeleton skeleton-chart"></div>
            ) : (
              <HistoryChart labels={chartLabels} dataPoints={chartData} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
    dashboard: { padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: '30px', gap: '15px' },
    title: { fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '5px' },
    subtitle: { color: 'var(--text-muted)' },
    
    selectWrapper: { marginTop: '10px', position: 'relative', display: 'inline-flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: '8px', padding: '5px 15px', boxShadow: '0 2px 5px rgba(46, 204, 113, 0.1)' },
    selectIcon: { color: 'var(--primary)', marginRight: '10px', fontSize: '1.1rem' },
    selectInput: { background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 'bold', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', paddingRight: '10px' },
    
    emptyStateCard: { background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', marginTop: '20px' },
    primaryBtn: { background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },

    // CORRECTION : Passage de minmax(250px) à minmax(200px) pour forcer l'alignement strict sur une ligne
    topGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' },
    bottomGrid: { height: '350px' },
    
    rankCard: { background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid var(--border-color)' },
    rankHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    rankTitle: { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold', margin: 0 },
    rankIconBox: { width: '35px', height: '35px', borderRadius: '8px', background: 'rgba(243, 156, 18, 0.15)', color: '#f39c12', display: 'grid', placeItems: 'center' },
    rankContent: { marginTop: '5px' },
    rankValue: { fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' },
    rankUnit: { fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '500' },
    rankFooter: { marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '10px' },
    rankDate: { fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }
};

export default DashboardView;