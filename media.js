/**
 * DOPAMINE CATHEDRAL - MEDIA SYSTEM
 * The videos. The audio. The sensory assault that keeps you hooked.
 * Music videos as "ads" but they're also rewards. Watch to restore energy.
 */

// Media/Content System
class MediaLibrary {
    static library = {
        // MERCY - Riot grrrl x bubblegum trap x hypnosis
        mercy: {
            genre: "soft-domme hypno-pop",
            aesthetic: "belle delphine meets kinkyshibby",
            primaryColor: "#ff006e",
            secondaryColor: "#ffc2d4",
            videos: [
                {
                    id: "mercy_001",
                    title: "soft for you",
                    type: "music_video",
                    unlockLevel: 0,
                    duration: 180, // seconds
                    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23ffc2d4' width='400' height='300'/%3E%3Ctext x='200' y='150' font-size='60' text-anchor='middle' fill='white'%3E♡%3C/text%3E%3Ctext x='200' y='200' font-size='20' text-anchor='middle' fill='white'%3Esoft for you%3C/text%3E%3C/svg%3E",
                    description: "mercy's first music video. bubblegum trap meets ASMR whispers.",
                    rewards: { hearts: 10, souls: 2, energy: 25 }
                },
                {
                    id: "mercy_002",
                    title: "miss u (hypno remix)",
                    type: "music_video",
                    unlockLevel: 25,
                    duration: 240,
                    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Cdefs%3E%3CradialGradient id='g'%3E%3Cstop offset='0' stop-color='%23ff006e'/%3E%3Cstop offset='1' stop-color='%23000'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='300'/%3E%3Ctext x='200' y='150' font-size='40' text-anchor='middle' fill='white'%3Emiss u%3C/text%3E%3C/svg%3E",
                    description: "WARNING: contains hypnotic frequencies. recommended for headphone use.",
                    rewards: { hearts: 20, souls: 5, energy: 50 }
                }
            ],
            audio: [
                {
                    id: "mercy_audio_001",
                    title: "goodnight baby (ASMR)",
                    type: "asmr",
                    unlockLevel: 10,
                    duration: 300,
                    description: "mercy whispers you to sleep. binaural audio.",
                    rewards: { hearts: 15, devotion: 5 }
                },
                {
                    id: "mercy_audio_002",
                    title: "you're mine (hypno track)",
                    type: "hypnosis",
                    unlockLevel: 50,
                    duration: 600,
                    description: "deep hypnosis session. listener discretion advised.",
                    rewards: { hearts: 30, souls: 10, devotion: 10, corruption: 5 }
                }
            ]
        },

        // VOLTAGE - Riot grrrl x horrorcore x breakcore
        voltage: {
            genre: "riot grrrl horrorcore",
            aesthetic: "stankonia meets scenecore chaos",
            primaryColor: "#8338ec",
            secondaryColor: "#ff006e",
            videos: [
                {
                    id: "voltage_001",
                    title: "MANIC PIXIE NIGHTMARE",
                    type: "music_video",
                    unlockLevel: 0,
                    duration: 150,
                    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23000' width='400' height='300'/%3E%3Crect fill='%238338ec' x='0' y='0' width='200' height='150'/%3E%3Crect fill='%23ff006e' x='200' y='150' width='200' height='150'/%3E%3Ctext x='200' y='150' font-size='50' text-anchor='middle' fill='white'%3E⚡%3C/text%3E%3C/svg%3E",
                    description: "chaos energy. breakcore x bratty rap. volume warning.",
                    rewards: { hearts: 15, souls: 5, energy: 30 }
                }
            ]
        },

        // PSALM - Deathrock x witchhouse x city pop
        psalm: {
            genre: "nu-goth witchhouse",
            aesthetic: "jirai kei meets bloody tears remix",
            primaryColor: "#3a86ff",
            secondaryColor: "#000000",
            videos: [
                {
                    id: "psalm_001",
                    title: "bloody tears (cathedral mix)",
                    type: "music_video",
                    unlockLevel: 0,
                    duration: 210,
                    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23000' width='400' height='300'/%3E%3Ctext x='200' y='150' font-size='80' text-anchor='middle' fill='%233a86ff'%3E✞%3C/text%3E%3Ctext x='200' y='200' font-size='20' text-anchor='middle' fill='%233a86ff'%3Eblood on the altar%3C/text%3E%3C/svg%3E",
                    description: "castlevania remix. gothic cathedral vibes. religious corruption.",
                    rewards: { hearts: 20, souls: 10, energy: 40 }
                }
            ]
        },

        // PIXEL - Sigilkore x acid house x glitch
        pixel: {
            genre: "sigilkore glitchcore",
            aesthetic: "trxsh x krushclub corruption",
            primaryColor: "#06ffa5",
            secondaryColor: "#ff006e",
            videos: [
                {
                    id: "pixel_001",
                    title: "c̷o̴r̷r̸u̴p̷t̸e̷d̴.mp4",
                    type: "glitch_video",
                    unlockLevel: 0,
                    duration: 120,
                    thumbnail: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%2306ffa5' width='400' height='300'/%3E%3Crect fill='%23ff006e' x='50' y='50' width='300' height='200' opacity='0.5'/%3E%3Ctext x='200' y='150' font-size='50' text-anchor='middle' fill='black'%3E◈ ERROR ◈%3C/text%3E%3C/svg%3E",
                    description: "WARNING: video file corrupted. play at own risk.",
                    rewards: { souls: 20, energy: 25, corruption: 10 }
                }
            ]
        }
    };

