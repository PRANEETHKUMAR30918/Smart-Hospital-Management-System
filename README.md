# Smart Hospital Management System

A multi-role healthcare administration and patient scheduling platform built with a **Spring Boot 3** REST API and a **React 18 + Vite** frontend.

---

## 🏗️ Architecture

```
[ Browser / Client ]
        │  (HTTP / JSON + Bearer JWT)
        ▼
[ React 18 SPA (Vite + Tailwind CSS) ]
        │
        ▼
[ Spring Boot 3 REST Backend (Port 8081) ]
  ├── Security Filter Chain (JwtAuthFilter, Stateless Sessions)
  ├── REST Controllers (AdminController, DoctorController, PatientController, AuthController)
  ├── Service Layer (Transactional Business Rules & Authorization Invariants)
  └── Spring Data JPA Repositories (Hibernate ORM)
        │
        ▼
[ MySQL 8.0 Database (hospital_db) ]
```

---

## 🗄️ Domain Model & Entity Relationships

- **User**: Core authentication identity (`username`, `email`, `password_hash`, `role` [ADMIN, DOCTOR, PATIENT]).
- **Patient**: 1-to-1 with `User`. Stores demographic and medical records (`bloodGroup`, `emergencyContact`, `dob`).
- **Doctor**: 1-to-1 with `User`. Stores clinical metadata (`specialization`, `consultationFee`, `availableDays`).
- **Appointment**: Many-to-1 with `Patient` and `Doctor`. Tracks `appointmentDate`, `timeSlot`, `symptoms`, `status` [PENDING, CONFIRMED, COMPLETED, CANCELLED].
- **Prescription**: 1-to-1 with `Appointment`, Many-to-1 with `Patient` and `Doctor`. Tracks `diagnosis`, `medicines`, `instructions`, and `followUpDate`.
- **Billing**: Many-to-1 with `Patient` and `Appointment`. Generated automatically on appointment booking.

---

## 🔒 Security & Authorization Invariants

1. **Privilege Escalation Prevention**: Public self-registration (`/api/auth/register`) strictly ignores any client-supplied role and enforces `Role.PATIENT`. Doctor and Admin profiles cannot be self-provisioned.
2. **Ownership Enforcement (IDOR Protection)**: Patients can only inspect, cancel, or pay for their own appointments and bills. Requests attempting to manipulate another patient's identifier are rejected with `403 Forbidden`.
3. **Slot Conflict Invariant**: Double-booking is rejected at the domain level before database persistence. If an active appointment already exists for `(doctorId, appointmentDate, timeSlot)`, the API responds with `409 Conflict`.
4. **Input Validation**: Booking dates must be in the present or future (`@FutureOrPresent`), and slots/doctors are validated before persistence.

---

## ⚙️ Getting Started

### Prerequisites
- **Java**: JDK 17 or 21
- **Node.js**: v18 or later
- **MySQL**: 8.0+ running locally

### 1. Backend Setup
1. Configure environment variables or use the defaults in `application.properties`:
   ```bash
   cp hospital-backend/src/main/resources/application-example.properties hospital-backend/src/main/resources/application.properties
   ```
2. Run backend via Maven Wrapper:
   ```bash
   cd hospital-backend
   .\mvnw clean spring-boot:run
   ```
   Backend starts on **`http://localhost:8081`**. The database `hospital_db` and schema are auto-initialized via Hibernate.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd hospital-frontend
   npm install
   npm run dev
   ```
   Frontend starts on **`http://localhost:5173`**.

---

## 🧪 Running Automated Tests

All domain rules, security barriers, and role mappings are covered by automated JUnit 5 and Mockito tests:

```bash
cd hospital-backend
.\mvnw test
```

### Test Suite Breakdown
- `AdminRouteAccessTest`: Validates URL security rules (ensures `/api/admin/**` rejects unauthenticated users, patients, and doctors with 401/403).
- `AuthServiceTest`: Verifies privilege escalation prevention during registration.
- `AppointmentServiceTest`: Verifies slot conflict detection, past-date rejection, fee calculations, and IDOR access boundaries.
- `BillingServiceTest`: Verifies ownership checks on patient invoice settlements.

---

## ⚖️ Known Limitations & Trade-offs

- **Concurrent Slot Booking**: The slot conflict check uses optimistic query-level detection (`existsByDoctorIdAndAppointmentDateAndTimeSlotAndStatusNot`). Under extreme high concurrency, a database unique constraint on `(doctor_id, appointment_date, time_slot)` or pessimistic locking would be required to completely eliminate race conditions.
- **JWT Invalidation**: Tokens are stateless and valid until expiration (24 hours). Instant token revocation on logout is not currently backed by a distributed blacklist (e.g., Redis).
- **Audit Logging**: Entity changes are recorded with timestamps, but a dedicated immutable audit trail (e.g. Envers) is not yet integrated.
