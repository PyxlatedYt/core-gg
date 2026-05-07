// --- ZENITH.GG CORE V7 ENGINE ---
// Credits Who made this: Zenith.gg

const CATEGORIES = {
    modules: { count: 250, icon: 'fa-microchip', prefix: ["Core", "Advanced", "Elite", "Dynamic", "Procedural", "Secure", "Quantum", "Nexus", "Titan", "Phantom", "Spectral"], suffix: ["Framework", "Engine", "Module", "Wrapper", "System", "Handler", "Manager", "Controller", "Bridge", "Core"] },
    servers: { count: 150, icon: 'fa-server', prefix: ["Backend", "Data", "Economy", "Anti-Cheat", "Ban", "Validation", "Network", "Datastore", "Matchmaking", "Webhook"], suffix: ["Service", "Controller", "Processor", "Validator", "Sync", "Router", "API", "Broadcaster", "Listener"] },
    clients: { count: 150, icon: 'fa-desktop', prefix: ["Local", "Camera", "Input", "Visual", "Movement", "Combat", "Render", "UI", "HUD", "Viewport", "Input"], suffix: ["Handler", "Manipulator", "Predictor", "VFX", "Controller", "Interceptor", "Client", "Listener", "Emitter"] }
};

const LOGIC_BANKS = {
    combat: [
        `function Combat:CastHitbox(params)\n    local region = Region3.new(params.Pos - Vector3.new(5,5,5), params.Pos + Vector3.new(5,5,5))\n    local targets = workspace:FindPartsInRegion3(region, nil, 100)\n    for _, part in pairs(targets) do\n        local hum = part.Parent:FindFirstChild("Humanoid")\n        if hum and hum.Health > 0 then self:ApplyDamage(hum) end\n    end\nend`,
        `function Combat:ApplyKnockback(target, force)\n    local bv = Instance.new("BodyVelocity")\n    bv.Velocity = force\n    bv.MaxForce = Vector3.new(1,1,1) * 50000\n    bv.Parent = target.PrimaryPart\n    game.Debris:AddItem(bv, 0.1)\nend`
    ],
    data: [
        `local DataStoreService = game:GetService("DataStoreService")\nlocal PlayerData = DataStoreService:GetDataStore("GlobalData_V1")\n\nfunction Data:Save(player, data)\n    local success, err = pcall(function()\n        PlayerData:SetAsync(tostring(player.UserId), data)\n    end)\n    return success\nend`,
        `function Data:Load(player)\n    local success, data = pcall(function()\n        return PlayerData:GetAsync(tostring(player.UserId))\n    end)\n    return data or self.DefaultTemplate\nend`
    ],
    movement: [
        `function Movement:ApplyDash(dir)\n    local hrp = self.Player.Character.HumanoidRootPart\n    hrp.CFrame = hrp.CFrame + (dir * 15)\n    local vfx = self:CreateDashVFX()\nend`,
        `RunService.Heartbeat:Connect(function(dt)\n    if self.IsSprinting then\n        self.Humanoid.WalkSpeed = 25\n    else\n        self.Humanoid.WalkSpeed = 16\n    end\nend)`
    ],
    security: [
        `function Security:ValidateRemote(player, key)\n    if key ~= self.PrivateKey then\n        warn("[CORE] Unauthorized remote call from " .. player.Name)\n        return false\n    end\n    return true\nend`,
        `function Security:CheckSpeedhack(player)\n    local speed = player.Character.HumanoidRootPart.AssemblyLinearVelocity.Magnitude\n    if speed > 100 then self:FlagPlayer(player, "Speedhack") end\nend`
    ],
    generic: [
        `function self:Init()\n    print("[ZENITH] " .. self.Name .. " Initialized.")\n    self.Active = true\nend`,
        `function self:Dispose()\n    self.Active = false\n    setmetatable(self, nil)\nend`
    ]
};

const GENERATED_DATA = { modules: [], servers: [], clients: [] };
let isPremiumUser = false;
let currentUser = null;

function generateLuauCode(title, type) {
    let hash = Math.random().toString(36).substring(2, 8).toUpperCase();
    let code = `-- ZENITH.GG CORE V7\n-- Module: ${title}\n-- Hash: ${hash}\n\n`;
    
    let blocks = [...LOGIC_BANKS.generic];
    const lowerTitle = title.toLowerCase();
    
    if (lowerTitle.includes("combat") || lowerTitle.includes("hitbox")) blocks = [...blocks, ...LOGIC_BANKS.combat];
    if (lowerTitle.includes("data") || lowerTitle.includes("economy") || lowerTitle.includes("save")) blocks = [...blocks, ...LOGIC_BANKS.data];
    if (lowerTitle.includes("move") || lowerTitle.includes("dash") || lowerTitle.includes("camera")) blocks = [...blocks, ...LOGIC_BANKS.movement];
    if (lowerTitle.includes("anti") || lowerTitle.includes("security") || lowerTitle.includes("check")) blocks = [...blocks, ...LOGIC_BANKS.security];

    if (type === 'modules') {
        code += `local ${title.replace(/[^a-zA-Z]/g, '')} = {}\n\n`;
        blocks.forEach(b => code += b + "\n\n");
        code += `return ${title.replace(/[^a-zA-Z]/g, '')}`;
    } else {
        code += `local RunService = game:GetService("RunService")\nlocal Players = game:GetService("Players")\n\n`;
        blocks.forEach(b => code += b + "\n\n");
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
                let v = `V${Math.floor(Math.random()*5)+1}.${Math.floor(Math.random()*10)}`;
                title = `${p} ${s} ${v}`;
            } while (titles.has(title));
            titles.add(title);

            GENERATED_DATA[key].push({
                title: title,
                desc: `Elite ${key} implementation. Built for high-concurrency games.`,
                icon: config.icon,
                premium: Math.random() < 0.7,
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
            card.className = `glass tool-card ${t.premium ? 'premium-card' : ''}`;
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
        showToast("SOURCE INJECTED SUCCESSFULLY, SHIT IS FIRE LMAO", "success");
    };
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

function switchTab(target) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.target === target));
    document.querySelectorAll('.dashboard-section').forEach(s => {
        s.classList.toggle('active', s.id === target);
        s.style.display = s.id === target ? 'block' : 'none';
    });
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
            badgeEl.innerText = "CORE ULTIMATE";
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