    static getEntityMedia(entityId) {
        return this.library[entityId] || null;
    }

    static getUnlockedVideos(entityId) {
        const media = this.getEntityMedia(entityId);
        if (!media) return [];

        const relationship = window.player.data.relationships[entityId] || 0;
        return media.videos.filter(video => relationship >= video.unlockLevel);
    }

    static getUnlockedAudio(entityId) {
        const media = this.getEntityMedia(entityId);
        if (!media || !media.audio) return [];

        const relationship = window.player.data.relationships[entityId] || 0;
        return media.audio.filter(audio => relationship >= audio.unlockLevel);
    }

    static hasWatched(mediaId) {
        return SaveSystem.load(`watched_${mediaId}`, false);
    }

    static markWatched(mediaId) {
        SaveSystem.save(`watched_${mediaId}`, true);
        SaveSystem.save(`watched_${mediaId}_count`,
            (SaveSystem.load(`watched_${mediaId}_count`, 0) + 1));
    }

    static getWatchCount(mediaId) {
        return SaveSystem.load(`watched_${mediaId}_count`, 0);
    }
}

// Energy System - depletes with interaction, restored by watching videos
class EnergySystem {
    static MAX_ENERGY = 100;
    static REGEN_RATE = 1; // per minute
    static COSTS = {
        message: 2,
        like: 1,
        unlock: 5
    };

    static getEnergy() {
        const saved = SaveSystem.load('energy', {
            current: this.MAX_ENERGY,
            lastUpdate: Date.now()
        });

        // Calculate natural regeneration
        const now = Date.now();
        const minutesPassed = (now - saved.lastUpdate) / (1000 * 60);
        const regenAmount = Math.floor(minutesPassed * this.REGEN_RATE);

        saved.current = Math.min(this.MAX_ENERGY, saved.current + regenAmount);
        saved.lastUpdate = now;

        SaveSystem.save('energy', saved);
        return saved.current;
    }

    static spend(amount) {
        const energy = this.getEnergy();
        if (energy >= amount) {
            const saved = SaveSystem.load('energy', {
                current: this.MAX_ENERGY,
                lastUpdate: Date.now()
            });
            saved.current -= amount;
            saved.lastUpdate = Date.now();
            SaveSystem.save('energy', saved);
            return true;
        }
        return false;
    }

    static restore(amount) {
        const saved = SaveSystem.load('energy', {
            current: this.MAX_ENERGY,
            lastUpdate: Date.now()
        });
        saved.current = Math.min(this.MAX_ENERGY, saved.current + amount);
        saved.lastUpdate = Date.now();
        SaveSystem.save('energy', saved);

        this.updateUI();
    }

