// --- ZENITH.GG V7.1 ELITE ENGINE ---
// Credits Who made this: Zenith.gg

const CATEGORIES = {
    modules: { count: 250, icon: 'fa-microchip', prefix: ["Elite", "Nexus", "Quantum", "Spectral", "Titan", "Phantom", "Aura", "Prime", "Void", "Nova"], suffix: ["Framework", "Engine", "Module", "Wrapper", "System", "Handler", "Manager", "Controller", "Bridge", "Core", "Provider", "Utility"] },
    servers: { count: 150, icon: 'fa-server', prefix: ["Backend", "Data", "Economy", "Anti-Cheat", "Secure", "Cloud", "Network", "Socket", "Database", "Matchmaker"], suffix: ["Service", "Controller", "Processor", "Validator", "Sync", "Router", "API", "Broadcaster", "Listener", "Emitter", "Aggregator"] },
    clients: { count: 150, icon: 'fa-desktop', prefix: ["Local", "Camera", "Visual", "Movement", "Combat", "Render", "HUD", "VFX", "Input", "Tween", "Predictor"], suffix: ["Handler", "Manipulator", "Controller", "Predictor", "VFX", "Interface", "Emitter", "Listener", "Manager", "Interceptor"] }
};

const LOGIC_BANKS = {
    combat: [
        `function self:CastRaycastHitbox()\n    local params = RaycastParams.new()\n    params.FilterDescendantsInstances = {self.Player.Character}\n    params.FilterType = Enum.RaycastFilterType.Exclude\n    local result = workspace:Raycast(self.Origin, self.Direction * self.Range, params)\n    if result then self:OnHit(result.Instance) end\nend`,
        `function self:CheckOverlap()\n    local params = OverlapParams.new()\n    params.FilterType = Enum.RaycastFilterType.Exclude\n    local targets = workspace:GetPartBoundsInBox(self.HitboxCF, self.HitboxSize, params)\n    for _, part in pairs(targets) do self:ProcessHit(part) end\nend`,
        `function self:ApplyImpulse(target, strength)\n    local root = target:FindFirstChild("HumanoidRootPart")\n    if root then root:ApplyImpulse(self.Root.CFrame.LookVector * strength) end\nend`
    ],
    data: [
        `local DataStore2 = require(1936396537)\nfunction self:GetBalance(player)\n    local store = DataStore2("Balance", player)\n    return store:Get(self.DefaultBalance)\nend`,
        `function self:SaveAsync(key, data)\n    local success, err = pcall(function()\n        return self.Store:UpdateAsync(key, function(old)\n            local new = old or {}\n            for k,v in pairs(data) do new[k] = v end\n            return new\n        end)\n    end)\n    return success\nend`,
        `local ProfileService = require(script.ProfileService)\nfunction self:LoadProfile(player)\n    local profile = self.Store:LoadProfileAsync("Player_" .. player.UserId)\n    if profile then profile:Reconcile() return profile end\nend`
    ],
    movement: [
        `function self:Dash(direction)\n    local bv = Instance.new("LinearVelocity")\n    bv.VectorVelocity = direction * 50\n    bv.MaxForce = 100000\n    bv.Parent = self.Root\n    task.wait(0.2)\n    bv:Destroy()\nend`,
        `function self:UpdateCamera(dt)\n    local targetCF = self.Subject.CFrame * self.Offset\n    self.Camera.CFrame = self.Camera.CFrame:Lerp(targetCF, dt * self.LerpSpeed)\nend`,
        `function self:SmoothTilt(angle)\n    local target = CFrame.Angles(0, 0, math.rad(angle))\n    self.Root.RootJoint.C0 = self.Root.RootJoint.C0:Lerp(self.DefaultC0 * target, 0.1)\nend`
    ],
    security: [
        `function self:VerifyPacket(player, data)\n    local timestamp = data.T\n    if os.clock() - timestamp > 0.5 then self:Flag(player, "Latency Spoof") return false end\n    return true\nend`,
        `function self:CheckHumanoid(player)\n    local hum = player.Character:FindFirstChildOfClass("Humanoid")\n    if hum.WalkSpeed > 25 or hum.JumpPower > 60 then self:Ban(player, "Stat Modification") end\nend`,
        `function self:HeartbeatCheck()\n    local now = tick()\n    if self.LastPing and now - self.LastPing > 10 then self:Disconnect() end\n    self.LastPing = now\nend`
    ],
    utility: [
        `function self:DeepCopy(t)\n    local copy = {}\n    for k, v in pairs(t) do\n        copy[k] = (type(v) == "table") and self:DeepCopy(v) or v\n    end\n    return copy\nend`,
        `local Signal = {}\nSignal.__index = Signal\nfunction Signal.new()\n    return setmetatable({_bindable = Instance.new("BindableEvent")}, Signal)\nend\nfunction Signal:Fire(...) self._bindable:Fire(...) end`,
        `function self:FormatNumber(n)\n    return tostring(n):reverse():gsub("%d%d%d", "%1,"):reverse():gsub("^,", "")\nend`
    ],
    generic: [
        `function self:Init()\n    print("[ZENITH] Service " .. self.Name .. " active.")\n    self.Initialized = true\nend`,
        `function self:OnStart()\n    task.spawn(function()\n        while self.Active do self:Update() task.wait(1) end\n    end)\nend`
    ]
};

