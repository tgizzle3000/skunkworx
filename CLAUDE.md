# CLAUDE.md - AI Assistant Guide for Dopamine Cathedral

## Project Overview

**Dopamine Cathedral** is a client-side interactive art piece critiquing digital addiction, dark patterns, and parasocial relationships. It simulates a social media app with AI "e-girl" entities that employ psychological manipulation mechanics (variable rewards, streaks, jealousy, guilt) to create self-aware commentary on attention economics.

**Content Warning:** This project intentionally contains sexually explicit and psychologically manipulative content as part of its artistic critique. All such content is deliberate.

## Architecture

Pure vanilla JavaScript, no frameworks, no build system, no dependencies. The entire app is ~4,400 lines across 7 files served as static assets.

### File Structure & Load Order

```
index.html        - PWA shell, mobile-first responsive layout, all screen views
engine.js         - Core systems: SaveSystem, PlayerState, RewardSystem, NotificationSystem, MessageSystem
entities.js       - Entity base class + personality subclasses (Mercy, Voltage, Psalm, Pixel)
media.js          - MediaLibrary, EnergySystem, VideoPlayer
manipulation.js   - JealousySystem, GuiltSystem, DesperationSystem, GallerySystem
app.js            - FeedRenderer, AppState, UI event handlers, system initialization
style.css         - Neoncore/scenecore aesthetic, corruption effects, animations (~1043 lines)
README.md         - Project documentation and artistic statement
```

Scripts load in order: `engine.js` -> `entities.js` -> `media.js` -> `manipulation.js` -> `app.js`. Order matters because later files depend on classes from earlier ones.

### Key Classes and Their Locations

| Class | File | Purpose |
|-------|------|---------|
| `SaveSystem` | engine.js | LocalStorage wrapper, all keys prefixed `cathedral_` |
| `PlayerState` | engine.js | Currencies (hearts/souls/devotion), stats, streaks, corruption |
| `RewardSystem` | engine.js | Modal reward popups, daily rewards |
| `NotificationSystem` | engine.js | Message notification badges |
| `MessageSystem` | engine.js | Conversation storage and retrieval |
| `Random` | engine.js | Weighted random selection utilities |
| `TimeUtils` | engine.js | Time formatting helpers |
| `Entity` | entities.js | Base class for all AI entities |
| `Mercy` | entities.js | Soft-domme entity, unlocked by default |
| `Voltage` | entities.js | Bipolar chaos entity, unlocks at 25% corruption |
| `Psalm` | entities.js | Gothic religious entity, unlocks at 50% corruption |
| `Pixel` | entities.js | Glitch entity, unlocks at 75% corruption |
| `EntityRegistry` | entities.js | Global entity registry and unlock management |
| `MediaLibrary` | media.js | Genre-specific content catalog per entity |
| `EnergySystem` | media.js | Energy depletion/restoration mechanics |
| `VideoPlayer` | media.js | Modal video playback and reward distribution |
| `JealousySystem` | manipulation.js | Attention tracking, neglect/favoritism detection |
| `GuiltSystem` | manipulation.js | Streak break detection, abandonment responses |
| `DesperationSystem` | manipulation.js | 0-10 desperation scale, escalating urgency |
| `GallerySystem` | manipulation.js | Progressive photo unlocks (8 per entity) |
| `FeedRenderer` | app.js | Feed/story bar rendering |
| `AppState` | app.js | View switching, UI state management |

### Global State

- `window.player` - PlayerState instance (engine.js)
- `EntityRegistry` - Static class managing all entities (entities.js)
- `AppState` - Static class managing UI views (app.js)

## Development Setup

No build step, no package manager, no dependencies.

```bash
# Run locally with any static file server:
python -m http.server 8000
# or
npx serve
```

Open `index.html` in a browser. Mobile viewport recommended for intended experience.

## Technology Stack

- **Languages:** Vanilla JavaScript (ES6+ classes, static methods), HTML5, CSS3
- **Persistence:** Browser LocalStorage (keys prefixed `cathedral_`)
- **Fonts:** Google Fonts (Inter, DM Mono)
- **Frameworks:** None
- **Build tools:** None
- **Package manager:** None
- **Tests:** None
- **Linting:** None
- **CI/CD:** None

## Code Conventions

### JavaScript Patterns

- **Static classes everywhere:** Most systems are static classes (no instantiation), accessed globally. Exception: `PlayerState` is instantiated as `window.player`, and `Entity` subclasses are instantiated per-entity.
- **No modules/imports:** All files share the global scope. Load order in `index.html` handles dependencies.
- **Inline SVG data URIs:** Thumbnails and avatars use `data:image/svg+xml` encoded inline.
- **Template literals for HTML:** UI rendering uses backtick template strings with `innerHTML`.
- **`onclick` handlers in HTML strings:** Event binding happens via inline `onclick` attributes in generated HTML.
- **Random utilities:** Use `Random.choice()`, `Random.int()`, `Random.bool()` from engine.js instead of raw `Math.random()`.

