// src/views/HistoryView.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client'; // Import du client WebSocket pour l'actualisation en temps réel
import { toast } from 'react-toastify'; // Import de la bibliothèque de notifications
import { API_URL } from '../config';
// Importation des modules spécifiques de Chart.js nécessaires pour construire un graphique en ligne
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Enregistrement des composants Chart.js pour le rendu du Canvas
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Composant HistoryView
 * Vue dédiée à l'affichage analytique (tableau de données et graphique) de l'historique des pesées.
 * Intègre une fonctionnalité d'exportation CSV générée côté client (Blob).
 */
const HistoryView = () => {
  const navigate = useNavigate();
  // État local stockant les données d'historique brutes renvoyées par l'API
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ÉTATS POUR LA SÉLECTION DE POUBELLE (Gestion dynamique du contexte matériel)
  const [garbages, setGarbages] = useState([]);
  const [selectedDeveui, setSelectedDeveui] = useState('');

  /**
   * Génère la chaîne de date du jour au format requis par l'API (YYYY-MM-DD).
   */
  const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // État stockant la date sélectionnée dans l'interface de filtrage, initialisé à la date du jour.
  const [selectedDate, setSelectedDate] = useState(getTodayString());

  /**
   * Fonction utilitaire de formatage de l'horodatage ISO vers un format lisible.
   * @param {string} dateString - Chaîne de date au format ISO 8601.
   * @returns {Object} Objet contenant la date (JJ/MM/AAAA) et l'heure (HHhMM) séparées.
   */
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const jour = d.getDate().toString().padStart(2, '0');
    const mois = (d.getMonth() + 1).toString().padStart(2, '0');
    const annee = d.getFullYear();
    const heures = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return {
      jour: `${jour}/${mois}/${annee}`,
      heure: `${heures}h${minutes}`
    };
  };

  // 1. CHARGEMENT DE LA LISTE DES POUBELLES (Initialisation du contexte matériel)
  useEffect(() => {
    const fetchGarbages = async () => {
      try {
        const token = localStorage.getItem('octo_token');
        if (!token) return;

        // Requête HTTP GET pour récupérer les appareils associés à l'utilisateur
        const response = await fetch(`${API_URL}/garbages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const listGarbages = await response.json();
          setGarbages(listGarbages);
          // Si au moins un capteur existe, on sélectionne le premier pour initialiser l'état 'selectedDeveui'
          if (listGarbages.length > 0) {
            setSelectedDeveui(listGarbages[0].deveui);
          } else {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Erreur récupération poubelles :", err);
      }
    };
    
    fetchGarbages();
  }, []);

  // FONCTION RÉUTILISABLE POUR CHARGER L'HISTORIQUE SELON LES FILTRES ACTIFS
  const fetchHistoryByDate = async () => {
    // Clause de garde : on ne lance pas la requête si les paramètres obligatoires sont absents
    if (!selectedDate || !selectedDeveui) {
      setHistoryData([]);
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('octo_token');
      if (!token) return;

      // Requête HTTP GET filtrée par les paramètres d'URL (date et deveui)
      const response = await fetch(`${API_URL}/garbage/data_by_date?date=${selectedDate}&deveui=${selectedDeveui}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const donnees = await response.json();
        setHistoryData(donnees);
      } else {
        setHistoryData([]);
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. CHARGEMENT INITIAL À LA SÉLECTION D'UNE DATE OU D'UNE POUBELLE
  useEffect(() => {
    fetchHistoryByDate();
    // Le commentaire ci-dessous désactive l'avertissement du linter concernant l'absence de 'fetchHistoryByDate' dans les dépendances
    // eslint-disable-next-line
  }, [selectedDate, selectedDeveui]);

  // 3. ÉCOUTE TEMPS RÉEL VIA WEBSOCKET (Mise à jour conditionnelle)
  useEffect(() => {
    if (!selectedDeveui) return;

    const socket = io(API_URL);

    socket.on('new_sensor_data', (data) => {
      // Filtrage métier (Optimisation réseau) : On ne déclenche un rafraîchissement (appel API) que si :
      // 1. La nouvelle donnée provient bien du capteur actuellement sélectionné dans l'interface.
      // 2. L'utilisateur est en train de consulter l'historique de la date courante (inutile de rafraîchir s'il consulte des archives).
      if (data.deveui === selectedDeveui && selectedDate === getTodayString()) {
        console.log("🔔 WebSocket : Nouvelle pesée détectée ! Mise à jour de l'historique...");
        fetchHistoryByDate();
      }
    });

    // Nettoyage de la connexion lors du démontage pour libérer les ressources
    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line
  }, [selectedDeveui, selectedDate]);


  // 4. FONCTION D'EXPORTATION CSV (Génération 100% Client-Side)
  const exportToCSV = () => {
    if (historyData.length === 0) {
      toast.info("Aucune donnée à exporter pour cette date.");
      return;
    }

    // Création des en-têtes du fichier. L'utilisation du point-virgule (;) garantit la compatibilité 
    // native avec la configuration régionale française d'Excel pour séparer les colonnes.
    let csvContent = "Date;Heure;Poids (kg);Statut\n";

    // Inversion du tableau pour que l'export Excel affiche les données de manière chronologique (du plus ancien au plus récent)
    const sortedData = [...historyData].reverse();
    sortedData.forEach(item => {
      const dateFormatee = formatDate(item.date);
      // Remplacement du séparateur décimal (point) par une virgule, indispensable pour l'interprétation correcte des nombres par Excel FR.
      const poidsKg = (parseFloat(item.weight) / 1000).toFixed(2).replace('.', ',');
      
      // Concaténation de la nouvelle ligne de données au format CSV
      csvContent += `${dateFormatee.jour};${dateFormatee.heure};${poidsKg};Synchronise\n`;
    });

    // Encodage spécial : Ajout du Byte Order Mark (BOM) UTF-8. 
    // Cela force Excel Windows à lire le fichier en UTF-8, évitant ainsi la corruption des caractères accentués (ex: 'é' transformé en symbole étrange).
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]); 
    // Création d'un objet binaire (Blob) contenant le BOM suivi du contenu textuel.
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Processus de téléchargement programmé via l'API DOM
    const url = URL.createObjectURL(blob); // Génère une URL temporaire pointant vers le Blob en mémoire
    const link = document.createElement("a"); // Crée un élément HTML <a> invisible
    link.setAttribute("href", url);
    // Spécifie l'attribut 'download' qui force le navigateur à télécharger le fichier au lieu de l'ouvrir
    link.setAttribute("download", `OctoSystem_Historique_${selectedDeveui}_${selectedDate}.csv`);
    document.body.appendChild(link); // Injection temporaire dans le DOM
    link.click(); // Simulation d'un clic utilisateur pour lancer le téléchargement
    document.body.removeChild(link); // Nettoyage immédiat du DOM

    toast.success("Fichier Excel (CSV) exporté avec succès !");
  };

  // Préparation des données pour l'injection dans Chart.js (Inversion pour l'ordre chronologique de l'axe des abscisses)
  const chartDataPrep = [...historyData].reverse(); 
  
  // Configuration de la structure de données attendue par l'instance Line de Chart.js
  const dataGraphique = {
    labels: chartDataPrep.map(item => formatDate(item.date).heure),
    datasets: [
      {
        label: 'Masse mesurée (kg)',
        data: chartDataPrep.map(item => (parseFloat(item.weight) / 1000).toFixed(2)),
        borderColor: '#2ecc71', 
        backgroundColor: 'rgba(46, 204, 113, 0.2)', 
        borderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2ecc71',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true, // Remplit l'espace sous la courbe
        tension: 0.4 // Applique un lissage (courbe de Bézier)
      }
    ]
  };

  // Configuration détaillée des options du graphique (axes, info-bulles, réactivité)
  const optionsGraphique = {
    responsive: true,
    maintainAspectRatio: false, // Permet au canvas de remplir entièrement son conteneur parent (chartContainer)
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 14, weight: 'bold' },
        callbacks: {
          label: (context) => ` ${context.raw} kg`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Masse (kg)', color: 'var(--text-muted)' },
        grid: { color: 'var(--border-color)', borderDash: [5, 5] }
      },
      x: {
        title: { display: true, text: 'Heure', color: 'var(--text-muted)' },
        grid: { display: false }
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Historique des pesées 📊</h1>
        <p style={styles.subtitle}>Consultez le détail de l'activité de vos capteurs par date.</p>
      </div>

      {garbages.length === 0 && !isLoading ? (
        <div style={styles.emptyStateCard}>
          <i className="fa-solid fa-link-slash" style={{ fontSize: '3rem', color: 'var(--border-color)', marginBottom: '15px' }}></i>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Aucun capteur détecté</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            Veuillez associer une poubelle connectée pour consulter l'historique.
          </p>
          <button onClick={() => navigate('/settings')} style={styles.primaryBtn}>
            Aller dans les paramètres
          </button>
        </div>
      ) : (
        <>
          {/* Barre de filtrage et d'actions (Contrôles de l'historique) */}
          <div style={styles.filterBar}>
            {/* SÉLECTEUR DE POUBELLE */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>
                <i className="fa-solid fa-microchip"></i> Capteur :
              </label>
              <select 
                value={selectedDeveui} 
                onChange={(e) => setSelectedDeveui(e.target.value)} // Modification de l'état local, déclenche la requête API (useEffect)
                style={styles.selectInput}
              >
                {garbages.map((g, index) => (
                  <option key={g.deveui} value={g.deveui}>Capteur {index + 1} ({g.deveui})</option>
                ))}
              </select>
            </div>

            {/* SÉLECTEUR DE DATE */}
            <div style={styles.filterGroup}>
              <label htmlFor="dateFilter" style={styles.filterLabel}>
                <i className="fa-solid fa-calendar-day"></i> Date :
              </label>
              <input 
                type="date" 
                id="dateFilter"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)} // Modification de l'état local, déclenche la requête API
                style={styles.dateInput}
                max={getTodayString()} // Empêche la sélection d'une date dans le futur via l'attribut natif HTML5
              />
            </div>

            {/* ZONE DES ACTIONS (Compteur + Bouton Export) */}
            <div style={styles.actionGroup}>
              <div style={styles.statsCount}>
                <span>{historyData.length} mesure(s)</span>
              </div>
              {/* Le bouton d'exportation est désactivé et son opacité est réduite si le tableau de données est vide */}
              <button 
                onClick={exportToCSV} 
                style={{
                  ...styles.exportBtn, 
                  opacity: historyData.length === 0 ? 0.5 : 1, 
                  cursor: historyData.length === 0 ? 'not-allowed' : 'pointer'
                }} 
                disabled={historyData.length === 0}
                title="Télécharger pour Excel"
              >
                <i className="fa-solid fa-file-csv"></i> Exporter
              </button>
            </div>
          </div>

          {/* Gestion des états asynchrones de l'interface */}
          {isLoading ? (
            <div style={styles.card}>
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p style={{ marginTop: '15px' }}>Chargement des données...</p>
              </div>
            </div>
          ) : historyData.length === 0 ? (
            <div style={styles.card}>
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-folder-open fa-2x"></i>
                <p style={{ marginTop: '15px' }}>Aucune donnée mesurée pour le {selectedDate.split('-').reverse().join('/')}.</p>
              </div>
            </div>
          ) : (
            // Affichage principal si les données sont présentes
            <>
              {/* Conteneur du graphique (Valorisation visuelle) */}
              <div style={{ ...styles.card, marginBottom: '20px', padding: '20px' }}>
                <h3 style={styles.sectionTitle}>Évolution sur la journée</h3>
                <div style={styles.chartContainer}>
                  <Line data={dataGraphique} options={optionsGraphique} />
                </div>
              </div>

              {/* Conteneur du tableau (Vue analytique détaillée) */}
              <div style={styles.card}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Heure</th>
                        <th style={styles.th}>Poids total détecté</th>
                        <th style={styles.th}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Itération sur les données brutes (non inversées, pour afficher les plus récentes en haut du tableau) */}
                      {historyData.map((item, index) => {
                        const dateFormatee = formatDate(item.date);
                        const poidsKg = (parseFloat(item.weight) / 1000).toFixed(2);
                        
                        return (
                          <tr key={index} style={styles.tr}>
                            <td style={styles.td}>
                              <i className="fa-regular fa-calendar" style={{ color: 'var(--primary)', marginRight: '8px' }}></i>
                              {dateFormatee.jour}
                            </td>
                            <td style={styles.td}>
                              <i className="fa-regular fa-clock" style={{ color: 'var(--text-muted)', marginRight: '8px' }}></i>
                              {dateFormatee.heure}
                            </td>
                            <td style={{ ...styles.td, fontWeight: 'bold' }}>
                              {poidsKg} kg
                            </td>
                            <td style={styles.td}>
                              <span style={styles.badgeSuccess}>Synchronisé</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

// Dictionnaire des styles CSS en JSS (JavaScript Style Sheets)
const styles = {
  container: { padding: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%' },
  header: { marginBottom: '20px' },
  title: { fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '5px' },
  subtitle: { color: 'var(--text-muted)' },
  
  filterBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '15px 20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', flexWrap: 'wrap', gap: '15px' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  filterLabel: { color: 'var(--text-main)', fontWeight: 'bold', fontSize: '0.9rem' },
  dateInput: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit', cursor: 'pointer' },
  selectInput: { padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 'bold' },
  
  actionGroup: { display: 'flex', alignItems: 'center', gap: '15px' },
  statsCount: { color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold', background: 'var(--bg-main)', padding: '6px 12px', borderRadius: '20px' },
  exportBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: '#27ae60', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', transition: '0.2s', fontSize: '0.9rem' },
  
  card: { background: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid var(--border-color)' },
  sectionTitle: { marginTop: 0, marginBottom: '20px', color: 'var(--text-main)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' },
  chartContainer: { height: '300px', width: '100%', position: 'relative' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '16px', background: 'var(--bg-main)', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid var(--border-color)' },
  tr: { borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' },
  td: { padding: '16px', color: 'var(--text-main)', fontSize: '1rem' },
  badgeSuccess: { background: 'rgba(46, 204, 113, 0.15)', color: '#27ae60', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' },
  
  emptyStateCard: { background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: '16px', padding: '50px 20px', textAlign: 'center', marginTop: '20px' },
  primaryBtn: { background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
};

export default HistoryView;