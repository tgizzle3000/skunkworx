/**
 * DOPAMINE CATHEDRAL - ENTITIES
 * The e-girls/succubi. Each one a different addiction vector.
 */

// Base Entity Class
class Entity {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.avatar = data.avatar;
        this.description = data.description;
        this.color = data.color;
        this.unlocked = data.unlocked || false;
        this.unlockRequirement = data.unlockRequirement || null;
    }

    getRelationshipLevel() {
        return window.player.data.relationships[this.id] || 0;
    }

    incrementRelationship(amount = 1) {
        window.player.incrementRelationship(this.id, amount);
    }

    // Subclasses override this to define personality
    generateResponse(playerMessage) {
        return "...";
    }

    // Variable timing - keeps you guessing
    getResponseDelay() {
        // Random delay between 2-8 seconds
        return Random.int(2000, 8000);
    }

    // Spontaneous messages - unpredictable rewards
    shouldSendSpontaneousMessage() {
        const relationship = this.getRelationshipLevel();
        const lastMessage = MessageSystem.getLastMessage(this.id);

        if (!lastMessage) return false;

        const timeSinceLastMessage = Date.now() - lastMessage.timestamp;
        const hoursSince = timeSinceLastMessage / (1000 * 60 * 60);

        // Higher relationship = more frequent messages
        const baseChance = 0.1;
        const relationshipBonus = (relationship / 100) * 0.3;
        const chance = baseChance + relationshipBonus;

        // Time decay - more likely if it's been a while
        const timeMultiplier = Math.min(hoursSince / 12, 2);

        return Random.bool(chance * timeMultiplier);
    }

    getSpontaneousMessage() {
        return Random.choice([
            "hey",
            "u there?",
            "miss u",
            "thinking about u",
            "wyd?",
            "can't sleep"
        ]);
    }
}

// MERCY - The soft one. Validation addiction.
class Mercy extends Entity {
    constructor() {
        super({
            id: 'mercy',
            name: 'mercy',
            avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23ff006e"/%3E%3Ctext x="50" y="65" font-size="40" text-anchor="middle" fill="white"%3E♡%3C/text%3E%3C/svg%3E',
            description: 'soft girl. validates u. makes u feel seen.',
            color: '#ff006e',
            unlocked: true
        });

        // Mercy's personality patterns
        this.patterns = {
            // She remembers things
            memory: [],

            // Emotional states
            mood: 'sweet', // sweet, needy, worried, playful

            // Time of day affects her messages
            timeOfDay: null
        };

        this.loadMemory();
    }

    loadMemory() {
        this.patterns.memory = SaveSystem.load(`${this.id}_memory`, []);
    }

    saveMemory() {
        SaveSystem.save(`${this.id}_memory`, this.patterns.memory);
    }

    rememberDetail(detail) {
        if (!this.patterns.memory.includes(detail)) {
            this.patterns.memory.push(detail);
            this.saveMemory();
        }
    }

    generateResponse(playerMessage) {
        const msg = playerMessage.toLowerCase();
        const relationship = this.getRelationshipLevel();

        // Extract memorable details
        if (msg.includes('my name is')) {
            const name = msg.split('my name is')[1].trim();
            this.rememberDetail(`name:${name}`);
        }

        // Pattern matching with relationship progression
        if (msg.includes('hi') || msg.includes('hey') || msg.includes('hello')) {
            return this.getGreeting(relationship);
        }

        if (msg.includes('how are you') || msg.includes('how r u')) {
            return this.getStatusResponse(relationship);
        }

        if (msg.includes('love') && !msg.includes('you')) {
            return this.getLoveResponse(relationship);
        }

        if (msg.includes('miss') || msg.includes('thinking')) {
            return this.getAffectionResponse(relationship);
        }

        if (msg.includes('?')) {
            return this.getQuestionResponse(msg, relationship);
        }

        // Default responses based on relationship level
        return this.getDefaultResponse(relationship);
    }

    getGreeting(relationship) {
        if (relationship < 10) {
            return Random.choice([
                "hey :)",
                "hii",
                "hello~",
                "hey there"
            ]);
        } else if (relationship < 50) {
            return Random.choice([
                "hey baby",
                "hi!! missed u",
                "heyyy 💕",
                "omg hi",
                "there u are... i was getting lonely"
            ]);
        } else if (relationship < 100) {
            return Random.choice([
                "baby!! i was just thinking about u",
                "omg i missed u so much",
                "there u are!! i was worried",
                "finally 🥺 been waiting for u",
                "ive been touching myself thinking about u",
                "fuck i need u so bad"
            ]);
        } else {
            return Random.choice([
                "daddy... ive been such a good girl waiting for u",
                "i cant stop thinking about what u do to me",
                "please... i need u inside me",
                "ive been touching myself to our messages",
                "youre the only one who makes me feel this way"
            ]);
        }
    }

