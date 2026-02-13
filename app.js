const balanceEl = document.getElementById("balance");
const addFundsBtn = document.getElementById("addFunds");
const panels = { bravo: document.getElementById("panel-bravo"), inferno: document.getElementById("panel-inferno") };
const wheelBravo = document.getElementById("wheel-bravo");
const wheelInferno = document.getElementById("wheel-inferno");
const resultBravo = document.getElementById("result-bravo");
const resultInferno = document.getElementById("result-inferno");
const inventoryList = document.getElementById("inventory-list");
const inventoryEmpty = document.getElementById("inventory-empty");
let balance = 1000;
let inventory = [];
let invId = 1;
let isSpinning = false;

function setBalance(v){balance=Math.max(0,Math.floor(v));balanceEl.textContent=balance}
function openPanel(name){Object.values(panels).forEach(p=>p.classList.add("hidden"));panels[name].classList.remove("hidden");window.location.hash=`panel-${name}`}
function closePanel(id){const p=document.getElementById(id);if(p)p.classList.add("hidden")}
function rnd(){return Math.random()}

const CASES = {
  bravo:{
    price:100,
    items:[
      {name:"MP9 | Ruby Poison",tier:"Common",value:40},
      {name:"Glock-18 | Water Elemental",tier:"Rare",value:110},
      {name:"AK-47 | Redline",tier:"Rare",value:120},
      {name:"P250 | Asiimov",tier:"Rare",value:95},
      {name:"FAMAS | Pulse",tier:"Common",value:60},
      {name:"P90 | Emerald Dragon",tier:"Epic",value:180},
      {name:"AWP | Atheris",tier:"Common",value:70},
      {name:"USP-S | Orion",tier:"Epic",value:200},
      {name:"M4A1-S | Hyper Beast",tier:"Epic",value:220},
      {name:"Desert Eagle | Blaze",tier:"Legendary",value:500},
      {name:"Karambit | Fade",tier:"Legendary",value:700},
      {name:"MAC-10 | Neon Rider",tier:"Rare",value:130}
    ]
  },
  inferno:{
    price:200,
    items:[
      {name:"Five-SeveN | Angry Mob",tier:"Common",value:80},
      {name:"CZ75-Auto | Victoria",tier:"Rare",value:160},
      {name:"AK-47 | Vulcan",tier:"Epic",value:320},
      {name:"M4A4 | Howl",tier:"Legendary",value:900},
      {name:"AWP | Asiimov",tier:"Epic",value:350},
      {name:"Butterfly Knife | Tiger Tooth",tier:"Legendary",value:2200},
      {name:"USP-S | Kill Confirmed",tier:"Epic",value:380},
      {name:"Desert Eagle | Printstream",tier:"Epic",value:360},
      {name:"Galil AR | Chatterbox",tier:"Rare",value:180},
      {name:"MP7 | Bloodsport",tier:"Rare",value:170},
      {name:"G3SG1 | Flux",tier:"Common",value:90},
      {name:"AWP | Dragon Lore",tier:"Legendary",value:1500}
    ]
  }
};
const tierClass = {Common:"cmn",Rare:"rare",Epic:"epic",Legendary:"leg"};
const tierWeights = [["Common",0.7],["Rare",0.22],["Epic",0.07],["Legendary",0.01]];
const tierColors = {Common:"#293042",Rare:"#1e3a8a",Epic:"#6b21a8",Legendary:"#b45309"};

