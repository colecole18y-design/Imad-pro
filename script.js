/* ===================== IMAD PRO — مزاد النجوم — Game Logic ===================== */

/* Visible on-page error banner — if anything throws anywhere in this file, show it
   directly on screen instead of failing silently. Lets us diagnose real bugs from
   a screenshot alone, without needing browser dev tools. */
window.addEventListener("error", function(e){
  try {
    var banner = document.getElementById("js-error-banner");
    if (!banner){
      banner = document.createElement("div");
      banner.id = "js-error-banner";
      banner.style.cssText = "position:fixed;top:0;left:0;right:0;background:#e6394a;color:#fff;" +
        "padding:10px 14px;font-size:12px;z-index:99999;direction:rtl;text-align:right;" +
        "font-family:sans-serif;line-height:1.6;box-shadow:0 2px 10px rgba(0,0,0,0.4);";
      document.body.appendChild(banner);
    }
    var msg = (e && e.message) ? e.message : "خطأ غير معروف";
    var file = (e && e.filename) ? e.filename.split("/").pop() : "";
    var line = (e && e.lineno) ? e.lineno : "?";
    banner.textContent = "⚠️ خطأ برمجي: " + msg + " — " + file + ":" + line;
  } catch (err) { /* if even the banner fails, give up silently */ }
});

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
  // ===================== Goalkeepers =====================
  {name:"أليسون بيكر", pos:"GK", price:60, rating:89, tier:1, club:"ليفربول"},
  {name:"تيبو كورتوا", pos:"GK", price:55, rating:88, tier:1, club:"ريال مدريد"},
  {name:"إيدرسون", pos:"GK", price:45, rating:86, tier:2, club:"مانشستر سيتي"},
  {name:"يان أوبلاك", pos:"GK", price:28, rating:84, tier:2, club:"أتلتيكو مدريد"},
  {name:"مانويل نوير", pos:"GK", price:15, rating:82, tier:3, club:"بايرن ميونخ"},
  {name:"ميكي إينيانا", pos:"GK", price:10, rating:78, tier:3, club:"برشلونة"},
  {name:"إيكر كاسياس", pos:"GK", price:50, rating:88, tier:1, club:"ريال مدريد (معتزل)"},
  {name:"جانلويجي بوفون", pos:"GK", price:45, rating:90, tier:1, club:"يوفنتوس (معتزل)"},
  {name:"ديفيد رايا", pos:"GK", price:35, rating:85, tier:2, club:"أرسنال"},
  {name:"ديوغو كوستا", pos:"GK", price:38, rating:85, tier:2, club:"بورتو"},
  {name:"مايك ماينيان", pos:"GK", price:36, rating:85, tier:2, club:"ميلان"},
  {name:"مارك أندريه تير شتيغن", pos:"GK", price:40, rating:86, tier:2, club:"برشلونة"},
  {name:"يان سومر", pos:"GK", price:30, rating:84, tier:2, club:"إنتر ميلان"},
  {name:"إيميليانو مارتينيز", pos:"GK", price:33, rating:85, tier:2, club:"أستون فيلا"},
  {name:"كيبا أريزابالاغا", pos:"GK", price:18, rating:80, tier:3, club:"بورنموث"},
  {name:"نيك بوب", pos:"GK", price:22, rating:81, tier:3, club:"نيوكاسل"},
  {name:"جوردان بيكفورد", pos:"GK", price:24, rating:82, tier:3, club:"إيفرتون"},
  {name:"أندريه أونانا", pos:"GK", price:26, rating:82, tier:3, club:"مانشستر يونايتد"},
  {name:"جانلويجي دوناروما", pos:"GK", price:42, rating:86, tier:2, club:"باريس سان جيرمان"},
  {name:"كيلور نافاس", pos:"GK", price:14, rating:80, tier:3, club:"كوستاريكا (معتزل دوليًا)"},
  {name:"بيتر تشيك", pos:"GK", price:20, rating:84, tier:3, club:"تشيلسي (معتزل)"},
  {name:"إدوين فان der سار", pos:"GK", price:20, rating:84, tier:3, club:"مانشستر يونايتد (معتزل)"},
  {name:"أوليفر كان", pos:"GK", price:22, rating:85, tier:3, club:"بايرن ميونخ (معتزل)"},
  {name:"بيتر شمايكل", pos:"GK", price:20, rating:84, tier:3, club:"مانشستر يونايتد (معتزل)"},
  {name:"دينو زوف", pos:"GK", price:16, rating:82, tier:3, club:"إيطاليا (معتزل)"},
  {name:"فابيان بارتيز", pos:"GK", price:14, rating:81, tier:3, club:"فرنسا (معتزل)"},
  {name:"ديفيد سيمان", pos:"GK", price:14, rating:81, tier:3, club:"أرسنال (معتزل)"},
  {name:"أونان سيميون", pos:"GK", price:20, rating:82, tier:3, club:"أتلتيكو مدريد"},
  {name:"يونس بونو", pos:"GK", price:18, rating:81, tier:3, club:"الهلال"},
  {name:"فيسنتي غوايتا", pos:"GK", price:13, rating:79, tier:3, club:"كريستال بالاس"},
  {name:"هوغو لوريس", pos:"GK", price:12, rating:79, tier:3, club:"لوس أنجلوس إف سي"},
  {name:"لوكاس شيفالييه", pos:"GK", price:19, rating:81, tier:3, club:"باريس سان جيرمان"},
  {name:"أليكسندر نوبل", pos:"GK", price:9, rating:76, tier:3, club:"شتوتغارت"},
  {name:"سام جونستون", pos:"GK", price:8, rating:75, tier:3, club:"وستهام"},
  {name:"روي كارول", pos:"GK", price:6, rating:73, tier:3, club:"إنجلترا (معتزل)"},
  {name:"جوردي كودينا", pos:"GK", price:7, rating:74, tier:3, club:"إسبانيول"},

  // ===================== Defenders =====================
  {name:"فيرجيل فان دايك", pos:"DF", price:65, rating:90, tier:1, club:"ليفربول"},
  {name:"روبين دياز", pos:"DF", price:60, rating:88, tier:1, club:"مانشستر سيتي"},
  {name:"أنطونيو روديغر", pos:"DF", price:42, rating:86, tier:2, club:"ريال مدريد"},
  {name:"تشيرويل هيرنانديز", pos:"DF", price:38, rating:85, tier:2, club:"أستون فيلا"},
  {name:"تريغيه مبابي", pos:"DF", price:35, rating:84, tier:2, club:"موناكو"},
  {name:"وليام ساليبا", pos:"DF", price:50, rating:87, tier:1, club:"أرسنال"},
  {name:"أليساندرو باستوني", pos:"DF", price:40, rating:85, tier:2, club:"إنتر ميلان"},
  {name:"جوشكو غفارديول", pos:"DF", price:55, rating:87, tier:1, club:"مانشستر سيتي"},
  {name:"بن وايت", pos:"DF", price:22, rating:81, tier:3, club:"أرسنال"},
  {name:"نيكو شلوتربيك", pos:"DF", price:20, rating:80, tier:3, club:"بوروسيا دورتموند"},
  {name:"دان بوردي", pos:"DF", price:12, rating:76, tier:3, club:"برايتون"},
  {name:"يوشكو غيندوزي", pos:"DF", price:9, rating:74, tier:3, club:"لاتسيو"},
  {name:"باولو مالديني", pos:"DF", price:55, rating:89, tier:1, club:"ميلان (معتزل)"},
  {name:"روبرتو كارلوس", pos:"DF", price:48, rating:88, tier:1, club:"ريال مدريد (معتزل)"},
  {name:"إدير ميليتاو", pos:"DF", price:44, rating:86, tier:2, club:"ريال مدريد"},
  {name:"ماركينيوس", pos:"DF", price:46, rating:86, tier:2, club:"باريس سان جيرمان"},
  {name:"كيم مين جاي", pos:"DF", price:40, rating:85, tier:2, club:"بايرن ميونخ"},
  {name:"إبراهيما كوناتيه", pos:"DF", price:38, rating:85, tier:2, club:"ليفربول"},
  {name:"جول كوندي", pos:"DF", price:36, rating:84, tier:2, club:"برشلونة"},
  {name:"كريستيان روميرو", pos:"DF", price:34, rating:84, tier:2, club:"توتنهام"},
  {name:"ليساندرو مارتينيز", pos:"DF", price:32, rating:84, tier:2, club:"مانشستر يونايتد"},
  {name:"تيو هيرنانديز", pos:"DF", price:45, rating:86, tier:2, club:"الهلال"},
  {name:"ألفونسو ديفيز", pos:"DF", price:42, rating:85, tier:2, club:"بايرن ميونخ"},
  {name:"ترينت ألكسندر أرنولد", pos:"DF", price:48, rating:86, tier:2, club:"ريال مدريد"},
  {name:"أشرف حكيمي", pos:"DF", price:50, rating:87, tier:1, club:"باريس سان جيرمان"},
  {name:"كايل ووكر", pos:"DF", price:20, rating:80, tier:3, club:"ميلان"},
  {name:"ريس جيمس", pos:"DF", price:28, rating:82, tier:3, club:"تشيلسي"},
  {name:"ماركوس كوكوريا", pos:"DF", price:24, rating:81, tier:3, club:"تشيلسي"},
  {name:"أندرو روبرتسون", pos:"DF", price:26, rating:82, tier:3, club:"ليفربول"},
  {name:"كيران تريبير", pos:"DF", price:18, rating:80, tier:3, club:"نيوكاسل"},
  {name:"مانويل أكانجي", pos:"DF", price:22, rating:81, tier:3, club:"مانشستر سيتي"},
  {name:"باو كوبارسي", pos:"DF", price:30, rating:83, tier:2, club:"برشلونة"},
  {name:"ليفي كولويل", pos:"DF", price:16, rating:79, tier:3, club:"تشيلسي"},
  {name:"ميكي فان دي فين", pos:"DF", price:19, rating:80, tier:3, club:"توتنهام"},
  {name:"بييرو هينكابيه", pos:"DF", price:17, rating:80, tier:3, club:"باير ليفركوزن"},
  {name:"سيرجيو راموس", pos:"DF", price:24, rating:83, tier:2, club:"مونتيري"},
  {name:"جيرارد بيكيه", pos:"DF", price:36, rating:86, tier:2, club:"برشلونة (معتزل)"},
  {name:"كارليس بويول", pos:"DF", price:32, rating:85, tier:2, club:"برشلونة (معتزل)"},
  {name:"فابيو كانافارو", pos:"DF", price:34, rating:86, tier:2, club:"إيطاليا (معتزل)"},
  {name:"مارسيل ديسايي", pos:"DF", price:30, rating:85, tier:2, club:"فرنسا (معتزل)"},
  {name:"ريو فرديناند", pos:"DF", price:32, rating:85, tier:2, club:"مانشستر يونايتد (معتزل)"},
  {name:"جون تيري", pos:"DF", price:34, rating:86, tier:2, club:"تشيلسي (معتزل)"},
  {name:"أشلي كول", pos:"DF", price:24, rating:83, tier:2, club:"إنجلترا (معتزل)"},
  {name:"فيليب لام", pos:"DF", price:36, rating:87, tier:1, club:"بايرن ميونخ (معتزل)"},
  {name:"داني ألفيس", pos:"DF", price:28, rating:84, tier:2, club:"برشلونة (معتزل)"},
  {name:"ليليان تورام", pos:"DF", price:26, rating:84, tier:2, club:"فرنسا (معتزل)"},
  {name:"أليساندرو نيستا", pos:"DF", price:28, rating:85, tier:2, club:"إيطاليا (معتزل)"},
  {name:"خافيير زانيتي", pos:"DF", price:26, rating:84, tier:2, club:"إنتر ميلان (معتزل)"},
  {name:"باتريس إيفرا", pos:"DF", price:20, rating:82, tier:3, club:"مانشستر يونايتد (معتزل)"},
  {name:"جاري نيفيل", pos:"DF", price:16, rating:80, tier:3, club:"مانشستر يونايتد (معتزل)"},
  {name:"كافو", pos:"DF", price:26, rating:87, tier:2, club:"البرازيل (معتزل)"},
  {name:"جورجيو كيليني", pos:"DF", price:24, rating:84, tier:2, club:"يوفنتوس (معتزل)"},
  {name:"ليوناردو بونوتشي", pos:"DF", price:16, rating:81, tier:3, club:"إيطاليا (معتزل)"},
  {name:"تياغو سيلفا", pos:"DF", price:14, rating:80, tier:3, club:"فلومينينسي"},
  {name:"دافيد ألابا", pos:"DF", price:30, rating:83, tier:2, club:"ريال مدريد"},
  {name:"بنجامين بافار", pos:"DF", price:20, rating:81, tier:3, club:"إنتر ميلان"},
  {name:"رافائيل فاران", pos:"DF", price:18, rating:80, tier:3, club:"مانشستر يونايتد (معتزل)"},
  {name:"ناثان أكيه", pos:"DF", price:16, rating:80, tier:3, club:"مانشستر سيتي"},
  {name:"يوريان تيمبر", pos:"DF", price:22, rating:81, tier:3, club:"أرسنال"},
  {name:"ويسلي فوفانا", pos:"DF", price:15, rating:79, tier:3, club:"تشيلسي"},
  {name:"دايوت أوباميكانو", pos:"DF", price:19, rating:80, tier:3, club:"بايرن ميونخ"},
  {name:"إيبراهيم كوناتيه الثاني", pos:"DF", price:10, rating:76, tier:3, club:"موناكو"},
  {name:"جوناثان تاه", pos:"DF", price:14, rating:79, tier:3, club:"بايرن ميونخ"},

  // ===================== Midfielders =====================
  {name:"كيفن دي بروين", pos:"MF", price:70, rating:90, tier:1, club:"نابولي"},
  {name:"جود بيلينغهام", pos:"MF", price:90, rating:91, tier:1, club:"ريال مدريد"},
  {name:"رودري", pos:"MF", price:75, rating:90, tier:1, club:"مانشستر سيتي"},
  {name:"بيدري", pos:"MF", price:55, rating:87, tier:2, club:"برشلونة"},
  {name:"دِكلان رايس", pos:"MF", price:50, rating:86, tier:2, club:"أرسنال"},
  {name:"فيديريكو فالفيردي", pos:"MF", price:60, rating:88, tier:2, club:"ريال مدريد"},
  {name:"مارتن أوديغارد", pos:"MF", price:48, rating:86, tier:2, club:"أرسنال"},
  {name:"إنزو فيرنانديز", pos:"MF", price:45, rating:85, tier:2, club:"تشيلسي"},
  {name:"جافي هيرنانديز", pos:"MF", price:42, rating:85, tier:2, club:"برشلونة"},
  {name:"إيليوت أندرسون", pos:"MF", price:14, rating:78, tier:3, club:"نوتنغهام فورست"},
  {name:"كارني تشوكوميلا", pos:"MF", price:9, rating:75, tier:3, club:"برايتون"},
  {name:"رومان بورخي", pos:"MF", price:11, rating:76, tier:3, club:"فولفسبورغ"},
  {name:"أليكسيس ماك أليستر", pos:"MF", price:38, rating:84, tier:2, club:"ليفربول"},
  {name:"زين الدين زيدان", pos:"MF", price:90, rating:93, tier:1, club:"ريال مدريد (معتزل)"},
  {name:"أندريا بيرلو", pos:"MF", price:60, rating:89, tier:1, club:"يوفنتوس (معتزل)"},
  {name:"ستيفن جيرارد", pos:"MF", price:58, rating:89, tier:1, club:"ليفربول (معتزل)"},
  {name:"توني كروس", pos:"MF", price:50, rating:88, tier:2, club:"ريال مدريد (معتزل)"},
  {name:"لوكا مودريتش", pos:"MF", price:44, rating:87, tier:2, club:"ميلان"},
  {name:"كاسيميرو", pos:"MF", price:24, rating:82, tier:3, club:"مانشستر يونايتد"},
  {name:"أوريلين تشواميني", pos:"MF", price:42, rating:85, tier:2, club:"ريال مدريد"},
  {name:"إدواردو كامافينغا", pos:"MF", price:40, rating:85, tier:2, club:"ريال مدريد"},
  {name:"مويسيس كايسيدو", pos:"MF", price:44, rating:85, tier:2, club:"تشيلسي"},
  {name:"ميسون ماونت", pos:"MF", price:16, rating:79, tier:3, club:"مانشستر يونايتد"},
  {name:"جيمس مادينسون", pos:"MF", price:20, rating:81, tier:3, club:"توتنهام"},
  {name:"برونو فيرنانديز", pos:"MF", price:46, rating:86, tier:2, club:"مانشستر يونايتد"},
  {name:"كول بالمر", pos:"MF", price:52, rating:87, tier:2, club:"تشيلسي"},
  {name:"فلوريان فيرتز", pos:"MF", price:80, rating:89, tier:1, club:"بايرن ميونخ"},
  {name:"جمال موسيالا", pos:"MF", price:62, rating:88, tier:1, club:"بايرن ميونخ"},
  {name:"فرينكي دي يونغ", pos:"MF", price:26, rating:82, tier:3, club:"برشلونة"},
  {name:"إيلكاي غوندوغان", pos:"MF", price:18, rating:80, tier:3, club:"مانشستر سيتي"},
  {name:"توماس مولر", pos:"MF", price:12, rating:79, tier:3, club:"فانكوفر وايتكابس"},
  {name:"سيرجيو بوسكيتس", pos:"MF", price:14, rating:79, tier:3, club:"إنتر ميامي"},
  {name:"أندريس إنييستا", pos:"MF", price:24, rating:83, tier:2, club:"برشلونة (معتزل)"},
  {name:"تشابي ألونسو", pos:"MF", price:22, rating:83, tier:2, club:"ريال مدريد (معتزل)"},
  {name:"بول سكولز", pos:"MF", price:20, rating:82, tier:3, club:"مانشستر يونايتد (معتزل)"},
  {name:"باتريك فييرا", pos:"MF", price:18, rating:82, tier:3, club:"أرسنال (معتزل)"},
  {name:"روي كين", pos:"MF", price:16, rating:81, tier:3, club:"مانشستر يونايتد (معتزل)"},
  {name:"مايكل بالاك", pos:"MF", price:20, rating:82, tier:3, club:"ألمانيا (معتزل)"},
  {name:"مايكل إيسيان", pos:"MF", price:14, rating:80, tier:3, club:"تشيلسي (معتزل)"},
  {name:"ياya توريه", pos:"MF", price:14, rating:80, tier:3, club:"مانشستر سيتي (معتزل)"},
  {name:"كلود ماكيليلي", pos:"MF", price:12, rating:79, tier:3, club:"تشيلسي (معتزل)"},
  {name:"ديكو", pos:"MF", price:16, rating:81, tier:3, club:"برشلونة (معتزل)"},
  {name:"كاكا", pos:"MF", price:36, rating:90, tier:2, club:"ميلان (معتزل)"},
  {name:"لويس فيغو", pos:"MF", price:32, rating:88, tier:2, club:"ريال مدريد (معتزل)"},
  {name:"ديفيد بيكهام", pos:"MF", price:28, rating:87, tier:2, club:"مانشستر يونايتد (معتزل)"},
  {name:"فرانك لامبارد", pos:"MF", price:26, rating:84, tier:2, club:"تشيلسي (معتزل)"},
  {name:"يوهان كرويف", pos:"MF", price:38, rating:92, tier:1, club:"أياكس (معتزل)"},
  {name:"جينارو غاتوزو", pos:"MF", price:12, rating:79, tier:3, club:"ميلان (معتزل)"},
  {name:"إدغار ديفيدز", pos:"MF", price:12, rating:79, tier:3, club:"هولندا (معتزل)"},
  {name:"كلارنس سيدورف", pos:"MF", price:18, rating:81, tier:3, club:"ميلان (معتزل)"},
  {name:"روي كوستا", pos:"MF", price:16, rating:80, tier:3, club:"البرتغال (معتزل)"},
  {name:"ماركو فيراتي", pos:"MF", price:20, rating:82, tier:3, club:"العربي القطري"},
  {name:"نغولو كانتي", pos:"MF", price:18, rating:81, tier:3, club:"الاتحاد السعودي"},
  {name:"بول بوغبا", pos:"MF", price:16, rating:80, tier:3, club:"موناكو"},
  {name:"كريستيان إريكسن", pos:"MF", price:14, rating:79, tier:3, club:"مانشستر يونايتد"},
  {name:"ماركو رويس", pos:"MF", price:12, rating:79, tier:3, club:"بايرن ميونخ"},
  {name:"إسكو", pos:"MF", price:10, rating:77, tier:3, club:"بيتيس"},
  {name:"دييغو كين", pos:"MF", price:7, rating:74, tier:3, club:"يوفنتوس"},
  {name:"وارن زايري إيمري", pos:"MF", price:15, rating:79, tier:3, club:"باريس سان جيرمان"},

  // ===================== Forwards =====================
  {name:"كيليان مبابي", pos:"FW", price:150, rating:94, tier:1, club:"ريال مدريد"},
  {name:"إيرلينغ هالاند", pos:"FW", price:140, rating:93, tier:1, club:"مانشستر سيتي"},
  {name:"فينيسيوس جونيور", pos:"FW", price:120, rating:92, tier:1, club:"ريال مدريد"},
  {name:"لامين يامال", pos:"FW", price:110, rating:91, tier:1, club:"برشلونة"},
  {name:"هاري كين", pos:"FW", price:75, rating:88, tier:2, club:"بايرن ميونخ"},
  {name:"رافينيا", pos:"FW", price:55, rating:86, tier:2, club:"برشلونة"},
  {name:"بوكايو ساكا", pos:"FW", price:70, rating:87, tier:2, club:"أرسنال"},
  {name:"عثمان ديمبلي", pos:"FW", price:65, rating:86, tier:2, club:"باريس سان جيرمان"},
  {name:"فيكتور أوسيمين", pos:"FW", price:68, rating:87, tier:2, club:"نابولي"},
  {name:"رسمين دورتوند", pos:"FW", price:16, rating:79, tier:3, club:"موناكو"},
  {name:"إليي وحيد", pos:"FW", price:10, rating:76, tier:3, club:"وست هام"},
  {name:"كيندري بايس", pos:"FW", price:8, rating:74, tier:3, club:"لايبزيغ"},
  {name:"رونالدو نازاريو", pos:"FW", price:100, rating:96, tier:1, club:"ريال مدريد (معتزل)"},
  {name:"رونالدينيو", pos:"FW", price:95, rating:94, tier:1, club:"برشلونة (معتزل)"},
  {name:"دييغو مارادونا", pos:"FW", price:130, rating:95, tier:1, club:"نابولي (معتزل)"},
  {name:"بيليه", pos:"FW", price:130, rating:96, tier:1, club:"سانتوس (معتزل)"},
  {name:"روبرت ليفاندوفسكي", pos:"FW", price:70, rating:89, tier:2, club:"برشلونة"},
  {name:"كريم بنزيما", pos:"FW", price:40, rating:86, tier:2, club:"الاتحاد السعودي"},
  {name:"محمد صلاح", pos:"FW", price:85, rating:89, tier:1, club:"ليفربول"},
  {name:"سون هيونغ مين", pos:"FW", price:30, rating:84, tier:2, club:"لوس أنجلوس إف سي"},
  {name:"رودريغو", pos:"FW", price:80, rating:88, tier:2, club:"ريال مدريد"},
  {name:"نيكو ويليامز", pos:"FW", price:60, rating:86, tier:2, club:"أتلتيك بيلباو"},
  {name:"خوليان ألفاريز", pos:"FW", price:65, rating:87, tier:2, club:"أتلتيكو مدريد"},
  {name:"ألكسندر إيزاك", pos:"FW", price:72, rating:87, tier:2, club:"ليفربول"},
  {name:"دارون نونيز", pos:"FW", price:35, rating:83, tier:2, club:"الهلال"},
  {name:"سيرو غيراسي", pos:"FW", price:38, rating:84, tier:2, club:"بوروسيا دورتموند"},
  {name:"مايكل أوليسيه", pos:"FW", price:45, rating:85, tier:2, club:"بايرن ميونخ"},
  {name:"ليروي ساني", pos:"FW", price:20, rating:81, tier:3, club:"غلطة سراي"},
  {name:"أنطوان غريزمان", pos:"FW", price:22, rating:82, tier:3, club:"أتلتيكو مدريد"},
  {name:"ماركوس راشفورد", pos:"FW", price:24, rating:82, tier:3, club:"برشلونة"},
  {name:"فيل فودين", pos:"FW", price:58, rating:87, tier:2, club:"مانشستر سيتي"},
  {name:"جاك جريليش", pos:"FW", price:18, rating:80, tier:3, club:"إيفرتون"},
  {name:"غابرييل جيسوس", pos:"FW", price:20, rating:81, tier:3, club:"أرسنال"},
  {name:"تيمو فيرنر", pos:"FW", price:10, rating:76, tier:3, club:"لايبزيغ"},
  {name:"دوسان فلاهوفيتش", pos:"FW", price:32, rating:83, tier:2, club:"يوفنتوس"},
  {name:"راندال كولو مواني", pos:"FW", price:26, rating:82, tier:3, club:"يوفنتوس"},
  {name:"أديمولا لوكمان", pos:"FW", price:28, rating:83, tier:2, club:"أتالانتا"},
  {name:"خفيتشا كفاراتسخيليا", pos:"FW", price:55, rating:86, tier:2, club:"باريس سان جيرمان"},
  {name:"رافاييل ليان", pos:"FW", price:48, rating:86, tier:2, club:"ميلان"},
  {name:"كريستوفر نكونكو", pos:"FW", price:14, rating:79, tier:3, club:"ميلان"},
  {name:"كودي غاكبو", pos:"FW", price:30, rating:83, tier:2, club:"ليفربول"},
  {name:"ويسام بن يدر", pos:"FW", price:9, rating:75, tier:3, club:"موناكو"},
  {name:"مويز كين", pos:"FW", price:12, rating:78, tier:3, club:"فيورنتينا"},
  {name:"تيري هنري", pos:"FW", price:60, rating:92, tier:1, club:"أرسنال (معتزل)"},
  {name:"ديدييه دروغبا", pos:"FW", price:52, rating:88, tier:1, club:"تشيلسي (معتزل)"},
  {name:"صامويل إيتو", pos:"FW", price:48, rating:87, tier:1, club:"الكاميرون (معتزل)"},
  {name:"روود فان نيستلروي", pos:"FW", price:44, rating:87, tier:1, club:"مانشستر يونايتد (معتزل)"},
  {name:"آلان شيرر", pos:"FW", price:42, rating:87, tier:1, club:"نيوكاسل (معتزل)"},
  {name:"مايكل أوين", pos:"FW", price:34, rating:85, tier:2, club:"ليفربول (معتزل)"},
  {name:"واين روني", pos:"FW", price:38, rating:86, tier:2, club:"مانشستر يونايتد (معتزل)"},
  {name:"فرناندو توريس", pos:"FW", price:32, rating:85, tier:2, club:"ليفربول (معتزل)"},
  {name:"ديفيد فيا", pos:"FW", price:28, rating:84, tier:2, club:"إسبانيا (معتزل)"},
  {name:"لويس سواريز", pos:"FW", price:20, rating:82, tier:3, club:"إنتر ميامي"},
  {name:"زلاتان إبراهيموفيتش", pos:"FW", price:34, rating:89, tier:2, club:"ميلان (معتزل)"},
  {name:"أندريه شيفتشينكو", pos:"FW", price:36, rating:89, tier:2, club:"ميلان (معتزل)"},
  {name:"راؤول غونزاليس", pos:"FW", price:38, rating:86, tier:2, club:"ريال مدريد (معتزل)"},
  {name:"فيليبو إنزاغي", pos:"FW", price:24, rating:83, tier:2, club:"ميلان (معتزل)"},
  {name:"غابرييل باتيستوتا", pos:"FW", price:32, rating:85, tier:2, club:"الأرجنتين (معتزل)"},
  {name:"هيرنان كريسبو", pos:"FW", price:18, rating:81, tier:3, club:"الأرجنتين (معتزل)"},
  {name:"جورج ويا", pos:"FW", price:22, rating:83, tier:2, club:"ميلان (معتزل)"},
  {name:"روبرتو باجيو", pos:"FW", price:30, rating:85, tier:2, club:"إيطاليا (معتزل)"},
  {name:"فرانشيسكو توتي", pos:"FW", price:34, rating:86, tier:2, club:"روما (معتزل)"},
  {name:"أليساندرو ديل بييرو", pos:"FW", price:30, rating:85, tier:2, club:"يوفنتوس (معتزل)"},
  {name:"روبي فاولر", pos:"FW", price:14, rating:80, tier:3, club:"ليفربول (معتزل)"},
  {name:"إيمانويل أديبايور", pos:"FW", price:8, rating:75, tier:3, club:"توغو (معتزل)"},
  {name:"نيمار جونيور", pos:"FW", price:35, rating:84, tier:2, club:"سانتوس"},
  {name:"دينيس بيرغكامب", pos:"FW", price:26, rating:84, tier:2, club:"أرسنال (معتزل)"},

  // ===================== Extra Goalkeepers =====================
  {name:"لوريس كارريوس", pos:"GK", price:12, rating:78, tier:3, club:"برشلونة"},
  {name:"أرميل بيلا كوتشاب", pos:"GK", price:10, rating:77, tier:3, club:"سبورتينغ لشبونة"},
  {name:"جانلوكا بالوتيلي", pos:"GK", price:6, rating:72, tier:3, club:"جنوى"},
  {name:"أندرياس لونيرغان", pos:"GK", price:9, rating:76, tier:3, club:"وست هام"},
  {name:"إيمي مارتن", pos:"GK", price:11, rating:77, tier:3, club:"لايبزيغ"},
  {name:"روبن أولسن", pos:"GK", price:7, rating:74, tier:3, club:"أستون فيلا"},
  {name:"بيار غاسيه", pos:"GK", price:5, rating:72, tier:3, club:"موناكو"},
  {name:"فيليب يوريتشيتش", pos:"GK", price:8, rating:75, tier:3, club:"يوفنتوس"},
  {name:"ألفونس أريولا", pos:"GK", price:13, rating:78, tier:3, club:"وست هام"},

  // ===================== Extra Defenders =====================
  {name:"ماركوس أكونيا", pos:"DF", price:14, rating:79, tier:3, club:"إشبيلية"},
  {name:"نيكولا ميلينكوفيتش سافيتش", pos:"DF", price:22, rating:81, tier:3, club:"يوفنتوس"},
  {name:"مينامينو تاكومي", pos:"MF", price:9, rating:76, tier:3, club:"مونشنغلادباخ"},
  {name:"عاطف البنا", pos:"DF", price:5, rating:72, tier:3, club:"الأهلي"},
  {name:"أحمد فتحي", pos:"DF", price:6, rating:73, tier:3, club:"الأهلي (معتزل)"},
  {name:"محمد عبد الشافي", pos:"DF", price:5, rating:72, tier:3, club:"الأهلي"},
  {name:"عمرو السولية", pos:"DF", price:6, rating:73, tier:3, club:"الأهلي"},
  {name:"أحمد حجازي", pos:"DF", price:7, rating:74, tier:3, club:"الاتحاد السعودي"},
  {name:"محمود متولي", pos:"DF", price:5, rating:71, tier:3, club:"الأهلي"},
  {name:"رامي ربيعة", pos:"DF", price:6, rating:73, tier:3, club:"الأهلي"},
  {name:"دييغو غودين", pos:"DF", price:16, rating:81, tier:3, club:"الأوروغواي (معتزل)"},
  {name:"جيروم بواتنغ", pos:"DF", price:14, rating:80, tier:3, club:"سالزبورغ (معتزل)"},
  {name:"مارسيلو", pos:"DF", price:24, rating:83, tier:2, club:"فلومينينسي (معتزل)"},
  {name:"إيريك غارسيا", pos:"DF", price:16, rating:80, tier:3, club:"برشلونة"},
  {name:"جوش كيميتش", pos:"DF", price:32, rating:84, tier:2, club:"بايرن ميونخ"},
  {name:"لوكاس هيرنانديز", pos:"DF", price:20, rating:81, tier:3, club:"باريس سان جيرمان"},
  {name:"سيرجي جينابري", pos:"MF", price:11, rating:78, tier:3, club:"بايرن ميونخ"},
  {name:"مالو غوستو", pos:"DF", price:14, rating:79, tier:3, club:"تشيلسي"},
  {name:"جوليان رايرسون", pos:"DF", price:12, rating:78, tier:3, club:"بوروسيا دورتموند"},
  {name:"أليخاندرو بالدي", pos:"DF", price:24, rating:82, tier:2, club:"برشلونة"},
  {name:"كريستوف كابا", pos:"DF", price:9, rating:76, tier:3, club:"موناكو"},

  // ===================== Extra Midfielders =====================
  {name:"محمد النني", pos:"MF", price:9, rating:76, tier:3, club:"الأهلي"},
  {name:"طاهر محمد طاهر", pos:"MF", price:8, rating:75, tier:3, club:"الأهلي"},
  {name:"عمرو السيد", pos:"MF", price:6, rating:73, tier:3, club:"الأهلي"},
  {name:"أليو ديانج", pos:"MF", price:10, rating:77, tier:3, club:"الأهلي"},
  {name:"محمد شريف", pos:"FW", price:9, rating:76, tier:3, club:"الزمالك"},
  {name:"جوردي ألبا", pos:"DF", price:14, rating:79, tier:3, club:"إنتر ميامي"},
  {name:"سيسك فابريغاس", pos:"MF", price:16, rating:80, tier:3, club:"كومو (معتزل)"},
  {name:"داني باريخو", pos:"MF", price:12, rating:78, tier:3, club:"فياريال"},
  {name:"إيدين هازارد", pos:"MF", price:18, rating:81, tier:3, club:"تشيلسي (معتزل)"},
  {name:"مارتن كيلمان", pos:"MF", price:9, rating:76, tier:3, club:"توتنهام"},
  {name:"يوري تيليمانس", pos:"MF", price:14, rating:79, tier:3, club:"أستون فيلا"},
  {name:"سكوت ماكتوميناي", pos:"MF", price:20, rating:81, tier:3, club:"نابولي"},
  {name:"أدريان راباو", pos:"MF", price:12, rating:78, tier:3, club:"مرسيليا"},
  {name:"غرانيت تشاكا", pos:"MF", price:14, rating:79, tier:3, club:"باير ليفركوزن"},
  {name:"إيلي واي", pos:"MF", price:8, rating:75, tier:3, club:"مونبلييه"},
  {name:"أوريلي تشوامني الثاني", pos:"MF", price:7, rating:74, tier:3, club:"موناكو"},
  {name:"خواو نيفيش", pos:"MF", price:32, rating:83, tier:2, club:"مانشستر سيتي"},
  {name:"ريان جرافينبيرخ", pos:"MF", price:24, rating:82, tier:3, club:"ليفربول"},
  {name:"مارتن سواريز", pos:"MF", price:7, rating:74, tier:3, club:"بنفيكا"},
  {name:"أنخيل دي ماريا", pos:"MF", price:16, rating:80, tier:3, club:"بنفيكا"},
  {name:"باولو ديبالا", pos:"MF", price:26, rating:82, tier:3, club:"روما"},
  {name:"نيكولو باريلا", pos:"MF", price:24, rating:82, tier:3, club:"إنتر ميلان"},
  {name:"هاكان تشالهان أوغلو", pos:"MF", price:18, rating:81, tier:3, club:"إنتر ميلان"},
  {name:"سانديرو تونالي", pos:"MF", price:26, rating:82, tier:3, club:"نيوكاسل"},
  {name:"برايان كريستانتي", pos:"MF", price:9, rating:76, tier:3, club:"روما"},

  // ===================== Extra Forwards =====================
  {name:"محمد صلاح الأول", pos:"FW", price:5, rating:70, tier:3, club:"بيراميدز"},
  {name:"طارق حامد", pos:"MF", price:6, rating:73, tier:3, club:"الأهلي"},
  {name:"مروان محسن", pos:"FW", price:7, rating:74, tier:3, club:"الأهلي"},
  {name:"أحمد سيد زيزو", pos:"FW", price:8, rating:75, tier:3, club:"الأهلي"},
  {name:"محمود كهربا", pos:"FW", price:9, rating:76, tier:3, club:"الاتحاد السعودي"},
  {name:"إمام عاشور", pos:"MF", price:8, rating:75, tier:3, club:"الأهلي"},
  {name:"لوكا يوفيتش", pos:"FW", price:12, rating:78, tier:3, club:"فولفسبورغ"},
  {name:"إدينسون كافاني", pos:"FW", price:14, rating:79, tier:3, club:"بوكا جونيورز"},
  {name:"أليكسندر لاكازيت", pos:"FW", price:16, rating:80, tier:3, club:"ليون"},
  {name:"جيمي فاردي", pos:"FW", price:12, rating:78, tier:3, club:"ليستر سيتي"},
  {name:"إيفان توني", pos:"FW", price:24, rating:82, tier:3, club:"إيفرتون"},
  {name:"دومينيك زولت سولانكي", pos:"FW", price:22, rating:81, tier:3, club:"توتنهام"},
  {name:"يوسا كاباي", pos:"FW", price:9, rating:76, tier:3, club:"واتفورد"},
  {name:"جوناثان ديفيد", pos:"FW", price:34, rating:84, tier:2, club:"يوفنتوس"},
  {name:"لوايس أوبيندا", pos:"FW", price:26, rating:82, tier:3, club:"باريس سان جيرمان"},
  {name:"إيفان راكيتيتش", pos:"MF", price:10, rating:77, tier:3, club:"هايدوك سبليت (معتزل)"},
  {name:"جوردان أياو", pos:"FW", price:9, rating:76, tier:3, club:"ليدز يونايتد"},
  {name:"إيفارتون ريبيرو", pos:"FW", price:8, rating:75, tier:3, club:"فلامنغو"},
  {name:"غابرييل مارتينيلي", pos:"FW", price:28, rating:83, tier:2, club:"أرسنال"},
  {name:"إدواردو مندي", pos:"GK", price:16, rating:80, tier:3, club:"الأهلي السعودي"},
  {name:"كارلوس تيفيز", pos:"FW", price:14, rating:80, tier:3, club:"الأرجنتين (معتزل)"},
  {name:"خافيير هيرنانديز", pos:"FW", price:12, rating:79, tier:3, club:"لوس أنجلوس غالاكسي"},
  {name:"لويز أدريانو", pos:"FW", price:9, rating:76, tier:3, club:"البرازيل"},
  {name:"باولينيو", pos:"MF", price:8, rating:75, tier:3, club:"البرازيل"},
  {name:"أرين روبن", pos:"FW", price:20, rating:81, tier:3, club:"بايرن ميونخ (معتزل)"},
  {name:"فرانك ريبيري", pos:"FW", price:18, rating:81, tier:3, club:"بايرن ميونخ (معتزل)"},
  {name:"باستيان شفاينشتايغر", pos:"MF", price:14, rating:79, tier:3, club:"بايرن ميونخ (معتزل)"},
  {name:"مسعود أوزيل", pos:"MF", price:16, rating:80, tier:3, club:"أرسنال (معتزل)"},
  {name:"مانويل نويشتيدتر", pos:"DF", price:10, rating:77, tier:3, club:"ألمانيا (معتزل)"},
];