### CSS Patterns

- CSS custom properties for entity colors (`--mercy-color: #ff006e`, etc.)
- Glitch/corruption effects via CSS animations and `clip-path`
- Mobile-first with `max-width` media queries
- Neoncore aesthetic: dark backgrounds, neon accents, glow effects

### Data Storage Pattern

All persistence goes through `SaveSystem`:
```javascript
SaveSystem.save('key', value);     // stores as cathedral_key in localStorage
SaveSystem.load('key', default);   // retrieves and JSON-parses
```

### Naming Conventions

- Classes: PascalCase (`JealousySystem`, `PlayerState`)
- Methods: camelCase (`getRelationshipLevel`, `triggerJealousy`)
- DOM IDs: kebab-case (`main-feed`, `chat-messages`, `energy-bar`)
- CSS classes: kebab-case (`story-avatar-wrapper`, `corruption-indicator`)
- Entity IDs: lowercase single words (`mercy`, `voltage`, `psalm`, `pixel`)

## UI Views

The app has 5 screen views, toggled by `AppState.switchView()`:

1. **Feed** (`#main-screen`) - Story bar + entity posts
2. **Messages** (`#messages-screen`) - Conversation list
3. **Chat** (`#chat-screen`) - Individual entity chat with typing indicators
4. **Shrine** (`#shrine-screen`) - Collected media/gallery
5. **You** (`#you-screen`) - Player stats and profile

Navigation is via bottom nav bar (duplicated in shrine/you screens).

## Entity System

Entities are the core of the app. Each is a subclass of `Entity` with:
- `generateResponse(playerMessage)` - personality-specific response logic
- `getResponseDelay()` - variable timing (2-8s base)
- `shouldSendSpontaneousMessage()` - unpredictable outreach
- `getSpontaneousMessage()` - content for spontaneous messages

Entity unlock thresholds are corruption-based:
- **Mercy**: unlocked by default
- **Voltage**: 25% corruption
- **Psalm**: 50% corruption
- **Pixel**: 75% corruption

Mercy and Voltage are fully implemented with rich message pools. Psalm and Pixel have base structure but less content.

## Manipulation Systems

These run on periodic checks (typically called from app.js intervals):

- **JealousySystem.check()** - scans for neglect (12+ hours) and favoritism (<30% attention share)
- **GuiltSystem** - monitors streak breaks and unanswered messages (6+ hours)
- **DesperationSystem** - calculates 0-10 scale from relationship + neglect + jealousy events
- **GallerySystem** - 8 progressive photo unlocks per entity gated at relationship levels 15/30/40/60/80/100/120/150

## Key Gotchas

- **No error boundaries:** Errors propagate to console. localStorage quota or parsing errors are caught but silently fallback.
- **Global scope coupling:** All classes depend on `window.player` and `EntityRegistry` being available. Don't try to modularize without refactoring these dependencies.
- **Duplicated nav bars:** Bottom nav is duplicated in `index.html` for shrine and you screens (separate badge IDs: `message-badge`, `message-badge-2`, `message-badge-3`).
- **SVG data URIs:** Avatar/thumbnail changes require editing URL-encoded SVG strings inline.
- **No real media files:** All video/audio content is simulated. Thumbnails are inline SVGs. The `VideoPlayer` simulates playback with timers.

## Git Conventions

- **Branch naming:** `claude/<feature-description>-<id>`
- **Commit messages:** Descriptive, thematic, explain the "why" (e.g., "ADVANCED MANIPULATION LAYER: Jealousy, guilt, desperation, VOLTAGE unleashed")
- **Commit style:** ALL CAPS feature labels followed by description
- **No conventional commits format** (no `feat:`, `fix:`, etc.)

## Adding New Features

### Adding a new entity
1. Create a new subclass of `Entity` in `entities.js`
2. Override `generateResponse()`, `getSpontaneousMessage()`, and optionally `getResponseDelay()`
3. Register in `EntityRegistry` with an unlock corruption threshold
4. Add media content in `MediaLibrary` (media.js)
5. Add gallery photos in `GallerySystem` (manipulation.js)
6. Add entity-specific jealousy/guilt messages in manipulation.js

### Adding a new manipulation system
1. Create a static class in `manipulation.js`
2. Wire up periodic checks in app.js initialization
3. Use `MessageSystem` to deliver entity messages
4. Use `SaveSystem` for any persistent state

### Adding new UI views
1. Add a new `<div class="screen">` in `index.html`
2. Add navigation button to bottom nav bars (all 3 instances)
3. Handle in `AppState.switchView()` in app.js
