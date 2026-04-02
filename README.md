# Uzerly Onboarding Platform

Application React + Vite + Tailwind CSS + Supabase pour gérer l'onboarding des clients Uzerly.

---

## Stack

- **React 18** + **Vite 5**
- **Tailwind CSS 3**
- **Supabase** (Auth, Database, Storage)
- **Lucide React** (icônes)
- **Vercel** (déploiement)

---

## Installation locale

```bash
# 1. Cloner le repo
git clone https://github.com/VOTRE_ORG/uzerly-onboarding.git
cd uzerly-onboarding

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# → Remplir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 4. Lancer en dev
npm run dev
```

---

## Variables d'environnement

```
VITE_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=VOTRE_ANON_KEY
```

Ces clés se trouvent dans votre dashboard Supabase → **Project Settings → API**.

---

## Déploiement Vercel

1. Pusher le code sur GitHub
2. Importer le repo dans [vercel.com](https://vercel.com)
3. Ajouter les variables d'environnement dans **Settings → Environment Variables**
4. Cliquer **Deploy** — Vercel détecte automatiquement Vite

---

## Schéma Supabase (déjà créé)

```sql
-- clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  city text,
  phone text,
  activity_desc text,
  setup_fee numeric default 0,
  min_billing numeric default 0,
  bdc_url text,
  am text,
  sales text,
  created_at timestamptz default now()
);

-- campaigns_config
create table campaigns_config (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients on delete cascade,
  solution text not null,
  sender_name text,
  commission_type text,
  commission_value numeric,
  monthly_budget numeric,
  networks text,
  excluded_networks text,
  created_at timestamptz default now()
);

-- onboarding_steps
create table onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients on delete cascade,
  step_number int not null,
  title text not null,
  owner text,
  status text default 'todo',
  duration_label text,
  description text,
  updated_at timestamptz default now()
);

-- email_scenarios
create table email_scenarios (
  id uuid primary key default gen_random_uuid(),
  tag text,
  label text,
  delay_days int,
  subject text,
  body text,
  trigger_condition text,
  created_at timestamptz default now()
);
```

---

## Structure du projet

```
src/
├── components/
│   ├── UI.jsx            # Composants réutilisables (Button, Card, Badge…)
│   ├── Sidebar.jsx       # Navigation latérale
│   └── SmartAssistant.jsx # Chat assistant IA
├── pages/
│   ├── PipelinePage.jsx  # Vue pipeline admin (drag & drop)
│   ├── NewClientPage.jsx # Formulaire nouveau client
│   ├── EmailsPage.jsx    # Gestionnaire emails
│   ├── APIPage.jsx       # API & exports JSON/CSV
│   ├── ClientDetailPage.jsx # Détail client (vue admin + override)
│   └── ClientView.jsx    # Interface client (timeline, fichiers, infos)
├── lib/
│   ├── supabase.js       # Client Supabase
│   └── constants.js      # Statuts, données mock, templates emails
├── styles/
│   └── globals.css       # Design tokens + Tailwind
├── App.jsx               # Routing principal + toggle Admin/Client
└── main.jsx              # Point d'entrée React
```

---

## Fonctionnalités

### Vue Admin
- **Pipeline** — tableau de tous les clients, drag & drop pour prioriser, statuts en temps réel
- **Nouveau client** — formulaire complet avec config par solution (Email/Display/OnSite)
- **Emails** — visualisation du scénario E1→E5, édition des templates
- **API & Exports** — métriques globales, payload webhook, export JSON/CSV
- **Détail client** — override des statuts par étape, Smart Assistant

### Vue Client
- **Hero** avec barre de progression
- **Smart Assistant** alimenté par les données onboarding
- **Timeline** interactive avec statuts visuels
- **Fichiers** — upload BDC/NDA/K-Bis avec drag & drop
- **Infos** — récapitulatif commercial de la campagne
