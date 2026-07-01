// J.A.R.V.I.S. Promotional JS Controller

// Hardware Detection Helper for local specifications
function getSystemSpecs() {
    let gpu = "NVIDIA GeForce RTX 4060 Ti";
    let cpu = "AMD Ryzen 5 (12 Cores, 12 Threads)";
    let ram = "32.0 GB RAM";
    
    try {
        const tempCanvas = document.createElement('canvas');
        const gl = tempCanvas.getContext('webgl') || tempCanvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                if (renderer) {
                    let match = renderer.match(/(NVIDIA GeForce RTX \d{4}(?:\s*Ti)?|NVIDIA GeForce GTX \d{4}|AMD Radeon [A-Z0-9\s]+|Intel[A-Z0-9\s]+Graphics)/i);
                    if (match) {
                        gpu = match[0];
                    } else {
                        let parts = renderer.split(',');
                        if (parts.length > 1) {
                            gpu = parts[1].replace(/Direct3D.*/i, '').replace(/\(.*/, '').trim();
                        } else {
                            gpu = renderer.replace(/ANGLE \(/i, '').replace(/\)/, '').replace(/Direct3D.*/i, '').trim();
                        }
                    }
                }
            }
        }
    } catch (e) {}
    
    const cores = navigator.hardwareConcurrency || 12;
    const isApple = /Mac/i.test(navigator.platform) && navigator.maxTouchPoints > 0;
    
    if (isApple) {
        cpu = `Apple M-Series (${cores} Cores)`;
        gpu = "Apple Integrated GPU";
    } else {
        if (gpu.toLowerCase().includes("nvidia")) {
            if (cores >= 24) {
                cpu = `Intel Core i9-13900K @ 3.00GHz (${cores} Cores, 32 Threads)`;
            } else if (cores >= 16) {
                cpu = `AMD Ryzen 7 (${cores} Cores, ${cores} Threads)`;
            } else {
                cpu = `AMD Ryzen 5 (${cores} Cores, ${cores} Threads)`;
            }
        } else if (gpu.toLowerCase().includes("amd") || gpu.toLowerCase().includes("radeon")) {
            cpu = `AMD Ryzen 7 (${cores} Cores, ${cores} Threads)`;
        } else {
            cpu = `Intel Core i7 (${cores} Cores, ${cores} Threads)`;
        }
    }
    
    if (navigator.deviceMemory) {
        ram = `${navigator.deviceMemory}.0 GB DDR5 RAM`;
    } else {
        ram = cores >= 16 ? "32.0 GB DDR5 RAM" : "16.0 GB DDR4 RAM";
    }
    
    let vram = "8GB VRAM";
    if (gpu.includes("4090")) vram = "24GB VRAM";
    else if (gpu.includes("4080")) vram = "16GB VRAM";
    else if (gpu.includes("4070")) vram = "12GB VRAM";
    else if (gpu.includes("4060")) vram = "8GB VRAM";
    else if (gpu.includes("3080")) vram = "10GB VRAM";
    else if (gpu.includes("3060")) vram = "12GB VRAM";
    
    return { gpu, cpu, ram, vram, cores };
}

// 1. Particle Background Canvas
const canvas = document.getElementById('cortex-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const mouse = {
    x: null,
    y: null,
    radius: 120
};

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

// Capture cursor movements
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Clear mouse coords when cursor leaves window
window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }
    
    // Draw particle
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    
    // Update particle position and bounce off screen edges
    update() {
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }
        
        // Mouse hover interaction: push particles away slightly
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                this.x += 3;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
                this.x -= 3;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                this.y += 3;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
                this.y -= 3;
            }
        }
        
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

// Populate particle arrays
function initParticles() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesArray = [];
    let numberOfParticles = Math.min((canvas.width * canvas.height) / 9000, 100);
    
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 0.4) - 0.2;
        let directionY = (Math.random() * 0.4) - 0.2;
        let color = 'rgba(0, 229, 255, 0.25)';
        
        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// Draw connection lines between nearby particles