    static updateUI() {
        const energy = this.getEnergy();
        const bar = document.getElementById('energy-bar');
        const text = document.getElementById('energy-text');

        if (bar) {
            bar.style.width = `${energy}%`;

            // Color based on level
            if (energy > 50) {
                bar.style.background = 'linear-gradient(90deg, var(--accent-green), var(--accent-blue))';
            } else if (energy > 25) {
                bar.style.background = 'linear-gradient(90deg, var(--accent-blue), var(--accent-purple))';
            } else {
                bar.style.background = 'linear-gradient(90deg, var(--accent-purple), var(--accent-pink))';
            }
        }

        if (text) {
            text.textContent = `${energy}/${this.MAX_ENERGY}`;
        }
    }

    static showLowEnergyModal() {
        const entities = EntityRegistry.getUnlocked();
        const videosAvailable = [];

        entities.forEach(entity => {
            const videos = MediaLibrary.getUnlockedVideos(entity.id);
            videos.forEach(video => {
                videosAvailable.push({ entity, video });
            });
        });

        if (videosAvailable.length === 0) {
            RewardSystem.showRewardModal({
                title: "💤 OUT OF ENERGY 💤",
                message: "Energy regenerates 1 per minute, or unlock videos to restore it faster.",
                rewards: []
            });
            return;
        }

        // Show video selection
        const randomVideo = Random.choice(videosAvailable);
        VideoPlayer.showOffer(randomVideo.entity, randomVideo.video);
    }
}

// Video Player
class VideoPlayer {
    static currentVideo = null;

    static showOffer(entity, video) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('reward-modal');
        const content = modal.querySelector('.modal-content');

        const watchCount = MediaLibrary.getWatchCount(video.id);
        const isFirstTime = !MediaLibrary.hasWatched(video.id);

