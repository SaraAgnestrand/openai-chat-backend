require("dotenv").config();
const OpenAI = require("openai");
const readline = require("readline");
const fs = require("fs");

if (!process.env.OPENAI_API_KEY) {
  console.error("Saknar OPENAI_API_KEY i .env");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let temperature = 0.7;
let systemPrompt = "Du är en hjälpsam, koncis assistent.";

let messages = [{ role: "system", content: systemPrompt }];

const MAX_MSG = 50;
function truncateHistory(list) {
  const hasSystem = list[0]?.role === "system";
  if (!hasSystem) return list.slice(-MAX_MSG);
  const head = [list[0]];
  const tail = list.slice(1).slice(-(MAX_MSG - 1));
  return head.concat(tail);
}

function validateMessages(arr) {
  if (!Array.isArray(arr)) return false;
  return arr.every(
    (m) =>
      m &&
      typeof m === "object" &&
      (m.role === "system" || m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string"
  );
}

function printHelp(currentTemp = temperature) {
  console.log(`
Kommandon:
/exit        Avsluta programmet
/clear       Rensa historik (behåll systemprompt)
/save        Spara konversation till conversation.json
/load        Ladda konversation från conversation.json
/system ...  Sätt systemprompt (ex: /system Du är rolig.)
/temp x      Sätt temperatur (0–1), ex: /temp 0.2
/help        Visa denna hjälp

Info:
- MAX_MSG = ${MAX_MSG}
- Temperatur: ${currentTemp}
  `);
}

if (fs.existsSync("conversation.json")) {
  try {
    const loaded = JSON.parse(fs.readFileSync("conversation.json", "utf-8"));
    if (validateMessages(loaded) && loaded.length > 0) {
      messages = loaded;
      if (messages[0]?.role === "system") {
        systemPrompt = messages[0].content || systemPrompt;
      }
    }
  } catch {
    //Ogiltig fil – startar med tom historik
  }
}

console.log("Chatbot med minne startad!");
console.log(
  "Kommandon: /exit, /clear, /save, /load, /system <text>, /temp <0.0-1.0>, /help\n"
);

async function handleLine(lineRaw) {
  const line = String(lineRaw).trim();

  if (!line) return;

  if (line === "/exit") {
    rl.close();
    process.exit(0);
  }

  if (line === "/help") {
    printHelp();
    return;
  }

  if (line === "/clear") {
    messages = [{ role: "system", content: systemPrompt }];
    console.log(" Minnet nollställt (system-prompten kvar)\n");
    return;
  }

  if (line === "/save") {
    try {
      fs.writeFileSync(
        "conversation.json",
        JSON.stringify(messages, null, 2),
        "utf-8"
      );
      console.log("Konversation sparad till conversation.json\n");
    } catch (e) {
      console.log("Kunde inte spara konversationen:", e.message, "\n");
    }
    return;
  }

  if (line === "/load") {
    if (!fs.existsSync("conversation.json")) {
      console.log("Hittade ingen conversation.json att läsa in.\n");
      return;
    }
    try {
      const loaded = JSON.parse(fs.readFileSync("conversation.json", "utf-8"));
      if (validateMessages(loaded) && loaded.length > 0) {
        messages = loaded;
        if (messages[0]?.role !== "system") {
          messages.unshift({ role: "system", content: systemPrompt });
        } else {
          systemPrompt = messages[0].content || systemPrompt;
        }
        console.log("Konversation inläst från conversation.json\n");
      } else {
        console.log("Filen var tom eller ogiltig.\n");
      }
    } catch (e) {
      console.log("Kunde inte läsa in konversationen:", e.message, "\n");
    }
    return;
  }

  if (line.startsWith("/system ")) {
    const newSys = line.slice(8).trim();
    if (newSys) {
      systemPrompt = newSys;
      messages[0] = { role: "system", content: systemPrompt };
      console.log("System-prompt uppdaterad.\n");
    } else {
      console.log("Ange text efter /system\n");
    }
    return;
  }

  if (line.startsWith("/temp ")) {
    const t = Number(line.slice(6));
    if (!Number.isFinite(t) || t < 0 || t > 1) {
      console.log("Ange värde mellan 0.0 och 1.0\n");
    } else {
      temperature = t;
      console.log(`Temperature satt till ${temperature}\n`);
    }
    return;
  }

  messages.push({ role: "user", content: line });

  const toSend = truncateHistory(messages);

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: toSend,
      temperature,
    });
    const reply = response.choices?.[0]?.message?.content ?? "(tomt svar)";
    console.log("Bot:", reply, "\n");
    messages.push({ role: "assistant", content: reply });

    if (response.usage) {
      console.log("Token-användning:");
      console.log("  prompt_tokens:", response.usage.prompt_tokens);
      console.log("  completion_tokens:", response.usage.completion_tokens);
      console.log("  total_tokens:", response.usage.total_tokens, "\n");
    }
  } catch (err) {
    console.error("Fel:", err?.response?.data ?? err.message ?? err);
    console.log();
  }
}

(async function main() {
  const piped = !process.stdin.isTTY;

  if (piped) {
    let buffer = "";
    for await (const chunk of process.stdin) buffer += chunk;

    const lines = buffer.split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      messages.push({ role: "user", content: line.trim() });
    }

    const toSend = truncateHistory(messages);

    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: toSend,
        temperature,
      });
      const reply = response.choices?.[0]?.message?.content ?? "(tomt svar)";
      console.log("Bot:", reply, "\n");

      messages.push({ role: "assistant", content: reply });

      if (response.usage) {
        console.log("Token-användning:");
        console.log("  prompt_tokens:", response.usage.prompt_tokens);
        console.log("  completion_tokens:", response.usage.completion_tokens);
        console.log("  total_tokens:", response.usage.total_tokens, "\n");
      }
    } catch (err) {
      console.error("Fel:", err?.response?.data ?? err.message ?? err);
    }

    process.exit(0);
  }

  rl.setPrompt("Du: ");
  rl.prompt();

  rl.on("line", async (input) => {
    const lines = String(input).split(/\r?\n/).filter(Boolean);
    for (const line of lines) {
      await handleLine(line);
    }
    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });
})();
