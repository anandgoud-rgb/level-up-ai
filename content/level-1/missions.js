// No JSX here, same as content/levels/00-pre-level.js. Prompt strings use
// {{challenge.x}} / {{student.x}} / {{build.x}} tokens resolved by lib/prompt.js.
//
// BUILD_CONSTRAINTS is appended once, to mission 02's prompt only — that's the
// message that starts the one continuing chat, and every prompt after it is a
// short addition to work Claude already has in context. Repeating the full
// constraint block in every later prompt would defeat the point of keeping
// those prompts to two lines.
export const BUILD_CONSTRAINTS =
  "Build this as one self-contained HTML file — CSS and JS inline, no build tools, no npm. It should work just by opening the file in a browser. Make it mobile-friendly. Use https://placehold.co for any placeholder images.";

export const missions = [
  {
    id: "choose-your-brand",
    title: "Choose your brand",
    xp: 15,
    estMinutes: 10,
    teach: [
      {
        type: "text",
        text: "Every build starts with a brand, not a line of code. Claude can suggest colours, type, and tone once you tell it what you're making and who it's for.",
      },
    ],
    inputs: [
      { key: "brand_name", label: "Brand name", kind: "line", minLength: 2 },
      { key: "tagline", label: "Tagline (one line)", kind: "line", minLength: 2 },
      { key: "audience", label: "Who is it for?", kind: "line", minLength: 2 },
      {
        key: "mood",
        label: "The feel you want",
        kind: "chips-single",
        options: [
          "Bold and loud",
          "Clean and minimal",
          "Warm and friendly",
          "Premium and dark",
          "Playful and colourful",
        ],
      },
    ],
    prompt: {
      template:
        "I'm building my own {{challenge.domain}} product called {{build.brand_name}}. Tagline: {{build.tagline}}. It's for {{build.audience}}. The feel I want is {{build.mood}}.\n\nGive me: three colour palettes as hex codes that match this feel, a font pairing for headings and body, and five words describing the tone of voice. Keep it short — I'm going to use this to build a website next.",
    },
    postInputs: [
      {
        key: "palette",
        label: "The palette you picked (hex codes)",
        kind: "line",
        minLength: 2,
      },
    ],
    proof: {
      mode: "single",
      fields: [{ key: "reply", label: "Paste what Claude replied.", minLength: 100 }],
    },
  },

  {
    id: "build-the-foundation",
    title: "Build the foundation",
    xp: 25,
    estMinutes: 20,
    teach: [
      {
        type: "callout",
        text: "Start a new Claude chat and keep it open for the whole day. This chat is your workspace — every mission from here adds to what you build right now. You won't paste code again; you'll just keep talking to the same conversation.",
      },
    ],
    prompt: {
      template:
        "Build me the homepage for {{build.brand_name}}, a {{challenge.domain}} website. Tagline: {{build.tagline}}.\n\nInclude a top navigation bar with the brand name, a hero section, a section previewing {{challenge.collectionPlural}}, and a footer.\n\nUse this colour palette: {{build.palette}}. The tone should be {{build.mood}}.",
      appendConstraints: true,
    },
    proof: {
      mode: "single",
      fields: [
        {
          key: "description",
          label: "Describe what you see, in your own words.",
          minLength: 60,
        },
      ],
    },
  },

  {
    id: "build-discovery",
    title: "Build {{challenge.discoveryName}}",
    xp: 25,
    estMinutes: 20,
    teach: [
      {
        type: "text",
        text: "This is the same chat as before. Claude already knows what you've built — this prompt only needs to describe what to add.",
      },
    ],
    prompt: {
      template:
        "In the same chat, add a {{challenge.discoveryName}} section to the site.\n\nShow at least eight {{challenge.collectionPlural}} as cards, each with an image, a name, and two useful details. Add filter buttons for {{challenge.filterIdeas}} that actually work when clicked.",
    },
    proof: {
      mode: "single",
      fields: [{ key: "description", label: "Describe what you see.", minLength: 60 }],
    },
  },

  {
    id: "build-the-detail-page",
    title: "Build the {{challenge.detailName}}",
    xp: 25,
    estMinutes: 20,
    teach: [
      {
        type: "text",
        text: "A discovery page gets someone interested. A detail page is where they decide. This is what turns a browsing student into a customer.",
      },
    ],
    prompt: {
      template:
        "Now add a {{challenge.detailName}}. When someone clicks a {{challenge.collection}} card, show a detail view with a larger image, full information, and a list of {{challenge.itemPlural}}.\n\nAdd a working \"{{challenge.action}}\" button that adds the {{challenge.item}} to a {{challenge.listName}} and updates a counter in the navigation bar.",
    },
    proof: {
      mode: "single",
      fields: [{ key: "description", label: "Describe what you see.", minLength: 60 }],
    },
  },

  {
    id: "add-your-pages",
    title: "Add your pages",
    xp: 20,
    estMinutes: 20,
    teach: [
      {
        type: "text",
        text: "A real product is more than one screen. This mission rounds out the site so it feels whole.",
      },
    ],
    prompt: {
      template:
        "Add these pages to the site, reachable from the navigation: {{challenge.extraPages}}.\n\nKeep the same styling throughout. Every link in the navigation should work.",
    },
    proof: {
      mode: "single",
      fields: [
        {
          key: "pages",
          label: "List which pages you added.",
          minLength: 60,
        },
      ],
    },
  },

  {
    id: "personalize-your-brand",
    title: "Personalize your brand",
    xp: 20,
    estMinutes: 15,
    teach: [
      {
        type: "text",
        text: "The difference between a template and a product is the detail. Generic copy is where student projects give themselves away.",
      },
    ],
    prompt: {
      template:
        "Go through the whole site and replace every piece of generic text with wording that fits {{build.brand_name}}.\n\nTone: {{build.mood}}. Audience: {{build.audience}}.\n\nRewrite button labels, empty states, and the footer. Add a short \"About\" blurb. Nothing should read like a template any more.",
    },
    proof: {
      mode: "single",
      fields: [
        {
          key: "changes",
          label: "Paste three pieces of copy you changed, and what they used to say.",
          minLength: 80,
        },
      ],
    },
  },

  {
    id: "add-your-wow-feature",
    title: "Add your WOW feature",
    xp: 30,
    estMinutes: 25,
    teach: [
      {
        type: "text",
        text: "This is where every student building the same product stops looking identical. Pick the one that would make you want to show a friend.",
      },
    ],
    inputs: [
      {
        key: "wow_feature",
        label: "Pick your WOW feature",
        kind: "chips-or-custom",
        optionsFrom: "wowIdeas",
      },
    ],
    prompt: {
      template:
        "Add this feature to my site: {{build.wow_feature}}\n\nMake it work properly, not just look like it works. Match the existing design.",
    },
    proof: {
      mode: "single",
      fields: [
        {
          key: "explanation",
          label: "What does your feature do, and why did you pick it?",
          minLength: 80,
        },
      ],
    },
  },

  {
    id: "test-your-product",
    title: "Test your product",
    xp: 20,
    estMinutes: 15,
    teach: [
      {
        type: "text",
        text: "Shipping something broken is the most common mistake. Testing is part of building, not an afterthought.",
      },
    ],
    prompt: {
      template:
        "Review the entire site for problems: broken links, buttons that do nothing, text that overflows on a phone, poor colour contrast, missing images.\n\nList everything you find, then fix it all and give me the corrected file.",
    },
    checklist: [
      { key: "phone", label: "Opened it on a phone" },
      { key: "nav_links", label: "Every nav link works" },
      { key: "action_button", label: "The {{challenge.action}} button works" },
      { key: "no_placeholders", label: "No placeholder text left" },
    ],
    proof: {
      mode: "compare",
      fields: [
        { key: "found", label: "What Claude found", minLength: 60 },
        { key: "fixed", label: "What you fixed", minLength: 60 },
      ],
    },
  },

  {
    id: "final-showcase",
    title: "Final showcase",
    xp: 20,
    estMinutes: 15,
    teach: [
      {
        type: "text",
        text: "This is what the rest of the class will see. Bring your finished file.",
      },
    ],
    proof: {
      mode: "showcase",
      fields: [
        {
          key: "final_code",
          label: "Paste the complete HTML.",
          minLength: 500,
          kind: "textarea",
        },
        {
          key: "pitch",
          label: "What you built and who it's for, in one line.",
          minLength: 1,
          kind: "line",
        },
        {
          key: "proudest",
          label: "The part you're proudest of, in one line.",
          minLength: 1,
          kind: "line",
        },
      ],
    },
  },
];
