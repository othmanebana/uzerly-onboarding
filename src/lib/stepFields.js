// ─── Définition des champs éditables pour chacune des 9 étapes ──────────────
// type: 'text' | 'textarea' | 'url' | 'date' | 'select' | 'file' | 'checkbox'
// owner hint: qui est principalement responsable (purement indicatif, tous peuvent éditer)

export const STEP_FIELDS = {
  1: {
    label: 'Création du client',
    hint: 'Informations de base du client, contrats et frais.',
    fields: [
      { key: 'url_site',        label: 'URL du site',           type: 'url',      placeholder: 'https://www.client.fr' },
      { key: 'bdc_url',         label: 'BDC signé (lien)',       type: 'url',      placeholder: 'Lien Drive / Notion…' },
      { key: 'setup_fee',       label: 'Frais de setup (€)',     type: 'text',     placeholder: '1200' },
      { key: 'crea_fee',        label: 'Frais créa (€)',         type: 'text',     placeholder: '0' },
      { key: 'min_billing',     label: 'Min. facturation (€)',   type: 'text',     placeholder: '500' },
      { key: 'test_duration',   label: 'Durée du test (mois)',   type: 'text',     placeholder: '4' },
      { key: 'launch_date_asp', label: 'Date lancement ASP',    type: 'date',     placeholder: '' },
      { key: 'notes_deal',      label: 'Notes deal',            type: 'textarea', placeholder: 'Contexte particulier, points à retenir…' },
    ],
  },
  2: {
    label: 'Création de la campagne',
    hint: 'Paramètres techniques et commerciaux de la campagne.',
    fields: [
      { key: 'campaign_name',   label: 'Nom de la campagne',    type: 'text',     placeholder: 'Décathlon_Email_FR_2024' },
      { key: 'url_site',        label: 'URL du site',           type: 'url',      placeholder: 'https://www.client.fr' },
      { key: 'solutions',       label: 'Solutions choisies',    type: 'text',     placeholder: 'Email Retargeting, Display…' },
      { key: 'sender_name',     label: 'Sender name (email)',   type: 'text',     placeholder: 'Décathlon' },
      { key: 'commission_type', label: 'Type de commission',    type: 'select',   options: ['% sur vente', 'Fixe / vente', 'CPC', 'Mensuel fixe'] },
      { key: 'commission_value',label: 'Valeur commission',     type: 'text',     placeholder: 'ex. 15%' },
      { key: 'budget_mensuel',  label: 'Budget média mensuel (€)', type: 'text', placeholder: '3000' },
      { key: 'reseaux_exclus',  label: 'Réseaux exclus',        type: 'text',     placeholder: 'ex. SEM, Facebook' },
    ],
  },
  3: {
    label: 'Informations commerciales',
    hint: 'Envoi des guides et éléments techniques au client.',
    fields: [
      { key: 'guide_integration_sent', label: 'Guide intégration envoyé', type: 'checkbox', placeholder: '' },
      { key: 'guide_url',       label: 'Lien guide intégration',  type: 'url',      placeholder: 'https://notion.so/…' },
      { key: 'requis_graphiques_sent', label: 'Requis graphiques envoyés', type: 'checkbox', placeholder: '' },
      { key: 'requis_url',      label: 'Lien requis graphiques', type: 'url',      placeholder: 'https://figma.com/…' },
      { key: 'notes_commerciales', label: 'Notes commerciales',  type: 'textarea', placeholder: 'Conditions spéciales, remarques…' },
      { key: 'date_envoi',      label: 'Date d\'envoi',          type: 'date',     placeholder: '' },
    ],
  },
  4: {
    label: 'Création des serveurs',
    hint: 'Mise en place de l\'infrastructure technique.',
    fields: [
      { key: 'serveur_cree',    label: 'Serveur créé',           type: 'checkbox', placeholder: '' },
      { key: 'date_creation',   label: 'Date de création',       type: 'date',     placeholder: '' },
      { key: 'env_url',         label: 'URL environnement',      type: 'url',      placeholder: 'https://…' },
      { key: 'acces_plateforme',label: 'Accès plateforme générés', type: 'checkbox', placeholder: '' },
      { key: 'notes_tech',      label: 'Notes techniques',       type: 'textarea', placeholder: 'Config serveur, points d\'attention…' },
    ],
  },
  5: {
    label: 'Accès plateforme & plan taggage',
    hint: 'Envoi des accès et du plan de taggage au client.',
    fields: [
      { key: 'email1_sent',     label: 'Email 1 (bienvenue) envoyé', type: 'checkbox', placeholder: '' },
      { key: 'date_email1',     label: 'Date envoi Email 1',     type: 'date',     placeholder: '' },
      { key: 'plan_taggage_url',label: 'Lien plan de taggage',   type: 'url',      placeholder: 'https://…' },
      { key: 'acces_login',     label: 'Login client',           type: 'text',     placeholder: 'client@email.fr' },
      { key: 'acces_url',       label: 'URL plateforme client',  type: 'url',      placeholder: 'https://app.uzerly.com/…' },
      { key: 'notes_am',        label: 'Notes AM',               type: 'textarea', placeholder: 'Remarques sur l\'envoi…' },
    ],
  },
  6: {
    label: 'Récupération plan taggage',
    hint: 'Le client retourne le plan de taggage complété.',
    fields: [
      { key: 'plan_recu',       label: 'Plan taggage reçu',      type: 'checkbox', placeholder: '' },
      { key: 'date_reception',  label: 'Date de réception',      type: 'date',     placeholder: '' },
      { key: 'plan_recu_url',   label: 'Lien plan reçu',         type: 'url',      placeholder: 'https://…' },
      { key: 'email2_sent',     label: 'Relance E2 envoyée (J+3)', type: 'checkbox', placeholder: '' },
      { key: 'email3_sent',     label: 'Relance E3 envoyée (J+7)', type: 'checkbox', placeholder: '' },
      { key: 'email4_sent',     label: 'Relance E4 envoyée (J+10)', type: 'checkbox', placeholder: '' },
      { key: 'email5_sent',     label: 'Relance E5 envoyée (J+14)', type: 'checkbox', placeholder: '' },
      { key: 'notes_relance',   label: 'Notes relance',          type: 'textarea', placeholder: 'Échanges avec le client…' },
    ],
  },
  7: {
    label: 'Setup éléments de campagne',
    hint: 'Intégration flux, pose des tags, check technique.',
    fields: [
      { key: 'flux_url',        label: 'Lien flux CSV/XML',       type: 'url',      placeholder: 'https://…/flux.xml' },
      { key: 'flux_check',      label: 'Flux vérifié (Tech)',     type: 'checkbox', placeholder: '' },
      { key: 'tags_poses',      label: 'Tags posés sur le site',  type: 'checkbox', placeholder: '' },
      { key: 'tags_check',      label: 'Tags vérifiés (Tech)',    type: 'checkbox', placeholder: '' },
      { key: 'creas_recues',    label: 'Créas reçues du client',  type: 'checkbox', placeholder: '' },
      { key: 'creas_url',       label: 'Lien créas',             type: 'url',      placeholder: 'https://drive.google.com/…' },
      { key: 'maquette_ok',     label: 'Maquette validée',       type: 'checkbox', placeholder: '' },
      { key: 'notes_setup',     label: 'Notes setup',            type: 'textarea', placeholder: 'Détails techniques, points bloquants…' },
    ],
  },
  8: {
    label: 'Call de setup',
    hint: 'Call de validation finale avec le client.',
    fields: [
      { key: 'date_call',       label: 'Date du call',           type: 'date',     placeholder: '' },
      { key: 'call_done',       label: 'Call effectué',          type: 'checkbox', placeholder: '' },
      { key: 'recap_envoye',    label: 'Email récap envoyé',     type: 'checkbox', placeholder: '' },
      { key: 'recap_url',       label: 'Lien email récap',       type: 'url',      placeholder: 'https://…' },
      { key: 'validation_client', label: 'Validation client obtenue', type: 'checkbox', placeholder: '' },
      { key: 'notes_call',      label: 'Notes du call',          type: 'textarea', placeholder: 'Décisions prises, points en suspens…' },
    ],
  },
  9: {
    label: 'Lancement campagne',
    hint: 'Go live et remontée des premières statistiques.',
    fields: [
      { key: 'date_lancement',  label: 'Date de lancement',      type: 'date',     placeholder: '' },
      { key: 'campagne_live',   label: 'Campagne en ligne',      type: 'checkbox', placeholder: '' },
      { key: 'stats_url',       label: 'Lien dashboard stats',   type: 'url',      placeholder: 'https://app.uzerly.com/stats/…' },
      { key: 'premiers_resultats', label: 'Premiers résultats',  type: 'textarea', placeholder: 'Impressions, clics, conversions J+1…' },
      { key: 'notes_lancement', label: 'Notes lancement',        type: 'textarea', placeholder: 'Observations, optimisations prévues…' },
    ],
  },
}