function connectParticles() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                opacityValue = 1 - (distance / 150);
                ctx.strokeStyle = `rgba(0, 229, 255, ${opacityValue * 0.15})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// Animation loop
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connectParticles();
    requestAnimationFrame(animateParticles);
}

// Initialize particles grid
initParticles();
animateParticles();


// 2. Navigation scroll utility
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}


// 3. Tab Subsystem switch explorer
function switchTab(evt, tabId) {
    const panels = document.getElementsByClassName('tab-panel');
    for (let i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active');
    }
    
    const tabLinks = document.getElementsByClassName('tab-link');
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.remove('active');
    }
    
    document.getElementById(tabId).classList.add('active');
    evt.currentTarget.classList.add('active');
    
    if (tabId === 'swarm-panel') {
        setTimeout(updateSwarmPaths, 50);
    }
}


// 4. Console Simulator CLI Logic
const consoleBody = document.getElementById('console-body');
const consoleInput = document.getElementById('console-input');

function appendToConsole(text, type = 'output') {
    const line = document.createElement('div');
    line.className = 'cli-line';
    
    if (type === 'command') {
        line.innerHTML = `<span style="color:#4b5563">C:\\Users\\Admin></span> ${text}`;
    } else if (type === 'error') {
        line.innerHTML = `<span style="color:#ef4444">${text}</span>`;
    } else if (type === 'success') {
        line.innerHTML = `<span style="color:#10b981">${text}</span>`;
    } else {
        line.innerHTML = text;
    }
    
    consoleBody.appendChild(line);
    consoleBody.scrollTop = consoleBody.scrollHeight;
}

function handleConsoleInput(e) {
    if (e.key === 'Enter') {
        const cmd = consoleInput.value.trim();
        consoleInput.value = '';
        if (cmd) {
            runCommand(cmd);
        }
    }
}

function runPreset(cmd) {
    runCommand(cmd);
}

function runCommand(cmd) {
    appendToConsole(cmd, 'command');
    
    const cleanCmd = cmd.toLowerCase();
    
    setTimeout(() => {
        switch (cleanCmd) {
            case '/help':
                appendToConsole("Available Commands:<br>" +
                                "  <span style='color:#00E5FF'>/diagnose</span> - Runs local system diagnostic sweep<br>" +
                                "  <span style='color:#00E5FF'>/sonar</span>    - Sweeps local area network for online devices<br>" +
                                "  <span style='color:#00E5FF'>/swarm</span>    - Spawns multi-agent task execution swarm<br>" +
                                "  <span style='color:#00E5FF'>/system</span>   - Queries host hardware specifications<br>" +
                                "  <span style='color:#00E5FF'>/logs</span>    - Streams live core telemetry logs<br>" +
                                "  <span style='color:#00E5FF'>/clear</span>    - Clears the terminal screen");
                break;
            case '/clear':
                consoleBody.innerHTML = '';
                break;
            case '/diagnose':
                appendToConsole("Running Core Diagnostics Matrix...", 'output');
                setTimeout(() => {
                    appendToConsole("[PASS] Local Cognitive Core (Llama 3.2 3B) - Online", 'success');
                    appendToConsole("[PASS] Semantic Memory Vector Store - Stable (142 nodes indexed)", 'success');
                    appendToConsole("[PASS] AI Office Suite Modules (systems/office) - Compiled & Ready", 'success');
                    appendToConsole("[WARN] Network Port exposed: Loopback mode ONLY (127.0.0.1)", 'error');
                    appendToConsole("[PASS] Diagnostics Complete. Overall Score: <span style='color:#00E5FF'>A+ (98/100)</span>", 'output');
                }, 500);
                break;
            case '/sonar':
                appendToConsole("Executing LAN Active Sweep (pinging subnet 192.168.1.0/24)...", 'output');
                setTimeout(() => {
                    appendToConsole("<span style='color:var(--accent-2); font-weight:bold;'>[SONAR] 4 Online Devices Discovered (Click to scan ports):</span>", 'output');
                    const deviceGridHTML = `
                    <div class="cli-device-grid">
                        <div class="cli-device-card" onclick="probeDevicePorts('192.168.1.1', 'Gateway Router')">
                            <span class="device-icon">🌐</span>
                            <span class="device-name">Gateway Router</span>
                            <span class="device-ip">192.168.1.1</span>
                            <span class="device-latency">1.2ms</span>
                        </div>
                        <div class="cli-device-card" onclick="probeDevicePorts('192.168.1.12', 'Inventor PC')">
                            <span class="device-icon">💻</span>
                            <span class="device-name">Inventor PC</span>
                            <span class="device-ip">192.168.1.12</span>
                            <span class="device-latency">0.4ms</span>
                        </div>
                        <div class="cli-device-card" onclick="probeDevicePorts('192.168.1.45', 'Smart TV')">
                            <span class="device-icon">📺</span>
                            <span class="device-name">Smart TV</span>
                            <span class="device-ip">192.168.1.45</span>
                            <span class="device-latency">4.8ms</span>
                        </div>
                        <div class="cli-device-card" onclick="probeDevicePorts('192.168.1.102', 'Uplink Mobile')">
                            <span class="device-icon">📱</span>
                            <span class="device-name">Uplink Mobile</span>
                            <span class="device-ip">192.168.1.102</span>
                            <span class="device-latency">12.5ms</span>
                        </div>
                    </div>
                    <div id="device-port-probe-output" style="margin-top: 12px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; font-family:'Consolas', monospace; display: none;"></div>
                    `;
                    appendToConsole(deviceGridHTML, 'output');
                }, 800);
                break;
            case '/swarm':
                appendToConsole("Initializing Multi-Agent Swarm (Task: 'Optimize coding workspace')...", 'output');
                setTimeout(() => {
                    appendToConsole("[SWARM] Swarm Node 1 (Researcher) Spawned...", 'output');
                    appendToConsole("[SWARM] Swarm Node 2 (Code Auditor) Spawned...", 'output');
                    appendToConsole("[RESEARCHER] Reading e:\\ΔΗΜΗΤΡΗΣ\\Coding\\jarvis core files...", 'output');
                    appendToConsole("[AUDITOR] Auditing file encodings. Found CP-1253 mismatches, compiling patch...", 'output');
                    appendToConsole("[SWARM] Applying encoding patches. All files successfully converted to UTF-8.", 'success');
                    appendToConsole("[SWARM] Swarm complete. Task Achieved.", 'success');
                }, 1000);
                break;
            case '/system':
                appendToConsole("Querying Host Hardware Specifications...", 'output');
                setTimeout(() => {
                    const specs = getSystemSpecs();
                    appendToConsole(`[CPU] ${specs.cpu}`, 'success');
                    appendToConsole(`[GPU] ${specs.gpu} ${specs.vram} (Active Device: CUDA enabled)`, 'success');
                    appendToConsole(`[RAM] ${specs.ram}`, 'success');
                    appendToConsole("[OS] Microsoft Windows 11 Pro [Build 22631]", 'success');
                    appendToConsole("[CORE] Active Model Core: <span style='color:#f59e0b'>dbekas314/jarvis_ultimate_v3 (3B quantized)</span>", 'output');
                }, 400);
                break;
            case '/logs':
                appendToConsole("Streaming Live Telemetry Core Logs...", 'output');
                setTimeout(() => {
                    appendToConsole("[14:52:01] [TELEMETRY] Heartbeat sent to node master.", 'output');
                    appendToConsole("[14:52:03] [SEMANTIC] Vector memory database index sync complete. 142 items.", 'output');
                    appendToConsole("[14:52:05] [CHRONOS] Alert queue scanned: 0 active cron tasks.", 'output');
                    appendToConsole("[14:52:07] [SENTRY] Local Loopback Host verified: 127.0.0.1 bound.", 'success');
                    appendToConsole("[14:52:09] [SWARM] Task optimizer initialized successfully.", 'output');
                }, 500);
                break;
            default:
                appendToConsole(`Command not recognized: '${cmd}'. Type <span style='color:#00E5FF'>/help</span> for commands.`, 'error');
                break;
        }
    }, 200);
}


// 5. Pricing Toggles
let isAnnual = false;

function toggleBilling() {
    // No-op: Billing toggle removed in favor of lifetime licensing.
}

function updatePricingCards() {
    // No-op: Fixed lifetime price.
}


// 6. Stripe/PayPal Checkout Simulator & Gateway Integrations
const checkoutModal = document.getElementById('checkout-modal');
const selectedPlanName = document.getElementById('selected-plan-name');
const summarySubtotal = document.getElementById('summary-subtotal');
const summaryDiscountRow = document.getElementById('summary-discount-row');
const summaryDiscount = document.getElementById('summary-discount');
const summaryTotal = document.getElementById('summary-total');

const tabCardBtn = document.getElementById('btn-tab-card');
const tabPaypalBtn = document.getElementById('btn-tab-paypal');
const paypalSection = document.getElementById('payment-paypal-section');
const cardSection = document.getElementById('payment-card-section');

const processingOverlay = document.getElementById('processing-overlay');
const processingStep = document.getElementById('processing-step');
const successOverlay = document.getElementById('success-overlay');

let currentActivePlan = 'Pro Edition';

// Gateway Configurations State
let gatewayConfig = {
    stripe_publishable_key: "",
    paypal_client_id: "",
    mode: "sandbox"
};

let stripeInstance = null;
let stripeCardElement = null;
let paypalButtonsInstance = null;

// Fetch Gateway Configuration on Load
async function loadGatewayConfig() {
    try {
        const response = await fetch('gateway_config.json');
        if (response.ok) {
            gatewayConfig = await response.json();
            console.log("J.A.R.V.I.S. Gateway Config Loaded:", gatewayConfig);
        }
    } catch (err) {
        console.warn("Failed to load gateway_config.json, defaulting to sandbox:", err);
    }
    initializeGatewayUI();
}

function initializeGatewayUI() {
    const isLive = gatewayConfig.mode === "production" && 
                   (gatewayConfig.stripe_publishable_key || gatewayConfig.paypal_client_id);
    
    const badge = document.getElementById('pay-mode-badge');
    if (badge) {
        if (isLive) {
            badge.textContent = "🟢 LIVE GATEWAY ACTIVE";
            badge.className = "payment-mode-badge live";
        } else {
            badge.textContent = "🔒 SANDBOX ACTIVE";
            badge.className = "payment-mode-badge sandbox";
        }
    }
    
    if (isLive) {
        if (gatewayConfig.stripe_publishable_key) {
            loadStripeSDK(gatewayConfig.stripe_publishable_key);
        }
        if (gatewayConfig.paypal_client_id) {
            loadPayPalSDK(gatewayConfig.paypal_client_id);
        }
    } else {
        // Force fallback elements in sandbox
        document.getElementById('stripe-card-mount').style.display = 'none';
        document.getElementById('payment-card-section').style.display = 'block';
        document.getElementById('paypal-mock-btn').style.display = 'block';
        document.getElementById('paypal-button-container').style.display = 'none';
    }
}

// Dynamically load Stripe Elements SDK
function loadStripeSDK(publishableKey) {
    if (window.Stripe) {
        setupStripeElements(publishableKey);
        return;
    }
    const script = document.createElement('script');
    script.src = "https://js.stripe.com/v3/";
    script.onload = () => setupStripeElements(publishableKey);
    document.head.appendChild(script);
}

function setupStripeElements(publishableKey) {
    try {
        stripeInstance = Stripe(publishableKey);
        const elements = stripeInstance.elements();
        
        document.getElementById('stripe-card-mount').style.display = 'block';
        document.getElementById('payment-card-section').style.display = 'none';
        
        stripeCardElement = elements.create('card', {
            style: {
                base: {
                    color: '#f3f4f6',
                    fontFamily: '"Outfit", sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '15px',
                    '::placeholder': {
                        color: '#4b5563'
                    }
                },
                invalid: {
                    color: '#ef4444',
                    iconColor: '#ef4444'
                }
            }
        });
        stripeCardElement.mount('#stripe-card-mount');
    } catch (err) {
        console.error("Stripe initialization failed, reverting to sandbox input:", err);
        document.getElementById('stripe-card-mount').style.display = 'none';
        document.getElementById('payment-card-section').style.display = 'block';
    }
}

// Dynamically load PayPal Buttons SDK
function loadPayPalSDK(clientId) {
    if (document.getElementById('paypal-sdk-script')) return;
    
    const script = document.createElement('script');
    script.id = 'paypal-sdk-script';
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = () => setupPayPalButtons();
    document.head.appendChild(script);
}

function setupPayPalButtons() {
    try {
        if (!window.paypal) return;
        
        document.getElementById('paypal-mock-btn').style.display = 'none';
        document.getElementById('paypal-button-container').style.display = 'block';
        
        window.paypal.Buttons({
            createOrder: function(data, actions) {
                let basePrice = currentActivePlan === 'Pro Edition' ? 49 : 0;
                let finalPrice = basePrice;
                return actions.order.create({
                    purchase_units: [{
                        description: `J.A.R.V.I.S. ${currentActivePlan} License`,
                        amount: {
                            currency_code: 'USD',
                            value: finalPrice.toFixed(2)
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    showSuccessScreen();
                });
            },
            onError: function(err) {
                console.error("PayPal Error:", err);
                alert("PayPal Transaction failed. Redirecting to backup transaction queue...");
            }
        }).render('#paypal-button-container');
    } catch (err) {
        console.error("PayPal Buttons rendering failed:", err);
        document.getElementById('paypal-mock-btn').style.display = 'block';
        document.getElementById('paypal-button-container').style.display = 'none';
    }
}

function openCheckout(planName) {
    if (planName === 'Enterprise Grid') {
        alert("Connecting you to J.A.R.V.I.S. Core Engineering... Handshake initiated.");
        return;
    }
    
    if (planName === 'Pro Edition') {
        window.location.href = "https://buy.stripe.com/4gM3cu5h9dgC0r9bu79fW01";
        return;
    }
    
    currentActivePlan = planName;
    selectedPlanName.textContent = planName;
    
    // Clear forms and processing states
    document.getElementById('payment-form').reset();
    processingOverlay.classList.remove('active');
    successOverlay.classList.remove('active');
    
    // Collapse accordion files
    const allAccs = document.querySelectorAll('.checkout-accordion');
    allAccs.forEach(acc => acc.classList.remove('active'));
    
    // Calculate values
    let basePrice = 0;
    if (planName === 'Pro Edition') basePrice = 49;
    else if (planName === 'Free Edition') basePrice = 0;
    
    summarySubtotal.textContent = `$${basePrice.toFixed(2)}`;
    summaryDiscountRow.style.display = 'none';
    summaryTotal.textContent = `$${basePrice.toFixed(2)}`;
    
    checkoutModal.classList.add('active');
}

function closeCheckout() {
    checkoutModal.classList.remove('active');
}

// Handle payment tabs
function switchPayTab(type) {
    if (type === 'card') {
        tabCardBtn.classList.add('active');
        tabPaypalBtn.classList.remove('active');
        cardSection.style.display = 'block';
        paypalSection.style.display = 'none';
    } else {
        tabCardBtn.classList.remove('active');
        tabPaypalBtn.classList.add('active');
        cardSection.style.display = 'none';
        paypalSection.style.display = 'block';
    }
}

// Auto-formats credit card digits
function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += ' ';
        }
        formatted += value[i];
    }
    input.value = formatted;
}

// Auto-formats MM/YY expiry
function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 2) {
        input.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else {
        input.value = value;
    }
}

// Process purchase simulation
function processPayment(e) {
    e.preventDefault();
    
    processingOverlay.classList.add('active');
    
    const steps = [
        "Verifying Payment Credentials...",
        "Authorizing Dynamic Token...",
        "Contacting Gateway API...",
        "Generating Local Decryption License...",
        "Finalizing Uplink Handshake..."
    ];
    
    // Check if Stripe Elements is active and mounted
    if (stripeInstance && stripeCardElement && document.getElementById('stripe-card-mount').style.display === 'block') {
        processingStep.textContent = "Tokenizing card data via Stripe API...";
        stripeInstance.createToken(stripeCardElement).then(function(result) {
            if (result.error) {
                processingOverlay.classList.remove('active');
                alert("Stripe card verification failed: " + result.error.message);
            } else {
                console.log("Stripe Token generated:", result.token);
                processingStep.textContent = `Card verified [Token: ${result.token.id.substring(0, 10)}...]`;
                runSimulatedTransactionSteps(steps, 1);
            }
        });
    } else {
        // Run standard sandbox simulations
        runSimulatedTransactionSteps(steps, 0);
    }
}

function runSimulatedTransactionSteps(steps, startIdx) {
    let currentStep = startIdx;
    processingStep.textContent = steps[currentStep];
    
    const stepInterval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
            processingStep.textContent = steps[currentStep];
        } else {
            clearInterval(stepInterval);
            showSuccessScreen();
        }
    }, 700);
}

function showSuccessScreen() {
    const procOverlay = document.getElementById('processing-overlay');
    if (procOverlay) {
        procOverlay.classList.remove('active');
    }
    
    let generatedKey = '';
    const keyParts = [];
    for (let i = 0; i < 2; i++) {
        keyParts.push(Math.random().toString(36).substring(2, 6).toUpperCase());
    }
    
    if (currentActivePlan === 'Pro Edition') {
        generatedKey = `JVS-PRO-${keyParts.join('-')}`;
        document.getElementById('provisioned-license-key').textContent = "SENT TO EMAIL (CHECK INBOX)";
        document.getElementById('provisioned-license-key').style.fontSize = "0.85rem";
        document.getElementById('provisioned-license-key').style.letterSpacing = "0.5px";
    } else {
        generatedKey = `JVS-FREE-${keyParts.join('-')}`;
        document.getElementById('provisioned-license-key').textContent = generatedKey;
    }
    
    // Register payment on backend cloud server (if active)
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get('email');
    const sessionIdFromUrl = urlParams.get('session_id');
    const emailInput = document.getElementById('checkout-email');
    
    let emailVal = "dbekas314@gmail.com";
    if (emailFromUrl && emailFromUrl.trim()) {
        emailVal = emailFromUrl.trim();
    } else if (emailInput && emailInput.value.trim()) {
        emailVal = emailInput.value.trim();
    }
    const emailNotice = document.getElementById('success-email-notice');
    if (emailNotice) {
        emailNotice.textContent = "Establishing uplink and scheduling activation email...";
        emailNotice.style.color = "var(--text-color)";
    }
    
    fetch('https://script.google.com/macros/s/AKfycbwAhxKyvx6eQ0a5Ybliowv8qpz0Otlnlz3zRtw6R1Wg4JwYutnz9dgqdf_ju6gzmpC0vQ/exec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: emailVal,
            session_id: sessionIdFromUrl || "",
            plan_name: currentActivePlan,
            license_key: generatedKey
        })
    })
    .then(res => {
        if (res.ok) {
            return res.json();
        }
        throw new Error("API call failed");
    })
    .then(data => {
        console.log("Successfully registered license on J.A.R.V.I.S. Cloud Server:", data);
        if (emailNotice) {
            const finalEmail = data.email || emailVal;
            if (data.smtp_sent) {
                emailNotice.textContent = `📧 Onboarding Welcome Email successfully sent to ${finalEmail}!`;
                emailNotice.style.color = "#10b981"; // Success green
            } else {
                emailNotice.textContent = `💾 SMTP Offline // Onboarding welcome email saved to inbox/${data.email_file}`;
                emailNotice.style.color = "#f59e0b"; // Warning amber
            }
        }
    })
    .catch(err => {
        console.warn("Could not reach cloud server for online registration:", err);
        if (emailNotice) {
            emailNotice.textContent = "⚠️ Cloud Server offline. Local simulation active.";
            emailNotice.style.color = "#ef4444"; // Error red
        }
    });
    
    const succOverlay = document.getElementById('success-overlay');
    if (succOverlay) {
        succOverlay.classList.add('active');
    }
}

