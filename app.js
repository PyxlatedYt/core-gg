// --- CORE.GG PROFESSIONAL SUITE V7.2 ---
// Credits Who made this: Zenith.gg

const CATEGORIES = {
    modules: { count: 250, icon: 'fa-microchip', prefix: ["Advanced", "Professional", "Global", "System", "Integrated", "Dynamic", "Structural", "Core", "Essential", "Optimized"], suffix: ["Framework", "Engine", "Module", "Wrapper", "Architecture", "Handler", "Manager", "Controller", "Service", "Bridge"] },
    servers: { count: 150, icon: 'fa-server', prefix: ["Backend", "Data", "Economy", "Anti-Cheat", "Validation", "Network", "Database", "Matchmaking", "Synchronization", "Broadcast"], suffix: ["Logic", "Service", "Controller", "Processor", "Validator", "Protocol", "API", "Emitter", "Aggregator", "Storage"] },
    clients: { count: 150, icon: 'fa-desktop', prefix: ["Local", "Camera", "Visual", "Movement", "Combat", "Rendering", "Interface", "Input", "Prediction", "Effect"], suffix: ["Handler", "Manipulator", "Controller", "Visualizer", "System", "Listener", "Manager", "Interceptor", "Reactor", "Renderer"] }
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
        `function self:Init()\n    print("[CORE] Service " .. self.Name .. " initialized.")\n    self.Initialized = true\nend`,
        `function self:OnStart()\n    task.spawn(function()\n        while self.Active do self:Update() task.wait(1) end\n    end)\nend`
    ]
};

const BROADCASTS = [
    "CORE V7.2: Optimization protocols active.",
    "Global cache successfully synchronized.",
    "New premium license activated.",
    "System Status: All nodes operational.",
    "Security Matrix: No anomalies detected.",
    "Database integrity verified.",
    "Session established for user: "
];

const GENERATED_DATA = { modules: [], servers: [], clients: [] };
let isPremiumUser = false;
let currentUser = null;

// --- GLOBAL FUNCTIONS ---
window.switchTab = function(target) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.target === target));
    document.querySelectorAll('.dashboard-section').forEach(s => {
        s.classList.toggle('active', s.id === target);
        s.style.display = s.id === target ? 'block' : 'none';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.openAuth = function() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'flex';
};

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
};

window.signOut = function() {
    localStorage.removeItem('zenith_usr');
    location.reload();
};

window.closeWorkspace = function() {
    const ws = document.getElementById('workspace-overlay');
    if (ws) ws.style.display = 'none';
};

window.copyOutput = function() {
    const output = document.getElementById('ws-output');
    if (output) {
        output.select();
        document.execCommand('copy');
        window.showToast("Copied to clipboard.", "success");
    }
};

window.showToast = function(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    
    let color = 'var(--primary-neon)';
    if (type === 'success') color = 'var(--accent-green)';
    if (type === 'error') color = 'var(--hack-neon)';
    
    toast.style.borderLeftColor = color;
    toast.innerHTML = `<i class="fas fa-info-circle" style="color:${color}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
};

function generateLuauCode(title, type) {
    let hash = Math.random().toString(36).substring(2, 10).toUpperCase();
    let lowerTitle = title.toLowerCase();
    
    let pools = [LOGIC_BANKS.generic, LOGIC_BANKS.utility];
    if (lowerTitle.includes("combat") || lowerTitle.includes("aura") || lowerTitle.includes("titan")) pools.push(LOGIC_BANKS.combat);
    if (lowerTitle.includes("data") || lowerTitle.includes("save") || lowerTitle.includes("nexus")) pools.push(LOGIC_BANKS.data);
    if (lowerTitle.includes("move") || lowerTitle.includes("camera") || lowerTitle.includes("tween")) pools.push(LOGIC_BANKS.movement);
    if (lowerTitle.includes("anti") || lowerTitle.includes("secure") || lowerTitle.includes("verify")) pools.push(LOGIC_BANKS.security);

    let allBlocks = pools.flat();
    let selected = [];
    while (selected.length < 3) {
        let block = allBlocks[Math.floor(Math.random() * allBlocks.length)];
        if (!selected.includes(block)) selected.push(block);
    }

    let code = `-- CORE.GG PROFESSIONAL SUITE\n-- Resource: ${title}\n-- Type: ${type.toUpperCase()}\n-- Hash: ${hash}\n\n`;

    const structures = ["OOP", "FUNCTIONAL", "SINGLETON"];
    const pattern = structures[Math.floor(Math.random() * structures.length)];

    try {
        if (pattern === "OOP") {
            let className = title.replace(/[^a-zA-Z]/g, '');
            code += `local ${className} = {}\n${className}.__index = ${className}\n\n`;
            code += `function ${className}.new()\n    local self = setmetatable({}, ${className})\n    self.Name = "${title}"\n    self.Hash = "${hash}"\n    return self\nend\n\n`;
            selected.forEach(b => code += b.replace(/self:/g, `${className}:`) + "\n\n");
            code += `return ${className}`;
        } else if (pattern === "FUNCTIONAL") {
            let className = title.replace(/[^a-zA-Z]/g, '');
            code += `local ${className} = (function()\n    local exports = {}\n    \n`;
            selected.forEach((b, i) => {
                let match = b.match(/function self:(.+)\(/);
                if (match) {
                    code += b.replace(/function self:(.+)\(/g, `local function method_${i}(`) + "\n\n";
                    code += `    exports.${match[1]} = method_${i}\n`;
                }
            });
            code += `    \n    return exports\nend)()\n\nreturn ${className}`;
        } else {
            code += `local Service = {\n    Name = "${title}",\n    Hash = "${hash}",\n    Active = true\n}\n\n`;
            selected.forEach(b => {
                code += b.replace(/function self:(.+)\((.*)\)/g, `function Service:$1($2)`) + "\n\n";
            });
            code += `return Service`;
        }
    } catch (e) {
        code += `-- Error generating structural pattern: ${e.message}\nreturn {}`;
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
                title = `${p} ${s}`;
            } while (titles.has(title));
            titles.add(title);

            GENERATED_DATA[key].push({
                title: title,
                desc: `Professional ${key} implementation for high-performance applications.`,
                icon: config.icon,
                premium: Math.random() < 0.85,
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
                ${t.premium ? '<div class="premium-tag"><i class="fas fa-crown"></i> PREMIUM</div>' : ''}
                <h4>${t.title}</h4>
                <p>${t.desc}</p>
            `;
            card.onclick = () => {
                if (t.premium && !isPremiumUser) {
                    window.showToast("Premium license required.", "error");
                    return;
                }
                openWorkspace(t);
            };
            grid.appendChild(card);
        });
    }
}

