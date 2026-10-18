# QuickNotes Scalable System Architecture

## 1. System Requirements

### Functional Requirements
- Users can create, view, edit, and delete text notes.
- Users can organize notes with tags and search notes by title.
- Changes must persist securely across devices.

### Non-Functional Requirements
- High availability ($99.9\%$ uptime).
- Fast response latency ($<100\text{ ms}$ for reads).
- Scalable to support 1 million users.

---

## 2. Load & Storage Estimates (1 Million Users)

- **Assumptions:** 1,000,000 users; 10% Daily Active Users (100,000 DAU).
- **User Activity:** Each active user performs 20 note reads and 2 note writes daily.

### Calculations:
* **Reads per Second:**
  $$\frac{100,000 \times 20}{86,400} \approx \mathbf{23.15 \text{ reads/sec}} \quad (\text{Peak 5×} \approx \mathbf{115.75 \text{ reads/sec}})$$
* **Writes per Second:**
  $$\frac{100,000 \times 2}{86,400} \approx \mathbf{2.31 \text{ writes/sec}} \quad (\text{Peak 5×} \approx \mathbf{11.57 \text{ writes/sec}})$$
* **Storage per Year:**
  $$100,000 \text{ writes/day} \times 2 \text{ KB/note} \times 365 \text{ days} = 730,000 \text{ MB/year} \approx \mathbf{730 \text{ GB/year}}$$

---

## 3. System Architecture Diagram

---

## 4. Component Explanations

1. **Route 53 DNS:** Resolves human-readable domain queries into system IP addresses.
2. **CDN (CloudFront):** Caches static HTML/CSS/JS frontend files closer to global users.
3. **Application Load Balancer:** Distributes incoming API traffic across health-checked application server nodes.
4. **App Servers (Stateless Node.js/Go):** Processes business logic, input validation, and API controllers.
5. **Redis Cache:** Stores active session states and user note lists in RAM to ensure sub-10ms read performance.
6. **Primary Database (PostgreSQL):** Stores master data records and executes write/update queries.
7. **Read Replica Database:** Asynchronously mirrors primary DB updates to handle heavy read traffic.
8. **Message Queue (RabbitMQ):** Buffers background tasks (e.g., email notifications, full-text index building).
9. **Worker Service:** Consumes message queue items to run asynchronous background processes.

---

## 5. Request Flow Sequences

### GET `/api/v1/notes` Flow:
1. Client sends GET request to Load Balancer, which routes to App Server 1.
2. App Server checks Redis Cache for `user_id:notes`.
3. If cache hit: Returns cached notes instantly to client ($<10\text{ ms}$).
4. If cache miss: Queries Read Replica DB, populates Redis cache, and returns JSON response to client.

### POST `/api/v1/notes` Flow:
1. Client sends POST request payload to App Server.
2. App Server validates payload and writes new note directly to Primary Database.
3. App Server invalidates user note cache in Redis.
4. App Server publishes a `note_created` event to Message Queue for search indexing and returns `201 Created`.

---

## 6. Trade-offs & High Availability (SPOF Prevention)

1. **Cache Invalidation vs Eventual Consistency:**
   * **Trade-off:** Using Redis drastically speeds up read queries, but invalidating caches on writes can occasionally cause brief stale reads if replicas lag.
2. **Asynchronous Read Replication:**
   * **Trade-off:** Offloading reads to replicas prevents primary DB CPU spikes, but replication lag (milliseconds) means a newly written note may not show up instantly on a read replica.

### Eliminating Single Points of Failure (SPOFs):
- **Multi-AZ App Servers:** Multiple instances run behind an ALB across distinct Availability Zones.
- **Database Failover:** Automatic primary-to-replica failover maintains write availability if the primary DB fails.