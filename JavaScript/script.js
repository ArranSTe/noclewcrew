import { db, doc, setDoc, onSnapshot } from "./firebase.js";

/* ================= PAGE LOAD ================= */
window.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("loaded");

    // attach link transitions AFTER DOM loads
    document.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function(e) {
            let href = this.getAttribute("href");
            if (!href || href.startsWith("#")) return;

            e.preventDefault();
            document.body.classList.add("fade-out");

            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
});

/* ================= DATA ================= */
let data = {
    lastPlayedDate: "",
    links: [],
    leaderboard: [],
    duels: [],
    emails: []
};

const ref = doc(db, "ncc", "main");

/* ================= STATE ================= */
let isLoaded = false;

/* ================= HELPERS ================= */
function setButtonLoading(btn){
    btn?.classList.add("loading");
}

function clearButtonLoading(btn){
    btn?.classList.remove("loading");
}

/* ================= RENDER ================= */
function renderAll(){
    loadLeaderboard();
    loadDuels();
    renderLeaderboardAdmin();
    renderDuelsAdmin();
    renderLinks();
    renderEmails();
}

/* ================= SYNC ================= */
onSnapshot(ref, (snap) => {
    if (snap.exists()) {
        data = snap.data();

        renderAll(); // always update UI
        isLoaded = true;
    }
});

/* ================= SAVE ================= */
async function save(){
    await setDoc(ref, data);
}

/* ================= DAILY ================= */
function playDaily(){
    let btn = event?.target;
    setButtonLoading(btn);

    let today = new Date().toISOString().split("T")[0];

    if(data.lastPlayedDate === today){
        alert("Already played today");
        clearButtonLoading(btn);
        return;
    }

    let link = data.links.find(l=>!l.usedDate);
    if(!link){
        alert("No links left");
        clearButtonLoading(btn);
        return;
    }

    link.usedDate = today;
    data.lastPlayedDate = today;

    renderAll();

    save().then(()=>{
        clearButtonLoading(btn);
        window.open(link.url);
    });
}

/* ================= EMAIL ================= */
function toggleEmail(){
    let box=document.getElementById("emailBox");
    box.style.display = box.style.display==="none"?"block":"none";
}

function saveEmail(){
    let btn = event?.target;
    setButtonLoading(btn);

    let input=document.getElementById("emailInput");
    let email=input.value.trim().toLowerCase();

    if(data.emails.find(e=>e.email===email)){
        input.placeholder="Email already entered";
        input.classList.add("error");
        clearButtonLoading(btn);
        return;
    }

    data.emails.push({email,personal:false});
    input.value="";
    renderEmails();

    save().then(()=>clearButtonLoading(btn));
}

/* ================= LEADERBOARD ================= */
function loadLeaderboard(){
    let table=document.getElementById("leaderboardTable");
    if(!table) return;

    if(data.leaderboard.length === 0){
        table.innerHTML = `<div class="empty">No players yet</div>`;
        return;
    }

    data.leaderboard.sort((a,b)=>b.points-a.points);

    table.innerHTML=data.leaderboard.map((p,i)=>`
        <tr class="fade-up">
            <td>${i+1}</td>
            <td>${p.name}</td>
            <td>${p.points}</td>
        </tr>
    `).join("");
}

/* ================= DUELS ================= */
function formatTime(sec){
    let m=Math.floor(sec/60);
    let s=sec%60;
    return `${m}:${s.toString().padStart(2,'0')}`;
}

function loadDuels(){
    let div=document.getElementById("duelList");
    if(!div) return;

    if(data.duels.length===0){
        div.innerHTML=`<div class="empty">No duels scheduled</div>`;
        return;
    }

    let now=Date.now();

    div.innerHTML=data.duels.map(d=>{
        let countdown="-";
        let btn=`<button class="duel-btn soon">Soon</button>`;
        let rowClass="duel-row";

        if(d.countdownStart){
            let diff=Math.floor((d.countdownStart+d.countdown*1000-now)/1000);
            countdown=diff>0?formatTime(diff):"Starting...";

            if(diff <= 10 && diff > 0){
                rowClass="duel-row duel-live";
            }
        }

        if(d.link){
            btn=`<button onclick="window.open('${d.link}')">Join</button>`;
        }

        return `
        <div class="${rowClass} fade-up">
            <div>${d.name}</div>
            <div>${countdown}</div>
            <div class="duel-theme">${d.theme||"World"}</div>
            <div>${btn}</div>
        </div>
        `;
    }).join("");
}

