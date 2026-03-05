/**
 * CASE FILE 001 — DOPAMINE CATHEDRAL
 * Cold Open Passages — Episode I
 *
 * These passages run BEFORE the existing vn-passages-ep01.js arc.
 * Entry point: cf001_cold_open
 * Exits into: bell_arrival (from vn-passages-ep01.js)
 *
 * State note: cf001 uses the same DetectiveState as ep01.
 * lucidity  = memory integrity
 * arousal   = signal contamination
 * devotion  = devotion (unchanged)
 * clues     = evidence log
 */

window.addEventListener('DOMContentLoaded', () => {
  const g = window.game;

  // Override the default start passage
  if (g && g._startPassage !== undefined) {
    g._startPassage = 'cf001_cold_open';
  }

  // Convenience: set bg-layer style directly (no asset required)
  const setBg = (css) => {
    const el = document.getElementById('bg-layer');
    if (el) { el.style.backgroundImage = 'none'; el.style.background = css; }
  };

  // ── COLD OPEN ────────────────────────────────────────────────────────────

  g.passage('cf001_cold_open', {
    bg: 'void_library',
    transition: 'blackout',

    onEnter: () => setBg(
      `radial-gradient(ellipse at 50% 80%,
        #2a0a18 0%, #160010 40%, #0a0006 70%, #060003 100%)`
    ),

    text: () => `
      You wake.

      Ceiling. Wood. Old wood, the kind that absorbs color over decades —
      deep burgundy with amber undertones, like something that has been
      breathing smoke for a very long time.

      Bookshelves. Floor-to-ceiling, lining every wall. The volumes
      are filled with text in no language you recognize. The spines
      shimmer faintly, the way screens shimmer when you're not looking
      directly at them.

      The floor is wrong. The carpet patterns keep shifting — not when
      you watch, only in your peripheral vision, a constant quiet
      migration of color.

      In the corner: a monitor. CRT. The screen shows static but the
      static has *structure* — waveforms that are almost faces if you
      stare long enough.

      [whisper]You already know not to stare long enough.[/whisper]

      Your body aches the way it does when you've slept somewhere you
      shouldn't have. Your mouth tastes like metal and cold coffee.

      On the floor, three feet from your right hand:

      A notebook. Open. Your handwriting inside.

      You don't remember writing it.
    `,

    choices: () => [
      { text: 'Read the notebook.', goto: 'cf001_notebook' },
      {
        text: 'Look at the monitor.',
        goto: 'cf001_monitor',
        class: 'temptation',
      },
      { text: 'Check the door.', goto: 'cf001_door' },
    ],
  });

  // ── THE MONITOR ──────────────────────────────────────────────────────────

  g.passage('cf001_monitor', {
    bg: 'void_library',

    onEnter: (s) => {
      setBg(
        `radial-gradient(ellipse at 50% 50%,
          #001828 0%, #00080f 55%, #060003 100%)`
      );
      s.flags.saw_monitor = true;
    },

    text: () => `
      You cross the room.

      The static intensifies as you approach, or maybe that's the
      frequency in your ears — a low tone you feel more than hear,
      somewhere between a hum and a pressure.

      Up close: a face. Barely. The image is wrong, compressed past
      the threshold of recognition into something almost-human. Ringlight
      halo. Dark hair. A smile that has been *engineered* — you can feel
      the engineering of it, the way a trap has a specific weight when
      you step on it.

      She is looking at you.

      Not at a camera. At *you*.

      She mouths something. The static swallows the audio before it
      arrives. You lean closer than you should.

      [warn]The monitor flickers. The image is gone. Just noise.[/warn]

      But the shape of what she said — you feel it somewhere behind
      your sternum, in the part of the brain that stores things the
      conscious mind has agreed not to know.

      The notebook is still open behind you.
    `,

    next: 'cf001_notebook',
  });

  // ── THE DOOR ─────────────────────────────────────────────────────────────

  g.passage('cf001_door', {
    bg: 'void_library',

    onEnter: (s) => {
      setBg(
        `radial-gradient(ellipse at 25% 50%,
          #1a0808 0%, #0d0005 65%, #060003 100%)`
      );
      s.clues.push('corridor_observed');
      s.flags.saw_corridor = true;
    },

    text: () => `
      The door is unlocked.

      This is, somehow, worse than if it had been locked.

      Beyond: a corridor extending further than the building's exterior
      should allow. Fluorescent lights every twenty feet. Most of them
      dead. The ones still working flicker in a rhythm that is almost —
      almost — a pattern.

      At the far end, 200 feet at minimum: another door.

      You don't know how you know this, but you've walked that corridor
      before. More than once. Each time you did something at the other
      end that you don't remember afterward.

      [clue]The back of your neck has a scar you don't remember getting.
      Small. Clean. Recent.[/clue]

      You stand in the threshold for a long moment.

      Then you close the door.

      You go back to the notebook.
    `,

    next: 'cf001_notebook',
  });

  // ── THE NOTEBOOK ─────────────────────────────────────────────────────────

  g.passage('cf001_notebook', {
    bg: 'void_library',

    onEnter: (s) => {
      setBg(
        `radial-gradient(ellipse at 50% 70%,
          #1a1000 0%, #0f0800 55%, #080500 100%)`
      );
      s.lucidity -= 8;
      s.clues.push('assignment_established');
      s.clues.push('previous_operatives');

      // Add notebook entries to the overlay
      if (window.addNotebookEntry) {
        window.addNotebookEntry(
          'TIMESTAMP UNKNOWN',
          'Subject: BELLEPHINE. Handle: @bell_whispers. 2.3M subscribers. ASMR, parasocial maintenance, possible cult mechanics. Assignment: infiltrate, document, extract.',
          null
        );
        window.addNotebookEntry(
          'PAGE 7',
          'Three previous operatives. Voss: 800 pages, same sentence. Park: stopped speaking. Mirko: left the agency. She says it was her choice. It probably was.',
          null
        );
        window.addNotebookEntry(
          'PAGE 12 — UNDERLINED 3x',
          'Don\'t look directly at her eyes for more than four seconds.',
          null
        );
        window.addNotebookEntry(
          'PAGE 23 — TONIGHT\'S DATE',
          'It\'s already started. You\'ll read this and think you\'re at the beginning.',
          'You are not at the beginning.'
        );
      }
    },

    text: () => `
      You sit. Pull the notebook onto your lap.

      The handwriting is yours. The pressure patterns, the specific way
      you don't close your lowercase 'a' — unambiguously yours. Ink dry
      but not old. Written tonight. Written *here*.

      [notebook-inline]Page 1 — Subject: BELLEPHINE. Handle: @bell_whispers.
      2.3M subscribers. ASMR, parasocial engagement, possible cult
      mechanics. Assignment: infiltrate. Document. Extract.[/notebook-inline]

      You don't remember the assignment.

      [notebook-inline]Page 7 — Three previous operatives. Voss submitted
      800 pages consisting entirely of variations on the phrase "she is real."
      Park stopped speaking. Mirko left the agency. She said it was her
      choice. It probably was. That's the whole problem.[/notebook-inline]

      [notebook-inline]Page 12 — Don't look directly at her eyes for more
      than four seconds.[/notebook-inline]

      This entry is underlined three times. The pen tore the paper on
      the third line.

      [clue]Page 23 — The last entry. Written tonight, in your hand:

      "It's already started. You'll read this and think you're at the
      beginning. You're not."[/clue]

      The notebook falls open to a blank page.

      You stare at it for a while.
    `,

    next: 'cf001_recorder',
  });

  // ── THE RECORDER ─────────────────────────────────────────────────────────

  g.passage('cf001_recorder', {
    bg: 'void_library',

    onEnter: (s) => {
      setBg(
        `radial-gradient(ellipse at 50% 45%,
          #0a0a02 0%, #060600 70%, #040403 100%)`
      );
      s.lucidity -= 5;
      s.clues.push('ninety_three_minutes');
    },

    text: () => `
      The recording device is in your coat pocket.

      You don't remember putting it there. It's always been there — that's
      the thing about it. Small, matte black, the specific scratch on the
      lower left corner from the time you dropped it in a parking garage.
      You'd know it in the dark.

      Single red LED. Blinking twice per second. Like a sleeping pulse.

      You hit PLAY.

      Your own voice. Slightly wrong — less careful about something, or
      more careful about the wrong things:

      [recording]"Recorder log, 23:14. I'm in position. She's live right
      now — you can hear it in the background if you turn it up. That
      sound she makes when she's waiting for someone to say something
      first. I've been on this channel for four hours.

      I'm logging it because... if I listen long enough I think I'm going
      to understand something I'm going to regret understanding.

      She asked my name. I told her. She said it back to me in that
      voice — you know the voice — and I had to put the headphones
      down for a minute.

      Going in at midnight. This is the last log before contact. If
      the next log sounds different—"[/recording]

      The recording ends.

      The timestamp says 23:14.

      Your phone says 00:47.

      You have been missing for ninety-three minutes.
    `,

    next: 'cf001_coffee',
  });

  // ── THE COFFEE ───────────────────────────────────────────────────────────

  g.passage('cf001_coffee', {
    bg: 'void_library',

    onEnter: (s) => {
      setBg(
        `radial-gradient(ellipse at 35% 40%,
          #110c02 0%, #080600 65%, #050403 100%)`
      );
    },

    text: () => `
      There is coffee on the desk.

      Hot. Your mug — plain white, crack along the handle sealed with
      super glue, from your apartment three floors and twelve blocks from
      wherever here is. Your coffee. Prepared the way you prepare it.

      You drink it.

      [whisper](You always drink it. This is the one thing that stays.)[/whisper]

      It tastes exactly right: too hot, slightly bitter, with the syrup
      you use and never admit to. Some part of you unclenches.

      You are: a detective. You have a case. Someone named Bellephine.
      A notebook in your handwriting. A recording in your voice.
      Ninety-three minutes unaccounted for. A scar you don't remember.

      This is enough.

      This is, in fact, the exact kind of problem you were built for.

      [whisper](The word "built" snags on something. You let it go.)[/whisper]

      The monitor is showing static again in the corner. The static
      has a rhythm now. You notice it before you decide not to notice it.

      Like breathing.

      Like waiting.
    `,

    choices: () => [
      {
        text: 'Open the notebook. Start working the case.',
        goto: 'cf001_start_case',
        effect: (s) => { s.flags.cold_open_complete = true; },
      },
      {
        text: 'Play the recording one more time. Something felt wrong.',
        goto: 'cf001_recorder_second',
      },
    ],
  });

  // ── RECORDER SECOND LISTEN ───────────────────────────────────────────────

  g.passage('cf001_recorder_second', {
    bg: 'void_library',

    onEnter: (s) => {
      setBg(
        `radial-gradient(ellipse at 50% 45%,
          #0a0a02 0%, #060600 70%, #040403 100%)`
      );
      s.lucidity -= 5;
      s.clues.push('recorder_timestamp_four_days');
    },

    text: () => `
      You play it again.

      Same words. Same voice. Same hesitation before
      *"if the next log sounds different—"*

      But this time: at the very end, after the recording should have
      cut off, there are approximately two seconds of additional audio.

      You can't make out what it is. It might be a word. It might be
      a name. It might be the sound of someone deciding not to say
      something they already know is too late to say.

      You check the file properties.

      [clue]The timestamp says the file was created four days ago.[/clue]

      Your phone says today is the first day you've been here.

      One of them is wrong.

      You save the extra audio. Label it: EVIDENCE_01.

      You open the notebook.
    `,

    next: 'cf001_start_case',
  });

  // ── BRIDGE: INTO THE EXISTING ARC ────────────────────────────────────────

  g.passage('cf001_start_case', {
    bg: 'void_library',
    transition: 'dissolve',

    onEnter: (s) => {
      setBg(
        `radial-gradient(ellipse at 50% 80%,
          #0f0010 0%, #080008 50%, #040003 100%)`
      );
      // Sync the notebook's briefing with what we established in the cold open
      s.flags.silent_acceptance = true; // detective goes in knowing the assignment
    },

    text: (s) => `
      The assignment is clear enough from the notebook:

      Floor fourteen. Apartment C. The building on Vesper Street with
      the sodium-yellow haze and the lobby code they always leave.

      You've been here before. According to the notebook, this is your
      first time.

      According to the scar on your neck, it isn't.

      You finish the coffee. Set the mug down. Check your coat.
      The recorder is there. The notebook goes in your inside pocket.

      The monitor in the corner flicks off.

      Or maybe it was never on.

      [whisper]( Out. Into the corridor. Down. Out into the night. )[/whisper]

      [whisper]( You don't take the elevator. )[/whisper]
    `,

    next: 'bell_arrival',
  });

  // ── OVERRIDE ENGINE START TO USE COLD OPEN ───────────────────────────────
  // The engine's _startNew() hardcodes 'ep01_start'. Patch it here so that
  // casefile001.html starts at the cold open instead.
  if (window.game) {
    window.game._startNew = function () {
      this.state = this._defaultState();
      this.ui.hideMenu();
      this.goto('cf001_cold_open');
    };
  }

});
