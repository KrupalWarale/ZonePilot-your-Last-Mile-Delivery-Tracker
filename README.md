<h1 align="center">ZonePilot-your-Last-Mile-Delivery-Tracker</h1>

<p align="center">
  <a href="#-about">About</a> •
  <a href="#-features">Features</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-rate-engine">Rate Engine</a> •
  <a href="#-api-docs">API</a> •
  <a href="#-demo">Demo</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

---

## <img src="https://img.icons8.com/fluency/48/000000/info.png" width="24" style="vertical-align:middle"/> About

**ZonePilot** is an intelligent last-mile delivery management platform built for the modern logistics ecosystem. It automates pricing with zone-aware rate cards, assigns delivery agents intelligently, and keeps customers informed at every step — from pickup to doorstep.

> Built for **Unthinkable Solutions**

---

## <img src="https://img.icons8.com/fluency/48/000000/idea.png" width="24" style="vertical-align:middle"/> Features

### <img src="https://img.icons8.com/fluency/24/000000/key-security.png" width="20" style="vertical-align:middle"/> Multi-Role Authentication

| Role | Capabilities |
|---|---|
| **Customer** | Register, login, create orders, track live, reschedule failed deliveries |
| **Delivery Agent** | Update statuses, view assigned orders, mark availability |
| **Admin** | Full control — create orders, manage zones/rate cards, assign agents, override statuses, filter & monitor all orders |

### <img src="https://img.icons8.com/fluency/24/000000/calculator.png" width="20" style="vertical-align:middle"/> Smart Rate Calculation Engine

- **Zone Detection** — Auto-detects pickup & drop zones from addresses
- **Volumetric Weight** — `L × B × H ÷ 5000`, billed on higher of actual vs volumetric
- **Rate Card Lookup** — Separate B2B & B2C rates for intra-zone & inter-zone
- **COD Surcharge** — Configurable per order type, applied automatically
- **Transparent Pricing** — Customer sees final charge before confirming

### Intelligent Agent Assignment

- **Auto-Assign** — Finds nearest available agent by real-time location or zone
- **Manual Override** — Admin can assign any agent manually
- **Reassignment** — Automatic on rescheduled failed deliveries

### <img src="https://img.icons8.com/fluency/24/000000/route.png" width="20" style="vertical-align:middle"/> Order Lifecycle & Tracking

<img width="1024" height="434" alt="image" src="https://github.com/user-attachments/assets/7748bae8-2c2c-45e6-8d85-4bb86be5e54e" />



- **Immutable Audit Trail** — Every status change logged with timestamp & actor
- **Live Tracking** — Customers view real-time status & full timeline

### <img src="https://img.icons8.com/fluency/24/000000/notification.png" width="20" style="vertical-align:middle"/> Notifications

- **Email** — Sent on every status change (SendGrid free tier)
- **SMS** — Critical alerts (Twilio free tier)
- **Reschedule Alerts** — Instant notification on failed delivery

### <img src="https://img.icons8.com/fluency/24/000000/dashboard.png" width="20" style="vertical-align:middle"/> Admin Dashboard

- View all orders with filters (status, zone, agent)
- Override any order status with audit logging
- Manage zones, areas, rate cards, and COD surcharges
- No hardcoded values — everything configurable

---

## <img src="https://img.icons8.com/fluency/48/000000/network.png" width="24" style="vertical-align:middle"/> System Architecture

```
┌───────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Frontend   │────▶│   Node.js API   │────▶│   PostgreSQL    │
│ (Admin/Customer)  │     │   (Express.js)  │     │   (Primary DB)  │
└───────────────────┘     └────────┬────────┘     └─────────────────┘
                                    │
                          ┌─────────┴─────────┐
                          ▼                   ▼
                    ┌─────────┐         ┌─────────┐
                    │  Redis  │         │ SendGrid│
                    │ (Cache) │         │ (Email) │
                    └─────────┘         └─────────┘
```

---

## <img src="https://img.icons8.com/fluency/48/000000/price-tag.png" width="24" style="vertical-align:middle"/> Rate Calculation Engine

```
┌───────────────────────────────────────────────────────────────┐
│  INPUT: Pickup Addr | Drop Addr | L×B×H | Actual Weight        │
│         Order Type (B2B/B2C) | Payment (Prepaid/COD)           │
└───────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Zone Detection  │  ← Geocode → Zone IDs
                    └────────┬─────────┘
                             ▼
                    ┌──────────────────┐
                    │  Volumetric Wt   │  ← (L × B × H) ÷ 5000
                    │  max(actual,vol) │
                    └────────┬─────────┘
                             ▼
                    ┌──────────────────┐
                    │ Rate Card Lookup │  ← B2B/B2C + Intra/Inter
                    │  (Admin Config)  │
                    └────────┬─────────┘
                             ▼
                    ┌──────────────────┐
                    │  COD Surcharge   │  ← If COD, add configured fee
                    │  (Admin Config)  │
                    └────────┬─────────┘
                             ▼
                    ┌──────────────────┐
                    │  FINAL CHARGE    │  ← Shown before confirmation
                    │  (Transparent)   │
                    └──────────────────┘
```

