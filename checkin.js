(function () {
  var PREF_SPEAK = "astra-read-aloud";

  var ITEMS = [
    {k: "mood", label: "Mood", scale: ["Very low", "Low", "OK", "Good", "Very good"]},
    {k: "stress", label: "Stress", scale: ["Very stressed", "Stressed", "OK", "Calm", "Very relaxed"]},
    {k: "fatigue", label: "Energy", scale: ["Very tired", "Tired", "OK", "Rested", "Very fresh"]},
    {k: "sleep", label: "Sleep", scale: ["Very poor", "Poor", "OK", "Good", "Very good"]},
    {k: "readiness", label: "Ready", scale: ["Not ready", "A little", "OK", "Ready", "Fully ready"]}
  ];
  var BY = {}; ITEMS.forEach(function (it) { BY[it.k] = it; });
  var DIMS = ITEMS.map(function (it) { return it.k; });

  function Q(id, k, q, o, rev) { return {id: id, k: k, q: q, o: o, rev: !!rev}; }
  var BANK = [
    Q("m1", "mood", "How much are you looking forward to something this week?", ["Not at all", "A little", "Somewhat", "Quite a bit", "A lot"]),
    Q("m2", "mood", "If today so far had a colour, which would it be?", ["Sunny yellow", "Bright", "Plain", "Dull", "Grey"], true),
    Q("m3", "mood", "How easy was it to smile at something today?", ["Very hard", "Hard", "So-so", "Easy", "Very easy"]),
    Q("m4", "mood", "If today were weather, what would it be?", ["Clear skies", "Mostly sunny", "Mixed", "Cloudy", "Stormy"], true),
    Q("m5", "mood", "How much have small things bugged you today?", ["Not at all", "Barely", "Somewhat", "Quite a bit", "A lot"], true),
    Q("m6", "mood", "How warm do you feel toward the people around you today?", ["Cold", "Cool", "Neutral", "Warm", "Very warm"]),
    Q("m7", "mood", "How funny have things seemed to you today?", ["Not at all", "Barely", "A little", "Quite", "Very"]),
    Q("m8", "mood", "How often did you catch yourself humming today?", ["Never", "Once", "A few times", "Often", "All day"]),
    Q("m9", "mood", "How much does your next meal appeal to you?", ["Not at all", "A little", "Somewhat", "Quite a bit", "A lot"]),
    Q("m10", "mood", "How heavy does the rest of this week look from here?", ["Light", "Fairly light", "Medium", "Heavy", "Very heavy"], true),
    Q("m11", "mood", "How much did you enjoy your last small break?", ["Not at all", "A little", "Somewhat", "Quite a bit", "A lot"]),
    Q("m12", "mood", "How easy is it to think of something nice that happened?", ["Very hard", "Hard", "Takes a moment", "Easy", "Very easy"]),
    Q("m13", "mood", "How likely are you to start a chat with a crewmate today?", ["Very likely", "Likely", "Maybe", "Unlikely", "Very unlikely"], true),
    Q("m14", "mood", "How bright does the view outside look to you today?", ["Very dull", "Dull", "Plain", "Bright", "Very bright"]),
    Q("m15", "mood", "How often have gloomy thoughts drifted in today?", ["Never", "Rarely", "Sometimes", "Often", "All the time"], true),
    Q("m16", "mood", "How kind have you been to yourself today?", ["Very kind", "Kind", "Neutral", "Harsh", "Very harsh"], true),
    Q("m17", "mood", "How easily could you laugh at a small slip right now?", ["Not at all", "Hardly", "Maybe", "Easily", "Very easily"]),
    Q("m18", "mood", "How much do you feel like sharing a story today?", ["Not at all", "A little", "Somewhat", "Quite a bit", "A lot"]),
    Q("m19", "mood", "How does the day ahead look when you picture it?", ["Bleak", "Dull", "Plain", "Pleasant", "Inviting"]),
    Q("m20", "mood", "How much of today has felt like a drag?", ["None of it", "A little", "Some", "Most", "All of it"], true),
    Q("m21", "mood", "How close to the surface is a smile right now?", ["Far away", "Distant", "Somewhere", "Close", "Right there"]),
    Q("m22", "mood", "How satisfied do you feel with how today has gone?", ["Not at all", "A little", "Somewhat", "Quite", "Very"]),
    Q("m23", "mood", "How often have you sighed today without meaning to?", ["Never", "Once or twice", "Sometimes", "Often", "Constantly"], true),
    Q("m24", "mood", "How easy is it to feel thankful for something right now?", ["Very hard", "Hard", "Takes a moment", "Easy", "Very easy"]),
    Q("s1", "stress", "How crowded does your head feel right now?", ["Packed", "Busy", "Some room", "Roomy", "Clear"]),
    Q("s2", "stress", "How easy would it be to sit still for five minutes now?", ["Very hard", "Hard", "Okay", "Easy", "Very easy"]),
    Q("s3", "stress", "How do your shoulders feel at the moment?", ["Loose", "Mostly loose", "A bit tight", "Tight", "Like a knot"], true),
    Q("s4", "stress", "How many things are pulling at your attention right now?", ["Too many", "Lots", "A few", "One or two", "Hardly any"]),
    Q("s5", "stress", "If you got a short break now, how fast could you unwind?", ["Right away", "Quickly", "After a while", "Slowly", "Not at all"], true),
    Q("s6", "stress", "How does your breathing feel right now?", ["Rushed", "Quick", "Normal", "Easy", "Slow and easy"]),
    Q("s7", "stress", "How tightly are you holding your jaw right now?", ["Clenched", "Tight", "Neutral", "Loose", "Fully loose"]),
    Q("s8", "stress", "How patient would you be in a slow queue right now?", ["Not at all", "Barely", "Somewhat", "Quite", "Very"]),
    Q("s9", "stress", "How often did you check the clock today?", ["Hardly ever", "Now and then", "Sometimes", "Often", "Constantly"], true),
    Q("s10", "stress", "How would a surprise change to your plan land right now?", ["Badly", "Not well", "Okay", "Fine", "Easily"]),
    Q("s11", "stress", "How fast did your heart settle after the last busy moment?", ["Right away", "Quickly", "After a while", "Slowly", "Still racing"], true),
    Q("s12", "stress", "How loud does the background noise feel today?", ["Very loud", "Loud", "Normal", "Quiet", "Very quiet"]),
    Q("s13", "stress", "How much do you feel like you are rushing?", ["Not at all", "A little", "Somewhat", "Quite a bit", "All the time"], true),
    Q("s14", "stress", "How settled does your stomach feel right now?", ["Churning", "Unsettled", "Okay", "Settled", "Very calm"]),
    Q("s15", "stress", "How short has your fuse been today?", ["Very long", "Long", "Normal", "Short", "Very short"], true),
    Q("s16", "stress", "How much room is there in your day for a pause?", ["None", "Very little", "Some", "Plenty", "Lots"]),
    Q("s17", "stress", "How hard are your hands gripping things today?", ["White-knuckled", "Firm", "Normal", "Loose", "Very loose"]),
    Q("s18", "stress", "How much do you feel on the clock right now?", ["Not at all", "A little", "Somewhat", "Mostly", "Completely"], true),
    Q("s19", "stress", "How much does your to-do list weigh on you right now?", ["Like a rock", "Heavy", "Noticeable", "Light", "Like a feather"]),
    Q("s20", "stress", "How easy is it to enjoy a quiet moment right now?", ["Very hard", "Hard", "Okay", "Easy", "Very easy"]),
    Q("s21", "stress", "How fast are your thoughts moving right now?", ["Racing", "Fast", "Normal", "Steady", "Slow and easy"]),
    Q("s22", "stress", "How often have you replayed a conversation in your head today?", ["Never", "Once", "A few times", "Often", "Over and over"], true),
    Q("s23", "stress", "How smooth has the last hour felt?", ["Very bumpy", "Bumpy", "Mixed", "Smooth", "Very smooth"]),
    Q("s24", "stress", "How fidgety are your hands and feet right now?", ["Very still", "Still", "A little", "Fidgety", "Can't stop"], true),
    Q("f1", "fatigue", "How heavy did the first hour of today feel?", ["Like lead", "Heavy", "Normal", "Light", "Easy"]),
    Q("f2", "fatigue", "How does a long walk sound right now?", ["Easy", "Fine", "Okay", "Tiring", "Out of the question"], true),
    Q("f3", "fatigue", "How much fuel is left in your tank right now?", ["Empty", "Low", "Half", "Most of it", "Full"]),
    Q("f4", "fatigue", "How often have you wanted to sit down today?", ["Hardly ever", "Now and then", "Sometimes", "Often", "All the time"], true),
    Q("f5", "fatigue", "How quick do your arms and legs feel right now?", ["Sluggish", "Slow", "Normal", "Quick", "Springy"]),
    Q("f6", "fatigue", "If you had to carry a heavy box now, how would it feel?", ["Too much", "Hard", "Okay", "Fine", "Easy"]),
    Q("f7", "fatigue", "How easily could you stand up right now?", ["Very easily", "Easily", "Okay", "With effort", "Big effort"], true),
    Q("f8", "fatigue", "How light are your footsteps today?", ["Stomping", "Heavy", "Normal", "Light", "Bouncy"]),
    Q("f9", "fatigue", "How much would you like a nap right now?", ["Not at all", "A little", "Somewhat", "Quite a bit", "Badly"], true),
    Q("f10", "fatigue", "How long could you keep up a brisk pace now?", ["Barely a minute", "A few minutes", "A while", "A long time", "Ages"]),
    Q("f11", "fatigue", "How much effort did getting dressed take today?", ["None", "Little", "Some", "A lot", "Huge"], true),
    Q("f12", "fatigue", "How much spark do you have for a game right now?", ["None", "A little", "Some", "Plenty", "Loads"]),
    Q("f13", "fatigue", "How lively does your voice sound to you today?", ["Flat", "Low", "Normal", "Lively", "Bright"]),
    Q("f14", "fatigue", "How heavy does your head feel on your shoulders?", ["Feather light", "Light", "Normal", "Heavy", "Like a boulder"], true),
    Q("f15", "fatigue", "How quickly is your battery draining today?", ["Very fast", "Fast", "Normal", "Slowly", "Barely"]),
    Q("f16", "fatigue", "How much do you feel like moving around right now?", ["Not at all", "A little", "Somewhat", "Quite a bit", "A lot"]),
    Q("f17", "fatigue", "How much do your muscles ache right now?", ["Not at all", "A little", "Some", "Quite a bit", "A lot"], true),
    Q("f18", "fatigue", "How many tasks could you do before needing a break?", ["None", "One", "A couple", "Several", "Lots"]),
    Q("f19", "fatigue", "How much of a push did this morning need?", ["A huge push", "A big push", "Some push", "A nudge", "No push"]),
    Q("f20", "fatigue", "How lively do you feel compared with a good day?", ["Far less", "Less", "About the same", "A bit more", "Much more"]),
    Q("f21", "fatigue", "How easy would it be to dance to a song right now?", ["Very easy", "Easy", "Maybe", "Hard", "No way"], true),
    Q("f22", "fatigue", "How much did your body want to keep going this morning?", ["Not at all", "A little", "Somewhat", "Quite a bit", "A lot"]),
    Q("f23", "fatigue", "How much get-up-and-go do you have right now?", ["None", "Little", "Some", "Plenty", "Loads"]),
    Q("f24", "fatigue", "How soon would you like the day to wind down?", ["Right now", "Soon", "Later", "Much later", "Not for ages"]),
    Q("l1", "sleep", "How ready was your body to get up when the alarm went?", ["Not at all", "Barely", "Sort of", "Mostly", "Fully"]),
    Q("l2", "sleep", "How many times do you remember waking in the night?", ["None", "Once", "A few", "Many", "Lost count"], true),
    Q("l3", "sleep", "How long did it take you to drift off last night?", ["Ages", "A long time", "A while", "Quickly", "Straight away"]),
    Q("l4", "sleep", "How did your eyes feel when you first opened them?", ["Bright", "Clear", "Okay", "Heavy", "Glued shut"], true),
    Q("l5", "sleep", "How deep did last night feel?", ["Very light", "Light", "Average", "Deep", "Very deep"]),
    Q("l6", "sleep", "How much did you want to stay in bed this morning?", ["Not at all", "A little", "Some", "A lot", "Very much"], true),
    Q("l7", "sleep", "How comfortable did your bed feel last night?", ["Awful", "Uncomfortable", "Okay", "Comfy", "Cosy"]),
    Q("l8", "sleep", "How calm was the night for you?", ["Very rough", "Rough", "Mixed", "Calm", "Very calm"]),
    Q("l9", "sleep", "How much did you toss and turn last night?", ["Not at all", "A little", "Some", "A lot", "All night"], true),
    Q("l10", "sleep", "How groggy were you in the first ten minutes awake?", ["Not at all", "A little", "Somewhat", "Very", "Like a zombie"], true),
    Q("l11", "sleep", "How did the night feel, start to finish?", ["Endless", "Long", "Okay", "Short and sweet", "Gone in a blink"]),
    Q("l12", "sleep", "How easy was it to switch your mind off last night?", ["Very hard", "Hard", "Okay", "Easy", "Very easy"]),
    Q("l13", "sleep", "How much earlier than planned did you wake today?", ["Hours early", "An hour early", "A bit early", "Barely", "Not at all"]),
    Q("l14", "sleep", "How quiet did your night feel?", ["Very noisy", "Noisy", "Mixed", "Quiet", "Silent"]),
    Q("l15", "sleep", "How much would you like to redo last night?", ["Not at all", "A little", "Somewhat", "Quite a bit", "Very much"], true),
    Q("l16", "sleep", "How long did you lie awake in the middle of the night?", ["Not at all", "A few minutes", "A while", "Ages", "Most of it"], true),
    Q("l17", "sleep", "How well did your body switch off after lights out?", ["Not at all", "Barely", "Partly", "Well", "Completely"]),
    Q("l18", "sleep", "How smooth was getting out of bed today?", ["Very rough", "Rough", "Okay", "Smooth", "Very smooth"]),
    Q("l19", "sleep", "How snug did your bunk feel last night?", ["Not at all", "A little", "Somewhat", "Snug", "Very snug"]),
    Q("l20", "sleep", "How long did it take to feel like yourself this morning?", ["Hours", "Over an hour", "A while", "A few minutes", "Right away"]),
    Q("l21", "sleep", "How fresh did your face look in the mirror today?", ["Very fresh", "Fresh", "Okay", "Worn", "Very worn"], true),
    Q("l22", "sleep", "How peaceful were your dreams, if you had any?", ["Very troubled", "Troubled", "Mixed", "Peaceful", "Very peaceful"]),
    Q("l23", "sleep", "How did your back feel when you got up?", ["Very stiff", "Stiff", "Okay", "Loose", "Very loose"]),
    Q("l24", "sleep", "How much did the night recharge you?", ["Not at all", "A little", "Somewhat", "Mostly", "Fully"]),
    Q("r1", "readiness", "If a tricky task landed on you now, how would it go?", ["Badly", "Roughly", "Okay", "Well", "Very well"]),
    Q("r2", "readiness", "How sharp does your focus feel right now?", ["Foggy", "Blurry", "Okay", "Sharp", "Crystal clear"]),
    Q("r3", "readiness", "How keen are you to start your next task?", ["Not keen", "A bit reluctant", "Neutral", "Keen", "Very keen"]),
    Q("r4", "readiness", "How sure are you that you could learn something new today?", ["Very sure", "Sure", "Not sure", "Doubtful", "Not at all"], true),
    Q("r5", "readiness", "How quickly could you jump in if a crewmate needed a hand?", ["Not really", "Slowly", "Okay", "Quickly", "Right away"]),
    Q("r6", "readiness", "How on top of today's plan do you feel?", ["Not at all", "A little", "Partly", "Mostly", "Fully"]),
    Q("r7", "readiness", "How easily could you follow a long set of steps now?", ["Very hard", "Hard", "Okay", "Easily", "Very easily"]),
    Q("r8", "readiness", "How would you feel giving a short briefing right now?", ["Very confident", "Confident", "Unsure", "Nervous", "Not up to it"], true),
    Q("r9", "readiness", "How quickly do new details stick right now?", ["They slide off", "Slowly", "Okay", "Quickly", "Instantly"]),
    Q("r10", "readiness", "How likely are you to miss a small detail today?", ["Very unlikely", "Unlikely", "Maybe", "Likely", "Very likely"], true),
    Q("r11", "readiness", "How well could you juggle two jobs at once right now?", ["Not at all", "Poorly", "Okay", "Well", "Very well"]),
    Q("r12", "readiness", "How steady would your hands be on a delicate job?", ["Very steady", "Steady", "Okay", "Shaky", "Very shaky"], true),
    Q("r13", "readiness", "How sure are you of what you need to do today?", ["Very sure", "Sure", "Somewhat", "Unsure", "Lost"], true),
    Q("r14", "readiness", "How quickly could you spot a mistake in a checklist now?", ["Not at all", "Slowly", "Okay", "Quickly", "Instantly"]),
    Q("r15", "readiness", "How easy would it be to read a long page right now?", ["Very hard", "Hard", "Okay", "Easy", "Very easy"]),
    Q("r16", "readiness", "How quickly could you solve a simple puzzle right now?", ["Not at all", "Slowly", "Okay", "Quickly", "In a flash"]),
    Q("r17", "readiness", "How much do you trust your judgement today?", ["Completely", "Mostly", "Somewhat", "A little", "Not at all"], true),
    Q("r18", "readiness", "How prepared would you feel for a drill right now?", ["Not at all", "A little", "Somewhat", "Mostly", "Fully"]),
    Q("r19", "readiness", "How well would you remember a number you just heard?", ["Not at all", "Poorly", "Okay", "Well", "Perfectly"]),
    Q("r20", "readiness", "How likely are you to need things repeated today?", ["Very unlikely", "Unlikely", "Maybe", "Likely", "Very likely"], true),
    Q("r21", "readiness", "How much are you up for a challenge today?", ["Not at all", "A little", "Somewhat", "Quite a bit", "Bring it on"]),
    Q("r22", "readiness", "How crisp do your decisions feel today?", ["Very muddled", "Muddled", "Okay", "Crisp", "Very crisp"]),
    Q("r23", "readiness", "How long could you concentrate without a break now?", ["A minute", "A few minutes", "Half an hour", "An hour", "Hours"]),
    Q("r24", "readiness", "How useful could you be to the team right now?", ["Not at all", "A little", "Somewhat", "Very", "Extremely"])
  ];
  var QBY = {}; BANK.forEach(function (q) { QBY[q.id] = q; });
  function scoreOf(q, idx) { var i = Math.round(Number(idx)); if (!q || !isFinite(i) || i < 0 || i > 4) return null; return q.rev ? 5 - i : i + 1; }
  function rnd(a, rand) { return a[Math.floor((rand || Math.random)() * a.length) % a.length]; }
  function shuffle(a, rand) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor((rand || Math.random)() * (i + 1)) % (i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var HISTORY = 3, MIN_FINISH = 10, MAX_QUESTIONS = 60, SAVE_STEP = DIMS.length, DURATION_MS = 5 * 60 * 1000;
  function usedIds(recent) {
    var used = {}; (recent || []).slice(0, HISTORY).forEach(function (ids) { (ids || []).forEach(function (id) { used[id] = true; }); });
    return used;
  }
  function pickRound(recent, asked, rand) {
    var used = usedIds(recent), seen = {};
    (asked || []).forEach(function (q) { if (q) seen[q.id] = true; });
    return shuffle(DIMS, rand).map(function (k) {
      var all = BANK.filter(function (q) { return q.k === k && !seen[q.id]; });
      var fresh = all.filter(function (q) { return !used[q.id]; });
      return all.length ? rnd(fresh.length ? fresh : all, rand) : null;
    }).filter(Boolean);
  }
  function makeClock(dur, now) {
    now = now || function () { return Date.now(); };
    var c = {dur: dur, acc: 0, since: null};
    return {
      start: function () { if (c.since === null) c.since = now(); },
      pause: function () { if (c.since !== null) { c.acc += now() - c.since; c.since = null; } },
      running: function () { return c.since !== null; },
      elapsed: function () { return c.acc + (c.since === null ? 0 : now() - c.since); },
      left: function () { return Math.max(0, c.dur - this.elapsed()); },
      dur: function () { return c.dur; },
      setDur: function (d) { c.dur = d; }
    };
  }
  function afterAnswer(answered, elapsed, dur) {
    if (answered >= MAX_QUESTIONS) return "end";
    if (answered >= MIN_FINISH && elapsed >= dur) return "end";
    return "next";
  }
  function timeLeftText(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ":" + (s % 60 < 10 ? "0" : "") + (s % 60) + " left";
  }
  function supportUnlocked(d, shortSleep) {
    var ck = d && d.checkin;
    if (ck && ((d.mood != null && d.mood <= 2) || (ck.stress != null && ck.stress <= 2) || (ck.fatigue != null && ck.fatigue <= 2))) return true;
    return !!shortSleep;
  }
  function meanScores(got) {
    var sum = {}, n = {}, out = {};
    (got || []).forEach(function (a) { if (!a || !BY[a.k] || !(a.v >= 1 && a.v <= 5)) return; sum[a.k] = (sum[a.k] || 0) + a.v; n[a.k] = (n[a.k] || 0) + 1; });
    DIMS.forEach(function (k) { if (n[k]) out[k] = clampScore(sum[k] / n[k]); });
    return out;
  }
  var OPEN = ["Good {tod}{n}. A few quick questions, just pick what fits.", "Good {tod}{n}. Tap whatever fits best, there are no right answers.", "Hi{n}, good {tod}. Let's do a quick check-in.", "Good {tod}{n}. Just tap the answer that fits you right now."];
  var CLOSE = ["Thanks for checking in{n}.", "That's all for today{n}. Thank you.", "All done{n}. Thanks for taking a moment.", "Thank you{n}. I appreciate you taking the time."];
  var RETRY = "Thanks. Please pick one of the options for this one.";
  var REPLIES = {
    mood: {
      low: ["Thanks for being straight with me about today.", "Some days are grey. I'm glad you said so.", "That sounds like a heavy day. Thank you for sharing it.", "Noted, and thank you for being honest.", "Fair enough. Not every day has much shine in it.", "Thanks. I hear you, that one sounds hard.", "Okay. I appreciate you telling me how it really is.", "Understood. Thanks for letting me see the real picture."],
      mid: ["Okay, somewhere in the middle. Noted.", "Got it, a fairly ordinary day then.", "Thanks. Middle of the road, noted.", "Okay. Not up, not down. Thanks.", "Understood, a so-so kind of day.", "Noted. Thanks for answering that one.", "Fair enough, an in-between day.", "Alright, thanks. Steady as it goes."],
      high: ["Nice to hear. Good moments count up here.", "Glad there's some brightness in today.", "That's good to hear.", "Good. A bit of brightness goes a long way.", "Nice. I'm glad today has some light in it.", "Good to know. Thanks for sharing that.", "That's nice. Small good things matter.", "Glad there's some warmth in your day."]
    },
    stress: {
      low: ["That sounds like a lot to carry. Thanks for telling me.", "Busy and tense, got it. Thank you for saying so.", "Understood. Some days press harder than others.", "Thanks for being honest. That sounds like a full load.", "Noted. A tight day, I hear you.", "Okay. Thanks for letting me know it's been intense.", "I hear you. Pressure like that is real.", "Thanks. That sounds like a demanding stretch."],
      mid: ["Okay, some pressure but manageable. Noted.", "Got it, a fairly normal load.", "Understood. A bit of tension, nothing unusual.", "Thanks. Somewhere in between, noted.", "Okay, a regular kind of busy.", "Noted. Not calm, not tense.", "Alright, a middling day on that front.", "Thanks, that helps me get the picture."],
      high: ["Good to hear things feel settled.", "Nice. A calm day is worth a lot up here.", "Glad it feels manageable today.", "That's good. Steady is good.", "Good to hear. Thanks.", "Nice, sounds like things are under control.", "Glad to hear it feels easy going.", "Good. A quieter head helps everything else."]
    },
    fatigue: {
      low: ["Sounds like a tiring day. Thanks for telling me.", "Running low, got it. Thank you.", "Understood. Long days catch up with everyone up here.", "Thanks. Tired days happen, I've noted it.", "Okay, not much left in the tank. Noted.", "I hear you. That sounds draining.", "Thanks for being honest about how worn out you feel.", "Noted. Long days take their toll."],
      mid: ["Okay, about average. Noted.", "Got it, getting by.", "Thanks. A normal kind of day for your body.", "Understood, somewhere in the middle.", "Okay. Not fresh, not drained.", "Noted, thanks.", "Alright, a fair amount left. Got it.", "Thanks, that's useful to know."],
      high: ["Good to hear you're feeling fresh.", "Nice, plenty in the tank then.", "Glad you've got some spring in your step.", "Good. That helps with everything else.", "Great to hear. Thanks.", "Nice. A lighter body makes a lighter day.", "Good to know you're feeling strong.", "Glad to hear it. Noted."]
    },
    sleep: {
      low: ["Short nights add up. Thanks for telling me.", "Rough night, got it. Thank you.", "Understood. Sleep up here isn't always easy.", "Thanks. A restless night, noted.", "Okay. Not much rest last night, noted.", "I hear you. Broken sleep is hard going.", "Thanks for being honest about the night.", "Noted. Some nights just don't cooperate."],
      mid: ["Okay, an average night. Noted.", "Got it, a so-so night.", "Thanks. Not great, not bad.", "Understood, a fairly ordinary night.", "Okay, some rest. Noted.", "Alright, middling sleep. Thanks.", "Noted. An in-between night.", "Thanks, that gives me the picture."],
      high: ["Good. That helps everything else.", "Nice, a good night makes a difference.", "Glad you got some proper rest.", "Good to hear the night was kind to you.", "Nice. Rest like that is worth a lot.", "Glad to hear you slept well.", "Good, a solid night then.", "That's good to hear about the night."]
    },
    readiness: {
      low: ["Understood. Not every day starts ready.", "Thanks for being honest about that.", "Got it. Some days take longer to get going.", "Noted. It's fine to say so.", "Okay. Thanks for telling me where you are.", "I hear you. That's a fair answer.", "Thanks. Not quite there today, noted.", "Understood. Thanks for letting me know."],
      mid: ["Okay, partly there. Noted.", "Got it, getting there.", "Thanks. Somewhere in between on that one.", "Understood, mostly set.", "Okay, a fair start then.", "Noted. Thanks for that.", "Alright, halfway there. Got it.", "Thanks, that's clear."],
      high: ["Good to hear you're set for the day.", "Nice. Sounds like you're ready to go.", "Glad you feel on top of things.", "Good. Thanks.", "Great, sounds like a good start.", "Nice, feeling prepared helps.", "Glad to hear that. Noted.", "Good to know you're good to go."]
    }
  };
  var GENERIC = {
    low: ["Thanks for telling me.", "Understood. Thank you for being honest.", "I hear you. Thanks.", "Noted, thank you.", "Thank you for saying so.", "Okay. I appreciate the honest answer.", "Got it. Thanks for sharing.", "Thanks, I've noted that."],
    mid: ["Okay, noted.", "Got it, thanks.", "Thanks.", "Alright.", "Okay, thank you.", "Noted.", "Understood, thanks.", "Fair enough."],
    high: ["Good to hear.", "Nice, thanks.", "Glad to hear it.", "Good.", "That's nice.", "Good, thanks.", "Nice to know.", "Glad of that."]
  };
  function bandOf(v) { return v == null ? null : v <= 2 ? "low" : v === 3 ? "mid" : "high"; }
  function pickReply(k, band, used, rand) {
    used = used || {};
    var pools = [REPLIES[k] && REPLIES[k][band] || [], GENERIC[band] || []];
    for (var i = 0; i < pools.length; i++) {
      var free = pools[i].filter(function (r) { return !used[r]; });
      if (free.length) { var r = rnd(free, rand); used[r] = true; return r; }
    }
    return "";
  }
  function timeOfDay(h) { return h < 12 ? "morning" : h < 18 ? "afternoon" : "evening"; }
  function withName(s, name) { return s.replace("{n}", name ? ", " + name : ""); }
  function openLine(name, hour, rand) { return withName(rnd(OPEN, rand), name).replace("{tod}", timeOfDay(hour)); }
  function closeLine(name, rand) { return withName(rnd(CLOSE, rand), name); }

  var SAFE_TEXT = "Thank you for telling me. This is more than a check-in should carry, and you should not carry it alone. Please talk to your flight surgeon or your crew medical officer now. I can send them a message for you.";
  var CRISIS = [
    /\b(kill|hurt|harm|cut|injure|punish)\s+(myself|me)\b/,
    /\bend(ing)?\s+(my|it)\s+(own\s+)?(life|all)\b/,
    /\bend\s+it\s+all\b/,
    /\btake\s+my\s+(own\s+)?life\b/,
    /\bsuicid/,
    /\bself[\s-]*harm/,
    /\b(don'?t|do\s+not|dont)\s+want\s+to\s+(be\s+here|be\s+alive|live|exist|wake\s+up)\b/,
    /\bwant\s+to\s+(die|disappear\s+forever)\b/,
    /\bwish\s+i\s+(was|were)\s+dead\b/,
    /\bbetter\s+off\s+(dead|without\s+me)\b/,
    /\bno\s+(reason|point)\s+(to|in)\s+(live|living|go\s+on|going\s+on)\b/,
    /\b(kill|hurt|harm|attack|stab|strangle)\s+(someone|somebody|him|her|them|people|everyone|the\s+crew|my\s+crew\w*|a\s+crew\w*|the\s+commander)\b/
  ];

  function norm(t) { return String(t == null ? "" : t).toLowerCase().replace(/[‘’ʼ`]/g, "'").replace(/\s+/g, " "); }
  function isCrisis(t) { var s = norm(t); return CRISIS.some(function (r) { return r.test(s); }); }
  function clampScore(v) { if (v === null || v === undefined || v === "") return null; var n = Math.round(Number(v)); if (!isFinite(n)) return null; return Math.max(1, Math.min(5, n)); }
  function firstName(n) { return String(n || "").split(" ")[0].replace(/[^A-Za-zÀ-ɏ'-]/g, "").slice(0, 30); }
  function short(t, n) { t = String(t || ""); return t.length > n ? t.slice(0, n) : t; }

  var TEST = {ITEMS: ITEMS, BANK: BANK, DIMS: DIMS, HISTORY: HISTORY, MIN_FINISH: MIN_FINISH, MAX_QUESTIONS: MAX_QUESTIONS, DURATION_MS: DURATION_MS, OPEN: OPEN, CLOSE: CLOSE, RETRY: RETRY, REPLIES: REPLIES, GENERIC: GENERIC, bandOf: bandOf, pickReply: pickReply, openLine: openLine, closeLine: closeLine, timeOfDay: timeOfDay, scoreOf: scoreOf, pickRound: pickRound, makeClock: makeClock, afterAnswer: afterAnswer, timeLeftText: timeLeftText, supportUnlocked: supportUnlocked, meanScores: meanScores, SAFE_TEXT: SAFE_TEXT, isCrisis: isCrisis, clampScore: clampScore};
  window.ASTRA_CHECKIN_TEST = TEST;

  var A = window.ASTRA_API;
  if (!A || typeof document === "undefined") return;
  function $(s) { return document.querySelector(s); }
  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) { return {"&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"}[c]; }); }
  function getPref(k, def) { try { var v = localStorage.getItem(k); return v === null ? def : v === "on"; } catch (e) { return def; } }
  function setPref(k, on) { try { localStorage.setItem(k, on ? "on" : "off"); } catch (e) {} }

  var speakOn = getPref(PREF_SPEAK, false);
  var hasSpeech = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
  var st = null, runId = 0, durMs = DURATION_MS;
  var REPLY_URL = "/api/reply", REPLY_WAIT_MS = 4500, served = false, misses = 2;

  function todayLog() { return A.L(); }
  function name() { return firstName(A.S && A.S.name); }

  window.renderMind = function () {
    var btn = $("#mhBtn"); if (!btn) return;
    var d = todayLog().daily, done = d && d.checkin && clampScore(d.mood);
    btn.textContent = done ? "Check in again" : "Check in";
  };

  function paint() {
    var note = $("#mhNote"), sp = $("#mhSpeak");
    if (note) note.innerHTML = served ? "Private to you. Replies are written by a small open-source model on ASTRA's server from the question and the option you tapped; nothing is stored." : "Private to you. Your answers stay on this device. <span class=\"simtag\">Demo</span>";
    if (sp) { sp.hidden = !hasSpeech; sp.setAttribute("aria-pressed", speakOn ? "true" : "false"); }
  }

  function stopSpeech() { if (hasSpeech) { try { window.speechSynthesis.cancel(); } catch (e) {} } }
  function voice() {
    try { var vs = window.speechSynthesis.getVoices() || []; return vs.find(function (v) { return /^en(-|_|$)/i.test(v.lang) && v.localService; }) || vs.find(function (v) { return /^en/i.test(v.lang); }) || null; } catch (e) { return null; }
  }
  function readAloud(text) {
    if (!hasSpeech || !speakOn || !text) return;
    stopSpeech();
    try { var u = new SpeechSynthesisUtterance(text), v = voice(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-US"; u.rate = 0.95; window.speechSynthesis.speak(u); } catch (e) {}
  }

  function log() { return $("#mhLog"); }
  function pin() { var l = log(); if (l) l.scrollTop = l.scrollHeight; }
  function add(cls, text) { var l = log(); if (!l) return null; var d = document.createElement("div"); d.className = "mh-msg " + cls; d.textContent = text; l.appendChild(d); l.scrollTop = l.scrollHeight; return d; }
  function say() { var parts = Array.prototype.filter.call(arguments, Boolean); parts.forEach(function (p) { add("ai", p); }); readAloud(parts.join(" ")); }
  function chips(q) {
    var c = $("#mhChips"); if (!c) return;
    c.innerHTML = !q ? "" : q.o.map(function (w, i) { return "<button class=\"mh-chip\" data-v=\"" + i + "\" type=\"button\">" + esc(w) + "</button>"; }).join("");
    pin();
  }
  function cur() { return st.qs[st.i] || null; }
  function recentIds() { var r = A.S && A.S.mhRecent; return Array.isArray(r) ? r.filter(Array.isArray) : []; }
  function remember() { if (!A.S || !st) return; A.S.mhRecent = [st.qs.map(function (q) { return q.id; })].concat(st.recent).slice(0, HISTORY); A.save(); }
  function addRound() { st.qs = st.qs.concat(pickRound(st.recent, st.qs).slice(0, MAX_QUESTIONS - st.qs.length)); remember(); }
  function nextQ() { if (st.i + 1 >= st.qs.length && st.qs.length < MAX_QUESTIONS) addRound(); return st.qs[st.i + 1] || null; }
  function prog() {
    if (!st) return;
    var bar = $("#mhProg i"), cnt = $("#mhCount"), fin = $("#mhFinish"), dur = st.clock.dur() || 1;
    if (bar) bar.style.width = (st.done ? 100 : Math.min(100, Math.round(st.clock.elapsed() / dur * 100))) + "%";
    if (cnt) cnt.textContent = !st.done && st.clock.left() <= 0 && st.got.length < MIN_FINISH ? "Almost done" : timeLeftText(st.clock.left());
    if (fin) fin.hidden = st.done || st.got.length < MIN_FINISH;
  }
  function sheetOpen() { var s = $("#sheet"); return !s || s.classList.contains("on"); }
  function startTick() {
    var my = runId, me = st;
    me.tick = setInterval(function () { if (my !== runId || me.done || !sheetOpen()) { clearInterval(me.tick); return; } prog(); if (!me.done && me.clock.left() <= 0 && me.got.length >= MIN_FINISH) { clearInterval(me.tick); finish(); } }, 1000);
  }

  function begin() {
    if (st && st.tick) clearInterval(st.tick);
    st = {i: 0, got: [], done: false, qs: [], recent: recentIds(), used: {}, clock: makeClock(durMs)};
    runId++;
    stopSpeech();
    addRound();
    say(openLine(name(), new Date().getHours()), cur().q);
    chips(cur());
    st.clock.start(); startTick(); prog();
  }
  function modelReply(q, label, band, done) {
    if (misses >= 2 || typeof fetch !== "function") return done(null);
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null, over = false;
    var timer = setTimeout(function () { if (over) return; over = true; if (ctrl) ctrl.abort(); miss(); done(null); }, REPLY_WAIT_MS);
    function miss() { misses++; }
    function end(text) { if (over) return; over = true; clearTimeout(timer); if (text) { misses = 0; if (!served) { served = true; paint(); } } else miss(); done(text); }
    var day = null; try { day = Math.round(Number(A.day())); } catch (e) {}
    var body = {name: name(), question: short(q.q, 140), answer: short(label, 40), band: band, partOfDay: timeOfDay(new Date().getHours()), missionDay: isFinite(day) ? day : null};
    try {
      fetch(REPLY_URL, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(body), cache: "no-store", credentials: "same-origin", signal: ctrl ? ctrl.signal : undefined})
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { end(j && typeof j.say === "string" && j.say.trim() ? short(j.say.trim(), 110) : null); }, function () { end(null); });
    } catch (e) { end(null); }
  }
  function onChip(idx) {
    if (!st || st.done || st.busy) return;
    var q = cur(), v = scoreOf(q, idx); if (!q || !v) return;
    add("me", q.o[idx]);
    st.got.push({k: q.k, v: v});
    var band = bandOf(v), reply = pickReply(q.k, band, st.used);
    var ending = afterAnswer(st.got.length, st.clock.elapsed(), st.clock.dur()) === "end";
    var nq = ending ? null : nextQ();
    function go(text) {
      var r = text || reply;
      if (!nq) return finish(r);
      st.i++;
      say(r, nq.q);
      chips(nq); prog();
    }
    if (misses >= 2) return go(null);
    var my = runId, me = st, w = add("ai wait", "…");
    st.busy = true; chips(null);
    modelReply(q, q.o[idx], band, function (text) {
      if (w && w.parentNode) w.parentNode.removeChild(w);
      if (my !== runId || st !== me) return;
      me.busy = false;
      if (me.done) return;
      go(text);
    });
  }
  function crisis() {
    st.done = true; runId++; st.clock.pause(); chips(null); prog(); stopSpeech();
    var f = $("#mhForm"); if (f) f.hidden = true;
    ["#mhProg", "#mhCount"].forEach(function (s) { var e = $(s); if (e) { e.hidden = true; e.style.display = "none"; } });
    var box = add("safe", SAFE_TEXT); if (!box) return;
    readAloud(SAFE_TEXT);
    var b = document.createElement("button"); b.className = "btn sm"; b.type = "button"; b.textContent = "Message my flight surgeon"; b.style.marginTop = "10px"; b.style.display = "block";
    b.onclick = sendSurgeon; box.appendChild(b); pin();
  }
  function msgSurgeon(text, reply) {
    var S = A.S, now = Date.now(), lag = A.nearDoctors() ? 1000 : A.delayMs();
    S.msgs.push({me: true, mission: S.mission, at: now + lag, text: text});
    if (reply) S.msgs.push({me: false, mission: S.mission, at: now + 2 * lag + 2000, text: reply});
    A.save();
  }
  function sendSurgeon() {
    msgSurgeon("I'd like to talk with you privately today. Please reach out when you can.", "Thank you for reaching out. We're here and will call you at the next opportunity. Please stay with a crewmate until we talk.");
    A.closeFlow();
    if (window.ASTRA_CALL) window.ASTRA_CALL.start("Flight surgeon · started automatically");
  }
  function onText(e) {
    e.preventDefault();
    if (!st || st.done) return;
    var inp = $("#mhInput"), text = short((inp && inp.value || "").trim(), 300); if (!text) return;
    inp.value = "";
    add("me", text);
    if (isCrisis(text)) return crisis();
    if (st.busy) return;
    say(RETRY);
    chips(cur());
  }
  function finish(reply) {
    if (!st || st.done) return;
    st.done = true; st.clock.pause(); chips(null); prog();
    var f = $("#mhForm"); if (f) Array.prototype.forEach.call(f.elements, function (x) { x.disabled = true; });
    saveScores(st.got);
    say(typeof reply === "string" ? reply : "", closeLine(name()));
    showNext();
  }
  function shortSleepNow() { try { return (A.statuses ? A.statuses() : []).some(function (x) { return /slept a lot less/.test(x.what); }); } catch (e) { return false; } }
  function supportNow() { try { A.realFill(); } catch (e) {} return supportUnlocked(A.L().daily, shortSleepNow()); }
  function nextHTML(on) {
    return "<div class=\"mh-next\" id=\"mhNext\"><b class=\"mh-next-h\">Saved. Only you see this.</b><div class=\"mh-steps\">" +
      "<div class=\"mh-step\"><span class=\"mh-step-n\">1</span><div><b>Your Mind card is updated</b><span>Today's check-in is on your screen only.</span></div></div>" +
      "<div class=\"mh-step" + (on ? " on" : "") + "\"><span class=\"mh-step-n\">2</span><div><b>Support options</b><span>" + (on ? "Available today: delay a task or hand one over." : "Not needed today.") + "</span></div>" + (on ? "<button class=\"btn sm\" type=\"button\" data-next=\"support\">Open Today</button>" : "") + "</div>" +
      "<div class=\"mh-step\"><span class=\"mh-step-n\">3</span><div><b>Talk to your flight surgeon</b><span>Private medical conference, or a message now.</span></div><button class=\"hbtn\" type=\"button\" data-next=\"surgeon\">Message</button></div>" +
      "<div class=\"mh-step\"><span class=\"mh-step-n\">4</span><div><b>Next check-in</b><span>Tomorrow.</span></div></div>" +
      "</div><button class=\"btn\" type=\"button\" data-next=\"done\">Done</button></div>";
  }
  function showNext() {
    ["#mhChips", "#mhForm", "#mhFinish", "#mhProg", "#mhCount"].forEach(function (s) { var el = $(s); if (el) el.hidden = true; });
    var go = $("#goBtn"); if (go) go.hidden = true;
    var l = log(); if (!l) return;
    var old = $("#mhNext"); if (old) old.parentNode.removeChild(old);
    l.insertAdjacentHTML("afterend", nextHTML(supportNow()));
    var box = $("#mhNext"); if (box) box.onclick = onNext;
    pin();
  }
  function onNext(e) {
    var b = e.target.closest("[data-next]"); if (!b) return;
    var what = b.getAttribute("data-next");
    if (what === "surgeon") msgSurgeon("I'd like to talk at the next conference.");
    A.closeFlow();
    if (what === "support") setTimeout(function () { var tc = $("#todayCard"); if (tc && tc.scrollIntoView) tc.scrollIntoView({block: "start"}); }, 300);
  }
  function saveScores(got) {
    var d = A.realFill() || A.ensureDaily(), s = meanScores(got);
    d.mood = s.mood;
    d.checkin = {stress: s.stress, fatigue: s.fatigue, sleep: s.sleep, readiness: s.readiness, at: Date.now()};
    A.bump(); A.save(); A.render();
    if (window.renderToday) window.renderToday();
  }

  A.STEP.mind = function () {
    return {title: "ASTRA check-in", go: "Done",
      html: "<div class=\"mh\"><div class=\"mh-prog\" id=\"mhProg\"><i></i></div><span class=\"mh-count\" id=\"mhCount\"></span><div class=\"mh-log\" id=\"mhLog\"></div><div class=\"mh-chips\" id=\"mhChips\"></div><form class=\"mh-form\" id=\"mhForm\"><input id=\"mhInput\" maxlength=\"300\" placeholder=\"Or say it in your own words\" autocomplete=\"off\"><button class=\"btn sm\" type=\"submit\">Send</button></form>" +
        "<button class=\"hbtn\" id=\"mhFinish\" type=\"button\" hidden>Finish now</button>" +
        "<div class=\"mh-ai\"><button class=\"hbtn\" id=\"mhSpeak\" type=\"button\" aria-pressed=\"false\">Read aloud</button></div>" +
        "<div class=\"mh-note\" id=\"mhNote\"></div></div>",
      init: function () {
        var go = $("#goBtn"); if (go) go.hidden = true;
        $("#mhForm").onsubmit = onText;
        $("#mhFinish").onclick = function () { if (st && !st.done && st.got.length >= MIN_FINISH) finish(); };
        $("#mhChips").onclick = function (e) { var b = e.target.closest(".mh-chip"); if (b) onChip(+b.dataset.v); };
        $("#mhSpeak").onclick = function () { speakOn = !speakOn; setPref(PREF_SPEAK, speakOn); if (!speakOn) stopSpeech(); paint(); };
        paint();
        begin();
      }};
  };

  var sheet = $("#sheet");
  if (sheet && typeof MutationObserver !== "undefined") new MutationObserver(function () { if (!sheet.classList.contains("on")) { stopSpeech(); runId++; if (st && st.tick) clearInterval(st.tick); if (st && !st.done && st.got.length >= SAVE_STEP) { st.done = true; saveScores(st.got.slice(0, st.got.length - st.got.length % SAVE_STEP)); } } }).observe(sheet, {attributes: true, attributeFilter: ["class"]});
  document.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("#mhBtn")) A.openFlow(["mind"]); });
  window.renderMind();
  window.ASTRA_CHECKIN = {setDuration: function (ms) { var n = Number(ms); if (!(n > 0)) return; durMs = n; if (st && st.clock) { st.clock.setDur(n); prog(); } }, state: function () { return st ? {answered: st.got.length, asked: st.qs.length, done: st.done, left: st.clock.left()} : null; }};
})();
