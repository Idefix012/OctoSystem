// src/controllers/badgeEngine.js

export const calculateBadges = (totalKg, rank, friendsCount) => {
  return [
    {
      id: 'starter',
      name: 'Premier pas 🌱',
      description: 'Inscription au réseau éco-citoyen.',
      icon: 'fa-seedling',
      color: '#2ecc71', // Vert clair
      unlocked: true // Toujours débloqué
    },
    {
      id: 'zero_waste',
      name: 'Zéro Déchet 🕊️',
      description: 'Aucun déchet enregistré. La perfection !',
      icon: 'fa-leaf',
      color: '#1abc9c', // Turquoise
      unlocked: totalKg === 0
    },
    {
      id: 'expert_tri',
      name: 'Expert du Tri ♻️',
      description: 'Jeter moins de 5 kg dans le mois en cours.',
      icon: 'fa-recycle',
      color: '#27ae60', // Vert foncé
      unlocked: totalKg > 0 && totalKg <= 5
    },
    {
      id: 'lightweight',
      name: 'Poids Plume 🪶',
      description: 'Jeter moins de 15 kg dans le mois en cours.',
      icon: 'fa-feather',
      color: '#f1c40f', // Or
      unlocked: totalKg > 0 && totalKg <= 15
    },
    {
      id: 'social',
      name: 'Sociable 🤝',
      description: 'Avoir au moins 3 amis validés dans son réseau.',
      icon: 'fa-user-group',
      color: '#3498db', // Bleu
      unlocked: friendsCount >= 3
    },
    {
      id: 'influencer',
      name: 'Star du Quartier 🌟',
      description: 'Avoir 10 amis ou plus dans son réseau.',
      icon: 'fa-users-rays',
      color: '#e67e22', // Orange vif
      unlocked: friendsCount >= 10
    },
    {
      id: 'podium',
      name: 'Challenger 🥉',
      description: 'Atteindre le Top 3 de son classement mensuel.',
      icon: 'fa-award',
      color: '#d35400', // Bronze/Orange sombre
      unlocked: rank > 1 && rank <= 3 && friendsCount >= 2
    },
    {
      id: 'champion',
      name: 'Le Roi du Tri 👑',
      description: 'Être classé numéro 1 de son classement mensuel.',
      icon: 'fa-crown',
      color: '#9b59b6', // Violet
      unlocked: rank === 1 && friendsCount > 0
    }
  ];
};