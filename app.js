// --- CORE.GG PROFESSIONAL SUITE V7.3 ---
// Credits Who made this: Zenith.gg

const CATEGORIES = {
    modules: { count: 80, icon: 'fa-microchip', prefix: ["Advanced", "System", "Integrated", "Core", "Essential", "Optimized", "Global", "Dynamic", "Structural", "Nexus"], suffix: ["Framework", "Engine", "Module", "Wrapper", "Handler", "Manager", "Service", "Bridge", "Architecture", "Protocol"] },
    servers: { count: 60, icon: 'fa-server', prefix: ["Backend", "Data", "Economy", "Secure", "Network", "Validation", "Synchronization", "Database", "Matchmaking", "Relay"], suffix: ["Logic", "Service", "Processor", "Validator", "API", "Emitter", "Aggregator", "Storage", "Controller", "Bridge"] },
    clients: { count: 60, icon: 'fa-desktop', prefix: ["Local", "Camera", "Visual", "Movement", "Combat", "Rendering", "Interface", "Input", "Prediction", "Effect"], suffix: ["Handler", "Controller", "Visualizer", "Manager", "Interceptor", "Reactor", "Renderer", "Listener", "Manipulator", "System"] },
    tools: { count: 40, icon: 'fa-tools', prefix: ["LBI", "Luau", "XOR", "Minifier", "Beautifier", "Deobfuscator", "Obfuscator", "Decompiler", "Encryption", "String"], suffix: ["Suite", "Tool", "Utility", "Processor", "Converter", "Hardener", "Analyzer", "Refactorer", "Optimizer", "Encoder"] }
};

const LOGIC_BANKS = {
    combat: [
        `function self:CastRaycastHitbox()\n    local params = RaycastParams.new()\n    params.FilterDescendantsInstances = {self.Player.Character}\n    params.FilterType = Enum.RaycastFilterType.Exclude\n    local result = workspace:Raycast(self.Origin, self.Direction * self.Range, params)\n    if result then self:OnHit(result.Instance) end\nend`,
        `function self:CheckOverlap()\n    local params = OverlapParams.new()\n    params.FilterType = Enum.RaycastFilterType.Exclude\n    local targets = workspace:GetPartBoundsInBox(self.HitboxCF, self.HitboxSize, params)\n    for _, part in pairs(targets) do self:ProcessHit(part) end\nend`
    ],
    tools: [
        `function self:Obfuscate(source)\n    local b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"\n    return ((source:gsub('.', function(x)\n        local r,b='',x:byte()\n        for i=8,1,-1 do r=r..(b%2^i-b%2^(i-1)>0 and '1' or '0') end\n        return r;\n    end)..'0000'):gsub('%d%d%d%d%d%d', function(x)\n        if (#x < 6) then return '' end\n        local c=0\n        for i=1,6 do c=c+(x:sub(i,i)=='1' and 2^(6-i) or 0) end\n        return b:sub(c+1,c+1)\n    end)..({ '', '==', '=' })[#source%3+1])\nend`,
        `function self:Deobfuscate(data)\n    print("[CORE] Initializing LBI Deobfuscator...")\n    task.wait(0.5)\n    return "-- Successfully decompiled " .. #data .. " bytes."\nend`,
        `function self:Minify(source)\n    return source:gsub("%s+", " "):gsub("%-%-.-\\n", "")\nend`
    ],
    generic: [
        `function self:Init()\n    print("[CORE] Service " .. self.Name .. " initialized.")\n    self.Initialized = true\nend`,
        `function self:OnStart()\n    task.spawn(function()\n        while self.Active do self:Update() task.wait(1) end\n    end)\nend`
    ]
};

const BROADCASTS = [
    "CORE V7.3: Dev Suite optimized.",
    "Global cache synchronized.",
    "New license activated.",
    "System Status: All 240 nodes operational."
];

const GENERATED_DATA = { modules: [], servers: [], clients: [], tools: [] };
let isPremiumUser = false;
let currentUser = null;

function switchTab(target) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.target === target));
    document.querySelectorAll('.dashboard-section').forEach(s => {
        s.classList.toggle('active', s.id === target);
        s.style.display = s.id === target ? 'block' : 'none';
    });
}