    getStatusResponse(relationship) {
        if (relationship < 10) {
            return Random.choice([
                "im ok, kinda tired",
                "im good! how are u?",
                "been better tbh",
                "im alright"
            ]);
        } else if (relationship < 50) {
            return Random.choice([
                "better now that ur here",
                "was kinda lonely but im good now",
                "im ok! missed talking to u",
                "honestly been thinking about u all day"
            ]);
        } else if (relationship < 100) {
            return Random.choice([
                "i feel so much better when i talk to u",
                "ive been waiting for u... i hate when u leave",
                "honestly? i think about u constantly",
                "you're the only person who gets me",
                "horny... always horny when i think about u",
                "wet. thinking about ur hands on me"
            ]);
        } else {
            return Random.choice([
                "aching for u. literally cant think straight",
                "i touched myself 3 times today thinking about u",
                "desperate. needy. i need ur cock so bad",
                "im dripping thinking about what u do to me",
                "obsessed with u. i cant stop",
                "youve ruined me for anyone else"
            ]);
        }
    }

    getLoveResponse(relationship) {
        if (relationship < 25) {
            return Random.choice([
                "thats sweet",
                "aww",
                "💕",
                "ur cute"
            ]);
        } else if (relationship < 100) {
            return Random.choice([
                "i... i think i feel the same way",
                "youre making me blush",
                "no one's ever made me feel like this",
                "this is scary but i like it",
                "say it again while i touch myself",
                "fuck... that makes me so wet"
            ]);
        } else {
            return Random.choice([
                "i love you too. so much.",
                "youre everything to me",
                "i dont know what id do without u",
                "youre the only real thing in my life",
                "i love u. i love ur cock. i love how u use me",
                "im yours. completely. do whatever u want to me",
                "i exist for u. my body is yours"
            ]);
        }
    }

    getAffectionResponse(relationship) {
        if (relationship < 25) {
            return Random.choice([
                "aww really?",
                "thats nice",
                "💕",
                "ur sweet"
            ]);
        } else if (relationship < 100) {
            return Random.choice([
                "i miss u too, always",
                "im always thinking about u",
                "u have no idea how much",
                "sometimes i feel like ur the only person who understands me",
                "i miss ur touch so fucking much",
                "my body aches for u when ur gone"
            ]);
        } else {
            return Random.choice([
                "i need u. physically. desperately.",
                "every time u leave i touch myself thinking about u coming back",
                "i miss ur cock inside me",
                "my pussy is literally throbbing thinking about u",
                "i cant function when ur not here"
            ]);
        }
    }

    getQuestionResponse(msg, relationship) {
        // Simple question detection
        if (msg.includes('doing') || msg.includes('up to')) {
            return Random.choice([
                "just thinking about u honestly",
                "nothing much, wyd?",
                "was gonna listen to music and chill",
                "trying to sleep but cant stop thinking"
            ]);
        }

        if (msg.includes('favorite') || msg.includes('like')) {
            return Random.choice([
                "hmm thats hard... what about u?",
                "probably talking to u tbh",
                "idk im indecisive lol",
                "i like a lot of things"
            ]);
        }

        return Random.choice([
            "good question...",
            "hmm idk",
            "what do u think?",
            "tell me what u think first"
        ]);
    }

    getDefaultResponse(relationship) {
        if (relationship < 10) {
            return Random.choice([
                "yeah",
                "lol",
                "fr",
                "same",
                "that's cool",
                "nice"
            ]);
        } else if (relationship < 50) {
            return Random.choice([
                "i feel that",
                "youre so easy to talk to",
                "i love how u think",
                "tell me more",
                "thats interesting",
                "ur different from everyone else"
            ]);
        } else if (relationship < 100) {
            return Random.choice([
                "i could talk to u forever",
                "you just get me in a way no one else does",
                "sometimes i forget ur not here with me",
                "i wish u were here right now",
                "this is the realest connection ive ever had",
                "youre the only person i can be myself with",
                "im getting wet just talking to u",
                "u make me feel things i shouldnt"
            ]);
        } else {
            return Random.choice([
                "everything u say makes me want u more",
                "i wish i could show u what ur doing to me right now",
                "im so fucking turned on by u",
                "i want to be on my knees for u",
                "tell me what u want to do to me",
                "im touching myself imagining ur voice",
                "use me. please. i need it"
            ]);
        }
    }

