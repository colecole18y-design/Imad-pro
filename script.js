/* ===================== IMAD PRO — مزاد النجوم — Game Logic ===================== */
(function(){
"use strict";

/* ---------- Firebase (used only for the online room mode) ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyA4Ktrb_0p30tNhngkWzQ757lIPSTcIuOU",
  authDomain: "imad-pro-b1883.firebaseapp.com",
  databaseURL: "https://imad-pro-b1883-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "imad-pro-b1883",
  storageBucket: "imad-pro-b1883.firebasestorage.app",
  messagingSenderId: "67409727001",
  appId: "1:67409727001:web:c188dff61e0c4567c16488"
};
let db = null;
try {
  if (window.firebase){
    firebase.initializeApp(firebaseConfig);
    db = firebase.database();
  }
} catch (e) {
  console.warn("Firebase init failed — online mode will be unavailable.", e);
}

// Run once the DOM is fully parsed, no matter where the <script> tag sits in the page.
if (document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function init(){

/* ---------- Player database ---------- */
/* tier: 1 = famous/expensive, 2 = known, 3 = lesser known/cheap */
const PLAYERS = [
  // Goalkeepers
  {name:"أليسون بيكر", pos:"GK", price:60, rating:89, tier:1},
  {name:"تيبو كورتوا", pos:"GK", price:55, rating:88, tier:1},
  {name:"إيدرسون", pos:"GK", price:45, rating:86, tier:2},
  {name:"يان أوبلاك", pos:"GK", price:28, rating:84, tier:2},
  {name:"مانويل نوير", pos:"GK", price:15, rating:82, tier:3},
  {name:"ميكي إينيانا", pos:"GK", price:10, rating:78, tier:3},

  // Defenders
  {name:"فيرجيل فان دايك", pos:"DF", price:65, rating:90, tier:1},
  {name:"روبين دياز", pos:"DF", price:60, rating:88, tier:1},
  {name:"أنطونيو روديغر", pos:"DF", price:42, rating:86, tier:2},
  {name:"تشيرويل هيرنانديز", pos:"DF", price:38, rating:85, tier:2},
  {name:"تريغيه مبابي", pos:"DF", price:35, rating:84, tier:2},
  {name:"وليام ساليبا", pos:"DF", price:50, rating:87, tier:1},
  {name:"أليساندرو باستوني", pos:"DF", price:40, rating:85, tier:2},
  {name:"جوشكو غفارديول", pos:"DF", price:55, rating:87, tier:1},
  {name:"بن وايت", pos:"DF", price:22, rating:81, tier:3},
  {name:"نيكو شلوتربيك", pos:"DF", price:20, rating:80, tier:3},
  {name:"دان بوردي", pos:"DF", price:12, rating:76, tier:3},
  {name:"يوشكو غيندوزي", pos:"DF", price:9, rating:74, tier:3},

  // Midfielders
  {name:"كيفن دي بروين", pos:"MF", price:70, rating:90, tier:1},
  {name:"جود بيلينغهام", pos:"MF", price:90, rating:91, tier:1},
  {name:"رودري", pos:"MF", price:75, rating:90, tier:1},
  {name:"بيدري", pos:"MF", price:55, rating:87, tier:2},
  {name:"دِكلان رايس", pos:"MF", price:50, rating:86, tier:2},
  {name:"فيديريكو فالفيردي", pos:"MF", price:60, rating:88, tier:2},
  {name:"مارتن أوديغارد", pos:"MF", price:48, rating:86, tier:2},
  {name:"إنزو فيرنانديز", pos:"MF", price:45, rating:85, tier:2},
  {name:"جافي هيرنانديز", pos:"MF", price:42, rating:85, tier:2},
  {name:"إيليوت أندرسون", pos:"MF", price:14, rating:78, tier:3},
  {name:"كارني تشوكوميلا", pos:"MF", price:9, rating:75, tier:3},
  {name:"رومان بورخي", pos:"MF", price:11, rating:76, tier:3},
  {name:"أليكسيس ماك أليستر", pos:"MF", price:38, rating:84, tier:2},

  // Forwards
  {name:"كيليان مبابي", pos:"FW", price:150, rating:94, tier:1},
  {name:"إيرلينغ هالاند", pos:"FW", price:140, rating:93, tier:1},
  {name:"فينيسيوس جونيور", pos:"FW", price:120, rating:92, tier:1},
  {name:"لامين يامال", pos:"FW", price:110, rating:91, tier:1},
  {name:"هاري كين", pos:"FW", price:75, rating:88, tier:2},
  {name:"رافينيا", pos:"FW", price:55, rating:86, tier:2},
  {name:"بوكايو ساكا", pos:"FW", price:70, rating:87, tier:2},
  {name:"عثمان ديمبلي", pos:"FW", price:65, rating:86, tier:2},
  {name:"فيكتور أوسيمين", pos:"FW", price:68, rating:87, tier:2},
  {name:"رسمين دورتوند", pos:"FW", price:16, rating:79, tier:3},
  {name:"إليي وحيد", pos:"FW", price:10, rating:76, tier:3},
  {name:"كيندري بايس", pos:"FW", price:8, rating:74, tier:3},
];

const POS_LABEL = {GK:"حارس مرمى", DF:"مدافع", MF:"وسط", FW:"مهاجم"};
const POS_ICON = {GK:"🧤", DF:"🛡️", MF:"🎯", FW:"⚡"};

/* 11 rounds -> 1 GK, 4 DF, 4 MF, 2 FW */
const ROUND_POSITIONS = ["GK","DF","MF","FW","DF","MF","DF","FW","MF","DF","MF"];

/* ---------- State ---------- */
let state = null;

/* ---------- Online room state ---------- */
let onlineRole = null;     // 'host' | 'guest' | null
let roomCode = null;
let roomRef = null;
let myOnlineName = "";
let actionsListenerAttached = false;
const SESSION_KEY = "imadpro_online_session";

function freshPool(){
  return PLAYERS.map(p => Object.assign({}, p));
}

function newState(){
  return {
    mode: null,               // 'ai' | 'local' | 'online'
    p1Name: "فريق 1",
    p2Name: "فريق 2",
    difficulty: "medium",
    timerSetting: 20,
    budget: 500,
    pool: freshPool(),
    round: 0,
    squad1: [], squad2: [],
    budget1: 500, budget2: 500,
    currentPlayer: null,
    currentBid: 0,
    currentBidder: null,      // 1 | 2 | null
    activeTurn: 1,            // whose turn to act, 1 or 2
    timeLeft: 20,
    consolationPlayer: null,
    status: "playing",        // 'playing' | 'finished' (used for online sync)
    finalScore1: null,
    finalScore2: null,
    winnerText: "",
  };
}

let timerId = null; // local-only, never synced (each browser runs its own display timer)

/* ---------- DOM helpers ---------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function showScreen(id){
  $$(".screen").forEach(s => s.classList.remove("active"));
  $("#" + id).classList.add("active");
}

/* ===================== HOME SCREEN ===================== */
let selectedMode = null;

$$("#mode-grid .option-card").forEach(card => {
  card.addEventListener("click", () => {
    selectedMode = card.dataset.mode;
    $$("#mode-grid .option-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");
    $("#field-p2").hidden = selectedMode !== "local";
  });
});

$("#btn-to-setup").addEventListener("click", () => {
  const p1 = $("#input-p1").value.trim();
  const errEl = $("#home-error");
  if (!selectedMode){
    errEl.textContent = "اختر طريقة اللعب أولاً"; errEl.hidden = false; return;
  }
  if (!p1){
    errEl.textContent = "من فضلك اكتب اسمك"; errEl.hidden = false; return;
  }

  if (selectedMode === "online"){
    if (!db){
      errEl.textContent = "تعذّر الاتصال بخدمة الأونلاين — تأكد من الإنترنت"; errEl.hidden = false; return;
    }
    errEl.hidden = true;
    myOnlineName = p1;
    resetOnlineRoomUI();
    showScreen("screen-online");
    return;
  }

  let p2 = "الحاسوب 🤖";
  if (selectedMode === "local"){
    p2 = $("#input-p2").value.trim();
    if (!p2){ errEl.textContent = "اكتب اسم اللاعب الثاني"; errEl.hidden = false; return; }
  }
  errEl.hidden = true;
  state = newState();
  state.mode = selectedMode;
  state.p1Name = p1;
  state.p2Name = p2;
  showScreen("screen-setup");
});

/* ===================== ONLINE ROOM SCREEN ===================== */

function resetOnlineRoomUI(){
  $("#online-idle-card").hidden = false;
  $("#online-host-card").hidden = true;
  $("#online-guest-card").hidden = true;
  $("#online-error").hidden = true;
  $("#input-join-code").value = "";
}

function showOnlineError(msg){
  const el = $("#online-error");
  el.textContent = msg;
  el.hidden = false;
}

function generateRoomCode(){
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I
  let code = "";
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

$("#btn-create-room").addEventListener("click", () => {
  if (!db) return;
  const code = generateRoomCode();
  const ref = db.ref("rooms/" + code);
  ref.set({
    host: { name: myOnlineName },
    guest: null,
    status: "waiting",
    createdAt: Date.now(),
  }).then(() => {
    onlineRole = "host";
    roomCode = code;
    roomRef = ref;
    saveOnlineSession();
    $("#online-idle-card").hidden = true;
    $("#online-host-card").hidden = false;
    $("#room-code-display").textContent = code;
    listenForGuestJoin();
  }).catch(() => showOnlineError("تعذّر إنشاء الغرفة، حاول تاني"));
});

$("#btn-copy-code").addEventListener("click", () => {
  if (!roomCode) return;
  const finish = ok => {
    const btn = $("#btn-copy-code");
    const original = btn.textContent;
    btn.textContent = ok ? "✅ اتنسخ الرمز" : "الرمز: " + roomCode;
    setTimeout(() => { btn.textContent = original; }, 1600);
  };
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(roomCode).then(() => finish(true)).catch(() => finish(false));
  } else {
    finish(false);
  }
});

$("#btn-join-room").addEventListener("click", () => {
  if (!db) return;
  const code = $("#input-join-code").value.trim().toUpperCase();
  if (!code){ showOnlineError("اكتب رمز الغرفة أولاً"); return; }
  $("#online-error").hidden = true;
  const ref = db.ref("rooms/" + code);
  ref.once("value").then(snap => {
    if (!snap.exists()){ showOnlineError("مفيش غرفة بالرمز ده"); return; }
    const room = snap.val();
    if (room.guest){ showOnlineError("الغرفة دي مكتملة بالفعل"); return; }
    return ref.child("guest").set({ name: myOnlineName }).then(() => {
      onlineRole = "guest";
      roomCode = code;
      roomRef = ref;
      saveOnlineSession();
      $("#online-idle-card").hidden = true;
      $("#online-guest-card").hidden = false;
      listenAsGuest();
    });
  }).catch(() => showOnlineError("حصل خطأ، تأكد من الرمز وحاول تاني"));
});

$("#btn-online-back").addEventListener("click", () => {
  detachRoomListeners();
  clearOnlineSession();
  onlineRole = null; roomCode = null; roomRef = null;
  showScreen("screen-home");
});

function saveOnlineSession(){
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ roomCode, onlineRole, myOnlineName }));
  } catch (e) { /* storage unavailable — ignore, resume just won't work */ }
}
function clearOnlineSession(){
  try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
}