const POS_LABEL = {GK:"حارس مرمى", DF:"مدافع", MF:"وسط", FW:"مهاجم"};
const POS_ICON = {GK:"🧤", DF:"🛡️", MF:"🎯", FW:"⚡"};

/* 11 rounds -> 1 GK, 4 DF, 4 MF, 2 FW — in order: keeper first, then defense, midfield, attack */
/* Auction squad formats: 11-a-side (classic) and 5-a-side ("خماسي") */
const SQUAD_FORMATS = {
  11: {
    label: "مزاد النجوم (11 لاعبًا)",
    positions: ["GK","DF","DF","DF","DF","MF","MF","MF","MF","FW","FW"],
    roles:     ["GK","RB","CB","CB","LB","RM","CM","CM","LM","ST","ST"],
    // [left%, top%] on the pitch, index-aligned with roles (top = attack, bottom = own goal)
    coords: [
      [50,92], [80,75], [60,79], [40,79], [20,75],
      [80,48], [60,52], [40,52], [20,48],
      [62,18], [38,18],
    ],
  },
  5: {
    label: "مزاد الخماسي (5 لاعبين)",
    positions: ["GK","DF","MF","MF","FW"],
    roles:     ["GK","CB","CM","CM","ST"],
    coords: [
      [50,88], [50,64], [68,40], [32,40], [50,16],
    ],
  },
};
function currentPositions(){ return SQUAD_FORMATS[(state && state.squadSize) || 11].positions; }
function currentRoles(){ return SQUAD_FORMATS[(state && state.squadSize) || 11].roles; }
function currentCoords(){ return SQUAD_FORMATS[(state && state.squadSize) || 11].coords; }

