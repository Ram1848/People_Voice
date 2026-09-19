# People Voice 🎙️📦
> **Voice-Powered Inventory Management for Small Businesses**

People Voice is a modern, voice-first inventory management web application tailored for local shop owners, grocery stores, retailers, and wholesalers. It empowers merchants to update stock, inspect balance, track low stock, and manage reorders naturally by speaking or typing.

---

## 🌟 Key Features

1. **Voice-First Inventory Operations**:
   - Hands-free stock intake: `"Add 20 bags of rice"`
   - Hands-free sales/stock dispatch: `"Remove 5 kg sugar"` or `"I sold 5 bottles of cooking oil"`
   - Balance queries: `"How much rice do I have?"`
   - Shortage checks: `"Which products are running low?"`
   - Automated reorder suggestions: `"What should I reorder?"`
   - Regional & mixed phrasing support: `"Rice 20 bags add cheyyi"`, `"Sugar 5 kg theeyi"`.

2. **Strict Security Architecture**:
   ```
   VOICE / TEXT INPUT
          ↓
   Web Speech API (Browser Speech-to-Text)
          ↓
   REST API (/api/voice/command)
          ↓
   Rule-Based NLP Parser (Extracts: Action, Product, Quantity, Unit)
          ↓
   Validation & Safety Engine (Rejects negative stock, unknown items, missing params)
          ↓
   MySQL Atomic Transaction (Guarantees consistency across stock & audit logs)
          ↓
   Interactive UI Update + Audio Speech Synthesis (TTS voice reply)
   ```
   > **Note**: AI/NLP outputs never directly modify the database without validation.

3. **Dashboard & Visual Metrics**:
   - Real-time stock counts: Total Products, Units In Stock, Low-Stock Count, Out-of-Stock Count.
   - Quick Voice Command hub with microphone ripple visualizer.
   - One-click rule-based Reorder Suggestions (`minimum_stock * 2 - current_stock`).
   - Recent transaction audit feed with source indicators (`VOICE`, `TEXT`, `MANUAL`).

4. **Product & Inventory Management**:
   - Product catalog with measurement units (`kg`, `grams`, `litres`, `pieces`, `bags`, `cartons`, `dozens`, `quintals`).
   - Live search, filtering (`All`, `In Stock`, `Low Stock`, `Out of Stock`).
   - Modals for adding, editing, deleting, and quick stock adjustment (+ / -).

5. **Complete Audit Trail**:
   - Every modification records `product_id`, `action`, `quantity`, `unit`, `previous_stock`, `updated_stock`, `source` (`VOICE` | `TEXT` | `MANUAL`), and timestamp.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios, Web Speech API (`SpeechRecognition` & `SpeechSynthesis`).
- **Backend**: Node.js, Express.js, `mysql2/promise` (connection pooling & transactions), `dotenv`, `cors`.
- **Database**: MySQL 8.0 (`people_voice` schema with indexed foreign keys).

---

## 🚀 Getting Started

### 1. Database Configuration
Ensure MySQL 8.0 is running. The backend automatically creates the `people_voice` database, initializes the tables, and seeds realistic demo data on startup.

Check `server/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=people_voice
DB_PORT=3306
CORS_ORIGIN=http://localhost:5173
```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend packages
npm run install:all
```

### 3. Run Application
```bash
# Run both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in Google Chrome, Microsoft Edge, or Safari.

---

## 🎬 Complete Hackathon Demo Flow

1. **Open Dashboard** at `http://localhost:5173`.
2. **Add Stock with Voice**:
   - Click the green microphone button.
   - Say: `"Add 20 bags of rice"`
   - Watch the live transcription and parsed badge breakdown (`Action: ADD`, `Product: rice`, `Qty: 20`, `Unit: bags`).
   - Notice the voice responds: *"20 bags of Rice added successfully"*, and the stock counter immediately updates in MySQL!
3. **Dispatch / Remove Stock with Voice**:
   - Click microphone and say: `"Remove 5 bags of rice"`.
   - The stock decreases from 65 to 60 bags.
4. **Stock Balance Check**:
   - Say: `"How much rice do I have?"`.
   - The app replies: *"You currently have 60 bags of Rice in stock."*
5. **Detect Low Stock**:
   - Say: `"Which products are running low?"`.
   - The assistant lists low items (e.g. Sugar, Biscuits, Milk).
6. **Reorder Recommendation**:
   - Say: `"What should I reorder?"`.
   - Assistant displays items and suggested reorder quantities.
7. **Mixed / Regional Language Demo**:
   - Say or type: `"Rice 20 bags add cheyyi"`.
   - Parser correctly identifies action `ADD`, product `rice`, quantity `20`, unit `bags`.
8. **Validation & Edge Case Handling**:
   - Say: `"Remove 9999 bags of rice"` -> Insufficient stock error cleanly caught without database modification.
   - Say: `"Add rice"` -> System asks: *"How much rice would you like to add?"*
   - Say: `"Add 10 dragonfruit"` -> Product not found notification with option to create it.
