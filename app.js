// --- CORE.GG PROFESSIONAL SUITE V7.7 (GOD-TIER GENERATION) ---
// Credits Who made this: Zenith.gg

const CATEGORIES = {
    modules: { count: 80, icon: 'fa-microchip', prefix: ["Advanced", "System", "Integrated", "Core", "Essential", "Optimized", "Global", "Dynamic", "Structural", "Nexus"], suffix: ["Framework", "Engine", "Module", "Wrapper", "Handler", "Manager", "Service", "Bridge", "Architecture", "Protocol"] },
    servers: { count: 60, icon: 'fa-server', prefix: ["Backend", "Data", "Economy", "Secure", "Network", "Validation", "Synchronization", "Database", "Matchmaking", "Relay"], suffix: ["Logic", "Service", "Processor", "Validator", "API", "Emitter", "Aggregator", "Storage", "Controller", "Bridge"] },
    clients: { count: 60, icon: 'fa-desktop', prefix: ["Local", "Camera", "Visual", "Movement", "Combat", "Rendering", "Interface", "Input", "Prediction", "Effect"], suffix: ["Handler", "Controller", "Visualizer", "Manager", "Interceptor", "Reactor", "Renderer", "Listener", "Manipulator", "System"] },
    tools: { count: 40, icon: 'fa-tools', prefix: ["LBI", "Luau", "XOR", "Minifier", "Beautifier", "Deobfuscator", "Obfuscator", "Decompiler", "Encryption", "String"], suffix: ["Suite", "Tool", "Utility", "Processor", "Converter", "Hardener", "Analyzer", "Refactorer", "Optimizer", "Encoder"] }
};

const LOGIC_BANKS = {
    combat: [
        `function self:CastRaycastHitbox(origin, direction, range)\n    local params = RaycastParams.new()\n    params.FilterDescendantsInstances = {self.Player.Character}\n    params.FilterType = Enum.RaycastFilterType.Exclude\n    local result = workspace:Raycast(origin, direction * range, params)\n    if result then self:HandleHit(result.Instance, result.Position) end\nend`,
        `function self:CheckMagnitude(target)\n    local dist = (self.Root.Position - target.Position).Magnitude\n    if dist <= self.AttackRange then return true end\n    return false\nend`,
        `function self:ApplyKnockback(target, power)\n    local velocity = Instance.new("BodyVelocity")\n    velocity.Velocity = (target.Position - self.Root.Position).Unit * power\n    velocity.MaxForce = Vector3.new(100000, 100000, 100000)\n    velocity.Parent = target\n    task.wait(0.15)\n    velocity:Destroy()\nend`
    ],
    data: [
        `function self:LoadData(player)\n    local key = "Player_" .. player.UserId\n    local success, data = pcall(function() return self.Store:GetAsync(key) end)\n    if success then self.SessionData[player] = data or self.Default end\nend`,
        `function self:UpdateValue(player, key, val)\n    if self.SessionData[player] then\n        self.SessionData[player][key] = val\n        self.Signals.DataUpdated:Fire(player, key, val)\n    end\nend`,
        `function self:Reconcile(data, template)\n    for k, v in pairs(template) do\n        if data[k] == nil then data[k] = v end\n    end\n    return data\nend`
    ],
    network: [
        `function self:FireClient(player, action, ...)\n    self.Remote:FireClient(player, {A = action, P = {...}})\nend`,
        `function self:OnServerEvent(player, packet)\n    if not self:Validate(player, packet) then return end\n    local handler = self.Handlers[packet.A]\n    if handler then handler(player, unpack(packet.P)) end\nend`,
        `function self:Broadcast(packet)\n    for _, player in pairs(game.Players:GetPlayers()) do\n        self:FireClient(player, packet)\n    end\nend`
    ],
    camera: [
        `function self:SmoothTween(targetCF, duration)\n    local tween = self.TweenService:Create(self.Camera, TweenInfo.new(duration), {CFrame = targetCF})\n    tween:Play()\n    return tween\nend`,
        `function self:Shake(intensity)\n    task.spawn(function()\n        for i = 1, 10 do\n            self.Camera.CFrame *= CFrame.Angles(math.rad(math.random(-intensity, intensity)), 0, 0)\n            task.wait(0.05)\n        end\n    end)\nend`
    ],
    security: [
        `function self:DetectAntiCheat(player)\n    local char = player.Character\n    if char and char:FindFirstChild("Humanoid").WalkSpeed > 25 then\n        self:Flag(player, "SpeedHack")\n    end\nend`,
        `function self:VerifyHash(input, expected)\n    local hash = self.HashService:Generate(input)\n    return hash == expected\nend`
    ],
    tools: [
        `function self:ProcessBytecode(source)\n    local stream = self.Stream.new(source)\n    local header = stream:ReadBytes(4)\n    if header ~= "\\x1bLuau" then return nil, "Invalid Bytecode" end\n    return self:Decompile(stream)\nend`,
        `function self:ObfuscateStrings(tbl)\n    for k, v in pairs(tbl) do\n        if type(v) == "string" then tbl[k] = self:Encrypt(v) end\n    end\nend`,
        `function self:Minify(code)\n    return code:gsub("%s+", " "):gsub("%-%-.-\\n", ""):gsub("%-%-%[%[.-%]%]", "")\nend`
    ],
    economy: [
        `function self:AddCurrency(player, amount)\n    local profile = self:GetProfile(player)\n    if profile then profile.Data.Balance += amount end\nend`,
        `function self:PurchaseItem(player, itemId)\n    local cost = self.Registry[itemId].Cost\n    if self:GetBalance(player) >= cost then self:Deduct(player, cost) return true end\n    return false\nend`
    ],
    ai: [
        `function self:Pathfind(destination)\n    local path = self.PathService:CreatePath({AgentCanJump = true})\n    path:ComputeAsync(self.Root.Position, destination)\n    return path:GetWaypoints()\nend`,
        `function self:FindNearestTarget()\n    local best, dist = nil, math.huge\n    for _, enemy in pairs(self.Enemies) do\n        local d = (self.Root.Position - enemy.Position).Magnitude\n        if d < dist then best, dist = enemy, d end\n    end\n    return best\nend`
    ],
    generic: [
        `function self:Init()\n    print("[CORE] Service " .. self.Name .. " initialized.")\n    self.Active = true\nend`,
        `function self:Shutdown()\n    self.Active = false\n    print("[CORE] Cleanup complete.")\nend`
    ]
};

