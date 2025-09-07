
let score = 0;
let scorePerSecond = 0;
let clickValue = 1;
let upgrades = [
    {
        id: 'cursor',
        name: 'Cursor',
        description: 'Adds +1 T/s. Max 1000.',
        baseCost: 15,      
        baseValue: 1,      
        owned: 0,
        unlocked: true,
        multiplier: 2,     
        limit: 1000        
    },
    {
        id: 'antenna',
        name: 'Antenna',
        description: 'A better antenna for improved signal',
        baseCost: 100,
        baseValue: 1,
        owned: 0,
        unlocked: false,
        multiplier: 2
    },
    {
        id: 'satellite',
        name: 'Satellite Dish',
        description: 'Reach for the stars with this powerful dish',
        baseCost: 1100,
        baseValue: 8,
        owned: 0,
        unlocked: false,
        multiplier: 2
    },
    {
        id: 'tower',
        name: 'Cell Tower',
        description: 'A full-scale cell tower for massive gains',
        baseCost: 12000,
        baseValue: 47,
        owned: 0,
        unlocked: false,
        multiplier: 2
    },
    {
        id: 'quantum',
        name: 'Quantum Transmitter',
        description: 'Harness the power of quantum entanglement',
        baseCost: 130000,
        baseValue: 260,
        owned: 0,
        unlocked: false,
        multiplier: 2
    },
    {
        id: 'warp',
        name: 'Warp Drive',
        description: 'Bend space-time to generate T',
        baseCost: 1400000,
        baseValue: 1400,
        owned: 0,
        unlocked: false,
        multiplier: 2
    },
    {
        id: 'singularity',
        name: 'Dyson Sphere',
        description: 'Harness power from a neutron star',
        baseCost: 20000000,
        baseValue: 7800,
        owned: 0,
        unlocked: false,
        multiplier: 2
    },
    {
        id: 'reality',
        name: 'Pray',
        description: 'Pray to God for infinite T',
        baseCost: 330000000,
        baseValue: 44000,
        owned: 0,
        unlocked: false,
        multiplier: 2
    }
];

const scoreElement = document.getElementById('score');
const scorePerSecondElement = document.getElementById('scorePerSecond');
const clickValueElement = document.getElementById('clickValue');
const tennaButton = document.getElementById('tenna');
const tennaImg = document.getElementById('tenna-img');
const upgradesContainer = document.getElementById('upgrades-container');

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num);
}

function updateScore() {
    scoreElement.textContent = formatNumber(score);
    clickValueElement.textContent = formatNumber(clickValue);
}

function updateSPS() {
    scorePerSecondElement.textContent = formatNumber(scorePerSecond);
}

function calculateSPS() {
    return upgrades.reduce((total, upgrade) => {
       
        return total + (upgrade.owned * upgrade.baseValue);
    }, 0);
}

function getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.multiplier, upgrade.owned));
}

function createUpgradeElements() {
    upgradesContainer.innerHTML = '';
    
    upgrades.forEach(upgrade => {
        if (!upgrade.unlocked) return;
        
        const upgradeCost = getUpgradeCost(upgrade);
        const upgradeElement = document.createElement('div');
        upgradeElement.className = `upgrade ${score < upgradeCost ? 'unavailable' : ''}`;
        upgradeElement.id = `upgrade-${upgrade.id}`;
        
        upgradeElement.innerHTML = `
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-stats">
                    Owned: ${upgrade.owned} | Producing: ${formatNumber(upgrade.baseValue * upgrade.owned * Math.pow(upgrade.multiplier, upgrade.owned))}/s
                </div>
            </div>
            <div class="upgrade-cost">${formatNumber(upgradeCost)} T</div>
        `;
        
        upgradeElement.addEventListener('click', () => buyUpgrade(upgrade.id));
        upgradesContainer.appendChild(upgradeElement);
    });
}

function buyUpgrade(upgradeId) {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade) return;

   
    if (upgrade.limit && upgrade.owned >= upgrade.limit) {
        return;
    }
    
    const cost = getUpgradeCost(upgrade);
    
    if (score >= cost) {
        score -= cost;
        upgrade.owned++;
        
       
        const nextUpgradeIndex = upgrades.findIndex(u => u.id === upgradeId) + 1;
        if (nextUpgradeIndex < upgrades.length) {
            upgrades[nextUpgradeIndex].unlocked = true;
        }
        
        updateScore();
        updateUpgrades();
        playSound('buy');
    }
}