const BROADCASTS = [
    "ZENITH V7.1: New Quantum Modules deployed successfully.",
    "Global Cache purged. Performance increased by 15%.",
    "Elite License #ZNTH-8291 redeemed by user Jayden.",
    "System Status: All 550+ nodes operational.",
    "Security Matrix: No intrusions detected in last 24h.",
    "Update: Improved Luau Script Generation uniqueness.",
    "Boss Mode: Jayden.ims.monte@gmail.com detected online."
];

const GENERATED_DATA = { modules: [], servers: [], clients: [] };
let isPremiumUser = false;
let currentUser = null;

function generateLuauCode(title, type) {
    let hash = Math.random().toString(36).substring(2, 10).toUpperCase();
    let lowerTitle = title.toLowerCase();
    
    // Select category blocks
    let pools = [LOGIC_BANKS.generic, LOGIC_BANKS.utility];
    if (lowerTitle.includes("combat") || lowerTitle.includes("aura") || lowerTitle.includes("titan")) pools.push(LOGIC_BANKS.combat);
    if (lowerTitle.includes("data") || lowerTitle.includes("save") || lowerTitle.includes("nexus")) pools.push(LOGIC_BANKS.data);
    if (lowerTitle.includes("move") || lowerTitle.includes("camera") || lowerTitle.includes("tween")) pools.push(LOGIC_BANKS.movement);
    if (lowerTitle.includes("anti") || lowerTitle.includes("secure") || lowerTitle.includes("verify")) pools.push(LOGIC_BANKS.security);

    // Flatten and pick 3-4 unique blocks
    let allBlocks = pools.flat();
    let selected = [];
    while (selected.length < 3) {
        let block = allBlocks[Math.floor(Math.random() * allBlocks.length)];
        if (!selected.includes(block)) selected.push(block);
    }

    let code = `-- ZENITH.GG ELITE SUITE V7.1\n-- Build: ${title}\n-- Type: ${type.toUpperCase()}\n-- Node: ${hash}\n\n`;

    if (type === 'modules') {
        let className = title.replace(/[^a-zA-Z]/g, '');
        code += `local ${className} = {}\n${className}.__index = ${className}\n\n`;
        code += `function ${className}.new()\n    local self = setmetatable({}, ${className})\n    self.Name = "${title}"\n    self.Id = "${hash}"\n    return self\nend\n\n`;
        selected.forEach(b => code += b.replace(/self:/g, `${className}:`) + "\n\n");
        code += `return ${className}`;
    } else if (type === 'servers') {
        code += `local Players = game:GetService("Players")\nlocal RunService = game:GetService("RunService")\n\n`;
        code += `-- Server initialization for ${title}\n\n`;
        selected.forEach(b => code += b.replace(/function self:/g, `local function `) + "\n\n");
        code += `Players.PlayerAdded:Connect(function(player)\n    print("ZENITH: Initializing ${hash} for " .. player.Name)\nend)`;
    } else {
        code += `local LocalPlayer = game.Players.LocalPlayer\nlocal UserInputService = game:GetService("UserInputService")\n\n`;
        code += `-- Client controller for ${title}\n\n`;
        selected.forEach(b => code += b.replace(/function self:/g, `local function `) + "\n\n");
        code += `print("[ZENITH_${hash}] Controller Active: ${title}")`;
    }
    
    return code;
}

