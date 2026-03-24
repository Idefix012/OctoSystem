// src/controllers/badgeEngine.js

export const calculateBadges = (totalKg, rank, friendsCount) => {
  // On définit les règles de déblocage pour chaque badge
  return [
    {
      id: 'starter',
      name: 'Premier pas 🌱',
      description: 'Inscription au réseau éco-citoyen.',
      icon: 'fa-seedling',
      color: '#2ecc71', // Vert
      unlocked: true // Toujours débloqué par défaut
    },
    {
      id: 'lightweight',
      name: 'Poids Plume 🪶',
      description: 'Jeter moins de 15 kg dans le mois en cours.',
      icon: 'fa-feather',
      color: '#f1c40f', // Or
      // Débloqué si on a jeté quelque chose, mais moins de 15kg
      unlocked: totalKg > 0 && totalKg <= 15 
    },
    {
      id: 'social',
      name: 'Influenceur Vert 🌍',
      description: 'Avoir au moins 3 amis validés dans son réseau.',
      icon: 'fa-users',
      color: '#3498db', // Bleu
      unlocked: friendsCount >= 3
    },
    {
      id: 'champion',
      name: 'Le Roi du Tri 👑',
      description: 'Être classé numéro 1 de son classement mensuel.',
      icon: 'fa-crown',
      color: '#9b59b6', // Violet
      // Débloqué uniquement si on est 1er (et qu'il y a plus d'une personne dans le classement)
      unlocked: rank === 1 && friendsCount > 0 
    }
  ];
};