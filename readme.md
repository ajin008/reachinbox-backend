# 📬 ReachInbox Backend  

A complete backend for **real-time email syncing**, **categorisation**, **semantic search**, and **AI auto-reply** using **IMAP + Elasticsearch + OpenAI**.

Built with Node.js (ESM), TypeScript, Express, IMAPFlow, Elasticsearch, OpenAI, and Nodemailer.

---

## 🚀 Features

✅ Real-time IMAP email sync (IDLE mode — **no cron jobs**)  
✅ Fetches last 30 days of emails  
✅ Parses & stores emails in Elasticsearch  
✅ Auto-categorises incoming emails  
✅ Keyword + semantic search (RAG using vector search)  
✅ AI auto-reply using company knowledge base  
✅ Nodemailer auto-reply delivery  
✅ Modern TypeScript backend (ES Modules)

---

## 🧰 Tech Stack

- **Node.js 20** (ESM)
- **Express.js**
- **IMAPFlow** (mail client)
- **Elasticsearch** (email index + vector search)
- **OpenAI** (embeddings + reply generation)
- **Nodemailer**
- **TypeScript**

---

## 📁 Project Structure

src/
├── config/
│ ├── env.ts
│ └── openaiClient.ts
│
├── controllers/
│ ├── email.controller.ts
│ └── search.controller.ts
│
├── imap/
│ ├── client.ts
│ └── index.ts
│
├── routes/
│ └── email.routes.ts
│
├── services/
│ ├── ai.ts
│ ├── aiRules.ts
│ ├── elasticsearch.ts
│ ├── emailIndex.ts
│ ├── emailStore.ts
│ ├── mailer.ts
│ └── slack.ts
│
├── utils/
│ ├── embedText.ts
│ ├── prompt.ts
│
├── vector/
│ ├── kbIndex.ts
│ └── seedKb.ts
│
├── app.ts
└── server.ts

kb/
├── pricing.txt
├── product_overview.txt
└── reply_playbook.txt

makefile
Copy code


---

## 🔧 Environment Variables

Create a `.env` file:

```env
EMAIL_USER=your_gmail_here
EMAIL_PASS=your_app_password
IMAP_HOST=imap.gmail.com
IMAP_PORT=993

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_here
SMTP_PASS=your_app_password

OPENAI_API_KEY=your_key
ELASTICSEARCH_URL=http://localhost:9200
SLACK_WEBHOOK_URL=your_webhook

Setup Instructions
1️⃣ Clone the project
git clone https://github.com/ajinkp08/reachinbox-backend.git
cd reachinbox-backend

2️⃣ Install dependencies
npm install

3️⃣ Add .env file

(See variables above)

4️⃣ Start Elasticsearch
docker-compose up -d

5️⃣ Seed the company knowledge base

(Embeds text → indexes into Elasticsearch)

npm run seed

6️⃣ Start backend
npm run dev

📩 Email Processing Flow
IMAP Connection (Real-Time)
        ↓
New email arrives
        ↓
Parse headers and body
        ↓
Store in Elasticsearch
        ↓
Categorise (Keyword + ML + Rules)
        ↓
Enable search + AI auto-reply


Stored fields include:

id

subject

from / to

date

body

category

account

folder

🤖 AI Auto-Reply (RAG Flow)
Frontend → backend (mailId)
              ↓
Fetch email from Elasticsearch
              ↓
Create embedding (OpenAI)
              ↓
Semantic search in kb_docs
              ↓
Generate reply with GPT
              ↓
Send email via Nodemailer
              ↓
Return response to frontend

🔍 API Endpoints
Emails
GET /api/emails
GET /api/emails/:id
GET /api/emails/filter?category=Spam

Search
GET /api/search?q=meeting

AI Auto Reply
POST /api/ai-replay

🧠 Knowledge Base (RAG)

Knowledge is stored in /kb/:

product_overview.txt

pricing.txt

reply_playbook.txt

Seed into Elasticsearch:

npm run seed

🏭 Production Build
npm run build
npm start




