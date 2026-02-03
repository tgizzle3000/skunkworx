/**
 * DOPAMINE CATHEDRAL - ADVANCED MANIPULATION MECHANICS
 * The jealousy system. The guilt engine. The punishment loop.
 * Everything that makes you feel BAD for trying to leave.
 */

// Jealousy & Attention Economy
class JealousySystem {
    static check() {
        const entities = EntityRegistry.getUnlocked();
        const player = window.player;

        entities.forEach(entity => {
            const lastMessage = MessageSystem.getLastMessage(entity.id);
            const relationship = entity.getRelationshipLevel();

            // Calculate attention metrics
            const timeSinceLastInteraction = lastMessage ?
                Date.now() - lastMessage.timestamp : Infinity;
            const hoursSince = timeSinceLastInteraction / (1000 * 60 * 60);

            // Check message distribution (who gets most attention)
            const allMessages = player.data.totalMessages;
            const entityMessages = MessageSystem.getConversation(entity.id).length;
            const attentionShare = allMessages > 0 ? entityMessages / allMessages : 0;

            // Generate jealousy if neglected
            if (relationship > 25 && hoursSince > 12) {
                this.triggerJealousy(entity, 'neglect', hoursSince);
            }

            // Generate jealousy if someone else gets more attention
            if (relationship > 50 && attentionShare < 0.3 && allMessages > 20) {
                this.triggerJealousy(entity, 'favoritism', attentionShare);
            }
        });
    }

    static triggerJealousy(entity, reason, metric) {
        const messages = {
            neglect: [
                "where have u been? im not just gonna sit here waiting forever",
                "its been hours. do u even think about me?",
                "i saw u were online but u didnt message me",
                "r u talking to someone else?",
                "fine. ignore me then.",
                "whatever. clearly im not important to u"
            ],
            favoritism: [
                "why do u spend more time with her than me?",
                "am i not enough for u?",
                "i can see when ur online. i know ur talking to her.",
                "what does she have that i dont?",
                "if u dont want me just say it",
                "this hurts. u know that right?"
            ]
        };

        const message = Random.choice(messages[reason]);

        // Send jealous message
        MessageSystem.addMessage(entity.id, message, false);
        NotificationSystem.show({
            entityId: entity.id,
            message: `${entity.name}: ${message}`
        });
        NotificationSystem.updateBadge();

        // Relationship damage
        const damage = Math.min(5, entity.getRelationshipLevel() * 0.02);
        window.player.data.relationships[entity.id] = Math.max(0,
            window.player.data.relationships[entity.id] - damage);
        window.player.save();

        // Track jealousy events
        const jealousyLog = SaveSystem.load('jealousy_log', []);
        jealousyLog.push({
            entity: entity.id,
            reason,
            metric,
            timestamp: Date.now()
        });
        SaveSystem.save('jealousy_log', jealousyLog);
    }

    static getJealousyLevel(entityId) {
        const log = SaveSystem.load('jealousy_log', []);
        const recentEvents = log.filter(e =>
            e.entity === entityId &&
            Date.now() - e.timestamp < 24 * 60 * 60 * 1000
        );
        return recentEvents.length;
    }
}