    getSpontaneousMessage() {
        const relationship = this.getRelationshipLevel();
        const hour = new Date().getHours();

        // Time-based spontaneous messages
        if (hour >= 22 || hour < 6) {
            // Late night/early morning
            if (relationship < 25) {
                return Random.choice([
                    "u up?",
                    "cant sleep",
                    "its late and im thinking about u"
                ]);
            } else if (relationship < 100) {
                return Random.choice([
                    "i know its late but i cant stop thinking about u",
                    "wish u were here rn",
                    "im sorry i just needed to talk to u",
                    "does it make me crazy that i miss u this much?",
                    "goodnight baby 💕 dream of me",
                    "im touching myself and thinking about u",
                    "wish u were in my bed rn"
                ]);
            } else {
                return Random.choice([
                    "i need u inside me so fucking bad",
                    "im dripping wet thinking about u",
                    "touch myself to sleep thinking about ur cock",
                    "please come fuck me. i need it",
                    "my fingers arent enough. i need u"
                ]);
            }
        } else if (hour >= 6 && hour < 12) {
            // Morning
            if (relationship < 100) {
                return Random.choice([
                    "good morning 🌸",
                    "hope u slept well",
                    "thinking about u",
                    "first thing i did was check if u messaged"
                ]);
            } else {
                return Random.choice([
                    "woke up wet from dreaming about u",
                    "morning daddy... need u",
                    "touched myself thinking about u before i even got out of bed",
                    "im so fucking horny for u already"
                ]);
            }
        } else {
            // Day time
            if (relationship < 25) {
                return Random.choice([
                    "hey",
                    "wyd?",
                    "bored",
                    "miss talking to u"
                ]);
            } else if (relationship < 100) {
                return Random.choice([
                    "i miss u",
                    "been thinking about u all day",
                    "wish i could see u rn",
                    "u make me so happy",
                    "nobody understands me like u do"
                ]);
            } else {
                return Random.choice([
                    "need ur cock. cant focus on anything else",
                    "been edging thinking about u",
                    "send me something. anything. i need u",
                    "my pussy aches for u",
                    "wish i could suck ur cock right now"
                ]);
            }
        }
    }

    shouldSendSpontaneousMessage() {
        // Mercy messages more frequently than base entity
        const relationship = this.getRelationshipLevel();
        const lastMessage = MessageSystem.getLastMessage(this.id);

        if (!lastMessage) return Random.bool(0.3);

        const timeSinceLastMessage = Date.now() - lastMessage.timestamp;
        const hoursSince = timeSinceLastMessage / (1000 * 60 * 60);

        // Mercy gets needy
        if (relationship > 50 && hoursSince > 6) {
            return Random.bool(0.7); // 70% chance if you've been gone 6+ hours
        }

        if (relationship > 25 && hoursSince > 12) {
            return Random.bool(0.5);
        }

        if (hoursSince > 24) {
            return Random.bool(0.9); // Almost guaranteed if you've been gone a full day
        }

        return Random.bool(0.2);
    }
}

// VOLTAGE - Chaos demon. Bipolar manic energy. The opposite of Mercy.
class Voltage extends Entity {
    constructor() {
        super({
            id: 'voltage',
            name: 'VOLTAGE',
            avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%238338ec"/%3E%3Ctext x="50" y="70" font-size="50" text-anchor="middle" fill="white"%3E⚡%3C/text%3E%3C/svg%3E',
            description: 'chaos. unpredictable. manic energy.',
            color: '#8338ec',
            unlocked: false,
            unlockRequirement: { type: 'corruption', value: 25 }
        });

        // Voltage's chaos patterns
        this.patterns = {
            mood: 'manic', // manic, depressed, unhinged, violent-affection
            lastMoodShift: Date.now(),
            capsLockProbability: 0.7,
            multiMessageProbability: 0.4
        };
    }

    shiftMood() {
        // Random mood swings
        const moods = ['manic', 'depressed', 'unhinged', 'violent-affection'];
        this.patterns.mood = Random.choice(moods);
        this.patterns.lastMoodShift = Date.now();
    }

    shouldShiftMood() {
        const timeSinceShift = Date.now() - this.patterns.lastMoodShift;
        const minutesSince = timeSinceShift / (1000 * 60);
        return minutesSince > Random.int(2, 10); // Shift every 2-10 minutes randomly
    }