/* ---------- State ---------- */
let state = null;

/* ---------- Online room state ---------- */
let onlineRole = null;     // 'host' | 'guest' | null
let roomCode = null;
let roomRef = null;
let myOnlineName = "";
let actionsListenerAttached = false;
const SESSION_KEY = "imadpro_online_session";
const LOCAL_SAVE_KEY = "imadpro_local_save";
const LEADERBOARD_KEY = "imadpro_leaderboard";
const GUESS_LB_KEY = "imadpro_guess_leaderboard";
const TOURNAMENT_KEY = "imadpro_tournament";

let tournament = null;        // { size, rounds: [[{a,b,winner}], ...] }
let tournamentPending = null; // { round, match } — which bracket slot the current game will fill

function saveTournament(){
  try { localStorage.setItem(TOURNAMENT_KEY, JSON.stringify({ tournament, tournamentPending })); } catch (e) {}
}
function loadTournament(){
  try {
    const saved = JSON.parse(localStorage.getItem(TOURNAMENT_KEY) || "null");
    if (saved){ tournament = saved.tournament || null; tournamentPending = saved.tournamentPending || null; }
  } catch (e) {}
}
function clearTournament(){
  tournament = null; tournamentPending = null;
  try { localStorage.removeItem(TOURNAMENT_KEY); } catch (e) {}
}

