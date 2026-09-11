export default {
  id: "zomato",
  name: "Build Your Own Zomato",
  tagline: "Create your own food discovery and delivery experience.",
  icon: "🍔",
  domain: "food discovery and delivery",

  collection: "restaurant",
  collectionPlural: "restaurants",
  item: "dish",
  itemPlural: "dishes",
  action: "order",
  listName: "cart",
  discoveryName: "restaurant discovery",
  detailName: "restaurant and menu page",

  extraPages: ["Offers", "Cart and order", "Contact"],

  filterIdeas: ["cuisine", "price range", "rating", "delivery time", "veg or non-veg"],

  wowIdeas: [
    'A "Surprise Me" button that picks a random dish',
    "A spice-level slider that filters the menu",
    "A split-the-bill calculator",
    "A midnight-cravings section that only appears after 10pm",
  ],

  badge: { slug: "builder-zomato", name: "Zomato Builder" },
};