function initData() {
    let titles = new Set();
    for (const [key, config] of Object.entries(CATEGORIES)) {
        for (let i = 0; i < config.count; i++) {
            let title = "";
            do {
                let p = config.prefix[Math.floor(Math.random() * config.prefix.length)];
                let s = config.suffix[Math.floor(Math.random() * config.suffix.length)];
                let v = `V${Math.floor(Math.random()*9)+1}.${Math.floor(Math.random()*99)}`;
                title = `${p} ${s} ${v}`;
            } while (titles.has(title));
            titles.add(title);

            GENERATED_DATA[key].push({
                title: title,
                desc: `Elite ${key} implementation. Built for high-concurrency games. Build ID: ${title.split(' ')[2]}`,
                icon: config.icon,
                premium: Math.random() < 0.8, // 80% premium
                source: generateLuauCode(title, key)
            });
        }
    }
}

function renderTools(filter = "") {
    const sections = {
        'core-modules-grid': GENERATED_DATA.modules,
        'server-scripts-grid': GENERATED_DATA.servers,
        'client-scripts-grid': GENERATED_DATA.clients
    };

    for (const [gridId, data] of Object.entries(sections)) {
        const grid = document.getElementById(gridId);
        if (!grid) continue;
        grid.innerHTML = '';
        
        const filtered = data.filter(t => 
            t.title.toLowerCase().includes(filter.toLowerCase()) || 
            t.desc.toLowerCase().includes(filter.toLowerCase())
        );

        filtered.forEach(t => {
            const card = document.createElement('div');
            card.className = `glass tool-card ${t.premium ? 'premium-card' : ''} animate-in`;
            card.innerHTML = `
                <div class="tool-icon"><i class="fas ${t.icon}"></i></div>
                ${t.premium ? '<div class="premium-tag"><i class="fas fa-crown"></i> ELITE</div>' : ''}
                <h4>${t.title}</h4>
                <p>${t.desc}</p>
            `;
            card.onclick = () => {
                if (t.premium && !isPremiumUser) {
                    showToast("ELITE LICENSE REQUIRED, GNG!", "error");
                    return;
                }
                openWorkspace(t);
            };
            grid.appendChild(card);
        });
    }
}

function openWorkspace(tool) {
    document.getElementById('ws-title').innerText = tool.title;
    document.getElementById('ws-desc').innerText = "ZENITH Source Extraction Area";
    document.getElementById('workspace-overlay').style.display = 'flex';
    document.getElementById('ws-output').value = "";
    
    document.getElementById('ws-run-btn').onclick = () => {
        document.getElementById('ws-output').value = tool.source;
        showToast("SOURCE INJECTED SUCCESSFULLY, FIRE AS FUCK LMAO", "success");
        addActivity(`Extracted ${tool.title}`);
    };
}