function shuffleNames(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildTournament(names){
  const shuffled = shuffleNames(names);
  const round0 = [];
  for (let i = 0; i < shuffled.length; i += 2){
    round0.push({ a: shuffled[i], b: shuffled[i + 1], winner: null });
  }
  return { size: names.length, rounds: [round0] };
}

function maybeAdvanceTournamentRound(){
  if (!tournament) return;
  const lastRound = tournament.rounds[tournament.rounds.length - 1];
  if (!lastRound.every(m => m.winner)) return;
  if (lastRound.length === 1) return; // champion already decided
  const winners = lastRound.map(m => m.winner);
  const nextRound = [];
  for (let i = 0; i < winners.length; i += 2){
    nextRound.push({ a: winners[i], b: winners[i + 1], winner: null });
  }
  tournament.rounds.push(nextRound);
}

const GUESS_NAME_KEY = "imadpro_guess_name";
const PLAYER_NAME_KEY = "imadpro_player_name";

function getSavedPlayerName(){
  try { return localStorage.getItem(PLAYER_NAME_KEY) || ""; } catch (e) { return ""; }
}
function savePlayerName(name){
  try { localStorage.setItem(PLAYER_NAME_KEY, name); } catch (e) {}
}

let currentLbTab = "auction";

/* ===================== POINTS / LEADERBOARDS ===================== */
function sanitizeKey(name){
  return String(name).trim().replace(/[.#$\[\]\/\s]+/g, "_").slice(0, 60) || "لاعب";
}

function readLocalBoard(storageKey){
  try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); }
  catch (e) { return {}; }
}
function writeLocalBoard(storageKey, board){
  try { localStorage.setItem(storageKey, JSON.stringify(board)); } catch (e) {}
}

function awardPoints(name, delta){
  const cleanName = String(name || "").trim();
  if (!cleanName) return;

  const board = readLocalBoard(LEADERBOARD_KEY);
  const key = sanitizeKey(cleanName);
  const prevLocal = (board[key] && board[key].points) || 0;
  board[key] = { name: cleanName, points: prevLocal + delta };
  writeLocalBoard(LEADERBOARD_KEY, board);

  if (db){
    db.ref("leaderboard/" + key).transaction(cur => {
      const val = cur || { name: cleanName, points: 0 };
      val.name = cleanName;
      val.points = (val.points || 0) + delta;
      return val;
    });
  }
}

function awardGuessScore(name, total){
  const cleanName = String(name || "").trim();
  if (!cleanName) return;

  const board = readLocalBoard(GUESS_LB_KEY);
  const key = sanitizeKey(cleanName);
  const prevBest = (board[key] && board[key].best) || 0;
  board[key] = { name: cleanName, best: Math.max(prevBest, total) };
  writeLocalBoard(GUESS_LB_KEY, board);

  if (db){
    db.ref("guessLeaderboard/" + key).transaction(cur => {
      const val = cur || { name: cleanName, best: 0 };
      val.name = cleanName;
      val.best = Math.max(val.best || 0, total);
      return val;
    });
  }
}

function pointsLabel(delta){
  if (delta > 0) return { text: "+" + delta + " نقطة", cls: "pos" };
  if (delta < 0) return { text: delta + " نقطة", cls: "neg" };
  return { text: "0 نقطة", cls: "zero" };
}

function loadLeaderboard(type){
  currentLbTab = type = type || "auction";
  const isGuess = type === "guess";
  const path = isGuess ? "guessLeaderboard" : "leaderboard";
  const field = isGuess ? "best" : "points";
  const storageKey = isGuess ? GUESS_LB_KEY : LEADERBOARD_KEY;

  $("#leaderboard-sub").textContent = isGuess
    ? "أعلى نتيجة حققتها في تحدي تخمين الأسعار"
    : "فوز = +3 نقاط · تعادل = +1 نقطة · خسارة = -2 نقطة";
  $("#tab-lb-auction").classList.toggle("active", !isGuess);
  $("#tab-lb-guess").classList.toggle("active", isGuess);

  const listEl = $("#leaderboard-list");
  listEl.innerHTML = '<p class="hint">جاري التحميل…</p>';

  if (db){
    db.ref(path).orderByChild(field).limitToLast(10).once("value").then(snap => {
      const entries = [];
      snap.forEach(child => { entries.push(child.val()); });
      entries.reverse(); // limitToLast returns ascending order
      renderLeaderboardList(entries, field);
    }).catch(() => renderLeaderboardList(localBoardAsList(storageKey, field), field));
  } else {
    renderLeaderboardList(localBoardAsList(storageKey, field), field);
  }
}

function localBoardAsList(storageKey, field){
  const board = readLocalBoard(storageKey);
  return Object.values(board).sort((a,b) => (b[field]||0) - (a[field]||0)).slice(0, 10);
}

function renderLeaderboardList(entries, field){
  field = field || "points";
  const listEl = $("#leaderboard-list");
  if (!entries || !entries.length){
    listEl.innerHTML = '<p class="hint">لسه مفيش نتايج مسجّلة — العب أول تحدي!</p>';
    return;
  }
  listEl.innerHTML = entries.map((e, i) => `
    <div class="leaderboard-row">
      <span class="leaderboard-rank">${i+1}</span>
      <span class="leaderboard-name">${escapeHtml(e.name)}</span>
      <span class="leaderboard-points">${e[field]}</span>
    </div>
  `).join("");
}

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

/* ===================== MISSION / BADGE ===================== */
const MISSION_KEY = "imadpro_mission_progress";
const MISSION_GOAL = 300;

function readMissionProgress(){
  try {
    const saved = JSON.parse(localStorage.getItem(MISSION_KEY) || "null");
    if (saved && typeof saved.goals === "number") return saved;
  } catch (e) {}
  return { goals: 0, badgeEarned: false };
}
function writeMissionProgress(p){
  try { localStorage.setItem(MISSION_KEY, JSON.stringify(p)); } catch (e) {}
}
function addMissionGoals(n){
  if (!n) return;
  const p = readMissionProgress();
  p.goals += n;
  if (p.goals >= MISSION_GOAL) p.badgeEarned = true;
  writeMissionProgress(p);
  renderMissionCard();
}
function renderMissionCard(){
  const p = readMissionProgress();
  const shown = Math.min(p.goals, MISSION_GOAL);
  const pct = Math.round(shown / MISSION_GOAL * 100);
  $("#mission-progress-fill").style.width = pct + "%";
  $("#mission-progress-text").textContent = shown + " / " + MISSION_GOAL + " هدف" + (p.badgeEarned ? " ✅" : "");
  $("#mission-badge-icon").textContent = p.badgeEarned ? "🏅" : "🔒";
  $("#mission-card").classList.toggle("earned", p.badgeEarned);
}

/* ===================== LOCAL AUTOSAVE (ai / local modes) ===================== */
function saveLocalProgress(){
  if (!state || state.mode === "online" || state.status === "finished") return;
  try { localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(state)); } catch (e) {}
}
function clearLocalProgress(){
  try { localStorage.removeItem(LOCAL_SAVE_KEY); } catch (e) {}
}
function tryResumeLocalProgress(){
  if (state) return; // an online session already took over
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(LOCAL_SAVE_KEY) || "null"); } catch (e) {}
  if (!saved || saved.status === "finished") return;

  if (saved.gameType === "boxes"){
    if (!saved.boxesOptions1) return;
    state = saved;
    normalizeStateArrays();
    showScreen("screen-boxes-game");
    $("#boxes-squad1-name").textContent = state.p1Name;
    $("#boxes-squad2-name").textContent = state.p2Name;
    renderBoxesSquads();
    renderBoxesRound();
    return;
  }

  if (!saved.currentPlayer) return;
  state = saved;
  normalizeStateArrays();
  $("#squad1-name").textContent = state.p1Name;
  $("#squad2-name").textContent = state.p2Name;
  showScreen("screen-game");
  renderGameFromState();
  startTimer();
}

