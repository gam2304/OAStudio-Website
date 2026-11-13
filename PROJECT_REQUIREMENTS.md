web application/stitch/projects/18165841771949504189/screens/10771dff263c44d28fabfebe656c0bcb
# Product Requirements Document (PRD) & Executive Project Brief
**Project:** OA Architecture & Design Digital Platform & BIM Ecosystem  
**Client / Brand:** OA Architecture & Design  
**Founder & Principal:** Oussama Attia  
**Document Version:** 1.0.0  
**Status:** Approved & Live on Canvas

---

## 1. Executive Summary & Brand Vision

**OA Architecture & Design** is an international architectural practice led by architect Oussama Attia (ENAU graduate, BIM & AI integration pioneer). The studio operates at the nexus of monumental permanence, poetic silence, and advanced computational execution.

The purpose of this digital ecosystem is to transcend standard corporate portfolio sites by crafting an **award-winning, editorial magazine experience** reminiscent of *Foster + Partners*, *BIG*, *ArchDaily Premium*, and *Apple*. It serves high-net-worth individuals, institutional developers, and cultural institutions seeking monumental luxury projects, while providing an internal, secure **BIM Management Dashboard & Backlog Console** for practice operations.

---

## 2. Core Strategic Objectives

1. **Award-Winning Visual Polish:** Deliver an Awwwards / Apple-grade aesthetic characterized by monolithic dark luxury, cinematic typography, generous negative space, and architectural storytelling.
2. **Exhibition of Technical Rigor:** Showcase not only final renders and photography, but also parametric sketches, LOD 400/500 BIM execution, computational blueprints, and interactive massing studies.
3. **High-Value Lead Acquisition:** Funnel prospective luxury clients into a frictionless, confidential consultation pipeline with budget filtering and multi-node office routing (Paris, Dubai, Tokyo).
4. **Unified Operations Backlog:** Provide a centralized administrative portal for studio leads, BIM coordinators, and partners to track active workflows, model syncs, team assignments, and client inquiries.

---

## 3. Brand Identity & Design System: *Atelier Monolith*

- **Color Architecture:**
    - `Deep Black (#0A0A0A / #0F0E0B)`: Foundational surface evoking granite, volcanic stone, and atmospheric shadows.
    - `Warm White (#F7F5F2)`: Clean, crisp contrast for typography, architectural clarity, and precise line work.
    - `Bronze / Muted Gold Accent (#B28C5A)`: Understated luxury used for interactive nodes, highlights, and status accents.
    - `Stone Gray (#D9D5CF / #1C1C18)`: Secondary architectural framing, borders, and structural cards.
- **Typography:**
    - *Headlines & Display:* Editorial Serif (`Playfair Display`), italicized editorial accents for poetic emphasis.
    - *Body & Technical Interface:* Ultra-clean modern sans-serif with wide letter-spacing on technical captions (`font-mono` / uppercase tracking for coordinates, LOD levels, and dates).
- **Spatial Rhythm:**
    - Fullscreen cinematic viewports, generous gutters (`px-margin-desktop`), and deliberate asymmetry mimicking architectural facades.

---

## 4. Information Architecture & Screen Breakdown

### Screen 1: Cinematic Homepage
- **Hero Experience:** Full-bleed cinematic architectural visuals featuring cliffside residential flagships with transparent floating header.
- **Brand Statement:** *"Architecture Beyond Boundaries"* statement block emphasizing light, void, and material permanence.
- **Studio Metrics:** Minimalist counter grid highlighting `15+ Countries`, `200+ Projects`, and `12 Design Awards`.
- **Curated Works Carousel:** Featured fluid pavilions and cultural spaces with slide navigation controls.
- **Philosophy Module:** *"The Silence of Materials"* — Site Specificity, Geometric Rigor, and Sustainable Longevity.

