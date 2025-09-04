# OpenAI Chat Backend

En Node.js-backend som exponerar en enkel chat-API mot OpenAI och RAG-endpoints (embeddings + vector store med Chroma i Docker). Innehåller även en terminal-chat för snabb test. 

---

## Funktioner
- Använder OpenAI:s `gpt-4o-mini` modell.
- RAG-endpoints:<br>
  POST /api/rag/index – indexera .md/.txt på disk.<br>
  POST /api/rag/query – semantisk sökning (topK, valfritt docId-filter).
- CLI-indexering – npm run rag:index (wrapper runt samma indexeringskod).
- Egen embeddingFunction med OpenAI Embeddings (t.ex. text-embedding-3-small). 
- Terminal-chat (readline) med minneskommandon (/save, /load, /system, /temp, …).  
- Hanterar användarinput och ger AI-svar.  
- Stöd för minne (konversationshistorik).  
- Kan spara konversationer till fil.  

---
## Krav

Node.js v18+

Docker Desktop (för Chroma vector store)

En giltig OPENAI_API_KEY

## Installation

   ```bash
   git clone https://github.com/<ditt-användarnamn>/openai-chat-backend.git
   cd openai-chat-backend
   npm install

## Starta tjänster

1. Starta Chroma:
```bash
docker run -d --name chroma -p 8000:8000 -v chroma-data:/chroma/index ghcr.io/chroma-core/chroma:latest
```
Därefter:
```bash
docker start chroma
```
2) Starta HTTP-API:t (Express)
```bash
npm run api
# lyssnar på http://localhost:3001
```
(Valfritt) Terminal-chatten:
```bash
   npm start
```

## Indexera dokument (RAG)

Lägg .md/.txt i data/docs/ (skapa mappen om den saknas) och kör:
```bash
npm run rag:index
# -> "Indexed ... (N chunks)" och "Indexing done: ./data/docs"
```
Du kan även indexera via API:
```bash
curl -X POST http://localhost:3001/api/rag/index \
  -H "content-type: application/json" \
  -d '{"inputPath":"./data/docs"}'
```

## API – exempel
Chat
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "content-type: application/json" \
  -d '{
        "messages":[{"role":"user","content":"Säg hej"}],
        "model":"gpt-4o-mini",
        "temperature":0.7
      }'
```
RAG: query
```bash
curl -X POST http://localhost:3001/api/rag/query \
  -H "content-type: application/json" \
  -d '{"q":"vad står i filerna?","topK":4}'
```
Med filter på en fil:
```bash
curl -X POST http://localhost:3001/api/rag/query \
  -H "content-type: application/json" \
  -d '{"q":"batteribyte","topK":4,"docId":"manual.txt"}'
```
## Projektstruktur (kort)
```text
.
├─ data/
│  ├─ docs/            # indexerade filer (git-ignoreras)
│  │  └─ test.md
│  └─ .gitkeep         # platshållare
├─ rag/
│  ├─ chunk.js         # chunkning (CHUNK_SIZE/CHUNK_OVERLAP)
│  ├─ indexer.js       # läser filer, chunkar och upsert:ar i Chroma
│  ├─ query.js         # semantisk sökning (queryTexts, nResults, where)
│  ├─ routes.js        # Express-router: /api/rag/index och /api/rag/query
│  └─ store.js         # Chroma-klient + OpenAI-embeddings
├─ scripts/
│  └─ rag-index.js     # CLI-wrapper (npm run rag:index)
├─ server.js           # Express-app: /api/chat + app.use(rag/routes)
├─ index.js            # terminal-chat (readline)
├─ .gitignore
├─ .env.example
├─ README.md
├─ package.json
└─ package-lock.json
```

## Vanliga kommandon
```bash
npm run api        # starta HTTP-API:t (Express)
npm start          # terminal-chatten
npm run rag:index  # indexera ./data/docs via CLI
```





