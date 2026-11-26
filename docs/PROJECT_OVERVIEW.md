# Barakah Bepaar – Retail Management System
## Project Overview & Reverse Engineering Specification

### 1. Executive Summary
**Barakah Bepaar** is an enterprise-grade Supermarket and Hypermarket Retail Management System built to replace the legacy Windows desktop software known as **Vanigam 4.0 / Demo Retail Management Software – GST Version** (developed by Divine Infotechs / BG Software Solutions).

The target supermarket staff has operated the legacy Vanigam software in high-volume production for over a year. Consequently, muscle memory, keyboard shortcuts, field tab sequences, screen arrangements, and billing workflows are deeply ingrained. **Minimizing retraining is the paramount business objective.** 

The new software will reproduce the visual layout, screen density, field order, color hierarchy, and operational workflows of the legacy software with exact fidelity, while replacing the legacy backend with a modern, scalable, cross-platform, and offline-resilient architecture.

---

### 2. Source Evidence & Reverse Engineering Baseline
The system design is reverse engineered directly from:
1. **Primary Specification (`RETAIL SOFTWARE.pptx`)**: Complete 73-slide walkthrough exhibiting all main windows, menus, masters, transaction screens, popups, and reports.
2. **Supplemental Production Artifacts**: 10 high-resolution production screenshots capturing live retail operations, Tamil typography, barcode auto-complete dropdowns, customer lookups, multi-tender payment popups, and thermal POS receipt slips.
3. **Hardware & Operational Evidence**: Visual verification of weighing machine integration (`DISABLE W/M`), thermal printer receipt formatting (40-column ESC/POS layout), Sodexho denomination tallying, and Tamil character virtual palette (`Letters`).

---

### 3. Core Architectural Paradigm
The project adopts a modern cross-platform, multi-counter, offline-first architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Barakah Bepaar Desktop (Avalonia UI)                 │
│  - Pixel-identical legacy Vanigam UI                                   │
│  - Dense compact grids, bilingual labels (English/Tamil)               │
│  - Keyboard-driven POS workflow (F1, F5, F6, F7, F8, F11, F12, Ctrl+S) │
│  - Local Hardware Abstraction (ESC/POS, Weighing Scale, Barcode)       │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼ (Local Reads & Offline Outbox)   ▼ (API Requests & Sync)
┌───────────────────────────────────┐    ┌───────────────────────────────────┐
│       Local Terminal SQLite       │    │     Branch / Central Web API      │
│  - Fast cached product catalog    │    │  - ASP.NET Core Modular Monolith  │
│  - Local sequence generator       │    │  - Business logic & tax rules     │
│  - Durable Transactional Outbox   │    │  - Multi-counter coordinator      │
│  - Instant offline fallback       │    │  - SignalR live notifications     │
└───────────────────────────────────┘    └─────────────────┬─────────────────┘
                                                           │
                                                           ▼
                                         ┌───────────────────────────────────┐
                                         │       Central PostgreSQL DB       │
                                         │  - Authoritative inventory ledger │
                                         │  - Double-entry accounts ledger   │
                                         │  - Multi-branch synchronization   │
                                         └───────────────────────────────────┘
```

---

### 4. Non-Negotiable Operational Principles
1. **Zero UI Modernization Disruption**: Do not replace the compact grid forms with modern web SaaS cards, oversized whitespace, or accordion panels. Every button, label, shortcut hint, and alternating grid row must sit exactly where the cashier expects it.
2. **Durable Local Storage**: Every POS transaction is committed to ACID-compliant local storage prior to printing the receipt. Under no circumstance will a completed sale be lost due to network outage or power failure.
3. **Bilingual Fidelity**: Full support for English and Tamil product names, customer names, and receipt output. The `[ ] ENG` toggle must switch form labels seamlessly, exactly as observed in the legacy software.
4. **Hardware Reliability**: Support direct serial RS-232 weighing scale reading, barcode scanner keyboard emulation, and 2-inch / 3-inch ESC/POS thermal printers.
