export default {
  id: "amazon",
  name: "Build Your Own Amazon",
  tagline: "Create your own everything-store shopping experience.",
  icon: "📦",
  domain: "general online shopping",

  collection: "category",
  collectionPlural: "categories",
  item: "product",
  itemPlural: "products",
  action: "buy",
  listName: "cart and wishlist",
  discoveryName: "product discovery",
  detailName: "product detail page",

  extraPages: ["Deals", "Orders", "Contact"],

  filterIdeas: ["category", "price range", "customer rating", "brand", "free delivery"],

  wowIdeas: [
    'A "frequently bought together" bundle suggestion',
    "A price-drop alert badge on wishlist items",
    "A one-click reorder button on past purchases",
    "A gift-wrap option that adds a small preview at checkout",
  ],

  badge: { slug: "builder-amazon", name: "Amazon Builder" },
};
