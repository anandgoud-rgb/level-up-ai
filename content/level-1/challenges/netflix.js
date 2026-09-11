export default {
  id: "netflix",
  name: "Build Your Own Netflix",
  tagline: "Create your own movie and show streaming experience.",
  icon: "🎬",
  domain: "movie and show streaming",

  collection: "category",
  collectionPlural: "categories",
  item: "title",
  itemPlural: "titles",
  action: "watch",
  listName: "watchlist",
  discoveryName: "title discovery",
  detailName: "title detail page",

  extraPages: ["New releases", "My list", "Contact"],

  filterIdeas: ["genre", "release year", "rating", "language", "trending"],

  wowIdeas: [
    'A "skip intro" button that appears a few seconds in',
    'A match-percentage badge on every title, like "97% for you"',
    "An episode countdown for the next one in a series",
    'A "surprise me" shuffle button on the homepage',
  ],

  badge: { slug: "builder-netflix", name: "Netflix Builder" },
};