// Collapsible accordion controller
function toggleAccordion(accId) {
    const content = document.getElementById(accId);
    if (!content) return;
    
    const parent = content.parentElement;
    const isOpen = parent.classList.contains('active');
    
    const allAccs = document.querySelectorAll('.checkout-accordion');
    allAccs.forEach(acc => acc.classList.remove('active'));
    
    if (!isOpen) {
        parent.classList.add('active');
    }
}

// Auto-fill Card helper for Sandbox Testing
function autofillTestCard() {
    switchPayTab('card');
    
    const nameInput = document.getElementById('card-name');
    const numInput = document.getElementById('card-number');
    const expInput = document.getElementById('card-expiry');
    const cvcInput = document.getElementById('card-cvc');
    
    if (nameInput) nameInput.value = "John Doe";
    if (numInput) {
        numInput.value = "4242 4242 4242 4242";
        formatCardNumber(numInput);
    }
    if (expInput) {
        expInput.value = "12/29";
        formatExpiry(expInput);
    }
    if (cvcInput) cvcInput.value = "123";
    
    // Animate inputs brief glow
    const inputs = [nameInput, numInput, expInput, cvcInput];
    inputs.forEach(input => {
        if (input) {
            input.style.borderColor = 'var(--accent)';
            input.style.boxShadow = '0 0 10px var(--accent-glow)';
            setTimeout(() => {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            }, 800);
        }
    });
}