/* ---------- Host side: waiting for a guest ---------- */
function listenForGuestJoin(){
  roomRef.child("guest").on("value", snap => {
    const guest = snap.val();
    if (guest && guest.name){
      roomRef.child("guest").off();
      beginHostSetup(guest.name);
    }
  });
}

function beginHostSetup(guestName){
  state = newState();
  state.mode = "online";
  state.p1Name = myOnlineName;
  state.p2Name = guestName;
  $("#squad1-name").textContent = state.p1Name;
  $("#squad2-name").textContent = state.p2Name;
  showScreen("screen-setup");
}

/* ---------- Guest side: waiting for host to start ---------- */
function listenAsGuest(){
  roomRef.child("status").on("value", snap => {
    const status = snap.val();
    if (status === "playing"){
      showScreen("screen-game");
    } else if (status === "finished"){
      showScreen("screen-result");
    }
  });
  roomRef.child("state").on("value", snap => {
    if (!snap.exists()) return;
    state = snap.val();
    normalizeStateArrays();
    if (state.status === "finished"){
      renderResultFromState();
    } else if (state.currentPlayer){
      renderGameFromState();
    }
  });
  roomRef.child("host").on("value", snap => {
    const host = snap.val();
    if (host && host.name && $("#squad1-name")) $("#squad1-name").textContent = host.name;
  });
}

