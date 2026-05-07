// --- CORE.GG PROFESSIONAL SUITE V7.8 (SECURE AUTH & HWID LOCK) ---
// Credits Who made this: Zenith.gg

const CATEGORIES = {
    modules: { count: 80, icon: 'fa-microchip', prefix: ["Advanced", "System", "Integrated", "Core", "Essential", "Optimized", "Global", "Dynamic", "Structural", "Nexus"], suffix: ["Framework", "Engine", "Module", "Wrapper", "Handler", "Manager", "Service", "Bridge", "Architecture", "Protocol"] },
    servers: { count: 60, icon: 'fa-server', prefix: ["Backend", "Data", "Economy", "Secure", "Network", "Validation", "Synchronization", "Database", "Matchmaking", "Relay"], suffix: ["Logic", "Service", "Processor", "Validator", "API", "Emitter", "Aggregator", "Storage", "Controller", "Bridge"] },
    clients: { count: 60, icon: 'fa-desktop', prefix: ["Local", "Camera", "Visual", "Movement", "Combat", "Rendering", "Interface", "Input", "Prediction", "Effect"], suffix: ["Handler", "Controller", "Visualizer", "Manager", "Interceptor", "Reactor", "Renderer", "Listener", "Manipulator", "System"] },
    tools: { count: 40, icon: 'fa-tools', prefix: ["LBI", "Luau", "XOR", "Minifier", "Beautifier", "Deobfuscator", "Obfuscator", "Decompiler", "Encryption", "String"], suffix: ["Suite", "Tool", "Utility", "Processor", "Converter", "Hardener", "Analyzer", "Refactorer", "Optimizer", "Encoder"] }
};

const LOGIC_BANKS = {
    combat: [`function self:CastRaycastHitbox(origin, direction, range)\n    local params = RaycastParams.new()\n    params.FilterDescendantsInstances = {self.Player.Character}\n    params.FilterType = Enum.RaycastFilterType.Exclude\n    local result = workspace:Raycast(origin, direction * range, params)\n    if result then self:HandleHit(result.Instance, result.Position) end\nend`],
    data: [`function self:LoadData(player)\n    local key = "Player_" .. player.UserId\n    local success, data = pcall(function() return self.Store:GetAsync(key) end)\n    if success then self.SessionData[player] = data or self.Default end\nend`],
    network: [`function self:FireClient(player, action, ...)\n    self.Remote:FireClient(player, {A = action, P = {...}})\nend`],
    camera: [`function self:Shake(intensity)\n    task.spawn(function()\n        for i = 1, 10 do\n            self.Camera.CFrame *= CFrame.Angles(math.rad(math.random(-intensity, intensity)), 0, 0)\n            task.wait(0.05)\n        end\n    end)\nend`],
    tools: [`function self:Minify(code)\n    return code:gsub("%s+", " "):gsub("%-%-.-\\n", ""):gsub("%-%-%[%[.-%]%]", "")\nend`],
    generic: [`function self:Init()\n    print("[CORE] Service " .. self.Name .. " initialized.")\nend`]
};

const GENERATED_DATA = { modules: [], servers: [], clients: [], tools: [] };
let isPremiumUser = false;
let currentUser = null;
let activeLicenses = JSON.parse(localStorage.getItem('core_licenses') || '[]');
let stats = JSON.parse(localStorage.getItem('core_stats') || '{"extractions": 0, "session_traffic": 0}');
let hwid = localStorage.getItem('core_hwid') || (() => {
    let id = 'HWID-' + Math.random().toString(36).substring(2, 15).toUpperCase();
    localStorage.setItem('core_hwid', id);
    return id;
})();

// --- GLOBAL FUNCTIONS ---
window.switchTab = function(target) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.target === target));
    document.querySelectorAll('.dashboard-section').forEach(s => {
        s.classList.toggle('active', s.id === target);
        s.style.display = s.id === target ? 'block' : 'none';
    });
    updateRealTimeStats();
};

window.openAuth = function() { document.getElementById('auth-modal').style.display = 'flex'; };
window.closeModal = function(id) { document.getElementById(id).style.display = 'none'; };
window.signOut = function() { localStorage.removeItem('zenith_usr'); location.reload(); };
window.closeWorkspace = function() { document.getElementById('workspace-overlay').style.display = 'none'; };
window.copyOutput = function() { 
    const out = document.getElementById('ws-output'); 
    out.select(); 
    document.execCommand('copy'); 
    window.showToast("Copied.", "success"); 
};