const GENERATED_DATA = { modules: [], servers: [], clients: [], tools: [] };
let isPremiumUser = false;
let currentUser = null;
let activeLicenses = JSON.parse(localStorage.getItem('core_licenses') || '[]');
let stats = JSON.parse(localStorage.getItem('core_stats') || '{"extractions": 0, "session_traffic": 0}');

// --- INTELLIGENT GENERATOR ---
function generateLuauCode(title, type) {
    let lower = title.toLowerCase();
    let code = `-- CORE.GG PROFESSIONAL SUITE\n-- Resource: ${title}\n-- Type: ${type.toUpperCase()}\n-- Generated for: ${currentUser ? currentUser.email : "Guest"}\n\n`;
    
    // Select logic based on title keywords
    let selectedBlocks = [...LOGIC_BANKS.generic];
    if (lower.includes("combat")) selectedBlocks.push(...LOGIC_BANKS.combat);
    else if (lower.includes("data") || lower.includes("store")) selectedBlocks.push(...LOGIC_BANKS.data);
    else if (lower.includes("network") || lower.includes("relay") || lower.includes("api")) selectedBlocks.push(...LOGIC_BANKS.network);
    else if (lower.includes("camera") || lower.includes("visual") || lower.includes("rendering")) selectedBlocks.push(...LOGIC_BANKS.camera);
    else if (lower.includes("secure") || lower.includes("valid") || lower.includes("hardener")) selectedBlocks.push(...LOGIC_BANKS.security);
    else if (lower.includes("economy") || lower.includes("matchmaking")) selectedBlocks.push(...LOGIC_BANKS.economy);
    else if (lower.includes("path") || lower.includes("nexus") || lower.includes("dynamic")) selectedBlocks.push(...LOGIC_BANKS.ai);
    
    if (type === 'tools' || lower.includes("obfuscator") || lower.includes("decompiler") || lower.includes("minifier")) {
        selectedBlocks.push(...LOGIC_BANKS.tools);
    }

    // Structure selection
    const pattern = ["OOP", "SINGLETON", "FUNCTIONAL"][Math.floor(Math.random() * 3)];
    let name = title.replace(/[^a-zA-Z]/g, '');

    if (pattern === "OOP") {
        code += `local ${name} = {}\n${name}.__index = ${name}\n\n`;
        code += `function ${name}.new(...)\n    local self = setmetatable({}, ${name})\n    self.Name = "${title}"\n    self:Init(...)\n    return self\nend\n\n`;
        selectedBlocks.forEach(b => code += b.replace(/function self:/g, `function ${name}:`) + "\n\n");
        code += `return ${name}`;
    } else if (pattern === "SINGLETON") {
        code += `local ${name} = {}\n${name}.Active = false\n\n`;
        selectedBlocks.forEach(b => code += b.replace(/function self:/g, `function ${name}:`) + "\n\n");
        code += `return ${name}`;
    } else {
        code += `local Service = { _VERSION = "CORE.7.7" }\n\n`;
        selectedBlocks.forEach((b, i) => {
            let match = b.match(/function self:(.+)\(/);
            if (match) {
                code += b.replace(/function self:(.+)\(/g, `local function method_${i}(`) + "\n\n";
                code += `Service.${match[1]} = method_${i}\n`;
            }
        });
        code += `\nreturn Service`;
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

function updateRealTimeStats() {
    stats.session_traffic += Math.floor(Math.random() * 5);
    localStorage.setItem('core_stats', JSON.stringify(stats));
    const eCount = document.getElementById('stat-extractions'); if (eCount) eCount.innerText = stats.extractions;
    const age = document.getElementById('stat-age'); if (age && currentUser && currentUser.created_at) {
        let d = Math.floor((Date.now() - currentUser.created_at)/(1000*60*60*24)); age.innerText = `${d}d active`;
    }
    const traffic = document.getElementById('admin-traffic'); if (traffic) traffic.innerText = `${(stats.session_traffic/10).toFixed(1)}k`;
    const nodes = document.getElementById('admin-nodes'); if (nodes) nodes.innerText = 124 + activeLicenses.length;
}

window.updateEditorSettings = function() {
    const size = document.getElementById('editor-font-size').value;
    const output = document.getElementById('ws-output');
    if (output) output.style.fontSize = size;
    window.showToast("Updated.", "success");
};

window.saveWebhook = function() {
    const url = document.getElementById('webhook-url').value;
    if (url) { localStorage.setItem('core_webhook', url); window.showToast("Saved.", "success"); }
};

window.generateLicense = function() {
    const dur = document.getElementById('license-duration').value;
    const key = `CORE-${Math.random().toString(36).substring(2,6).toUpperCase()}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    activeLicenses.push({ key, duration: dur, created: new Date().toLocaleDateString() });
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
        <div class="glass" style="padding: 1rem; margin-bottom: 0.8rem; display: flex; justify-content: space-between; align-items: center;">
            <div><p style="font-family: monospace; font-weight: 800; color: var(--primary-neon);">${l.key}</p><p style="font-size: 0.7rem; color: var(--text-dim);">${l.duration}</p></div>
            <button class="btn" style="padding: 0.5rem 1rem; color: var(--hack-neon);" onclick="revokeLicense('${l.key}')">Revoke</button>
        </div>
    `).join('') || '<p style="color:var(--text-dim); text-align:center;">No licenses.</p>';
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
        const grid = document.getElementById(id); if (!grid) continue;
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

window.onload = () => {
    initData(); renderTools(); renderLicenses();
    const saved = localStorage.getItem('zenith_usr');
    if (saved) updateAuthUI(JSON.parse(saved)); else updateAuthUI(null);
    const search = document.getElementById('search-input'); if (search) search.oninput = (e) => renderTools(e.target.value);
    const form = document.getElementById('auth-form');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const u = { email: document.getElementById('auth-email').value, premium: document.getElementById('auth-email').value === 'jayden.ims.monte@gmail.com', created_at: Date.now() };
            localStorage.setItem('zenith_usr', JSON.stringify(u));
            updateAuthUI(u); closeModal('auth-modal'); window.showToast("Welcome.", "success"); updateRealTimeStats();
        };
    }
    updateRealTimeStats();
};