function freshPool(){
  return PLAYERS.map(p => Object.assign({}, p));
}

function newState(){
  return {
    mode: null,               // 'ai' | 'local' | 'online'
    gameType: "auction",       // 'auction' | 'boxes'
    squadSize: 11,             // 11 (مزاد النجوم) or 5 (مزاد الخماسي)
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
    // Lucky Boxes (gameType === 'boxes') fields
    boxesOptions1: null,       // array of up to 4 player objects for player 1's current round
    boxesOptions2: null,       // array of up to 4 player objects for player 2's current round
    boxesStep: "p1",           // 'p1' | 'p2' — whose pick within the round
    // Blind Auction (gameType === 'blind') fields
    blindBid1: null,           // player 1's sealed bid this round (null = not submitted yet)
    blindBid2: null,           // player 2's sealed bid this round
    blindStep: "p1",           // local mode only: 'p1' | 'handoff' | 'p2' — whose turn to type
    blindWinner: null,         // set once both bids are in and the round resolves
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
  savePlayerName(p1);

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
  state.squadSize = selectedSquadSize;
  state.gameType = selectedGameType;
  state.p1Name = p1;
  state.p2Name = p2;

  if (selectedGameType === "boxes"){
    state.difficulty = "medium";
    startBoxesGame();
    return;
  }

  $("#setup-format-label").textContent = SQUAD_FORMATS[state.squadSize].label;
  showScreen("screen-setup");
});

/* ===================== ONLINE ROOM SCREEN ===================== */

function resetOnlineRoomUI(){
  $("#online-idle-card").hidden = false;
  $("#online-host-card").hidden = true;
  $("#online-guest-card").hidden = true;
  $("#online-error").hidden = true;
  $("#input-join-code").value = "";
  loadOpenRooms();
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

function withTimeout(promise, ms, timeoutMsg){
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(timeoutMsg)), ms)),
  ]);
}