function updateUpgrades() {
    scorePerSecond = calculateSPS();
    updateSPS();
    
    upgrades.forEach(upgrade => {
        const upgradeElement = document.getElementById(`upgrade-${upgrade.id}`);
        if (!upgradeElement) return;
        
        const cost = getUpgradeCost(upgrade);
        const isAffordable = score >= cost;
        
        upgradeElement.classList.toggle('unavailable', !isAffordable);
        
        const costElement = upgradeElement.querySelector('.upgrade-cost');
        const statsElement = upgradeElement.querySelector('.upgrade-stats');

        if (upgrade.limit && upgrade.owned >= upgrade.limit) {
            costElement.textContent = 'MAX';
            upgradeElement.classList.add('unavailable');
        } else if (costElement) {
            costElement.textContent = `${formatNumber(cost)} T`;
        }
        
        if (statsElement) {
            const producing = upgrade.owned * upgrade.baseValue;
            statsElement.textContent = `Owned: ${upgrade.owned} | Producing: ${formatNumber(producing)}/s`;
        }
    });
    
   
    const hasNewUnlocks = upgrades.some(upgrade => 
        !upgrade.unlocked && upgrade.baseCost <= score * 10
    );
    
    if (hasNewUnlocks) {
        upgrades.forEach(upgrade => {
            if (!upgrade.unlocked && upgrade.baseCost <= score * 10) {
                upgrade.unlocked = true;
                playSound('unlock');
            }
        });
        createUpgradeElements();
    }
}

function createClickEffect(x, y) {
    const clickEffect = document.createElement('div');
    clickEffect.className = 'click-effect';
    clickEffect.style.left = `${x - 100}px`;
    clickEffect.style.top = `${y - 100}px`;
    
    const clickValueDiv = document.createElement('div');
    clickValueDiv.className = 'click-value';
    clickValueDiv.textContent = `+${formatNumber(clickValue)} T`;
    clickValueDiv.style.left = `${x - 30}px`;
    clickValueDiv.style.top = `${y - 50}px`;
    
    document.body.appendChild(clickEffect);
    document.body.appendChild(clickValueDiv);
    
   
    void clickEffect.offsetWidth;
    
    clickEffect.classList.add('active');
    clickValueDiv.classList.add('active');
    
   
    setTimeout(() => {
        clickEffect.remove();
        clickValueDiv.remove();
    }, 1000);
}

function playSound(type) {
   
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        if (type === 'click') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.2);
        } else if (type === 'buy') {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        } else if (type === 'unlock') {
            const unlockOsc1 = audioCtx.createOscillator();
            const unlockOsc2 = audioCtx.createOscillator();
            const unlockGain = audioCtx.createGain();
            
            unlockOsc1.type = 'sine';
            unlockOsc2.type = 'sine';
            
            unlockOsc1.frequency.setValueAtTime(880, audioCtx.currentTime);
            unlockOsc2.frequency.setValueAtTime(1320, audioCtx.currentTime);
            
            unlockOsc1.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.3);
            unlockOsc2.frequency.exponentialRampToValueAtTime(2640, audioCtx.currentTime + 0.3);
            
            unlockGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            unlockGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            
            unlockOsc1.connect(unlockGain);
            unlockOsc2.connect(unlockGain);
            unlockGain.connect(audioCtx.destination);
            
            unlockOsc1.start();
            unlockOsc2.start();
            unlockOsc1.stop(audioCtx.currentTime + 0.5);
            unlockOsc2.stop(audioCtx.currentTime + 0.5);
        }
    } catch (e) {
        console.warn('Web Audio API not supported', e);
    }
}

function gameLoop() {
   
    const now = Date.now();
    if (typeof gameLoop.lastUpdate === 'undefined') {
        gameLoop.lastUpdate = now;
    }
    
    const deltaTime = (now - gameLoop.lastUpdate) / 1000;
    gameLoop.lastUpdate = now;
    
   
    score += scorePerSecond * deltaTime;
    
   
    updateScore();
    updateUpgrades();
    
   
    if (now % 10000 < 16) {
        saveGame();
    }
    
    requestAnimationFrame(gameLoop);
}

function saveGame() {
    const gameState = {
        score,
        clickValue,
        upgrades: upgrades.map(upgrade => ({
            id: upgrade.id,
            owned: upgrade.owned,
            unlocked: upgrade.unlocked
        })),
        lastSave: Date.now()
    };
    
    localStorage.setItem('tennaClickerSave', JSON.stringify(gameState));
}

