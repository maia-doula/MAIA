# MAIA — Maternal Artificial Intelligence Assistant

> **An AI-powered doula and virtual midwife providing real-time, multimodal maternal support — built to reduce racial disparities in maternal healthcare.**

https://docs.google.com/document/d/1-2osDmxH38tccI5PsSweYSBbO1k-NnUI8dAWa8yskpg/edit?usp=sharing
---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Product Goals](#product-goals)
- [Target Users](#target-users)
- [Core Features](#core-features)
- [Equity & Disparity Mitigation](#equity--disparity-mitigation)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [3-Day Build Plan](#3-day-build-plan)
- [Demo Scenario](#demo-scenario)

---

## Overview

MAIA is a real-time multimodal AI assistant designed to support pregnant and postpartum mothers. It provides live voice conversation, vision assistance, and labor tracking to help mothers make informed decisions before going to the hospital and during postpartum recovery.

MAIA intentionally addresses racial disparities in maternal healthcare — particularly for Black mothers and other underserved communities — by delivering 24/7 accessible, culturally aware maternal guidance.

---

## Problem Statement

Maternal health disparities remain a major challenge in the United States:

- Black mothers are significantly more likely to experience severe complications during pregnancy and childbirth compared to other populations.
- Disparities are driven by unequal access to care, implicit bias in healthcare, lack of postpartum support, and delayed recognition of warning signs.
- Many mothers — especially those in rural areas or low-income households — have no access to a doula or real-time support during early labor or postpartum recovery.

MAIA addresses these gaps by providing immediate educational guidance, early detection of warning signs, self-advocacy support, and accessible maternal guidance around the clock.

---

## Product Goals

- Provide real-time maternal support through voice conversation
- Help users identify early warning signs of complications
- Assist mothers in tracking labor progress
- Offer postpartum support and check-ins
- Empower users with tools for advocating for their healthcare needs
- Provide culturally aware and inclusive maternal health guidance

---

## Target Users

**Primary**
- First-time mothers
- Mothers without access to doulas
- Mothers in rural or underserved areas
- Black mothers and other populations affected by maternal health disparities

**Secondary**
- Partners supporting the mother
- Community health workers
- Doulas and midwives

---

## Core Features

| Feature | Description |
|---|---|
| 🎙️ **Real-Time AI Doula** | Live voice agent for conversational maternal support |
| ⏱️ **Contraction Tracking** | Log and interpret contraction patterns with AI analysis |
| 📷 **Vision-Based Assistance** | Camera input for visual guidance and symptom observation |
| 🤱 **Postpartum Support** | Check-ins and recovery guidance after birth |
| 📣 **Advocacy Assistance** | Tools to help mothers self-advocate in healthcare settings |
| ⚠️ **Early Warning Detection** | Symptom escalation detection with safety guardrails |

---

## Equity & Disparity Mitigation

MAIA incorporates design elements specifically intended to reduce racial and socioeconomic disparities in maternal health outcomes:

- **Symptom Escalation Bias Protection** — Safety protocols designed to surface warning signs regardless of how symptoms are described
- **Advocacy Support** — Generates questions and scripts to help mothers communicate effectively with providers
- **Culturally Aware Communication** — Inclusive language and context-sensitive guidance
- **Access to Education** — Provides health literacy resources regardless of location or insurance status

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, shadcn/ui, Framer Motion |
| **AI SDK** | [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) — Google GenAI SDK |
| **AI Model** | Gemini 1.5 Flash (`gemini-1.5-flash-latest`) — text + multimodal (vision) |
| **Voice Layer** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Data Layer** | localStorage (client-side, no backend required for demo) |
| **Cloud Infrastructure** | Google Cloud Platform (planned: Cloud Run, Firestore, Cloud Storage) |

---

## Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and add your Gemini API key:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

You can obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

3. Start the development server:

```bash
npm run dev
```

> **Note:** The app runs without a backend. All data is stored in the browser's localStorage. If `VITE_GEMINI_API_KEY` is not set, the AI chat will return a friendly configuration message instead of an AI response.

---

## System Architecture

```
User Device (Microphone + Camera)
        │
        ▼
  Web App (React)
        │
        ▼
 Gemini Live API
        │
        ▼
 AI Doula Agent Logic
        │
        ▼
Google Cloud Backend
(Cloud Run · Firestore · Cloud Storage)
```

---

## 3-Day Build Plan

### Day 1 — Live Voice Agent
**Goal:** Real-time voice AI doula conversation

| # | Frontend | Backend | AI Agent |
|---|---|---|---|
| 1 | Create Web App | Set up Google Cloud project | Write the AI Doula System Prompt |
| 2 | Build Voice Input | Create backend server | Implement Symptom Detection Logic |
| 3 | Add Voice Output | Build Gemini Live API connection | Design conversation flows |
| 4 | Build Chat UI | Write AI Doula system prompt | Implement advocacy assistant logic |
| 5 | Add contacts section, update READMEs & logs | Create streaming endpoint | Update system prompt to include contact escalation capability |

**Deliverable:** A live doula that can listen, respond verbally, and answer questions.

---

### Day 2 — Vision + Doula Intelligence (Multimodal Features)
**Goal:** Vision input + contraction tracking

| # | Frontend | Backend | AI Agent |
|---|---|---|---|
| 1 | Build Contraction Timer UI | Create firestore database | Implement labor interpretation |
| 2 | Add Camera Input | Create contraction tracking API | Add racial equity safety logic |
| 3 | Create Vision Interaction UI | Send Contraction Data to Gemini | Implement image analysis prompts |
| 4 | Build Dashboard Layout | Add safety guardrails | Symptom escalation detection |
| 5 | Add quick notification button during labor | Add labor pattern detection | Create AI-generated and voice-triggered contact alerts |

**Deliverable:** A multimodal agent supporting voice interaction, camera input, contraction tracking, and labor pattern interpretation.

---

### Day 3 — Polish + Demo Experience
**Goal:** Hackathon-ready live demo, deployment-ready

| # | Frontend | Backend | AI Agent |
|---|---|---|---|
| 1 | Polish UI | Deploy backend to Cloud Run | Implement breating coaching | 
| 2 | Add Breathing Animation | Add advocacy assistant prompts | Create advocacy assistant |
| 3 | Add AI-generated message preview | Add Postpartum Check-In Logic | Add postpartum support prompts |
| 4 | Add animation UI elements | Optimize AI response flow | Optimize AI Response Flow |
| 5 | Record Demo Video | Implement Symptom Summary Generator | Implement advocacy summaries for healthcare providers |

**Deliverable:** Finished MVP that meets all requirements.

---

## Demo Scenario

1. User speaks to the AI doula
2. AI responds in real time
3. User logs contractions → Voice and conversational reporting
4. AI interprets labor progress
5. User shows camera input
6. AI provides visual guidance
7. AI generates questions for the user to ask their doctor

---

> *MAIA is built with the belief that every mother deserves safe, informed, and supported care — regardless of race, geography, or income.*