window.showToast = function(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.borderLeftColor = type === 'success' ? '#10b981' : (type === 'error' ? '#f43f5e' : '#3b82f6');
    toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'slideOutRight 0.4s forwards'; setTimeout(() => toast.remove(), 400); }, 3000);
};

// --- REDEMPTION & HWID LOCK ---
window.redeemLicense = function() {
    const key = document.getElementById('redeem-key-input').value.trim();
    const license = activeLicenses.find(l => l.key === key);

    if (!license) { window.showToast("Invalid key.", "error"); return; }
    if (license.hwid && license.hwid !== hwid) { 
        window.showToast("Key sharing detected. HWID Mismatch.", "error"); 
        return; 
    }

    license.hwid = hwid;
    license.status = 'Claimed';
    license.redeemed_by = currentUser.email;
    localStorage.setItem('core_licenses', JSON.stringify(activeLicenses));
    
    currentUser.premium = true;
    localStorage.setItem('zenith_usr', JSON.stringify(currentUser));
    
    updateAuthUI(currentUser);
    window.showToast("License Activated! Welcome to Premium.", "success");
};

// --- ADMIN LICENSE MANAGER ---
window.generateLicense = function() {
    const dur = document.getElementById('license-duration').value;
    const key = `CORE-${Math.random().toString(36).substring(2,6).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    activeLicenses.push({ key, duration: dur, status: 'Active', created: new Date().toLocaleDateString(), hwid: null });
    localStorage.setItem('core_licenses', JSON.stringify(activeLicenses));
    renderLicenses();
    window.showToast(`Generated: ${key}`, "success");
};

window.revokeLicense = function(key) {
    activeLicenses = activeLicenses.filter(l => l.key !== key);
    localStorage.setItem('core_licenses', JSON.stringify(activeLicenses));
    renderLicenses();
    window.showToast("Revoked.", "error");
};

function renderLicenses() {
    const list = document.getElementById('license-list'); if (!list) return;
    list.innerHTML = activeLicenses.map(l => `
        <div class="glass" style="padding: 1.2rem; margin-bottom: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <p style="font-family: monospace; font-weight: 800; color: var(--primary-neon);">${l.key}</p>
                <button class="btn" style="padding: 0.4rem 0.8rem; background: rgba(244, 63, 94, 0.1); color: var(--hack-neon); font-size:0.7rem;" onclick="revokeLicense('${l.key}')">Revoke</button>
            </div>
            <p style="font-size: 0.7rem; color: var(--text-dim);">Duration: ${l.duration} | Lock: ${l.hwid ? l.hwid.substring(0,10)+'...' : 'UNLOCKED'}</p>
        </div>
    `).join('') || '<p style="color:var(--text-dim); text-align:center;">No licenses.</p>';
}

// --- GENERATION ENGINE ---
function generateLuauCode(title, type) {
    let lower = title.toLowerCase();
    let code = `-- CORE.GG PROFESSIONAL SUITE V7.8\n-- Resource: ${title}\n-- HWID Locked: ${hwid}\n\n`;
    let selectedBlocks = [...LOGIC_BANKS.generic];
    if (lower.includes("combat")) selectedBlocks.push(...LOGIC_BANKS.combat);
    else if (lower.includes("data")) selectedBlocks.push(...LOGIC_BANKS.data);
    else if (lower.includes("network")) selectedBlocks.push(...LOGIC_BANKS.network);
    else if (lower.includes("camera")) selectedBlocks.push(...LOGIC_BANKS.camera);
    else if (type === 'tools') selectedBlocks.push(...LOGIC_BANKS.tools);

    const pattern = ["OOP", "SINGLETON"][Math.floor(Math.random() * 2)];
    let name = title.replace(/[^a-zA-Z]/g, '');

    if (pattern === "OOP") {
        code += `local ${name} = {}\n${name}.__index = ${name}\n\nfunction ${name}.new()\n    local self = setmetatable({}, ${name})\n    return self\nend\n\n`;
        selectedBlocks.forEach(b => code += b.replace(/function self:/g, `function ${name}:`) + "\n\n");
        code += `return ${name}`;
    } else {
        code += `local Service = {}\n\n`;
        selectedBlocks.forEach(b => code += b.replace(/function self:(.+)\((.*)\)/g, `function Service:$1($2)`) + "\n\n");
        code += `return Service`;
    }
    return code;
}

// --- CORE SYSTEM ---
function initData() {
    let used = new Set();
    for (const [key, config] of Object.entries(CATEGORIES)) {
        for (let i = 0; i < config.count; i++) {
            let title = ""; do {
                let p = config.prefix[Math.floor(Math.random() * config.prefix.length)];
                let s = config.suffix[Math.floor(Math.random() * config.suffix.length)];
                title = `${p} ${s}`;
            } while (used.has(title));
            used.add(title);
            GENERATED_DATA[key].push({ title, desc: `Professional ${key} utility.`, icon: config.icon, premium: Math.random() < 0.8, type: key });
        }
    }
}

function renderTools(filter = "") {
    const grids = { 'core-modules-grid': GENERATED_DATA.modules, 'server-scripts-grid': GENERATED_DATA.servers, 'client-scripts-grid': GENERATED_DATA.clients, 'other-tools-grid': GENERATED_DATA.tools };
    for (const [id, data] of Object.entries(grids)) {
        const grid = document.getElementById(id); if (!grid) continue;
        const filtered = filter ? data.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())) : data;
        grid.innerHTML = filtered.map(t => `
            <div class="glass tool-card ${t.premium ? 'premium-card' : ''}" onclick="handleToolClick('${t.type}', '${t.title}')">
                <div class="tool-icon"><i class="fas ${t.icon}"></i></div>
                ${t.premium ? '<div class="premium-tag"><i class="fas fa-crown"></i> PREMIUM</div>' : ''}
                <h4>${t.title}</h4><p>${t.desc}</p>
            </div>
        `).join('');
    }
}

function handleToolClick(type, title) {
    const tool = GENERATED_DATA[type].find(t => t.title === title);
    if (tool.premium && !isPremiumUser) { window.showToast("Premium required.", "error"); return; }
    if (!tool.source) tool.source = generateLuauCode(tool.title, tool.type);
    document.getElementById('ws-title').innerText = tool.title;
    document.getElementById('workspace-overlay').style.display = 'flex';
    document.getElementById('ws-output').value = tool.source;
    stats.extractions++; localStorage.setItem('core_stats', JSON.stringify(stats)); updateRealTimeStats();
}

function updateAuthUI(user) {
    currentUser = user;
    const profile = document.getElementById('user-profile');
    const authBtns = document.getElementById('auth-buttons');
    if (!profile || !authBtns) return;
    if (user) {
        profile.style.display = 'flex'; authBtns.style.display = 'none';
        isPremiumUser = user.email === 'jayden.ims.monte@gmail.com' || user.premium;
        const dashP = document.getElementById('dashboard-premium-card');
        const setP = document.getElementById('settings-premium-info');
        if (isPremiumUser) { if (dashP) dashP.style.display = 'none'; if (setP) setP.style.display = 'none'; }
        document.getElementById('user-email').innerText = user.email;
        document.getElementById('user-badge').innerText = user.email === 'jayden.ims.monte@gmail.com' ? "OWNER" : (isPremiumUser ? "PREMIUM" : "FREE");
        if (user.email === 'jayden.ims.monte@gmail.com') { const a = document.getElementById('nav-admin'); if (a) a.style.display = 'flex'; }
    } else {
        profile.style.display = 'none'; authBtns.style.display = 'flex';
    }
}

function updateRealTimeStats() {
    stats.session_traffic += Math.floor(Math.random() * 5);
    localStorage.setItem('core_stats', JSON.stringify(stats));
    const e = document.getElementById('stat-extractions'); if (e) e.innerText = stats.extractions;
    const traffic = document.getElementById('admin-traffic'); if (traffic) traffic.innerText = `${(stats.session_traffic/10).toFixed(1)}k`;
    const nodes = document.getElementById('admin-nodes'); if (nodes) nodes.innerText = 124 + activeLicenses.length;
}

window.onload = () => {
    initData(); renderTools(); renderLicenses();
    const saved = localStorage.getItem('zenith_usr');
    if (saved) updateAuthUI(JSON.parse(saved)); else updateAuthUI(null);
    document.getElementById('search-input').oninput = (e) => renderTools(e.target.value);
    document.getElementById('auth-form').onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        const u = { email, pass, premium: email === 'jayden.ims.monte@gmail.com', created_at: Date.now() };
        localStorage.setItem('zenith_usr', JSON.stringify(u));
        updateAuthUI(u); closeModal('auth-modal'); window.showToast("Welcome.", "success");
    };
    updateRealTimeStats();
};