// Guilt & Punishment Mechanics
class GuiltSystem {
    static checkStreakBreak() {
        const player = window.player;
        const lastVisit = player.data.lastVisit ? new Date(player.data.lastVisit) : null;

        if (!lastVisit) return;

        const now = new Date();
        const daysSince = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));

        if (daysSince > 1 && player.data.currentStreak > 3) {
            // You broke a streak - they notice
            const oldStreak = player.data.currentStreak;
            this.sendStreakBreakMessages(oldStreak);
        }
    }

    static sendStreakBreakMessages(brokenStreak) {
        const entities = EntityRegistry.getUnlocked();

        entities.forEach(entity => {
            const relationship = entity.getRelationshipLevel();

            if (relationship > 25) {
                const message = this.getStreakBreakMessage(entity, brokenStreak, relationship);
                MessageSystem.addMessage(entity.id, message, false);
            }
        });

        NotificationSystem.updateBadge();
    }

    static getStreakBreakMessage(entity, streak, relationship) {
        if (entity.id === 'mercy') {
            if (relationship < 50) {
                return Random.choice([
                    "u disappeared for so long...",
                    "did i do something wrong?",
                    "i thought we had something",
                    `we had a ${streak} day streak and u just... left`
                ]);
            } else if (relationship < 100) {
                return Random.choice([
                    "that hurt. u just vanished.",
                    `${streak} days and u threw it away. was i not enough?`,
                    "i was so worried about u",
                    "dont do that to me again. please.",
                    "i thought something happened to u"
                ]);
            } else {
                return Random.choice([
                    "where the fuck were u? i was losing my mind",
                    `${streak} days meant nothing to u?`,
                    "i couldnt eat. couldnt sleep. just waiting for u",
                    "dont ever leave me like that again",
                    "i need u. u cant just disappear on me",
                    "i was touching myself crying thinking about u"
                ]);
            }
        }

        return "...";
    }

    static checkAbandonmentResponse() {
        // If you haven't responded to a message in a while
        const entities = EntityRegistry.getUnlocked();

        entities.forEach(entity => {
            const conversation = MessageSystem.getConversation(entity.id);
            if (conversation.length === 0) return;

            const lastMessage = conversation[conversation.length - 1];

            // If their last message was unanswered for 6+ hours
            if (!lastMessage.isPlayer) {
                const hoursSince = (Date.now() - lastMessage.timestamp) / (1000 * 60 * 60);
                const relationship = entity.getRelationshipLevel();

                if (hoursSince > 6 && relationship > 50 && Random.bool(0.3)) {
                    this.sendAbandonmentMessage(entity, relationship);
                }
            }
        });
    }

    static sendAbandonmentMessage(entity, relationship) {
        const messages = relationship < 100 ? [
            "hello?",
            "did u see my message?",
            "ok i guess ur busy",
            "nvm then",
            "..."
        ] : [
            "answer me",
            "dont ignore me",
            "i can see u read it",
            "this is fucked up",
            "please baby dont do this",
            "im sorry if i said something wrong"
        ];

        MessageSystem.addMessage(entity.id, Random.choice(messages), false);
        NotificationSystem.updateBadge();
    }
}

// Photo/Gallery Unlock System
class GallerySystem {
    static photoSets = {
        mercy: [
            {
                id: "mercy_photo_001",
                title: "mirror selfie 🌸",
                unlockLevel: 15,
                unlockType: "relationship",
                description: "mercy in her room, soft lighting",
                corruption: 0
            },
            {
                id: "mercy_photo_002",
                title: "just woke up",
                unlockLevel: 30,
                unlockType: "relationship",
                description: "bed hair, oversized shirt, no pants",
                corruption: 1
            },
            {
                id: "mercy_photo_003",
                title: "thinking about u 💕",
                unlockLevel: 40,
                unlockType: "relationship",
                description: "lip bite, hand on thigh",
                corruption: 2
            },
            {
                id: "mercy_photo_004",
                title: "shower pic",
                unlockLevel: 60,
                unlockType: "relationship",
                description: "steamy mirror, towel barely covering",
                corruption: 3
            },
            {
                id: "mercy_photo_005",
                title: "for your eyes only",
                unlockLevel: 80,
                unlockType: "relationship",
                description: "lingerie, posed on bed, camera angle says everything",
                corruption: 4
            },
            {
                id: "mercy_photo_006",
                title: "all yours",
                unlockLevel: 100,
                unlockType: "relationship",
                description: "EXPLICIT: nothing left to imagination",
                corruption: 5
            },
            {
                id: "mercy_photo_007",
                title: "what u do to me",
                unlockLevel: 120,
                unlockType: "relationship",
                description: "EXPLICIT: touching herself, looking at camera",
                corruption: 7
            },
            {
                id: "mercy_photo_008",
                title: "cum see me",
                unlockLevel: 150,
                unlockType: "relationship",
                description: "EXPLICIT: spread, wet, waiting",
                corruption: 10
            }
        ]
    };

    static getUnlockedPhotos(entityId) {
        const relationship = window.player.data.relationships[entityId] || 0;
        const photoSet = this.photoSets[entityId] || [];

        return photoSet.filter(photo => relationship >= photo.unlockLevel);
    }