/* ================= ADMIN ================= */
function login(){
    if(document.getElementById("pass").value==="231011197310"){
        document.getElementById("panel").style.display="block";
    } else {
        alert("Wrong password");
    }
}

/* ================= LINKS ================= */
function addLink(){
    data.links.push({url:newLink.value});
    newLink.value="";
    renderLinks();
    save();
}

function deleteLink(i){
    data.links.splice(i,1);
    renderLinks();
    save();
}

function renderLinks(){
    let div=document.getElementById("linksList");
    if(!div) return;

    div.innerHTML=data.links.map((l,i)=>`
        <div class="card fade-up">
            ${l.url}
            <button onclick="deleteLink(${i})">🗑</button>
        </div>
    `).join("");
}

/* ================= LEADERBOARD ADMIN ================= */
function renderLeaderboardAdmin(){
    let div=document.getElementById("leaderboardAdminList");
    if(!div) return;

    div.innerHTML=data.leaderboard.map((p,i)=>`
        <div class="card fade-up">
            <button onclick="deletePlayer(${i})" class="danger">🗑</button>
            ${p.name} (${p.points})
            <button onclick="addScore(${i},4)">+4</button>
            <button onclick="addScore(${i},3)">+3</button>
            <button onclick="addScore(${i},2)">+2</button>
            <button onclick="addScore(${i},1)">+1</button>
        </div>
    `).join("");
}

function deletePlayer(i){
    data.leaderboard.splice(i,1);
    renderLeaderboardAdmin();
    save();
}

function addPlayer(){
    data.leaderboard.push({name:pName.value,points:0});
    renderLeaderboardAdmin();
    save();
}

function addScore(i,pts){
    data.leaderboard[i].points+=pts;
    renderLeaderboardAdmin();
    save();
}

/* ================= DUELS ADMIN ================= */
function renderDuelsAdmin(){
    let div = document.getElementById("duelAdminList");
    if(!div) return;

    div.innerHTML = data.duels.map((d,i)=>`
        <div class="card fade-up">
            <div style="display:flex; justify-content:space-between;">
                <span>${d.name}</span>
                <button onclick="deleteDuel(${i})" class="danger">🗑</button>
            </div>
        </div>
    `).join("");
}

function addDuel(){
    data.duels.push({
        name:dName.value,
        date:dDate.value,
        time:dTime.value,
        theme:dTheme.value
    });

    renderAll();
    save();
}

function deleteDuel(i){
    data.duels.splice(i,1);
    renderDuelsAdmin();
    loadDuels();
    save();
}

/* ================= EMAIL ADMIN ================= */
function renderEmails(){
    let div=document.getElementById("emailList");
    if(!div) return;

    div.innerHTML=data.emails.map((e,i)=>`
        <div class="card fade-up">
            ${e.email}
            <button onclick="deleteEmail(${i})" class="danger">🗑</button>
        </div>
    `).join("");
}

function deleteEmail(i){
    data.emails.splice(i,1);
    renderEmails();
    save();
}

/* ================= NAV ================= */
function navigateTo(url){
    document.body.classList.add("fade-out");

    setTimeout(()=>{
        window.location.href = url;
    },300);
}

/* ================= GLOBAL ================= */
window.login = login;
window.addLink = addLink;
window.deleteLink = deleteLink;
window.addPlayer = addPlayer;
window.addScore = addScore;
window.addDuel = addDuel;
window.playDaily = playDaily;
window.saveEmail = saveEmail;
window.toggleEmail = toggleEmail;
window.deletePlayer = deletePlayer;
window.deleteDuel = deleteDuel;
window.deleteEmail = deleteEmail;
window.navigateTo = navigateTo;