function pickTier(){
  let r=rnd(),acc=0;
  for(const [t,w] of tierWeights){acc+=w;if(r<=acc)return t}
  return "Common";
}
function rollItem(items){
  const t=pickTier();
  const c=items.filter(i=>i.tier===t);
  const pool=c.length?c:items;
  return pool[Math.floor(rnd()*pool.length)];
}
const SKIN_URLS = {
  "MP9 | Ruby Poison": "weapon_mp9_cu_mp9_ruby_poison_light_png.png",
  "Glock-18 | Water Elemental": "weapon_glock_cu_glock18_water_elemental_light_png.png",
  "AK-47 | Redline": "weapon_ak47_cu_ak47_redline_light_png.png",
  "P250 | Asiimov": "weapon_p250_cu_p250_asiimov_light_png.png",
  "FAMAS | Pulse": "weapon_famas_cu_famas_pulse_light_png.png",
  "P90 | Emerald Dragon": "weapon_p90_cu_p90_emerald_dragon_light_png.png",
  "AWP | Atheris": "weapon_awp_gs_awp_snake_light_png.png",
  "USP-S | Orion": "weapon_usp_silencer_cu_usp_orion_light_png.png",
  "M4A1-S | Hyper Beast": "weapon_m4a1_silencer_cu_m4a1_hyper_beast_light_png.png",
  "Desert Eagle | Blaze": "weapon_deagle_aa_flames_light_png.png",
  "Karambit | Fade": "weapon_knife_karambit_aa_fade_light_png.png",
  "MAC-10 | Neon Rider": "weapon_mac10_cu_mac10_neonrider_light_png.png",
  "Five-SeveN | Angry Mob": "weapon_fiveseven_gs_fiveseven_angry_mob_light_png.png",
  "CZ75-Auto | Victoria": "weapon_cz75a_aq_cz75_victoria_light_png.png",
  "AK-47 | Vulcan": "weapon_ak47_cu_ak47_vulcan_light_png.png",
  "M4A4 | Howl": "weapon_m4a1_cu_m4a1_howling_light_png.png",
  "AWP | Asiimov": "weapon_awp_cu_awp_asiimov_light_png.png",
  "Butterfly Knife | Tiger Tooth": "weapon_knife_butterfly_an_tiger_orange_light_png.png",
  "USP-S | Kill Confirmed": "weapon_usp_silencer_cu_usp_kill_confirmed_light_png.png",
  "Desert Eagle | Printstream": "weapon_deagle_gs_deagle_printstream_light_png.png",
  "Galil AR | Chatterbox": "weapon_galilar_cu_galil_chatterbox_light_png.png",
  "MP7 | Bloodsport": "weapon_mp7_gs_mp7_bloodsport_light_png.png",
  "G3SG1 | Flux": "weapon_g3sg1_cu_g3sg1_flux_light_png.png",
  "AWP | Dragon Lore": "weapon_awp_cu_awp_dragon_lore_light_png.png"
};

const IMG_BASE = "https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/static/panorama/images/econ/default_generated/";

let skinImages = {};
const SKIN_API_SOURCES = [
  "https://cdn.jsdelivr.net/gh/ByMykel/CSGO-API@main/api/en/skins.json",
  "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/api/en/skins.json",
  "https://bymykel.github.io/CSGO-API/api/en/skins.json"
];
async function fetchSkins() {
  const targets = new Set();
  Object.values(CASES).forEach(c => c.items.forEach(i => targets.add(i.name)));
  for (const url of SKIN_API_SOURCES) {
    try {
      const res = await fetch(url,{cache:"no-store"});
      const data = await res.json();
      data.forEach(s => {
        if (targets.has(s.name) && s.image && !skinImages[s.name]) {
          skinImages[s.name] = s.image;
        }
      });
      if (Object.keys(skinImages).length) break;
    } catch(_){}
  }
  renderInventory();
}
fetchSkins();

// Global error handler to fallback to SVG safely
window.handleImgError = function(img) {
  img.onerror = null;
  const name = img.alt;
  let tier = "Common";
  for(const k in CASES){
    const found = CASES[k].items.find(i=>i.name===name);
    if(found){tier=found.tier;break;}
  }
  const file = SKIN_URLS[name];
  if (file) {
    const bases = [
      "https://cdn.jsdelivr.net/gh/ByMykel/counter-strike-image-tracker@main/static/panorama/images/econ/default_generated/",
      "https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/",
      "https://cdn.statically.io/gh/ByMykel/counter-strike-image-tracker/main/static/panorama/images/econ/default_generated/"
    ];
    const idx = Number(img.dataset.retryBase || 0);
    if (idx < bases.length) {
      img.dataset.retryBase = String(idx + 1);
      img.onerror = window.handleImgError;
      img.src = bases[idx] + file;
      return;
    }
  }
  const w = img.width || 112;
  const h = img.height || 56;
  img.src = svgData(name, tier, w, h);
};

