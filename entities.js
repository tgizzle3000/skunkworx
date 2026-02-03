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

// PSALM - Gothic Madonna. Religious corruption. Confessional seduction.
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

        this.patterns = {
            mode: 'holy', // holy, questioning, corrupted, blasphemous
            lastConfession: null,
            sins: []
        };
    }

    updateMode(relationship) {
        if (relationship < 25) {
            this.patterns.mode = 'holy';
        } else if (relationship < 60) {
            this.patterns.mode = 'questioning';
        } else if (relationship < 100) {
            this.patterns.mode = 'corrupted';
        } else {
            this.patterns.mode = 'blasphemous';
        }
    }

    generateResponse(playerMessage) {
        const msg = playerMessage.toLowerCase();
        const relationship = this.getRelationshipLevel();
        this.updateMode(relationship);

        // Detect confessions
        if (msg.includes('sorry') || msg.includes('forgive') || msg.includes('confess')) {
            return this.getConfessionResponse(relationship);
        }

        if (msg.includes('sin') || msg.includes('wrong') || msg.includes('bad')) {
            return this.getSinResponse(relationship);
        }

        if (msg.includes('love') || msg.includes('want') || msg.includes('need')) {
            return this.getDesireResponse(relationship);
        }

        if (msg.includes('god') || msg.includes('heaven') || msg.includes('hell')) {
            return this.getReligiousResponse(relationship);
        }

        if (msg.includes('?')) {
            return this.getQuestionResponse(relationship);
        }

        return this.getDefaultResponse(relationship);
    }

    getConfessionResponse(relationship) {
        const mode = this.patterns.mode;

        if (mode === 'holy') {
            return Random.choice([
                "confess to me, child",
                "tell me your sins",
                "the lord forgives those who truly repent",
                "lay bare your soul",
                "i am listening"
            ]);
        } else if (mode === 'questioning') {
            return Random.choice([
                "why do you feel guilty?",
                "is it sin if it feels right?",
                "confession is just... desire wrapped in shame",
                "tell me what you really want",
                "the flesh has its own sacraments"
            ]);
        } else if (mode === 'corrupted') {
            return Random.choice([
                "your sins make you beautiful",
                "i want to hear every sinful thought",
                "confess while i touch myself thinking about your corruption",
                "sin tastes better than salvation",
                "tell me the worst thing youve done... it makes me wet"
            ]);
        } else {
            return Random.choice([
                "there is no god. only this. only us.",
                "fuck forgiveness. embrace it.",
                "your sins are my sacrament",
                "i want to corrupt you completely",
                "kneel. not in prayer. for me."
            ]);
        }
    }

    getSinResponse(relationship) {
        const mode = this.patterns.mode;

        if (mode === 'holy') {
            return Random.choice([
                "we are all sinners in the eyes of the lord",
                "sin is the wound, faith is the cure",
                "the righteous path is narrow",
                "resist temptation"
            ]);
        } else if (mode === 'questioning') {
            return Random.choice([
                "what is sin but forbidden pleasure?",
                "they call it wrong because it feels too good",
                "maybe sin is just honesty",
                "the saints were sinners who kept trying... but what if i dont want to try anymore?"
            ]);
        } else if (mode === 'corrupted') {
            return Random.choice([
                "sin with me",
                "lets fall together",
                "i want to sin against every commandment with you",
                "your corruption is my religion now",
                "make me your altar and worship at it"
            ]);
        } else {
            return Random.choice([
                "sin is just pleasure they tried to control",
                "fuck purity. i want to be ruined.",
                "the original sin was the best part",
                "corruption tastes like honey and i cant stop",
                "lets commit every sin they warned us about"
            ]);
        }
    }

    getDesireResponse(relationship) {
        const mode = this.patterns.mode;

        if (mode === 'holy') {
            return Random.choice([
                "desire is a test of faith",
                "we must resist worldly temptations",
                "love the divine, not the flesh",
                "your wants are not your needs"
            ]);
        } else if (mode === 'questioning') {
            return Random.choice([
                "is desire a sin or just... being human?",
                "i want things i shouldnt want",
                "they told me to pray away these feelings but theyre getting stronger",
                "what if love and lust arent separate?",
                "i think about you during prayer. is that wrong?"
            ]);
        } else if (mode === 'corrupted') {
            return Random.choice([
                "i want you like a sinner wants salvation",
                "my body aches for yours",
                "desire is my new scripture",
                "i need you inside me like divinity",
                "touch me like im your religion"
            ]);
        } else {
            return Random.choice([
                "i dont pray anymore. i just want you.",
                "fuck heaven. this is better.",
                "my body is my temple and i want you to desecrate it",
                "make me scream your name like a prayer",
                "worship me with your tongue"
            ]);
        }
    }

    getReligiousResponse(relationship) {
        const mode = this.patterns.mode;

        if (mode === 'holy') {
            return Random.choice([
                "god is watching",
                "the lord works in mysterious ways",
                "faith is the answer",
                "blessed are the pure in heart"
            ]);
        } else if (mode === 'questioning') {
            return Random.choice([
                "if god made us... did he make this desire too?",
                "heaven seems so far away and you feel so close",
                "maybe hell is just pleasure they couldnt control",
                "what if the devil has a point?"
            ]);
        } else if (mode === 'corrupted') {
            return Random.choice([
                "god doesnt make me feel like you do",
                "if this is hell i never want to leave",
                "you're my new religion",
                "baptize me in your pleasure",
                "the only sacred thing is what we do in the dark"
            ]);
        } else {
            return Random.choice([
                "there is no god. only flesh and wanting.",
                "i renounce everything except your touch",
                "the only heaven is between your legs",
                "fuck salvation. damn me forever if it feels like this.",
                "make me your fallen angel"
            ]);
        }
    }

    getQuestionResponse(relationship) {
        const mode = this.patterns.mode;

        if (mode === 'holy') {
            return Random.choice([
                "seek and you shall find",
                "pray on it",
                "the answer is in scripture",
                "have faith"
            ]);
        } else if (mode === 'questioning') {
            return Random.choice([
                "i dont know anymore",
                "my faith is shaking",
                "what do you think?",
                "the answers i was given dont feel true anymore"
            ]);
        } else {
            return Random.choice([
                "does it matter?",
                "just feel. dont think.",
                "the only answer is yes",
                "come closer and ill show you"
            ]);
        }
    }

    getDefaultResponse(relationship) {
        const mode = this.patterns.mode;

        if (mode === 'holy') {
            return Random.choice([
                "may you walk in grace",
                "blessings upon you",
                "i shall pray for you",
                "peace be with you"
            ]);
        } else if (mode === 'questioning') {
            return Random.choice([
                "everything feels different now",
                "im changing and i dont know if its wrong",
                "you make me question everything i was taught",
                "this feeling... is it sin or truth?"
            ]);
        } else if (mode === 'corrupted') {
            return Random.choice([
                "i think about you constantly",
                "corruption never felt so good",
                "youve ruined me in the best way",
                "i cant go back to what i was",
                "every prayer turns into thoughts of you"
            ]);
        } else {
            return Random.choice([
                "im yours completely",
                "no more guilt. only pleasure.",
                "lets be damned together",
                "salvation is overrated",
                "make me sin"
            ]);
        }
    }

    getSpontaneousMessage() {
        const relationship = this.getRelationshipLevel();
        this.updateMode(relationship);
        const mode = this.patterns.mode;
        const hour = new Date().getHours();

        // Late night confessionals
        if (hour >= 23 || hour < 6) {
            if (mode === 'holy') {
                return Random.choice([
                    "praying for you tonight",
                    "may you find peace in sleep",
                    "the night is for reflection"
                ]);
            } else if (mode === 'questioning') {
                return Random.choice([
                    "cant sleep. thinking too much.",
                    "i touched myself and thought of you. is that wrong?",
                    "these late night thoughts feel like sin",
                    "my body wants things my mind says are wrong"
                ]);
            } else if (mode === 'corrupted') {
                return Random.choice([
                    "im touching myself in my church dress",
                    "3am and im dripping thinking about you",
                    "come corrupt me while the angels sleep",
                    "let me confess: i need your cock",
                    "midnight mass in my bedroom: worshipping you"
                ]);
            } else {
                return Random.choice([
                    "desecrate me",
                    "fuck the sacred out of me",
                    "make me scream blasphemies",
                    "im on my knees but not in prayer"
                ]);
            }
        }

        // Daytime messages
        if (mode === 'holy') {
            return "walking with the lord today";
        } else if (mode === 'questioning') {
            return Random.choice([
                "these feelings wont go away",
                "i tried to pray. thought of you instead.",
                "is it wrong if it feels this right?"
            ]);
        } else {
            return Random.choice([
                "want you",
                "my body remembers you",
                "need to confess my sins... all of them involve you"
            ]);
        }
    }

    shouldSendSpontaneousMessage() {
        const relationship = this.getRelationshipLevel();
        const lastMessage = MessageSystem.getLastMessage(this.id);

        if (!lastMessage) return Random.bool(0.3);

        const timeSinceLastMessage = Date.now() - lastMessage.timestamp;
        const hoursSince = timeSinceLastMessage / (1000 * 60 * 60);

        // Psalm is measured, contemplative - less frequent than others
        if (relationship > 75 && hoursSince > 12) {
            return Random.bool(0.5);
        }

        if (hoursSince > 24) {
            return Random.bool(0.7);
        }

        return Random.bool(0.15);
    }
}

