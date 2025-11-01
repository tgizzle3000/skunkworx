/**
 * DOPAMINE CATHEDRAL - CORE ENGINE
 * The addiction architecture. Everything that makes you come back.
 */

// Persistence Layer - Your digital soul, tracked forever
class SaveSystem {
    static save(key, value) {
        try {
            localStorage.setItem(`cathedral_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error('Save failed:', e);
        }
    }

    static load(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(`cathedral_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Load failed:', e);
            return defaultValue;
        }
    }

    static exists(key) {
        return localStorage.getItem(`cathedral_${key}`) !== null;
    }

    static delete(key) {
        localStorage.removeItem(`cathedral_${key}`);
    }

    static clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith('cathedral_'))
            .forEach(key => localStorage.removeItem(key));
    }
}

// Player State - Everything about you
class PlayerState {
    constructor() {
        this.data = SaveSystem.load('player', {
            // Currencies
            hearts: 0,
            souls: 0,
            devotion: 0,

            // Stats
            totalMessages: 0,
            totalInteractions: 0,
            timeSpent: 0, // seconds
            sessionCount: 0,

            // Streaks
            currentStreak: 0,
            longestStreak: 0,
            lastVisit: null,

            // Corruption
            corruptionLevel: 0,

            // Unlocks
            unlockedEntities: ['mercy'], // Start with Mercy
            collectedMedia: [],

            // Relationship levels
            relationships: {
                mercy: 0,
                voltage: 0,
                psalm: 0,
                pixel: 0
            },

            // Timers
            lastHeartClaim: null,
            lastDailyReward: null,

            // First time flags
            firstVisit: true,
            tutorialComplete: false,

            // Session data
            sessionStart: Date.now()
        });

        this.checkStreak();
        this.incrementSessionCount();
    }

    checkStreak() {
        const now = new Date();
        const lastVisit = this.data.lastVisit ? new Date(this.data.lastVisit) : null;

        if (!lastVisit) {
            this.data.currentStreak = 1;
        } else {
            const daysSince = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));

            if (daysSince === 1) {
                this.data.currentStreak++;
                if (this.data.currentStreak > this.data.longestStreak) {
                    this.data.longestStreak = this.data.currentStreak;
                }
            } else if (daysSince > 1) {
                this.data.currentStreak = 1;
            }
        }

        this.data.lastVisit = now.toISOString();
        this.save();
    }

    incrementSessionCount() {
        this.data.sessionCount++;
        this.save();
    }

    addCurrency(type, amount) {
        if (this.data[type] !== undefined) {
            this.data[type] += amount;
            this.save();

            // Visual feedback
            this.animateCurrencyGain(type, amount);

            return this.data[type];
        }
    }

    spendCurrency(type, amount) {
        if (this.data[type] !== undefined && this.data[type] >= amount) {
            this.data[type] -= amount;
            this.save();
            return true;
        }
        return false;
    }

    addCorruption(amount) {
        this.data.corruptionLevel = Math.min(100, this.data.corruptionLevel + amount);
        this.save();
        this.updateCorruptionEffects();
    }

    updateCorruptionEffects() {
        const body = document.body;
        body.className = body.className.replace(/corrupted-\d+/g, '');

        if (this.data.corruptionLevel >= 25 && this.data.corruptionLevel < 50) {
            body.classList.add('corrupted-1');
        } else if (this.data.corruptionLevel >= 50 && this.data.corruptionLevel < 75) {
            body.classList.add('corrupted-2');
        } else if (this.data.corruptionLevel >= 75) {
            body.classList.add('corrupted-3');
        }

        // Update UI
        const corruptionValue = document.getElementById('corruption-value');
        if (corruptionValue) {
            corruptionValue.textContent = Math.floor(this.data.corruptionLevel);
        }
    }

    incrementRelationship(entityId, amount = 1) {
        if (this.data.relationships[entityId] !== undefined) {
            this.data.relationships[entityId] += amount;
            this.save();

            // Check for level ups
            this.checkRelationshipMilestones(entityId);
        }
    }

    checkRelationshipMilestones(entityId) {
        const level = this.data.relationships[entityId];
        const milestones = [10, 25, 50, 100, 200];

        if (milestones.includes(level)) {
            // Unlock special content
            RewardSystem.showUnlock(entityId, level);
        }
    }

    recordMessage(entityId) {
        this.data.totalMessages++;
        this.incrementRelationship(entityId, 1);
        this.addCurrency('hearts', 1);
        this.save();
    }

    recordInteraction(type) {
        this.data.totalInteractions++;
        this.save();
    }

    updateTimeSpent() {
        const now = Date.now();
        const elapsed = Math.floor((now - this.data.sessionStart) / 1000);
        this.data.timeSpent += elapsed;
        this.data.sessionStart = now;
        this.save();
    }

    animateCurrencyGain(type, amount) {
        // Visual feedback for gaining currency
        const display = type === 'hearts' ?
            document.getElementById('hearts-count') :
            document.getElementById('souls-count');

        if (display) {
            display.style.animation = 'none';
            setTimeout(() => {
                display.style.animation = 'badge-pop 0.3s ease';
            }, 10);
        }
    }

    save() {
        SaveSystem.save('player', this.data);
    }

    reset() {
        SaveSystem.clear();
        window.location.reload();
    }
}