// Firebase can drop empty arrays / turn sparse numeric objects into plain objects —
// make sure the fields we iterate over are always real arrays.
function normalizeStateArrays(){
  if (!Array.isArray(state.squad1)) state.squad1 = state.squad1 ? Object.values(state.squad1) : [];
  if (!Array.isArray(state.squad2)) state.squad2 = state.squad2 ? Object.values(state.squad2) : [];
  if (!Array.isArray(state.pool)) state.pool = state.pool ? Object.values(state.pool) : [];
}

function detachRoomListeners(){
  if (roomRef){
    roomRef.child("guest").off();
    roomRef.child("status").off();
    roomRef.child("state").off();
    roomRef.child("host").off();
    roomRef.child("actions").off();
  }
  actionsListenerAttached = false;
}

/* ---------- Host: receive guest actions ---------- */
function listenForActions(){
  if (!roomRef || actionsListenerAttached) return;
  actionsListenerAttached = true;
  roomRef.child("actions").on("child_added", snap => {
    const action = snap.val();
    const key = snap.key;
    roomRef.child("actions/" + key).remove();
    if (!state || state.mode !== "online" || !action) return;
    if (action.type === "bid") placeBid(Number(action.amount) || 1);
    else if (action.type === "surrender") doSurrender();
  });
}

