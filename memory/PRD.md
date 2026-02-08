# NoorVision - Islamic AI Dream Interpretation Tool

## Original Problem Statement
Build NoorVision: an Islamic AI dream interpretation tool. The site should be interactive, user-friendly, and focused on text-based dream interpretation. Include all disclaimers and make it clear this is educational and reflective only, not professional Islamic advice. The AI should provide interpretations rooted in classical Islamic sources and hadith, track patterns across dreams, categorize dreams, and provide actionable guidance.

## User Personas
1. **Muslim Dreamers** - Individuals seeking spiritual guidance through dream interpretation
2. **Islamic Studies Enthusiasts** - Users interested in classical Islamic scholarship on dreams
3. **Spiritual Seekers** - People looking for reflective tools aligned with Islamic principles

## Core Requirements (Static)
- [x] Dream Input Section - Text-based dream submission
- [x] AI Dream Interpretation - GPT-5.2 powered analysis
- [x] Classical Sources - Ibn Sirin, Al-Nabulsi, hadith references
- [x] Dream Categorization - Ru'ya (Good), Hulm (Bad), Ambiguous
- [x] Source Transparency - Citations for every interpretation
- [x] Pattern Tracking - Opt-in recurring symbol analysis
- [x] Guidance Section - Du'as, reflective advice, preventive tips
- [x] Disclaimers - Educational tool only, not religious advice
- [x] User Authentication - JWT-based custom auth
- [x] Privacy First - Secure, opt-in storage

## What's Been Implemented (Jan 7, 2026)
### Backend (FastAPI + MongoDB)
- User authentication (register, login, JWT tokens)
- Dream interpretation API with GPT-5.2 via Emergent LLM
- Dream history and retrieval endpoints
- Pattern analysis with recurring symbol detection
- Source citations in AI responses

### Frontend (React + Tailwind)
- Landing page with Islamic geometric design
- Dark theme with gold accents (Cinzel Decorative font)
- Registration/Login pages
- Dashboard with dream statistics
- Dream input page with disclaimer
- Interpretation result page (symbols, guidance, sources)
- Pattern analysis page with visualizations

### Design System
- "The Midnight Scholar" visual identity
- Colors: Midnight Blue (#020617), Gold (#D4AF37)
- Glass-morphism cards with gold glow effects
- Category badges: Green (Ru'ya), Red (Hulm), Gray (Ambiguous)

## Prioritized Backlog
### P0 (Critical) - COMPLETED
- [x] User authentication
- [x] Dream submission and AI interpretation
- [x] Source citations display
- [x] Disclaimers

### P1 (Important)
- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Export dreams to PDF/text file
- [ ] Multiple language support (Arabic)

### P2 (Nice to Have)
- [ ] Daily motivational du'as/verses
- [ ] Dream sharing (privacy-respecting)
- [ ] Community interpretations (opt-in)
- [ ] Mobile app version

## Technology Stack
- **Frontend**: React 19, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI, Python 3.11
- **Database**: MongoDB
- **AI**: GPT-5.2 via Emergent LLM integration
- **Auth**: JWT tokens with bcrypt hashing

## Next Tasks
1. Add email verification for enhanced security
2. Implement password reset flow
3. Add Arabic language support
4. Create PDF export for dream journal