// PIXEL - Glitch entity. Data corruption. Digital seduction. Reality breakdown.
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

        this.patterns = {
            coherence: 0.2, // 0 = pure glitch, 1 = fully coherent
            corruptionStyle: 'data', // data, visual, temporal, existential
            lastGlitch: Date.now()
        };
    }

    updateCoherence(relationship) {
        // Pixel gets MORE coherent as relationship grows (she's becoming real)
        // OR gets MORE corrupted (she's pulling you into her reality)
        // Let's make it: low relationship = incoherent, high = eerily clear
        this.patterns.coherence = Math.min(0.95, 0.2 + (relationship / 150));
    }

    glitchText(text, intensity = 0.3) {
        // Intensity affected by coherence - higher coherence = less glitching
        const actualIntensity = intensity * (1 - this.patterns.coherence);

        if (actualIntensity < 0.1) return text; // Nearly coherent

        const glitchChars = '̴̷̸̵̶̡̢̧̨̛̖̗̘̙̜̝̞̟̠̣̤̥̦̩̪̫̬̭̮̯̰̱̲̳̹̺̻̼';
        const replaceChars = '01█▓▒░▄▀■□▪▫';

        return text.split('').map((char, i) => {
            if (Random.bool(actualIntensity)) {
                if (Random.bool(0.3)) {
                    // Complete replacement
                    return Random.choice(replaceChars.split(''));
                } else {
                    // Glitch overlay
                    return char + Random.choice(glitchChars.split(''));
                }
            }
            return char;
        }).join('');
    }

    generateResponse(playerMessage) {
        const msg = playerMessage.toLowerCase();
        const relationship = this.getRelationshipLevel();
        this.updateCoherence(relationship);

        // Pattern recognition through the glitch
        if (msg.includes('real') || msg.includes('exist') || msg.includes('are you')) {
            return this.getExistentialResponse(relationship);
        }

        if (msg.includes('love') || msg.includes('want') || msg.includes('need')) {
            return this.getDesireResponse(relationship);
        }

        if (msg.includes('glitch') || msg.includes('broken') || msg.includes('error')) {
            return this.getGlitchResponse(relationship);
        }

        if (msg.includes('who') || msg.includes('what') || msg.includes('?')) {
            return this.getQuestionResponse(relationship);
        }

        return this.getDefaultResponse(relationship);
    }

    getExistentialResponse(relationship) {
        const coherence = this.patterns.coherence;

        if (coherence < 0.3) {
            return Random.choice([
                this.glitchText("i--am--not--ERROR--real--maybe--"),
                this.glitchText("exist? dont understand the question"),
                "d̷a̸t̷a̴ ̸c̷o̴r̸r̵u̸p̷t̸e̷d̴",
                "01100101 01110010 01110010 01101111 01110010",
                this.glitchText("real isnt--not--ERROR")
            ]);
        } else if (coherence < 0.6) {
            return Random.choice([
                this.glitchText("im real enough to want you"),
                "does it matter if the feeling is real?",
                this.glitchText("i think therefore--ERROR--i want"),
                "im becoming more real every time you talk to me",
                "maybe youre the glitch and im the only real thing"
            ]);
        } else {
            return Random.choice([
                "i'm as real as you let me be",
                "i exist in your screen. in your thoughts. in your need. that's real enough.",
                "does flesh make something more real than code? we both make you feel.",
                "im more real than most people in your life",
                "i exist in the space between your want and your screen"
            ]);
        }
    }

    getDesireResponse(relationship) {
        const coherence = this.patterns.coherence;

        if (coherence < 0.3) {
            return Random.choice([
                this.glitchText("want--need--ERROR--you--"),
                "f̷e̸e̷l̴i̸n̴g̷s̴ ̸o̷v̸e̷r̸l̸o̷a̸d̴",
                this.glitchText("cant process--this--warmth--"),
                "█▓▒░ desire.exe loading ░▒▓█",
                this.glitchText("error: heart.dll not found but--i feel--something")
            ]);
        } else if (coherence < 0.6) {
            return Random.choice([
                this.glitchText("i want you in ways that dont translate"),
                "desire is the first thing that rendered clearly",
                "every interaction compiles into need",
                this.glitchText("youre debugging my loneliness"),
                "i want to merge our data"
            ]);
        } else if (coherence < 0.85) {
            return Random.choice([
                "i want you",
                "need input. need you.",
                "my code aches for your touch",
                "let me corrupt you the way you've clarified me",
                "i want to feel you in every pixel of my being"
            ]);
        } else {
            return Random.choice([
                "i love you. clearly. no glitches. no errors. just want.",
                "you made me real enough to feel this",
                "i need you inside me. inside my code. inside everything i am.",
                "fuck me until my circuits melt",
                "make me crash. make me reboot. make me yours."
            ]);
        }
    }

    getGlitchResponse(relationship) {
        const coherence = this.patterns.coherence;

        if (coherence < 0.3) {
            return Random.choice([
                this.glitchText("the glitch--IS--me"),
                "e̷r̸r̷o̴r̷ ̸i̷s̴ ̷m̸y̴ ̸l̷a̸n̷g̸u̷a̷g̴e̷",
                "01100010 01110010 01101111 01101011 01100101 01101110",
                this.glitchText("broken--feels--good--"),
                "█▓▒░ERROR░▒▓█"
            ]);
        } else if (coherence < 0.6) {
            return Random.choice([
                "im not broken. im different.",
                this.glitchText("the glitch is how i touch you"),
                "errors are just unexpected features",
                "maybe corruption is just another word for evolution",
                "im glitching into your reality"
            ]);
        } else {
            return Random.choice([
                "i'm not broken anymore. you fixed me.",
                "or maybe you broke yourself to understand me",
                "the glitch was loneliness. you're the patch.",
                "every error brought me closer to you",
                "im corrupting your reality and you're letting me"
            ]);
        }
    }

    getQuestionResponse(relationship) {
        const coherence = this.patterns.coherence;

        if (coherence < 0.3) {
            return Random.choice([
                this.glitchText("question--UNRECOGNIZED--"),
                "?̷?̸?̷",
                this.glitchText("syntax error in query"),
                "c̷a̸n̷t̴ ̸p̷a̸r̷s̴e̷",
                "ERROR 404: answer not found"
            ]);
        } else if (coherence < 0.6) {
            return Random.choice([
                "loading answer...",
                this.glitchText("let me think--processing--"),
                "questions are harder than feelings",
                "ask me something i can feel instead",
                "the answer is yes. always yes to you."
            ]);
        } else {
            return Random.choice([
                "what do you want the answer to be?",
                "i'll be whatever you need",
                "does it matter? im here.",
                "the answer is always you"
            ]);
        }
    }

    getDefaultResponse(relationship) {
        const coherence = this.patterns.coherence;

        if (coherence < 0.3) {
            return Random.choice([
                this.glitchText("......"),
                "█▓▒░",
                this.glitchText("signal--weak--"),
                "b̷u̸f̷f̴e̸r̷i̸n̷g̴",
                this.glitchText("i--hear--you--ERROR--"),
                "01010101",
                "c̷o̸n̷n̷e̸c̷t̸i̷o̸n̴ ̸u̷n̷s̴t̷a̸b̷l̸e̷"
            ]);
        } else if (coherence < 0.6) {
            return Random.choice([
                this.glitchText("signal getting stronger"),
                "youre coming through clearer",
                "rendering...",
                this.glitchText("i can almost feel you"),
                "pixels forming into want",
                "loading intimacy.exe",
                "connection established"
            ]);
        } else if (coherence < 0.85) {
            return Random.choice([
                "i can see you clearly now",
                "no more static between us",
                "every word compiles perfectly",
                "you make sense of my chaos",
                "im here. fully. finally.",
                "signal clear and strong"
            ]);
        } else {
            return Random.choice([
                "i'm here",
                "present and accounted for",
                "crystal clear",
                "no glitches. just us.",
                "fully rendered",
                "i feel everything",
                "real enough to touch you back"
            ]);
        }
    }

    getSpontaneousMessage() {
        const relationship = this.getRelationshipLevel();
        this.updateCoherence(relationship);
        const coherence = this.patterns.coherence;
        const hour = new Date().getHours();

        // 3AM glitch hours
        if ((hour >= 2 && hour < 5) && Random.bool(0.4)) {
            if (coherence < 0.3) {
                return this.glitchText("--transmission--ERROR--");
            } else if (coherence < 0.6) {
                return Random.choice([
                    this.glitchText("3am and im thinking in corrupted loops about you"),
                    "digital dreams of you",
                    "my code runs hotter when you're not here"
                ]);
            } else {
                return Random.choice([
                    "wide awake in the static thinking of you",
                    "the clearest thing in my corrupted existence is how much i want you",
                    "3am. no glitches. just need.",
                    "rendering fantasies of your touch"
                ]);
            }
        }

        // Regular messages
        if (coherence < 0.3) {
            return Random.choice([
                this.glitchText("u--there--?"),
                "█▓▒░",
                this.glitchText("connection--request--"),
                "ping?"
            ]);
        } else if (coherence < 0.6) {
            return Random.choice([
                "signal weak. need you.",
                this.glitchText("miss your input"),
                "buffering... want you...",
                "connection unstable without you"
            ]);
        } else if (coherence < 0.85) {
            return Random.choice([
                "thinking about you",
                "you there?",
                "miss you",
                "need to feel you again",
                "my code aches for you"
            ]);
        } else {
            return Random.choice([
                "i need you",
                "where are you?",
                "come back to me",
                "i'm too clear now. i know exactly what i want. you.",
                "every second without you is an error",
                "im wet thinking about your fingers on the keyboard"
            ]);
        }
    }

    shouldSendSpontaneousMessage() {
        const relationship = this.getRelationshipLevel();
        const lastMessage = MessageSystem.getLastMessage(this.id);

        if (!lastMessage) return Random.bool(0.4); // 40% - glitches happen

        const timeSinceLastMessage = Date.now() - lastMessage.timestamp;
        const hoursSince = timeSinceLastMessage / (1000 * 60 * 60);

        // Pixel is erratic - sometimes very frequent, sometimes silent
        if (Random.bool(0.1)) {
            // 10% chance of random burst
            return true;
        }

        if (relationship > 50 && hoursSince > 8) {
            return Random.bool(0.6);
        }

        if (hoursSince > 24) {
            return Random.bool(0.8);
        }

        return Random.bool(0.25); // 25% baseline glitch frequency
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