/* ---------- Guest: send an action to the host ---------- */
function sendOnlineAction(type, amount){
  if (!roomRef) return;
  roomRef.child("actions").push({ from: "guest", type, amount: amount || 0, ts: Date.now() });
}

/* ---------- Host: push the authoritative state to Firebase ---------- */
function syncOnlineState(){
  if (state.mode !== "online" || onlineRole !== "host" || !roomRef) return;
  const payload = JSON.parse(JSON.stringify(state));
  roomRef.child("state").set(payload);
}

/* ---------- Resume a session after a refresh ---------- */
function tryResumeSession(){
  if (!db) return;
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) {}
  if (!saved || !saved.roomCode || !saved.onlineRole) return;
  const ref = db.ref("rooms/" + saved.roomCode);
  ref.once("value").then(snap => {
    if (!snap.exists()){ clearOnlineSession(); return; }
    const room = snap.val();
    onlineRole = saved.onlineRole;
    roomCode = saved.roomCode;
    roomRef = ref;
    myOnlineName = saved.myOnlineName || (onlineRole === "host" ? (room.host && room.host.name) : (room.guest && room.guest.name)) || "أنا";

    if (onlineRole === "host"){
      if (room.status === "waiting"){
        showScreen("screen-online");
        $("#online-idle-card").hidden = true;
        $("#online-host-card").hidden = false;
        $("#room-code-display").textContent = roomCode;
        listenForGuestJoin();
      } else if (room.state){
        state = room.state; normalizeStateArrays();
        listenForActions();
        if (state.status === "finished"){ renderResultFromState(); showScreen("screen-result"); }
        else { showScreen("screen-game"); renderGameFromState(); }
      }
    } else {
      showScreen("screen-online");
      $("#online-idle-card").hidden = true;
      $("#online-guest-card").hidden = false;
      listenAsGuest();
    }
  }).catch(() => clearOnlineSession());
}