// 7. Local Cognitive Core Estimator
function updateEstimator() {
    const slider = document.getElementById('param-slider');
    if (!slider) return;
    const val = parseInt(slider.value);
    
    const paramVal = document.getElementById('param-val');
    const estTier = document.getElementById('estimator-tier');
    const estRam = document.getElementById('est-ram');
    const estSpeed = document.getElementById('est-speed');
    const estIntel = document.getElementById('est-intelligence');
    const estHw = document.getElementById('est-hardware');
    
    const ramFill = document.getElementById('ram-progress');
    const speedFill = document.getElementById('speed-progress');
    const intelFill = document.getElementById('intelligence-progress');
    
    let modelScale = "";
    let tier = "";
    let ramText = "";
    let speedText = "";
    let intelText = "";
    let hwText = "";
    
    let ramPct = 0;
    let speedPct = 0;
    let intelPct = 0;
    
    switch (val) {
        case 1:
            modelScale = "1.5B (Tiny)";
            tier = "FREE EDITION";
            ramText = "~1.1 GB VRAM";
            speedText = "72 tok/sec";
            intelText = "62%";
            hwText = "Any standard Integrated Graphics / Office Laptop (Minimum 4GB RAM)";
            ramPct = 10;
            speedPct = 95;
            intelPct = 45;
            break;
        case 2:
            modelScale = "3B (Default)";
            tier = "FREE EDITION";
            ramText = "~2.2 GB VRAM";
            speedText = "48 tok/sec";
            intelText = "78%";
            hwText = "Intel Iris Xe / AMD Radeon Integrated Graphics (Minimum 8GB RAM)";
            ramPct = 20;
            speedPct = 70;
            intelPct = 65;
            break;
        case 3:
            modelScale = "7B (Pro)";
            tier = "PRO EDITION";
            ramText = "~5.1 GB VRAM";
            speedText = "28 tok/sec";
            intelText = "89%";
            hwText = "Dedicated Entry GPU (NVIDIA GTX 1660 / RTX 3050, 16GB System RAM)";
            ramPct = 45;
            speedPct = 40;
            intelPct = 80;
            break;
        case 4:
            modelScale = "13B (Elite)";
            tier = "PRO EDITION";
            ramText = "~9.8 GB VRAM";
            speedText = "18 tok/sec";
            intelText = "94%";
            hwText = "Mid-range GPU (NVIDIA RTX 3070 / RTX 4060 Ti, 32GB System RAM)";
            ramPct = 75;
            speedPct = 25;
            intelPct = 90;
            break;
        case 5:
            modelScale = "20B (Enterprise)";
            tier = "ENTERPRISE GRID";
            ramText = "~15.6 GB VRAM";
            speedText = "12 tok/sec";
            intelText = "98%";
            hwText = "Workstation GPU (NVIDIA RTX 4080 / RTX 4090 or Apple Studio, 64GB RAM)";
            ramPct = 95;
            speedPct = 15;
            intelPct = 98;
            break;
    }
    
    if (paramVal) paramVal.textContent = modelScale;
    if (estTier) estTier.textContent = tier;
    if (estRam) estRam.textContent = ramText;
    if (estSpeed) estSpeed.textContent = speedText;
    if (estIntel) estIntel.textContent = intelText;
    if (estHw) estHw.textContent = hwText;
    
    if (ramFill) ramFill.style.width = `${ramPct}%`;
    if (speedFill) speedFill.style.width = `${speedPct}%`;
    if (intelFill) intelFill.style.width = `${intelPct}%`;
    
    if (estTier) {
        if (tier === "FREE EDITION") {
            estTier.style.background = "rgba(0, 229, 255, 0.15)";
            estTier.style.color = "var(--accent)";
            estTier.style.borderColor = "var(--accent)";
        } else if (tier === "PRO EDITION") {
            estTier.style.background = "rgba(245, 158, 11, 0.15)";
            estTier.style.color = "var(--accent-2)";
            estTier.style.borderColor = "var(--accent-2)";
        } else {
            estTier.style.background = "rgba(168, 85, 247, 0.15)";
            estTier.style.color = "#a855f7";
            estTier.style.borderColor = "#a855f7";
        }
    }
}

