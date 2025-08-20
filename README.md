# OpenAI Chat Backend

En enkel backend-chatbot byggd med **Node.js** och **OpenAI API**.  

---

## Funktioner
- Använder OpenAI:s `gpt-4o-mini` modell.  
- Körs i terminalen (via `readline`).  
- Hanterar användarinput och ger AI-svar.  
- Stöd för minne (konversationshistorik).  
- Kan spara konversationer till fil.  

---

## Installation

1. Klona repot:
   ```bash
   git clone https://github.com/<ditt-användarnamn>/openai-chat-backend.git
   cd openai-chat-backend

## Användning

1. Starta:
   ```bash
   npm start

Exempel:<br> Du: Hej!<br>Bot: Hej! Hur kan jag hjälpa dig idag?


| Kommando      | Beskrivning                                                          |
| ------------- | -------------------------------------------------------------------- |
| `/exit`       | Avslutar programmet                                                  |
| `/clear`      | Rensar hela historiken men behåller nuvarande systemprompt           |
| `/save`       | Sparar konversationen till `conversation.json`                       |
| `/load`       | Läser in en tidigare sparad konversation från `conversation.json`    |
| `/system ...` | Sätter en ny systemprompt (t.ex. `/system Du är en rolig komiker.`)  |
| `/temp x`     | Ändrar temperatur (0.0–1.0). Lägre = striktare, högre = mer kreativt |
| `/help`       | Visar denna lista med alla kommandon och aktuell temperatur          |