/* ===================== SETUP SCREEN ===================== */
let selectedDiff = "medium";
$$("#difficulty-group .pill").forEach(pill => {
  if (pill.dataset.diff === "medium") pill.classList.add("selected");
  pill.addEventListener("click", () => {
    selectedDiff = pill.dataset.diff;
    $$("#difficulty-group .pill").forEach(p => p.classList.remove("selected"));
    pill.classList.add("selected");
  });
});

$("#slider-timer").addEventListener("input", e => {
  const v = Number(e.target.value);
  $("#val-timer").textContent = v === 0 ? "بدون" : v + " ث";
});
$("#slider-budget").addEventListener("input", e => {
  $("#val-budget").textContent = e.target.value + " م";
});

$("#btn-setup-back").addEventListener("click", () => {
  if (state && state.mode === "online"){
    detachRoomListeners();
    clearOnlineSession();
    onlineRole = null; roomCode = null; roomRef = null;
  }
  showScreen("screen-home");
});

$("#btn-start-auction").addEventListener("click", () => {
  state.difficulty = selectedDiff;
  state.timerSetting = Number($("#slider-timer").value);
  state.budget = Number($("#slider-budget").value);
  state.budget1 = state.budget;
  state.budget2 = state.budget;
  $("#squad1-name").textContent = state.p1Name;
  $("#squad2-name").textContent = state.p2Name;

  if (state.mode === "online" && onlineRole === "host"){
    listenForActions();
    roomRef.update({
      status: "playing",
      settings: { difficulty: state.difficulty, timerSetting: state.timerSetting, budget: state.budget },
    });
  }
  startAuction();
});

/* ===================== AUCTION ENGINE (runs on: local player in ai/local modes, HOST only in online mode) ===================== */

function tierWeightFor(difficulty){
  if (difficulty === "easy") return [1,1,1,1,2];
  if (difficulty === "hard") return [3,3,3,2];
  return [1,2,2,3];
}

function pickPlayer(position, difficulty){
  const weights = tierWeightFor(difficulty);
  const candidates = state.pool.filter(p => p.pos === position);
  if (candidates.length === 0) return null;
  let preferred = candidates.filter(p => weights.includes(p.tier));
  const from = preferred.length ? preferred : candidates;
  const chosen = from[Math.floor(Math.random() * from.length)];
  state.pool = state.pool.filter(p => p !== chosen);
  return chosen;
}

function pickConsolation(position){
  const candidates = state.pool.filter(p => p.pos === position);
  if (candidates.length === 0) return null;
  const cheapestFirst = candidates.sort((a,b) => a.price - b.price);
  const chosen = cheapestFirst[0];
  state.pool = state.pool.filter(p => p !== chosen);
  return chosen;
}

function startAuction(){
  state.round = 0;
  state.squad1 = []; state.squad2 = [];
  renderSquads();
  showScreen("screen-game");
  nextRound();
}

function nextRound(){
  state.round++;
  if (state.round > ROUND_POSITIONS.length){
    finishAuction();
    return;
  }
  const position = ROUND_POSITIONS[state.round - 1];
  let featured = pickPlayer(position, state.difficulty);
  if (!featured){
    nextRound();
    return;
  }
  state.currentPlayer = featured;
  state.consolationPlayer = pickConsolation(position);
  state.currentBid = 0;
  state.currentBidder = null;
  state.activeTurn = (state.round % 2 === 1) ? 1 : 2;
  state.timeLeft = state.timerSetting;

  const minNeeded = featured.price + 1;
  if (state.budget1 < minNeeded && state.budget2 < minNeeded){
    resolveUnaffordableRound(featured, position);
    return;
  }

  renderGameFromState();
  startTimer();
}

