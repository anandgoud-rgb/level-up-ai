export default {
  id: "makemytrip",
  name: "Build Your Own MakeMyTrip",
  tagline: "Create your own travel booking experience.",
  icon: "✈️",
  domain: "travel booking",

  collection: "destination",
  collectionPlural: "destinations",
  item: "hotel or package",
  itemPlural: "hotels and packages",
  action: "book",
  listName: "bookings",
  discoveryName: "destination discovery",
  detailName: "hotel and package page",

  extraPages: ["Offers", "My trips", "Contact"],

  filterIdeas: ["price range", "star rating", "trip length", "season", "nearby airport"],

  wowIdeas: [
    "A budget slider that updates destination cards live",
    'A "best time to visit" badge based on season',
    "A packing checklist that appears after booking",
    "A weekend-getaway shuffle for destinations under a set budget",
  ],

  badge: { slug: "builder-makemytrip", name: "MakeMyTrip Builder" },
};
