export default {
  id: "spotify",
  name: "Build Your Own Spotify",
  tagline: "Create your own music streaming experience.",
  icon: "🎧",
  domain: "music streaming",

  collection: "artist",
  collectionPlural: "artists",
  item: "song",
  itemPlural: "songs",
  action: "play",
  listName: "favourites",
  discoveryName: "music discovery",
  detailName: "artist and song page",

  extraPages: ["Playlists", "New releases", "Contact"],

  filterIdeas: ["genre", "mood", "decade", "language", "most played"],

  wowIdeas: [
    "A now-playing bar that stays visible while you browse",
    'A "made for you" playlist generated from your favourites',
    "A lyrics panel that scrolls with the song",
    "A late-night lo-fi mode that only appears after midnight",
  ],

  badge: { slug: "builder-spotify", name: "Spotify Builder" },
};