function openWorkspace(tool) {
    const wsTitle = document.getElementById('ws-title');
    const wsDesc = document.getElementById('ws-desc');
    const wsOverlay = document.getElementById('workspace-overlay');
    const wsOutput = document.getElementById('ws-output');
    const runBtn = document.getElementById('ws-run-btn');

    if (wsTitle) wsTitle.innerText = tool.title;
    if (wsDesc) wsDesc.innerText = "Source Code Preview";
    if (wsOverlay) wsOverlay.style.display = 'flex';
    if (wsOutput) wsOutput.value = "";
    
    if (runBtn) {
        runBtn.onclick = () => {
            if (wsOutput) wsOutput.value = tool.source;
            window.showToast("Source code generated.", "success");
            addActivity(`Retrieved ${tool.title}`);
        };
    }
}

function addActivity(text) {
    const list = document.getElementById('recent-activity-list');
    if (!list) return;
    const item = document.createElement('div');
    item.style.cssText = "padding: 0.8rem; border-bottom: 1px solid var(--glass-border); font-size: 0.85rem; color: var(--text-dim);";
    item.innerHTML = `<span style="color: var(--primary-neon); font-weight:700;">[INFO]</span> ${text}`;
    list.prepend(item);
    if (list.children.length > 8) list.lastChild.remove();
}

function startBroadcasts() {
    const ticker = document.getElementById('system-ticker');
    if (!ticker) return;
    let index = 0;
    setInterval(() => {
        ticker.style.opacity = '0';
        setTimeout(() => {
            ticker.innerText = BROADCASTS[index] + (currentUser ? currentUser.email : "");
            ticker.style.opacity = '1';
            index = (index + 1) % BROADCASTS.length;
        }, 500);
    }, 15000);
}

function updateAuthUI(user) {
    currentUser = user;
    const profile = document.getElementById('user-profile');
    const authBtns = document.getElementById('auth-buttons');
    const adminNav = document.getElementById('nav-admin');

    if (!profile || !authBtns) return;

    if (user) {
        profile.style.display = 'flex';
        authBtns.style.display = 'none';
        isPremiumUser = user.email === 'jayden.ims.monte@gmail.com' || user.premium;
        
        const emailEl = document.getElementById('user-email');
        const badgeEl = document.getElementById('user-badge');
        
        if (emailEl && badgeEl) {
            if (user.email === 'jayden.ims.monte@gmail.com') {
                emailEl.innerHTML = `${user.email} <span style="color: var(--hack-neon);">[OWNER]</span>`;
                badgeEl.innerText = "OWNER";
                badgeEl.style.color = "var(--hack-neon)";
                if (adminNav) adminNav.style.display = 'flex';
            } else if (isPremiumUser) {
                emailEl.innerHTML = `${user.email} <span style="color: var(--accent-gold);">[PREMIUM]</span>`;
                badgeEl.innerText = "CORE PREMIUM";
                badgeEl.style.color = "var(--accent-gold)";
            } else {
                emailEl.innerText = user.email;
                badgeEl.innerText = "FREE USER";
            }
        }
    } else {
        profile.style.display = 'none';
        authBtns.style.display = 'flex';
        if (adminNav) adminNav.style.display = 'none';
        isPremiumUser = false;
    }
}

window.onload = () => {
    initData();
    renderTools();
    startBroadcasts();
    
    const saved = localStorage.getItem('zenith_usr');
    if (saved) updateAuthUI(JSON.parse(saved));

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.oninput = (e) => renderTools(e.target.value);
    
    document.querySelectorAll('.nav-item').forEach(i => {
        i.onclick = () => { if(i.dataset.target) window.switchTab(i.dataset.target); };
    });

    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            const user = { email, premium: email === 'jayden.ims.monte@gmail.com' };
            localStorage.setItem('zenith_usr', JSON.stringify(user));
            updateAuthUI(user);
            window.closeModal('auth-modal');
            window.showToast("Authentication successful.", "success");
        };
    }
};