function svgData(name,tier,w,h){
  const bg=tierColors[tier]||"#293042";
  const fg="#ffffff";
  const fs=Math.max(10,Math.floor(w*0.12));
  const txt=name.length>22?name.slice(0,22)+"…":name;
  const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <rect fill='${bg}' width='100%' height='100%' rx='8' ry='8'/>
    <text x='50%' y='52%' fill='${fg}' font-family='Inter,Segoe UI,Arial' font-size='${fs}' dominant-baseline='middle' text-anchor='middle'>${txt}</text>
  </svg>`;
  return "data:image/svg+xml;utf8,"+encodeURIComponent(svg);
}
function itemImage(item,w=120,h=64){
  if(skinImages[item.name]){
    return skinImages[item.name];
  }
  if(SKIN_URLS[item.name]){
    return IMG_BASE + SKIN_URLS[item.name];
  }
  return svgData(item.name,item.tier,w,h);
}
function renderInventory(){
  if(inventory.length===0){
    inventoryEmpty.classList.remove("hidden");
    inventoryList.innerHTML="";
    return;
  }
  inventoryEmpty.classList.add("hidden");
  inventoryList.innerHTML = inventory.map(it=>{
    const cls=tierClass[it.tier]||"cmn";
    const img=itemImage(it,320,120);
    return `<div class="inv-card ${cls}">
      <img class="inv-thumb" src="${img}" alt="${it.name}" onerror="handleImgError(this)">
      <div class="row"><span>${it.tier}</span><button class="btn small" data-sell="${it.id}">Vender</button></div>
    </div>`;
  }).join("");
}
inventoryList.addEventListener("click",e=>{
  const b=e.target.closest("[data-sell]");if(!b)return;
  const id=Number(b.dataset.sell);
  const idx=inventory.findIndex(x=>x.id===id);
  if(idx>=0){
    const val=inventory[idx].value;
    inventory.splice(idx,1);
    setBalance(balance+val);
    renderInventory();
  }
});

function spinWheel(wrap, items, chosen){
  const list=[];
  for(let i=0;i<29;i++){
    const x=items[Math.floor(rnd()*items.length)];
    list.push(x);
  }
  list.push(chosen);
  wrap.innerHTML = list.map(x=>{
    const cls=tierClass[x.tier]||"cmn";
    const img=itemImage(x,112,56);
    return `<div class="wheel-item ${cls}"><img class="wheel-img" src="${img}" alt="${x.name}" onerror="handleImgError(this)"></div>`;
  }).join("");
  const itemW=120, gap=10;
  const total=(itemW+gap)*list.length;
  const view=wrap.parentElement.clientWidth;
  const target=total - (view/2) - (itemW/2);
  wrap.style.transition="none";
  wrap.style.transform="translateX(0)";
  void wrap.offsetWidth;
  wrap.style.transition="transform 2.2s cubic-bezier(.22,.8,.27,1)";
  wrap.style.transform=`translateX(-${Math.max(0,target)}px)`;
  return new Promise(res=>{
    let resolved = false;
    const done=()=>{
      if(resolved) return;
      resolved = true;
      wrap.removeEventListener("transitionend",done);
      res();
    };
    wrap.addEventListener("transitionend",done);
    setTimeout(done, 2400);
  });
}

function openCase(key){
  if(isSpinning) return;
  const d=CASES[key];
  const wheel=key==="bravo"?wheelBravo:wheelInferno;
  const result=key==="bravo"?resultBravo:resultInferno;
  if(balance<d.price){result.innerHTML="Saldo insuficiente";return}
  setBalance(balance-d.price);
  isSpinning = true;
  const chosen=rollItem(d.items);
  spinWheel(wheel,d.items,chosen).then(()=>{
    isSpinning = false;
    const imgUrl = itemImage(chosen, 112, 56);
    result.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;"><img src="${imgUrl}" alt="${chosen.name}" style="height: 40px;" onerror="handleImgError(this)"><span>Ganhou: ${chosen.name} • ${chosen.tier} • ${chosen.value} CR</span></div>`;
    inventory.push({id:invId++,...chosen});
    renderInventory();
  });
}

setBalance(balance);
addFundsBtn.addEventListener("click",()=>setBalance(balance+500));
Array.from(document.querySelectorAll("[data-open]")).forEach(b=>{
  b.addEventListener("click",()=>openPanel(b.dataset.open));
});
Array.from(document.querySelectorAll(".close")).forEach(b=>{
  b.addEventListener("click",()=>closePanel(b.dataset.close));
});
document.getElementById("open-bravo").addEventListener("click",()=>openCase("bravo"));
document.getElementById("open-inferno").addEventListener("click",()=>openCase("inferno"));
