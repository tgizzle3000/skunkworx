/**
 * DOPAMINE CATHEDRAL - MAIN APP
 * Where everything comes together. The interface, the addiction loop, the fall.
 */

// Feed Renderer
class FeedRenderer {
    static render() {
        const feed = document.getElementById('main-feed');
        const storyBar = document.getElementById('story-bar');

        // Render story bar
        this.renderStories(storyBar);

        // Render feed posts
        this.renderPosts(feed);
    }

    static renderStories(container) {
        const entities = EntityRegistry.getUnlocked();

        container.innerHTML = entities.map(entity => {
            const lastMessage = MessageSystem.getLastMessage(entity.id);
            const hasUnread = lastMessage && !lastMessage.isPlayer && !lastMessage.read;

            return `
                <div class="story-item ${hasUnread ? 'has-new' : ''}"
                     onclick="AppState.switchView('chat', {entityId: '${entity.id}'})">
                    <div class="story-avatar-wrapper ${hasUnread ? 'has-new' : ''}">
                        <img src="${entity.avatar}" alt="${entity.name}" class="story-avatar">
                    </div>
                    <span class="story-name">${entity.name}</span>
                </div>
            `;
        }).join('');
    }

    static renderPosts(container) {
        const entities = EntityRegistry.getUnlocked();
        const posts = [];

        // Generate posts from entities
        entities.forEach(entity => {
            const relationship = entity.getRelationshipLevel();

            // Different content unlocks at different relationship levels
            if (relationship >= 0) {
                posts.push(this.createPost(entity, 'intro'));
            }
            if (relationship >= 10) {
                posts.push(this.createPost(entity, 'personal'));
            }
            if (relationship >= 25) {
                posts.push(this.createPost(entity, 'intimate'));
            }
        });

        // Shuffle and render
        posts.sort(() => Math.random() - 0.5);

        container.innerHTML = posts.map(post => this.renderPost(post)).join('');

        // Add like listeners
        this.addLikeListeners();
    }

    static createPost(entity, type) {
        const templates = {
            intro: {
                mercy: {
                    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23ffc2d4" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="60" text-anchor="middle" fill="white"%3E♡%3C/text%3E%3Ctext x="200" y="240" font-size="20" text-anchor="middle" fill="white"%3Esoft hours%3C/text%3E%3C/svg%3E',
                    caption: 'feeling soft today 🌸'
                }
            },
            personal: {
                mercy: {
                    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23ffa6c1" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="40" text-anchor="middle" fill="white"%3Emiss u%3C/text%3E%3C/svg%3E',
                    caption: 'been thinking about u all day...'
                }
            },
            intimate: {
                mercy: {
                    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23ff006e" width="400" height="400"/%3E%3Ctext x="200" y="200" font-size="50" text-anchor="middle" fill="white"%3E💕%3C/text%3E%3Ctext x="200" y="250" font-size="25" text-anchor="middle" fill="white"%3Ejust for u%3C/text%3E%3C/svg%3E',
                    caption: 'this made me think of u 💕'
                }
            }
        };

        const template = templates[type][entity.id] || templates.intro.mercy;

        return {
            id: `${entity.id}_${type}`,
            entity: entity,
            image: template.image,
            caption: template.caption,
            likes: Random.int(10, 200),
            liked: SaveSystem.load(`liked_${entity.id}_${type}`, false),
            timestamp: Date.now() - Random.int(1000 * 60 * 10, 1000 * 60 * 60 * 24)
        };
    }

