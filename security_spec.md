# Security Specification & Test Harness (Security TDD)

## 1. Data Invariants

- **User Accounts**: A user's profile document ID must match their authentication UID (`request.auth.uid`). Users can only alter their own profile records and cannot escalate their roles unless they are authorized Administrators.
- **Volunteer Assignment**: A volunteer task is uniquely assigned to a volunteer via `assignedTo`. A volunteer can view their assigned task and only update the task's completion `status`.
- **Operational & High-Sensitivity Segregation**:
  - `alerts`, `crowd`, `parking`, and `sustainability` represent live operational or emergency data.
  - Fans can view basic public indicators but are strictly denied write access.
  - Security role personnel can view and update emergency alerts and query crowd logs.
  - Organizers and Admins have master CRUD authority on these metrics.

---

## 2. The "Dirty Dozen" (Malicious Payloads)

Here are twelve highly targeted JSON payloads designed to breach system integrity, along with their expected denial behavior:

1. **Self-Assigned Admin Escalation**:
   - *Payload*: `{"uid": "attacker_123", "role": "Admin", "displayName": "Attacker"}` sent to `/users/attacker_123`.
   - *Status*: `PERMISSION_DENIED` - Users cannot choose or modify their own role privileges on registration or update.
2. **Identity Spoofing (Impersonating another User's Account)**:
   - *Payload*: `{"uid": "victim_456", "email": "victim@domain.com", "role": "Fan"}` written by `attacker_123` to `/users/victim_456`.
   - *Status*: `PERMISSION_DENIED` - Document write is bounded to owner UID.
3. **Task Status Hijacking by Non-Assigned Volunteer**:
   - *Payload*: `{"status": "completed"}` sent to `/volunteers/task_789` by a user other than the assigned volunteer.
   - *Status*: `PERMISSION_DENIED` - Status updates are locked to the specific assigned volunteer ID.
4. **Volunteer Task Field Escalation**:
   - *Payload*: `{"title": "EASY TASK", "status": "completed", "assignedTo": "new_guy"}` sent to `/volunteers/task_789` by the assigned volunteer trying to rewrite the task description or title.
   - *Status*: `PERMISSION_DENIED` - Volunteers can *only* update the `status` field.
5. **Malicious Alert Inject (Spoofed Threat Alarm)**:
   - *Payload*: `{"id": "alert_999", "title": "BOMB THREAT", "type": "security", "severity": "high", "location": "Sector West"}` sent by a Fan role to `/alerts/alert_999`.
   - *Status*: `PERMISSION_DENIED` - Fan role is blocked from writing operational collections.
6. **Falsified Sensor Crowd Metrics (Denial of Wallet / Resource exhaustion)**:
   - *Payload*: `{"id": "crowd_101", "pressure": "extreme_congested_bloat_string_of_1MB..."}` sent to `/crowd/crowd_101`.
   - *Status*: `PERMISSION_DENIED` - Blocked by validation constraints and size limit enforcements.
7. **Bypassing Public Transit Read restrictions**:
   - *Payload*: Unauthenticated user attempting to query `/transport`.
   - *Status*: `PERMISSION_DENIED` - Authentication is mandatory for all access.
8. **Malicious Sustainability Metric Alteration**:
   - *Payload*: `{"wasteRecycledKg": -1000}` sent to `/sustainability/s_01` by a non-organizer.
   - *Status*: `PERMISSION_DENIED` - Restricted write access.
9. **Junk Character Path Variable Injection (ID Poisoning Guard)**:
   - *Target Document*: `/stadiums/stadium_junk%20characters%25and%20spaces`
   - *Status*: `PERMISSION_DENIED` - Document ID must pass the strict regular expression check in `isValidId`.
10. **Shadow Key Inject (Ghost Fields in matches)**:
    - *Payload*: `{"id": "match_1", "teamA": "A", "teamB": "B", "ghostField": "maliciousValue"}` sent to `/matches/match_1`.
    - *Status*: `PERMISSION_DENIED` - Exact keys check blocks undefined schema attributes.
11. **Client-Controlled Timestamp spoofing**:
    - *Payload*: Creating an alert containing a fraudulent old/future timestamp instead of proper verification.
    - *Status*: `PERMISSION_DENIED` - Bounded length and schema checks.
12. **PII Blanket Scrape Attack**:
    - *Query*: List query on `/users` by a standard Fan.
    - *Status*: `PERMISSION_DENIED` - Broad list queries on the user directory are prohibited.

---

## 3. Test Runner Guidelines

These invariants are fully protected by our Zero-Trust Attribute-Based Access Control (ABAC) ruleset in `firestore.rules`.
