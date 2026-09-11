export default {
  id: "youtube",
  name: "Build Your Own YouTube",
  tagline: "Create your own video sharing and streaming experience.",
  icon: "📺",
  domain: "video sharing and streaming",

  collection: "channel",
  collectionPlural: "channels",
  item: "video",
  itemPlural: "videos",
  action: "watch",
  listName: "watch later",
  discoveryName: "video discovery",
  detailName: "video and channel page",

  extraPages: ["Trending", "Subscriptions", "Contact"],

  filterIdeas: ["category", "upload date", "video length", "channel", "most viewed"],

  wowIdeas: [
    'A "watch speed" control — 1x, 1.5x, 2x',
    "An auto-play-next queue that lines up related videos",
    'A comment section with a "pin creator reply" style highlight',
    'A "continue watching" row that remembers where you left off',
  ],

  badge: { slug: "builder-youtube", name: "YouTube Builder" },
};