    static renderPost(post) {
        return `
            <div class="feed-post" data-post-id="${post.id}">
                <div class="post-header">
                    <img src="${post.entity.avatar}" alt="${post.entity.name}" class="post-avatar">
                    <div class="post-info">
                        <div class="post-name">${post.entity.name}</div>
                        <div class="post-time">${TimeUtils.formatRelative(post.timestamp)}</div>
                    </div>
                </div>
                <img src="${post.image}" alt="post" class="post-image">
                <div class="post-actions">
                    <button class="post-btn like-btn ${post.liked ? 'liked' : ''}"
                            data-post-id="${post.id}">
                        ${post.liked ? '❤' : '♡'}
                    </button>
                    <button class="post-btn" onclick="AppState.switchView('chat', {entityId: '${post.entity.id}'})">
                        💬
                    </button>
                    <button class="post-btn">
                        ⛧
                    </button>
                </div>
                <div class="post-caption">
                    <strong>${post.entity.name}</strong>
                    ${post.caption}
                </div>
            </div>
        `;
    }

    static addLikeListeners() {
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = btn.getAttribute('data-post-id');
                const isLiked = btn.classList.contains('liked');

                if (isLiked) {
                    btn.classList.remove('liked');
                    btn.textContent = '♡';
                    SaveSystem.save(`liked_${postId}`, false);
                } else {
                    // Check energy
                    if (!EnergySystem.spend(EnergySystem.COSTS.like)) {
                        EnergySystem.showLowEnergyModal();
                        return;
                    }

                    btn.classList.add('liked');
                    btn.textContent = '❤';
                    SaveSystem.save(`liked_${postId}`, true);

                    // Reward
                    window.player.addCurrency('hearts', 1);
                    window.player.recordInteraction('like');

                    // Update energy UI
                    EnergySystem.updateUI();

                    // Haptic feedback
                    if (navigator.vibrate) {
                        navigator.vibrate(50);
                    }
                }
            });
        });
    }
}