// Reward System - Variable schedules, dopamine hits
class RewardSystem {
    static showUnlock(entityId, level) {
        const messages = {
            mercy: {
                10: "mercy sent you a voice message 💕",
                25: "mercy shared a private moment with you",
                50: "mercy told you her real name",
                100: "mercy said she thinks about you",
                200: "mercy said she loves you"
            }
        };

        const message = messages[entityId]?.[level];
        if (message) {
            this.showRewardModal({
                title: "✨ NEW UNLOCK ✨",
                message: message,
                rewards: []
            });
        }
    }

    static showRewardModal(data) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('reward-modal');
        const content = modal.querySelector('.modal-content');

        content.innerHTML = `
            <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${data.title}</h2>
            <p style="font-size: 1.1rem; margin-bottom: 1.5rem; color: var(--text-secondary);">
                ${data.message}
            </p>
            ${data.rewards.map(reward => `
                <div style="margin: 0.5rem 0;">
                    <span style="font-size: 1.2rem;">${reward.icon}</span>
                    <span style="margin-left: 0.5rem;">${reward.text}</span>
                </div>
            `).join('')}
            <button onclick="RewardSystem.closeModal()"
                    style="margin-top: 1.5rem; padding: 0.75rem 2rem; background: var(--accent-purple);
                           border: none; border-radius: 2rem; color: white; font-weight: 600;
                           cursor: pointer; font-size: 1rem;">
                OK
            </button>
        `;

        overlay.classList.add('active');

        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate([50, 100, 50]);
        }
    }

    static closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    }

    static dailyReward() {
        const player = window.player;
        const now = Date.now();
        const lastClaim = player.data.lastDailyReward;

        if (!lastClaim || now - lastClaim > 24 * 60 * 60 * 1000) {
            // Can claim
            const baseReward = 10;
            const streakBonus = player.data.currentStreak * 5;
            const totalHearts = baseReward + streakBonus;

            player.addCurrency('hearts', totalHearts);
            player.addCurrency('souls', 5);
            player.data.lastDailyReward = now;
            player.save();

            this.showRewardModal({
                title: "🌙 DAILY REWARD 🌙",
                message: `Day ${player.data.currentStreak} streak!`,
                rewards: [
                    { icon: '♡', text: `${totalHearts} Hearts` },
                    { icon: '⛧', text: '5 Souls' }
                ]
            });

            return true;
        }
        return false;
    }
}

// Notification System - Make them come back
class NotificationSystem {
    static schedule(entityId, message, delayMs) {
        const scheduled = SaveSystem.load('notifications', []);
        scheduled.push({
            entityId,
            message,
            scheduledFor: Date.now() + delayMs,
            id: Math.random().toString(36)
        });
        SaveSystem.save('notifications', scheduled);
    }