// 7.5 Interactive Pipeline Flow Switcher
const pipelineData = {
    audio: {
        title: "🎙️ Audio Input Subsystem",
        desc: "Streams real-time microphone captures via standard PyAudio chunks, buffering audio buffers into local memory pools for active offline wakeword filtering.",
        file: "systems/voice_wake_core",
        port: "None (Direct Hardware Access)",
        dep: "PyAudio / Wave"
    },
    wakeword: {
        title: "🔔 Wakeword Filter Subsystem",
        desc: "Constantly scans the incoming audio stream for the trigger phrase 'JARVIS' using the local openwakeword engine. Runs 100% offline with zero false-positives.",
        file: "systems/voice_wake_core",
        port: "None (Internal Stream Binding)",
        dep: "openwakeword / ONNX Runtime"
    },
    cognitive: {
        title: "🧠 Cognitive Core Router",
        desc: "Parses queries and coordinates logic flow. Routes tasks to Ollama (defaulting to Llama 3.2 3B quantized) or local custom LLMs. Manages context memory window injection.",
        file: "core/cognitive_cortex",
        port: "11434 (Ollama API)",
        dep: "Ollama / PyTorch / CUDA"
    },
    memory: {
        title: "💾 Semantic Memory Uplink",
        desc: "Translates prompts into local text embeddings and queries a sqlite3 vector store to fetch relevant context history. Ensures thread-safe transactions during write locks.",
        file: "core/memory_bridge & systems/semantic_memory",
        port: "None (SQLite3 Native File)",
        dep: "nomic-embed-text / sqlite3"
    },
    dispatch: {
        title: "🚀 System Dispatch & Action Matrix",
        desc: "Executes authorized actions on the operating system. Runs search sweeps, files indexing, triggers modular office sheets, or launches custom terminal shell scripts.",
        file: "main_orchestrator & core/action_dispatcher",
        port: "8000 (Local API Server)",
        dep: "Python Subprocess / OS Native APIs"
    }
};

let pipelineTransitionTimeout = null;

function showPipelineDetails(nodeId) {
    const data = pipelineData[nodeId];
    if (!data) return;
    
    // Update active class on pipeline nodes
    const nodes = document.querySelectorAll('.pipeline-node');
    nodes.forEach(node => {
        node.classList.remove('active');
    });
    
    // Find the clicked/hovered node and mark active
    nodes.forEach(node => {
        if (node.getAttribute('onclick') && node.getAttribute('onclick').includes(nodeId)) {
            node.classList.add('active');
        }
    });
    
    // Update details panel elements with fading transition for visual excellence
    const panel = document.getElementById('pipeline-details-panel');
    if (panel) {
        panel.style.opacity = '0.3';
        panel.style.transform = 'translateY(5px)';
        
        if (pipelineTransitionTimeout) {
            clearTimeout(pipelineTransitionTimeout);
        }
        
        pipelineTransitionTimeout = setTimeout(() => {
            document.getElementById('pipe-title').textContent = data.title;
            document.getElementById('pipe-desc').textContent = data.desc;
            document.getElementById('pipe-file').textContent = data.file;
            document.getElementById('pipe-port').textContent = data.port;
            document.getElementById('pipe-dep').textContent = data.dep;
            
            panel.style.opacity = '1';
            panel.style.transform = 'translateY(0)';
        }, 150);
    }
}

// 7.6 Dynamic Swarm Simulation Daemon
let isSwarmRunning = false;

