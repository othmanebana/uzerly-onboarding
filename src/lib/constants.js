// ─── Status config ───────────────────────────────────────────────────────────
export const STATUS_CONFIG = {
  done:    { label: 'Terminé',    badge: 'bg-green-100 text-green-700',  dot: 'bg-success' },
  doing:   { label: 'En cours',   badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
  wait:    { label: 'En attente', badge: 'bg-blue-100 text-blue-700',    dot: 'bg-info' },
  blocked: { label: 'Bloqué',     badge: 'bg-red-100 text-red-700',      dot: 'bg-error' },
  todo:    { label: 'À faire',    badge: 'bg-gray-100 text-gray-500',    dot: 'bg-border' },
}

// ─── Mock clients ─────────────────────────────────────────────────────────────
export const MOCK_CLIENTS = [
  {
    id: '1', name: 'Décathlon FR', initials: 'DF',
    solutions: ['Email', 'Display'], progress: 78, status: 'doing',
    steps_done: 7, steps_total: 9, am: 'Julie M.', sales: 'Pierre R.',
    setup: 1200, min_billing: 500, budget: 3000,
    country: 'France', city: 'Villeneuve-d\'Ascq',
  },
  {
    id: '2', name: 'Fnac Darty', initials: 'FD',
    solutions: ['OnSite'], progress: 35, status: 'wait',
    steps_done: 3, steps_total: 9, am: 'Marc T.', sales: 'Sophie L.',
    setup: 800, min_billing: 300, budget: 1500,
    country: 'France', city: 'Ivry-sur-Seine',
  },
  {
    id: '3', name: 'La Redoute', initials: 'LR',
    solutions: ['Email'], progress: 92, status: 'doing',
    steps_done: 8, steps_total: 9, am: 'Julie M.', sales: 'Pierre R.',
    setup: 900, min_billing: 400, budget: 2000,
    country: 'France', city: 'Roubaix',
  },
  {
    id: '4', name: 'Galeries Lafayette', initials: 'GL',
    solutions: ['Display', 'OnSite'], progress: 12, status: 'blocked',
    steps_done: 1, steps_total: 9, am: 'Nadia K.', sales: 'Tom B.',
    setup: 1500, min_billing: 700, budget: 5000,
    country: 'France', city: 'Paris',
  },
  {
    id: '5', name: 'Sephora EU', initials: 'SE',
    solutions: ['Email'], progress: 55, status: 'doing',
    steps_done: 5, steps_total: 9, am: 'Marc T.', sales: 'Sophie L.',
    setup: 1100, min_billing: 600, budget: 4000,
    country: 'France', city: 'Neuilly-sur-Seine',
  },
]

// ─── Onboarding steps template ────────────────────────────────────────────────
export const ONBOARDING_STEPS_TEMPLATE = [
  { id: 1, title: 'Création du client',            owner: 'Sales',      duration: 'J0',     desc: 'Fiche client, upload BDC obligatoire, frais de setup' },
  { id: 2, title: 'Création de la campagne',        owner: 'Sales/AM',   duration: 'J1',     desc: 'URL site, nom campagne, solutions, commission' },
  { id: 3, title: 'Informations commerciales',      owner: 'Sales',      duration: 'J1',     desc: 'Guide intégration technique, requis graphiques' },
  { id: 4, title: 'Création des serveurs',          owner: 'Tech',       duration: 'J2',     desc: 'Mise en place infrastructure technique' },
  { id: 5, title: 'Accès plateforme & plan taggage',owner: 'AM',         duration: 'J3',     desc: 'Email 1 – bienvenue + checklist envoyé' },
  { id: 6, title: 'Récupération plan taggage',      owner: 'Client',     duration: 'J3–J10', desc: 'Relances E2 J+3, E3 J+7, E4 J+10, E5 J+14' },
  { id: 7, title: 'Setup éléments de campagne',     owner: 'AM/Tech',    duration: 'J7',     desc: 'Flux, tags, matériel créa, check technique' },
  { id: 8, title: 'Call de setup',                  owner: 'Sales/AM',   duration: 'J8',     desc: 'Validation finale + email récap client' },
  { id: 9, title: 'Lancement campagne',             owner: 'AM/Tech',    duration: 'J14',    desc: 'Go live + remontée stats sur la plateforme' },
]

// ─── Email templates ──────────────────────────────────────────────────────────
export const EMAIL_TEMPLATES = [
  {
    id: 1, tag: 'E1', label: 'Bienvenue & Checklist', delay: 'J+0 (2h après call)',
    subject: 'Bienvenue chez Uzerly – Voici les prochaines étapes',
    body: `Bonjour [Prénom],\n\nMerci encore pour votre confiance. Nous avons hâte de lancer votre onboarding dans les meilleures conditions.\n\nPour cela, voici les premiers éléments dont nous avons besoin de votre part :\n\n🔹 Intégration des tags sur votre site\n🔹 Envoi du flux produit\n🔹 Exemples de newsletters ou assets marketing\n\nRetrouvez ici la checklist complète : [lien]\n\nÀ votre dispo si vous avez la moindre question.\n\nBien cordialement,`,
  },
  {
    id: 2, tag: 'E2', label: 'Relance douce', delay: 'J+3',
    subject: 'Besoin d\'aide pour avancer sur l\'onboarding ?',
    body: `Bonjour [Prénom],\n\nNous n\'avons pas encore reçu les premiers éléments nécessaires à la suite de l\'onboarding.\n\nN\'hésitez pas à revenir vers nous si vous avez besoin d\'un modèle, d\'un exemple ou d\'un point rapide.\n\n✅ Checklist à jour ici : [Lien]\n📅 Nous pouvons aussi caler un créneau : [Lien Calendly]\n\nÀ très vite,`,
  },
  {
    id: 3, tag: 'E3', label: 'Relance progression', delay: 'J+7',
    subject: 'Votre onboarding est en attente – on avance ensemble ?',
    body: `Bonjour [Prénom],\n\nPour rappel, nous attendons toujours les éléments suivants :\n• [Flux produit]\n• [Tags à poser]\n\nSans ces éléments, nous ne pouvons pas enclencher les prochaines étapes.\n\nBesoin d\'assistance ? On est là : [Lien prise de RDV]\n\nBien cordialement,`,
  },
  {
    id: 4, tag: 'E4', label: 'Relance blocage', delay: 'J+10',
    subject: 'Votre onboarding est en pause – besoin d\'un point rapide ?',
    body: `Bonjour [Prénom],\n\nNous constatons que l\'onboarding est toujours bloqué à cette étape : [Nom de l\'étape].\n\nSans retour de votre part, nous ne pourrons pas garantir le planning initialement prévu.\n\n👉 Proposer un créneau : [Calendly]\n\nBien cordialement,`,
  },
  {
    id: 5, tag: 'E5', label: 'Dernier appel', delay: 'J+14',
    subject: 'Toujours pas de nouvelles – mettons-nous l\'onboarding en pause ?',
    body: `Bonjour [Prénom],\n\nNous revenons une dernière fois vers vous avant de mettre officiellement l\'onboarding en pause.\n\nNous n\'avons toujours pas reçu : [Éléments manquants]\n\nSi vous souhaitez relancer la machine, nous sommes évidemment disponibles.\n\nMerci de nous confirmer si vous souhaitez poursuivre,\n\nBien cordialement,`,
  },
]
