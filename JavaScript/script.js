let data = JSON.parse(localStorage.getItem("ncc")) || {
    lastPlayedDate: null,
    links: [],
    leaderboard: [],
    duels: [],
    emails: []
};

function save() {
    localStorage.setItem("ncc", JSON.stringify(data));
}

function getToday() {
    return new Date().toISOString().split("T")[0];
}

/* ================= EMAIL ================= */
function toggleEmail() {
    let box = document.getElementById("emailBox");
    box.style.display = box.style.display === "none" ? "block" : "none";
}

function saveEmail() {
    let input = document.getElementById("emailInput");
    let email = input.value.trim().toLowerCase();

    if (!email) return;

    if (data.emails.find(e => e.email === email)) {
        input.value = "";
        input.placeholder = "Email already entered";
        input.classList.add("error");
        return;
    }

    data.emails.push({ email, personal: false });
    input.value = "";
    input.classList.remove("error");

    save();
    alert("Saved!");
}

/* ================= DAILY ================= */
function playDaily() {
    let today = getToday();

    if (data.lastPlayedDate === today) {
        alert("Already played today");
        return;
    }

    let link = data.links.find(l => !l.usedDate);
    if (!link) return alert("No links left");

    link.usedDate = today;
    data.lastPlayedDate = today;

    save();
    window.open(link.url);
}

/* ================= LEADERBOARD ================= */
function loadLeaderboard() {
    let table = document.getElementById("leaderboardTable");
    if (!table) return;

    data.leaderboard.sort((a, b) => b.points - a.points);

    table.innerHTML = data.leaderboard.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${p.name}</td>
            <td>${p.points}</td>
        </tr>
    `).join("");
}

/* ================= DUELS ================= */
function formatTime(sec) {
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function loadDuels() {
    let div = document.getElementById("duelList");
    if (!div) return;

    let now = Date.now();

    if (data.duels.length === 0) {
        div.innerHTML = `<div>There are no duels waiting</div>`;
        return;
    }

    div.innerHTML = data.duels.map(d => {
        let countdown = "-";
        let button = `<button class="duel-btn soon">Soon</button>`;

        if (d.countdownStart) {
            let diff = Math.floor((d.countdownStart + d.countdown * 1000 - now) / 1000);
            countdown = diff > 0 ? formatTime(diff) : "Starting...";
        }

        if (d.link) {
            button = `<button onclick="window.open('${d.link}')">Join</button>`;
        }

        return `
        <div class="duel-row">
            <div>${d.name}</div>
            <div>${countdown}</div>
            <div class="duel-theme">${d.theme || "World"}</div>
            <div>${button}</div>
        </div>
        `;
    }).join("");

    setTimeout(loadDuels, 1000);
}

/* ================= ADMIN ================= */
function login() {
    if (document.getElementById("pass").value === "231011197310") {
        document.getElementById("panel").style.display = "block";
        renderLinks();
        renderLeaderboardAdmin();
        renderDuelsAdmin();
        renderEmails();
    } else {
        alert("Wrong password");
    }
}

/* LINKS */
function addLink() {
    let val = document.getElementById("newLink").value;
    if (!val) return;

    data.links.push({ url: val, usedDate: null });
    document.getElementById("newLink").value = "";

    save();
    renderLinks();
}

function deleteLink(i) {
    data.links.splice(i, 1);
    save();
    renderLinks();
}

function renderLinks() {
    let div = document.getElementById("linksList");
    if (!div) return;

    div.innerHTML = data.links.map((l, i) => `
        <div class="card">
            ${l.url}
            <span style="color:${l.usedDate ? 'red' : 'green'}">
                ${l.usedDate ? 'Used' : 'Unused'}
            </span>
            <button onclick="deleteLink(${i})">🗑</button>
        </div>
    `).join("");
}

/* LEADERBOARD ADMIN */
function renderLeaderboardAdmin() {
    let div = document.getElementById("leaderboardAdminList");
    if (!div) return;

    div.innerHTML = data.leaderboard.map((p, i) => `
        <div class="card">
            <button onclick="deletePlayer(${i})">🗑</button>
            ${p.name} (${p.points})
            <button onclick="addScore(${i},4)">+4</button>
            <button onclick="addScore(${i},3)">+3</button>
            <button onclick="addScore(${i},2)">+2</button>
            <button onclick="addScore(${i},1)">+1</button>
        </div>
    `).join("");
}

function addPlayer() {
    let name = document.getElementById("pName").value;
    let pts = parseInt(document.getElementById("pPoints").value);

    if (!name || isNaN(pts)) return;

    data.leaderboard.push({ name, points: pts });
    save();
    renderLeaderboardAdmin();
}

function addScore(i, pts) {
    data.leaderboard[i].points += pts;
    save();
    renderLeaderboardAdmin();
}

function deletePlayer(i) {
    data.leaderboard.splice(i, 1);
    save();
    renderLeaderboardAdmin();
}

function resetScores() {
    data.leaderboard.forEach(p => p.points = 0);
    save();
    renderLeaderboardAdmin();
}

/* DUELS ADMIN */
function addDuel() {
    data.duels.push({
        name: dName.value,
        date: dDate.value,
        time: dTime.value,
        theme: dTheme.value
    });
    save();
    renderDuelsAdmin();
}

function renderDuelsAdmin() {
    let div = document.getElementById("duelAdminList");
    if (!div) return;

    div.innerHTML = data.duels.map((d, i) => `
        <div class="card">
            ${d.name}
            <button onclick="startDuel(${i})">Start</button>
            <button onclick="deleteDuel(${i})">🗑</button>
        </div>
    `).join("");
}

function deleteDuel(i) {
    data.duels.splice(i, 1);
    save();
    renderDuelsAdmin();
}

function startDuel(i) {
    localStorage.setItem("selectedDuel", i);
    window.location.href = "duel-start.html";
}

/* START PAGE */
function initStartPage() {
    window.currentDuel = localStorage.getItem("selectedDuel");
}

function confirmStart() {
    let d = data.duels[currentDuel];

    d.countdown = parseInt(document.getElementById("countdownSeconds").value);
    d.countdownStart = Date.now();
    d.link = document.getElementById("gameLink").value;

    save();
}

/* EMAIL ADMIN */
function renderEmails() {
    let div = document.getElementById("emailList");
    if (!div) return;

    div.innerHTML = data.emails.map((e, i) => `
        <div class="card">
            ${e.email}
            <input type="checkbox" ${e.personal ? "checked" : ""} onchange="togglePersonal(${i})">
            <button onclick="deleteEmail(${i})">🗑</button>
        </div>
    `).join("");
}

function deleteEmail(i) {
    data.emails.splice(i, 1);
    save();
    renderEmails();
}

function togglePersonal(i) {
    data.emails[i].personal = !data.emails[i].personal;
    save();
}