**Key Design Decisions:**

- Rate cards stored per zone-pair, with separate B2B/B2C rates
- Volumetric divisor (5000) configurable by admin
- All rates & surcharges editable via admin panel — zero hardcoding
- Charge computed server-side to prevent tampering

---

## <img src="https://img.icons8.com/fluency/48/000000/database.png" width="24" style="vertical-align:middle"/> Database Schema

<img width="1024" height="572" alt="image" src="https://github.com/user-attachments/assets/490f27d1-4e1c-44c8-a693-c77a8554d54d" />


**Immutable Audit Trail:** `order_status_history` records every transition with `actor_id` (who changed it) and `timestamp`. No updates allowed — only inserts.

---

## <img src="https://img.icons8.com/fluency/48/000000/api-settings.png" width="24" style="vertical-align:middle"/> API Documentation

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register customer/agent |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Customer/Admin | Create order (returns calculated charge) |
| GET | `/api/orders` | Admin | List all orders (filter: `?status=&zone=&agent=`) |
| GET | `/api/orders/:id` | Any (own order) | Get order details & tracking timeline |
| PATCH | `/api/orders/:id/status` | Agent/Admin | Update status |
| POST | `/api/orders/:id/assign` | Admin | Manual agent assignment |
| POST | `/api/orders/:id/auto-assign` | Admin | Trigger auto-assignment |
| POST | `/api/orders/:id/reschedule` | Customer | Reschedule failed delivery |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/zones` | Admin | Create zone |
| POST | `/api/admin/rate-cards` | Admin | Configure rate card |
| GET | `/api/admin/agents` | Admin | List agents with availability |
| GET | `/api/admin/dashboard` | Admin | Orders overview & analytics |

### Rate Calculation

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/calculate-rate` | Any | Preview charge before order creation |

---

## <img src="https://img.icons8.com/fluency/48/000000/artificial-intelligence.png" width="24" style="vertical-align:middle"/> Auto-Assignment Logic

```
1. Get order pickup zone
2. Query agents where:
   - is_available = true
   - current_zone_id = pickup_zone (priority)
   OR
   - distance from pickup < threshold km
3. Sort by:
   - Distance (ascending)
   - Last assigned timestamp (ascending — round-robin)
4. Assign top agent
5. Update agent.is_available = false
6. Log assignment in order_status_history
```

**Edge Cases Handled:**

- No agents in zone → Expand search radius
- All agents busy → Queue order, notify admin
- Agent rejects → Mark unavailable, re-run assignment

---

## <img src="https://img.icons8.com/fluency/48/000000/refresh.png" width="24" style="vertical-align:middle"/> Failed Delivery Flow

```
Agent marks "Failed"
        │
        ▼
┌───────────────────┐
│ 1. Log status     │  ← order_status_history: "Failed"
│    with reason    │
└─────────┬──────────┘
          ▼
┌───────────────────┐
│ 2. Notify         │  ← Email + SMS to customer
│    Customer       │
└─────────┬──────────┘
          ▼
┌───────────────────┐
│ 3. Customer       │  ← Opens app, picks new date
│    Reschedules    │
└─────────┬──────────┘
          ▼
┌───────────────────┐
│ 4. Re-run         │  ← Auto-assign nearest available
│    Auto-Assign    │    agent for new date
└─────────┬──────────┘
          ▼
┌───────────────────┐
│ 5. New attempt    │  ← Status: "Rescheduled → Picked Up"
│    begins         │
└────────────────────┘
```

---

## <img src="https://img.icons8.com/fluency/48/000000/video-call.png" width="24" style="vertical-align:middle"/> Demo

**Live Demo:** [https://zonepilot.vercel.app](https://zonepilot.vercel.app)

**Test Credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@zonepilot.app | admin123 |
| Customer | customer@demo.com | demo123 |
| Agent | agent@demo.com | demo123 |

---

## <img src="https://img.icons8.com/fluency/48/000000/prize.png" width="24" style="vertical-align:middle"/> Why ZonePilot Wins

| Criteria | How We Nail It |
|---|---|
| **Rate Engine** | Zone-aware, volumetric weight, B2B/B2C split, COD surcharge — all admin-configurable, zero hardcoding |
| **Auto-Assignment** | Nearest available agent with round-robin fairness, graceful fallback |
| **Status Lifecycle** | Immutable audit trail with actor attribution — full accountability |
| **Failed Delivery** | Seamless reschedule + reassignment, no order lost |
| **Data Model** | Normalized schema with clear relationships, audit history, and indexing |
| **Code Quality** | Clean separation of concerns, RESTful APIs, comprehensive error handling |

---

<p align="center">
  <b>ZonePilot — Every Package, Perfectly Routed.</b>
</p>
