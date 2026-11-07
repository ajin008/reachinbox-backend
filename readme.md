# 🚀 ReachInbox Backend

### **Real-Time Email Sync • Full‑Text Search • AI Reply System**

A production‑grade backend inspired by **ReachInbox**, designed for high‑performance email outreach automation. It provides:
✅ Real‑time IMAP sync
✅ Elasticsearch full‑text search
✅ AI‑powered categorization & replies
✅ Slack alerts for leads
✅ Socket.IO live updates

---

## ✨ **Features Overview**

### ✅ **1. Real‑Time IMAP Email Sync**

* Connects to Gmail IMAP (no polling)
* Listens for new emails via **IMAP exists** event
* Parses emails using **mailparser**
* Automatically loads last 30 days of emails on boot

---

### ✅ **2. Elasticsearch‑Based Search**

* Emails indexed inside dedicated `emails` index
* **Full‑text search** on subject + body
* Pagination support built‑in

---

### ✅ **3. AI‑Powered Categorization (RAG Hybrid)**

* Fast rule‑based categorizer
* Optional **LLM categorization (OpenAI)**
* Knowledge‑base‑driven RAG using `/kb` files

---

### ✅ **4. AI Auto‑Reply System**

* Embeds incoming email
* Vector search over KB + past emails
* LLM‑generated reply
* Sends email via **Nodemailer SMTP**

---

### ✅ **5. Real‑Time Frontend Updates**

* Emits `new-email` via **Socket.IO**
* Client UI updates instantly — no refresh needed

---

### ✅ **6. Slack Notifications**

* Alerts sent when **category = Interested**

---

## 🛠️ **Tech Stack**

| Layer         | Technology       |
| ------------- | ---------------- |
| Language      | TypeScript (ESM) |
| Server        | Express.js       |
| Email         | IMAP (imapflow)  |
| Search Engine | Elasticsearch    |
| AI            | OpenAI API       |
| Realtime      | Socket.IO        |
| Parsing       | mailparser       |
| SMTP          | Nodemailer       |
| Notifications | Slack Webhook    |
| Container     | Docker           |

---

## 🧱 **Project Architecture**

```
reachinbox-backend/
├── kb/                     # Knowledge base files for RAG
├── src/
│   ├── config/             # OpenAI client, ES client, env configs
│   ├── controllers/        # Route controllers
│   ├── imap/               # IMAP sync logic
│   ├── routes/             # API endpoints
│   ├── services/
│   │   ├── ai/             # Categorization + RAG
│   │   ├── emailStore.ts   # Store email + emit events
│   │   ├── elasticsearch.ts
│   │   ├── mailer.ts       # SMTP
│   │   └── slack.ts
│   ├── utils/              # Embeddings, prompts
│   └── vector/             # Vector search
├── server.ts               # Starts Express + Socket.IO + IMAP sync
├── app.ts                  # Express App
└── docker-compose.yml      # Elasticsearch
```

---

## 🔄 **How It Works (Data Flow)**

### **1️⃣ IMAP → Parse → Store → Realtime**

```
New Email Arrives
    ↓
IMAP exists event
    ↓
Parse email → Categorize (Rule/LLM)
    ↓
Index in Elasticsearch
    ↓
Emit "new-email" via Socket.IO
```

### **2️⃣ AI Auto‑Reply Workflow**

```
Email → embedText()
    ↓
Vector search over KB
    ↓
Context-aware prompt generated
    ↓
OpenAI creates reply
    ↓
SMTP sends email
```

---

## 🧰 **Installation**

### **1. Clone repo**

```bash
git clone https://github.com/<your-username>/reachinbox-backend.git
cd reachinbox-backend
```

### **2. Install deps**

```bash
npm install
```

### **3. Start Elasticsearch**

```bash
docker-compose up -d
```

### **4. Create `.env` file**

```env
PORT=3000
EMAIL_USER=your_mail@gmail.com
EMAIL_PASS=your_app_password
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_mail@gmail.com
SMTP_PASS=your_app_password
OPENAI_API_KEY=your_key
SLACK_WEBHOOK_URL=your_webhook_url
USE_LLM=true
```

---

## ▶️ **Run the server**

```bash
npm run dev
```

You should see:

```
Server running on http://localhost:3000
IMAP client connected
Mailbox opened
fetching emails since last 30 days...
Listening for new emails...
```

---

## 🔌 **API Endpoints**

#### **Get emails**

`GET /api/emails?page=1&limit=10`

#### **Search**

`GET /api/search?q=meeting`

#### **AI Reply**

`POST /api/ai-reply`

---

## ⚡ Socket.IO Events

| Event       | Description                                   |
| ----------- | --------------------------------------------- |
| `new-email` | `{ id, subject, from, date, body, category }` |

---

## 📢 Slack Alerts

Triggered for:

```
category = "Interested"
```

---