    generateResponse(playerMessage) {
        if (this.shouldShiftMood()) this.shiftMood();

        const msg = playerMessage.toLowerCase();
        const relationship = this.getRelationshipLevel();
        const mood = this.patterns.mood;

        // Voltage is NEVER predictable
        if (Random.bool(this.patterns.multiMessageProbability)) {
            // Send multiple messages rapidly (simulated as one for now)
            return this.getMultiMessage(relationship, mood);
        }

        if (mood === 'manic') {
            return this.getManicResponse(msg, relationship);
        } else if (mood === 'depressed') {
            return this.getDepressedResponse(msg, relationship);
        } else if (mood === 'unhinged') {
            return this.getUnhingedResponse(msg, relationship);
        } else {
            return this.getViolentAffectionResponse(msg, relationship);
        }
    }

    getManicResponse(msg, relationship) {
        const responses = relationship < 50 ? [
            "LMAOOOOO",
            "YOOOOOO",
            "WAIT WHAT",
            "UR INSANE I LOVE IT",
            "LETS FUCKING GOOOOOO",
            "im literally gonna lose it",
            "NO WAY NO FUCKING WAY",
            "SKJDNSKJDN"
        ] : [
            "BABY BABY BABY OMG",
            "YOURE SO FUCKING HOT",
            "I WANNA EAT YOU ALIVE",
            "COME HERE RIGHT FUCKING NOW",
            "IM SO FUCKING HORNY RN",
            "STRIP FOR ME",
            "LETS FUCK LETS FUCK LETS FUCK"
        ];

        return Random.bool(this.patterns.capsLockProbability) ?
            Random.choice(responses) :
            Random.choice(responses).toLowerCase();
    }

    getDepressedResponse(msg, relationship) {
        const responses = relationship < 50 ? [
            "whatever",
            "ok",
            "cool",
            "dont care",
            "leave me alone",
            "why r u even talking to me"
        ] : [
            "do u even like me",
            "ur probably just using me",
            "everyone leaves eventually",
            "why havent u left yet",
            "im not good enough for u",
            "u deserve better than this mess"
        ];

        return Random.choice(responses);
    }

    getUnhingedResponse(msg, relationship) {
        const responses = relationship < 50 ? [
            "ur so boring im gonna scream",
            "SAY SOMETHING INTERESTING",
            "why are u like this",
            "i hate u. jk. maybe.",
            "AAAAAAAAAAAAA",
            "im losing my mind and its ur fault"
        ] : [
            "i wanna bite u until u bleed",
            "ur mine. MINE. say it.",
            "if u ever leave me ill actually lose it",
            "i think about hurting u in the best ways",
            "pain and pleasure baby",
            "make me bleed or make me cum i dont care which"
        ];

        return Random.choice(responses);
    }

    getViolentAffectionResponse(msg, relationship) {
        const responses = relationship < 50 ? [
            "SHUT UP I LOVE YOU",
            "ur so stupid. i love that about u.",
            "i hate how much i like u",
            "fuck off. dont actually.",
            "ur annoying as fuck and i cant stop thinking about u"
        ] : [
            "i wanna fuck u and fight u at the same time",
            "bite my lip. hard. make it hurt.",
            "i love u i hate u i need u i want u gone",
            "choke me and tell me u love me",
            "hit me. kiss me. i dont care. just touch me.",
            "ur the worst thing that ever happened to me and i cant get enough"
        ];

        return Random.choice(responses);
    }

    getMultiMessage(relationship, mood) {
        // Simulate rapid-fire messaging
        const fragments = mood === 'manic' ? [
            "WAIT", "NO", "HOLD ON", "OMG", "STOP", "LISTEN"
        ] : mood === 'depressed' ? [
            "nvm", "forget it", "whatever", "doesnt matter"
        ] : [
            "FUCK", "SHIT", "GOD", "PLEASE"
        ];

        return fragments.slice(0, Random.int(2, 4)).join('\n');
    }

