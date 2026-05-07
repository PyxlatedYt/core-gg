// --- CORE.GG PROFESSIONAL SUITE V7.2 (ULTRA-LITE) ---
// Credits Who made this: Zenith.gg

const CATEGORIES = {
    modules: { count: 100, icon: 'fa-microchip', prefix: ["Advanced", "System", "Integrated", "Core", "Essential", "Optimized"], suffix: ["Framework", "Engine", "Module", "Wrapper", "Handler", "Manager", "Service"] },
    servers: { count: 50, icon: 'fa-server', prefix: ["Backend", "Data", "Economy", "Secure", "Network"], suffix: ["Logic", "Service", "Processor", "Validator", "API"] },
    clients: { count: 50, icon: 'fa-desktop', prefix: ["Local", "Camera", "Visual", "Movement", "Combat"], suffix: ["Handler", "Controller", "Visualizer", "Manager", "Interceptor"] }
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
    "System Status: All 200+ nodes operational.",
    "Security Matrix: No anomalies detected.",
    "Database integrity verified."
];

const GENERATED_DATA = { modules: [], servers: [], clients: [] };
let isPremiumUser = false;
let currentUser = null;

// --- GLOBAL FUNCTIONS ---
function switchTab(target) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.target === target));
    document.querySelectorAll('.dashboard-section').forEach(s => {
        s.classList.toggle('active', s.id === target);
        s.style.display = s.id === target ? 'block' : 'none';
    });
}

function openAuth() {
    document.getElementById('auth-modal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
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
    showToast("Copied to clipboard.", "success");
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    let color = type === 'success' ? '#10b981' : (type === 'error' ? '#f43f5e' : '#3b82f6');
    toast.style.borderLeftColor = color;
    toast.innerHTML = `<i class="fas fa-info-circle"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function generateLuauCode(title, type) {
    let hash = Math.random().toString(36).substring(2, 10).toUpperCase();
    let lowerTitle = title.toLowerCase();
    let pools = [LOGIC_BANKS.generic, LOGIC_BANKS.utility];
    if (lowerTitle.includes("combat")) pools.push(LOGIC_BANKS.combat);
    if (lowerTitle.includes("data")) pools.push(LOGIC_BANKS.data);
    if (lowerTitle.includes("move")) pools.push(LOGIC_BANKS.movement);
    if (lowerTitle.includes("secure")) pools.push(LOGIC_BANKS.security);

    let allBlocks = pools.flat();
    let selected = [];
    while (selected.length < 3) {
        let block = allBlocks[Math.floor(Math.random() * allBlocks.length)];
        if (!selected.includes(block)) selected.push(block);
    }

    const pattern = ["OOP", "FUNCTIONAL", "SINGLETON"][Math.floor(Math.random() * 3)];
    let code = `-- CORE.GG PROFESSIONAL SUITE\n-- Resource: ${title}\n-- Type: ${type.toUpperCase()}\n\n`;

    if (pattern === "OOP") {
        let className = title.replace(/[^a-zA-Z]/g, '');
        code += `local ${className} = {}\n${className}.__index = ${className}\n\n`;
        code += `function ${className}.new()\n    local self = setmetatable({}, ${className})\n    return self\nend\n\n`;
        selected.forEach(b => code += b.replace(/self:/g, `${className}:`) + "\n\n");
        code += `return ${className}`;
    } else if (pattern === "FUNCTIONAL") {
        code += `local exports = {}\n\n`;
        selected.forEach((b, i) => {
            let match = b.match(/function self:(.+)\(/);
            if (match) {
                code += b.replace(/function self:(.+)\(/g, `local function method_${i}(`) + "\n\n";
                code += `exports.${match[1]} = method_${i}\n`;
            }
        });
        code += `\nreturn exports`;
    } else {
        code += `local Service = {}\n\n`;
        selected.forEach(b => code += b.replace(/function self:(.+)\((.*)\)/g, `function Service:$1($2)`) + "\n\n");
        code += `return Service`;
    }
    return code;
}

function initData() {
    for (const [key, config] of Object.entries(CATEGORIES)) {
        for (let i = 0; i < config.count; i++) {
            let p = config.prefix[Math.floor(Math.random() * config.prefix.length)];
            let s = config.suffix[Math.floor(Math.random() * config.suffix.length)];
            GENERATED_DATA[key].push({
                title: `${p} ${s}`,
                desc: `Professional ${key} implementation.`,
                icon: config.icon,
                premium: Math.random() < 0.85,
                type: key
            });
        }
    }
}

function renderTools(filter = "") {
    const sections = { 'core-modules-grid': GENERATED_DATA.modules, 'server-scripts-grid': GENERATED_DATA.servers, 'client-scripts-grid': GENERATED_DATA.clients };
    for (const [gridId, data] of Object.entries(sections)) {
        const grid = document.getElementById(gridId);
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
    if (tool.premium && !isPremiumUser) {
        showToast("Premium license required.", "error");
        return;
    }
    if (!tool.source) tool.source = generateLuauCode(tool.title, tool.type);
    document.getElementById('ws-title').innerText = tool.title;
    document.getElementById('workspace-overlay').style.display = 'flex';
    document.getElementById('ws-output').value = "";
    document.getElementById('ws-run-btn').onclick = () => {
        document.getElementById('ws-output').value = tool.source;
        showToast("Source generated.", "success");
    };
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
        document.getElementById('user-badge').innerText = user.email === 'jayden.ims.monte@gmail.com' ? "OWNER" : (isPremiumUser ? "PREMIUM" : "FREE USER");
        if (user.email === 'jayden.ims.monte@gmail.com') document.getElementById('nav-admin').style.display = 'flex';
    } else {
        profile.style.display = 'none';
        authBtns.style.display = 'flex';
    }
}

window.onload = () => {
    initData();
    renderTools();
    const saved = localStorage.getItem('zenith_usr');
    if (saved) updateAuthUI(JSON.parse(saved));
    document.getElementById('search-input').oninput = (e) => renderTools(e.target.value);
    document.getElementById('auth-form').onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const user = { email, premium: email === 'jayden.ims.monte@gmail.com' };
        localStorage.setItem('zenith_usr', JSON.stringify(user));
        updateAuthUI(user);
        closeModal('auth-modal');
        showToast("Logged in.", "success");
    };
};