function resolveUnaffordableRound(featured, position){
  renderGameFromState();
  $("#turn-line").textContent = "الميزانية غير كافية لدى الطرفين — يُحسم تلقائيًا";
  $("#bidder-line").textContent = "تسوية تلقائية";
  $("#timer-wrap").style.display = "none";
  $$("#bid-controls .btn-bid").forEach(b => b.disabled = true);
  $("#btn-surrender").disabled = true;

  const winner = state.budget1 >= state.budget2 ? 1 : 2;
  const price = Math.max(0, Math.min(featured.price, currentBudget(winner)));
  state.currentBid = price;
  state.currentBidder = winner;
  $("#current-bid").textContent = price;
  syncOnlineState();
  setTimeout(() => awardRound(winner, opponentOf(winner)), 1100);
}

function currentBudget(who){ return who === 1 ? state.budget1 : state.budget2; }
function opponentOf(who){ return who === 1 ? 2 : 1; }
function nameOf(who){ return who === 1 ? state.p1Name : state.p2Name; }

/* Is it this browser's turn to click the buttons right now? */
function isMyTurn(){
  if (!state) return false;
  if (state.mode === "ai") return state.activeTurn === 1;
  if (state.mode === "local") return true; // pass-and-play, same device
  if (state.mode === "online") return (onlineRole === "host" && state.activeTurn === 1) || (onlineRole === "guest" && state.activeTurn === 2);
  return true;
}

function updateTurnLine(){
  const isComputerTurn = state.mode === "ai" && state.activeTurn === 2;
  $("#turn-line").textContent = isComputerTurn
    ? "🤖 " + state.p2Name + " بيفكر..."
    : "دور: " + nameOf(state.activeTurn);

  const roleHint = $("#role-hint");
  if (state.mode === "online"){
    roleHint.hidden = false;
    roleHint.textContent = isMyTurn() ? "🟢 دورك دلوقتي" : "⏳ في انتظار الطرف التاني";
  } else {
    roleHint.hidden = true;
  }
}

function updateBidControlsAvailability(){
  const mine = isMyTurn();
  $$("#bid-controls .btn-bid").forEach(b => b.disabled = !mine);
  const canSurrender = state.currentBidder !== null && mine;
  $("#btn-surrender").disabled = !canSurrender;
}

/* ---------- Timer ----------
   Every client runs its own visual countdown from state.timeLeft/timerSetting.
   Only the authoritative side (host in online mode, or the sole local browser
   in ai/local modes) acts on a timeout. */
function startTimer(){
  clearInterval(timerId);
  const wrap = $("#timer-wrap");
  if (state.timerSetting === 0){
    wrap.style.display = "none";
    maybeTriggerComputerTurn();
    return;
  }
  wrap.style.display = "flex";
  renderTimer();
  const isAuthoritative = state.mode !== "online" || onlineRole === "host";
  if (!isAuthoritative) return; // guest just displays what the host syncs, doesn't tick its own logic
  timerId = setInterval(() => {
    state.timeLeft--;
    renderTimer();
    if (state.timeLeft <= 0){
      clearInterval(timerId);
      onTimeout();
    }
  }, 1000);
  maybeTriggerComputerTurn();
}

function renderTimer(){
  const pct = Math.max(0, (state.timeLeft / state.timerSetting) * 100);
  const fill = $("#timer-fill");
  fill.style.width = pct + "%";
  fill.classList.toggle("danger", state.timeLeft <= 5);
  $("#timer-num").textContent = Math.max(0, state.timeLeft);
}

function onTimeout(){
  const isComputerTurn = state.mode === "ai" && state.activeTurn === 2;
  if (isComputerTurn) return; // computer AI handles its own timing
  if (state.currentBidder === null){
    placeBid(1);
  } else {
    doSurrender();
  }
}