function deploySwarmDemo(e) {
    if (e) e.preventDefault();
    if (isSwarmRunning) return;
    isSwarmRunning = true;
    
    const btn = document.getElementById('btn-deploy-swarm');
    if (btn) {
        btn.disabled = true;
        btn.textContent = "⚡ DEPLOYING...";
        btn.style.opacity = '0.5';
    }
    
    const logBox = document.getElementById('swarm-log');
    const nodes = {
        res: document.getElementById('swarm-node-researcher'),
        cod: document.getElementById('swarm-node-coder'),
        aud: document.getElementById('swarm-node-auditor'),
        sen: document.getElementById('swarm-node-sentry')
    };
    
    const paths = {
        resCod: document.getElementById('path-res-cod'),
        codAud: document.getElementById('path-cod-aud'),
        audSen: document.getElementById('path-aud-sen'),
        senRes: document.getElementById('path-sen-res')
    };
    
    function addLog(text, type = 'system') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const timestamp = new Date().toLocaleTimeString();
        entry.textContent = `[${timestamp}] ${text}`;
        logBox.appendChild(entry);
        logBox.scrollTop = logBox.scrollHeight;
    }
    
    // Reset
    logBox.innerHTML = '';
    Object.values(nodes).forEach(n => {
        if (n) {
            n.className = 'swarm-node';
            n.querySelector('.node-state').textContent = 'IDLE';
        }
    });
    Object.values(paths).forEach(p => {
        if (p) p.classList.remove('active');
    });
    
    addLog("[SYSTEM] Swarm matrix initialization authorized.", 'system');
    
    // Step 1
    setTimeout(() => {
        addLog("[RESEARCHER] Active subnet sweep initiated. Checking files...", 'researcher');
        if (nodes.res) {
            nodes.res.classList.add('active');
            nodes.res.querySelector('.node-state').textContent = 'SCANNING';
        }
        if (paths.senRes) paths.senRes.classList.add('active');
    }, 600);
    
    // Step 2
    setTimeout(() => {
        addLog("[DEVELOPER] Core files found. Compiling index maps and dependencies...", 'coder');
        if (nodes.res) {
            nodes.res.classList.remove('active');
            nodes.res.classList.add('success');
            nodes.res.querySelector('.node-state').textContent = 'STABLE';
        }
        if (nodes.cod) {
            nodes.cod.classList.add('active');
            nodes.cod.querySelector('.node-state').textContent = 'BUILDING';
        }
        if (paths.senRes) paths.senRes.classList.remove('active');
        if (paths.resCod) paths.resCod.classList.add('active');
    }, 1800);
    
    // Step 3
    setTimeout(() => {
        addLog("[AUDITOR] Code check passed. Enforcing SQLite3 schema and path encodings...", 'auditor');
        if (nodes.cod) {
            nodes.cod.classList.remove('active');
            nodes.cod.classList.add('success');
            nodes.cod.querySelector('.node-state').textContent = 'STABLE';
        }
        if (nodes.aud) {
            nodes.aud.classList.add('active');
            nodes.aud.querySelector('.node-state').textContent = 'AUDITING';
        }
        if (paths.resCod) paths.resCod.classList.remove('active');
        if (paths.codAud) paths.codAud.classList.add('active');
    }, 3200);
    
    // Step 4
    setTimeout(() => {
        addLog("[SENTRY] DB checks passed. Restricting loopback binds (127.0.0.1)...", 'sentry');
        if (nodes.aud) {
            nodes.aud.classList.remove('active');
            nodes.aud.classList.add('success');
            nodes.aud.querySelector('.node-state').textContent = 'STABLE';
        }
        if (nodes.sen) {
            nodes.sen.classList.add('active');
            nodes.sen.querySelector('.node-state').textContent = 'SECURING';
        }
        if (paths.codAud) paths.codAud.classList.remove('active');
        if (paths.audSen) paths.audSen.classList.add('active');
    }, 4500);
    
    // Step 5
    setTimeout(() => {
        addLog("[SYSTEM] Swarm sweeps complete. Matrix state: STABLE.", 'success');
        if (nodes.sen) {
            nodes.sen.classList.remove('active');
            nodes.sen.classList.add('success');
            nodes.sen.querySelector('.node-state').textContent = 'STABLE';
        }
        if (paths.audSen) paths.audSen.classList.remove('active');
        
        setTimeout(() => {
            isSwarmRunning = false;
            if (btn) {
                btn.disabled = false;
                btn.textContent = "⚡ DEPLOY LOCAL SWARM";
                btn.style.opacity = '1';
            }
        }, 1000);
    }, 5800);
}

// 7.7 Hardware Calibration Benchmark Simulator
let isBenchmarkRunning = false;

function runCalibrationBenchmark() {
    if (isBenchmarkRunning) return;
    isBenchmarkRunning = true;
    
    const term = document.getElementById('benchmark-terminal');
    const log = document.getElementById('benchmark-log');
    const slider = document.getElementById('param-slider');
    
    if (!term || !log) return;
    
    term.style.display = 'block';
    term.style.opacity = '0';
    term.style.transition = 'opacity 0.3s ease';
    setTimeout(() => { term.style.opacity = '1'; }, 50);
    
    log.innerHTML = '';
    
    function logLine(text, delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                const div = document.createElement('div');
                div.textContent = `>> ${text}`;
                log.appendChild(div);
                term.scrollTop = term.scrollHeight;
                resolve();
            }, delay);
        });
    }
    
    async function runSweep() {
        const specs = getSystemSpecs();
        await logLine("Initializing benchmark core sweep...", 100);
        await logLine("Checking CPU architecture... x86_64 CPU family detected", 300);
        await logLine(`Active cores: ${specs.cores} logical processors`, 300);
        await logLine("Checking CUDA runtime... Active (Device index 0)", 300);
        await logLine(`GPU detected: ${specs.gpu} (${specs.vram})`, 300);
        await logLine(`Sweeping system memory bandwidth... ${specs.ram}`, 300);
        await logLine("Running FP16 matrix multiplier validation tests...", 450);
        await logLine("Testing batch size latency: 1.45 ms/token", 300);
        await logLine("Speed estimation: 28 tokens/sec calculated on 7B parameters", 300);
        await logLine("Node Capability Level: PRO EDITION COMPATIBLE", 300);
        await logLine("Finalizing calibration configurations...", 200);
        
        setTimeout(() => {
            if (slider) {
                slider.value = 3;
                updateEstimator();
            }
        }, 500);
        
        setTimeout(() => {
            term.style.opacity = '0';
            setTimeout(() => {
                term.style.display = 'none';
                isBenchmarkRunning = false;
            }, 300);
        }, 1500);
    }
    
    runSweep();
}

// 7.8 Dynamic Swarm Node Connector SVG Paths
function updateSwarmPaths() {
    const container = document.querySelector('.swarm-visualization');
    const res = document.getElementById('swarm-node-researcher');
    const cod = document.getElementById('swarm-node-coder');
    const aud = document.getElementById('swarm-node-auditor');
    const sen = document.getElementById('swarm-node-sentry');
    
    if (!container || !res || !cod || !aud || !sen) return;
    
    const containerRect = container.getBoundingClientRect();
    
    function getNodeCenter(node) {
        const rect = node.getBoundingClientRect();
        return {
            x: (rect.left + rect.width / 2) - containerRect.left,
            y: (rect.top + rect.height / 2) - containerRect.top
        };
    }
    
    const pRes = getNodeCenter(res);
    const pCod = getNodeCenter(cod);
    const pAud = getNodeCenter(aud);
    const pSen = getNodeCenter(sen);
    
    const pathResCod = document.getElementById('path-res-cod');
    const pathCodAud = document.getElementById('path-cod-aud');
    const pathAudSen = document.getElementById('path-aud-sen');
    const pathSenRes = document.getElementById('path-sen-res');
    
    if (pathResCod) pathResCod.setAttribute('d', `M ${pRes.x} ${pRes.y} L ${pCod.x} ${pCod.y}`);
    if (pathCodAud) pathCodAud.setAttribute('d', `M ${pCod.x} ${pCod.y} L ${pAud.x} ${pAud.y}`);
    if (pathAudSen) pathAudSen.setAttribute('d', `M ${pAud.x} ${pAud.y} L ${pSen.x} ${pSen.y}`);
    if (pathSenRes) pathSenRes.setAttribute('d', `M ${pSen.x} ${pSen.y} L ${pRes.x} ${pRes.y}`);
}