function loadGame() {
    const savedGame = localStorage.getItem('tennaClickerSave');
    if (!savedGame) return;
    
    try {
        const gameState = JSON.parse(savedGame);
        
        score = parseFloat(gameState.score) || 0;
        clickValue = parseFloat(gameState.clickValue) || 1;
        
        if (gameState.upgrades) {
            gameState.upgrades.forEach(savedUpgrade => {
                const upgrade = upgrades.find(u => u.id === savedUpgrade.id);
                if (upgrade) {
                    upgrade.owned = savedUpgrade.owned || 0;
                    upgrade.unlocked = savedUpgrade.unlocked || false;
                }
            });
        }
        
       
        if (!upgrades.some(u => u.unlocked)) {
            upgrades[0].unlocked = true;
        }
        
        updateScore();
        updateUpgrades();
        createUpgradeElements();
        
       
        if (gameState.lastSave) {
            const offlineTime = (Date.now() - gameState.lastSave) / 1000;
            const maxOfflineTime = 24 * 60 * 60;
            const actualOfflineTime = Math.min(offlineTime, maxOfflineTime);
            
            if (actualOfflineTime > 60) {
                const offlineEarnings = Math.floor(scorePerSecond * actualOfflineTime * 0.5);
                if (offlineEarnings > 0) {
                    score += offlineEarnings;
                    
                   
                    const notification = document.createElement('div');
                    notification.className = 'notification';
                    notification.textContent = `While you were away, you earned ${formatNumber(offlineEarnings)} T!`;
                    notification.style.cssText = `
                        position: fixed;
                        top: 20px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0, 0, 0, 0.8);
                        color: #4cc9f0;
                        padding: 10px 20px;
                        border-radius: 20px;
                        z-index: 1000;
                        animation: slideDown 0.5s ease-out;
                    `;
                    
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        notification.style.animation = 'fadeOut 0.5s ease-out';
                        setTimeout(() => notification.remove(), 500);
                    }, 5000);
                    
                   
                    const style = document.createElement('style');
                    style.textContent = `
                        @keyframes slideDown {
                            from { opacity: 0; transform: translate(-50%, -30px); }
                            to { opacity: 1; transform: translate(-50%, 0); }
                        }
                        @keyframes fadeOut {
                            from { opacity: 1; }
                            to { opacity: 0; }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        }
    } catch (e) {
        console.error('Failed to load saved game', e);
    }
}

function init() {
   
    loadGame();
    
   
       
    const muteButton = document.getElementById('mute-button');
    const backgroundMusic = document.getElementById('background-music');
    const menuScreen = document.getElementById('menu-screen');
    const playButton = document.getElementById('play-button');
    const tryAutoplay = () => {
        if (!backgroundMusic) return;
        backgroundMusic.volume = 0.5;
        backgroundMusic.muted = false;
        return backgroundMusic.play().then(() => {
            if (muteButton) muteButton.textContent = 'Mute';
        }).catch(() => {
           
            backgroundMusic.muted = true;
            if (muteButton) muteButton.textContent = 'Unmute';
        });
    };
   
    tryAutoplay();
   
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && backgroundMusic && (backgroundMusic.muted || backgroundMusic.paused)) {
            tryAutoplay();
        }
    });
   
    const pointerStartHandler = () => {
        tryAutoplay();
        document.removeEventListener('pointerdown', pointerStartHandler, { capture: true });
    };
    document.addEventListener('pointerdown', pointerStartHandler, { capture: true, once: true });

    if (muteButton && backgroundMusic) {
        muteButton.addEventListener('click', () => {
            const willUnmute = backgroundMusic.muted || backgroundMusic.paused;
            if (willUnmute) {
                backgroundMusic.muted = false;
                backgroundMusic.play().catch(err => {
                    console.error('Music playback failed:', err);
                });
                muteButton.textContent = 'Mute';
            } else {
                backgroundMusic.muted = true;
                muteButton.textContent = 'Unmute';
            }
        });
    }

    // Menu Play button: start music with user gesture and hide menu
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (backgroundMusic) {
                backgroundMusic.muted = false;
                backgroundMusic.volume = 0.5;
                backgroundMusic.play().catch(err => console.error('Music playback failed:', err));
            }
            if (muteButton) muteButton.textContent = 'Mute';
            if (menuScreen) menuScreen.style.display = 'none';
        });
    }

    tennaButton.addEventListener('click', (e) => {
        const rect = tennaImg.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
       
        score += clickValue;
        updateScore();
        
       
        createClickEffect(e.clientX, e.clientY);
        
       
        playSound('click');
        
       
        tennaImg.style.transform = 'scale(0.95)';
        setTimeout(() => {
            tennaImg.style.transform = 'scale(1)';
        }, 100);
    });
    
   
    createUpgradeElements();
    
   
    requestAnimationFrame(gameLoop);
    
   
    window.addEventListener('beforeunload', saveGame);
}

document.addEventListener('DOMContentLoaded', init);
