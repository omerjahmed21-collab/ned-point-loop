# NED Point Loop

University point bus tracking and fee receipt system for NED University.

- **Students** sign up with their roll number and photo, track buses live and see routes and timings straight away, and submit their point fee (JazzCash, Easypaisa or bank) with a receipt. Once the transport office approves it, they get a **digital fee receipt** with their photo and details, which they can print or save as PDF.
- **Drivers** share their bus location during a trip and can **check a student** by roll number to see their photo and whether their fee is paid.
- **Admin (transport office)** compares the student's photo with their uploaded bank receipt and approves or rejects the payment, and manages users, routes, stops, buses and schedules.

## Tech stack

| Part | Technology |
|---|---|
| Backend API | Python, Django, Django REST Framework, JWT login |
| Database | SQLite (development), PostgreSQL ready |
| Frontend | React (Vite), Tailwind CSS |
| Maps | Leaflet + OpenStreetMap |
| Uploads | Student photos and payment receipts (Django file storage) |
| Admin panel | Django admin |

## Run it

```bash
bash setup.sh   # first time only
bash run.sh     # every time
```

Open **http://localhost:5173**

## Demo accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin12345` |
| Driver | `driver1` | `driver12345` |
| Student (fee approved, has a receipt) | `CS-21001` | `student12345` |
| Student (fee not paid yet) | `EE-22045` | `student12345` |

## Fee payment flow

1. Student signs up with roll number, department and a photo of their face. Live map and routes work immediately.
2. On the **Fee receipt** page the student sends the fee to one of the listed accounts, then submits route, method, transaction ID and a photo/PDF of the payment receipt.
3. Transport office opens **Admin → Payments**, compares the student photo with the uploaded receipt, and sets the status to **Approved** (or **Rejected** with a note).
4. The student's **fee receipt** appears (receipt number, photo, name, roll no., department, route, semester, amount, transaction ID). Drivers can confirm it with **Check student**.

Fee amount, payment accounts and semester name are in `backend/config/settings.py` (`POINT_FEE_AMOUNT`, `POINT_PAYMENT_ACCOUNTS`, ...).
The NED logo lives in `frontend/public/ned-logo.png` (app) and `backend/accounts/static/ned/ned-logo.png` (admin).

## Demo flow

1. Log in as **driver1** and tap **Simulate trip** (or **Start trip (GPS)** on a phone).
2. In another browser window (or incognito), log in as **CS-21001** and open **Live map**: the bus moves.
3. The student opens **Fee receipt** to show their receipt with photo.
4. The driver opens **Check student** and types `CS-21001` (paid) or `EE-22045` (not paid).
5. Log in as **EE-22045**, submit a payment on **Fee receipt**, then approve it in **/admin → Payments**: the receipt appears.

## Project structure

```
backend/
  accounts/    users with roles (admin, driver, student), signup, login
  transport/   routes, stops, buses, schedules
  tracking/    live bus location
  passes/      fee payments, fee receipts, driver check-student
  config/      settings and URLs
frontend/src/
  pages/student/   LiveMap, RoutesList, RouteDetail, FeeReceipt
  pages/driver/    Trip, CheckStudent
  components/      Layout, BusMap, AuthShell
```

## API

| What | Method | URL | Who |
|---|---|---|---|
| Sign up | POST | `/api/auth/signup/` | Anyone |
| Log in | POST | `/api/auth/login/` | Anyone |
| Who am I | GET | `/api/auth/me/` | Logged in |
| Change my photo | POST | `/api/auth/photo/` | Student |
| All routes | GET | `/api/routes/` | Logged in |
| Route details | GET | `/api/routes/<id>/` | Logged in |
| Send bus location | POST | `/api/tracking/update/` | Driver |
| Live bus locations | GET | `/api/tracking/live/` | Logged in |
| Fee info, my submissions and fee receipt | GET | `/api/payments/` | Student |
| Submit a payment | POST | `/api/payments/submit/` | Student |
| Check a student's fee by roll number | GET | `/api/passes/check/?roll=CS-21001` | Driver |

## Phase 2 (planned)

Automatic payment confirmation through the JazzCash / Easypaisa APIs, WebSockets for instant tracking, mobile app, notifications, ETA prediction, analytics.
