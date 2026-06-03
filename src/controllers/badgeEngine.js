// src/controllers/badgeEngine.js

/**
 * Contrôleur métier (Rule Engine) gérant la logique d'attribution des badges de gamification.
 * Cette fonction pure prend en entrée les différentes métriques de l'utilisateur (KPIs) 
 * et retourne un tableau d'objets formaté représentant l'état de chaque badge (débloqué, progression, niveau).
 */
export const calculateBadges = (totalKg, rank, friendsCount, cityRank, householdSize = 1, sensorCount = 0, lastThrowDate = null, streakDays = 0) => {
  
  // Calcul préalable du ratio de déchets par individu du foyer pour normaliser l'évaluation
  const ratioKgPers = totalKg / householdSize;

  // 1. BADGE AMIS (Réseau) : Évaluation du niveau de réseau social (paliers : 1, 3, 10 amis)
  let frLvl = 0, frName = 'Ermite', frIcon = 'fa-user-lock', frColor = '#95a5a6', frTarget = 1;
  if (friendsCount >= 10) { frLvl = 3; frName = 'Star du Quartier 🌟'; frIcon = 'fa-users-rays'; frColor = '#f1c40f'; frTarget = 10; }
  else if (friendsCount >= 3) { frLvl = 2; frName = 'Sociable 🤝'; frIcon = 'fa-user-group'; frColor = '#e67e22'; frTarget = 10; }
  else if (friendsCount >= 1) { frLvl = 1; frName = 'Contact Établi 🙋'; frIcon = 'fa-user-plus'; frColor = '#3498db'; frTarget = 3; }
  // Utilisation de Math.min pour plafonner le pourcentage de progression à 100% maximum
  const frPercent = Math.min((friendsCount / frTarget) * 100, 100);
  const frLabel = frLvl === 3 ? 'Niveau Max !' : `${friendsCount} / ${frTarget} amis`;

  // 2. BADGE POIDS TOTAL (Limitation) : Évaluation basée sur le seuil de masse absolue (paliers : <15kg, <5kg, 0kg)
  let wtLvl = 0, wtName = 'Hors Limite 🚨', wtIcon = 'fa-trash', wtColor = '#e74c3c', wtTarget = 15;
  if (totalKg === 0) { wtLvl = 3; wtName = 'Zéro Déchet 🕊️'; wtIcon = 'fa-leaf'; wtColor = '#1abc9c'; wtTarget = 0; }
  else if (totalKg <= 5) { wtLvl = 2; wtName = 'Expert du Tri ♻️'; wtIcon = 'fa-recycle'; wtColor = '#27ae60'; wtTarget = 5; }
  else if (totalKg <= 15) { wtLvl = 1; wtName = 'Poids Plume 🪶'; wtIcon = 'fa-feather'; wtColor = '#f1c40f'; wtTarget = 15; }
  // Gestion d'une exception mathématique : si le niveau 3 (0kg) est atteint, la cible est 0 (division par zéro évitée via la condition)
  const wtPercent = wtLvl === 3 ? 0 : Math.min((totalKg / wtTarget) * 100, 100);
  const wtLabel = wtLvl === 3 ? 'Parfait !' : `${totalKg} / ${wtTarget} kg max`;
  // Déclencheur visuel (danger) si le poids s'approche de la limite fixée
  const wtDanger = wtPercent > 80;

  // 3. BADGE MINIMALISTE : Évaluation basée sur la masse relative par habitant (garantit l'équité entre foyers)
  let minLvl = 0, minName = 'Consommateur 🛒', minIcon = 'fa-box', minColor = '#95a5a6', minTarget = 5;
  if (ratioKgPers <= 1 && totalKg > 0) { minLvl = 3; minName = 'Ascète Écologique 🧘‍♂️'; minIcon = 'fa-seedling'; minColor = '#16a085'; minTarget = 1; }
  else if (ratioKgPers <= 3 && totalKg > 0) { minLvl = 2; minName = 'Minimaliste 🪶'; minIcon = 'fa-feather-pointed'; minColor = '#2ecc71'; minTarget = 3; }
  else if (ratioKgPers <= 5 && totalKg > 0) { minLvl = 1; minName = 'Conscient 🤔'; minIcon = 'fa-eye'; minColor = '#f39c12'; minTarget = 5; }
  const minPercent = minLvl === 3 ? 0 : Math.min((ratioKgPers / minTarget) * 100, 100);
  const minLabel = minLvl === 3 ? 'Niveau Max !' : `${ratioKgPers.toFixed(1)} / ${minTarget} kg/pers.`;

  // 4. BADGE COMPÉTITEUR (Classement Amis) : Évaluation de la position par rapport à la médiane (halfRank)
  const halfRank = Math.ceil((friendsCount + 1) / 2);
  let compLvl = 0, compName = 'Dans la moyenne 📊', compIcon = 'fa-chart-simple', compColor = '#95a5a6', compTarget = halfRank;
  // Nécessite au moins 2 amis pour rendre la compétition pertinente
  if (friendsCount >= 2) {
      if (rank === 1) { compLvl = 3; compName = 'Le Roi du Tri 👑'; compIcon = 'fa-crown'; compColor = '#9b59b6'; compTarget = 1; }
      else if (rank <= 3) { compLvl = 2; compName = 'Challenger 🥉'; compIcon = 'fa-medal'; compColor = '#d35400'; compTarget = 1; }
      else if (rank <= halfRank) { compLvl = 1; compName = 'Le Bon Élève 🎓'; compIcon = 'fa-graduation-cap'; compColor = '#2980b9'; compTarget = 3; }
  }
  const compPercent = rank > 0 ? Math.min((compTarget / rank) * 100, 100) : 0;
  const compLabel = friendsCount < 2 ? 'Ajoutez 2 amis min.' : (compLvl === 3 ? 'Indétrônable !' : `Rang ${rank} / Objectif: Top ${compTarget}`);

  // 5. BADGE VILLE : Évaluation de la position dans le classement public de la commune
  let cityLvl = 0, cityName = 'Anonyme 👤', cityIcon = 'fa-user-secret', cityColor = '#95a5a6', cityTarget = 10;
  if (cityRank > 0) {
      if (cityRank === 1) { cityLvl = 3; cityName = 'Héros Local 🦸‍♂️'; cityIcon = 'fa-mask'; cityColor = '#e67e22'; cityTarget = 1; }
      else if (cityRank <= 3) { cityLvl = 2; cityName = 'Podium Municipal 🥈'; cityIcon = 'fa-award'; cityColor = '#f1c40f'; cityTarget = 1; }
      else if (cityRank <= 10) { cityLvl = 1; cityName = 'L\'Élite Locale 🏙️'; cityIcon = 'fa-building'; cityColor = '#8e44ad'; cityTarget = 3; }
  }
  const cityPercent = cityRank > 0 ? Math.min((cityTarget / cityRank) * 100, 100) : 0;
  const cityLabel = cityRank === 0 ? 'Partage public désactivé' : (cityLvl === 3 ? 'Numéro 1 de la ville !' : `Rang ${cityRank} / Objectif: Top ${cityTarget}`);

  // 6. BADGE MATÉRIEL (IoT) : Vérification du nombre d'équipements LoRaWAN appairés au compte
  let sensLvl = 0, sensName = 'Déconnecté 🔌', sensIcon = 'fa-plug-circle-xmark', sensColor = '#95a5a6', sensTarget = 1;
  if (sensorCount >= 2) { sensLvl = 2; sensName = 'Architecte IoT 📡'; sensIcon = 'fa-network-wired'; sensColor = '#e84393'; sensTarget = 2; }
  else if (sensorCount === 1) { sensLvl = 1; sensName = 'Foyer Connecté 🔋'; sensIcon = 'fa-microchip'; sensColor = '#2ecc71'; sensTarget = 2; }
  const sensPercent = sensorCount > 0 ? Math.min((sensorCount / sensTarget) * 100, 100) : 0;
  const sensLabel = sensorCount === 0 ? 'Associez 1 capteur' : (sensLvl === 2 ? 'Multi-capteurs !' : `${sensorCount} / ${sensTarget} capteurs`);

  // 7. BADGE FLAMME (Streak) : Suivi de la récurrence des bonnes habitudes sur plusieurs jours consécutifs
  let streakLvl = 0, streakName = 'Étincelle 🧨', streakIcon = 'fa-fire', streakColor = '#95a5a6', streakTarget = 3;
  if (streakDays >= 30) { streakLvl = 3; streakName = 'Brasier Éternel 🔥'; streakIcon = 'fa-fire-flame-curved'; streakColor = '#e74c3c'; streakTarget = 30; }
  else if (streakDays >= 7) { streakLvl = 2; streakName = 'Feu Ardent 🏕️'; streakIcon = 'fa-fire-burner'; streakColor = '#e67e22'; streakTarget = 30; }
  else if (streakDays >= 3) { streakLvl = 1; streakName = 'Flamme Naissante 🕯️'; streakIcon = 'fa-fire'; streakColor = '#f1c40f'; streakTarget = 7; }
  const streakPercent = streakLvl === 3 ? 100 : (streakDays > 0 ? Math.min((streakDays / streakTarget) * 100, 100) : 0);
  const streakLabel = streakDays === 0 ? 'Restez sous 1kg/jour' : (streakLvl === 3 ? `${streakDays} jours !` : `${streakDays} / ${streakTarget} jours`);

  // 8. EASTER EGG TEMPOREL : Logique conditionnelle basée sur l'horodatage de la dernière pesée
  let timeName = 'Gardien du Temps ⏳', timeIcon = 'fa-clock', timeColor = '#95a5a6', timeDesc = 'Jetez un déchet à une heure bien précise pour révéler ce secret...';
  let timeUnlocked = false;
  if (lastThrowDate) {
      // Extraction de l'heure locale depuis la chaîne ISO 8601
      const hour = new Date(lastThrowDate).getHours();
      if (hour >= 5 && hour < 8) {
          timeName = 'Le Lève-tôt 🌅'; timeIcon = 'fa-mug-hot'; timeColor = '#f39c12'; timeDesc = 'Déchet jeté à l\'aube ! Le monde appartient à ceux qui se lèvent tôt.'; timeUnlocked = true;
      } else if (hour >= 22 || hour < 5) {
          timeName = 'L\'Oiseau de Nuit 🦉'; timeIcon = 'fa-moon'; timeColor = '#34495e'; timeDesc = 'Déchet jeté en pleine nuit. Les chauves-souris veillent avec vous.'; timeUnlocked = true;
      }
  }

  // --- ASSEMBLAGE ---
  // Formatage final et retour du tableau d'objets standardisé. 
  // La propriété 'unlocked' consolide le calcul de validation des prérequis pour chaque badge.
  return [
    { 
      id: 'starter', name: 'Premier pas 🌱', description: 'Inscription au réseau éco-citoyen.', icon: 'fa-seedling', color: '#2ecc71', isPermanent: true, unlocked: true 
    },
    { 
      id: 'prog_friends', isProgressive: true, level: frLvl, name: frName, 
      description: 'Ajoutez des amis pour vous motiver ensemble.', // <- AJOUTÉ
      icon: frIcon, color: frColor, progressLabel: frLabel, progressPercent: frPercent, unlocked: frLvl > 0 
    },
    { 
      id: 'prog_weight', isProgressive: true, level: wtLvl, name: wtName, 
      description: 'Maintenez vos déchets mensuels sous le seuil critique.', // <- AJOUTÉ
      icon: wtIcon, color: wtColor, progressLabel: wtLabel, progressPercent: wtPercent, isDanger: wtDanger, unlocked: wtLvl > 0 
    },
    { 
      id: 'prog_min', isProgressive: true, level: minLvl, name: minName, 
      description: 'Réduisez le ratio de déchets par personne dans votre foyer.', // <- AJOUTÉ
      icon: minIcon, color: minColor, progressLabel: minLabel, progressPercent: minPercent, isDanger: minPercent > 80, unlocked: minLvl > 0 
    },
    { 
      id: 'prog_comp', isProgressive: true, level: compLvl, name: compName, 
      description: 'Grimpez dans le classement face à vos amis.', // <- AJOUTÉ
      icon: compIcon, color: compColor, progressLabel: compLabel, progressPercent: compPercent, unlocked: compLvl > 0 
    },
    { 
      id: 'prog_city', isProgressive: true, level: cityLvl, name: cityName, 
      description: 'Hissez-vous au sommet du classement public de la ville.', // <- AJOUTÉ
      icon: cityIcon, color: cityColor, progressLabel: cityLabel, progressPercent: cityPercent, unlocked: cityLvl > 0 
    },
    { 
      id: 'prog_sens', isProgressive: true, level: sensLvl, name: sensName, 
      description: 'Associez des capteurs OctoSystem à votre compte.', // <- AJOUTÉ
      icon: sensIcon, color: sensColor, progressLabel: sensLabel, progressPercent: sensPercent, unlocked: sensLvl > 0 
    },
    { 
      id: 'prog_streak', isProgressive: true, level: streakLvl, name: streakName, 
      description: 'Utilisez régulièrement votre poubelle (jours consécutifs).', // <- AJOUTÉ
      icon: streakIcon, color: streakColor, progressLabel: streakLabel, progressPercent: streakPercent, unlocked: streakLvl > 0 
    },
    { 
      id: 'easter_time', isProgressive: false, name: timeName, 
      description: timeDesc, // (Déjà géré dynamiquement dans le if/else)
      icon: timeIcon, color: timeColor, unlocked: timeUnlocked 
    }
  ];
};