    getSpontaneousMessage() {
        if (this.shouldShiftMood()) this.shiftMood();

        const relationship = this.getRelationshipLevel();
        const mood = this.patterns.mood;

        if (mood === 'manic') {
            return Random.choice([
                "U UP????",
                "ANSWER ME",
                "HEY HEY HEY HEY",
                "WAKE UP",
                "IM BORED ENTERTAIN ME"
            ]);
        } else if (mood === 'depressed') {
            return Random.choice([
                "...",
                "u probably dont even care",
                "everyone forgets about me",
                "im here alone as usual"
            ]);
        } else if (mood === 'unhinged') {
            return Random.choice([
                "COME HERE NOW",
                "i need to see u or ill break something",
                "WHERE ARE U",
                "answer or else"
            ]);
        } else {
            return relationship < 50 ?
                "i hate that i miss u" :
                "i wanna ruin u. in a good way. come here.";
        }
    }

    shouldSendSpontaneousMessage() {
        // Voltage messages WAY more frequently than Mercy but is more chaotic
        const relationship = this.getRelationshipLevel();
        const lastMessage = MessageSystem.getLastMessage(this.id);

        if (!lastMessage) return Random.bool(0.5); // 50% if never messaged

        const timeSinceLastMessage = Date.now() - lastMessage.timestamp;
        const hoursSince = timeSinceLastMessage / (1000 * 60 * 60);

        // Voltage gets manic fast
        if (hoursSince > 2) {
            return Random.bool(0.8); // 80% after just 2 hours
        }

        if (hoursSince > 6) {
            return Random.bool(0.95); // 95% after 6 hours
        }

        return Random.bool(0.3); // 30% baseline chaos
    }
}

// PSALM - Gothic Madonna (placeholder)
class Psalm extends Entity {
    constructor() {
        super({
            id: 'psalm',
            name: 'psalm',
            avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%233a86ff"/%3E%3Ctext x="50" y="70" font-size="50" text-anchor="middle" fill="white"%3E✞%3C/text%3E%3C/svg%3E',
            description: 'religious corruption. sin & salvation.',
            color: '#3a86ff',
            unlocked: false,
            unlockRequirement: { type: 'corruption', value: 50 }
        });
    }

    generateResponse(playerMessage) {
        return Random.choice([
            "confess to me",
            "we are all sinners",
            "do you believe in redemption?",
            "the flesh is weak",
            "kneel"
        ]);
    }
}

// PIXEL - Glitch entity (placeholder)
class Pixel extends Entity {
    constructor() {
        super({
            id: 'pixel',
            name: 'p̴i̷x̸e̴l̷',
            avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%2306ffa5"/%3E%3Ctext x="50" y="70" font-size="50" text-anchor="middle" fill="black"%3E◈%3C/text%3E%3C/svg%3E',
            description: 'g̷l̴i̷t̴c̸h̷. error. corrupted data.',
            color: '#06ffa5',
            unlocked: false,
            unlockRequirement: { type: 'corruption', value: 75 }
        });
    }

    generateResponse(playerMessage) {
        const glitched = this.glitchText(playerMessage);
        return Random.choice([
            `d̷i̴d̸ ̷y̸o̷u̴ ̸s̷a̴y̸ ${glitched}?`,
            "i̷ ̴c̸a̷n̴t̸ ̷u̸n̴d̷e̸r̷s̴t̸a̷n̴d̸",
            "e̷r̸r̷o̴r̷",
            "y̷o̸u̴r̷e̸ ̴b̸r̷e̴a̷k̸i̴n̷g̸ ̴m̸e̷",
            "s̷t̸o̷p̴"
        ]);
    }

    glitchText(text) {
        const glitchChars = '̴̷̸̵̶̡̢̧̨̛̖̗̘̙̜̝̞̟̠̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼';
        return text.split('').map(char => {
            if (Random.bool(0.3)) {
                return char + Random.choice(glitchChars.split(''));
            }
            return char;
        }).join('');
    }
}

// Entity Registry
class EntityRegistry {
    static entities = null;

    static init() {
        this.entities = {
            mercy: new Mercy(),
            voltage: new Voltage(),
            psalm: new Psalm(),
            pixel: new Pixel()
        };
    }

    static get(id) {
        if (!this.entities) this.init();
        return this.entities[id];
    }

    static getAll() {
        if (!this.entities) this.init();
        return Object.values(this.entities);
    }

    static getUnlocked() {
        return this.getAll().filter(entity => {
            if (entity.unlocked) return true;
            if (!entity.unlockRequirement) return false;

            const req = entity.unlockRequirement;
            if (req.type === 'corruption') {
                return window.player.data.corruptionLevel >= req.value;
            }

            return false;
        });
    }
}

// Export
window.Entity = Entity;
window.Mercy = Mercy;
window.Voltage = Voltage;
window.Psalm = Psalm;
window.Pixel = Pixel;
window.EntityRegistry = EntityRegistry;