/* ---------- Bidding ---------- */
$$("#bid-controls .btn-bid").forEach(btn => {
  btn.addEventListener("click", () => {
    const amt = Number(btn.dataset.amt);
    if (state.mode === "online" && onlineRole === "guest") sendOnlineAction("bid", amt);
    else placeBid(amt);
  });
});
$("#btn-surrender").addEventListener("click", () => {
  if (state.mode === "online" && onlineRole === "guest") sendOnlineAction("surrender", 0);
  else doSurrender();
});

function placeBid(amount){
  const who = state.activeTurn;
  const base = state.currentPlayer.price;
  const newBid = state.currentBid === 0 ? base + amount : state.currentBid + amount;

  if (newBid > currentBudget(who)){
    if (state.mode !== "online" || onlineRole === "host") showWarning("الميزانية مش كفاية لهذا العرض");
    return;
  }

  state.currentBid = newBid;
  state.currentBidder = who;
  state.activeTurn = opponentOf(who);

  renderGameFromState();
  startTimer();
  syncOnlineState();
}

function showWarning(msg){
  const w = $("#warn-line");
  w.textContent = msg;
  w.hidden = false;
}

function doSurrender(){
  if (state.currentBidder === null) return;
  clearInterval(timerId);
  const winner = state.currentBidder;
  const loser = opponentOf(winner);
  awardRound(winner, loser);
}

function awardRound(winner, loser){
  const player = state.currentPlayer;
  const price = state.currentBid;
  if (winner === 1){ state.budget1 -= price; state.squad1.push(player); }
  else { state.budget2 -= price; state.squad2.push(player); }

  const consolation = state.consolationPlayer;
  if (consolation){
    const withRating = Object.assign({}, consolation, {price: 0, awarded:true});
    if (loser === 1) state.squad1.push(withRating);
    else state.squad2.push(withRating);
  }

  renderSquads();
  syncOnlineState();
  setTimeout(nextRound, 900);
}

/* ---------- Computer AI (only used in 'ai' mode) ---------- */
function maybeTriggerComputerTurn(){
  if (state.mode !== "ai" || state.activeTurn !== 2) return;
  const remainingSlots = ROUND_POSITIONS.length - state.round + 1;
  const reserve = Math.max(0, (remainingSlots - 1) * 4);
  const maxWillingness = Math.round(state.currentPlayer.price * (1 + Math.random() * 0.7));
  const affordable = state.budget2 - reserve;

  setTimeout(() => {
    if (!state.currentPlayer) return;
    const base = state.currentPlayer.price;
    const nextMin = state.currentBid === 0 ? base + 1 : state.currentBid + 1;

    if (nextMin <= maxWillingness && nextMin <= affordable && nextMin <= state.budget2){
      const options = [1,5,10].filter(a => {
        const bid = state.currentBid === 0 ? base + a : state.currentBid + a;
        return bid <= affordable && bid <= maxWillingness && bid <= state.budget2;
      });
      if (options.length){
        const amt = options[Math.floor(Math.random() * options.length)];
        placeBid(amt);
        return;
      }
    }
    if (state.currentBidder !== null){
      doSurrender();
    } else {
      const minBid = base + 1;
      if (minBid <= state.budget2){ placeBid(1); }
      else { doSurrender(); }
    }
  }, 700 + Math.random() * 900);
}

/* ---------- Rendering (shared by the engine owner AND by an online guest mirroring synced state) ---------- */
function renderGameFromState(){
  if (!state.currentPlayer) return;
  const position = state.currentPlayer.pos;

  $("#round-num").textContent = state.round;
  $("#round-total").textContent = ROUND_POSITIONS.length;
  $("#pos-chip").textContent = POS_ICON[position] + " " + POS_LABEL[position];
  $("#player-jersey").textContent = POS_ICON[position];
  $("#player-name").textContent = state.currentPlayer.name;
  const badge = $("#player-pos-badge");
  badge.textContent = position;
  badge.className = "badge pos-" + position;
  $("#player-base").textContent = state.currentPlayer.price;
  $("#current-bid").textContent = state.currentBid;
  $("#bidder-line").textContent = state.currentBidder ? ("أعلى عرض من: " + nameOf(state.currentBidder)) : "لا يوجد عرض بعد";
  $("#warn-line").hidden = true;

  $("#timer-wrap").style.display = state.timerSetting === 0 ? "none" : "flex";
  if (state.timerSetting !== 0) renderTimer();

  renderSquads();
  updateTurnLine();
  updateBidControlsAvailability();
}