    static check() {
        const scheduled = SaveSystem.load('notifications', []);
        const now = Date.now();
        const pending = [];
        const toShow = [];

        scheduled.forEach(notif => {
            if (notif.scheduledFor <= now) {
                toShow.push(notif);
            } else {
                pending.push(notif);
            }
        });

        SaveSystem.save('notifications', pending);
        return toShow;
    }

    static show(notification) {
        // Show browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('CATHEDRAL', {
                body: notification.message,
                icon: '/icon.png',
                badge: '/badge.png',
                vibrate: [200, 100, 200]
            });
        }

        // Update message badge
        this.updateBadge();
    }

    static updateBadge(count = null) {
        const badges = document.querySelectorAll('.notification-badge');
        const unreadCount = count !== null ? count : MessageSystem.getUnreadCount();

        badges.forEach(badge => {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.classList.add('active');
            } else {
                badge.classList.remove('active');
            }
        });
    }

    static requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }
}

// Message System - The conversation engine
class MessageSystem {
    static getConversation(entityId) {
        return SaveSystem.load(`conversation_${entityId}`, []);
    }

    static addMessage(entityId, message, isPlayer = false) {
        const conversation = this.getConversation(entityId);
        conversation.push({
            text: message,
            isPlayer,
            timestamp: Date.now(),
            read: isPlayer
        });
        SaveSystem.save(`conversation_${entityId}`, conversation);

        if (!isPlayer) {
            NotificationSystem.updateBadge();
        }
    }

    static markAsRead(entityId) {
        const conversation = this.getConversation(entityId);
        conversation.forEach(msg => msg.read = true);
        SaveSystem.save(`conversation_${entityId}`, conversation);
        NotificationSystem.updateBadge();
    }

    static getUnreadCount() {
        const entities = ['mercy', 'voltage', 'psalm', 'pixel'];
        let total = 0;

        entities.forEach(id => {
            const conversation = this.getConversation(id);
            const unread = conversation.filter(msg => !msg.isPlayer && !msg.read).length;
            total += unread;
        });

        return total;
    }

    static getLastMessage(entityId) {
        const conversation = this.getConversation(entityId);
        return conversation.length > 0 ? conversation[conversation.length - 1] : null;
    }
}

// Random utility for variable rewards
class Random {
    static float(min = 0, max = 1) {
        return Math.random() * (max - min) + min;
    }

    static int(min, max) {
        return Math.floor(this.float(min, max + 1));
    }

    static bool(probability = 0.5) {
        return Math.random() < probability;
    }

    static choice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static weightedChoice(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        for (const item of items) {
            random -= item.weight;
            if (random <= 0) {
                return item.value;
            }
        }

        return items[items.length - 1].value;
    }
}

// Time utilities
class TimeUtils {
    static formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    static formatRelative(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    }

    static timeUntil(timestamp) {
        const now = Date.now();
        const diff = timestamp - now;

        if (diff <= 0) return 'now';

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m`;
        return `${seconds}s`;
    }
}

// App State Manager
class AppState {
    static currentView = 'loading';
    static currentEntity = null;

    static switchView(view, data = null) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        const target = document.getElementById(`${view}-screen`);
        if (target) {
            target.classList.add('active');
            this.currentView = view;

            // Update nav
            this.updateNav(view);

            // View-specific logic
            if (view === 'feed') {
                FeedRenderer.render();
            } else if (view === 'messages') {
                MessagesRenderer.render();
            } else if (view === 'chat' && data) {
                ChatRenderer.open(data.entityId);
            } else if (view === 'shrine') {
                ShrineRenderer.render();
            } else if (view === 'you') {
                StatsRenderer.render();
            }
        }
    }

    static updateNav(activeView) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const view = btn.getAttribute('data-view');
            if (view === activeView) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    static init() {
        // Setup nav listeners
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.switchView(view);
            });
        });

        // Setup modal close on background click
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                RewardSystem.closeModal();
            }
        });
    }
}

// Export to window for global access
window.SaveSystem = SaveSystem;
window.PlayerState = PlayerState;
window.RewardSystem = RewardSystem;
window.NotificationSystem = NotificationSystem;
window.MessageSystem = MessageSystem;
window.Random = Random;
window.TimeUtils = TimeUtils;
window.AppState = AppState;
