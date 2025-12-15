const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");

/* 🔥 FIREBASE CONFIG (AS IT IS THEEK HAI) */
const firebaseConfig = {
  apiKey: "PASTE_FIREBASE_API_KEY",
  authDomain: "dna-memory-brain.firebaseapp.com",
  projectId: "dna-memory-brain"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* 🧠 MEMORY */
let memory = JSON.parse(localStorage.getItem("dnaMemory")) || {
  name: null,
  preferredLang: "hi",
  knowledge: []
};

/* UI */
function addMessage(text, sender, speak = false, lang = "hi") {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;

  if (speak && sender === "ai") speakText(text, lang);
}

/* 🔊 VOICE ENGINE (SMOOTH) */
function speakText(text, lang) {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);

  if (lang === "hi") msg.lang = "hi-IN";
  else if (lang === "gu") msg.lang = "gu-IN";
  else msg.lang = "hi-IN"; // Marwadi Hindi tone

  msg.rate = 0.95;
  msg.pitch = 1;
  msg.volume = 1;

  speechSynthesis.speak(msg);
}

/* 🎤 VOICE INPUT */
function startVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return alert("Voice input supported nahi");

  const recog = new SR();
  recog.lang = "hi-IN";
  recog.start();

  recog.onresult = (e) => {
    userInput.value = e.results[0][0].transcript;
    sendMessage();
  };
}

/* 🌍 LANGUAGE DETECT */
function detectLanguage(text) {
  const t = text.toLowerCase();
  if (t.includes("gujarati") || t.includes("gujrati")) return "gu";
  if (t.includes("marwadi")) return "mr";
  return "hi";
}

/* 🤖 FAST REPLY ENGINE (0 DELAY) */
function generateReply(text) {
  const t = text.toLowerCase();

  if (t.includes("mera naam")) {
    memory.name = text.split(" ").pop();
    return `Ram Ram ${memory.name} sa 🙏 mhane yaad reh gyo`;
  }

  if (t.includes("tum kaun ho"))
    return "Main DNA Memory Brain hoon 🧠 jo bolta bhi hai, seekhta bhi hai";

  if (t.includes("hello") || t.includes("hi"))
    return "Ram Ram sa 🙏 bolo, main sun raha hoon";

  if (t.includes("kya") || t.includes("kiya"))
    return "Haan sa 🙂 bolo, suṇu main";

  if (t.includes("marwadi"))
    return "Ram Ram sa! Mhane Marwadi bhi aave hai 😄";

  return memory.name
    ? `Samjha ${memory.name} 👍 tumne bola: "${text}"`
    : "Achha sa 👍 main yaad rakh raha hoon";
}

/* ☁️ BACKGROUND LEARNING (NON-BLOCKING) */
function learnAsync(text) {
  setTimeout(() => {
    memory.knowledge.push(text);
    localStorage.setItem("dnaMemory", JSON.stringify(memory));

    db.collection("brains").doc("global").set(
      {
        knowledge: firebase.firestore.FieldValue.arrayUnion(text)
      },
      { merge: true }
    );
  }, 0);
}

/* 🚀 SEND */
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  addMessage(text, "user");

  const lang = detectLanguage(text);
  const reply = generateReply(text);

  addMessage(reply, "ai", true, lang);

  learnAsync(text);
  userInput.value = "";
}

/* 👋 WELCOME */
addMessage(
  memory.name
    ? `Ram Ram ${memory.name} 👋`
    : "Ram Ram sa 🙏 main DNA Memory Brain hoon",
  "ai",
  true,
  "hi"
);
