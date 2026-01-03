/**
 * Traductions françaises pour le site vitrine Astro
 */
export const fr = {
  header: {
    explorer: 'Explorer',
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    openApp: "Ouvrir l'app",
    profile: 'Profil',
    settings: 'Paramètres',
    menu: {
      trends: {
        title: 'Tendances',
        description:
          'Découvrez les jeux, films et séries qui font le buzz en ce moment (Top ELO).',
      },
      games: {
        title: '🎮 Jeux Vidéo',
        description: 'Explorez notre collection de jeux culte.',
      },
      movies: {
        title: '🎬 Films & Séries',
        description: 'Les grands classiques du cinéma.',
      },
      books: {
        title: '📚 Livres',
        description: 'Les œuvres littéraires incontournables.',
      },
    },
  },
  home: {
    hero: {
      title: 'Trouvez vos prochains favoris culturels',
      subtitle:
        'Swipez, votez, découvrez. Metacult vous aide à construire votre profil culturel unique.',
      cta: 'Commencer gratuitement',
    },
  },
} as const;

export type HeaderLabels = typeof fr.header;