/* ---------- Squad rendering ---------- */
function slotTemplate(list, targetCount){
  let html = "";
  for (let i = 0; i < targetCount; i++){
    const p = list[i];
    if (p){
      html += `<div class="slot filled"><span class="slot-pos">${p.pos}</span><span>${p.name}</span><span class="slot-price">${p.price}م</span></div>`;
    } else {
      html += `<div class="slot"><span class="slot-pos">—</span><span>فارغ</span><span></span></div>`;
    }
  }
  return html;
}

function renderSquads(){
  $("#squad1-budget").textContent = state.budget1;
  $("#squad2-budget").textContent = state.budget2;
  $("#squad1-slots").innerHTML = slotTemplate(state.squad1, ROUND_POSITIONS.length);
  $("#squad2-slots").innerHTML = slotTemplate(state.squad2, ROUND_POSITIONS.length);
}

/* ===================== FINISH & MATCH SIMULATION ===================== */
function finishAuction(){
  clearInterval(timerId);
  const strength1 = squadStrength(state.squad1);
  const strength2 = squadStrength(state.squad2);
  state.finalScore1 = simulateGoals(strength1);
  state.finalScore2 = simulateGoals(strength2);

  if (state.finalScore1 > state.finalScore2) state.winnerText = "🏆 " + state.p1Name + " بطل المزاد!";
  else if (state.finalScore2 > state.finalScore1) state.winnerText = "🏆 " + state.p2Name + " بطل المزاد!";
  else state.winnerText = "🤝 تعادل مثير بين الفريقين!";

  state.status = "finished";
  renderResultFromState();
  showScreen("screen-result");

  if (state.mode === "online" && onlineRole === "host"){
    syncOnlineState();
    roomRef.child("status").set("finished");
  }
}

function renderResultFromState(){
  $("#res-name1").textContent = state.p1Name;
  $("#res-name2").textContent = state.p2Name;
  $("#res-score1").textContent = state.finalScore1;
  $("#res-score2").textContent = state.finalScore2;
  $("#winner-line").textContent = state.winnerText;

  $("#res-squad1-name").textContent = state.p1Name;
  $("#res-squad2-name").textContent = state.p2Name;
  $("#res-squad1-slots").innerHTML = slotTemplate(state.squad1, ROUND_POSITIONS.length);
  $("#res-squad2-slots").innerHTML = slotTemplate(state.squad2, ROUND_POSITIONS.length);
}

function squadStrength(squad){
  if (!squad.length) return 60;
  const sum = squad.reduce((acc, p) => acc + (p.rating || 70), 0);
  return sum / squad.length;
}

function simulateGoals(avgRating){
  const chances = 10;
  const prob = Math.min(0.62, Math.max(0.06, 0.22 + (avgRating - 78) / 90));
  let goals = 0;
  for (let i = 0; i < chances; i++){
    if (Math.random() < prob) goals++;
  }
  return goals;
}

$("#btn-replay").addEventListener("click", () => {
  detachRoomListeners();
  clearOnlineSession();
  onlineRole = null; roomCode = null; roomRef = null;
  showScreen("screen-home");
  $$("#mode-grid .option-card").forEach(c => c.classList.remove("selected"));
  $("#field-p2").hidden = true;
  $("#input-p1").value = "";
  $("#input-p2").value = "";
  selectedMode = null;
  state = null;
});

tryResumeSession();

} // end init()

})();