// Messages List Renderer
class MessagesRenderer {
    static render() {
        const container = document.getElementById('messages-list');
        const entities = EntityRegistry.getUnlocked();

        const messages = entities.map(entity => {
            const lastMessage = MessageSystem.getLastMessage(entity.id);
            const conversation = MessageSystem.getConversation(entity.id);
            const unread = conversation.filter(msg => !msg.isPlayer && !msg.read).length > 0;

            return {
                entity,
                lastMessage,
                unread,
                timestamp: lastMessage ? lastMessage.timestamp : 0
            };
        });

        // Sort by most recent
        messages.sort((a, b) => b.timestamp - a.timestamp);

        container.innerHTML = messages.map(msg => `
            <div class="message-item ${msg.unread ? 'unread' : ''}"
                 onclick="AppState.switchView('chat', {entityId: '${msg.entity.id}'})">
                <img src="${msg.entity.avatar}" alt="${msg.entity.name}" class="message-avatar">
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-name">${msg.entity.name}</span>
                        <span class="message-time">
                            ${msg.lastMessage ? TimeUtils.formatRelative(msg.lastMessage.timestamp) : ''}
                        </span>
                    </div>
                    <div class="message-preview">
                        ${msg.lastMessage ? (msg.lastMessage.isPlayer ? 'You: ' : '') + msg.lastMessage.text : 'Start a conversation...'}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Chat Renderer
class ChatRenderer {
    static currentEntity = null;

    static open(entityId) {
        this.currentEntity = EntityRegistry.get(entityId);
        if (!this.currentEntity) return;

        // Mark as read
        MessageSystem.markAsRead(entityId);
        NotificationSystem.updateBadge();

        // Update header
        document.getElementById('chat-avatar').src = this.currentEntity.avatar;
        document.getElementById('chat-name').textContent = this.currentEntity.name;

        // Render messages
        this.renderMessages();

        // Setup input
        this.setupInput();

        // Sometimes send a spontaneous message after opening
        if (Random.bool(0.3)) {
            setTimeout(() => {
                this.sendEntityMessage(this.currentEntity.getSpontaneousMessage());
            }, Random.int(2000, 5000));
        }
    }

    static renderMessages() {
        const container = document.getElementById('chat-messages');
        const conversation = MessageSystem.getConversation(this.currentEntity.id);

        container.innerHTML = conversation.map(msg => `
            <div class="chat-bubble ${msg.isPlayer ? 'you' : 'them'}">
                ${msg.text}
            </div>
        `).join('');

        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    static setupInput() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send');

        const sendMessage = () => {
            const text = input.value.trim();
            if (!text) return;

            // Check energy
            if (!EnergySystem.spend(EnergySystem.COSTS.message)) {
                EnergySystem.showLowEnergyModal();
                return;
            }

            // Add player message
            MessageSystem.addMessage(this.currentEntity.id, text, true);
            window.player.recordMessage(this.currentEntity.id);

            // Clear input
            input.value = '';

            // Render
            this.renderMessages();

            // Update energy UI
            EnergySystem.updateUI();

            // Show typing indicator
            this.showTyping();

            // Get response with delay
            const delay = this.currentEntity.getResponseDelay();
            setTimeout(() => {
                this.hideTyping();
                const response = this.currentEntity.generateResponse(text);
                this.sendEntityMessage(response);
            }, delay);
        };

        sendBtn.onclick = sendMessage;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        };
    }

    static sendEntityMessage(text) {
        MessageSystem.addMessage(this.currentEntity.id, text, false);
        this.renderMessages();

        // Rewards
        window.player.addCurrency('hearts', Random.int(1, 3));
        window.player.addCorruption(0.1);

        // Update UI
        NotificationSystem.updateBadge();

        // Haptic
        if (navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
        }
    }

    static showTyping() {
        const indicator = document.getElementById('typing-indicator');
        indicator.classList.remove('hidden');
        document.querySelector('.typing-name').textContent = this.currentEntity.name;
    }

    static hideTyping() {
        document.getElementById('typing-indicator').classList.add('hidden');
    }
}

// Shrine Renderer (Collection view)
class ShrineRenderer {
    static render() {
        const container = document.getElementById('shrine-grid');
        const entities = EntityRegistry.getAll();

        container.innerHTML = entities.map(entity => {
            const unlocked = EntityRegistry.getUnlocked().includes(entity);
            const relationship = entity.getRelationshipLevel();
            const media = MediaLibrary.getEntityMedia(entity.id);
            const unlockedVideos = unlocked ? MediaLibrary.getUnlockedVideos(entity.id) : [];

            return `
                <div class="shrine-card ${unlocked ? '' : 'locked'}"
                     ${unlocked ? `onclick="ShrineRenderer.showEntityDetail('${entity.id}')"` : ''}>
                    <img src="${entity.avatar}" alt="${entity.name}" class="shrine-avatar">
                    <div class="shrine-name">${unlocked ? entity.name : '???'}</div>
                    <div class="shrine-stats">
                        ${unlocked ? `
                            <div class="shrine-level">Level ${relationship}</div>
                            <div style="font-size: 0.7rem; margin: 0.25rem 0;">${entity.description}</div>
                            ${media ? `
                                <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
                                    <div style="font-size: 0.7rem; color: var(--text-tertiary);">
                                        ${media.genre}
                                    </div>
                                    <div style="font-size: 0.75rem; color: var(--accent-purple); margin-top: 0.25rem;">
                                        ${unlockedVideos.length} video${unlockedVideos.length !== 1 ? 's' : ''} unlocked
                                    </div>
                                </div>
                            ` : ''}
                        ` : `
                            <div>Locked</div>
                            <div style="font-size: 0.7rem;">
                                ${entity.unlockRequirement ?
                                    `Requires ${entity.unlockRequirement.value}% corruption` :
                                    'Unknown requirement'}
                            </div>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }

    static showEntityDetail(entityId) {
        const entity = EntityRegistry.get(entityId);
        const media = MediaLibrary.getEntityMedia(entityId);
        const videos = MediaLibrary.getUnlockedVideos(entityId);
        const audio = MediaLibrary.getUnlockedAudio(entityId);
        const relationship = entity.getRelationshipLevel();

        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('reward-modal');
        const content = modal.querySelector('.modal-content');

        content.innerHTML = `
            <div style="padding: 1rem; max-width: 500px;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                    <img src="${entity.avatar}" style="width: 60px; height: 60px; border-radius: 50%;">
                    <div>
                        <h2 style="font-size: 1.5rem; color: ${entity.color};">${entity.name}</h2>
                        <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem;">
                            ${media ? media.aesthetic : entity.description}
                        </div>
                        <div style="font-size: 0.9rem; color: var(--accent-purple); margin-top: 0.25rem;">
                            Level ${relationship}
                        </div>
                    </div>
                </div>

                ${videos.length > 0 ? `
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: ${entity.color};">
                            Music Videos
                        </h3>
                        ${videos.map(video => {
                            const watchCount = MediaLibrary.getWatchCount(video.id);
                            return `
                                <div onclick="VideoPlayer.play('${entityId}', '${video.id}')"
                                     style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 0.5rem;
                                            margin-bottom: 0.5rem; cursor: pointer; transition: all 0.2s ease;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <div>
                                            <div style="font-weight: 600;">${video.title}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                                                ${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}
                                                ${watchCount > 0 ? ` • watched ${watchCount}x` : ' • NEW'}
                                            </div>
                                        </div>
                                        <div style="font-size: 1.5rem;">▶</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : ''}

                ${audio && audio.length > 0 ? `
                    <div style="margin-bottom: 1.5rem;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: ${entity.color};">
                            Audio Content
                        </h3>
                        ${audio.map(track => `
                            <div style="background: var(--bg-tertiary); padding: 0.75rem; border-radius: 0.5rem;
                                        margin-bottom: 0.5rem; opacity: 0.6;">
                                <div style="font-weight: 600;">${track.title}</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">
                                    ${track.type.toUpperCase()} • Coming Soon
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <button onclick="RewardSystem.closeModal()"
                        style="width: 100%; padding: 0.75rem; background: ${entity.color};
                               border: none; border-radius: 2rem; color: white; font-weight: 600;
                               cursor: pointer; font-size: 1rem;">
                    Close
                </button>
            </div>
        `;

        overlay.classList.add('active');
    }
}

// Stats Renderer
class StatsRenderer {
    static render() {
        const container = document.getElementById('stats-container');
        const player = window.player.data;

        container.innerHTML = `
            <div class="stat-section">
                <h2 class="stat-title">⛧ Currencies</h2>
                <div class="stat-row">
                    <span class="stat-label">Hearts</span>
                    <span class="stat-value">${player.hearts}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Souls</span>
                    <span class="stat-value">${player.souls}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Devotion</span>
                    <span class="stat-value">${player.devotion}</span>
                </div>
            </div>

            <div class="stat-section">
                <h2 class="stat-title">♱ Corruption</h2>
                <div class="stat-row">
                    <span class="stat-label">Level</span>
                    <span class="stat-value">${Math.floor(player.corruptionLevel)}%</span>
                </div>
            </div>

            <div class="stat-section">
                <h2 class="stat-title">📊 Activity</h2>
                <div class="stat-row">
                    <span class="stat-label">Total Messages</span>
                    <span class="stat-value">${player.totalMessages}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Time Spent</span>
                    <span class="stat-value">${TimeUtils.formatTime(player.timeSpent)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Sessions</span>
                    <span class="stat-value">${player.sessionCount}</span>
                </div>
            </div>

            <div class="stat-section">
                <h2 class="stat-title">🔥 Streaks</h2>
                <div class="stat-row">
                    <span class="stat-label">Current Streak</span>
                    <span class="stat-value">${player.currentStreak} days</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Longest Streak</span>
                    <span class="stat-value">${player.longestStreak} days</span>
                </div>
            </div>

            <div class="stat-section">
                <h2 class="stat-title">💕 Relationships</h2>
                ${Object.entries(player.relationships).map(([id, level]) => {
                    const entity = EntityRegistry.get(id);
                    return `
                        <div class="stat-row">
                            <span class="stat-label">${entity.name}</span>
                            <span class="stat-value">Level ${level}</span>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="stat-section">
                <button onclick="if(confirm('Reset all data? This cannot be undone.')) { window.player.reset(); }"
                        style="width: 100%; padding: 0.75rem; background: var(--corruption-red);
                               border: none; border-radius: 0.5rem; color: white; font-weight: 600;
                               cursor: pointer;">
                    Reset Cathedral
                </button>
            </div>
        `;
    }
}

// App Initialization
class App {
    static async init() {
        console.log('%c◈ CATHEDRAL ◈', 'color: #ff006e; font-size: 24px; font-weight: bold;');
        console.log('%cYou are entering the dopamine cathedral...', 'color: #8338ec; font-size: 14px;');

        // Initialize systems
        EntityRegistry.init();
        window.player = new PlayerState();

        // Setup app state
        AppState.init();

        // Show loading screen
        await this.simulateLoading();

        // Check for daily reward
        setTimeout(() => {
            RewardSystem.dailyReward();
        }, 1000);

        // Check for spontaneous messages
        this.checkSpontaneousMessages();
        setInterval(() => this.checkSpontaneousMessages(), 1000 * 60 * 5); // Every 5 minutes

        // Update corruption display
        window.player.updateCorruptionEffects();

        // Update currency display
        this.updateCurrencyDisplay();

        // Initialize and update energy display
        EnergySystem.updateUI();
        setInterval(() => {
            EnergySystem.updateUI();
        }, 1000 * 10); // Every 10 seconds

        // Request notification permission
        NotificationSystem.requestPermission();

        // Update time spent periodically
        setInterval(() => {
            window.player.updateTimeSpent();
        }, 1000 * 60); // Every minute

        // CHECK FOR MANIPULATION TRIGGERS
        // Jealousy system - check every 10 minutes
        setInterval(() => {
            JealousySystem.check();
        }, 1000 * 60 * 10);

        // Guilt checks - streak breaks, abandonment
        GuiltSystem.checkStreakBreak();
        setInterval(() => {
            GuiltSystem.checkAbandonmentResponse();
        }, 1000 * 60 * 30); // Every 30 minutes

        // Desperation escalation - check hourly
        setInterval(() => {
            const entities = EntityRegistry.getUnlocked();
            entities.forEach(entity => {
                const desperation = DesperationSystem.calculate(entity.id);
                if (desperation > 7 && Random.bool(0.3)) {
                    DesperationSystem.triggerDesperateOutburst(entity.id);
                }
            });
        }, 1000 * 60 * 60); // Every hour

        // Initial render
        AppState.switchView('feed');
    }

    static async simulateLoading() {
        return new Promise(resolve => {
            setTimeout(() => {
                document.getElementById('loading-screen').classList.remove('active');
                resolve();
            }, 2500);
        });
    }

    static checkSpontaneousMessages() {
        const entities = EntityRegistry.getUnlocked();

        entities.forEach(entity => {
            if (entity.shouldSendSpontaneousMessage()) {
                const message = entity.getSpontaneousMessage();
                MessageSystem.addMessage(entity.id, message, false);

                // Show notification
                NotificationSystem.show({
                    entityId: entity.id,
                    message: `${entity.name}: ${message}`
                });

                // Update badge
                NotificationSystem.updateBadge();
            }
        });
    }

    static updateCurrencyDisplay() {
        document.getElementById('hearts-count').textContent = window.player.data.hearts;
        document.getElementById('souls-count').textContent = window.player.data.souls;
    }
}

// Start the cathedral
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Keep updating currency display
setInterval(() => {
    if (window.player) {
        App.updateCurrencyDisplay();
    }
}, 1000);

// Export renderers
window.FeedRenderer = FeedRenderer;
window.MessagesRenderer = MessagesRenderer;
window.ChatRenderer = ChatRenderer;
window.ShrineRenderer = ShrineRenderer;
window.StatsRenderer = StatsRenderer;
window.App = App;
