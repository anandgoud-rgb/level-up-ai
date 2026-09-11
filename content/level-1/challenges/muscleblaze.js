export default {
  id: "muscleblaze",
  name: "Build Your Own MuscleBlaze",
  tagline: "Create your own fitness and supplements experience.",
  icon: "💪",
  domain: "fitness and supplements",

  collection: "category",
  collectionPlural: "categories",
  item: "product",
  itemPlural: "products",
  action: "buy",
  listName: "cart",
  discoveryName: "product discovery",
  detailName: "product detail page",

  extraPages: ["Offers", "Orders", "Contact"],

  filterIdeas: ["category", "goal", "flavour", "price range", "best seller"],

  wowIdeas: [
    "A protein-intake calculator based on body weight",
    "A flavour picker that swaps the product image live",
    "A \"stack builder\" that bundles three products with a discount",
    "A workout-day reminder to restock before you run out",
  ],

  badge: { slug: "builder-muscleblaze", name: "MuscleBlaze Builder" },
};