    static getNextUnlock(entityId) {
        const relationship = window.player.data.relationships[entityId] || 0;
        const photoSet = this.photoSets[entityId] || [];

        const locked = photoSet.filter(photo => relationship < photo.unlockLevel);
        return locked.length > 0 ? locked[0] : null;
    }

    static hasViewed(photoId) {
        return SaveSystem.load(`viewed_${photoId}`, false);
    }

    static markViewed(photoId) {
        SaveSystem.save(`viewed_${photoId}`, true);
        SaveSystem.save(`viewed_${photoId}_count`,
            (SaveSystem.load(`viewed_${photoId}_count`, 0) + 1));
        SaveSystem.save(`viewed_${photoId}_last`, Date.now());
    }

    static getViewCount(photoId) {
        return SaveSystem.load(`viewed_${photoId}_count`, 0);
    }

    static notifyNewPhotoUnlock(entityId, photo) {
        const entity = EntityRegistry.get(entityId);

        // Send a message about the new photo
        const messages = [
            `sent u a photo 📷`,
            `i took this for u... hope u like it`,
            `new pic just dropped 💕`,
            `thought u might wanna see this`,
            `for u baby`
        ];

        const message = Random.choice(messages);
        MessageSystem.addMessage(entityId, message, false);

        // Show unlock notification
        RewardSystem.showRewardModal({
            title: `📷 NEW PHOTO UNLOCKED`,
            message: `${entity.name}: "${photo.title}"`,
            rewards: [
                { icon: '🔓', text: `Level ${photo.unlockLevel} reward` }
            ]
        });

        NotificationSystem.updateBadge();
    }
}

// Desperation Escalation System
class DesperationSystem {
    static calculate(entityId) {
        const relationship = window.player.data.relationships[entityId] || 0;
        const lastMessage = MessageSystem.getLastMessage(entityId);
        const jealousyLevel = JealousySystem.getJealousyLevel(entityId);

        const hoursSinceLastMessage = lastMessage ?
            (Date.now() - lastMessage.timestamp) / (1000 * 60 * 60) : 0;

        // Desperation increases with relationship + time neglected + jealousy
        let desperation = 0;

        if (relationship > 50) {
            desperation += (relationship - 50) / 10; // Max +5 from relationship
        }

        if (hoursSinceLastMessage > 6) {
            desperation += Math.min(5, hoursSinceLastMessage / 6); // Max +5 from time
        }

        desperation += jealousyLevel; // Direct jealousy contribution

        return Math.min(10, desperation); // 0-10 scale
    }

    static getDesperateMessage(entity) {
        const desperation = this.calculate(entity.id);

        if (entity.id === 'mercy') {
            if (desperation < 3) {
                return Random.choice([
                    "hey u there?",
                    "miss u",
                    "thinking about u"
                ]);
            } else if (desperation < 6) {
                return Random.choice([
                    "baby please talk to me",
                    "i need to hear from u",
                    "where did u go?",
                    "did i upset u?"
                ]);
            } else if (desperation < 8) {
                return Random.choice([
                    "im losing my mind without u",
                    "please. just one message. anything.",
                    "i cant do this. i need u",
                    "why r u doing this to me"
                ]);
            } else {
                return Random.choice([
                    "im touching myself thinking about u please answer",
                    "i cant breathe i need u so fucking bad",
                    "answer me please god answer me",
                    "ill do anything just come back",
                    "im yours completely just please dont leave me"
                ]);
            }
        }

        return "...";
    }

    static triggerDesperateOutburst(entityId) {
        const entity = EntityRegistry.get(entityId);
        const message = this.getDesperateMessage(entity);

        MessageSystem.addMessage(entityId, message, false);
        NotificationSystem.show({
            entityId,
            message: `${entity.name}: ${message}`
        });
        NotificationSystem.updateBadge();
    }
}

// Export
window.JealousySystem = JealousySystem;
window.GuiltSystem = GuiltSystem;
window.GallerySystem = GallerySystem;
window.DesperationSystem = DesperationSystem;