### Screen 2: Portfolio Gallery (*Archive of Form*)
- **Layout:** Editorial masonry grid displaying diverse typologies (Residential, Commercial, Luxury Villas, Mixed-Use, International).
- **Interactive Filtering:** Instant categorical navigation allowing seamless curation of urban skyscrapers, concrete monoliths, and minimalist interiors.
- **Progressive Unveiling:** Infinite architectural archive with subtle progress indicators.

### Screen 3: Project Detail (*The Obsidian Villa*)
- **Narrative Section:** Editorial deep dive into the design philosophy, light studies, and material palette.
- **Conceptual Blueprints & Massing:** Dual comparative showcase featuring hand-drawn site plans alongside structural physical massing studies.
- **BIM & Computational Integration:** Technical card highlighting LOD 400 tolerances (0.2mm precision) and A+++ energy performance ratings.
- **Interactive 3D / Wireframe BIM Model:** High-contrast wireframe CAD/BIM model viewport for structural transparency.
- **Related Works Carousel:** Cross-linking to adjacent cultural and residential works (e.g., Fjord Pavilion, Musaic Art Center).

### Screen 4: The Studio & Founder Profile (*Oussama Attia*)
- **Executive Spotlight:** High-contrast portrait of Oussama Attia paired with his academic and professional pedigree (ENAU Academy, European practice, computational BIM & AI integration).
- **Evolutionary Timeline:** Chronological narrative tracing foundations from parametric theory in Tunis (2012) to advanced BIM integration (2018–present).
- **Distinctions & Accreditations:** Architectural Digest 40 Under 40, Autodesk Revit Certified Professional, LEED AP BD+C, Lux Design Awards.
- **Studio Manifesto:** Editorial full-width architectural quote framing studio models in dusk light.

### Screen 5: Inquire (*Global Partnership & Strategic Nodes*)
- **Consultation Gateway:** Tailored form capturing project typologies, global jurisdictions, budget thresholds ($2M to $10M+ slider), and technical BIM requirements.
- **Global Studio Epicenters:** Dedicated node cards and geolocation coordinates for Paris (EU HQ), Dubai (MENA Hub), and Tokyo (Asia Pacific).
- **Interactive Global Map Frame:** Geolocation pin interface for client office orientation.

### Screen 6: BIM Management Dashboard (*Admin Console & Backlog*)
- **Key Health Metrics:** High-level executive KPI cards tracking Project Health (94.2%), Qualified Inquiries (28 active), and BIM Sync status across 18 models.
- **Active Workflows (Backlog Engine):** Real-time table logging Project IDs (Obsidian House, Pavilion Noir, Helix Tower), geographic location, LOD stage (LOD 300 to LOD 500), and completion progress.
- **Recent Uploads & Artifact Vault:** Rapid repository for RVT structural models, 4K presentation renders, and specification packets.
- **Studio Team Assignments:** Direct personnel allocation mapping BIM coordinators and design leads to active commissions.

---

## 5. Technical & Interaction Requirements

1. **Responsiveness:** Fluid scaling across ultra-wide architectural monitors (4K / 1440p) down to mobile executive viewports.
2. **Animation Feel:** GSAP-like silky smooth inertia scrolling, subtle opacity fade-ins on scroll reveal, and micro-hover expansions on gallery tiles.
3. **Performance:** Lazy loading for high-resolution photography, optimized SVG asset delivery, and sub-100ms UI responses on administrative filtering.
4. **Security & Data Isolation:** Role-based access for the Admin Console ensuring client inquiries, proprietary RVT models, and cost estimates remain strictly private.

---

## 6. Implementation Roadmap & Milestones

- **Phase 1 (Completed):** Design System definition (`Atelier Monolith`), visual identity generation, and 6 core flagship screens.
- **Phase 2 (Current):** Project Brief and PRD sign-off; visual asset integration for expanded gallery typologies.
- **Phase 3 (Next Steps):**
    - Interactive WebGL/Three.js 3D BIM model viewer integration on project detail pages.
    - Development of a "Journal / Thought Leadership" publication template for architectural essays.
    - Multi-language localization (English, French) for key international hubs.