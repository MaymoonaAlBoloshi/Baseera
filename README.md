# Baseera

Baseera is a cinematic, interactive virtual gallery built for independent artists.

## Live Experience

### [ENTER BASEERA](https://baseera-arts.netlify.app)

Open the live build and walk the gallery in real time.

It is not a static portfolio page pretending to be immersive. It is a real-time 3D space with atmosphere, movement, multilingual UX, responsive controls, and a distinct identity per artist collection.

## What Makes It Special

- Real-time 3D gallery built on a modern WebGL rendering stack
- Curated landing flow with language and audio onboarding
- Arabic and English support with direction-aware UI behavior
- Ghost-style holographic characters and proximity-based visual effects
- Dynamic artist galleries with their own visual mood and environment tuning
- Mobile-first interaction model with touch movement/look controls
- Adaptive quality path for lower-end devices
- Contextual soundscape, including optional landing audio and stage audio behavior

The result is a digital exhibition space that feels designed, not assembled.

## Feature Highlights

### 1. Guided Cinematic Entry

The landing experience is intentionally paced, with progressive onboarding steps and smooth visual transitions into the gallery world.

### 2. Immersive Navigation

- Desktop: pointer-lock style movement
- Mobile: dual-zone touch controls for motion and camera look
- Proximity interactions that react to where the user stands and what they face

### 3. Artist-Centric Exploration

- Selection mode to discover artists
- Artist mode to dive into collection-specific spaces
- Artwork overlays with metadata, poetry, and support interactions

### 4. Atmosphere and Effects

- Shader-driven walls and flooring treatment
- Holographic ghost rendering pipeline for stage and proximity figures
- Proximity-aware glow behavior and animation cues

## Tech Stack

- React 19
- TypeScript
- Vite
- WebGL-based 3D rendering pipeline
- Reusable scene utilities and interaction helpers
- Framer Motion
- i18next
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure (High Level)

- src/screens/Landing: onboarding, atmospheric entry scene, and UI flow
- src/screens/Gallary: main 3D gallery, controls, artwork systems, and environment
- src/i18n: language resources and localization config
- public/art, public/audio, public/models: static media and 3D assets

## Deployment

This project is ready for static deployment. A Netlify configuration is already present.

Typical flow:

1. Build using npm run build
2. Deploy the dist output to your static host

## Future optimization

Dude, it can run on a T460 just fine.. BUTT we can convert FBX models to GLB (a more compressed file format), preload assets during the onboarding screen, and maybe spawn items on proximity to optimize GPU usage, just in case you want to run this on a microwave.

## Why Baseera Exists

It's a POC for an interactive gallery. If I have enough willpower, I'll add a backend with WebSockets for real-time visitors, an audio commentary experience, and actual fundraising support for artists.

## Wanna collab for the next big thing

Reach out ;)