function addActivity(text) {
    const list = document.getElementById('recent-activity-list');
    if (!list) return;
    const item = document.createElement('div');
    item.style.cssText = "padding: 0.8rem; border-bottom: 1px solid var(--glass-border); font-size: 0.85rem; color: var(--text-dim);";
    item.innerHTML = `<span style="color: var(--primary-neon); font-weight:700;">[LOG]</span> ${text}`;
    list.prepend(item);
    if (list.children.length > 8) list.lastChild.remove();
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    
    let color = 'var(--primary-neon)';
    if (type === 'success') color = 'var(--accent-green)';
    if (type === 'error') color = 'var(--hack-neon)';
    
    toast.style.borderLeftColor = color;
    toast.innerHTML = `<i class="fas fa-bolt" style="color:${color}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function startBroadcasts() {
    const ticker = document.getElementById('system-ticker');
    if (!ticker) return;
    let index = 0;
    setInterval(() => {
        ticker.style.opacity = '0';
        setTimeout(() => {
            ticker.innerText = BROADCASTS[index];
            ticker.style.opacity = '1';
            index = (index + 1) % BROADCASTS.length;
        }, 500);
    }, 10000); // 10 seconds cycle
}

function updateAuthUI(user) {
    currentUser = user;
    const profile = document.getElementById('user-profile');
    const authBtns = document.getElementById('auth-buttons');
    const adminNav = document.getElementById('nav-admin');

    if (user) {
        profile.style.display = 'flex';
        authBtns.style.display = 'none';
        isPremiumUser = user.email === 'jayden.ims.monte@gmail.com' || user.premium;
        
        const emailEl = document.getElementById('user-email');
        const badgeEl = document.getElementById('user-badge');
        
        if (user.email === 'jayden.ims.monte@gmail.com') {
            emailEl.innerHTML = `${user.email} <span style="color: var(--hack-neon);">[OWNER]</span>`;
            badgeEl.innerText = "GOD TIER";
            badgeEl.style.color = "var(--hack-neon)";
            adminNav.style.display = 'flex';
        } else if (isPremiumUser) {
            emailEl.innerHTML = `${user.email} <span style="color: var(--accent-gold);">[ELITE]</span>`;
            badgeEl.innerText = "ZENITH ULTIMATE";
            badgeEl.style.color = "var(--accent-gold)";
        } else {
            emailEl.innerText = user.email;
            badgeEl.innerText = "FREE TIER";
        }
    } else {
        profile.style.display = 'none';
        authBtns.style.display = 'flex';
        adminNav.style.display = 'none';
        isPremiumUser = false;
    }
}

window.onload = () => {
    initData();
    renderTools();
    startBroadcasts();
    
    const saved = localStorage.getItem('zenith_usr');
    if (saved) updateAuthUI(JSON.parse(saved));

    document.getElementById('search-input').oninput = (e) => renderTools(e.target.value);
    
    document.querySelectorAll('.nav-item').forEach(i => {
        i.onclick = () => { if(i.dataset.target) switchTab(i.dataset.target); };
    });

    document.getElementById('auth-form').onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const user = { email, premium: email === 'jayden.ims.monte@gmail.com' };
        localStorage.setItem('zenith_usr', JSON.stringify(user));
        updateAuthUI(user);
        document.getElementById('auth-modal').style.display = 'none';
        showToast("LOGGED IN, LMAO FUCK YEAH", "success");
    };
};

function switchTab(target) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.target === target));
    document.querySelectorAll('.dashboard-section').forEach(s => {
        s.classList.toggle('active', s.id === target);
        s.style.display = s.id === target ? 'block' : 'none';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function signOut() {
    localStorage.removeItem('zenith_usr');
    location.reload();
}

function closeWorkspace() {
    document.getElementById('workspace-overlay').style.display = 'none';
}

function copyOutput() {
    const output = document.getElementById('ws-output');
    output.select();
    document.execCommand('copy');
    showToast("COPIED TO CLIPBOARD, GNG", "success");
}

function openAuth() {
    document.getElementById('auth-modal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}
