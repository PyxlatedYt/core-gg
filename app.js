// --- CORE.GG PROFESSIONAL SUITE V8.1 (ABSOLUTE UNIQUENESS) ---
// Credits Who made this: Zenith.gg

const CATEGORIES = {
    modules: { count: 80, icon: 'fa-microchip', prefix: ["Advanced", "System", "Integrated", "Core", "Essential", "Optimized", "Global", "Dynamic", "Structural", "Nexus"], suffix: ["Framework", "Engine", "Module", "Wrapper", "Handler", "Manager", "Service", "Bridge", "Architecture", "Protocol"] },
    servers: { count: 60, icon: 'fa-server', prefix: ["Backend", "Data", "Economy", "Secure", "Network", "Validation", "Synchronization", "Database", "Matchmaking", "Relay"], suffix: ["Logic", "Service", "Processor", "Validator", "API", "Emitter", "Aggregator", "Storage", "Controller", "Bridge"] },
    clients: { count: 60, icon: 'fa-desktop', prefix: ["Local", "Camera", "Visual", "Movement", "Combat", "Rendering", "Interface", "Input", "Prediction", "Effect"], suffix: ["Handler", "Controller", "Visualizer", "Manager", "Interceptor", "Reactor", "Renderer", "Listener", "Manipulator", "System"] },
    tools: { count: 40, icon: 'fa-tools', prefix: ["LBI", "Luau", "XOR", "Minifier", "Beautifier", "Deobfuscator", "Obfuscator", "Decompiler", "Encryption", "String"], suffix: ["Suite", "Tool", "Utility", "Processor", "Converter", "Hardener", "Analyzer", "Refactorer", "Optimizer", "Encoder"] }
};

const LOGIC_SEEDS = {
    combat: [
        { name: "CastHitbox", code: "function self:CastHitbox(origin, dir, dist)\n    local params = RaycastParams.new()\n    params.FilterType = Enum.RaycastFilterType.Exclude\n    local res = workspace:Raycast(origin, dir * dist, params)\n    if res then self:OnCollision(res.Instance) end\nend" },
        { name: "VerifyRange", code: "function self:VerifyRange(target)\n    local mag = (self.Root.Position - target.Position).Magnitude\n    return mag <= self.Config.MaxDistance\nend" },
        { name: "ApplyForce", code: "function self:ApplyForce(target, power)\n    local attachment = Instance.new('Attachment', target)\n    local force = Instance.new('VectorForce', target)\n    force.Force = (target.Position - self.Root.Position).Unit * power\n    force.Attachment0 = attachment\n    task.wait(0.1)\n    force:Destroy(); attachment:Destroy()\nend" }
    ],
    data: [
        { name: "LoadProfile", code: "function self:LoadProfile(userId)\n    local success, data = pcall(function() return self.Store:GetAsync('User_'..userId) end)\n    self.Cache[userId] = success and data or self.Template\nend" },
        { name: "PushUpdate", code: "function self:PushUpdate(userId, key, value)\n    if not self.Cache[userId] then return end\n    self.Cache[userId][key] = value\n    self.Signal:Fire(userId, key, value)\nend" }
    ],
    network: [
        { name: "Transmit", code: "function self:Transmit(player, packet)\n    if typeof(packet) ~= 'table' then return end\n    self.Remote:FireClient(player, packet)\nend" },
        { name: "Listen", code: "function self:Listen(callback)\n    self.Remote.OnServerEvent:Connect(function(player, data)\n        if self:Validate(player, data) then callback(player, data) end\n    end)\nend" }
    ],
    visual: [
        { name: "TweenField", code: "function self:TweenField(property, target, duration)\n    self.TweenService:Create(self.Object, TweenInfo.new(duration), {[property] = target}):Play()\nend" },
        { name: "SetCFrame", code: "function self:SetCFrame(newCF, speed)\n    self.Object.CFrame = self.Object.CFrame:Lerp(newCF, speed)\nend" }
    ],
    security: [
        { name: "DetectAnomaly", code: "function self:DetectAnomaly(player)\n    local hum = player.Character:FindFirstChild('Humanoid')\n    if hum and hum.WalkSpeed > 30 then self:Flag(player, 'SPEED') end\nend" },
        { name: "Heartbeat", code: "function self:Heartbeat()\n    while task.wait(1) do self:CheckAllNodes() end\nend" }
    ],
    tools: [
        { name: "Encrypt", code: "function self:Encrypt(str, key)\n    local result = ''\n    for i=1, #str do\n        result ..= string.char(bit32.bxor(str:byte(i), key:byte((i-1)%#key+1)))\n    end\n    return result\nend" },
        { name: "Decompile", code: "function self:Decompile(bytecode)\n    print('[CORE] Running decompiler engine...'); return '-- SOURCE RESTORED'\nend" }
    ]
};

const GENERATED_DATA = { modules: [], servers: [], clients: [], tools: [] };
let isPremiumUser = false;
let currentUser = null;
let activeLicenses = JSON.parse(localStorage.getItem('core_licenses') || '[]');
let stats = JSON.parse(localStorage.getItem('core_stats') || '{"extractions": 0, "session_traffic": 0}');
let hwid = localStorage.getItem('core_hwid') || 'HWID-' + Math.random().toString(36).substring(2, 10).toUpperCase();