        content.innerHTML = `
            <div style="padding: 1rem;">
                <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: ${entity.color};">
                    ${entity.name} wants to show you something
                </h2>

                <img src="${video.thumbnail}"
                     style="width: 100%; border-radius: 0.5rem; margin-bottom: 1rem;"
                     alt="${video.title}">

                <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${video.title}</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">
                    ${video.description}
                </p>

                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        REWARDS:
                    </div>
                    ${Object.entries(video.rewards).map(([type, amount]) => `
                        <div style="display: flex; justify-content: space-between; margin: 0.25rem 0;">
                            <span>${type}</span>
                            <span style="color: ${entity.color};">+${amount}</span>
                        </div>
                    `).join('')}
                    ${isFirstTime ? `
                        <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border-color);">
                            <span style="color: var(--accent-pink); font-weight: 600;">✨ FIRST TIME BONUS! ✨</span>
                        </div>
                    ` : ''}
                    ${watchCount > 0 ? `
                        <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-tertiary);">
                            you've watched this ${watchCount} time${watchCount > 1 ? 's' : ''}
                        </div>
                    ` : ''}
                </div>

                <button onclick="VideoPlayer.play('${entity.id}', '${video.id}')"
                        style="width: 100%; padding: 1rem; background: ${entity.color};
                               border: none; border-radius: 2rem; color: white; font-weight: 600;
                               cursor: pointer; font-size: 1rem; margin-bottom: 0.5rem;">
                    ▶ WATCH NOW
                </button>

                <button onclick="RewardSystem.closeModal()"
                        style="width: 100%; padding: 0.75rem; background: var(--bg-tertiary);
                               border: none; border-radius: 2rem; color: var(--text-secondary);
                               cursor: pointer; font-size: 0.9rem;">
                    maybe later
                </button>
            </div>
        `;

        overlay.classList.add('active');
    }

    static play(entityId, videoId) {
        const entity = EntityRegistry.get(entityId);
        const media = MediaLibrary.getEntityMedia(entityId);
        const video = media.videos.find(v => v.id === videoId);

        if (!video) return;

        this.currentVideo = { entity, video };

        // Show video player
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('reward-modal');
        const content = modal.querySelector('.modal-content');

        const isFirstTime = !MediaLibrary.hasWatched(videoId);

        content.innerHTML = `
            <div style="padding: 0; min-width: 90vw; max-width: 600px;">
                <div style="position: relative; background: #000;">
                    ${this.renderVideoPlayer(video)}
                </div>
                <div style="padding: 1rem; background: var(--bg-secondary);">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        NOW PLAYING
                    </div>
                    <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${video.title}</h3>
                    <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-secondary); font-size: 0.85rem;">
                        <img src="${entity.avatar}" style="width: 24px; height: 24px; border-radius: 50%;">
                        <span>${entity.name}</span>
                        <span>•</span>
                        <span>${Math.floor(video.duration / 60)}:${String(video.duration % 60).padStart(2, '0')}</span>
                    </div>
                </div>
            </div>
        `;

        // Simulate video completion
        setTimeout(() => {
            this.onVideoComplete(isFirstTime);
        }, Math.min(video.duration * 1000, 5000)); // Use 5s for demo, full duration for real

        overlay.classList.add('active');
    }

    static renderVideoPlayer(video) {
        // For now, a stylized placeholder
        // In a real implementation, this would be a proper video element
        return `
            <div style="width: 100%; aspect-ratio: 16/9; display: flex; align-items: center; justify-content: center;
                        background: linear-gradient(135deg, rgba(255,0,110,0.3), rgba(131,56,236,0.3));
                        position: relative; overflow: hidden;">

                <!-- Animated background -->
                <div style="position: absolute; inset: 0; background-image: ${video.thumbnail};
                            background-size: cover; opacity: 0.3; animation: pulse 2s infinite;"></div>

                <!-- Play indicator -->
                <div style="position: relative; z-index: 10;">
                    <div style="font-size: 4rem; animation: spin 2s linear infinite;">▶</div>
                    <div style="text-align: center; margin-top: 1rem; font-size: 0.9rem; opacity: 0.8;">
                        loading sensory experience...
                    </div>
                </div>
            </div>

            <style>
                @keyframes spin {
                    from { transform: rotate(0deg); opacity: 0.5; }
                    50% { opacity: 1; }
                    to { transform: rotate(360deg); opacity: 0.5; }
                }
            </style>
        `;
    }

    static onVideoComplete(isFirstTime) {
        const { entity, video } = this.currentVideo;

        // Grant rewards
        const multiplier = isFirstTime ? 2 : 1;

        Object.entries(video.rewards).forEach(([type, amount]) => {
            const finalAmount = amount * multiplier;

            if (type === 'energy') {
                EnergySystem.restore(finalAmount);
            } else if (type === 'corruption') {
                window.player.addCorruption(finalAmount);
            } else {
                window.player.addCurrency(type, finalAmount);
            }
        });

        // Mark as watched
        MediaLibrary.markWatched(video.id);

        // Show completion
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById('reward-modal');
        const content = modal.querySelector('.modal-content');

        content.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">✨</div>
                <h2 style="font-size: 1.5rem; margin-bottom: 1rem; color: ${entity.color};">
                    ${isFirstTime ? 'FIRST TIME BONUS!' : 'VIDEO COMPLETE'}
                </h2>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">
                    ${Random.choice([
                        "that was good, wasn't it?",
                        "you can watch it again anytime~",
                        "did you like that?",
                        "there's more where that came from",
                        "come back for more soon"
                    ])}
                </p>

                <div style="background: var(--bg-tertiary); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        ${isFirstTime ? 'REWARDS (2X)' : 'REWARDS'}
                    </div>
                    ${Object.entries(video.rewards).map(([type, amount]) => `
                        <div style="margin: 0.5rem 0; font-size: 1.1rem;">
                            <span style="color: ${entity.color};">+${amount * multiplier}</span>
                            <span style="margin-left: 0.5rem; text-transform: uppercase;">${type}</span>
                        </div>
                    `).join('')}
                </div>

                <button onclick="RewardSystem.closeModal(); EnergySystem.updateUI();"
                        style="padding: 0.75rem 2rem; background: ${entity.color};
                               border: none; border-radius: 2rem; color: white; font-weight: 600;
                               cursor: pointer; font-size: 1rem;">
                    OK
                </button>
            </div>
        `;

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
    }
}

// Export
window.MediaLibrary = MediaLibrary;
window.EnergySystem = EnergySystem;
window.VideoPlayer = VideoPlayer;
