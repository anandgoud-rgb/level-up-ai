export default {
  id: "zepto",
  name: "Build Your Own Zepto",
  tagline: "Create your own quick-commerce grocery experience.",
  icon: "🛒",
  domain: "quick grocery delivery",

  collection: "category",
  collectionPlural: "categories",
  item: "product",
  itemPlural: "products",
  action: "order",
  listName: "cart",
  discoveryName: "product discovery",
  detailName: "product detail page",

  extraPages: ["Offers", "Cart and checkout", "Contact"],

  filterIdeas: ["category", "price range", "brand", "delivery time", "in stock only"],

  wowIdeas: [
    "A 10-minute delivery countdown timer on every product",
    'A "forgot something?" reminder that suggests items before checkout',
    "A late-night snack mode that highlights munchies after 9pm",
    "A reorder shortcut for your last basket",
  ],

  badge: { slug: "builder-zepto", name: "Zepto Builder" },
};