// 7.9 Interactive LAN Device Port Prober
let isProbingPorts = false;

function probeDevicePorts(ip, name) {
    if (isProbingPorts) return;
    isProbingPorts = true;
    
    // Highlight selected card visually
    const cards = document.querySelectorAll('.cli-device-card');
    cards.forEach(card => {
        card.classList.remove('probing');
        const cardIp = card.querySelector('.device-ip');
        if (cardIp && cardIp.textContent === ip) {
            card.classList.add('probing');
        }
    });
    
    const outputDiv = document.getElementById('device-port-probe-output');
    if (!outputDiv) {
        isProbingPorts = false;
        return;
    }
    
    outputDiv.style.display = 'block';
    outputDiv.innerHTML = `<div style="color:var(--accent); font-weight:bold; margin-bottom: 8px;">>> INITIATING TCP PORT PROBE [Target: ${name} (${ip})]...</div>`;
    
    const portData = {
        '192.168.1.1': [
            { port: '80/HTTP', status: 'OPEN', service: 'Router Web UI' },
            { port: '443/HTTPS', status: 'OPEN', service: 'Secure Admin console' },
            { port: '53/DNS', status: 'OPEN', service: 'Local Subnet Resolver' }
        ],
        '192.168.1.12': [
            { port: '22/SSH', status: 'OPEN', service: 'Secure Command Shell' },
            { port: '8000/HTTP', status: 'OPEN', service: 'J.A.R.V.I.S. Cloud Sync API' },
            { port: '11434/HTTP', status: 'OPEN', service: 'Ollama Cognitive Engine' },
            { port: '3389/MS-RDP', status: 'CLOSED', service: 'Remote Desktop access' }
        ],
        '192.168.1.45': [
            { port: '80/HTTP', status: 'OPEN', service: 'Smart Control Web Dashboard' },
            { port: '554/RTSP', status: 'OPEN', service: 'H.264 Live Media Stream' }
        ],
        '192.168.1.102': [
            { port: '8080/HTTP', status: 'OPEN', service: 'Sync Workstation Handshake' },
            { port: '22/SSH', status: 'CLOSED', service: 'Admin shell access' }
        ]
    };
    
    const targetPorts = portData[ip] || [];
    let currentIdx = 0;
    
    function probeNext() {
        if (currentIdx < targetPorts.length) {
            const entry = targetPorts[currentIdx];
            const div = document.createElement('div');
            div.style.paddingLeft = '15px';
            div.style.fontSize = '0.8rem';
            div.style.marginBottom = '4px';
            
            if (entry.status === 'OPEN') {
                div.innerHTML = `<span style="color:#10b981; font-weight:bold;">[OPEN]</span> Port ${entry.port} - <span style="color:var(--text-muted);">${entry.service}</span>`;
            } else {
                div.innerHTML = `<span style="color:#ef4444; font-weight:bold;">[BLOCKED]</span> Port ${entry.port} - <span style="color:#4b5563; font-style:italic;">Connection refused</span>`;
            }
            
            outputDiv.appendChild(div);
            currentIdx++;
            
            // Auto scroll console
            const consoleBody = document.getElementById('console-body');
            if (consoleBody) consoleBody.scrollTop = consoleBody.scrollHeight;
            
            setTimeout(probeNext, 250);
        } else {
            const finish = document.createElement('div');
            finish.style.marginTop = '6px';
            finish.innerHTML = `<span style="color:#10b981; font-weight:bold;">>> PROBE COMPLETED. Handshake registry logs synchronized.</span>`;
            outputDiv.appendChild(finish);
            
            // Remove highlighting
            cards.forEach(card => card.classList.remove('probing'));
            
            const consoleBody = document.getElementById('console-body');
            if (consoleBody) consoleBody.scrollTop = consoleBody.scrollHeight;
            
            isProbingPorts = false;
        }
    }
    
    setTimeout(probeNext, 300);
}

// 7.10 Dynamic Office Action Controller
let officeScaleMode = 'default';

function runOfficeAction(action) {
    const page = document.getElementById('office-canvas-page');
    const sidebar = document.getElementById('office-headings-sidebar');
    
    const btnScale = document.getElementById('ribbon-btn-scale');
    const btnBib = document.getElementById('ribbon-btn-bib');
    const btnMath = document.getElementById('ribbon-btn-math');
    const btnNav = document.getElementById('ribbon-btn-nav');
    
    if (!page) return;
    
    switch (action) {
        case 'scale':
            if (officeScaleMode === 'default') {
                officeScaleMode = 'landscape';
                page.className = 'canvas-page landscape';
                if (btnScale) btnScale.textContent = "Scaling: A4 Landscape";
            } else if (officeScaleMode === 'landscape') {
                officeScaleMode = 'a5';
                page.className = 'canvas-page a5';
                if (btnScale) btnScale.textContent = "Scaling: A5 Portrait";
            } else {
                officeScaleMode = 'default';
                page.className = 'canvas-page';
                if (btnScale) btnScale.textContent = "Scaling: Letter Portrait";
            }
            // Trigger GPU-accelerated scale pop animation
            page.classList.remove('scale-pop');
            void page.offsetWidth; // Force reflow
            page.classList.add('scale-pop');
            break;
            
        case 'bib':
            const bibSlot = document.getElementById('office-bib-slot');
            if (bibSlot) {
                if (bibSlot.innerHTML === '') {
                    bibSlot.innerHTML = `
                    <div class="bibliography-list" style="margin-top: 20px; border-top: 1px dashed rgba(0, 229, 255, 0.15); padding-top: 15px; animation: fadeIn 0.4s ease;">
                        <h4 style="color:#00E5FF; font-size:12px; font-family:'Orbitron',sans-serif; margin-bottom:8px; font-weight:700;">◆ REFERENCES BIBLIOGRAPHY</h4>
                        <div style="font-size:10px; color:var(--text-muted); margin-bottom:4px;">[1] Stark, A. (2026). "OS-Level Local Cognitive Networks". Cortex Journal, 42(1), 12-28.</div>
                        <div style="font-size:10px; color:var(--text-muted);">[2] Jarvis System Engineering. "Overwatch Telemetry Diagnostics Loop" (v3.4.0-Build).</div>
                    </div>
                    `;
                    if (btnBib) btnBib.classList.add('active');
                } else {
                    bibSlot.innerHTML = '';
                    if (btnBib) btnBib.classList.remove('active');
                }
            }
            break;
            
        case 'math':
            const mathSlot = document.getElementById('office-math-slot');
            if (mathSlot) {
                if (mathSlot.innerHTML === '') {
                    mathSlot.innerHTML = `
                    <div class="math-formula-render" style="margin-top: 15px; background: rgba(0, 229, 255, 0.04); padding: 12px; border-radius: 6px; border: 1px solid rgba(0, 229, 255, 0.15); text-align: center; font-family: 'Consolas', monospace; color: var(--accent); font-size: 11px; animation: fadeIn 0.4s ease;">
                        E_{cognitive} = m_{models} \\cdot c_{cores}^2 \\cdot \\kappa_{quantized}
                    </div>
                    `;
                    if (btnMath) btnMath.classList.add('active');
                } else {
                    mathSlot.innerHTML = '';
                    if (btnMath) btnMath.classList.remove('active');
                }
            }
            break;
            
        case 'nav':
            if (sidebar) {
                if (sidebar.style.display === 'none') {
                    sidebar.style.display = 'block';
                    if (btnNav) btnNav.classList.add('active');
                } else {
                    sidebar.style.display = 'none';
                    if (btnNav) btnNav.classList.remove('active');
                }
                // Recalculate layout paths since the UI size changed
                setTimeout(updateSwarmPaths, 50);
            }
            break;
    }
}




