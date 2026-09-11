export default {
  id: "instagram",
  name: "Build Your Own Instagram",
  tagline: "Create your own photo and video sharing experience.",
  icon: "📸",
  domain: "photo and video sharing",

  collection: "profile",
  collectionPlural: "profiles",
  item: "post",
  itemPlural: "posts",
  action: "like",
  listName: "saved posts",
  discoveryName: "explore page",
  detailName: "profile and post page",

  extraPages: ["Explore", "Reels", "Contact"],

  filterIdeas: ["following", "most liked", "recent", "nearby", "photos or videos"],

  wowIdeas: [
    "A double-tap-to-like animation on every post",
    "A story ring that lights up around active profiles",
    'A "close friends" style badge on selected posts',
    "A midnight-post streak counter on your own profile",
  ],

  badge: { slug: "builder-instagram", name: "Instagram Builder" },
};