// --- ABSOLUTE UNIQUENESS ENGINE ---
function generateLuauCode(title, type) {
    const lower = title.toLowerCase();
    const className = title.replace(/[^a-zA-Z]/g, '');
    let code = `-- CORE.GG PROFESSIONAL RESOURCE\n-- [ ${title.toUpperCase()} ]\n-- UUID: ${Math.random().toString(36).substring(2, 12).toUpperCase()}\n\n`;

    // Pick logic pool
    let pool = [];
    if (lower.includes("combat")) pool = LOGIC_SEEDS.combat;
    else if (lower.includes("data") || lower.includes("store")) pool = LOGIC_SEEDS.data;
    else if (lower.includes("network") || lower.includes("relay") || lower.includes("api")) pool = LOGIC_SEEDS.network;
    else if (lower.includes("visual") || lower.includes("camera")) pool = LOGIC_SEEDS.visual;
    else if (lower.includes("secure") || lower.includes("valid")) pool = LOGIC_SEEDS.security;
    else if (type === 'tools' || lower.includes("obf") || lower.includes("decompiler")) pool = LOGIC_SEEDS.tools;
    else pool = [LOGIC_SEEDS.security[1], LOGIC_SEEDS.combat[1]]; // Mix for generic

    const pattern = ["OOP", "SINGLETON", "FUNCTIONAL"][Math.floor(Math.random() * 3)];

    if (pattern === "OOP") {
        code += `local ${className} = {}\n${className}.__index = ${className}\n\nfunction ${className}.new(...)\n    local self = setmetatable({}, ${className})\n    self.Name = "${title}"\n    self.Active = true\n    return self\nend\n\n`;
        pool.forEach(p => {
            let funcName = p.name + "_" + Math.random().toString(36).substring(2, 5);
            code += p.code.replace(/function self:(.+)\(/, `function ${className}:${funcName}(`) + "\n\n";
        });
        code += `return ${className}`;
    } else if (pattern === "SINGLETON") {
        code += `local ${className} = { _VERSION = "8.1" }\n\n`;
        pool.forEach(p => {
            let funcName = p.name.toLowerCase();
            code += p.code.replace(/function self:(.+)\(/, `function ${className}:${funcName}(`) + "\n\n";
        });
        code += `return ${className}`;
    } else {
        code += `local exports = { _INFO = "${title}" }\n\n`;
        pool.forEach((p, i) => {
            code += p.code.replace(/function self:(.+)\(/, `local function internal_${i}(`) + "\n\n";
            code += `exports.${p.name} = internal_${i}\n`;
        });
        code += `\nreturn exports`;
    }
    return code;
}

// --- CORE FUNCTIONS ---
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
    out.select(); document.execCommand('copy'); 
    window.showToast("Source Copied.", "success"); 
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

window.redeemLicense = function() {
    const key = document.getElementById('redeem-key-input').value.trim();
    const license = activeLicenses.find(l => l.key === key);
    if (!license) { window.showToast("Invalid Key.", "error"); return; }
    if (license.hwid && license.hwid !== hwid) { window.showToast("HWID Mismatch.", "error"); return; }
    license.hwid = hwid; license.status = 'Claimed'; license.redeemed_by = currentUser.email;
    localStorage.setItem('core_licenses', JSON.stringify(activeLicenses));
    currentUser.premium = true; localStorage.setItem('zenith_usr', JSON.stringify(currentUser));
    updateAuthUI(currentUser); window.showToast("Premium Active!", "success");
};

window.generateLicense = function() {
    const dur = document.getElementById('license-duration').value;
    const key = `CORE-${Math.random().toString(36).substring(2,6).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    activeLicenses.push({ key, duration: dur, status: 'Active', created: new Date().toLocaleDateString(), hwid: null });
    localStorage.setItem('core_licenses', JSON.stringify(activeLicenses));
    renderLicenses(); updateRealTimeStats();
    window.showToast(`Key: ${key}`, "success");
};

window.revokeLicense = function(key) {
    activeLicenses = activeLicenses.filter(l => l.key !== key);
    localStorage.setItem('core_licenses', JSON.stringify(activeLicenses));
    renderLicenses(); updateRealTimeStats();
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
            <p style="font-size: 0.7rem; color: var(--text-dim);">Lock: ${l.hwid ? l.hwid.substring(0,10)+'...' : 'UNLOCKED'}</p>
        </div>
    `).join('') || '<p style="color:var(--text-dim); text-align:center;">No licenses.</p>';
}

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
            GENERATED_DATA[key].push({ title, desc: `Professional ${key} resource.`, icon: config.icon, premium: Math.random() < 0.8, type: key });
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
        const u = { email: document.getElementById('auth-email').value, pass: document.getElementById('auth-password').value, premium: document.getElementById('auth-email').value === 'jayden.ims.monte@gmail.com', created_at: Date.now() };
        localStorage.setItem('zenith_usr', JSON.stringify(u));
        updateAuthUI(u); closeModal('auth-modal'); window.showToast("Initialized.", "success");
    };
    updateRealTimeStats();
};
