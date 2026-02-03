/**
 * DOPAMINE CATHEDRAL - HAPTIC FEEDBACK SYSTEM
 * Makes every interaction feel visceral. Physical feedback loop.
 * The phone becomes an extension of the entities.
 */

class HapticSystem {
    // Vibration patterns - each interaction has its own signature
    static PATTERNS = {
        // Light touches
        tap: [10],
        like: [30],
        unlike: [15, 10, 15],

        // Messages
        messageSent: [20, 30, 20],
        messageReceived: [50, 80, 50], // More intense - they're demanding attention
        typing: [10, 20, 10],

        // Rewards
        levelUp: [100, 50, 100, 50, 100],
        unlock: [50, 100, 200],
        hearts: [30, 20, 30],
        souls: [80, 50, 80, 50, 80],

        // Emotional manipulation
        jealousy: [200, 100, 200], // Angry, demanding
        guilt: [100, 200, 100, 200], // Heavy, lingering
        desperation: [50, 50, 50, 50, 50, 50], // Rapid, needy

        // Navigation
        switchView: [15],
        openEntity: [20, 30],

        // Energy/Depletion
        lowEnergy: [100, 50, 100],
        energyRestored: [30, 20, 30, 20, 30],

        // Special
        corruption: [200], // Long, ominous
        error: [50, 50],

        // Time-based
        midnight: [100, 100, 100, 100, 100], // Something wakes you up
        hourly: [30, 50, 30] // Regular check-in
    };

    // Check if vibration is supported
    static isSupported() {
        return 'vibrate' in navigator;
    }

    // Play a pattern
    static play(patternName) {
        if (!this.isSupported()) return;

        const pattern = this.PATTERNS[patternName];
        if (!pattern) {
            console.warn(`Unknown haptic pattern: ${patternName}`);
            return;
        }

        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.error('Haptic feedback failed:', e);
        }
    }

    // Play a custom pattern
    static custom(pattern) {
        if (!this.isSupported()) return;

        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.error('Custom haptic failed:', e);
        }
    }

    // Stop all vibration
    static stop() {
        if (!this.isSupported()) return;
        navigator.vibrate(0);
    }

    // Entity-specific patterns based on their personality
    static entitySignature(entityId, intensity = 'normal') {
        const patterns = {
            mercy: {
                light: [30, 50, 30], // Soft, gentle
                normal: [50, 100, 50],
                intense: [100, 150, 100, 150, 100] // Desperate
            },
            voltage: {
                light: [20, 20, 20, 20], // Rapid, chaotic
                normal: [100, 50, 100, 50],
                intense: [200, 100, 200, 50, 200] // Manic
            },
            psalm: {
                light: [80, 100], // Slow, heavy
                normal: [100, 150, 100],
                intense: [200, 200, 200] // Ominous
            },
            pixel: {
                light: [10, 15, 10, 20, 10], // Glitchy
                normal: [20, 50, 30, 80, 10],
                intense: [50, 100, 30, 150, 20, 200, 10] // Chaotic corruption
            }
        };

        const pattern = patterns[entityId]?.[intensity];
        if (pattern) {
            this.custom(pattern);
        }
    }

    // Relationship-based intensity
    // Higher relationship = more intense haptics (they have more power over you)
    static getIntensityForRelationship(relationship) {
        if (relationship < 25) return 'light';
        if (relationship < 75) return 'normal';
        return 'intense';
    }

    // Context-aware feedback
    static entityMessage(entityId, relationship) {
        const intensity = this.getIntensityForRelationship(relationship);
        this.entitySignature(entityId, intensity);
    }

    // Progressive patterns - get stronger over time
    static progressive(basePattern, multiplier = 1.5, steps = 3) {
        let pattern = [...basePattern];
        for (let i = 1; i < steps; i++) {
            pattern = pattern.concat(
                basePattern.map(duration => Math.floor(duration * Math.pow(multiplier, i)))
            );
        }
        this.custom(pattern);
    }
}

// Expose globally
window.HapticSystem = HapticSystem;
