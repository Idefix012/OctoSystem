// src/views/DashboardView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import du client WebSocket pour écouter les événements serveur en temps réel
import io from 'socket.io-client';
import WeightCard from './widgets/WeightCard';
import HistoryChart from './widgets/HistoryChart';
import GoalChart from './widgets/GoalChart'; 
import MiniBadgeCard from './widgets/MiniBadgeCard';
import { API_URL } from '../config';

/**
 * Composant DashboardView
 * Vue principale de l'application agissant comme un composant conteneur (Smart Component).
 * Il gère la récupération des données de l'API, maintient la connexion WebSocket,
 * et distribue les états locaux aux composants d'interface (Dumb Components).
 */
const DashboardView = ({ user }) => {
  const navigate = useNavigate();
  // État gérant l'affichage des squelettes de chargement (Skeleton screens)
  const [isLoading, setIsLoading] = useState(true);

  // ÉTATS POUR LA SÉLECTION DE LA POUBELLE (Gestion du parc IoT)
  const [garbages, setGarbages] = useState([]);
  const [selectedDeveui, setSelectedDeveui] = useState('');

  // ÉTATS POUR LES DONNÉES MÉTIER (Masses et Horodatage)
  const [latestMass, setLatestMass] = useState(0);
  const [totalMass, setTotalMass] = useState(0); 
  const [latestDate, setLatestDate] = useState("Chargement...");
  
  // ÉTATS POUR LE GRAPHIQUE D'HISTORIQUE (Chart.js)
  const [chartLabels, setChartLabels] = useState([]);
  const [chartData, setChartData] = useState([]);

  // ÉTAT POUR LA GAMIFICATION
  const [statsMois, setStatsMois] = useState({ totalKg: 0, rank: 0, totalParticipants: 0 });

  // CONSTANTES DE CONFIGURATION (Seuils d'alerte et de capacité)
  const MAX_CAPACITY = 40;
  const ALERT_THRESHOLD = 36; 

  /**
   * Génère la date du jour au format ISO raccourci (YYYY-MM-DD)
   * Utilisé comme paramètre de requête HTTP pour filtrer les données de l'API.
   */
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // 1. CHARGEMENT DU CLASSEMENT ET DE LA LISTE DES POUBELLES (Initialisation)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Récupération du JWT pour sécuriser les appels API
        const token = localStorage.getItem('octo_token');
        if (!token) return; // Arrêt prématuré si l'utilisateur n'est pas authentifié
        
        // A. Récupérer le classement mensuel via l'API REST
        const repRank = await fetch(`${API_URL}/friends`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (repRank.ok) {
          const classement = await repRank.json();
          // Extraction du profil de l'utilisateur courant pour mettre à jour ses statistiques
          const monProfil = classement.find(p => p.isMe === true);
          if (monProfil) {
            setStatsMois({
              totalKg: monProfil.totalKg,
              rank: classement.findIndex(p => p.isMe === true) + 1,
              totalParticipants: classement.length
            });
          }
        }

        // B. Récupérer la liste des poubelles (capteurs) associées au compte
        const repGarbages = await fetch(`${API_URL}/garbages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (repGarbages.ok) {
          const listGarbages = await repGarbages.json();
          setGarbages(listGarbages);
          // Si des capteurs existent, on sélectionne le premier par défaut pour déclencher le second useEffect
          if (listGarbages.length > 0) {
            setSelectedDeveui(listGarbages[0].deveui);
          } else {
            // S'il n'y a aucun capteur, on arrête le chargement pour afficher la vue vide
            setIsLoading(false); 
          }
        }
      } catch (err) {
        console.error("Erreur Init Dashboard :", err);
      }
    };
    
    fetchInitialData();
  }, []); // Tableau de dépendances vide = exécution unique au montage du composant

  // 2. ÉCOUTE TEMPS RÉEL VIA WEBSOCKET ET TRAITEMENT DES DONNÉES
  // Ce Hook se déclenche à chaque fois que l'utilisateur sélectionne un nouveau capteur (selectedDeveui)
  useEffect(() => {
    if (!selectedDeveui) return; // Clause de garde si aucun capteur n'est sélectionné

    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('octo_token');
        const today = getTodayString();

        // Requête API filtrée par date du jour et par identifiant de capteur (DevEUI)
        const response = await fetch(`${API_URL}/garbage/data_by_date?date=${today}&deveui=${selectedDeveui}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const donnees = await response.json();
          
          if (Array.isArray(donnees) && donnees.length > 0) {
            // Conversion de la masse absolue brute (grammes) en kilogrammes pour l'affichage
            const poidsPhysiqueKg = parseFloat(donnees[0].weight) / 1000;
            setTotalMass(parseFloat(poidsPhysiqueKg.toFixed(2)));

            // Algorithme de calcul du delta (variation de masse) pour déterminer le poids du dernier déchet
            let dernierJetKg = 0;
            if (donnees.length === 1) {
              dernierJetKg = poidsPhysiqueKg; // S'il n'y a qu'une pesée, le delta est égal à la masse totale
            } else {
              // Parcours du tableau des pesées pour trouver la première augmentation de masse
              for (let i = 0; i < donnees.length - 1; i++) {
                const actuel = parseFloat(donnees[i].weight);
                const precedent = parseFloat(donnees[i+1].weight);
                if (actuel > precedent) {
                  dernierJetKg = (actuel - precedent) / 1000;
                  break; // Interruption de la boucle dès le premier delta positif trouvé
                }
              }
            }
            setLatestMass(parseFloat(dernierJetKg.toFixed(3)));

            // Extraction et formatage de l'heure de la dernière pesée
            const dateObj = new Date(donnees[0].date);
            const heure = `${dateObj.getHours()}h${dateObj.getMinutes().toString().padStart(2, '0')}`;
            setLatestDate(`Aujourd'hui à ${heure}`);

            // Préparation des données pour l'injection dans le graphique Chart.js
            const donneesChronologiques = [...donnees].reverse(); // Inversion pour un affichage de gauche à droite
            setChartLabels(donneesChronologiques.map(item => {
              const d = new Date(item.date);
              return `${d.getHours()}h${d.getMinutes().toString().padStart(2, '0')}`;
            }));
            setChartData(donneesChronologiques.map(item => parseFloat(item.weight) / 1000));
            
          } else {
            // Réinitialisation des états si aucune donnée n'est trouvée pour la date du jour
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
        setIsLoading(false); // Fin de l'état de chargement, indépendamment du résultat de la requête
      }
    };

    setIsLoading(true);
    fetchDashboardData();

    // Initialisation de la connexion bidirectionnelle (WebSocket)
    const socket = io(API_URL);

    // Écoute de l'événement émis par le serveur lors d'une nouvelle pesée LoRaWAN
    socket.on('new_sensor_data', (data) => {
      // Vérification de sécurité : on ne rafraîchit que si la donnée concerne le capteur affiché
      if (data.deveui === selectedDeveui) {
        console.log("🔔 Ding Dong ! Nouvelle pesée détectée sur la poubelle en temps réel !");
        fetchDashboardData(); // Nouvel appel API pour actualiser le DOM React
      }
    });

    // Fonction de nettoyage (Clean-up function) du Hook useEffect
    // Ferme le socket lors du démontage du composant ou avant sa ré-exécution pour éviter les fuites de mémoire
    return () => {
      socket.disconnect();
    };

  }, [selectedDeveui]);

  return (
    <div style={styles.dashboard}>
      {/* Rendu conditionnel d'alerte : S'affiche si la masse totale dépasse le seuil défini */}
      {totalMass >= ALERT_THRESHOLD && !isLoading && (
        <div className="toast-alert">
          <i className="fa-solid fa-triangle-exclamation" style={{fontSize: '1.5rem'}}></i>
          <div>
            Alerte Capteur : {totalMass} kg atteints.<br/>
            <span style={{fontSize: '0.9rem', fontWeight: 'normal'}}>Veuillez vider la poubelle.</span>
          </div>
        </div>
      )}

      {/* En-tête avec message d'accueil et sélecteur de capteur */}
      <div style={styles.headerRow}>
        <div style={styles.welcome}>
          <h1 style={styles.title}>Bonjour {user ? user.first_name : 'Utilisateur'} ! 👋</h1>
          
          {garbages.length > 0 ? (
            <div style={styles.selectWrapper}>
              <i className="fa-solid fa-microchip" style={styles.selectIcon}></i>
              <select 
                value={selectedDeveui} 
                onChange={(e) => setSelectedDeveui(e.target.value)} // Met à jour l'état et déclenche le useEffect
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

      {/* Rendu conditionnel global : Affichage de l'état vide (Empty State) si aucun capteur n'est enregistré */}
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
            {/* Rendu conditionnel des Skeletons pendant le chargement réseau */}
            {isLoading ? (
              <>
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-doughnut"></div>
              </>
            ) : (
              <>
                {/* Widget de classement local : affiché uniquement si l'utilisateur possède un rang valide */}
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
                
                {/* Injection des données métier dans les composants enfants (Dumb Components) */}
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
              // Transmission des tableaux de valeurs au composant graphique
              <HistoryChart labels={chartLabels} dataPoints={chartData} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Dictionnaire contenant les styles CSS appliqués directement (CSS-in-JS)
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