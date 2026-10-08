import SwiftUI
import UIKit
import WebKit

struct BurgerSimulatorWebView: UIViewRepresentable {
    let html: String
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.bounces = false
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.allowsBackForwardNavigationGestures = false
        webView.loadHTMLString(html, baseURL: URL(string: "https://worlds-unbound-coop.onrender.com/")!)
        return webView
    }
    func updateUIView(_ webView: WKWebView, context: Context) {}
}

@main
struct BurgerSimulatorPlaygroundApp: App {
    var body: some Scene {
        WindowGroup {
            BurgerSimulatorWebView(html: EmbeddedGame.html)
                .ignoresSafeArea()
        }
    }
}

private enum EmbeddedGame {
    static let html = #"""
<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>Burger Simulator V2.2 CO-OP</title>
<style>
*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#070807;color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,sans-serif}body{touch-action:none;-webkit-font-smoothing:antialiased;overscroll-behavior:none}.hidden{display:none!important}button,input{font:inherit}button{border:1px solid #ffffff14;cursor:pointer}button:focus-visible,input:focus-visible{outline:2px solid #ffcb64;outline-offset:2px}canvas{position:fixed;inset:0;width:100%;height:100%;image-rendering:auto}.screen{position:fixed;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 15%,#6b421d 0,#20160e 30%,#080908 78%);z-index:100}.screen:before{content:'';position:absolute;inset:0;background:linear-gradient(120deg,#ffbd4317,transparent 35%,#0008),radial-gradient(circle at 80% 70%,#f0a62c10,transparent 35%);pointer-events:none}.card{position:relative;width:min(520px,92vw);padding:34px;border-radius:30px;background:linear-gradient(145deg,#191d1af5,#090c0bf4);border:1px solid #ffffff1d;box-shadow:0 35px 130px #000e,0 0 80px #ffb52d12;backdrop-filter:blur(24px);text-align:center}.titleCard{overflow:hidden}.titleCard:after{content:'🍔';position:absolute;right:-18px;bottom:-34px;font-size:170px;opacity:.05;transform:rotate(-12deg)}.tag{color:#ffd172;font-weight:1000;letter-spacing:.26em;font-size:11px}.titleCard h1{font-size:clamp(66px,14vw,140px);line-height:.75;margin:18px 0;letter-spacing:-.1em;text-shadow:0 12px 40px #000}.titleCard h1 span{color:#ffbc43;text-shadow:0 0 32px #ffad2d33}.lead{color:#c7cbc6;line-height:1.5}.card input,.modal input{width:100%;padding:15px 16px;margin:8px 0;border:1px solid #ffffff14;border-radius:14px;background:#ffffff09;color:#fff;outline:none}.card input:focus,.modal input:focus{border-color:#ffbf5288;box-shadow:0 0 0 3px #ffbf5213}.row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.card button,.modal button{width:100%;padding:14px;margin-top:10px;border-radius:14px;background:linear-gradient(180deg,#ffd36f,#e99a22);color:#241706;font-weight:1000;box-shadow:0 10px 28px #0008}.card button:hover,.modal button:hover{filter:brightness(1.08);transform:translateY(-1px)}button.ghost{background:#ffffff09!important;color:#fff!important;box-shadow:none!important}.miniStats{display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-top:16px}.miniStats span{padding:7px 9px;border-radius:10px;background:#ffffff06;border:1px solid #ffffff0d;color:#8f9891;font-size:11px}.codeInput{text-align:center;font-size:28px;letter-spacing:.25em;text-transform:uppercase}.hidden{display:none!important}#hud{position:fixed;inset:0;z-index:10}header{position:fixed;top:12px;left:12px;right:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;border:1px solid #ffffff15;border-radius:17px;background:linear-gradient(180deg,#111815ed,#090c0be8);backdrop-filter:blur(18px);box-shadow:0 16px 50px #0009,inset 0 1px #fff1;z-index:20}.brand{display:flex;align-items:center;gap:8px;margin-right:auto;color:#ffd06c}.brand small{display:block;font-size:8px;letter-spacing:.14em;color:#7f8a83}.moneyChip,.debtChip,.statChip,.roomChip,.clockChip{padding:8px 10px;border-radius:11px;background:#ffffff06;border:1px solid #ffffff0b;font-size:12px}.moneyChip strong{color:#8ff0aa}.debtChip strong{color:#ff888c}.statChip strong,.roomChip strong{color:#fff}.debtChip{box-shadow:inset 0 -2px #b9465022}.roomChip{display:flex;align-items:center;gap:7px;color:#b7c1ba}.roomChip i{width:7px;height:7px;border-radius:50%;background:#9aa39d;display:block;box-shadow:0 0 10px #ffffff22}.roomChip i.online{background:#65ef9d;box-shadow:0 0 12px #65ef9d99}.roomChip i.connecting{background:#ffd35c;box-shadow:0 0 12px #ffd35c88}.roomChip i.offline{background:#ff7878;box-shadow:0 0 12px #ff787855}.brand+div{margin-left:0}header button{background:#ffffff09;color:#fff;border-radius:11px;padding:9px 11px}.orderPanel{position:fixed;left:14px;top:78px;min-width:290px;max-width:410px;padding:15px 17px;border-radius:17px;background:linear-gradient(145deg,#111916f0,#080b0ae8);border:1px solid #ffffff13;box-shadow:0 15px 45px #0009;backdrop-filter:blur(18px);z-index:18}.orderTop{display:flex;justify-content:space-between;color:#ffcf6a;font-size:10px;font-weight:1000;letter-spacing:.13em}.orderTop b{font-size:12px}.orderPanel #orderName{font-size:21px;font-weight:1000;margin:7px 0 5px}.recipeLine{color:#bec4bf;font-size:11px;line-height:1.45}.progress{height:7px;margin-top:10px;background:#151916;border-radius:10px;overflow:hidden}.progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffb438,#ffe28a);box-shadow:0 0 18px #ffba3c66}.orderHint{display:block;color:#828b86;margin-top:7px;font-size:10px}.stationGuide{position:fixed;right:14px;top:78px;display:flex;flex-direction:column;gap:7px;z-index:18}.stationGuide>div{width:106px;padding:9px 10px;border-radius:12px;background:linear-gradient(145deg,#111a16ea,#080c0be8);border:1px solid #ffffff10;box-shadow:0 10px 30px #0007}.stationGuide b{font-size:10px;color:#ffcf6c}.stationGuide small{display:block;color:#7f8a83;font-size:9px;margin-top:2px}.rightTools{position:fixed;right:14px;bottom:15px;display:flex;gap:7px;z-index:18;flex-wrap:wrap;justify-content:flex-end;max-width:470px}.rightTools button{padding:9px 11px;border-radius:11px;background:#0e1511df;color:#dde2dc}.rightTools button:hover{background:#172019}.help{position:fixed;left:14px;bottom:16px;padding:9px 12px;border:1px solid #ffffff0c;border-radius:11px;background:#080c0bdd;color:#aeb6b0;font-size:10px;z-index:17}.objectiveBar{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);padding:9px 13px}.modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(460px,92vw);max-height:86vh;overflow:auto;padding:25px;border-radius:22px;background:linear-gradient(145deg,#121916fb,#080b0afa);border:1px solid #ffffff1b;box-shadow:0 40px 120px #000e,0 0 60px #ffb52d12;backdrop-filter:blur(22px);z-index:90}.modal h2{margin:4px 0 12px;color:#ffd171}.modal p{color:#b8beb9;line-height:1.5}.modalTag{font-size:10px;letter-spacing:.18em;color:#d39a42;font-weight:1000}.inventoryGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.invItem{padding:11px;border-radius:12px;background:#ffffff06;border:1px solid #ffffff0c}.invItem span{color:#9fa8a2;font-size:11px;display:block}.invItem b{font-size:16px;color:#fff}.shopList{display:grid;gap:8px}.shopItem{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px;padding:13px;border-radius:13px;background:#ffffff06;border:1px solid #ffffff0c}.shopItem strong{color:#fff}.shopItem small{display:block;color:#929b95;margin-top:3px}.shopItem button{width:auto;min-width:110px;margin:0}.staffCard{padding:13px;border-radius:13px;background:#ffffff06;border:1px solid #ffffff0c;margin:8px 0}.staffCard>b{display:block}.staffCard>span{display:block;color:#9da49f;font-size:11px;margin:4px 0}.staffCard button{margin-top:5px}.toggleRow{display:flex;justify-content:space-between;align-items:center;padding:15px 0;border-top:1px solid #ffffff12}.toggleRow input{width:24px;height:24px;accent-color:#ffbe49}.cashCustomer,.changeBox{display:flex;justify-content:space-between;align-items:center;padding:12px 13px;border-radius:12px;background:#ffffff06;border:1px solid #ffffff0b;margin:7px 0}.cashCustomer strong{color:#fff}.changeBox{background:#162216;border-color:#46764d}.changeBox strong{color:#8ff0aa;font-size:22px}.cashLabel{display:block;color:#aeb6b0;font-size:11px;margin-top:12px}.cashQuick{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.cashQuick button{margin:0;padding:11px 7px}.mobileOn #mobile{display:block}.mobileOn .help{display:none}.mobileOn .rightTools{bottom:110px}.mobileOn #joy{display:block}.mobileOn #actions{display:flex}#mobile{display:none}#joy{position:fixed;left:18px;bottom:22px;width:142px;height:142px;border-radius:50%;background:radial-gradient(circle,#ffffff12 0 42%,#ffffff05 43%);border:2px solid #ffffff45;box-shadow:inset 0 0 30px #0005,0 15px 45px #0009;z-index:40;touch-action:none}.joyHint{display:none}#joy:after{content:'';position:absolute;inset:12px;border-radius:50%;border:1px solid #ffffff10}#joy i{position:absolute;left:50%;top:50%;width:62px;height:62px;border-radius:50%;background:radial-gradient(circle at 34% 28%,#ffe491,#ffad29 72%);box-shadow:0 0 25px #ffb52d55,0 8px 20px #0009;transform:translate(-50%,-50%);pointer-events:none}#actions{position:fixed;right:18px;bottom:22px;display:none;gap:10px;z-index:40}#actions button{width:72px;height:72px;border-radius:50%;border:1px solid #ffffff22;background:radial-gradient(circle at 35% 28%,#ffe48d,#f0a52b 72%);color:#251a0a;font-size:22px;font-weight:1000;box-shadow:0 12px 35px #0009}#actions button+button{background:radial-gradient(circle at 35% 28%,#fffdf2,#ffd98c 72%)}#storyPanel{z-index:120}.mobileStartToggle{display:none!important}#mobile{pointer-events:none!important}#joy{pointer-events:auto!important;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:grab}#joy:active{cursor:grabbing}#actions{pointer-events:none!important}#actions button{pointer-events:auto!important;touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}.mobileOff #mobile,.mobileOff #joy,.mobileOff #actions{display:none!important}@media(pointer:coarse){body:not(.mobileOff).mobileOn #mobile,body:not(.mobileOff) #mobile{display:block!important}body:not(.mobileOff) #joy{display:block!important}body:not(.mobileOff) #actions{display:flex!important}.help{display:none!important}}@media(max-width:700px){header{top:7px;left:7px;right:7px;padding:7px;gap:5px}.brand{font-size:11px}.brand small{font-size:7px}.moneyChip,.debtChip,.statChip,.roomChip{font-size:10px;padding:6px 7px}.orderPanel{top:66px;left:8px;max-width:245px;min-width:0;padding:11px 12px}.orderPanel #orderName{font-size:16px}.stationGuide{top:66px;right:8px;gap:4px}.stationGuide>div{width:88px;padding:7px 8px}.rightTools{right:8px;bottom:98px;max-width:250px;gap:5px}.rightTools button{font-size:9px;padding:7px 8px}.help{font-size:9px;left:8px;bottom:8px}.modal{width:min(95vw,440px);padding:18px;max-height:90vh}.cashQuick button{font-size:11px}.cashQuick{grid-template-columns:repeat(4,1fr)}.mobileOn #joy{width:128px;height:128px;left:14px;bottom:max(18px,env(safe-area-inset-bottom))}.mobileOn #actions{right:12px;bottom:max(14px,env(safe-area-inset-bottom))}.mobileOn #actions button{width:62px;height:62px}.titleCard{padding:25px}.row{grid-template-columns:1fr}.miniStats{display:none}.roomChip{order:6}.brand{order:1}.moneyChip{order:2}.debtChip{order:3}.statChip{order:4}.roomChip{order:5}#settings{order:7}}
.clockChip{color:#cbd6cf}
.clockChip strong{color:#ffd36f;min-width:42px;display:inline-block;text-align:center}
.tutorialInfo{position:fixed;left:14px;top:242px;width:190px;padding:14px 15px;border-radius:14px;background:#f1f1ef;color:#171717;box-shadow:0 18px 45px #0009;z-index:19;border:2px solid #bcbfbd}
.tutorialInfo b{display:block;font-size:15px;margin-bottom:7px}
.tutorialInfo span{display:block;font-size:10px;line-height:1.45;margin-top:4px}
.settingLabel{display:block;color:#aeb6b0;font-size:11px;margin-top:12px}
.settingLabel input{margin-top:6px}
@media(max-width:700px){
  .tutorialInfo{left:8px;top:210px;width:174px;padding:11px 12px}
  .tutorialInfo b{font-size:13px}
  .tutorialInfo span{font-size:9px}
  .clockChip{order:4;font-size:9px;padding:6px 7px}
  .statChip{order:5}
  .roomChip{order:6}
  #settings{order:7}
}

/* --- Burger Simulator screenshot polish --- */.tutorialInfo{
  position:fixed;
  left:14px;
  top:230px;
  width:205px;
  padding:14px 15px;
  border-radius:16px;
  background:linear-gradient(145deg,#f7f7f5,#dfe1df);
  color:#171917;
  border:2px solid #c5c8c5;
  box-shadow:0 18px 48px #0008, inset 0 1px #fff;
  z-index:19;
  transition:opacity .25s ease,transform .25s ease;
}
.tutorialInfo.tutorialDone{
  opacity:0;
  transform:translateY(-10px) scale(.96);
  pointer-events:none;
}
.tutorialHeader{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  margin-bottom:8px;
}
.tutorialHeader b{font-size:14px;letter-spacing:.02em}
.tutorialStep{
  padding:3px 7px;
  border-radius:999px;
  background:#171917;
  color:#ffe18b;
  font-size:8px;
  font-weight:1000;
}
.tutorialInfo strong{
  display:block;
  font-size:15px;
  margin-bottom:4px;
}
.tutorialInfo span:not(.tutorialStep){
  display:block;
  font-size:10px;
  line-height:1.45;
  color:#444944;
}
@media(max-width:700px){
 .tutorialInfo{left:8px;top:202px;width:180px;padding:11px 12px}
 .tutorialHeader b{font-size:12px}
 .tutorialInfo strong{font-size:13px}
 .tutorialInfo span:not(.tutorialStep){font-size:9px}}

.tutorialInfo{
  background:linear-gradient(145deg,#111916f4,#080c0be8)!important;
  color:#eef2ee!important;
  border:1px solid #ffffff16!important;
  box-shadow:0 18px 52px #000a,inset 0 1px #ffffff0b!important;
  backdrop-filter:blur(18px);
}
.tutorialHeader b{color:#ffd477!important}
.tutorialStep{background:#ffffff08!important;color:#ffd477!important;border:1px solid #ffffff12!important}
.tutorialInfo strong{color:#f3f6f3!important}
.tutorialInfo span:not(.tutorialStep){color:#9ca59f!important}

/* Right-side management stack under the settings gear */
.rightTools{
  position:fixed!important;
  right:14px!important;
  top:76px!important;
  bottom:auto!important;
  max-width:none!important;
  width:136px;
  display:flex!important;
  flex-direction:column!important;
  align-items:stretch!important;
  gap:7px!important;
  z-index:21!important;
}
.rightTools button{
  width:136px!important;
  padding:10px 12px!important;
  text-align:left;
  background:linear-gradient(180deg,#111916ef,#080c0be8)!important;
  border:1px solid #ffffff12!important;
  box-shadow:0 10px 28px #0008!important;
  backdrop-filter:blur(12px);
}
.rightTools button:hover{
  transform:translateX(-2px);
  border-color:#ffd36a55!important;
  background:linear-gradient(180deg,#18211c,#0b100e)!important;
}
@media(max-width:700px){
  .rightTools{
    top:118px!important;
    right:8px!important;
    width:118px;
    gap:5px!important;
  }
  .rightTools button{
    width:118px!important;
    font-size:9px;
    padding:8px 9px!important;
  }
}

/* Premium modal close X */
.modalCloseX{
 position:absolute;
 top:12px;
 right:12px;
 width:38px!important;
 height:38px;
 margin:0!important;
 padding:0!important;
 display:grid;
 place-items:center;
 border-radius:12px!important;
 background:linear-gradient(180deg,#242d28,#101512)!important;
 color:#f3eee2!important;
 border:1px solid #ffffff18!important;
 box-shadow:0 8px 22px #0007!important;
 font-size:26px!important;
 line-height:1!important;
 font-weight:700!important;
 z-index:3;
 transition:transform .16s ease,filter .16s ease,border-color .16s ease,box-shadow .16s ease;
}
.modalCloseX:hover{
 transform:rotate(6deg) scale(1.05)!important;
 border-color:#ffd36a66!important;
 box-shadow:0 10px 28px #0009,0 0 18px #ffd36a18!important;
}
.modalCloseX:active{
 transform:scale(.88) rotate(-4deg)!important;
}
.modal{
 animation:modalIn .22s cubic-bezier(.2,.8,.2,1);
}
@keyframes modalIn{
 from{opacity:0;transform:translate(-50%,-47%) scale(.96)}
 to{opacity:1;transform:translate(-50%,-50%) scale(1)}
}

#actions button.isPressed{
 transform:scale(.88)!important;
 filter:brightness(1.16);
 box-shadow:0 6px 16px #000b,0 0 26px #ffd36a55!important;
}
#actions button{
 transition:transform .12s ease,filter .12s ease,box-shadow .12s ease;
 will-change:transform;
}
#actions button:active{
 transform:scale(.88)!important;
}


/* --- Save file system --- */
.saveList{display:grid;gap:9px;margin:12px 0}
.saveSlot{
 display:grid;
 grid-template-columns:1fr auto;
 gap:10px;
 align-items:center;
 padding:13px;
 border:1px solid #ffffff10;
 border-radius:14px;
 background:linear-gradient(145deg,#ffffff08,#ffffff04);
 transition:transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease;
}
.saveSlot:hover{transform:translateY(-1px);border-color:#ffd36a44;background:#ffffff0a;box-shadow:0 10px 28px #0006}
.saveSlot.empty{opacity:.68}
.saveSlotInfo{min-width:0;text-align:left}
.saveSlotTop{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.saveSlotTop b{color:#ffd36f;font-size:11px;letter-spacing:.08em}
.saveSlotName{font-weight:1000;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.saveSlotStats{display:flex;gap:9px;flex-wrap:wrap;color:#aab3ad;font-size:10px;margin-top:4px}
.saveSlotCode{color:#e9d7a0;font-size:10px;letter-spacing:.12em;margin-top:5px;font-variant-numeric:tabular-nums}
.saveSlot button{width:auto;min-width:118px;margin:0}
.saveHostHint{margin:7px 0 2px!important;font-size:10px!important}
.saveCodeBox{
 margin:14px 0;
 padding:16px;
 border-radius:15px;
 background:linear-gradient(145deg,#171e19,#0c110e);
 border:1px solid #ffd36a2e;
 box-shadow:inset 0 1px #fff1,0 12px 36px #0007;
 text-align:center;
}
.saveCodeBox span{display:block;color:#9ba39d;font-size:9px;letter-spacing:.16em;margin-bottom:7px}
.saveCodeBox strong{display:block;color:#ffe18f;font-size:30px;letter-spacing:.18em;line-height:1.1}
.saveCodeStart{margin-top:10px}
.saveCodeStart button{margin-top:3px}
#hostLeftPanel{z-index:160}
#savePanel,#saveResultPanel{z-index:150}
.modal button:disabled{
 cursor:not-allowed;
 opacity:.42;
 filter:saturate(.6);
 transform:none!important;
}
.modal button.isPressed,.card button.isPressed{
 transform:scale(.97)!important;
 filter:brightness(1.08);
}
@media(max-width:700px){
 .saveSlot{grid-template-columns:1fr}
 .saveSlot button{width:100%;min-width:0}
 .saveCodeBox strong{font-size:24px}
}

</style>
</head>
<body>
<canvas id="game"></canvas>

<div id="menu" class="screen">
  <div class="card titleCard">
    <div class="tag">🍔 2 PLAYER CO-OP • V2.1</div>
    <h1>BURGER<br><span>SIMULATOR</span></h1>
    <p class="lead">Baut euren Burgerladen auf. Liefert Schichten ab. Zahlt die €1.000.000 zurück.</p>
    <input id="name" maxlength="16" value="Hero" placeholder="Euer Name">
    <div class="row">
      <button id="create">🍔 LADEN ERSTELLEN</button>
      <button id="joinOpen">🤝 CO-OP BEITRETEN</button>
    </div>
    <button id="loadSaveOpen">💾 SPIEL LADEN</button>
    <button id="how">📖 STORY & SO SPIELT MAN</button>
    <button id="mobileStartToggle" class="mobileStartToggle" aria-hidden="true">📱 MOBILE STEUERUNG: <span id="mobileStartState">AN</span></button>
    <div class="miniStats"><span>🧑‍🤝‍🧑 2 Spieler</span><span>💶 €1.000.000 Schulden</span><span>⚡ Echtzeit CO-OP</span></div>
  </div>
</div>

<div id="join" class="screen hidden">
  <div class="card">
    <div class="tag">CO-OP</div>
    <h2>ROOM BEITRETEN</h2>
    <p>Gebt den 5-stelligen Raumcode des Hosts ein.</p>
    <input id="code" maxlength="5" placeholder="X7K4P" class="codeInput" autocomplete="off" spellcheck="false">
    <button id="joinRoomBtn">🤝 ROOM STARTEN</button>
    <button id="back" class="ghost">ZURÜCK</button>
  </div>
</div>

<div id="loadSave" class="screen hidden">
  <div class="card">
    <div class="tag">💾 SAVE FILES</div>
    <h2>SPIEL LADEN</h2>
    <p>Wähle einen gespeicherten Laden oder gib deinen Save-Code ein.</p>
    <div id="startSaveList" class="saveList startSaveList"></div>
    <div class="saveCodeStart">
      <input id="saveCodeInput" maxlength="8" placeholder="8-STELLIGER SAVE-CODE" class="codeInput" autocomplete="off" spellcheck="false">
      <button id="loadSaveCodeBtn">🔓 MIT SAVE-CODE LADEN</button>
    </div>
    <button id="loadSaveBack" class="ghost">ZURÜCK</button>
  </div>
</div>

<div id="hud" class="hidden">
  <header>
    <div class="brand">🍔 <b id="shopNameLabel">BURGER SIMULATOR</b><small id="shiftLabel">TAG 1 • 08:00</small></div>
    <div class="roomChip">ROOM <strong id="room">—</strong><i id="connectionDot"></i></div>
    <div class="moneyChip">💰 <strong id="money">500</strong>€</div>
    <div class="debtChip">📉 <strong id="debt">1.000.000</strong>€</div>
    <div class="clockChip">🕒 <strong id="gameClock">08:00</strong></div>
    <div class="statChip">⭐ LV <strong id="level">1</strong></div>
    <div class="statChip">👥 <strong id="playerCount">1/2</strong></div>
    <button id="settings" aria-label="Einstellungen">⚙️</button>
  </header>

  <div class="orderPanel" id="orderPanel">
    <div class="orderTop"><span>🔔 AKTIVE BESTELLUNG</span></div>
    <div id="orderName">Classic Burger</div>
    <div class="recipeLine" id="recipeLine">🍞 Bun → 🥩 Patty → 🍔 Assembly → 💵 Kasse</div>
    <div class="progress"><i id="orderProgress"></i></div>
    <small id="orderHint">Geht zu einer Station und drückt E.</small>
  </div>

  <div class="rightTools">
    <button id="inventoryBtn">🎒 INVENTAR</button>
    <button id="shopBtn">🛒 SHOP</button>
    <button id="staffBtn">👨‍🍳 PERSONAL</button>
  </div>

  <div id="tutorialInfo" class="tutorialInfo">
    <div class="tutorialHeader"><b>📖 TUTORIAL</b><span class="tutorialStep">1 / 3</span></div>
    <strong id="tutorialTitle">Graues Feld benutzen</strong>
    <span id="tutorialText">Stell dich auf das graue Feld vor der markierten Station.</span>
  </div>
  <div id="objectiveBar">🎯 Ziel: Verdient Geld und zahlt die Mafia-Schulden zurück.</div>
  <div class="help">WASD / Pfeile bewegen • E Interagieren • Q Bestellung • I Inventar • U Shop</div>
  <div id="toast"></div>

  <div id="mobile">
    <div id="joy" aria-label="Bewegungsjoystick"><i></i></div>
    <div id="actions">
      <button id="mInteract" aria-label="Interagieren">✋</button>
    </div>
  </div>

  <div id="cashPanel" class="modal hidden">
    <div class="modalTag">💵 KASSE</div>
    <h2>ZAHLUNG ANNEHMEN</h2>
    <div class="cashCustomer"><span>Rechnung</span><strong id="cashDue">€0,00</strong></div>
    <div class="cashCustomer"><span>Kunde gibt</span><strong id="cashGiven">€0,00</strong></div>
    <div class="changeBox"><span>Rückgeld</span><strong id="cashChange">€0,00</strong></div>
    <label class="cashLabel">Erhaltenes Geld
      <input id="cashInput" inputmode="decimal" autocomplete="off" placeholder="z.B. 20">
    </label>
    <div class="cashQuick"><button data-cash="exact">PASSEND</button><button data-cash="20">20€</button><button data-cash="50">50€</button><button data-cash="100">100€</button></div>
    <button id="cashAccept">✅ GELD NEHMEN & RÜCKGELD GEBEN</button>
    <button id="cashCancel" class="ghost">ABBRECHEN</button>
  </div>

  <div id="inventoryPanel" class="modal hidden">
    <button id="inventoryCloseX" class="modalCloseX" aria-label="Inventar schließen">×</button>
    <div class="modalTag">🎒 LAGER & INVENTAR</div><h2>VORRÄTE</h2>
    <div id="inventoryList" class="inventoryGrid"></div>
  </div>

  <div id="shopPanel" class="modal hidden">
    <button id="shopCloseX" class="modalCloseX" aria-label="Shop schließen">×</button>
    <div class="modalTag">🛒 INVESTITIONEN</div><h2>LADEN AUSBAUEN</h2>
    <div id="shopList" class="shopList"></div>
  </div>

  <div id="staffPanel" class="modal hidden">
    <button id="staffCloseX" class="modalCloseX" aria-label="Personal schließen">×</button>
    <div class="modalTag">👨‍🍳 PERSONAL</div><h2>TEAM VERWALTEN</h2>
    <div class="staffCard"><b>🍳 Küchenhilfe</b><span id="staffKitchen">Stufe 0</span><button data-staff="kitchen">+ EINSTELLEN / UPGRADEN</button></div>
    <div class="staffCard"><b>💵 Kassierer</b><span id="staffCash">Stufe 0</span><button data-staff="cashier">+ EINSTELLEN / UPGRADEN</button></div>
    <div class="staffCard"><b>🧹 Reinigung</b><span id="staffClean">Stufe 0</span><button data-staff="cleaner">+ EINSTELLEN / UPGRADEN</button></div>
  </div>

  <div id="settingsPanel" class="modal hidden">
    <div class="modalTag">⚙️ OPTIONEN</div><h2>EINSTELLUNGEN</h2>
    <label class="toggleRow">Mobile Steuerung <input id="mobileToggle" type="checkbox"></label>
    <label class="settingLabel">Ladenname
      <input id="shopNameInput" maxlength="24" value="BURGER SIMULATOR" placeholder="z.B. Burger King">
    </label>
    <button id="saveShopName">✅ LADENNAME SPEICHERN</button>
    <p>Der Ladenname wird für beide Spieler im aktuellen Raum übernommen.</p>
    <p>Der Joystick bleibt aktiv auf Touch-Geräten und lässt sich hier komplett an- oder ausschalten.</p>
    <button id="saveGameOpen">💾 SPIEL SPEICHERN</button>
    <p id="saveHostHint" class="saveHostHint">Nur der Host kann den Spielstand speichern.</p>
    <button id="settingsClose" class="ghost">ZURÜCK</button>
  </div>

  <div id="savePanel" class="modal hidden">
    <button id="saveCloseX" class="modalCloseX" aria-label="Speicherfenster schließen">×</button>
    <div class="modalTag">💾 SAVE FILES</div><h2>SPIEL SPEICHERN</h2>
    <p id="savePanelHint">Wähle einen der 3 Speicherplätze.</p>
    <div id="saveList" class="saveList"></div>
    <button id="saveClose" class="ghost">ZURÜCK</button>
  </div>

  <div id="saveResultPanel" class="modal hidden">
    <div class="modalTag">✅ SPEICHERPUNKT ERSTELLT</div>
    <h2>SPIEL GESPEICHERT</h2>
    <p id="saveResultSlot"></p>
    <div class="saveCodeBox">
      <span>SAVE-CODE</span>
      <strong id="saveResultCode">--------</strong>
    </div>
    <button id="saveContinue">▶ WEITERSPIELEN</button>
    <button id="saveLeave" class="ghost">🚪 VERLASSEN</button>
  </div>

</div>

<div id="hostLeftPanel" class="modal hidden">
  <div class="modalTag">⚠️ CO-OP ENDE</div>
  <h2>HOST HAT SERVER VERLASSEN</h2>
  <p>Der Host hat den Server verlassen. Du wurdest aus der Lobby entfernt.</p>
  <button id="hostLeftOk">OK</button>
</div>

<div id="storyPanel" class="modal hidden">
  <div class="modalTag">📖 DIE SCHULD</div><h2>€1.000.000 SCHULDEN</h2>
  <p><b>Ihr habt der Mafia €1.000.000 geschuldet.</b></p>
  <p>Eure letzte Chance: Führt euren Burgerladen. Nehmt Bestellungen an. Kocht sauber. Nehmt Geld an. Gebt korrekt Rückgeld. Investiert den Gewinn und baut euren Laden aus.</p>
  <p>Jede neue Schicht wird schneller und schwieriger. Gute Zusammenarbeit spart Zeit und Geld.</p>
  <button id="storyClose">✅ OK — LOS GEHT'S</button>
</div>

<script>
const $=id=>document.getElementById(id),c=$('game'),ctx=c.getContext('2d');

const touchDevice=('ontouchstart' in window)||navigator.maxTouchPoints>0;
let savedMobile=null;
try{savedMobile=localStorage.getItem('bm-mobile')}catch{}
let W,H,DPR,mode='menu',ws=null,room='',me='',shopName='BURGER SIMULATOR',dayStartedAt=0,mobile=touchDevice?true:(savedMobile==='1');
const DAY_LENGTH_MS=300000;
const DAY_START_MINUTES=8*60;
const DAY_END_MINUTES=22*60;
let connection='offline',connectBusy=false,connectTimer=0;
let last=performance.now(),keys=new Set(),joy={on:false,x:0,y:0},particles=[],floats=[],others=new Map(),activeTouch=null;
const recipes=[
 {name:'Classic Burger',price:8.5,steps:['bun','grill','assembly'],icons:'🍞 → 🥩 → 🍔 → 💵',need:{bun:1,patty:1}},
 {name:'Cheese Burger',price:10.5,steps:['bun','grill','cheese','assembly'],icons:'🍞 → 🥩 → 🧀 → 🍔 → 💵',need:{bun:1,patty:1,cheese:1}},
 {name:'Double Burger',price:14.5,steps:['bun','grill','grill','cheese','assembly'],icons:'🍞 → 🥩🥩 → 🧀 → 🍔 → 💵',need:{bun:1,patty:2,cheese:1}},
];
const station={
 bun:{x:465,y:170,label:'BUN',color:'#d19a63',emoji:'🍞'},
 grill:{x:615,y:170,label:'GRILL',color:'#e26b3e',emoji:'🔥'},
 cheese:{x:765,y:170,label:'CHEESE',color:'#efcf66',emoji:'🧀'},
 assembly:{x:915,y:170,label:'ASSEMBLY',color:'#debc69',emoji:'🍔'},
 cash:{x:855,y:455,label:'KASSE',color:'#5bc78b',emoji:'💵'}
};
const interactionPad={
 bun:{x:465,y:265,w:118,h:58},
 grill:{x:615,y:265,w:118,h:58},
 cheese:{x:765,y:265,w:118,h:58},
 assembly:{x:915,y:265,w:118,h:58},
 cash:{x:855,y:350,w:150,h:58}
};
function insidePad(pad,x,y,margin=0){
 return x>=pad.x-pad.w/2-margin&&x<=pad.x+pad.w/2+margin&&y>=pad.y-pad.h/2-margin&&y<=pad.y+pad.h/2+margin;
}
function circleHitsRect(x,y,r,rect){
 const qx=Math.max(rect.x,Math.min(x,rect.x+rect.w));
 const qy=Math.max(rect.y,Math.min(y,rect.y+rect.h));
 return Math.hypot(x-qx,y-qy)<r;
}
const solidObstacles=[
 {x:325,y:210,w:70,h:390},   // Lager/Kühlschrank
 {x:390,y:420,w:340,h:72}      // linkes Thekenstück
];
function hitsStationBody(x,y){
 for(const p of Object.values(station)){
  const rect={x:p.x-56,y:p.y-43,w:112,h:86};
  if(circleHitsRect(x,y,22,rect))return true;
 }
 for(const rect of solidObstacles)if(circleHitsRect(x,y,22,rect))return true;
 return false;
}

const supplyInfo={
 bun:{label:'Brötchen',unit:'🍞',price:18},
 patty:{label:'Pattys',unit:'🥩',price:32},
 cheese:{label:'Käse',unit:'🧀',price:20},
 packaging:{label:'Verpackungen',unit:'📦',price:12},
 drinks:{label:'Getränke',unit:'🥤',price:14}
};
let hero={
 x:765,y:565,speed:210,money:500,debt:1000000,level:1,xp:0,day:1,rep:0,rating:4.2,
 bun:12,patty:12,cheese:8,packaging:10,drinks:8,
 sales:0,revenueToday:0,expensesToday:0,shiftRevenue:0,shiftExpenses:0,completed:0,missed:0,
 cleanliness:100,staff:{kitchen:0,cashier:0,cleaner:0},
 upgrades:{grill:1,shop:1,seats:1,quality:1,register:1}
};
const DEFAULT_HERO_STATE=JSON.parse(JSON.stringify(hero));
let order=null,prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3},cash={due:0,given:0,change:0,open:false};
let effects={shake:0,flash:0,steam:[]};
const SAVE_STORAGE_KEY='bm-save-files-v2';
let saveSlots=[null,null,null],isHost=false,currentSaveCode='',pendingSave=null,leavingGame=false,kickedForHostLeave=false;

function purgeLegacySaves(){
 try{
  ['bm-last-save','bm-code-1','bm-code-2','bm-code-3',
   'bm-slot-1','bm-slot-2','bm-slot-3'].forEach(k=>localStorage.removeItem(k));
 }catch{}
}
purgeLegacySaves();

function cloneData(v){
 try{return JSON.parse(JSON.stringify(v))}catch{return null}
}
function loadLocalSaveSlots(){
 try{
  const raw=localStorage.getItem(SAVE_STORAGE_KEY);
  const parsed=raw?JSON.parse(raw):[];
  if(Array.isArray(parsed))saveSlots=Array.from({length:3},(_,i)=>parsed[i]||null);
 }catch{saveSlots=[null,null,null]}
}
function persistLocalSaveSlots(){
 try{localStorage.setItem(SAVE_STORAGE_KEY,JSON.stringify(saveSlots))}catch{}
}
loadLocalSaveSlots();

function resetLocalGameState(){
 hero=cloneData(DEFAULT_HERO_STATE);
 order=null;
 prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
 cash={due:0,given:0,change:0,open:false};
 effects={shake:0,flash:0,steam:[]};
 particles=[];floats=[];others.clear();
 shopName='BURGER SIMULATOR';dayStartedAt=0;currentSaveCode='';
 ui();
}
function makeSaveSnapshot(slot){
 const now=performance.now()/1000;
 return {
  version:2,
  slot:Number(slot)+1,
  savedAt:Date.now(),
  shopName,
  dayStartedAt,
  mobile,
  hero:cloneData(hero),
  order:cloneData(order),
  prep:{
   step:prep.step,started:prep.started,duration:prep.duration,
   readyIn:prep.started?Math.max(0,prep.readyAt-now):0,
   overIn:prep.started?Math.max(0,prep.overAt-now):0
  },
  cash:cloneData(cash),
  effects:cloneData(effects),
  particles:cloneData(particles),
  floats:cloneData(floats),
  players:[
   {id:me||'host',name:cleanSaveName($('name')?.value||'Hero'),x:hero.x,y:hero.y,host:true},
   ...[...others.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,host:false}))
  ]
 };
}
function cleanSaveName(v){
 return String(v||'Hero').replace(/[<>]/g,'').trim().slice(0,16)||'Hero';
}
function escapeHtml(v){
 return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function applySaveSnapshot(save){
 if(!save||typeof save!=='object'||!save.hero)return false;
 const fresh=cloneData(DEFAULT_HERO_STATE);
 hero={...fresh,...cloneData(save.hero),
  staff:{...fresh.staff,...(save.hero.staff||{})},
  upgrades:{...fresh.upgrades,...(save.hero.upgrades||{})}
 };
 if(Number.isFinite(save.hero.x))hero.x=save.hero.x;
 if(Number.isFinite(save.hero.y))hero.y=save.hero.y;
 hero.x=Math.max(300,Math.min(1215,hero.x));
 hero.y=Math.max(120,Math.min(770,hero.y));
 if(typeof save.shopName==='string'&&save.shopName.trim())shopName=save.shopName;
 dayStartedAt=Number(save.dayStartedAt)||Date.now();
 mobile=typeof save.mobile==='boolean'?save.mobile:mobile;
 order=save.order?cloneData(save.order):null;
 cash=save.cash?{...cloneData(save.cash)}:{due:0,given:0,change:0,open:false};
 const p=save.prep||{};
 const now=performance.now()/1000;
 prep={
  step:Number.isFinite(p.step)?p.step:-1,
  started:!!p.started,
  duration:Number.isFinite(p.duration)?p.duration:2.3,
  readyAt:now+Math.max(0,Number(p.readyIn)||0),
  overAt:now+Math.max(0,Number(p.overIn)||0)
 };
 effects=save.effects?cloneData(save.effects):{shake:0,flash:0,steam:[]};
 particles=Array.isArray(save.particles)?cloneData(save.particles):[];
 floats=Array.isArray(save.floats)?cloneData(save.floats):[];
 others.clear();
 if(save.players?.length){
  for(const p2 of save.players){
   if(p2.host||p2.id==='host'||p2.id===me)continue;
   if(p2.id)others.set(p2.id,{...p2});
  }
 }
 ui();renderInventory();renderShop();renderStaff();
 return true;
}
function renderSaveSlots(targetId='saveList',modeType='save'){
 const el=$(targetId);if(!el)return;
 el.innerHTML=saveSlots.map((slot,i)=>{
  if(!slot){
   return '<div class="saveSlot empty"><div class="saveSlotInfo"><div class="saveSlotTop"><b>SAVE FILE '+(i+1)+'</b></div><div class="saveSlotName">Noch nicht belegt</div><div class="saveSlotStats"><span>Kein Speicherpunkt vorhanden</span></div></div>'+
    (modeType==='save'?'<button data-save-slot="'+i+'">SLOT '+(i+1)+' ERSTELLEN</button>':'<button disabled>LEER</button>')+'</div>';
  }
  const money=Number(slot.money||0).toLocaleString('de-DE',{maximumFractionDigits:0});
  const rating=Number(slot.rating||0).toFixed(1);
  const safeName=escapeHtml(slot.name||'BURGER SIMULATOR');
  const safeCode=escapeHtml(slot.code||'--------');
  const action=modeType==='save'?'SPEICHERN':'LADEN';
  const disabled=modeType==='save'&&!isHost?' disabled':'';
  return '<div class="saveSlot"><div class="saveSlotInfo"><div class="saveSlotTop"><b>SAVE FILE '+(i+1)+'</b><span class="saveSlotName">'+safeName+'</span></div><div class="saveSlotStats"><span>💶 €'+money+'</span><span>⭐ '+rating+'</span></div><div class="saveSlotCode">CODE '+safeCode+'</div></div><button data-save-slot="'+i+'"'+disabled+'>'+action+'</button></div>';
 }).join('');
 el.querySelectorAll('[data-save-slot]').forEach(b=>{
  wirePressAnimation(b);
  b.onclick=()=>modeType==='save'?saveToSlot(Number(b.dataset.saveSlot)):loadLocalSlot(Number(b.dataset.saveSlot));
 });
}
function renderAllSaveLists(){
 renderSaveSlots('saveList','save');
 renderSaveSlots('startSaveList','load');
}
function localSaveByCode(code){
 const c=String(code||'').trim().toUpperCase();
 return saveSlots.find(s=>s?.code===c)||null;
}

function resize(){
 W=innerWidth;H=innerHeight;DPR=Math.min(devicePixelRatio||1,2);
 c.width=W*DPR;c.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);
}
addEventListener('resize',resize);resize();

function fmt(n){return Number(n||0).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})}
function setText(id,value){const el=$(id);if(el)el.textContent=value}
function toast(t){
 const el=$('toast');if(!el)return;
 el.textContent=t;el.classList.add('show');clearTimeout(toast.t);
 toast.t=setTimeout(()=>el.classList.remove('show'),2100);
}
function rr(x,y,w,h,r){const q=Math.min(r,w/2,h/2);ctx.beginPath();ctx.roundRect(x,y,w,h,q);ctx.fill()}
function shadow(x,y,rx,ry,a=.35){ctx.save();ctx.globalAlpha=a;ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function txt(t,x,y,s=12,col='#fff',align='center'){ctx.save();ctx.font='800 '+s+'px Inter,system-ui,sans-serif';ctx.fillStyle=col;ctx.textAlign=align;ctx.fillText(t,x,y);ctx.restore()}
function addFloat(t,x,y,col='#8ff0aa'){floats.push({t,x,y,life:1,col})}
function burst(x,y,n=12,col='#ffbd43'){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*150,vy:(Math.random()-.5)*150,life:.5+Math.random()*.7,r:2+Math.random()*4,col})}
function saveMobilePreference(value){try{localStorage.setItem('bm-mobile',value?'1':'0')}catch{}}
function updateMobileStart(){setText('mobileStartState',mobile?'AN':'AUS')}

function clockInfo(now=Date.now()){
 const started=Number(dayStartedAt)||now;
 const elapsed=Math.max(0,Math.min(DAY_LENGTH_MS,now-started));
 const progress=elapsed/DAY_LENGTH_MS;
 const minutes=Math.min(DAY_END_MINUTES,Math.floor(DAY_START_MINUTES+(DAY_END_MINUTES-DAY_START_MINUTES)*progress));
 const hh=String(Math.floor(minutes/60)).padStart(2,'0');
 const mm=String(minutes%60).padStart(2,'0');
 return {text:hh+':'+mm,remaining:Math.max(0,DAY_LENGTH_MS-elapsed)};
}
function tutorialUpdate(){
 const el=$('tutorialInfo');
 if(!el)return;
 if(hero.completed>=1){
  el.classList.add('tutorialDone');
  return;
 }
 el.classList.remove('tutorialDone');
 const s=order?.steps?.[order.stepIndex];
 const title=$('tutorialTitle'),textEl=$('tutorialText'),stepEl=el.querySelector('.tutorialStep');
 if(!s){
  if(title)title.textContent='Jetzt bezahlen';
  if(textEl)textEl.textContent='Stell dich auf das graue Kassenfeld und gib das richtige Rückgeld.';
  if(stepEl)stepEl.textContent='3 / 3';
  return;
 }
 const labels={bun:'Brötchen',grill:'Patty grillen',cheese:'Käse',assembly:'Burger bauen',cash:'Kasse'};
 if(title)title.textContent='Nächster Schritt: '+(labels[s]||s);
 if(textEl)textEl.textContent='Stell dich auf das graue Feld vor '+(station[s]?.label||'der Station')+' und drücke E oder ✋.';
 const idx=Math.min(2,order.stepIndex+1);
 if(stepEl)stepEl.textContent=idx+' / 3';
}
function ui(){
 setText('money',Math.floor(hero.money).toLocaleString('de-DE'));
 setText('debt',Math.max(0,Math.floor(hero.debt)).toLocaleString('de-DE'));
 setText('level',hero.level);
 setText('room',room||'—');
 setText('playerCount',(1+others.size)+'/2');
 setText('shopNameLabel',shopName);
 setText('shiftLabel','TAG '+hero.day+' • '+clockInfo().text);
 setText('gameClock',clockInfo().text);
 setText('orderName',order?order.name:'Keine Bestellung');
 setText('recipeLine',order?order.icons:'Warte auf Kunden…');
 setText('orderHint',order?stepHint():'Neue Gäste kommen gleich.');
 tutorialUpdate();
 const done=order?Math.min(1,order.stepIndex/order.steps.length):0;
 const bar=$('orderProgress');if(bar)bar.style.width=(done*100)+'%';
 document.body.classList.toggle('mobileOn',mobile);
 document.body.classList.toggle('mobileOff',!mobile);
 const dot=$('connectionDot');
 if(dot){dot.className=connection==='connected'?'online':connection==='connecting'?'connecting':'offline'}
 if($('mobileToggle'))$('mobileToggle').checked=mobile;
 if($('shopNameInput')&&document.activeElement!==$('shopNameInput'))$('shopNameInput').value=shopName;
 const saveBtn=$('saveGameOpen'),hostHint=$('saveHostHint');
 if(saveBtn){
  saveBtn.disabled=!isHost;
  saveBtn.textContent=isHost?'💾 SPIEL SPEICHERN':'🔒 NUR HOST KANN SPEICHERN';
 }
 if(hostHint)hostHint.textContent=isHost?'Du bist Host dieser Lobby. Deine drei Save Files kannst du hier speichern.':'Du bist nicht der Host. Nur der Host kann einen Speicherpunkt erstellen.';
 updateMobileStart();
}
function stepHint(){
 if(!order)return '';
 const s=order.steps[order.stepIndex];
 if(!s&&order.stepIndex>=order.steps.length)return 'Burger fertig — zur Kasse gehen.';
 return s==='cash'?'Geld annehmen und korrekt Rückgeld geben.':'Station: '+station[s].label+' — E / ✋ interagieren';
}
function makeOrder(){
 const base=recipes[Math.floor(Math.random()*recipes.length)];
 order={...base,steps:[...base.steps],need:{...base.need},stepIndex:0};
 prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
 ui();
}
function startGame(showStory=true){
 mode='game';$('menu').classList.add('hidden');$('join').classList.add('hidden');$('loadSave').classList.add('hidden');$('hud').classList.remove('hidden');
 resetJoy();resize();if(!order)makeOrder();ui();
 if(showStory)setTimeout(()=>{$('storyPanel')?.classList.remove('hidden')},140);
}
function connect(type,code='',extra={}){
 if(connectBusy)return;
 connectBusy=true;connection='connecting';ui();
 if(ws){try{ws.close()}catch{}ws=null}
 const proto=location.protocol==='https:'?'wss':'ws';
 try{ws=new WebSocket('wss://worlds-unbound-coop.onrender.com')}catch{connectBusy=false;connection='offline';ui();return toast('❌ Verbindung konnte nicht gestartet werden.')}
 clearTimeout(connectTimer);
 connectTimer=setTimeout(()=>{
  if(connection==='connecting'){
   try{ws?.close()}catch{}
   connectBusy=false;connection='offline';ui();
   toast(type==='join'?'❌ Raum konnte nicht erreicht werden.':'⚠️ Server antwortet nicht — lokaler Laden läuft weiter.');
  }
 },7000);
 ws.onopen=()=>{
  clearTimeout(connectTimer);connection='connected';connectBusy=false;ui();
  ws.send(JSON.stringify({type:type,name:cleanSaveName($('name')?.value||'Hero'),code:String(code||'').trim().toUpperCase(),...extra}));
 };
 ws.onmessage=e=>{
  let m;try{m=JSON.parse(e.data)}catch{return}
  if(m.type==='roomCreated'||m.type==='joined'){
   room=m.code;me=m.id;connectBusy=false;connection='connected';isHost=(m.hostId?m.hostId===me:type!=='join');
   if(m.loaded&&m.save)applySaveSnapshot(m.save);
   if(mode!=='game')startGame(false);
   currentSaveCode=m.saveCode||currentSaveCode;
   toast(m.type==='roomCreated'?'🍔 ROOM '+room+' ERSTELLT':'🤝 CO-OP VERBUNDEN');
   ui();
  }
  if(m.type==='state'){
   room=m.code||room;
   if(m.host) isHost=(m.host===me);
   applyBusiness(m.business||{});
   const seen=new Set();
   for(const p of m.players||[]){
    if(p.id===me){
     hero.x=Number.isFinite(p.x)?p.x:hero.x;hero.y=Number.isFinite(p.y)?p.y:hero.y;
     if(Number.isFinite(p.money))hero.money=p.money;
     if(Number.isFinite(p.debt))hero.debt=p.debt;
     if(Number.isFinite(p.day))hero.day=p.day;
    }else{others.set(p.id,p);seen.add(p.id)}
   }
   for(const id of [...others.keys()])if(!seen.has(id))others.delete(id);
   ui();
  }
  if(m.type==='sale'){toast('💵 CO-OP Verkauf: '+fmt(m.amount)+' €');burst(hero.x,hero.y,18)}
  if(m.type==='dayEnded'){toast('🌙 TAG '+((m.day)||hero.day)+' STARTET');hero.revenueToday=0;hero.expensesToday=0;hero.shiftRevenue=0;hero.shiftExpenses=0;makeOrder();ui()}
  if(m.type==='saveCreated'){
   const idx=Math.max(0,Math.min(2,Number(m.slot||1)-1));
   const local={slot:idx+1,name:m.shopName||shopName,money:Number(m.money||hero.money),rating:Number(m.rating||hero.rating),code:String(m.saveCode||''),savedAt:Number(m.savedAt||Date.now()),snapshot:m.save||makeSaveSnapshot(idx)};
   saveSlots[idx]=local;persistLocalSaveSlots();currentSaveCode=local.code;pendingSave=local;
   renderAllSaveLists();
   $('savePanel')?.classList.add('hidden');$('settingsPanel')?.classList.add('hidden');
   setText('saveResultSlot','SAVE FILE '+(idx+1)+' • '+local.name+' • 💶 €'+Number(local.money).toLocaleString('de-DE',{maximumFractionDigits:0})+' • ⭐ '+local.rating.toFixed(1));
   setText('saveResultCode',local.code);
   $('saveResultPanel')?.classList.remove('hidden');
  }
  if(m.type==='hostLeft'){
   kickedForHostLeave=true;connection='offline';connectBusy=false;isHost=false;others.clear();showHostLeftPopup();
  }
  if(m.type==='error'){connectBusy=false;connection='offline';clearTimeout(connectTimer);ui();toast('❌ '+m.message)}
 };
 ws.onerror=()=>{connection='offline';connectBusy=false;ui()};
 ws.onclose=()=>{clearTimeout(connectTimer);connectBusy=false;connection='offline';ui();
   if(leavingGame||kickedForHostLeave)return;
   if(mode==='game')toast('⚠️ Server getrennt — du kannst lokal weiterspielen');
 };
}
function send(type,data={}){if(ws?.readyState===WebSocket.OPEN)ws.send(JSON.stringify({type,...data}))}

$('create').onclick=()=>{
 if(connectBusy)return;
 resetLocalGameState();isHost=true;mode='menu';startGame(true);toast('🌐 ROOM WIRD ERSTELLT…');connect('create');
};
$('joinOpen').onclick=()=>{
 if(connectBusy)return;
 $('menu').classList.add('hidden');$('join').classList.remove('hidden');
 setTimeout(()=>$('code')?.focus(),80);
};
$('joinRoomBtn').onclick=()=>{
 const code=($('code')?.value||'').trim().toUpperCase();
 if(code.length!==5)return toast('⚠️ Bitte den 5-stelligen Raumcode eingeben.');
 resetLocalGameState();isHost=false;connect('join',code);
};
$('back').onclick=()=>{$('join').classList.add('hidden');$('menu').classList.remove('hidden');connection='offline';ui()};
$('loadSaveOpen').onclick=()=>{
 $('menu').classList.add('hidden');$('join').classList.add('hidden');$('loadSave').classList.remove('hidden');renderSaveSlots('startSaveList','load');setTimeout(()=>$('saveCodeInput')?.focus(),80);
};
$('loadSaveBack').onclick=()=>{
 $('loadSave').classList.add('hidden');$('menu').classList.remove('hidden');
};
$('saveCodeInput').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8)});
function loadLocalSlot(index){
 const slot=saveSlots[index];if(!slot?.code)return toast('⚠️ Dieser Speicherplatz ist leer.');
 loadSaveByCode(slot.code);
}
function loadSaveByCode(code){
 const c=String(code||'').trim().toUpperCase();
 if(c.length!==8)return toast('⚠️ Bitte den 8-stelligen Save-Code eingeben.');
 const local=localSaveByCode(c);
 if(local?.snapshot){
  leavingGame=false;kickedForHostLeave=false;isHost=true;connection='connecting';
  toast('💾 SAVE FILE wird geladen…');
  connect('createLoaded','',{save:local.snapshot,saveCode:local.code});
  return;
 }
 leavingGame=false;kickedForHostLeave=false;isHost=true;
 toast('🌐 SAVE FILE wird vom Server geladen…');
 connect('loadSave',c);
}
$('loadSaveCodeBtn').onclick=()=>loadSaveByCode($('saveCodeInput')?.value||'');

$('code').addEventListener('input',e=>{e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,5)});

$('how').onclick=()=>{
 $('storyPanel')?.classList.remove('hidden');
 $('menu').style.visibility='hidden';
};
$('storyClose').onclick=()=>{
 $('storyPanel')?.classList.add('hidden');
 if(mode==='menu')$('menu').style.visibility='visible';
};
$('settings').onclick=()=>{
 $('settingsPanel').classList.remove('hidden');
 renderSaveSlots('saveList','save');
};
$('settingsClose').onclick=()=>$('settingsPanel').classList.add('hidden');
$('saveGameOpen').onclick=()=>{
 if(!isHost)return toast('🔒 Nur der Host kann speichern.');
 if(ws?.readyState!==WebSocket.OPEN)return toast('❌ Nicht mit dem Server verbunden.');
 $('settingsPanel').classList.add('hidden');$('savePanel').classList.remove('hidden');
 renderSaveSlots('saveList','save');
};
$('saveClose').onclick=()=>$('savePanel').classList.add('hidden');
$('saveCloseX').onclick=()=>$('savePanel').classList.add('hidden');
function saveToSlot(index){
 if(!isHost)return toast('🔒 Nur der Host kann speichern.');
 if(ws?.readyState!==WebSocket.OPEN)return toast('❌ Nicht mit dem Server verbunden.');
 const snapshot=makeSaveSnapshot(index);
 pendingSave={slot:index+1,snapshot};
 toast('💾 Speicherpunkt wird erstellt…');
 send('saveFile',{slot:index+1,save:snapshot});
}
$('saveContinue').onclick=()=>{$('saveResultPanel').classList.add('hidden');pendingSave=null};
$('saveLeave').onclick=()=>{$('saveResultPanel').classList.add('hidden');leaveToMenu()};
function showHostLeftPopup(){
 leavingGame=false;mode='menu';room='';me='';isHost=false;others.clear();
 $('hud').classList.add('hidden');$('join').classList.add('hidden');$('loadSave').classList.add('hidden');$('menu').classList.remove('hidden');$('menu').style.visibility='visible';
 document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));
 $('hostLeftPanel').classList.remove('hidden');ui();
}
function leaveToMenu(){
 leavingGame=true;mode='menu';isHost=false;connection='offline';others.clear();
 document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));
 $('hud').classList.add('hidden');$('join').classList.add('hidden');$('loadSave').classList.add('hidden');$('menu').classList.remove('hidden');$('menu').style.visibility='visible';ui();
 if(ws?.readyState===WebSocket.OPEN)send('leave');
 setTimeout(()=>{try{ws?.close()}catch{};ws=null;room='';me='';leavingGame=false},350);
}
$('hostLeftOk').onclick=()=>{$('hostLeftPanel').classList.add('hidden');ui()};
wirePressAnimation($('saveGameOpen'));

function wirePressAnimation(el){
 if(!el)return;
 const down=()=>el.classList.add('isPressed');
 const up=()=>el.classList.remove('isPressed');
 el.addEventListener('pointerdown',down,{passive:true});
 el.addEventListener('pointerup',up,{passive:true});
 el.addEventListener('pointercancel',up,{passive:true});
 el.addEventListener('pointerleave',up,{passive:true});
 el.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter')el.classList.add('isPressed')});
 el.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')el.classList.remove('isPressed')});
}
wirePressAnimation($('mInteract'));

$('mobileToggle').onchange=e=>{
 mobile=!!e.target.checked;saveMobilePreference(mobile);ui();
 toast(mobile?'📱 MOBILE STEUERUNG AN':'📱 MOBILE STEUERUNG AUS');
};
$('mobileStartToggle').onclick=()=>{
 mobile=!mobile;saveMobilePreference(mobile);ui();
 toast(mobile?'📱 MOBILE STEUERUNG AN':'📱 MOBILE STEUERUNG AUS');
};
function saveCurrentShopName(showToast=true){
 const v=String($('shopNameInput')?.value||'').replace(/\s+/g,' ').trim().slice(0,24);
 if(!v){toast('⚠️ Bitte einen Ladenname eingeben.');return false}
 shopName=v;
 send('business',{action:'setShopName',shopName:v});
 ui();
 if(showToast)toast('✅ Ladenname geändert: '+v);
 return true;
}
$('saveShopName').onclick=()=>saveCurrentShopName(true);
$('shopNameInput').addEventListener('input',()=>{
 const raw=String($('shopNameInput').value||'').replace(/\s+/g,' ').slice(0,24);
 if($('shopNameInput').value!==raw)$('shopNameInput').value=raw;
 shopName=raw.trim()||'BURGER SIMULATOR';
 setText('shopNameLabel',shopName);
});
$('shopNameInput').addEventListener('keydown',e=>{
 if(e.key==='Enter'){
  e.preventDefault();
  saveCurrentShopName(true);
 }
});

$('inventoryBtn').onclick=()=>{$('inventoryPanel').classList.remove('hidden');renderInventory()};
$('inventoryCloseX').onclick=()=>$('inventoryPanel').classList.add('hidden');
$('shopBtn').onclick=()=>{$('shopPanel').classList.remove('hidden');renderShop()};
$('shopCloseX').onclick=()=>$('shopPanel').classList.add('hidden');
$('staffBtn').onclick=()=>{$('staffPanel').classList.remove('hidden');renderStaff()};
$('staffCloseX').onclick=()=>$('staffPanel').classList.add('hidden');


function renderInventory(){
 const vals=[
  ['🍞 Brötchen','bun'],['🥩 Pattys','patty'],['🧀 Käse','cheese'],
  ['📦 Verpackung','packaging'],['🥤 Getränke','drinks'],['🧼 Sauberkeit','cleanliness'],['⭐ Bewertung','rating']
 ];
 $('inventoryList').innerHTML=vals.map(([l,k])=>'<div class="invItem"><span>'+l+'</span><b>'+
  (k==='cleanliness'?Math.round(hero[k])+'%':k==='rating'?hero[k].toFixed(1)+'/5':hero[k])+'</b></div>').join('');
}
const shopItems={
 bun:{label:'Brötchen-Kiste',desc:'+10 Brötchen',cost:180,kind:'supply',key:'bun',amount:10},
 patty:{label:'Patty-Kiste',desc:'+10 Pattys',cost:320,kind:'supply',key:'patty',amount:10},
 cheese:{label:'Käse-Kiste',desc:'+10 Käse',cost:200,kind:'supply',key:'cheese',amount:10},
 packaging:{label:'Verpackungs-Kiste',desc:'+15 Verpackungen',cost:180,kind:'supply',key:'packaging',amount:15},
 drinks:{label:'Getränke-Kiste',desc:'+10 Getränke',cost:140,kind:'supply',key:'drinks',amount:10},
 grill:{label:'Besserer Grill',desc:'+Garqualität und Tempo',cost:550,kind:'upgrade',key:'grill'},
 quality:{label:'Zutatenqualität',desc:'+Verkaufspreis',cost:700,kind:'upgrade',key:'quality'},
 seats:{label:'Mehr Sitzplätze',desc:'+Kunden im Laden',cost:900,kind:'upgrade',key:'seats'},
 register:{label:'Profi-Kasse',desc:'+Kassenbonus',cost:1000,kind:'upgrade',key:'register'},
 shop:{label:'Laden-Ausbau',desc:'+Mitarbeiter und Kundenzahl',cost:1400,kind:'upgrade',key:'shop'}
};
function renderShop(){
 const list=$('shopList');if(!list)return;
 list.innerHTML=Object.entries(shopItems).map(([id,v])=>'<div class="shopItem"><div><strong>'+v.label+'</strong><small>'+v.desc+' • €'+v.cost+'</small></div><button data-buy="'+id+'">KAUFEN</button></div>').join('');
 list.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buyShop(b.dataset.buy));
}
function buyShop(id){
 const v=shopItems[id];if(!v)return;
 if(hero.money<v.cost)return toast('❌ Nicht genug Geld');
 hero.money-=v.cost;
 if(v.kind==='supply'){hero[v.key]+=v.amount;toast('📦 '+v.label+' gekauft')}
 else{hero.upgrades[v.key]++;toast('🔧 '+v.label+' Stufe '+hero.upgrades[v.key])}
 hero.shiftExpenses+=v.cost;hero.expensesToday+=v.cost;
 send('business',{action:'spend',amount:v.cost});burst(hero.x,hero.y,12);ui();renderShop();
}
function renderStaff(){
 const map={kitchen:'staffKitchen',cashier:'staffCash',cleaner:'staffClean'};
 for(const k of Object.keys(map))$(map[k]).textContent='Stufe '+hero.staff[k];
}
document.querySelectorAll('[data-staff]').forEach(b=>b.onclick=()=>hireStaff(b.dataset.staff));
function hireStaff(k){
 const price=450+hero.staff[k]*350;if(hero.money<price)return toast('❌ Nicht genug Geld');
 hero.money-=price;hero.staff[k]++;hero.shiftExpenses+=price;hero.expensesToday+=price;
 send('business',{action:'spend',amount:price});toast('👨‍🍳 Personal Stufe '+hero.staff[k]);ui();renderStaff();
}

function finishStep(){
 if(!order)return;
 const step=order.steps[order.stepIndex];
 if(step==='bun'&&hero.bun>0){hero.bun--;prepDone('🍞 Brötchen vorbereitet')}
 else if(step==='grill'&&hero.patty>0){hero.patty--;prepDone('🔥 Patty perfekt gegrillt')}
 else if(step==='cheese'&&hero.cheese>0){hero.cheese--;prepDone('🧀 Käse aufgelegt')}
 else if(step==='assembly'&&hero.packaging>0){hero.packaging--;prepDone('🍔 Burger sauber gebaut')}
 else if(step==='cash'){openCash()}
 else if(step){toast('📦 Diese Zutat fehlt — im Shop nachbestellen')}
}
function prepDone(msg){
 order.stepIndex++;prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
 addFloat(msg,hero.x,hero.y-45);burst(hero.x,hero.y,9);hero.xp+=10;levelCheck();ui();
}
function getNearestStation(){
 let near=null;
 let bestScore=Infinity;
 for(const [k,pad] of Object.entries(interactionPad)){
  const cx=pad.x,cy=pad.y;
  const inside=insidePad(pad,hero.x,hero.y,7);
  if(!inside)continue;
  const score=Math.hypot(hero.x-cx,hero.y-cy);
  if(score<bestScore){bestScore=score;near=k}
 }
 return near;
}
function tryInteract(){
 if(mode!=='game'||cash.open||document.querySelector('.modal:not(.hidden)'))return;
 const near=getNearestStation();
 if(!near)return toast('📍 Geht näher an eine Station.');
 if(!order)return makeOrder();
 if(near==='cash'&&order.stepIndex>=order.steps.length)return openCash();
 const step=order.steps[order.stepIndex];
 if(step!==near)return toast('🔔 Erst '+String(step||'den nächsten Schritt')+' machen.');
 if(near==='grill'){
  const now=performance.now()/1000;
  if(!prep.started){
   prep.started=true;prep.step=order.stepIndex;
   prep.duration=Math.max(.9,2.35/(1+hero.upgrades[near]*.12));
   prep.readyAt=now+prep.duration;prep.overAt=prep.readyAt+1.55;
   toast('🔥 GRILL LÄUFT…');
  }else if(now>=prep.overAt){
   const ingredient='patty';
   hero.rating=Math.max(1,hero.rating-.08);prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
   toast('⚠️ ZU LANG GEBRATEN — neue Portion nehmen');if(hero[ingredient]>0)hero[ingredient]--;ui();
  }else if(now>=prep.readyAt){finishStep()}
  else toast('⏳ Noch nicht fertig…');
 }else finishStep();
}
function openCash(){
 if(!order||cash.open||order.stepIndex<order.steps.length)return;
 const base=order.price*(1+0.08*(hero.upgrades.quality-1));
 cash.due=Math.round(base*100)/100;
 const bills=[10,20,50,100];
 cash.given=bills.find(v=>v>=cash.due) || 100;
 cash.change=Math.round((cash.given-cash.due)*100)/100;
 cash.open=true;
 setText('cashDue','€'+fmt(cash.due));setText('cashGiven','€'+fmt(cash.given));setText('cashChange','€'+fmt(cash.change));
 $('cashInput').value='';$('cashPanel').classList.remove('hidden');
 setTimeout(()=>{$('cashInput')?.focus()},50);
}
document.querySelectorAll('[data-cash]').forEach(b=>b.onclick=()=>{
 const v=b.dataset.cash==='exact'?cash.given:b.dataset.cash;
 $('cashInput').value=v;$('cashInput').dispatchEvent(new Event('input',{bubbles:true}));
});
$('cashCancel').onclick=()=>{$('cashPanel').classList.add('hidden');cash.open=false};
$('cashAccept').onclick=takePayment;
$('mInteract').onclick=tryInteract;
$('cashInput').addEventListener('input',()=>{
 const got=Number(String($('cashInput').value).replace(',','.'))||0;
 setText('cashChange','€'+fmt(Math.max(0,got-cash.due)));
});

function takePayment(){
 const got=Math.round((Number(String($('cashInput').value).replace(',','.'))||0)*100)/100;
 if(got+0.001<cash.due)return toast('❌ Das Geld reicht nicht.');
 const change=Math.round((got-cash.due)*100)/100;
 if(Math.abs(change-cash.change)>=0.011)return toast('⚠️ Rückgeld stimmt nicht.');
 $('cashChange').textContent='€'+fmt(change);$('cashPanel').classList.add('hidden');cash.open=false;
 const gross=cash.due,cost=recipeCost(order),profit=Math.max(0,gross-cost);
 const registerBonus=hero.upgrades.register-1,net=profit+registerBonus*.75;
 hero.money+=gross;hero.debt=Math.max(0,hero.debt-net*.2);hero.revenueToday+=gross;hero.shiftRevenue+=gross;
 hero.expensesToday+=cost;hero.shiftExpenses+=cost;hero.sales++;hero.completed++;hero.xp+=25+hero.staff.cashier*3;
 hero.rep+=hero.rating>4?1:0;
 if(hero.completed===1){
  $('tutorialInfo')?.classList.add('tutorialDone');
  toast('✅ ERSTER BURGER FERTIG — TUTORIAL ABGESCHLOSSEN');
 }
 toast('💵 GELD ANGENOMMEN • RÜCKGELD €'+fmt(change));
 addFloat('+€'+fmt(gross),hero.x,hero.y-55);burst(station.cash.x,station.cash.y,25,'#ffe08b');effects.shake=5;
 send('business',{action:'sale',amount:gross,profit:net,day:hero.day});
 makeOrder();levelCheck();ui();
 if(hero.debt<=0)toast('🏆 DIE SCHULD IST BEZAHLT!');
}
function recipeCost(r){return Object.entries(r.need||{}).reduce((sum,[k,n])=>sum+(supplyInfo[k]?.price||0)*n/10,0)}
function levelCheck(){
 const need=100+hero.level*60;
 while(hero.xp>=need){hero.xp-=need;hero.level++;hero.money+=80;hero.rating=Math.min(5,hero.rating+.05);toast('⭐ LEVEL UP! STUFE '+hero.level);burst(hero.x,hero.y,35,'#ffe070')}
}
function performStaff(dt){
 if(hero.staff.cleaner>0)hero.cleanliness=Math.min(100,hero.cleanliness+dt*.4*hero.staff.cleaner);
 if(hero.staff.kitchen>0&&order&&Math.random()<dt*.035*hero.staff.kitchen){
  const step=order.steps[order.stepIndex];if(step&&['bun','grill','cheese'].includes(step))prepDone('👨‍🍳 KÜCHENHILFE HILFT!');
 }
 if(hero.staff.cashier>0&&order&&order.stepIndex>=order.steps.length&&Math.random()<dt*.02*hero.staff.cashier)openCash();
}
function move(dt){
 let x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 let y=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
 if(joy.on){x=joy.x;y=joy.y}
 const l=Math.hypot(x,y)||1;
 if(x||y){
  const nx=hero.x+x/l*hero.speed*dt;
  const ny=hero.y+y/l*hero.speed*dt;
  if(!hitsStationBody(nx,hero.y))hero.x=nx;
  if(!hitsStationBody(hero.x,ny))hero.y=ny;
 }
 hero.x=Math.max(300,Math.min(1215,hero.x));hero.y=Math.max(120,Math.min(770,hero.y));
}

function sendInput(){send('input',{x:hero.x,y:hero.y})}
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();keys.add(k);
 if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();
 if(k==='e')tryInteract();if(k==='q')makeOrder();if(k==='i')$('inventoryPanel').classList.remove('hidden');
 if(k==='u')$('shopPanel').classList.remove('hidden');
 if(k==='escape')document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));
});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{keys.clear();resetJoy()});

function updateJoy(clientX,clientY){
 const el=$('joy');if(!el)return;
 const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 let dx=clientX-cx,dy=clientY-cy;
 const max=Math.max(20,Math.min(r.width,r.height)*.36),len=Math.hypot(dx,dy)||1;
 if(len>max){dx=dx/len*max;dy=dy/len*max}
 joy.x=dx/max;joy.y=dy/max;
 const knob=el.querySelector('i'),travel=Math.min(r.width,r.height)*.29;
 if(knob)knob.style.transform='translate(calc(-50% + '+(joy.x*travel)+'px),calc(-50% + '+(joy.y*travel)+'px))';
}
function resetJoy(){
 activeTouch=null;joy.on=false;joy.x=0;joy.y=0;
 const k=$('joy')?.querySelector('i');if(k)k.style.transform='translate(-50%,-50%)';
}
const joyEl=$('joy');
joyEl.addEventListener('pointerdown',e=>{
 if(!mobile||activeTouch!==null)return;
 e.preventDefault();activeTouch=e.pointerId;joy.on=true;
 joyEl.setPointerCapture?.(e.pointerId);updateJoy(e.clientX,e.clientY);
});
document.addEventListener('pointermove',e=>{
 if(e.pointerId!==activeTouch)return;
 e.preventDefault();updateJoy(e.clientX,e.clientY);
},{passive:false});
document.addEventListener('pointerup',e=>{
 if(e.pointerId===activeTouch){e.preventDefault();resetJoy()}
},{passive:false});
document.addEventListener('pointercancel',e=>{if(e.pointerId===activeTouch)resetJoy()});
joyEl.addEventListener('lostpointercapture',()=>{if(activeTouch!==null)resetJoy()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetJoy()});
addEventListener('pointerup',e=>{if(e.pointerId===activeTouch)resetJoy()});
addEventListener('blur',resetJoy);

function drawKitchen(t){
 const lampPulse=.5+.5*Math.sin(t*.0032);
 ctx.fillStyle='#0b100e';ctx.fillRect(0,0,1500,900);
 for(let y=0;y<900;y+=70){
  for(let x=0;x<1500;x+=70){
   ctx.fillStyle=((x+y)/70)%2?'#27312d':'#202a25';
   ctx.fillRect(x,y,68,68);
   ctx.strokeStyle='#ffffff08';ctx.strokeRect(x+.5,y+.5,67,67);
  }
 }
 ctx.fillStyle='#070b09';rr(235,55,1040,790,38);
 ctx.fillStyle='#202824';rr(258,78,994,744,31);
 ctx.fillStyle='#5a402e';rr(278,98,954,704,25);
 ctx.fillStyle='#6a4a33';
 for(let y=115;y<790;y+=32)ctx.fillRect(292,y,926,3);
 for(let x=292;x<1218;x+=38)ctx.fillRect(x,115,3,690);
 ctx.fillStyle='#ffffff08';ctx.fillRect(292,148,926,2);ctx.fillRect(292,432,926,2);ctx.fillRect(292,690,926,2);
 ctx.fillStyle='#0e1411';rr(410,102,680,48,12);
 const signGlow=ctx.createLinearGradient(620,115,880,120);
 signGlow.addColorStop(0,'#ff9f22');signGlow.addColorStop(.5,'#ffe290');signGlow.addColorStop(1,'#ff9f22');
 ctx.fillStyle=signGlow;ctx.shadowBlur=22+lampPulse*10;ctx.shadowColor='#ff9e28';ctx.fillRect(620,115,260,5);ctx.shadowBlur=0;
 txt(shopName,750,137,20,'#ffd477');
 for(let i=0;i<7;i++){
  const sx=460+i*98;
  ctx.globalAlpha=.25+.18*lampPulse;
  ctx.fillStyle=i%2?'#ffbe49':'#f9e1a5';
  ctx.beginPath();ctx.arc(sx,91,4+lampPulse*1.4,0,Math.PI*2);ctx.fill();
 }
 ctx.globalAlpha=1;
 ctx.save();
 for(const [lx,ly] of [[465,170],[615,170],[765,170],[915,170]]){
  const rg=ctx.createRadialGradient(lx,ly,10,lx,ly,190);
  rg.addColorStop(0,'#ffd47520');rg.addColorStop(1,'transparent');
  ctx.fillStyle=rg;ctx.fillRect(lx-190,ly-190,380,380);
 }
 ctx.restore();
 drawFridge();drawCounter();drawStations(t);drawInteractionPads(t);drawQueue(t);
}
function drawFridge(){
 shadow(360,610,50,12,.3);
 ctx.fillStyle='#aebdb7';rr(320,198,80,414,13);
 ctx.fillStyle='#dfe8e4';rr(327,207,66,188,10);
 ctx.fillStyle='#c8d5d0';rr(327,405,66,198,10);
 ctx.strokeStyle='#74847e';ctx.lineWidth=2;ctx.strokeRect(333,216,54,174);ctx.strokeRect(333,414,54,181);
 ctx.fillStyle='#78908a';
 for(let i=0;i<4;i++)ctx.fillRect(341,242+i*25,38,5);
 ctx.fillStyle='#f2f7f4';ctx.globalAlpha=.42;
 for(let i=0;i<3;i++)ctx.fillRect(342,438+i*42,36,4);
 ctx.globalAlpha=1;txt('LAGER',360,628,10,'#dce6e1');
}
function drawCounter(){
  shadow(610,505,250,18,.28);
  ctx.fillStyle='#121815';
  rr(385,410,350,88,18);

  ctx.fillStyle='#70492f';
  rr(398,420,324,64,14);

  ctx.fillStyle='#d7c3a8';
  rr(398,414,324,18,8);
  ctx.fillStyle='#f3e3c7';
  ctx.globalAlpha=.35;
  rr(410,417,300,5,3);
  ctx.globalAlpha=1;

  for(const x of [420,520,620,665]){
    ctx.fillStyle='#432f24';
    rr(x,449,62,25,7);
    ctx.strokeStyle='#956b49';
    ctx.lineWidth=1.5;
    ctx.strokeRect(x+1,450,60,23);
  }

  ctx.fillStyle='rgba(240,245,240,.12)';
  rr(412,435,298,9,4);

  ctx.fillStyle='#171d19';
  rr(748,410,214,88,18);
  ctx.fillStyle='#2b2119';
  rr(766,421,178,66,14);

  ctx.fillStyle='#0e1411';
  rr(792,401,126,77,13);
  ctx.strokeStyle='#8e6a4b';
  ctx.lineWidth=2;
  ctx.strokeRect(796,405,118,69);

  ctx.fillStyle='#26312b';
  rr(807,412,96,34,9);
  ctx.fillStyle='#62e6a0';
  rr(815,418,80,20,6);
  txt('€',855,434,17,'#173d27');

  ctx.fillStyle='#c8b18e';
  for(let i=0;i<4;i++)ctx.fillRect(814+i*19,454,11,6);
  ctx.fillStyle='#5ed797';
  ctx.beginPath();ctx.arc(900,457,5,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#242c27';
  rr(610,389,205,27,9);
  txt('BESTELLUNG • ABHOLUNG',712,407,10,'#fff');
}
function drawInteractionPads(t){
 const emoji={bun:'🍞',grill:'🥩',cheese:'🧀',assembly:'🍔',cash:'💶'};
 const active=getNearestStation();
 for(const [k,p] of Object.entries(interactionPad)){
  const near=k===active;
  const pulse=.5+.5*Math.sin(t*.006+(p.x%80)*.02);
  ctx.save();

  // Very light transparent work field.
  shadow(p.x,p.y+18,p.w*.38,5,.16);
  ctx.fillStyle=near?'rgba(255,211,105,.105)':'rgba(210,219,214,.045)';
  rr(p.x-p.w/2,p.y-p.h/2,p.w,p.h,13);

  ctx.strokeStyle=near?'rgba(255,219,132,.52)':'rgba(225,232,227,.12)';
  ctx.lineWidth=near?2.2:1.15;
  ctx.stroke();

  ctx.fillStyle=near?'rgba(255,255,255,.045)':'rgba(255,255,255,.018)';
  rr(p.x-p.w/2+5,p.y-p.h/2+5,p.w-10,p.h-10,9);

  ctx.strokeStyle=near?'rgba(255,231,166,.30)':'rgba(255,255,255,.055)';
  ctx.lineWidth=1;
  ctx.setLineDash([5,8]);
  ctx.strokeRect(p.x-p.w/2+11,p.y-p.h/2+11,p.w-22,p.h-22);
  ctx.setLineDash([]);

  ctx.globalAlpha=near?.92:.50;
  txt(emoji[k],p.x,p.y+7,22,'#fff');
  ctx.globalAlpha=1;

  if(near){
   ctx.globalAlpha=.10+.09*pulse;
   ctx.fillStyle='#ffd36c';
   ctx.shadowBlur=16;
   ctx.shadowColor='#ffd36c';
   ctx.beginPath();
   ctx.ellipse(p.x,p.y,31,17,0,0,Math.PI*2);
   ctx.fill();
   ctx.shadowBlur=0;
   ctx.globalAlpha=1;
  }
  ctx.restore();
 }
}

function drawStations(t){
 const active=getNearestStation();

 for(const [k,p] of Object.entries(station)){
  const near=k===active;
  const s=station[k];
  const bob=near?Math.sin(t*.0032+p.x*.015)*.7:0;
  const glow=.5+.5*Math.sin(t*.004+p.x*.008);

  shadow(p.x,p.y+48,58,11,.30);
  ctx.save();

  // Main stainless machine housing.
  ctx.fillStyle='#0f1512';
  rr(p.x-58,p.y-45+bob,116,90,16);
  ctx.strokeStyle='rgba(255,255,255,.10)';
  ctx.lineWidth=2;
  ctx.stroke();

  const body=ctx.createLinearGradient(p.x-48,p.y-36,p.x+48,p.y+35);
  body.addColorStop(0,'#eef4f1');
  body.addColorStop(.16,s.color);
  body.addColorStop(.58,'#6b5540');
  body.addColorStop(1,'#211b17');
  ctx.fillStyle=body;
  rr(p.x-47,p.y-35+bob,94,70,11);

  // Metal top.
  const top=ctx.createLinearGradient(0,p.y-27+bob,0,p.y-10+bob);
  top.addColorStop(0,'#ffffff');
  top.addColorStop(.45,'#d7dfdb');
  top.addColorStop(1,'#87918d');
  ctx.fillStyle=top;
  rr(p.x-34,p.y-24+bob,68,16,6);

  // Digital panel.
  ctx.fillStyle='#111715';
  rr(p.x-35,p.y+0+bob,70,25,6);
  ctx.strokeStyle='rgba(255,255,255,.10)';
  ctx.strokeRect(p.x-34,p.y+1+bob,68,23);

  // Station-specific visual details.
  if(k==='bun'){
    ctx.fillStyle='#d48f46';rr(p.x-26,p.y+6+bob,52,13,5);
    ctx.fillStyle='#f5c77d';rr(p.x-20,p.y+2+bob,40,10,5);
    for(let i=-2;i<=2;i++)ctx.fillRect(p.x+i*10-1,p.y+4+bob,2,4);
    txt('🍞',p.x,p.y+20+bob,21,'#fff');
  }else if(k==='grill'){
    ctx.fillStyle='#202622';
    rr(p.x-29,p.y+5+bob,58,15,5);
    ctx.strokeStyle='#707b75';
    for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(p.x+i*11,p.y+7+bob);ctx.lineTo(p.x+i*11,p.y+18+bob);ctx.stroke();}
    for(let i=0;i<3;i++){
      const fx=p.x-16+i*16,fy=p.y+1+Math.sin(t*.01+i)*1.2;
      ctx.globalAlpha=.58+.18*glow;txt('🔥',fx,fy,11+Math.sin(t*.014+i)*1.3,'#fff');
    }
    ctx.globalAlpha=1;
  }else if(k==='cheese'){
    ctx.fillStyle='#f0c948';rr(p.x-25,p.y+4+bob,50,17,4);
    ctx.fillStyle='#fff1a4';
    rr(p.x-19,p.y+8+bob,38,5,2);
    ctx.fillStyle='#d8aa29';
    for(let i=-2;i<=2;i++)ctx.fillRect(p.x+i*10-2,p.y+18+bob,4,3);
  }else if(k==='assembly'){
    ctx.fillStyle='#d9b56b';rr(p.x-27,p.y+6+bob,54,13,7);
    ctx.fillStyle='#d99b4b';rr(p.x-20,p.y+2+bob,40,7,5);
    ctx.fillStyle='#6f4a2d';rr(p.x-16,p.y-4+bob,32,8,4);
    ctx.fillStyle='#f0c96a';rr(p.x-18,p.y-10+bob,36,7,4);
    txt('🍔',p.x+26,p.y+17+bob,16,'#fff');
  }else if(k==='cash'){
    // Register sits inside the counter opening.
    ctx.fillStyle='#1b241f';
    rr(p.x-47,p.y-23+bob,94,55,11);
    ctx.fillStyle='#293a31';
    rr(p.x-36,p.y-14+bob,72,24,6);
    ctx.fillStyle='#6ff0a6';
    rr(p.x-29,p.y-9+bob,58,14,4);
    txt('€',p.x,p.y+3+bob,16,'#173d27');
    ctx.fillStyle='#bba17b';
    for(let i=0;i<4;i++)ctx.fillRect(p.x-28+i*16,p.y+16+bob,10,5);
    ctx.fillStyle='#68dc9a';
    ctx.beginPath();ctx.arc(p.x+29,p.y+20+bob,4,0,Math.PI*2);ctx.fill();
  }

  ctx.globalAlpha=near?.80:.54;
  txt(s.label,p.x,p.y+57+bob,9,near?'#ffe08b':'#e5ebe7');
  ctx.globalAlpha=1;

  // Subtle active halo only when standing on the field.
  if(near){
    ctx.globalAlpha=.20+.16*glow;
    ctx.strokeStyle='#ffd86c';
    ctx.lineWidth=2;
    ctx.shadowBlur=11;
    ctx.shadowColor='#ffd86c';
    ctx.beginPath();
    ctx.arc(p.x,p.y,57+glow*3,0,Math.PI*2);
    ctx.stroke();
    ctx.shadowBlur=0;
    ctx.globalAlpha=1;
  }

  // Preparation status.
  if(prep.started&&order){
    const step=order.steps[order.stepIndex];
    if(step===k){
      const now=performance.now()/1000;
      const rem=Math.max(0,prep.readyAt-now);
      const pct=Math.min(1,1-rem/prep.duration);
      ctx.fillStyle='rgba(11,16,13,.68)';
      rr(p.x-43,p.y-59,86,9,5);
      ctx.fillStyle=rem<=0?'#7ff0a4':'#ffbd45';
      ctx.fillRect(p.x-40,p.y-56,80*pct,4);
      if(now>=prep.overAt)txt('ÜBERGART!',p.x,p.y-70,9,'#ff7777');
      else if(rem<=0)txt('READY',p.x,p.y-70,9,'#8ff0aa');
    }
  }

  ctx.restore();
 }
}
function drawQueue(t){
 for(let i=0;i<Math.min(5,2+hero.upgrades.seats);i++){
  const x=330+i*90,y=700+(i%2)*34;shadow(x,y+24,18,6,.3);
  ctx.fillStyle=i%2?'#5eafe0':'#df8e67';ctx.beginPath();ctx.arc(x,y,17,0,7);ctx.fill();
  ctx.fillStyle='#f0c7a2';ctx.beginPath();ctx.arc(x,y-15,11,0,7);ctx.fill();txt(i<2?'☺':'…',x,y+5,10,'#201c18')
 }
}
function drawCharacter(p,color,label,t){
 const bob=Math.sin(t*.007+p.x*.01)*2;shadow(p.x,p.y+24,24,9,.45);ctx.save();ctx.translate(p.x,p.y+bob);
 ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,0,24,0,7);ctx.fill();ctx.strokeStyle='#fff8';ctx.stroke();
 ctx.fillStyle='#f1c5a0';ctx.beginPath();ctx.arc(0,-5,14,0,7);ctx.fill();ctx.fillStyle='#2a211b';
 ctx.beginPath();ctx.arc(0,-14,15,Math.PI,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-5,-6,3,0,7);ctx.arc(5,-6,3,0,7);ctx.fill();
 ctx.fillStyle='#222';ctx.beginPath();ctx.arc(-5,-6,1.2,0,7);ctx.arc(5,-6,1.2,0,7);ctx.fill();
 ctx.fillStyle='#fff';rr(-14,8,28,18,6);ctx.fillStyle='#ffbc43';ctx.fillRect(-12,10,24,4);ctx.restore();txt(label,p.x,p.y-41,11,'#fff')
}
function drawWorld(t){
 ctx.clearRect(0,0,W,H);
 if(mode!=='game'){ctx.fillStyle='#080a09';ctx.fillRect(0,0,W,H);return}
 const shake=effects.shake,eX=(Math.random()-.5)*shake,eY=(Math.random()-.5)*shake;
 ctx.save();ctx.translate(W/2-hero.x+eX,H/2-hero.y+eY);drawKitchen(t);
 for(const p of others.values())drawCharacter(p,'#63c8ff',p.name||'CO-OP',t);
 drawCharacter(hero,'#f5b33f','YOU',t);ctx.restore();
 const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.15,W/2,H/2,Math.max(W,H)*.72);
 g.addColorStop(0,'transparent');g.addColorStop(1,'#0009');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);effects.shake*=.88;
 for(const p of particles){p.x+=p.vx*.016;p.y+=p.vy*.016;p.life-=.016;ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.col;ctx.beginPath();ctx.arc(W/2+(p.x-hero.x),H/2+(p.y-hero.y),p.r,0,7);ctx.fill()}
 ctx.globalAlpha=1;
 for(const f of floats){f.y-=.35;f.life-=.018;ctx.globalAlpha=Math.max(0,f.life);txt(f.t,W/2+(f.x-hero.x),H/2+(f.y-hero.y),12,f.col)}
 floats=floats.filter(f=>f.life>0);particles=particles.filter(p=>p.life>0);ctx.globalAlpha=1;
}
function loop(t){
 const dt=Math.min(.04,(t-last)/1000);last=t;
 if(mode==='game'&&!cash.open&&!document.querySelector('.modal:not(.hidden)')){
  move(dt);
  performStaff(dt);
  if(ws&&t-(loop.net||0)>120){loop.net=t;sendInput()}
  ui();
 }
 drawWorld(t);requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function applyBusiness(d){
 if(!d)return;
 if(Number.isFinite(d.money))hero.money=d.money;
 if(Number.isFinite(d.debt))hero.debt=d.debt;
 if(Number.isFinite(d.day))hero.day=d.day;
 if(typeof d.shopName==='string'&&d.shopName.trim())shopName=d.shopName;
 if(Number.isFinite(d.dayStartedAt))dayStartedAt=d.dayStartedAt;
 ui();
}

/* ===== BURGER SIMULATOR V2.2 DIRECT CUSTOMER SYSTEM ===== */
const v22={customers:[],nextId:1,spawnTimer:1.2,tray:null,heldFood:null,
 tables:[
  {id:1,x:505,y:640,occupied:false,dirty:false,customerId:null,seat:{x:505,y:695}},
  {id:2,x:785,y:640,occupied:false,dirty:false,customerId:null,seat:{x:785,y:695}}
 ],
 trash:{x:1120,y:650},door:{x:1160,y:795}
};
function v22Style(){
 if($('v22Style'))return;
 const st=document.createElement('style');st.id='v22Style';
 st.textContent=\`
 #v22OrderBox,#v22CashBox{position:fixed;z-index:80;left:50%;top:50%;transform:translate(-50%,-50%);width:min(430px,90vw);background:rgba(15,20,18,.97);border:1px solid rgba(255,218,130,.5);border-radius:18px;box-shadow:0 20px 60px #0009;padding:20px;color:#fff;font-family:Inter,system-ui,sans-serif}
 #v22OrderBox h2,#v22CashBox h2{margin:0 0 8px;font-size:22px}
 #v22OrderBox p,#v22CashBox p{margin:7px 0;color:#dce6e1}
 .v22Buttons{display:flex;gap:9px;flex-wrap:wrap;margin-top:15px}
 .v22Btn{border:1px solid #ffffff22;background:#26312b;color:#fff;border-radius:11px;padding:11px 14px;font-weight:800;font-size:14px}
 .v22Btn.primary{background:#d99a38;color:#17120a;border-color:#ffd879}
 .v22Bills{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:13px}
 .v22Bill{border:1px solid #ffffff25;border-radius:10px;background:#304238;color:#fff;padding:13px 5px;font-weight:900}
 .v22Change{font-size:26px;font-weight:900;margin:12px 0;color:#ffe08b}
 \`;
 document.head.appendChild(st);
}
function v22Box(id,html){
 v22Style();let el=$(id);
 if(!el){el=document.createElement('div');el.id=id;document.body.appendChild(el)}
 el.innerHTML=html;el.classList.remove('hidden');return el;
}
function v22Close(id){$(id)?.classList.add('hidden')}
function v22FreeTable(){return v22.tables.find(t=>!t.occupied&&!t.dirty)||null}
function v22Spawn(){
 if(mode!=='game'||v22.customers.length>=4||!v22FreeTable())return;
 const c={id:v22.nextId++,x:v22.door.x,y:v22.door.y,color:['#df8e67','#63c8ff','#c78de8','#77d49a'][v22.nextId%4],
 state:'walking',tx:1120,ty:540,nextState:'cashier',order:null,paid:false,tableId:null,eatUntil:0};
 v22.customers.push(c);
}
function v22Order(c){
 const r=recipes[Math.floor(Math.random()*recipes.length)],qty=Math.random()<.35?2:1,steps=[];
 for(let i=0;i<qty;i++)steps.push(...r.steps);
 const need={};for(const[k,n]of Object.entries(r.need))need[k]=n*qty;
 c.order={name:r.name,price:Math.round(r.price*qty*100)/100,qty,steps,need,icons:(qty>1?qty+'× ':'')+r.icons,stepIndex:0,customerId:c.id};
 order=c.order;
}
function v22OpenOrder(c){
 const el=v22Box('v22OrderBox',
 '<h2>🧑 Bestellung</h2><p>Der Kunde möchte:</p><p><b>🍔 '+escapeHtml((c.order?.qty||'1')+'× '+(c.order?.name||'Burger'))+'</b></p><p>Bestätige die Bestellung. Danach kommt die Zahlung.</p><div class="v22Buttons"><button class="v22Btn primary" id="v22Confirm">BESTÄTIGEN</button><button class="v22Btn" id="v22Cancel">ABBRECHEN</button></div>');
 el.querySelector('#v22Confirm').onclick=()=>{
   if(!c.order)v22Order(c);
   c.state='payment';v22Close('v22OrderBox');v22OpenPayment(c);ui();
 };
 el.querySelector('#v22Cancel').onclick=()=>v22Close('v22OrderBox');
}
function v22OpenPayment(c){
 const due=c.order.price;
 const options=[10,20,50].filter((v,i,a)=>a.indexOf(v)===i);
 const given=options.find(v=>v>=due)||50;
 c.cashGiven=given;c.changeGiven=0;
 const el=v22Box('v22CashBox',
 '<h2>💶 Kasse</h2><p><b>Zu zahlen: €'+fmt(due)+'</b></p><p>Der Kunde gibt: <b>€'+fmt(given)+'</b></p><p>Jetzt nur das <b>Rückgeld</b> mit den Scheinen/Münzen unten geben.</p><div class="v22Change" id="v22Return">Rückgeld: €0,00 / richtig: €'+fmt(given-due)+'</div><div class="v22Buttons v22Bills"><button class="v22Bill" data-r="1">€1</button><button class="v22Bill" data-r="5">€5</button><button class="v22Bill" data-r="10">€10</button><button class="v22Bill" data-r="20">€20</button></div><div class="v22Buttons"><button class="v22Btn primary" id="v22Pay">ZAHLUNG ABSCHLIESSEN</button><button class="v22Btn" id="v22Clear">ZURÜCKSETZEN</button></div>');
 el.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{
   c.changeGiven=Math.round((c.changeGiven+Number(b.dataset.r))*100)/100;
   setText('v22Return','Rückgeld: €'+fmt(c.changeGiven)+' / richtig: €'+fmt(given-due));
 });
 el.querySelector('#v22Clear').onclick=()=>{c.changeGiven=0;setText('v22Return','Rückgeld: €0,00 / richtig: €'+fmt(given-due))};
 el.querySelector('#v22Pay').onclick=()=>v22Pay(c);
}
function v22Pay(c){
 const due=c.order.price,given=c.cashGiven,correct=Math.round((given-due)*100)/100,returned=Math.round((c.changeGiven||0)*100)/100;
 if(returned+0.001<correct)return toast('❌ Noch nicht genug Rückgeld gegeben.');
 const extra=Math.max(0,returned-correct);
 if(extra>0)hero.money=Math.max(0,hero.money-extra);
 const table=v22FreeTable();
 if(!table)return toast('❌ Kein sauberer Tisch frei.');
 c.paid=true;c.change=returned;c.requiredChange=correct;c.extraChange=extra;c.tableId=table.id;
 table.occupied=true;table.customerId=c.id;c.state='walking';c.tx=table.seat.x;c.ty=table.seat.y;c.nextState='waitingFood';
 v22Close('v22CashBox');
 hero.money+=due;hero.revenueToday+=due;hero.shiftRevenue+=due;hero.sales++;hero.xp+=10;
 toast(extra>0?'⚠️ Zu viel Rückgeld: -€'+fmt(extra):'✅ Bezahlt • Rückgeld €'+fmt(returned));
 ui();
}function v22Near(){
 let best=null,bd=75;
 for(const c of v22.customers){
   if(c.state==='cashier' && order && order.customerId!==c.id)continue;
   if(c.state!=='cashier'&&c.state!=='waitingFood')continue;
   const d=Math.hypot(hero.x-c.x,hero.y-c.y);
   if(d<bd){best=c;bd=d}
 }
 return best;
}
function v22Update(dt){
 if(mode!=='game')return;
 v22.spawnTimer-=dt;if(v22.spawnTimer<=0){v22Spawn();v22.spawnTimer=5+Math.random()*3}
 for(const c of v22.customers){
  if(c.state==='walking'){
   const dx=c.tx-c.x,dy=c.ty-c.y,d=Math.hypot(dx,dy);
   if(d<4){c.x=c.tx;c.y=c.ty;c.state=c.nextState}
   else{c.x+=dx/d*95*dt;c.y+=dy/d*95*dt}
  }else if(c.state==='eating'&&performance.now()/1000>=c.eatUntil){
   const t=v22.tables.find(t=>t.id===c.tableId);if(t){t.occupied=false;t.customerId=null;t.dirty=true}
   c.state='walking';c.tx=v22.door.x;c.ty=v22.door.y;c.nextState='leaving'
  }else if(c.state==='leaving'&&Math.hypot(c.x-v22.door.x,c.y-v22.door.y)<10)c.remove=true;
 }
 v22.customers=v22.customers.filter(c=>!c.remove);
}
function v22Complete(){
 if(order&&order.stepIndex>=order.steps.length&&!v22.heldFood){
  v22.heldFood={name:order.name,qty:order.qty,customerId:order.customerId};
  order.ready=true;toast('🍔 Burger fertig — zur Theke bringen');
 }
}
function v22Prep(){
 if(!order)return;const step=order.steps[order.stepIndex];
 if(step==='bun'&&hero.bun>0){hero.bun--;v22Done('🍞 Brötchen fertig')}
 else if(step==='grill'&&hero.patty>0){hero.patty--;v22Done('🔥 Patty fertig')}
 else if(step==='cheese'&&hero.cheese>0){hero.cheese--;v22Done('🧀 Käse fertig')}
 else if(step==='assembly'&&hero.packaging>0){hero.packaging--;v22Done('🍔 Burger gebaut')}
 else toast('📦 Zutat fehlt');
}
function v22Done(msg){
 order.stepIndex++;prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
 addFloat(msg,hero.x,hero.y-45);burst(hero.x,hero.y,9);hero.xp+=10;levelCheck();v22Complete();ui();
}
function v22Tray(){
 if(!v22.heldFood||!order)return false;
 if(Math.hypot(hero.x-interactionPad.cash.x,hero.y-interactionPad.cash.y)>105)return false;
 v22.tray={type:'food',customerId:order.customerId,qty:order.qty,name:order.name};v22.heldFood=null;
 toast('🍱 Essen auf Tablett gelegt');ui();return true;
}
function v22Serve(c){
 if(!v22.tray||v22.tray.type!=='food'||v22.tray.customerId!==c.id)return false;
 v22.tray=null;c.state='eating';c.eatUntil=performance.now()/1000+10;
 order=null;prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};
 toast('🍔 Serviert — Kunde isst 10 Sekunden');hero.xp+=20;ui();return true;
}
function v22Clear(){
 if(v22.tray)return false;
 const t=v22.tables.find(t=>t.dirty&&Math.hypot(hero.x-t.x,hero.y-t.y)<85);
 if(!t)return false;
 v22.tray={type:'empty',tableId:t.id};toast('🧺 Leeres Tablett aufgenommen');return true;
}
function v22Trash(){
 if(!v22.tray||v22.tray.type!=='empty'||Math.hypot(hero.x-v22.trash.x,hero.y-v22.trash.y)>85)return false;
 const t=v22.tables.find(t=>t.id===v22.tray.tableId);if(t)t.dirty=false;
 v22.tray=null;toast('🗑️ Müll entsorgt — Tisch ist wieder sauber');ui();return true;
}
function v22Interact(){
 if(mode!=='game'||document.querySelector('.modal:not(.hidden)'))return;
 if($('v22OrderBox')&&!$('v22OrderBox').classList.contains('hidden'))return;
 if($('v22CashBox')&&!$('v22CashBox').classList.contains('hidden'))return;
 const c=v22Near();
 if(c){
  if(c.state==='cashier'){v22Order(c);v22OpenOrder(c);return}
  if(c.state==='waitingFood'&&v22Serve(c))return;
 }
 if(v22Trash()||v22Clear()||v22Tray())return;
 const near=getNearestStation();if(!near)return toast('📍 Geht näher an eine Station.');
 if(!order)return toast('🧑 Warte auf einen Kunden.');
 const step=order.steps[order.stepIndex];if(step!==near)return toast('🔔 Erst '+step+' machen.');
 if(near==='grill'){
  const now=performance.now()/1000;
  if(!prep.started){prep.started=true;prep.step=order.stepIndex;prep.duration=2.3;prep.readyAt=now+prep.duration;prep.overAt=prep.readyAt+1.5;toast('🔥 GRILL LÄUFT…')}
  else if(now>=prep.overAt){prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};toast('⚠️ ZU LANG GEBRATEN')}
  else if(now>=prep.readyAt)v22Prep();else toast('⏳ Noch nicht fertig…');
 }else v22Prep();
}
function v22Move(dt){
 let x=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
 let y=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
 if(joy.on){x=joy.x;y=joy.y}const l=Math.hypot(x,y)||1;
 if(x||y){const nx=hero.x+x/l*hero.speed*dt,ny=hero.y+y/l*hero.speed*dt;if(!v22Block(nx,hero.y))hero.x=nx;if(!v22Block(hero.x,ny))hero.y=ny}
 hero.x=Math.max(285,Math.min(1235,hero.x));hero.y=Math.max(120,Math.min(805,hero.y));
}
function v22Block(x,y){
 for(const p of Object.values(station))if(circleHitsRect(x,y,22,{x:p.x-56,y:p.y-43,w:112,h:86}))return true;
 if(circleHitsRect(x,y,22,{x:390,y:410,w:350,h:88}))return true;
 for(const t of v22.tables)if(circleHitsRect(x,y,22,{x:t.x-60,y:t.y-38,w:120,h:76}))return true;
 return false;
}
function v22Cabinets(){
 shadow(360,615,100,13,.3);
 [300,360,420].forEach((x,i)=>{ctx.fillStyle='#b8c5c0';rr(x-27,230,54,350,10);ctx.fillStyle='#dce5e1';rr(x-22,240,44,158,7);ctx.fillStyle='#aebcb6';rr(x-22,410,44,158,7);ctx.strokeStyle='#687770';ctx.strokeRect(x-18,250,36,138);ctx.strokeRect(x-18,420,36,138);txt('SCHRANK '+(i+1),x,603,8,'#e1e9e5')});
}
function v22Tables(){
 for(const t of v22.tables){
  shadow(t.x,t.y+45,75,13,.32);ctx.fillStyle='#4b3427';rr(t.x-62,t.y-40,124,80,16);ctx.fillStyle='#a9784e';rr(t.x-55,t.y-33,110,66,13);
  [{x:t.x-82,y:t.y},{x:t.x+82,y:t.y}].forEach(ch=>{ctx.fillStyle='#d5a45d';rr(ch.x-18,ch.y-15,36,30,8);ctx.fillStyle='#6d4c35';rr(ch.x-13,ch.y-11,26,22,6)});
  txt(t.dirty?'🧺':t.occupied?'BESETZT':'FREI',t.x,t.y+4,10,t.dirty?'#ffe08b':t.occupied?'#a8e6ff':'#a8f0bc');
 }
}
function v22TrashDraw(){
 const x=v22.trash.x,y=v22.trash.y;shadow(x,y+48,45,10,.3);ctx.fillStyle='#1b2420';rr(x-42,y-38,84,78,10);ctx.fillStyle='#4e6258';rr(x-34,y-29,68,60,8);ctx.fillStyle='#26322d';rr(x-39,y-42,78,13,6);txt('🗑️',x,y+7,28,'#fff');txt('TABLETT / MÜLL',x,y+58,9,'#e7eee9');
}
function v22DoorDraw(){const x=v22.door.x,y=v22.door.y;ctx.fillStyle='#151d19';rr(x-58,y-55,116,65,12);ctx.fillStyle='#5b3c29';rr(x-49,y-47,98,57,9);txt('EINGANG',x,y-60,10,'#ffe1a0')}
function v22CustomerDraw(c,t){
 shadow(c.x,c.y+23,20,7,.38);ctx.fillStyle=c.color;ctx.beginPath();ctx.arc(c.x,c.y,21,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f1c5a0';ctx.beginPath();ctx.arc(c.x,c.y-5,13,0,Math.PI*2);ctx.fill();txt(c.state==='cashier'?'E / ✋ BESTELLEN':c.state==='waitingFood'?'WARTET AUF ESSEN':c.state==='eating'?'😋':'',c.x,c.y-42,10,'#ffe08b');
}
function v22World(t){
 ctx.clearRect(0,0,W,H);if(mode!=='game'){ctx.fillStyle='#080a09';ctx.fillRect(0,0,W,H);return}
 ctx.save();ctx.translate(W/2-hero.x,H/2-hero.y);ctx.fillStyle='#0b100e';ctx.fillRect(0,0,1500,900);
 for(let y=0;y<900;y+=70)for(let x=0;x<1500;x+=70){ctx.fillStyle=((x+y)/70)%2?'#27312d':'#202a25';ctx.fillRect(x,y,68,68)}
 ctx.fillStyle='#070b09';rr(235,55,1040,790,38);ctx.fillStyle='#6a4a33';rr(278,98,954,704,25);
 txt('KÜCHE',750,112,12,'#c7d7d0');txt('KUNDENBEREICH',750,550,13,'#ffe3a0');
 v22Cabinets();drawCounter();drawStations(t);drawInteractionPads(t);v22Tables();v22TrashDraw();v22DoorDraw();
 for(const c2 of v22.customers)v22CustomerDraw(c2,t);
 if(v22.heldFood)txt('🍔 '+v22.heldFood.qty+'×',hero.x,hero.y-48,13,'#ffe08b');else if(v22.tray)txt(v22.tray.type==='empty'?'🧺':'🍱',hero.x,hero.y-48,22,'#fff');
 for(const p of others.values())drawCharacter(p,'#63c8ff',p.name||'CO-OP',t);drawCharacter(hero,'#f5b33f','YOU',t);ctx.restore();
 const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.15,W/2,H/2,Math.max(W,H)*.72);g.addColorStop(0,'transparent');g.addColorStop(1,'#0009');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
}
const _v22Reset=resetLocalGameState;resetLocalGameState=function(){_v22Reset();v22.customers=[];v22.tray=null;v22.heldFood=null;v22.nextId=1;v22.spawnTimer=1.2};
const _v22Save=makeSaveSnapshot;makeSaveSnapshot=function(slot){const z=_v22Save(slot);z.version=22;z.v22={customers:cloneData(v22.customers),tables:cloneData(v22.tables),tray:cloneData(v22.tray),heldFood:cloneData(v22.heldFood),nextId:v22.nextId,spawnTimer:v22.spawnTimer};return z};
const _v22Apply=applySaveSnapshot;applySaveSnapshot=function(save){const ok=_v22Apply(save);if(save?.v22){v22.customers=Array.isArray(save.v22.customers)?cloneData(save.v22.customers):[];v22.tables=Array.isArray(save.v22.tables)?cloneData(save.v22.tables):v22.tables;v22.tray=save.v22.tray?cloneData(save.v22.tray):null;v22.heldFood=save.v22.heldFood?cloneData(save.v22.heldFood):null;v22.nextId=Number(save.v22.nextId)||1;v22.spawnTimer=Number(save.v22.spawnTimer)||4}return ok};
makeOrder=function(){order=null;prep={step:-1,readyAt:0,overAt:0,started:false,duration:2.3};ui()};
finishStep=v22Prep;prepDone=v22Done;tryInteract=v22Interact;move=v22Move;drawWorld=v22World;
const _v22Start=startGame;startGame=function(showStory=true){_v22Start(showStory);if(!v22.customers.length)v22Spawn()};
const _v22Loop=loop;loop=function(t){v22Update(Math.min(.04,(t-last)/1000));_v22Loop(t)};
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='e'){}});
v22Style();


</script>
</body>
</html>
"""#
}