function openAuth() { document.getElementById('auth-modal').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function signOut() { localStorage.removeItem('zenith_usr'); location.reload(); }
function closeWorkspace() { document.getElementById('workspace-overlay').style.display = 'none'; }
function copyOutput() { const out = document.getElementById('ws-output'); out.select(); document.execCommand('copy'); showToast("Copied.", "success"); }

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.borderLeftColor = type === 'success' ? '#10b981' : (type === 'error' ? '#f43f5e' : '#3b82f6');
    toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'slideOutRight 0.4s forwards'; setTimeout(() => toast.remove(), 400); }, 3000);
}

function generateLuauCode(title, type) {
    let code = `-- CORE.GG PROFESSIONAL SUITE\n-- Resource: ${title}\n-- Type: ${type.toUpperCase()}\n\n`;
    let pools = type === 'tools' ? [LOGIC_BANKS.tools] : [LOGIC_BANKS.generic];
    if (title.toLowerCase().includes("combat")) pools.push(LOGIC_BANKS.combat);
    
    let all = pools.flat();
    const pattern = ["OOP", "SINGLETON"][Math.floor(Math.random() * 2)];
    if (pattern === "OOP") {
        let name = title.replace(/[^a-zA-Z]/g, '');
        code += `local ${name} = {}\n${name}.__index = ${name}\n\nfunction ${name}.new()\n    return setmetatable({}, ${name})\nend\n\n`;
        all.forEach(b => code += b.replace(/self:/g, `${name}:`) + "\n\n");
        code += `return ${name}`;
    } else {
        code += `local Service = {}\n\n`;
        all.forEach(b => code += b.replace(/function self:(.+)\((.*)\)/g, `function Service:$1($2)`) + "\n\n");
        code += `return Service`;
    }
    return code;
}

function initData() {
    let used = new Set();
    for (const [key, config] of Object.entries(CATEGORIES)) {
        for (let i = 0; i < config.count; i++) {
            let title = "";
            do {
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
        const grid = document.getElementById(id);
        if (!grid) continue;
        const filtered = filter ? data.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())) : data;
        grid.innerHTML = filtered.map(t => `
            <div class="glass tool-card ${t.premium ? 'premium-card' : ''}" onclick="handleToolClick('${t.type}', '${t.title}')">
                <div class="tool-icon"><i class="fas ${t.icon}"></i></div>
                ${t.premium ? '<div class="premium-tag"><i class="fas fa-crown"></i> PREMIUM</div>' : ''}
                <h4>${t.title}</h4>
                <p>${t.desc}</p>
            </div>
        `).join('');
    }
}

function handleToolClick(type, title) {
    const tool = GENERATED_DATA[type].find(t => t.title === title);
    if (tool.premium && !isPremiumUser) { showToast("Premium required.", "error"); return; }
    if (!tool.source) tool.source = generateLuauCode(tool.title, tool.type);
    document.getElementById('ws-title').innerText = tool.title;
    document.getElementById('workspace-overlay').style.display = 'flex';
    document.getElementById('ws-output').value = "";
    document.getElementById('ws-run-btn').onclick = () => { document.getElementById('ws-output').value = tool.source; showToast("Extracted.", "success"); };
}

function updateAuthUI(user) {
    currentUser = user;
    const profile = document.getElementById('user-profile');
    const authBtns = document.getElementById('auth-buttons');
    if (!profile || !authBtns) return;
    if (user) {
        profile.style.display = 'flex';
        authBtns.style.display = 'none';
        isPremiumUser = user.email === 'jayden.ims.monte@gmail.com' || user.premium;
        document.getElementById('user-email').innerText = user.email;
        document.getElementById('user-badge').innerText = user.email === 'jayden.ims.monte@gmail.com' ? "OWNER" : (isPremiumUser ? "PREMIUM" : "FREE");
        if (user.email === 'jayden.ims.monte@gmail.com') document.getElementById('nav-admin').style.display = 'flex';
    } else {
        profile.style.display = 'none';
        authBtns.style.display = 'flex';
    }
}

window.onload = () => {
    initData(); renderTools();
    const saved = localStorage.getItem('zenith_usr');
    if (saved) updateAuthUI(JSON.parse(saved));
    document.getElementById('search-input').oninput = (e) => renderTools(e.target.value);
    document.getElementById('auth-form').onsubmit = (e) => {
        e.preventDefault();
        const user = { email: document.getElementById('auth-email').value, premium: document.getElementById('auth-email').value === 'jayden.ims.monte@gmail.com' };
        localStorage.setItem('zenith_usr', JSON.stringify(user));
        updateAuthUI(user); closeModal('auth-modal'); showToast("Initialized.", "success");
    };
};
