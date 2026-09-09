// No JSX here — teaching content is structured blocks the mission runner
// interprets. Block types in use: text, formula, compare.

export const preLevel = {
  id: "pre-level",
  day: 1,
  title: "Meet Your AI Co-Pilot",
  subtitle: "Four missions. No experience needed.",
  estMinutes: 20,
  xp: 50,
  badge: { slug: "ai-co-pilot", name: "AI Co-Pilot" },
  completionMessage: "You are ready to build something real.",

  missions: [
    {
      id: "meet-claude",
      title: "Meet Claude",
      xp: 10,
      teach: [
        {
          type: "text",
          text: "Claude is an AI you talk to in plain language. It can write, explain, plan, and build things with you. It is not a search engine and not a robot — closer to a very fast collaborator who has read a great deal and has no ego about being corrected.",
        },
      ],
      prompt: {
        template:
          "Hi Claude. I'm a {{program}} student at {{college}}. I'm just starting to learn how to use AI. In three short points, tell me what you could help me create.",
      },
      proof: {
        mode: "single",
        fields: [
          { key: "reply", label: "Paste what Claude replied.", minLength: 80 },
        ],
      },
    },

    {
      id: "talk-clearly",
      title: "Talk Clearly",
      xp: 10,
      teach: [
        {
          type: "formula",
          parts: ["WHAT I WANT", "WHO IT IS FOR", "HOW I WANT IT"],
        },
        {
          type: "compare",
          text: "The same request, phrased two ways, produces very different results — and the difference is entirely your doing, not Claude's.",
        },
      ],
      prompts: [
        { key: "A", template: "Write something about college life." },
        {
          key: "B",
          template:
            "Write a 100-word Instagram caption about first-year college life, for 18-year-old students in India, in a funny and relatable tone.",
        },
      ],
      proof: {
        mode: "compare",
        revealHeading: "You wrote both of these.",
        fields: [
          { key: "replyA", label: "Claude's reply to A", minLength: 40 },
          { key: "replyB", label: "Claude's reply to B", minLength: 40 },
        ],
      },
    },

    {
      id: "make-it-better",
      title: "Make It Better",
      xp: 15,
      teach: [
        {
          type: "formula",
          parts: ["ASK", "SEE", "IMPROVE", "REPEAT"],
        },
        {
          type: "text",
          text: "Nobody gets it right first time, and they are not supposed to. The skill is not writing one perfect instruction. It is looking at what came back and saying what to change.",
        },
      ],
      prompt: {
        template:
          "Make me a simple one-page website introducing myself. My name is {{full_name}}, I study {{program}} at {{college}}. Keep it to one page.",
      },
      improvementChips: [
        "Make it more colourful",
        "Make it more modern",
        "Make it more exciting",
        "Make it work well on a phone",
      ],
      proof: {
        mode: "compare",
        fields: [
          { key: "before", label: "What Claude made first", minLength: 60 },
          {
            key: "after",
            label: "What it looked like after your changes",
            minLength: 60,
          },
        ],
      },
    },

    {
      id: "your-first-creation",
      title: "Your First Creation",
      xp: 15,
      teach: [
        {
          type: "text",
          text: "No template this time. You decide what to make, and write the instruction yourself using the formula from Mission 2.",
        },
      ],
      starterChips: [
        "A poster for a college event",
        "A caption for a club's Instagram",
        "A study plan for exams",
        "A short bio for LinkedIn",
        "A quiz for friends",
      ],
      proof: {
        mode: "single-plus-note",
        fields: [
          { key: "creation", label: "Paste what Claude made.", minLength: 60 },
          { key: "note", label: "What did you make?", kind: "line", minLength: 1 },
        ],
      },
    },
  ],
};