// 8. Scroll-linked Animations & Reveal logic
document.addEventListener('DOMContentLoaded', () => {
    const scrollIndicator = document.getElementById('scroll-indicator');
    const holoCore = document.getElementById('hero-holo-core');

    // Pipeline Hover Event Binding
    const pipelineNodes = document.querySelectorAll('.pipeline-node');
    pipelineNodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            const onclickAttr = node.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/showPipelineDetails\('([^']+)'\)/);
                if (match && match[1]) {
                    showPipelineDetails(match[1]);
                }
            }
        });
    });

    // 1. Core 3D Scroll tilt calculations
    const cards = document.querySelectorAll('.scroll-3d');
    
    function update3dScrollEffects() {
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const cardCenterY = rect.top + rect.height / 2;
            const viewportCenterY = window.innerHeight / 2;
            const distFromCenter = cardCenterY - viewportCenterY;
            
            // Normalize distance relative to viewport bounds
            const maxDist = window.innerHeight / 2 + rect.height / 2;
            const normalizedDist = Math.max(-1, Math.min(1, distFromCenter / maxDist));
            
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                // Calculate perspective tilt
                const rotX = normalizedDist * -18; // tilt up/down
                
                // Add a side-to-side rotation factor based on horizontal alignment
                const cardCenterX = rect.left + rect.width / 2;
                const viewportCenterX = window.innerWidth / 2;
                const normalizedX = (cardCenterX - viewportCenterX) / (window.innerWidth / 2);
                const rotY = normalizedX * 12; // tilt left/right
                
                // Translate in Z-space to pull cards back near margins
                const transZ = -Math.abs(normalizedDist) * 110;
                
                // Fade and dim cards near margins
                const brightness = 1 - Math.min(0.4, Math.abs(normalizedDist) * 0.45);
                const opacity = 1 - Math.max(0, Math.abs(normalizedDist) - 0.75) * 4;
                
                card.style.setProperty('--tilt-x', `${rotX}deg`);
                card.style.setProperty('--tilt-y', `${rotY}deg`);
                card.style.setProperty('--tilt-z', `${transZ}px`);
                card.style.setProperty('--brightness', brightness);
                card.style.opacity = Math.max(0.1, opacity);
            }
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Update Scroll Progress bar
                const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                if (totalScrollHeight > 0) {
                    const scrollPercentage = (window.scrollY / totalScrollHeight) * 100;
                    scrollIndicator.style.width = scrollPercentage + '%';
                }
                
                // Scroll-linked Core Rotation: Rotate rings as user scrolls
                if (holoCore) {
                    const rotationOffset = window.scrollY * 0.15;
                    const rings = holoCore.querySelectorAll('.ring');
                    if (rings.length >= 3) {
                        rings[0].style.transform = `rotate(${rotationOffset}deg)`;
                        rings[1].style.transform = `rotate(${-rotationOffset * 0.8}deg)`;
                        rings[2].style.transform = `rotate(${rotationOffset * 1.5}deg)`;
                    }
                }
                
                update3dScrollEffects();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Run once at start to position elements visible on screen load
    update3dScrollEffects();

    // 2. IntersectionObserver for revealing sections & cards
    const reveals = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });
    
    reveals.forEach(reveal => {
        observer.observe(reveal);
    });

    // 3. Auto-Triggering CLI Command Console Diagnostics Observer
    let autoDiagTriggered = false;
    const termCard = document.getElementById('console-terminal-card');
    
    if (termCard) {
        const terminalObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !autoDiagTriggered) {
                    autoDiagTriggered = true;
                    setTimeout(() => {
                        const inputEl = document.getElementById('console-input');
                        if (inputEl) {
                            const textToType = '/diagnose';
                            let charIndex = 0;
                            inputEl.value = '';
                            inputEl.focus();
                            inputEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            
                            function typeChar() {
                                if (charIndex < textToType.length) {
                                    inputEl.value += textToType.charAt(charIndex);
                                    charIndex++;
                                    setTimeout(typeChar, 80 + Math.random() * 50);
                                } else {
                                    setTimeout(() => {
                                        runCommand('/diagnose');
                                        inputEl.value = '';
                                        inputEl.blur();
                                    }, 400);
                                }
                            }
                            typeChar();
                        }
                    }, 800);
                    terminalObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        terminalObserver.observe(termCard);
    }

    // 4. Radial Glow Follower (Linear Style)
    const glow = document.createElement('div');
    glow.className = 'radial-glow';
    document.body.appendChild(glow);
    setTimeout(() => {
        glow.style.opacity = '1';
    }, 100);

    window.addEventListener('mousemove', (e) => {
        glow.style.left = `${e.clientX}px`;
        glow.style.top = `${e.clientY}px`;
    }, { passive: true });

    // Swarm layout resize observer
    window.addEventListener('resize', updateSwarmPaths);

    // Initialize Local AI Cognitive Estimator
    updateEstimator();

    // Load checkout gateway config
    loadGatewayConfig();

    // Check if redirecting from a successful Stripe Payment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
        currentActivePlan = 'Pro Edition';
        
        // Dynamically update the summary pricing elements to show Pro Edition pricing
        const subtotalEl = document.getElementById('summary-subtotal');
        const totalEl = document.getElementById('summary-total');
        if (subtotalEl) subtotalEl.textContent = "$49.00";
        if (totalEl) totalEl.textContent = "$49.00";
        
        // Retrieve dynamically to prevent null errors on early load
        const modalEl = document.getElementById('checkout-modal');
        if (modalEl) {
            modalEl.classList.add('active');
        }
        
        setTimeout(() => {
            showSuccessScreen();
            
            // Clean up the URL search parameters so refreshing doesn't show the popup again
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({path: cleanUrl}, '', cleanUrl);
        }, 1200);
    }
});

