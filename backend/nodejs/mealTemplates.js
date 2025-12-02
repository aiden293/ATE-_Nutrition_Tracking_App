// 50 curated meal templates covering breakfast, lunch, dinner, and snacks
// Each template includes food search terms that will be looked up in the database

const mealTemplates = [
  // BREAKFAST (12 templates)
  {
    id: 1,
    name: "Classic Protein Breakfast",
    category: "breakfast",
    foods: [
      { search: "egg, whole, raw", amount: 2, unit: "large" },
      { search: "bread, whole wheat", amount: 2, unit: "slice" },
      { search: "avocados, raw", amount: 0.5, unit: "medium" }
    ]
  },
  {
    id: 2,
    name: "Oatmeal Power Bowl",
    category: "breakfast",
    foods: [
      { search: "oatmeal", amount: 1, unit: "cup" },
      { search: "banana", amount: 1, unit: "medium" },
      { search: "almonds", amount: 30, unit: "g" },
      { search: "blueberries", amount: 50, unit: "g" }
    ]
  },
  {
    id: 3,
    name: "Greek Yogurt Parfait",
    category: "breakfast",
    foods: [
      { search: "greek yogurt", amount: 200, unit: "g" },
      { search: "strawberries", amount: 100, unit: "g" },
      { search: "granola", amount: 40, unit: "g" },
      { search: "honey", amount: 1, unit: "tbsp" }
    ]
  },
  {
    id: 4,
    name: "Veggie Scramble",
    category: "breakfast",
    foods: [
      { search: "eggs", amount: 3, unit: "large" },
      { search: "spinach", amount: 50, unit: "g" },
      { search: "tomato", amount: 1, unit: "medium" },
      { search: "cheese", amount: 30, unit: "g" }
    ]
  },
  {
    id: 5,
    name: "Smoothie Bowl",
    category: "breakfast",
    foods: [
      { search: "banana", amount: 2, unit: "medium" },
      { search: "milk", amount: 200, unit: "ml" },
      { search: "peanut butter", amount: 2, unit: "tbsp" },
      { search: "chia seeds", amount: 1, unit: "tbsp" }
    ]
  },
  {
    id: 6,
    name: "Breakfast Burrito",
    category: "breakfast",
    foods: [
      { search: "tortilla", amount: 1, unit: "large" },
      { search: "eggs", amount: 2, unit: "large" },
      { search: "black beans", amount: 80, unit: "g" },
      { search: "salsa", amount: 50, unit: "g" }
    ]
  },
  {
    id: 7,
    name: "Protein Pancakes",
    category: "breakfast",
    foods: [
      { search: "pancake", amount: 3, unit: "medium" },
      { search: "maple syrup", amount: 2, unit: "tbsp" },
      { search: "banana", amount: 1, unit: "medium" },
      { search: "walnuts", amount: 20, unit: "g" }
    ]
  },
  {
    id: 8,
    name: "Cottage Cheese Bowl",
    category: "breakfast",
    foods: [
      { search: "cottage cheese", amount: 200, unit: "g" },
      { search: "pineapple", amount: 100, unit: "g" },
      { search: "sunflower seeds", amount: 15, unit: "g" }
    ]
  },
  {
    id: 9,
    name: "Breakfast Sandwich",
    category: "breakfast",
    foods: [
      { search: "english muffin", amount: 1, unit: "whole" },
      { search: "eggs", amount: 1, unit: "large" },
      { search: "turkey sausage", amount: 50, unit: "g" },
      { search: "cheese", amount: 20, unit: "g" }
    ]
  },
  {
    id: 10,
    name: "Quinoa Breakfast",
    category: "breakfast",
    foods: [
      { search: "quinoa", amount: 150, unit: "g" },
      { search: "apple", amount: 1, unit: "medium" },
      { search: "cinnamon", amount: 1, unit: "tsp" },
      { search: "pecans", amount: 25, unit: "g" }
    ]
  },
  {
    id: 11,
    name: "Breakfast Omelette",
    category: "breakfast",
    foods: [
      { search: "eggs", amount: 3, unit: "large" },
      { search: "mushrooms", amount: 50, unit: "g" },
      { search: "bell pepper", amount: 50, unit: "g" },
      { search: "feta cheese", amount: 30, unit: "g" }
    ]
  },
  {
    id: 12,
    name: "Acai Bowl",
    category: "breakfast",
    foods: [
      { search: "acai", amount: 100, unit: "g" },
      { search: "banana", amount: 1, unit: "medium" },
      { search: "granola", amount: 40, unit: "g" },
      { search: "coconut", amount: 15, unit: "g" }
    ]
  },

  // LUNCH (15 templates)
  {
    id: 13,
    name: "Chicken Caesar Salad",
    category: "lunch",
    foods: [
      { search: "chicken, breast, raw", amount: 150, unit: "g" },
      { search: "lettuce, romaine, raw", amount: 100, unit: "g" },
      { search: "cheese, parmesan", amount: 30, unit: "g" },
      { search: "croutons, plain", amount: 30, unit: "g" }
    ]
  },
  {
    id: 14,
    name: "Turkey Sandwich",
    category: "lunch",
    foods: [
      { search: "bread, whole wheat", amount: 2, unit: "slice" },
      { search: "turkey, breast, meat", amount: 100, unit: "g" },
      { search: "lettuce, raw", amount: 30, unit: "g" },
      { search: "tomatoes, raw", amount: 1, unit: "medium" }
    ]
  },
  {
    id: 15,
    name: "Mediterranean Bowl",
    category: "lunch",
    foods: [
      { search: "quinoa", amount: 150, unit: "g" },
      { search: "chickpeas", amount: 100, unit: "g" },
      { search: "cucumber", amount: 100, unit: "g" },
      { search: "feta cheese", amount: 40, unit: "g" }
    ]
  },
  {
    id: 16,
    name: "Tuna Wrap",
    category: "lunch",
    foods: [
      { search: "tortilla", amount: 1, unit: "large" },
      { search: "tuna", amount: 100, unit: "g" },
      { search: "mixed greens", amount: 50, unit: "g" },
      { search: "avocado", amount: 0.5, unit: "medium" }
    ]
  },
  {
    id: 17,
    name: "Veggie Burger",
    category: "lunch",
    foods: [
      { search: "veggie burger", amount: 1, unit: "patty" },
      { search: "whole wheat bun", amount: 1, unit: "whole" },
      { search: "sweet potato fries", amount: 150, unit: "g" },
      { search: "ketchup", amount: 2, unit: "tbsp" }
    ]
  },
  {
    id: 18,
    name: "Chicken Burrito Bowl",
    category: "lunch",
    foods: [
      { search: "rice, brown, cooked", amount: 150, unit: "g" },
      { search: "chicken, breast, raw", amount: 120, unit: "g" },
      { search: "beans, black, cooked", amount: 100, unit: "g" },
      { search: "corn, sweet, cooked", amount: 80, unit: "g" }
    ]
  },
  {
    id: 19,
    name: "Lentil Soup",
    category: "lunch",
    foods: [
      { search: "lentils", amount: 200, unit: "g" },
      { search: "carrots", amount: 100, unit: "g" },
      { search: "celery", amount: 50, unit: "g" },
      { search: "whole wheat bread", amount: 1, unit: "slice" }
    ]
  },
  {
    id: 20,
    name: "Pasta Primavera",
    category: "lunch",
    foods: [
      { search: "pasta", amount: 100, unit: "g" },
      { search: "broccoli", amount: 100, unit: "g" },
      { search: "bell pepper", amount: 80, unit: "g" },
      { search: "olive oil", amount: 1, unit: "tbsp" }
    ]
  },
  {
    id: 21,
    name: "Shrimp Salad",
    category: "lunch",
    foods: [
      { search: "shrimp", amount: 150, unit: "g" },
      { search: "mixed greens", amount: 100, unit: "g" },
      { search: "cherry tomatoes", amount: 80, unit: "g" },
      { search: "lemon juice", amount: 2, unit: "tbsp" }
    ]
  },
  {
    id: 22,
    name: "BLT Sandwich",
    category: "lunch",
    foods: [
      { search: "whole wheat bread", amount: 2, unit: "slice" },
      { search: "bacon", amount: 3, unit: "slice" },
      { search: "lettuce", amount: 50, unit: "g" },
      { search: "tomato", amount: 1, unit: "medium" }
    ]
  },
  {
    id: 23,
    name: "Falafel Wrap",
    category: "lunch",
    foods: [
      { search: "tortilla", amount: 1, unit: "large" },
      { search: "falafel", amount: 4, unit: "pieces" },
      { search: "hummus", amount: 50, unit: "g" },
      { search: "cucumber", amount: 80, unit: "g" }
    ]
  },
  {
    id: 24,
    name: "Tofu Stir Fry",
    category: "lunch",
    foods: [
      { search: "tofu, raw, firm", amount: 150, unit: "g" },
      { search: "rice, white, cooked", amount: 150, unit: "g" },
      { search: "broccoli, raw", amount: 100, unit: "g" },
      { search: "soy sauce", amount: 1, unit: "tbsp" }
    ]
  },
  {
    id: 25,
    name: "Caprese Sandwich",
    category: "lunch",
    foods: [
      { search: "ciabatta bread", amount: 1, unit: "roll" },
      { search: "mozzarella", amount: 80, unit: "g" },
      { search: "tomato", amount: 1, unit: "large" },
      { search: "basil", amount: 10, unit: "g" }
    ]
  },
  {
    id: 26,
    name: "Chicken Quesadilla",
    category: "lunch",
    foods: [
      { search: "tortilla", amount: 2, unit: "medium" },
      { search: "chicken breast", amount: 100, unit: "g" },
      { search: "cheese", amount: 60, unit: "g" },
      { search: "salsa", amount: 50, unit: "g" }
    ]
  },
  {
    id: 27,
    name: "Sushi Bowl",
    category: "lunch",
    foods: [
      { search: "rice, white, cooked", amount: 150, unit: "g" },
      { search: "salmon, raw", amount: 120, unit: "g" },
      { search: "avocados, raw", amount: 0.5, unit: "medium" },
      { search: "seaweed, dried", amount: 10, unit: "g" }
    ]
  },

  // DINNER (15 templates)
  {
    id: 28,
    name: "Grilled Salmon Dinner",
    category: "dinner",
    foods: [
      { search: "salmon, raw", amount: 180, unit: "g" },
      { search: "sweet potato, raw", amount: 200, unit: "g" },
      { search: "asparagus, raw", amount: 150, unit: "g" },
      { search: "oil, olive", amount: 1, unit: "tbsp" }
    ]
  },
  {
    id: 29,
    name: "Chicken Stir Fry",
    category: "dinner",
    foods: [
      { search: "chicken, breast, raw", amount: 150, unit: "g" },
      { search: "rice, brown, cooked", amount: 150, unit: "g" },
      { search: "vegetables, mixed, frozen", amount: 200, unit: "g" },
      { search: "soy sauce", amount: 2, unit: "tbsp" }
    ]
  },
  {
    id: 30,
    name: "Beef Tacos",
    category: "dinner",
    foods: [
      { search: "beef, ground, raw", amount: 150, unit: "g" },
      { search: "taco shells, baked", amount: 3, unit: "shells" },
      { search: "lettuce, raw", amount: 50, unit: "g" },
      { search: "cheese, cheddar", amount: 40, unit: "g" }
    ]
  },
  {
    id: 31,
    name: "Vegetarian Chili",
    category: "dinner",
    foods: [
      { search: "kidney beans", amount: 200, unit: "g" },
      { search: "tomato", amount: 200, unit: "g" },
      { search: "bell pepper", amount: 100, unit: "g" },
      { search: "corn", amount: 100, unit: "g" }
    ]
  },
  {
    id: 32,
    name: "Pork Chops with Veggies",
    category: "dinner",
    foods: [
      { search: "pork chop", amount: 180, unit: "g" },
      { search: "mashed potato", amount: 200, unit: "g" },
      { search: "green beans", amount: 150, unit: "g" },
      { search: "butter", amount: 1, unit: "tbsp" }
    ]
  },
  {
    id: 33,
    name: "Pasta Bolognese",
    category: "dinner",
    foods: [
      { search: "pasta", amount: 150, unit: "g" },
      { search: "ground beef", amount: 120, unit: "g" },
      { search: "tomato sauce", amount: 150, unit: "ml" },
      { search: "parmesan cheese", amount: 30, unit: "g" }
    ]
  },
  {
    id: 34,
    name: "Shrimp Scampi",
    category: "dinner",
    foods: [
      { search: "shrimp", amount: 200, unit: "g" },
      { search: "pasta", amount: 150, unit: "g" },
      { search: "garlic", amount: 3, unit: "cloves" },
      { search: "butter", amount: 2, unit: "tbsp" }
    ]
  },
  {
    id: 35,
    name: "Roast Chicken Dinner",
    category: "dinner",
    foods: [
      { search: "chicken thigh", amount: 200, unit: "g" },
      { search: "roasted potato", amount: 200, unit: "g" },
      { search: "carrots", amount: 150, unit: "g" },
      { search: "brussels sprouts", amount: 100, unit: "g" }
    ]
  },
  {
    id: 36,
    name: "Teriyaki Salmon Bowl",
    category: "dinner",
    foods: [
      { search: "salmon, raw", amount: 180, unit: "g" },
      { search: "rice, white, cooked", amount: 150, unit: "g" },
      { search: "broccoli, raw", amount: 150, unit: "g" },
      { search: "sauce, teriyaki", amount: 2, unit: "tbsp" }
    ]
  },
  {
    id: 37,
    name: "Lamb Kebabs",
    category: "dinner",
    foods: [
      { search: "lamb", amount: 180, unit: "g" },
      { search: "couscous", amount: 150, unit: "g" },
      { search: "bell pepper", amount: 100, unit: "g" },
      { search: "onion", amount: 80, unit: "g" }
    ]
  },
  {
    id: 38,
    name: "Turkey Meatballs",
    category: "dinner",
    foods: [
      { search: "turkey meatballs", amount: 150, unit: "g" },
      { search: "pasta", amount: 150, unit: "g" },
      { search: "marinara sauce", amount: 150, unit: "ml" },
      { search: "spinach", amount: 100, unit: "g" }
    ]
  },
  {
    id: 39,
    name: "Stuffed Bell Peppers",
    category: "dinner",
    foods: [
      { search: "bell pepper", amount: 2, unit: "large" },
      { search: "ground turkey", amount: 150, unit: "g" },
      { search: "brown rice", amount: 100, unit: "g" },
      { search: "cheese", amount: 40, unit: "g" }
    ]
  },
  {
    id: 40,
    name: "Fish Tacos",
    category: "dinner",
    foods: [
      { search: "white fish", amount: 150, unit: "g" },
      { search: "corn tortilla", amount: 3, unit: "tortillas" },
      { search: "cabbage", amount: 80, unit: "g" },
      { search: "lime", amount: 1, unit: "whole" }
    ]
  },
  {
    id: 41,
    name: "Eggplant Parmesan",
    category: "dinner",
    foods: [
      { search: "eggplant", amount: 200, unit: "g" },
      { search: "marinara sauce", amount: 150, unit: "ml" },
      { search: "mozzarella", amount: 80, unit: "g" },
      { search: "pasta", amount: 100, unit: "g" }
    ]
  },
  {
    id: 42,
    name: "Steak and Potatoes",
    category: "dinner",
    foods: [
      { search: "beef steak", amount: 200, unit: "g" },
      { search: "baked potato", amount: 250, unit: "g" },
      { search: "broccoli", amount: 150, unit: "g" },
      { search: "butter", amount: 1, unit: "tbsp" }
    ]
  },

  // SNACKS (8 templates)
  {
    id: 43,
    name: "Apple with Peanut Butter",
    category: "snack",
    foods: [
      { search: "apple", amount: 1, unit: "medium" },
      { search: "peanut butter", amount: 2, unit: "tbsp" }
    ]
  },
  {
    id: 44,
    name: "Trail Mix",
    category: "snack",
    foods: [
      { search: "almonds", amount: 30, unit: "g" },
      { search: "walnuts", amount: 20, unit: "g" },
      { search: "dried cranberries", amount: 20, unit: "g" },
      { search: "dark chocolate", amount: 15, unit: "g" }
    ]
  },
  {
    id: 45,
    name: "Hummus and Veggies",
    category: "snack",
    foods: [
      { search: "hummus", amount: 80, unit: "g" },
      { search: "carrots", amount: 100, unit: "g" },
      { search: "celery", amount: 80, unit: "g" }
    ]
  },
  {
    id: 46,
    name: "Protein Shake",
    category: "snack",
    foods: [
      { search: "protein powder", amount: 30, unit: "g" },
      { search: "banana", amount: 1, unit: "medium" },
      { search: "milk", amount: 250, unit: "ml" }
    ]
  },
  {
    id: 47,
    name: "Cheese and Crackers",
    category: "snack",
    foods: [
      { search: "cheddar cheese", amount: 40, unit: "g" },
      { search: "whole wheat crackers", amount: 30, unit: "g" },
      { search: "grapes", amount: 100, unit: "g" }
    ]
  },
  {
    id: 48,
    name: "Energy Balls",
    category: "snack",
    foods: [
      { search: "oats", amount: 40, unit: "g" },
      { search: "peanut butter", amount: 2, unit: "tbsp" },
      { search: "honey", amount: 1, unit: "tbsp" },
      { search: "chia seeds", amount: 1, unit: "tbsp" }
    ]
  },
  {
    id: 49,
    name: "Avocado Toast",
    category: "snack",
    foods: [
      { search: "whole wheat bread", amount: 1, unit: "slice" },
      { search: "avocado", amount: 0.5, unit: "medium" },
      { search: "tomato", amount: 0.5, unit: "medium" }
    ]
  },
  {
    id: 50,
    name: "Fruit Salad",
    category: "snack",
    foods: [
      { search: "strawberries", amount: 100, unit: "g" },
      { search: "blueberries", amount: 80, unit: "g" },
      { search: "pineapple", amount: 100, unit: "g" },
      { search: "kiwi", amount: 1, unit: "medium" }
    ]
  }
];

module.exports = mealTemplates;