$("#btn-create-room").addEventListener("click", () => {
  if (!db) return;
  const code = generateRoomCode();
  const ref = db.ref("rooms/" + code);
  $("#online-error").hidden = true;
  withTimeout(
    ref.set({
      host: { name: myOnlineName },
      guest: null,
      status: "waiting",
      createdAt: Date.now(),
    }),
    8000,
    "الاتصال بطيء جدًا أو متوقف"
  ).then(() => {
    onlineRole = "host";
    roomCode = code;
    roomRef = ref;
    saveOnlineSession();
    $("#online-idle-card").hidden = true;
    $("#online-host-card").hidden = false;
    $("#room-code-display").textContent = code;
    listenForGuestJoin();
  }).catch((err) => {
    console.error("Room create failed:", err);
    const detail = (err && err.message) ? err.message : "خطأ غير معروف";
    showOnlineError("تعذّر إنشاء الغرفة: " + detail);
  });
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

$("#btn-share-code").addEventListener("click", () => {
  if (!roomCode) return;
  const text = "انضم لغرفتي في IMAD PRO! الرمز: " + roomCode;
  if (navigator.share){
    navigator.share({ title: "IMAD PRO", text }).catch(() => {});
  } else if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(() => {
      const btn = $("#btn-share-code");
      const original = btn.textContent;
      btn.textContent = "✅ اتنسخت الرسالة";
      setTimeout(() => { btn.textContent = original; }, 1600);
    });
  }
});

function joinRoomByCode(code){
  if (!db || !code) return;
  code = code.trim().toUpperCase();
  if (!code){ showOnlineError("اكتب رمز الغرفة أولاً"); return; }
  $("#online-error").hidden = true;
  const ref = db.ref("rooms/" + code);
  withTimeout(ref.once("value"), 8000, "الاتصال بطيء جدًا أو متوقف").then(snap => {
    if (!snap.exists()){ showOnlineError("مفيش غرفة بالرمز ده"); return; }
    const room = snap.val();
    if (room.guest){ showOnlineError("الغرفة دي مكتملة بالفعل"); return; }
    return withTimeout(ref.child("guest").set({ name: myOnlineName }), 8000, "الاتصال بطيء جدًا أو متوقف").then(() => {
      onlineRole = "guest";
      roomCode = code;
      roomRef = ref;
      saveOnlineSession();
      $("#online-idle-card").hidden = true;
      $("#online-guest-card").hidden = false;
      listenAsGuest();
    });
  }).catch((err) => {
    console.error("Room join failed:", err);
    const detail = (err && err.message) ? err.message : "تأكد من الرمز وحاول تاني";
    showOnlineError("تعذّر الدخول: " + detail);
  });
}

$("#btn-join-room").addEventListener("click", () => {
  joinRoomByCode($("#input-join-code").value);
});

/* ---------- Browse open rooms (public list of hosts waiting for a guest) ---------- */
function loadOpenRooms(){
  const el = $("#open-rooms-list");
  if (!el) return;
  if (!db){ el.innerHTML = '<p class="hint">مش متاح دلوقتي</p>'; return; }
  el.innerHTML = '<p class="hint">جاري البحث عن غرف مفتوحة…</p>';
  db.ref("rooms").limitToLast(30).once("value").then(snap => {
    const rooms = [];
    const twoHours = 2 * 60 * 60 * 1000;
    snap.forEach(child => {
      const r = child.val();
      if (r && !r.guest && r.status !== "finished" && r.host && r.host.name && (Date.now() - (r.createdAt || 0) < twoHours)){
        rooms.push({ code: child.key, hostName: r.host.name, createdAt: r.createdAt || 0 });
      }
    });
    rooms.sort((a,b) => b.createdAt - a.createdAt);
    renderOpenRooms(rooms.slice(0, 8));
  }).catch(() => { el.innerHTML = '<p class="hint">تعذّر تحميل الغرف المفتوحة</p>'; });
}

function renderOpenRooms(rooms){
  const el = $("#open-rooms-list");
  if (!rooms.length){
    el.innerHTML = '<p class="hint">مفيش غرف مفتوحة دلوقتي — اعمل غرفة جديدة وشارك الرمز!</p>';
    return;
  }
  el.innerHTML = rooms.map(r => `
    <div class="open-room-row">
      <span class="open-room-host">👤 ${escapeHtml(r.hostName)}</span>
      <button class="btn btn-bid open-room-join-btn" data-code="${escapeHtml(r.code)}">انضم ➜</button>
    </div>
  `).join("");
  $$(".open-room-join-btn").forEach(btn => {
    btn.addEventListener("click", () => joinRoomByCode(btn.dataset.code));
  });
}

$("#btn-refresh-rooms").addEventListener("click", loadOpenRooms);

$("#btn-online-back").addEventListener("click", () => {
  detachRoomListeners();
  clearOnlineSession();
  onlineRole = null; roomCode = null; roomRef = null;
  showScreen("screen-choose-game");
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
  state.squadSize = selectedSquadSize;
  state.gameType = selectedGameType;
  state.p1Name = myOnlineName;
  state.p2Name = guestName;
  $("#squad1-name").textContent = state.p1Name;
  $("#squad2-name").textContent = state.p2Name;

  if (selectedGameType === "boxes"){
    state.difficulty = "medium";
    listenForActions();
    roomRef.update({ status: "playing", settings: { gameType: "boxes", squadSize: state.squadSize } });
    startBoxesGame();
    return;
  }

  $("#setup-format-label").textContent = SQUAD_FORMATS[state.squadSize].label;
  showScreen("screen-setup");
}

/* ---------- Guest side: waiting for host to start ---------- */
function listenAsGuest(){
  roomRef.child("status").on("value", snap => {
    const status = snap.val();
    if (status === "finished"){
      showScreen("screen-result");
    }
    // 'playing' screen selection is handled by the state listener below,
    // since it needs state.gameType to know which game screen to show.
  });
  roomRef.child("state").on("value", snap => {
    if (!snap.exists()) return;
    state = snap.val();
    normalizeStateArrays();
    if (state.status === "finished"){
      renderResultFromState();
      showScreen("screen-result");
    } else if (state.gameType === "boxes"){
      showScreen("screen-boxes-game");
      $("#boxes-squad1-name").textContent = state.p1Name;
      $("#boxes-squad2-name").textContent = state.p2Name;
      renderBoxesSquads();
      renderBoxesRound();
    } else if (state.currentPlayer){
      showScreen("screen-game");
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
    else if (action.type === "box") pickBox(Number(action.amount) || 0);
    else if (action.type === "boxdeal") doBoxDeal();
    else if (action.type === "boxnodeal") doBoxNoDeal();
    else if (action.type === "boxprotect") doBoxProtect();
    else if (action.type === "boxswap") doBoxSwap();
    else if (action.type === "blindbid"){
      if (state.gameType === "blind" && state.blindBid2 === null){
        state.blindBid2 = Number(action.amount) || 0;
        renderBlindRound();
        syncOnlineState();
        saveLocalProgress();
        if (state.blindBid1 !== null && state.blindBid2 !== null) resolveBlindRound();
      }
    }
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
        if (state.status === "finished"){
          renderResultFromState(); showScreen("screen-result");
        } else if (state.gameType === "boxes"){
          showScreen("screen-boxes-game");
          $("#boxes-squad1-name").textContent = state.p1Name;
          $("#boxes-squad2-name").textContent = state.p2Name;
          renderBoxesSquads();
          renderBoxesRound();
        } else {
          showScreen("screen-game"); renderGameFromState();
        }
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
  showScreen("screen-choose-game");
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
      settings: { difficulty: state.difficulty, timerSetting: state.timerSetting, budget: state.budget, gameType: state.gameType },
    });
  }

  if (state.gameType === "blind") startBlindAuction();
  else startAuction();
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
  if (!state) return;
  state.round++;
  if (state.round > currentPositions().length){
    finishAuction();
    return;
  }
  const position = currentPositions()[state.round - 1];
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

  // Safety net: this can only happen if a budget hits 0 — since bidding starts
  // at 0 and rises by whole millions, anyone with budget ≥ 1 can always bid.
  const minNeeded = 1;
  if (state.budget1 < minNeeded && state.budget2 < minNeeded){
    resolveUnaffordableRound(featured, position);
    return;
  }

  renderGameFromState();
  startTimer();
  syncOnlineState();
  saveLocalProgress();
}

function resolveUnaffordableRound(featured, position){
  renderGameFromState();
  $("#turn-line").textContent = "الميزانية غير كافية لدى الطرفين — يُحسم تلقائيًا";
  $("#bidder-line").textContent = "تسوية تلقائية";
  $("#timer-wrap").style.display = "none";
  $$("#bid-controls .btn-bid").forEach(b => b.disabled = true);
  $("#btn-surrender").disabled = true;

  const winner = state.budget1 >= state.budget2 ? 1 : 2;
  state.currentBid = 0;
  state.currentBidder = winner;
  $("#current-bid").textContent = 0;
  syncOnlineState();
  saveLocalProgress();
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
  $("#custom-bid-input").disabled = !mine;
  $("#btn-custom-bid").disabled = !mine;
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
  state.timeLeft = state.timerSetting; // fresh countdown for whoever's turn it is now
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

/* ===================== LUCKY BOXES ENGINE ===================== */
function startBoxesGame(){
  state.round = 0;
  state.squad1 = []; state.squad2 = [];
  state.items1 = state.items1 || [];
  state.items2 = state.items2 || [];
  showScreen("screen-boxes-game");
  $("#boxes-squad1-name").textContent = state.p1Name;
  $("#boxes-squad2-name").textContent = state.p2Name;
  renderBoxesSquads();
  startBoxesRound();
}

// Roughly 1-in-6 boxes hides a bonus item card instead of/alongside the player.
function maybeAttachItem(){
  const roll = Math.random();
  if (roll < 0.09) return "protect";
  if (roll < 0.17) return "swap";
  return null;
}

function generateBoxOptions(position, difficulty){
  const weights = tierWeightFor(difficulty);
  const candidates = state.pool.filter(p => p.pos === position);
  const preferred = candidates.filter(p => weights.includes(p.tier));
  const from = (preferred.length >= 4 ? preferred : candidates);
  const shuffled = from.slice().sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, Math.min(4, shuffled.length));
  picks.forEach(p => { state.pool = state.pool.filter(x => x !== p); });
  return picks.map(p => Object.assign({}, p, { boxItem: maybeAttachItem() }));
}

function startBoxesRound(){
  if (!state) return;
  state.round++;
  if (state.round > currentPositions().length){
    finishAuction();
    return;
  }
  const position = currentPositions()[state.round - 1];
  state.boxesOptions1 = generateBoxOptions(position, state.difficulty);
  state.boxesOptions2 = generateBoxOptions(position, state.difficulty);
  state.boxesStep = "p1";
  state.boxesPhase = "choosing";
  state.boxesFirstIdx = null;
  renderBoxesRound();
  syncOnlineState();
  saveLocalProgress();
}

function isMyBoxesTurn(){
  if (!state) return false;
  const step = state.boxesStep;
  if (state.mode === "ai") return step === "p1";
  if (state.mode === "local") return true;
  if (state.mode === "online") return (onlineRole === "host" && step === "p1") || (onlineRole === "guest" && step === "p2");
  return true;
}

function myItems(){
  if (!state) return [];
  return state.boxesStep === "p1" ? (state.items1 || []) : (state.items2 || []);
}

function renderItemsBar(){
  const mine = isMyBoxesTurn();
  const items = myItems();
  const hasProtect = mine && items.some(it => it.type === "protect" && !it.used);
  const hasSwap = mine && items.some(it => it.type === "swap" && !it.used);
  $("#boxes-items-bar").hidden = !(hasProtect || hasSwap);
  $("#btn-use-protect").hidden = !hasProtect || state.boxesPhase !== "choosing-second";
  $("#btn-use-swap").hidden = !hasSwap || state.boxesPhase !== "choosing";
}

function renderBoxesRound(){
  if (!state.boxesOptions1) return;
  const position = currentPositions()[state.round - 1];
  $("#boxes-round-num").textContent = state.round;
  $("#boxes-round-total").textContent = currentPositions().length;
  $("#boxes-pos-chip").textContent = POS_ICON[position] + " " + POS_LABEL[position];

  const activeName = state.boxesStep === "p1" ? state.p1Name : state.p2Name;
  const isComputerTurn = state.mode === "ai" && state.boxesStep === "p2";
  $("#boxes-turn-label").textContent = isComputerTurn ? ("🤖 " + state.p2Name + " بيفكر...") : ("دور: " + activeName);

  $("#boxes-reveal").hidden = true;
  $("#boxes-deal-actions").hidden = true;
  $("#boxes-item-found").hidden = true;
  $("#boxes-second-notice").hidden = true;
  $("#boxes-grid").hidden = false;
  $("#boxes-instruction").textContent = state.boxesPhase === "choosing-second"
    ? "اختر الصندوق الجاي (إجباري!)"
    : "افتح صندوقًا واحدًا للبدء";

  const mine = isMyBoxesTurn();
  const options = state.boxesStep === "p1" ? state.boxesOptions1 : state.boxesOptions2;
  $$("#boxes-grid .box-card").forEach((btn, i) => {
    btn.classList.remove("opened-reject");
    if (state.boxesPhase === "choosing-second" && i === state.boxesFirstIdx){
      btn.disabled = true;
      btn.classList.add("opened-reject");
    } else {
      btn.disabled = !mine;
    }
  });

  renderItemsBar();
  maybeTriggerComputerBoxPick();
}

function itemLabel(type){
  return type === "protect" ? "🛡️ كارت حماية (50م)" : "🔄 كارت تبديل (100م)";
}

function pickBox(idx){
  if (!state) return;
  const step = state.boxesStep;
  const options = step === "p1" ? state.boxesOptions1 : state.boxesOptions2;
  if (!options || !options[idx]) return;

  if (state.boxesPhase === "choosing"){
    state.boxesFirstIdx = idx;
    state.boxesPhase = "revealed-first";
    renderBoxesReveal(options[idx], true);
    syncOnlineState();
    saveLocalProgress();
  } else if (state.boxesPhase === "choosing-second"){
    if (idx === state.boxesFirstIdx) return;
    confirmBoxChoice(idx, true);
  }
}

function renderBoxesReveal(player, showDealChoice){
  $("#boxes-grid").hidden = true;
  const reveal = $("#boxes-reveal");
  reveal.hidden = false;
  const jersey = $("#boxes-reveal-jersey");
  jersey.textContent = getInitials(player.name);
  jersey.style.background = colorForName(player.name);
  $("#boxes-reveal-name").textContent = player.name;
  $("#boxes-reveal-club").textContent = player.club || "";
  const badge = $("#boxes-reveal-badge");
  badge.textContent = player.pos;
  badge.className = "badge pos-" + player.pos;
  $("#boxes-reveal-rating").textContent = player.rating || "—";

  const itemLine = $("#boxes-item-found");
  if (player.boxItem){
    itemLine.textContent = "🎉 الصندوق فيه كمان " + itemLabel(player.boxItem) + "!";
    itemLine.hidden = false;
  } else {
    itemLine.hidden = true;
  }

  $("#boxes-deal-actions").hidden = !showDealChoice;
}

function confirmBoxChoice(idx, mandatory){
  const step = state.boxesStep;
  const options = step === "p1" ? state.boxesOptions1 : state.boxesOptions2;
  const chosen = options[idx];
  if (!chosen) return;

  if (step === "p1"){
    state.squad1.push(chosen);
    if (chosen.boxItem){ state.items1 = state.items1 || []; state.items1.push({ type: chosen.boxItem, used: false }); }
  } else {
    state.squad2.push(chosen);
    if (chosen.boxItem){ state.items2 = state.items2 || []; state.items2.push({ type: chosen.boxItem, used: false }); }
  }

  renderBoxesReveal(chosen, false);
  if (mandatory){
    $("#boxes-second-notice").hidden = true;
  }
  renderBoxesSquads();
  syncOnlineState();
  saveLocalProgress();
  setTimeout(advanceBoxesStep, 1500);
}

function boxesGuestShouldRelay(){
  return !!(state && state.mode === "online" && onlineRole === "guest");
}

function doBoxDeal(){
  if (!state || state.boxesFirstIdx === null) return;
  confirmBoxChoice(state.boxesFirstIdx, false);
}

function doBoxNoDeal(){
  if (!state) return;
  state.boxesPhase = "choosing-second";
  $("#boxes-reveal").hidden = true;
  $("#boxes-grid").hidden = false;
  $("#boxes-second-notice").hidden = false;
  $("#boxes-instruction").textContent = "اختر الصندوق الجاي (إجباري!)";
  const mine = isMyBoxesTurn();
  $$("#boxes-grid .box-card").forEach((btn, i) => {
    if (i === state.boxesFirstIdx){ btn.disabled = true; btn.classList.add("opened-reject"); }
    else { btn.disabled = !mine; btn.classList.remove("opened-reject"); }
  });
  renderItemsBar();
  syncOnlineState();
  saveLocalProgress();
}

function doBoxProtect(){
  if (!state || state.boxesPhase !== "choosing-second") return;
  const items = myItems();
  const card = items.find(it => it.type === "protect" && !it.used);
  if (!card) return;
  card.used = true;
  // Cancel the forced second pick — go back and accept the first box after all.
  confirmBoxChoice(state.boxesFirstIdx, false);
}

function doBoxSwap(){
  if (!state || state.boxesPhase !== "choosing") return;
  const items = myItems();
  const card = items.find(it => it.type === "swap" && !it.used);
  if (!card) return;
  const mySquad = state.boxesStep === "p1" ? state.squad1 : state.squad2;
  if (!mySquad.length) return;
  const lastPlayer = mySquad[mySquad.length - 1];
  const freshPicks = state.pool.filter(p => p.pos === lastPlayer.pos);
  if (!freshPicks.length) return;
  const replacement = freshPicks[Math.floor(Math.random() * freshPicks.length)];
  state.pool = state.pool.filter(p => p !== replacement);
  mySquad[mySquad.length - 1] = replacement;
  card.used = true;
  renderBoxesSquads();
  renderItemsBar();
  syncOnlineState();
  saveLocalProgress();
}

$("#btn-boxes-deal").addEventListener("click", () => {
  if (boxesGuestShouldRelay()) sendOnlineAction("boxdeal", 0);
  else doBoxDeal();
});

$("#btn-boxes-nodeal").addEventListener("click", () => {
  if (boxesGuestShouldRelay()) sendOnlineAction("boxnodeal", 0);
  else doBoxNoDeal();
});

$("#btn-use-protect").addEventListener("click", () => {
  if (boxesGuestShouldRelay()) sendOnlineAction("boxprotect", 0);
  else doBoxProtect();
});

$("#btn-use-swap").addEventListener("click", () => {
  if (boxesGuestShouldRelay()) sendOnlineAction("boxswap", 0);
  else doBoxSwap();
});

function advanceBoxesStep(){
  if (!state) return;
  if (state.boxesStep === "p1"){
    state.boxesStep = "p2";
    state.boxesPhase = "choosing";
    state.boxesFirstIdx = null;
    renderBoxesRound();
    syncOnlineState();
    saveLocalProgress();
  } else {
    startBoxesRound();
  }
}

function maybeTriggerComputerBoxPick(){
  if (!state || state.mode !== "ai" || state.boxesStep !== "p2") return;
  if (state.boxesPhase === "choosing"){
    setTimeout(() => {
      if (!state || state.mode !== "ai" || state.boxesStep !== "p2" || state.boxesPhase !== "choosing") return;
      const options = state.boxesOptions2 || [];
      if (!options.length) return;
      const idx = Math.floor(Math.random() * options.length);
      pickBox(idx);
      // AI decides Deal/No-Deal: keeps good picks (rating>=82), sometimes rerolls weak ones.
      setTimeout(() => {
        if (!state || state.boxesPhase !== "revealed-first") return;
        const picked = options[idx];
        if (picked && picked.rating < 82 && Math.random() < 0.5){
          doBoxNoDeal();
          setTimeout(() => {
            if (!state || state.boxesPhase !== "choosing-second") return;
            const remaining = [0,1,2,3].filter(i => i !== state.boxesFirstIdx);
            const idx2 = remaining[Math.floor(Math.random() * remaining.length)];
            confirmBoxChoice(idx2, true);
          }, 900);
        } else {
          doBoxDeal();
        }
      }, 900);
    }, 700 + Math.random() * 900);
  }
}

function renderBoxesSquads(){
  $("#boxes-squad1-slots").innerHTML = slotTemplate(state.squad1, currentPositions().length);
  $("#boxes-squad2-slots").innerHTML = slotTemplate(state.squad2, currentPositions().length);
}

$$("#boxes-grid .box-card").forEach(btn => {
  btn.addEventListener("click", () => {
    const idx = Number(btn.dataset.idx);
    if (state.mode === "online" && onlineRole === "guest") sendOnlineAction("box", idx);
    else pickBox(idx);
  });
});

$("#btn-boxes-home").addEventListener("click", () => {
  const inGame = state && state.round > 0 && state.status !== "finished";
  if (inGame && !confirm("هتخرج من صناديق الحظ الحالية وتفقد كل التقدم — متأكد؟")) return;
  resetToHome();
});

/* ===================== BLIND AUCTION ENGINE ===================== */
function startBlindAuction(){
  if (!state) return;
  state.round = 0;
  state.squad1 = []; state.squad2 = [];
  showScreen("screen-blind-game");
  renderBlindSquads();
  nextBlindRound();
}

function nextBlindRound(){
  if (!state) return;
  state.round++;
  if (state.round > currentPositions().length){ finishAuction(); return; }
  const position = currentPositions()[state.round - 1];
  const featured = pickPlayer(position, state.difficulty);
  if (!featured){ nextBlindRound(); return; }
  state.currentPlayer = featured;
  state.consolationPlayer = pickConsolation(position);
  state.blindBid1 = null;
  state.blindBid2 = null;
  state.blindWinner = null;
  state.blindStep = "p1";
  renderBlindRound();
  syncOnlineState();
  saveLocalProgress();
}

function renderBlindSquads(){
  $("#blind-squad1-name").textContent = state.p1Name;
  $("#blind-squad2-name").textContent = state.p2Name;
  $("#blind-squad1-budget").textContent = state.budget1;
  $("#blind-squad2-budget").textContent = state.budget2;
  $("#blind-squad1-slots").innerHTML = slotTemplate(state.squad1, currentPositions().length);
  $("#blind-squad2-slots").innerHTML = slotTemplate(state.squad2, currentPositions().length);
}

function renderBlindRound(){
  if (!state || !state.currentPlayer) return;
  const player = state.currentPlayer;
  const position = player.pos;

  $("#blind-round-num").textContent = state.round;
  $("#blind-round-total").textContent = currentPositions().length;
  $("#blind-pos-chip").textContent = POS_ICON[position] + " " + POS_LABEL[position];

  const jersey = $("#blind-player-jersey");
  jersey.textContent = getInitials(player.name);
  jersey.style.background = colorForName(player.name);
  $("#blind-player-name").textContent = player.name;
  $("#blind-player-club").textContent = player.club || "";
  const badge = $("#blind-player-pos-badge");
  badge.textContent = position; badge.className = "badge pos-" + position;
  $("#blind-player-rating").textContent = player.rating || "—";

  $("#blind-input-wrap").hidden = true;
  $("#blind-handoff").hidden = true;
  $("#blind-waiting").hidden = true;
  $("#blind-reveal").hidden = true;
  $("#blind-warn-line").hidden = true;
  $("#blind-bid-input").value = "";

  renderBlindSquads();

  if (state.blindBid1 !== null && state.blindBid2 !== null){
    showBlindReveal();
    return;
  }

  if (state.mode === "local"){
    if (state.blindStep === "p1"){
      $("#blind-turn-label").textContent = "دور: " + state.p1Name;
      $("#blind-input-wrap").hidden = false;
    } else if (state.blindStep === "handoff"){
      $("#blind-handoff-name").textContent = state.p1Name;
      $("#blind-handoff").hidden = false;
    } else if (state.blindStep === "p2"){
      $("#blind-turn-label").textContent = "دور: " + state.p2Name;
      $("#blind-input-wrap").hidden = false;
    }
  } else if (state.mode === "ai"){
    if (state.blindBid1 === null){
      $("#blind-turn-label").textContent = "دورك";
      $("#blind-input-wrap").hidden = false;
    } else {
      $("#blind-waiting-text").textContent = "🤖 الحاسوب بيفكر في عرضه…";
      $("#blind-waiting").hidden = false;
    }
  } else if (state.mode === "online"){
    const myNum = onlineRole === "host" ? 1 : 2;
    const myBid = myNum === 1 ? state.blindBid1 : state.blindBid2;
    if (myBid === null){
      $("#blind-turn-label").textContent = "دورك";
      $("#blind-input-wrap").hidden = false;
    } else {
      $("#blind-waiting-text").textContent = "⏳ في انتظار الطرف التاني يقفل عرضه…";
      $("#blind-waiting").hidden = false;
    }
  }
}

function showBlindWarning(msg){
  const w = $("#blind-warn-line");
  w.textContent = msg;
  w.hidden = false;
}

function submitBlindBid(){
  if (!state || !state.currentPlayer) return;
  const amount = Math.max(0, Math.floor(Number($("#blind-bid-input").value) || 0));

  if (state.mode === "local"){
    if (state.blindStep === "p1"){
      if (amount > state.budget1){ showBlindWarning("الميزانية مش كفاية"); return; }
      state.blindBid1 = amount;
      state.blindStep = "handoff";
    } else if (state.blindStep === "p2"){
      if (amount > state.budget2){ showBlindWarning("الميزانية مش كفاية"); return; }
      state.blindBid2 = amount;
    }
    saveLocalProgress();
    if (state.blindBid1 !== null && state.blindBid2 !== null) resolveBlindRound();
    else renderBlindRound();
    return;
  }

  if (state.mode === "ai"){
    if (amount > state.budget1){ showBlindWarning("الميزانية مش كفاية"); return; }
    state.blindBid1 = amount;
    renderBlindRound();
    saveLocalProgress();
    maybeTriggerComputerBlindBid();
    return;
  }

  if (state.mode === "online"){
    const myNum = onlineRole === "host" ? 1 : 2;
    const myBudget = myNum === 1 ? state.budget1 : state.budget2;
    if (amount > myBudget){ showBlindWarning("الميزانية مش كفاية"); return; }
    if (onlineRole === "host"){
      state.blindBid1 = amount;
      renderBlindRound();
      syncOnlineState();
      saveLocalProgress();
      if (state.blindBid1 !== null && state.blindBid2 !== null) resolveBlindRound();
    } else {
      sendOnlineAction("blindbid", amount);
      $("#blind-input-wrap").hidden = true;
      $("#blind-waiting-text").textContent = "⏳ في انتظار الطرف التاني يقفل عرضه…";
      $("#blind-waiting").hidden = false;
    }
  }
}

$("#btn-blind-submit").addEventListener("click", submitBlindBid);
$("#blind-bid-input").addEventListener("keydown", e => {
  if (e.key === "Enter") submitBlindBid();
});

$("#btn-blind-handoff-continue").addEventListener("click", () => {
  if (!state) return;
  state.blindStep = "p2";
  renderBlindRound();
  saveLocalProgress();
});

function maybeTriggerComputerBlindBid(){
  if (!state || state.mode !== "ai") return;
  setTimeout(() => {
    if (!state || state.mode !== "ai" || !state.currentPlayer || state.blindBid2 !== null) return;
    const base = state.currentPlayer.price || 10;
    const willingness = Math.round(base * (0.6 + Math.random() * 1.2));
    const remainingSlots = currentPositions().length - state.round + 1;
    const reserve = Math.max(0, (remainingSlots - 1) * 4);
    const affordable = Math.max(0, state.budget2 - reserve);
    const amount = Math.max(0, Math.min(willingness, affordable, state.budget2));
    state.blindBid2 = amount;
    resolveBlindRound();
  }, 900 + Math.random() * 900);
}

function resolveBlindRound(){
  if (!state || state.blindBid1 === null || state.blindBid2 === null) return;
  const winner = state.blindBid1 === state.blindBid2
    ? (Math.random() < 0.5 ? 1 : 2)
    : (state.blindBid1 > state.blindBid2 ? 1 : 2);
  const loser = opponentOf(winner);
  const price = winner === 1 ? state.blindBid1 : state.blindBid2;
  const player = state.currentPlayer;

  if (winner === 1){ state.budget1 -= price; state.squad1.push(player); }
  else { state.budget2 -= price; state.squad2.push(player); }

  const consolation = state.consolationPlayer;
  if (consolation){
    const withRating = Object.assign({}, consolation, { price: 0, awarded: true });
    if (loser === 1) state.squad1.push(withRating); else state.squad2.push(withRating);
  }

  state.blindWinner = winner;
  showBlindReveal();
  syncOnlineState();
  saveLocalProgress();
  setTimeout(nextBlindRound, 1800);
}

function showBlindReveal(){
  $("#blind-input-wrap").hidden = true;
  $("#blind-handoff").hidden = true;
  $("#blind-waiting").hidden = true;
  $("#blind-reveal").hidden = false;
  $("#blind-reveal-name1").textContent = state.p1Name;
  $("#blind-reveal-name2").textContent = state.p2Name;
  $("#blind-reveal-amt1").textContent = state.blindBid1;
  $("#blind-reveal-amt2").textContent = state.blindBid2;
  renderBlindSquads();

  let winnerText;
  if (state.blindWinner === 1) winnerText = "🏆 " + state.p1Name + " كسب اللاعب!";
  else if (state.blindWinner === 2) winnerText = "🏆 " + state.p2Name + " كسب اللاعب!";
  else winnerText = "—";
  $("#blind-reveal-winner").textContent = winnerText;
}

$("#btn-blind-home").addEventListener("click", () => {
  const inGame = state && state.round > 0 && state.status !== "finished";
  if (inGame && !confirm("هتخرج من المزاد الأعمى الحالي وتفقد كل التقدم — متأكد؟")) return;
  resetToHome();
});

/* ---------- Bidding ---------- */
$$("#bid-controls .btn-bid").forEach(btn => {
  btn.addEventListener("click", () => {
    const amt = Number(btn.dataset.amt);
    if (state.mode === "online" && onlineRole === "guest") sendOnlineAction("bid", amt);
    else placeBid(amt);
  });
});

function submitCustomBid(){
  if (!state || !state.currentPlayer) return;
  const input = $("#custom-bid-input");
  const target = Number(input.value);
  if (!target || target <= state.currentBid){
    showWarning("اكتب رقم أكبر من العرض الحالي");
    return;
  }
  const amount = target - state.currentBid;
  if (state.mode === "online" && onlineRole === "guest") sendOnlineAction("bid", amount);
  else placeBid(amount);
  input.value = "";
}
$("#btn-custom-bid").addEventListener("click", submitCustomBid);
$("#custom-bid-input").addEventListener("keydown", e => {
  if (e.key === "Enter") submitCustomBid();
});

$("#btn-surrender").addEventListener("click", () => {
  if (state.mode === "online" && onlineRole === "guest") sendOnlineAction("surrender", 0);
  else doSurrender();
});

function placeBid(amount){
  if (!state || !state.currentPlayer) return;
  const who = state.activeTurn;
  const newBid = state.currentBid + amount;

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
  saveLocalProgress();
}

function showWarning(msg){
  const w = $("#warn-line");
  w.textContent = msg;
  w.hidden = false;
}

function doSurrender(){
  if (!state || state.currentBidder === null) return;
  clearInterval(timerId);
  const winner = state.currentBidder;
  const loser = opponentOf(winner);
  awardRound(winner, loser);
}

function awardRound(winner, loser){
  if (!state) return;
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
  saveLocalProgress();
  setTimeout(nextRound, 900);
}

/* ---------- Computer AI (only used in 'ai' mode) ---------- */
function maybeTriggerComputerTurn(){
  if (!state || state.mode !== "ai" || state.activeTurn !== 2) return;
  const remainingSlots = currentPositions().length - state.round + 1;
  const reserve = Math.max(0, (remainingSlots - 1) * 4);
  const maxWillingness = Math.round(state.currentPlayer.price * (1 + Math.random() * 0.7));
  const affordable = state.budget2 - reserve;

  setTimeout(() => {
    if (!state || !state.currentPlayer) return;
    const nextMin = state.currentBid + 1;

    if (nextMin <= maxWillingness && nextMin <= affordable && nextMin <= state.budget2){
      const options = [1,5,10].filter(a => {
        const bid = state.currentBid + a;
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
      const minBid = state.currentBid + 1;
      if (minBid <= state.budget2){ placeBid(1); }
      else { doSurrender(); }
    }
  }, 700 + Math.random() * 900);
}

/* ---------- Rendering (shared by the engine owner AND by an online guest mirroring synced state) ---------- */
const AVATAR_PALETTE = [
  ["#d4af37", "#8a6d1f"], ["#4fa8e0", "#1f5e8a"], ["#46c98a", "#1f6b47"],
  ["#e0503c", "#8a291f"], ["#a06ee0", "#5c3d8a"], ["#e0a83c", "#8a611f"],
  ["#3ce0c8", "#1f8a79"], ["#e05c9c", "#8a2f5c"],
];

function getInitials(name){
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0] ? parts[0][0] : "؟";
  const second = parts[1] ? parts[1][0] : "";
  return (first + second).toUpperCase();
}

function colorForName(name){
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  const [c1, c2] = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  return `radial-gradient(circle at 35% 30%, ${c1}, ${c2} 75%)`;
}

function renderGameFromState(){
  if (!state.currentPlayer) return;
  const position = state.currentPlayer.pos;
  const player = state.currentPlayer;

  $("#round-num").textContent = state.round;
  $("#round-total").textContent = currentPositions().length;
  $("#pos-chip").textContent = POS_ICON[position] + " " + POS_LABEL[position];

  const jersey = $("#player-jersey");
  jersey.textContent = getInitials(player.name);
  jersey.style.background = colorForName(player.name);

  $("#player-name").textContent = player.name;
  $("#player-club").textContent = player.club || "";
  const badge = $("#player-pos-badge");
  badge.textContent = position;
  badge.className = "badge pos-" + position;
  $("#player-rating").textContent = player.rating || "—";
  $("#current-bid").textContent = state.currentBid;
  $("#bidder-line").textContent = state.currentBidder ? ("أعلى عرض من: " + nameOf(state.currentBidder)) : "لا يوجد عرض بعد";
  $("#warn-line").hidden = true;
  $("#custom-bid-input").value = "";

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
      html += `<div class="slot filled"><span class="slot-pos">${p.pos}</span><span>${escapeHtml(p.name)}</span><span class="slot-price">${p.price}م</span></div>`;
    } else {
      html += `<div class="slot"><span class="slot-pos">—</span><span>فارغ</span><span></span></div>`;
    }
  }
  return html;
}

function resultSlotTemplate(list){
  const roles = currentRoles();
  const coords = currentCoords();
  const chips = roles.map((role, i) => {
    const p = list[i];
    const [left, top] = coords[i] || [50, 50];
    if (p){
      return `<div class="pitch-player" style="left:${left}%;top:${top}%">
        <div class="pitch-avatar" style="background:${colorForName(p.name)}">${getInitials(p.name)}</div>
        <span class="pitch-role">${role}</span>
        <span class="pitch-name">${escapeHtml(p.name)}</span>
      </div>`;
    }
    return `<div class="pitch-player empty" style="left:${left}%;top:${top}%">
      <div class="pitch-avatar empty-avatar">—</div>
      <span class="pitch-role">${role}</span>
      <span class="pitch-name">فارغ</span>
    </div>`;
  }).join("");
  return `<div class="pitch">
    <div class="pitch-markings">
      <div class="pitch-halfway"></div>
      <div class="pitch-circle"></div>
      <div class="pitch-box pitch-box-top"></div>
      <div class="pitch-box pitch-box-bottom"></div>
    </div>
    ${chips}
  </div>`;
}

function renderSquads(){
  $("#squad1-budget").textContent = state.budget1;
  $("#squad2-budget").textContent = state.budget2;
  $("#squad1-slots").innerHTML = slotTemplate(state.squad1, currentPositions().length);
  $("#squad2-slots").innerHTML = slotTemplate(state.squad2, currentPositions().length);
}

/* ===================== FINISH & MATCH SIMULATION ===================== */
function finishAuction(){
  clearInterval(timerId);
  const strength1 = squadStrength(state.squad1);
  const strength2 = squadStrength(state.squad2);
  state.finalScore1 = simulateGoals(strength1);
  state.finalScore2 = simulateGoals(strength2);

  if (state.finalScore1 > state.finalScore2) state.winnerText = "🏆 الفائز: " + state.p1Name;
  else if (state.finalScore2 > state.finalScore1) state.winnerText = "🏆 الفائز: " + state.p2Name;
  else state.winnerText = "🤝 تعادل مثير بين الفريقين!";

  // Points: win +3, draw +1, loss -2
  if (state.finalScore1 > state.finalScore2){ state.points1 = 3; state.points2 = -2; }
  else if (state.finalScore2 > state.finalScore1){ state.points1 = -2; state.points2 = 3; }
  else { state.points1 = 1; state.points2 = 1; }

  // Match report: goal scorers, cards, best players, and stats
  state.matchEvents = generateMatchEvents(state.squad1, state.squad2, state.finalScore1, state.finalScore2);
  state.matchStats = generateMatchStats(strength1, strength2, state.matchEvents);
  const best1 = pickBestPlayer(state.squad1);
  const best2 = pickBestPlayer(state.squad2);
  state.bestPlayer1 = best1 ? best1.name : "—";
  state.bestPlayer2 = best2 ? best2.name : "—";

  state.status = "finished";
  renderResultFromState();
  showScreen("screen-result");
  clearLocalProgress();
  $("#btn-tournament-continue").hidden = !tournamentPending;
  $("#btn-replay").hidden = !!tournamentPending;

  // Award points once, from whichever browser is authoritative for this match
  // (the sole local browser in ai/local modes, or the host in online mode).
  if (state.mode !== "online" || onlineRole === "host"){
    awardPoints(state.p1Name, state.points1);
    awardPoints(state.p2Name, state.points2);
    addMissionGoals(state.finalScore1 + state.finalScore2);
  }

  if (state.mode === "online" && onlineRole === "host"){
    syncOnlineState();
    roomRef.child("status").set("finished");
  }
}

function pickBestPlayer(squad){
  if (!squad || !squad.length) return null;
  return squad.slice().sort((a,b) => (b.rating||0) - (a.rating||0))[0];
}

function pickWeightedScorer(squad){
  const weighted = [];
  (squad || []).forEach(p => {
    let weight = 0;
    if (p.pos === "FW") weight = 6;
    else if (p.pos === "MF") weight = 3;
    else if (p.pos === "DF") weight = 1;
    for (let i = 0; i < weight; i++) weighted.push(p);
  });
  if (!weighted.length) return (squad && squad[0]) || { name: "لاعب" };
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function generateMatchEvents(squad1, squad2, score1, score2){
  const events = [];
  const usedMinutes = new Set();
  function randMinute(){
    let m, tries = 0;
    do { m = 1 + Math.floor(Math.random() * 90); tries++; } while (usedMinutes.has(m) && tries < 50);
    usedMinutes.add(m);
    return m;
  }
  for (let i = 0; i < score1; i++){
    events.push({ minute: randMinute(), type: "goal", team: 1, player: pickWeightedScorer(squad1).name });
  }
  for (let i = 0; i < score2; i++){
    events.push({ minute: randMinute(), type: "goal", team: 2, player: pickWeightedScorer(squad2).name });
  }
  const yellow1 = Math.floor(Math.random() * 3);
  const yellow2 = Math.floor(Math.random() * 3);
  for (let i = 0; i < yellow1 && squad1.length; i++){
    events.push({ minute: randMinute(), type: "yellow", team: 1, player: squad1[Math.floor(Math.random()*squad1.length)].name });
  }
  for (let i = 0; i < yellow2 && squad2.length; i++){
    events.push({ minute: randMinute(), type: "yellow", team: 2, player: squad2[Math.floor(Math.random()*squad2.length)].name });
  }
  events.sort((a,b) => a.minute - b.minute);
  return events;
}

function generateMatchStats(strength1, strength2, events){
  let poss1 = Math.round(50 + (strength1 - strength2) / 2);
  poss1 = Math.max(32, Math.min(68, poss1));
  const poss2 = 100 - poss1;

  const goals1 = events.filter(e => e.team === 1 && e.type === "goal").length;
  const goals2 = events.filter(e => e.team === 2 && e.type === "goal").length;
  const shots1 = Math.max(goals1 + 2, Math.round(8 + Math.random()*10 + (strength1-78)/5));
  const shots2 = Math.max(goals2 + 2, Math.round(8 + Math.random()*10 + (strength2-78)/5));
  const onTarget1 = Math.min(shots1, Math.max(goals1, Math.round(shots1*0.4)));
  const onTarget2 = Math.min(shots2, Math.max(goals2, Math.round(shots2*0.4)));
  const passes1 = Math.round(300 + poss1*4 + Math.random()*80);
  const passes2 = Math.round(300 + poss2*4 + Math.random()*80);
  const yellow1 = events.filter(e => e.team === 1 && e.type === "yellow").length;
  const yellow2 = events.filter(e => e.team === 2 && e.type === "yellow").length;

  return { poss1, poss2, shots1, shots2, onTarget1, onTarget2, passes1, passes2, yellow1, yellow2 };
}

function renderEventsList(events){
  const el = $("#events-list");
  if (!events || !events.length){
    el.innerHTML = '<p class="hint">مباراة هادئة من غير أهداف أو بطاقات تُذكر.</p>';
    return;
  }
  el.innerHTML = events.map(e => {
    const icon = e.type === "goal" ? "⚽" : "🟨";
    const teamName = e.team === 1 ? state.p1Name : state.p2Name;
    return `<div class="event-row team${e.team}">
      <span class="event-minute">${e.minute}'</span>
      <span class="event-icon">${icon}</span>
      <span class="event-player">${escapeHtml(e.player)}</span>
      <span class="event-team">${escapeHtml(teamName)}</span>
    </div>`;
  }).join("");
}

function renderBestPlayers(){
  const el = $("#best-players-row");
  function card(name, teamName){
    const safeName = name || "—";
    return `<div class="best-player-card">
      <div class="mini-avatar" style="background:${colorForName(safeName)}">${getInitials(safeName)}</div>
      <span class="best-player-name">${escapeHtml(safeName)}</span>
      <span class="best-player-team">${escapeHtml(teamName)}</span>
      <span class="stars">⭐⭐⭐</span>
    </div>`;
  }
  el.innerHTML = card(state.bestPlayer1, state.p1Name) + card(state.bestPlayer2, state.p2Name);
}

function statBlockHtml(label, v1, v2, suffix){
  suffix = suffix || "";
  const total = (v1 + v2) || 1;
  const pct1 = Math.round(v1 / total * 100);
  return `<div class="stat-block">
    <div class="stat-label">${label}</div>
    <div class="stat-compare">
      <span class="stat-num">${v1}${suffix}</span>
      <div class="stat-bar"><div class="stat-fill" style="width:${pct1}%"></div></div>
      <span class="stat-num">${v2}${suffix}</span>
    </div>
  </div>`;
}

function renderStats(stats){
  $("#stats-list").innerHTML =
    statBlockHtml("الاستحواذ", stats.poss1, stats.poss2, "%") +
    statBlockHtml("التسديدات", stats.shots1, stats.shots2) +
    statBlockHtml("تسديدات على المرمى", stats.onTarget1, stats.onTarget2) +
    statBlockHtml("التمريرات", stats.passes1, stats.passes2) +
    statBlockHtml("البطاقات الصفراء", stats.yellow1, stats.yellow2);
}

function renderResultFromState(){
  $("#res-name1").textContent = state.p1Name;
  $("#res-name2").textContent = state.p2Name;
  $("#res-score1").textContent = state.finalScore1;
  $("#res-score2").textContent = state.finalScore2;
  $("#winner-line").textContent = state.winnerText;

  const formationLabel = state.squadSize === 5 ? "1-2-1" : "4-4-2";
  $("#res-formation1").textContent = formationLabel;
  $("#res-formation2").textContent = formationLabel;

  const crest1 = $("#res-crest1"); crest1.textContent = getInitials(state.p1Name); crest1.style.background = colorForName(state.p1Name);
  const crest2 = $("#res-crest2"); crest2.textContent = getInitials(state.p2Name); crest2.style.background = colorForName(state.p2Name);

  const p1 = pointsLabel(state.points1 || 0);
  const p2 = pointsLabel(state.points2 || 0);
  const el1 = $("#res-points1"); el1.textContent = state.p1Name + ": " + p1.text; el1.className = "points-delta " + p1.cls;
  const el2 = $("#res-points2"); el2.textContent = state.p2Name + ": " + p2.text; el2.className = "points-delta " + p2.cls;

  renderEventsList(state.matchEvents || []);
  renderBestPlayers();
  renderStats(state.matchStats || { poss1:50, poss2:50, shots1:0, shots2:0, onTarget1:0, onTarget2:0, passes1:0, passes2:0, yellow1:0, yellow2:0 });

  $("#res-squad1-name").textContent = state.p1Name;
  $("#res-squad2-name").textContent = state.p2Name;
  $("#res-squad1-slots").innerHTML = resultSlotTemplate(state.squad1);
  $("#res-squad2-slots").innerHTML = resultSlotTemplate(state.squad2);
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

function collapseGameConfig(){
  $("#auction-config").hidden = true;
  $("#guess-config").hidden = true;
  $$("#game-type-grid .cover-card").forEach(c => c.classList.remove("selected"));
}

function resetToHome(){
  clearInterval(timerId);
  detachRoomListeners();
  clearOnlineSession();
  clearLocalProgress();
  onlineRole = null; roomCode = null; roomRef = null;
  guessState = null;
  showScreen("screen-choose-game");
  collapseGameConfig();
  $$("#mode-grid .option-card").forEach(c => c.classList.remove("selected"));
  $("#field-p2").hidden = true;
  $("#input-p1").value = getSavedPlayerName();
  $("#input-p2").value = "";
  selectedMode = null;
  state = null;
  $("#btn-tournament-continue").hidden = true;
  $("#btn-replay").hidden = false;
  renderMissionCard();
}

$("#btn-replay").addEventListener("click", resetToHome);

$("#btn-game-home").addEventListener("click", () => {
  const inGame = state && state.round > 0 && state.status !== "finished";
  if (inGame && !confirm("هتخرج من المزاد الحالي وتتفقد كل التقدم — متأكد؟")) return;
  resetToHome();
});

$("#btn-open-leaderboard").addEventListener("click", () => {
  showScreen("screen-leaderboard");
  loadLeaderboard("auction");
});
$("#btn-leaderboard-back").addEventListener("click", () => showScreen("screen-choose-game"));
$("#tab-lb-auction").addEventListener("click", () => loadLeaderboard("auction"));
$("#tab-lb-guess").addEventListener("click", () => loadLeaderboard("guess"));

/* ===================== GAME TYPE SELECTION ===================== */
let selectedSquadSize = 11;
let selectedGameType = "auction"; // 'auction' | 'boxes' | 'blind'

$$("#game-type-grid .cover-card").forEach(card => {
  card.addEventListener("click", () => {
    const game = card.dataset.game;
    $$("#game-type-grid .cover-card").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    if (game === "auction" || game === "boxes" || game === "blind"){
      selectedGameType = game;
      selectedSquadSize = Number(card.dataset.squad) === 5 ? 5 : 11;
      const fmtLabel = SQUAD_FORMATS[selectedSquadSize].label;
      const gameLabel = game === "boxes" ? "🎁 صناديق الحظ — " : game === "blind" ? "🕶️ المزاد الأعمى — " : "";
      $("#auction-config-label").textContent = gameLabel + fmtLabel;
      $("#a
