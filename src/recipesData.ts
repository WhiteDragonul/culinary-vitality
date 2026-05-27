// ==========================================
// CULINARY VITALITY - MASSIVE FOODS & RECIPES DATABASE WITH I18N
// ==========================================

export interface Ingredient {
  name: string;
  amount: string;
  owned: boolean;
  category: "Produce" | "Meat & Seafood" | "Dairy & Eggs" | "Pantry" | "Bakery" | "Other";
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: number; // in minutes
  difficulty: "Easy" | "Medium" | "Hard";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  diet: string;
  ingredients: Ingredient[];
  steps: string[];
  isFavorite?: boolean;
}

// 1. DYNAMIC INGREDIENT TRANSLATION TABLE (Multilingual support for scanner suggestions & generated recipes)
export const INGREDIENT_TRANSLATIONS: Record<string, Record<string, string>> = {
  // Produce
  "Roșii": { en: "Tomatoes", ro: "Roșii", ru: "Помидоры", de: "Tomaten", es: "Tomates" },
  "Ceapă": { en: "Onion", ro: "Ceapă", ru: "Лук", de: "Zwiebel", es: "Cebolla" },
  "Usturoi": { en: "Garlic", ro: "Usturoi", ru: "Чеснок", de: "Knoblauch", es: "Ajo" },
  "Spanac": { en: "Spinach", ro: "Spanac", ru: "Шпинат", de: "Spinat", es: "Espinacas" },
  "Ciuperci": { en: "Mushrooms", ro: "Ciuperci", ru: "Грибы", de: "Pilze", es: "Champiñones" },
  "Avocado": { en: "Avocado", ro: "Avocado", ru: "Авокадо", de: "Avocado", es: "Aguacate" },
  "Ardei": { en: "Pepper", ro: "Ardei", ru: "Перец", de: "Paprika", es: "Pimiento" },
  "Cartofi": { en: "Potatoes", ro: "Cartofi", ru: "Картофель", de: "Kartoffeln", es: "Patatas" },
  "Sfeclă": { en: "Beetroot", ro: "Sfeclă", ru: "Свекла", de: "Rote Bete", es: "Remolacha" },
  "Morcov": { en: "Carrot", ro: "Morcov", ru: "Морковь", de: "Karotte", es: "Zanahoria" },
  "Morcovi": { en: "Carrots", ro: "Morcovi", ru: "Морковь", de: "Karotten", es: "Zanahorias" },
  "Sparanghel": { en: "Asparagus", ro: "Sparanghel", ru: "Спаржа", de: "Spargel", es: "Espárragos" },
  "Broccoli": { en: "Broccoli", ro: "Broccoli", ru: "Брокколи", de: "Brokkoli", es: "Brócoli" },
  "Conopidă": { en: "Cauliflower", ro: "Conopidă", ru: "Цветная капуста", de: "Blumenkohl", es: "Coliflor" },
  "Dovlecel": { en: "Zucchini", ro: "Dovlecel", ru: "Цукини", de: "Zucchini", es: "Calabacín" },
  "Vinete": { en: "Eggplant", ro: "Vinete", ru: "Баклажан", de: "Aubergine", es: "Berenjena" },
  "Salată Verde": { en: "Lettuce", ro: "Salată Verde", ru: "Салат", de: "Salat", es: "Lechuga" },
  "Castraveți": { en: "Cucumbers", ro: "Castraveți", ru: "Огурцы", de: "Gurken", es: "Pepinos" },
  "Varză": { en: "Cabbage", ro: "Varză", ru: "Капуста", de: "Kohl", es: "Repollo" },
  "Rucola": { en: "Arugula", ro: "Rucola", ru: "Руккола", de: "Rucola", es: "Rúcula" },
  "Praz": { en: "Leek", ro: "Praz", ru: "Лук-порей", de: "Lauch", es: "Puerro" },
  "Țelină": { en: "Celery", ro: "Țelină", ru: "Сельдерей", de: "Sellerie", es: "Apio" },
  "Cartofi Dulci": { en: "Sweet Potatoes", ro: "Cartofi Dulci", ru: "Батат", de: "Süßkartoffeln", es: "Batatas" },
  "Lămâie": { en: "Lemon", ro: "Lămâie", ru: "Лимон", de: "Zitrone", es: "Limón" },
  "Lime": { en: "Lime", ro: "Lime", ru: "Лайм", de: "Limette", es: "Lima" },
  "Măsline": { en: "Olives", ro: "Măsline", ru: "Оливки", de: "Oliven", es: "Aceitunas" },
  "Pătrunjel": { en: "Parsley", ro: "Pătrunjel", ru: "Петрушка", de: "Petersilie", es: "Perejil" },
  "Mărar": { en: "Dill", ro: "Mărar", ru: "Укроп", de: "Dill", es: "Eneldo" },
  "Busuioc": { en: "Basil", ro: "Busuioc", ru: "Базилик", de: "Basilikum", es: "Albahaca" },
  "Fasole Verde": { en: "Green Beans", ro: "Fasole Verde", ru: "Зеленая фасоль", de: "Grüne Bohnen", es: "Judías verdes" },
  "Mazăre": { en: "Peas", ro: "Mazăre", ru: "Горох", de: "Erbsen", es: "Guisantes" },

  // Meat & Seafood
  "Pui": { en: "Chicken", ro: "Pui", ru: "Курица", de: "Hähnchen", es: "Pollo" },
  "Curcan": { en: "Turkey", ro: "Curcan", ru: "Индейка", de: "Pute", es: "Pavo" },
  "Vită": { en: "Beef", ro: "Vită", ru: "Говядина", de: "Rindfleisch", es: "Ternera" },
  "Porc": { en: "Pork", ro: "Porc", ru: "Свинина", de: "Schweinefleisch", es: "Cerdo" },
  "Somon": { en: "Salmon", ro: "Somon", ru: "Лосось", de: "Lachs", es: "Salmón" },
  "Păstrăv": { en: "Trout", ro: "Păstrăv", ru: "Форель", de: "Forelle", es: "Trucha" },
  "Creveți": { en: "Shrimp", ro: "Creveți", ru: "Креветки", de: "Garnelen", es: "Camarones" },

  // Dairy & Eggs
  "Ouă": { en: "Eggs", ro: "Ouă", ru: "Яйца", de: "Eier", es: "Huevos" },
  "Lapte": { en: "Milk", ro: "Lapte", ru: "Молоко", de: "Milch", es: "Leche" },
  "Unt": { en: "Butter", ro: "Unt", ru: "Сливочное масло", de: "Butter", es: "Mantequilla" },
  "Cașcaval": { en: "Cheese", ro: "Cașcaval", ru: "Сыр", de: "Käse", es: "Queso" },
  "Mozzarella": { en: "Mozzarella", ro: "Mozzarella", ru: "Моцарелла", de: "Mozzarella", es: "Mozzarella" },
  "Parmezan": { en: "Parmesan", ro: "Parmezan", ru: "Пармезан", de: "Parmesan", es: "Queso parmesano" },
  "Brânză Feta": { en: "Feta Cheese", ro: "Brânză Feta", ru: "Сыр Фета", de: "Feta-Käse", es: "Queso Feta" },
  "Smântână": { en: "Cream", ro: "Smântână", ru: "Сливки", de: "Sahne", es: "Crema" },
  "Lapte de Cocos": { en: "Coconut Milk", ro: "Lapte de Cocos", ru: "Кокосовое молоко", de: "Kokosmilch", es: "Leche de coco" },

  // Pantry & Others
  "Orez": { en: "Rice", ro: "Orez", ru: "Рис", de: "Reis", es: "Arroz" },
  "Paste": { en: "Pasta", ro: "Paste", ru: "Паста", de: "Pasta", es: "Pasta" },
  "Făină": { en: "Flour", ro: "Făină", ru: "Мука", de: "Mehl", es: "Harina" },
  "Ulei de măsline": { en: "Olive oil", ro: "Ulei de măsline", ru: "Оливковое масло", de: "Olivenöl", es: "Aceite de oliva" },
  "Quinoa": { en: "Quinoa", ro: "Quinoa", ru: "Киноа", de: "Quinoa", es: "Quinoa" },
  "Ovăz": { en: "Oats", ro: "Ovăz", ru: "Овес", de: "Hafer", es: "Avena" },
  "Sare și piper": { en: "Salt and pepper", ro: "Sare și piper", ru: "Соль и перец", de: "Salz und Pfeffer", es: "Sal y pimienta" },
  "Lipie": { en: "Tortilla", ro: "Lipie", ru: "Лепешка", de: "Tortilla", es: "Tortilla" }
};

// 2. WORLD FOODS LIST IN ENGLISH (Default fallback catalog)
export const WORLD_INGREDIENTS = [
  "Tomatoes", "Onion", "Garlic", "Spinach", "Mushrooms", "Avocado", "Pepper", "Potatoes", "Beetroot", "Carrots",
  "Asparagus", "Broccoli", "Cauliflower", "Zucchini", "Eggplant", "Lettuce", "Cucumbers", "Cabbage", "Arugula",
  "Leek", "Celery", "Sweet Potatoes", "Lemon", "Lime", "Olives", "Parsley", "Dill", "Basil", "Green Beans", "Peas",
  "Chicken", "Turkey", "Beef", "Pork", "Salmon", "Trout", "Shrimp",
  "Eggs", "Milk", "Butter", "Cheese", "Mozzarella", "Parmesan", "Feta Cheese", "Cream", "Coconut Milk",
  "Rice", "Pasta", "Flour", "Olive oil", "Quinoa", "Oats", "Salt and pepper", "Tortilla"
];

// Helper to translate raw ingredients names dynamically
export function translateIngredientName(name: string, lang: string): string {
  // Check direct table mapping
  if (INGREDIENT_TRANSLATIONS[name] && INGREDIENT_TRANSLATIONS[name][lang]) {
    return INGREDIENT_TRANSLATIONS[name][lang];
  }

  // Reverse match (if stored in English but requested in another language)
  for (const roKey in INGREDIENT_TRANSLATIONS) {
    const translationsObj = INGREDIENT_TRANSLATIONS[roKey];
    if (translationsObj.en.toLowerCase() === name.toLowerCase() && translationsObj[lang]) {
      return translationsObj[lang];
    }
  }

  return name; // fallback
}

// 3. MASTER BASE RECIPES WITH INTEGRATED TRANSLATIONS FOR EXQUISITE I18N
const BASE_RECIPES = [
  {
    mealType: "breakfast",
    prepTime: 15,
    difficulty: "Easy" as const,
    baseCalories: 300,
    baseProtein: 20,
    baseCarbs: 5,
    baseFat: 22,
    diet: "Keto",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600",
    ingredients: [
      { name: "Ouă", amount: "4 pcs", owned: true, category: "Dairy & Eggs" as const },
      { name: "{ing1}", amount: "150g", owned: true, category: "Produce" as const },
      { name: "{ing2}", amount: "100g", owned: false, category: "Produce" as const },
      { name: "Cașcaval", amount: "50g", owned: true, category: "Dairy & Eggs" as const },
      { name: "Sare și piper", amount: "to taste", owned: true, category: "Pantry" as const }
    ],
    localizations: {
      en: {
        title: "Quick Frittata with {ing1} and {ing2}",
        description: "A fluffy and flavorful {style} frittata, ideal for a hearty and high-protein breakfast.",
        steps: [
          "Beat the eggs well in a clean bowl and season generously with salt and pepper.",
          "Finely chop the main ingredient: {ing1} and slice the {ing2}.",
          "Heat a tablespoon of butter or olive oil in a large non-stick skillet over medium heat.",
          "Sauté {ing1} and {ing2} for 3-4 minutes until softened and fragrant.",
          "Pour the beaten eggs evenly into the pan and sprinkle the grated cheese on top.",
          "Cover the pan and cook over medium-low heat for 6-8 minutes until fluffy and set."
        ]
      },
      ro: {
        title: "Frittata Rapidă cu {ing1} și {ing2}",
        description: "O frittata pufoasă și aromată în stil {style}, ideală pentru un mic dejun consistent și bogat în proteine.",
        steps: [
          "Bate bine cele 4 ouă într-un bol curat și asezonează-le cu sare și piper.",
          "Taie mărunt ingredientul principal: {ing1} și pregătește feliile de {ing2}.",
          "Încinge unt sau ulei de măsline într-o tigaie mare antiaderentă la foc mediu.",
          "Sotează {ing1} și {ing2} timp de 3-4 minute până când se înmoaie.",
          "Toarnă ouăle bătute uniform în tigaie și presară deasupra cașcavalul ras.",
          "Acoperă tigaia cu un capac și lasă frittata la foc mediu-mic timp de 6-8 minute până devine pufoasă."
        ]
      },
      ru: {
        title: "Быстрая Фриттата с {ing1} и {ing2}",
        description: "Пышная и ароматная фриттата в стиле {style}, идеальный завтрак с высоким содержанием белка.",
        steps: [
          "Взбейте яйца в чистой миске и щедро приправьте солью и перцем.",
          "Мелко нарежьте основной ингредиент: {ing1} и подготовьте ломтики {ing2}.",
          "Разогрейте сливочное или оливковое масло в большой сковороде на среднем огне.",
          "Обжаривайте {ing1} и {ing2} в течение 3-4 минут до мягкости.",
          "Равномерно вылейте взбитые яйца в сковороду и посыпьте тертым сыром сверху.",
          "Накройте крышкой и готовьте на медленном огне 6-8 минут до готовности."
        ]
      },
      de: {
        title: "Schnelle Frittata mit {ing1} und {ing2}",
        description: "Eine fluffige und aromatische Frittata im {style}-Stil, ideal für ein proteinreiches Frühstück.",
        steps: [
          "Die Eier in einer Schüssel gut verquirlen und großzügig mit Salz und Pfeffer würzen.",
          "Die Hauptzutat {ing1} fein hacken und die {ing2} in feine Scheiben schneiden.",
          "Butter oder Olivenöl in einer Pfanne bei mittlerer Hitze erwärmen.",
          "Säutieren Sie {ing1} und {ing2} für 3-4 Minuten, bis sie weich werden.",
          "Die verquirlten Eier gleichmäßig hineingießen und mit geriebenem Käse bestreuen.",
          "Abdecken und bei schwacher Hitze 6-8 Minuten stocken lassen."
        ]
      },
      es: {
        title: "Frittata Rápida con {ing1} y {ing2}",
        description: "Una frittata esponjosa y sabrosa al estilo {style}, ideal para un desayuno abundante y alto en proteínas.",
        steps: [
          "Bate los huevos en un tazón limpio y condimenta generosamente con sal y pimienta.",
          "Pica finamente el ingrediente principal: {ing1} y corta el {ing2}.",
          "Calienta mantequilla o aceite de oliva en una sartén grande a fuego medio.",
          "Saltea {ing1} y {ing2} durante 3-4 minutos hasta que se ablanden.",
          "Vierte los huevos batidos uniformemente y espolvorea queso rallado por encima.",
          "Tapa la sartén y cocina a fuego medio-bajo durante 6-8 minutos hasta que cuaje."
        ]
      }
    }
  },
  {
    mealType: "breakfast",
    prepTime: 20,
    difficulty: "Easy" as const,
    baseCalories: 420,
    baseProtein: 12,
    baseCarbs: 68,
    baseFat: 10,
    diet: "Balanced",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=600",
    ingredients: [
      { name: "Făină", amount: "200g", owned: true, category: "Pantry" as const },
      { name: "Lapte",
        amount: "150ml", owned: true, category: "Dairy & Eggs" as const },
      { name: "Ouă", amount: "1 pc", owned: true, category: "Dairy & Eggs" as const },
      { name: "{ing1}", amount: "100g", owned: true, category: "Produce" as const },
      { name: "{ing2}", amount: "2 tbsp", owned: false, category: "Pantry" as const }
    ],
    localizations: {
      en: {
        title: "American Pancakes with {ing1} and {ing2}",
        description: "Thick, fluffy, and extremely delicious American pancakes, loaded with notes of {ing1} and dynamic {ing2} topping.",
        steps: [
          "Mix the flour with baking powder and a pinch of salt in a large bowl.",
          "In another bowl, whisk the egg with milk, then slowly whisk it into the dry ingredients.",
          "Wash and slice {ing1}, folding it directly into the pancake batter.",
          "Heat a pan greased with butter and pour in a small ladle of batter.",
          "Cook each pancake for 2 minutes per side until small bubbles appear on the surface.",
          "Plate them hot and pour a generous amount of {ing2} topping before serving."
        ]
      },
      ro: {
        title: "Pancakes Americane cu {ing1} și {ing2}",
        description: "Clătite americane groase, pufoase și delicioase, îmbogățite cu note de {ing1} și topping de {ing2}.",
        steps: [
          "Amestecă făina cu un praf de copt și un strop de sare într-un bol.",
          "În alt recipient, bate oul cu laptele și încorporează-le treptat în făină.",
          "Spală și feliază {ing1}, adăugându-l direct în compoziția de clătite.",
          "Încinge o tigaie unsă cu unt și toarnă un polonic mic de aluat.",
          "Coace fiecare clătită timp de 2 minute pe fiecare parte până devine aurie.",
          "Pune-le pe farfurie și toarnă deasupra un sos delicios sau topping de {ing2}."
        ]
      },
      ru: {
        title: "Американские Панкейки с {ing1} и {ing2}",
        description: "Пышные и невероятно вкусные американские панкейки, наполненные нотками {ing1} и политые {ing2}.",
        steps: [
          "Смешайте муку с разрыхлителем и щепоткой соли в большой миске.",
          "В другой миске взбейте яйцо с молоком, затем медленно введите в сухие ингредиенты.",
          "Вымойте и нарежьте {ing1}, аккуратно вмешав его в тесто для панкейков.",
          "Разогрейте сковороду со сливочным маслом и налейте половник теста.",
          "Готовьте каждый блинчик по 2 минуты с каждой стороны до золотистого цвета.",
          "Выложите панкейки на тарелку и обильно полейте сиропом {ing2} перед подачей."
        ]
      },
      de: {
        title: "Amerikanische Pancakes mit {ing1} und {ing2}",
        description: "Dicke, fluffige und extrem leckere amerikanische Pfannkuchen, verfeinert mit frischen {ing1} und süßem {ing2}-Topping.",
        steps: [
          "Mehl mit Backpulver und einer Prise Salz in einer großen Schüssel mischen.",
          "In einer separaten Schüssel das Ei mit der Milch verquirlen und langsam unterheben.",
          "Die {ing1} waschen, schneiden und direkt in den flüssigen Teig geben.",
          "Eine gefettete Pfanne erhitzen und den Teig portionsweise hineingießen.",
          "Jeden Pancake 2 Minuten pro Seite goldbraun backen.",
          "Auf einem Teller anrichten und vor dem Servieren großzügig mit {ing2} übergießen."
        ]
      },
      es: {
        title: "Pancakes Americanos con {ing1} y {ing2}",
        description: "Tortitas americanas gruesas, esponjosas y deliciosas, acompañadas con notas de {ing1} y dulce cobertura de {ing2}.",
        steps: [
          "Mezcla la harina con polvo para hornear y una pizca de sal en un tazón.",
          "En otro tazón, bate el huevo con la leche y agrégalo poco a poco a la harina.",
          "Lava y corta en rodajas {ing1}, agregándolo a la masa de las tortitas.",
          "Calienta una sartén engrasada con mantequilla y vierte un cucharón de masa.",
          "Cocina cada tortita durante 2 minutos por lado hasta que salgan burbujas y doren.",
          "Sírvelas calientes con una cobertura generosa de {ing2}."
        ]
      }
    }
  },
  {
    mealType: "lunch",
    prepTime: 25,
    difficulty: "Medium" as const,
    baseCalories: 480,
    baseProtein: 36,
    baseCarbs: 10,
    baseFat: 32,
    diet: "Gluten-Free",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600",
    ingredients: [
      { name: "Somon", amount: "200g", owned: true, category: "Meat & Seafood" as const },
      { name: "Lămâie", amount: "1/2", owned: true, category: "Produce" as const },
      { name: "{ing1}", amount: "150g", owned: true, category: "Produce" as const },
      { name: "{ing2}", amount: "1 tbsp", owned: false, category: "Pantry" as const },
      { name: "Sare și piper", amount: "to taste", owned: true, category: "Pantry" as const }
    ],
    localizations: {
      en: {
        title: "Grilled {ing1} Plate with {ing2}",
        description: "Juicy, crispy-skinned grilled {ing1} served over a warm bed of seasonal greens finished with {ing2} infusion.",
        steps: [
          "Pat the fresh {ing1} file dry and season both sides with salt, pepper, and fresh lemon juice.",
          "Preheat a grill pan over medium-high heat and place the {ing1} skin-side down.",
          "Cook for 4-5 minutes, then flip it carefully and cook for an additional 3 minutes.",
          "Sauté your seasonal {ing2} greens quickly with a dash of olive oil and salt.",
          "Plate the grilled {ing1} beautifully over the warm bed of vegetables.",
          "Drizzle the remaining delicious pan juices over the top and serve immediately."
        ]
      },
      ro: {
        title: "Tigaie de {ing1} Grill cu {ing2}",
        description: "File de {ing1} crocant la exterior și extrem de fraged, servit pe un pat cald de legume verzi în stil {style} cu sos de {ing2}.",
        steps: [
          "Tamponează fileul de {ing1} cu un șervețel și asezonează-l cu sare, piper și lămâie.",
          "Încinge o tigaie grill la foc mediu-mare și pune fileul de {ing1} cu pielea în jos.",
          "Gătește-l timp de 4-5 minute, apoi întoarce-l pe cealaltă parte încă 3 minute.",
          "Sotează rapid într-o tigaie separată legumele de {ing2} cu puțin ulei de măsline.",
          "Asamblează farfuria așezând fileul cald de {ing1} peste patul proaspăt de legume.",
          "Napează totul cu sucul aromat rămas în tigaia grill și servește imediat."
        ]
      },
      ru: {
        title: "Тарелка Гриль из {ing1} с {ing2}",
        description: "Сочное филе {ing1} с хрустящей корочкой, подается на теплой подушке из зелени и сбрызнуто соусом из {ing2}.",
        steps: [
          "Обсушите свежее филе {ing1} бумажным полотенцем, приправьте с обеих сторон солью, перцем и лимонным соком.",
          "Разогрейте сковороду-гриль на среднем огне и выложите филе {ing1} кожей вниз.",
          "Готовьте 4-5 минут, затем аккуратно переверните и обжаривайте еще 3 минуты.",
          "Быстро обжарьте зелень {ing2} с небольшим количеством оливкового масла и щепоткой соли.",
          "Красиво выложите {ing1} гриль на теплую подушку из тушеных овощей.",
          "Полейте сверху ароматными соками из сковороды и сразу подавайте к столу."
        ]
      },
      de: {
        title: "Gegrillter {ing1}-Teller mit {ing2}",
        description: "Saftiges, außen knuspriges {ing1}-Filet serviert auf einem warmen Gemüsebett mit feiner {ing2}-Note.",
        steps: [
          "Tupfen Sie das frische {ing1}-Filet trocken und würzen Sie beide Seiten mit Salz, Pfeffer und Zitrone.",
          "Eine Grillpfanne bei mittlerer Hitze erwärmen und das Filet mit der Hautseite nach unten hineinlegen.",
          "4-5 Minuten grillen, dann vorsichtig wenden und weitere 3 Minuten garen.",
          "Das Gemüse für {ing2} schnell mit etwas Olivenöl und Salz andünsten.",
          "Das warme {ing1}-Filet dekorativ auf dem warmen Gemüsebett anrichten.",
          "Mit dem restlichen Pfannensaft beträufeln und sofort servieren."
        ]
      },
      es: {
        title: "Plato de {ing1} a la Parrilla con {ing2}",
        description: "Filete de {ing1} jugoso y con piel crujiente servido sobre una cama caliente de vegetales salteados con toque de {ing2}.",
        steps: [
          "Seca el filete de {ing1} con una toalla de papel y condimenta ambos lados con sal, pimienta y limón.",
          "Calienta una sartén grill a fuego medio-alto y coloca el {ing1} con la piel hacia abajo.",
          "Cocina durante 4-5 minutos, luego dale la vuelta con cuidado y cocina por 3 minutos más.",
          "Saltea rápidamente los vegetales de {ing2} con un toque de aceite de oliva y sal.",
          "Sirve el {ing1} caliente sobre la cama de vegetales verdes recién preparados.",
          "Vierte el jugo restante de la sartén por encima y disfruta de inmediato."
        ]
      }
    }
  },
  {
    mealType: "lunch",
    prepTime: 30,
    difficulty: "Medium" as const,
    baseCalories: 520,
    baseProtein: 38,
    baseCarbs: 45,
    baseFat: 16,
    diet: "Balanced",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600",
    ingredients: [
      { name: "Pui", amount: "300g", owned: true, category: "Meat & Seafood" as const },
      { name: "Lapte de Cocos", amount: "200ml", owned: true, category: "Dairy & Eggs" as const },
      { name: "Ceapă", amount: "1", owned: true, category: "Produce" as const },
      { name: "{ing1}", amount: "100g", owned: true, category: "Produce" as const },
      { name: "{ing2}", amount: "150g", owned: false, category: "Pantry" as const }
    ],
    localizations: {
      en: {
        title: "Creamy Curry {ing1} Bowl with {ing2}",
        description: "An aromatic and rich Curry feast styled in {style}, featuring tender bites of {ing1} simmered in rich sauce over a side of {ing2}.",
        steps: [
          "Dice the main protein {ing1} into uniform bite-sized cubes and season with curry powder.",
          "Finely chop the onion and sauté in a deep pan with a splash of oil until golden.",
          "Add the {ing1} cubes and cook for 5-6 minutes until lightly browned on all sides.",
          "Stir in the coconut milk and bring to a gentle boil.",
          "Simmer on low heat under a cover for 15 minutes to allow the curry sauce to thicken.",
          "Serve the hot curry generously over a side portion of fluffy {ing2}."
        ]
      },
      ro: {
        title: "Pui Curry Cremas cu {ing1} și {ing2}",
        description: "Un prânz exotic deosebit în stil {style}, cu bucățele suculente de {ing1} fierte în sos aromat de curry cu legume de {ing2}.",
        steps: [
          "Taie carnea de {ing1} în cubulețe și condimentează-le cu sare, piper și curry.",
          "Călește ceapa tocată fin într-o tigaie adâncă până devine sticloasă.",
          "Adaugă bucățile de {ing1} și prăjește-le 5-6 minute pe toate părțile.",
          "Toarnă deasupra laptele cremos de cocos și legumele de {ing2}.",
          "Lasă sosul de curry să fiarbă la foc mic sub capac timp de 15 minute.",
          "Servește curry-ul aromat fierbinte alături de o porție de orez sau {ing2}."
        ]
      },
      ru: {
        title: "Сливочный Карри с {ing1} и {ing2}",
        description: "Ароматное экзотическое карри в стиле {style}, в котором нежные кусочки {ing1} тушатся в густом соусе и подаются с {ing2}.",
        steps: [
          "Нарежьте {ing1} одинаковыми кубиками и приправьте солью, перцем и порошком карри.",
          "Мелко нарежьте лук и обжарьте в глубокой сковороде до легкого золотистого цвета.",
          "Добавьте кубики {ing1} и обжаривайте 5-6 минут до легкой румяной корочки.",
          "Влейте кокосовое молоко, перемешайте и доведите до легкого кипения.",
          "Тушите под крышкой на медленном огне 15 минут, пока соус карри не загустеет.",
          "Подавайте горячее и ароматное карри с порцией рассыпчатого {ing2}."
        ]
      },
      de: {
        title: "Cremiges Curry-Gericht mit {ing1} und {ing2}",
        description: "Ein aromatisches und reichhaltiges Curry-Fest im {style}-Stil mit zarten Stücken von {ing1} in sämiger Sauce auf {ing2}.",
        steps: [
          "Schneiden Sie {ing1} in gleichmäßige Würfel und würzen Sie sie mit Salz, Pfeffer und Currypulver.",
          "Die Zwiebel fein hacken und in einer tiefen Pfanne mit etwas Öl andünsten, bis sie goldgelb ist.",
          "Die {ing1}-Würfel hinzufügen und 5-6 Minuten rundherum anbraten.",
          "Die Kokosmilch einrühren und leicht köcheln lassen.",
          "Bei schwacher Hitze mit Deckel 15 Minuten köcheln lassen, bis die Currysauce eindickt.",
          "Servieren Sie das heiße Curry auf einer Portion luftigem {ing2}."
        ]
      },
      es: {
        title: "Bol de Curry Cremoso con {ing1} y {ing2}",
        description: "Un festín aromático e intenso de curry al estilo {style}, con tiernos bocados de {ing1} cocinados a fuego lento servidos con {ing2}.",
        steps: [
          "Corta el ingrediente principal {ing1} en cubos pequeños y condiméntalo con curry, sal y pimienta.",
          "Pica finamente la cebolla y saltéala en una sartén profunda hasta que esté dorada.",
          "Añade los cubos de {ing1} y cocina durante 5-6 minutos para sellar todos los lados.",
          "Vierte la leche de coco y revuelve bien para integrar las especias mex/asiáticas.",
          "Cocina a fuego lento con tapa durante 15 minutos para que la salsa de curry espese.",
          "Sirve el curry caliente sobre una base de {ing2} esponjoso."
        ]
      }
    }
  },
  {
    mealType: "dinner",
    prepTime: 40,
    difficulty: "Easy" as const,
    baseCalories: 430,
    baseProtein: 32,
    baseCarbs: 18,
    baseFat: 20,
    diet: "Gluten-Free",
    image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=600",
    ingredients: [
      { name: "Pui", amount: "400g", owned: true, category: "Meat & Seafood" as const },
      { name: "Ulei de măsline", amount: "2 tbsp", owned: true, category: "Pantry" as const },
      { name: "Usturoi", amount: "3 cloves", owned: true, category: "Produce" as const },
      { name: "{ing1}", amount: "200g", owned: true, category: "Produce" as const },
      { name: "{ing2}", amount: "2 sprigs", owned: false, category: "Produce" as const }
    ],
    localizations: {
      en: {
        title: "Roasted {ing1} Skillet with {ing2}",
        description: "A comforting skillet dinner made with roasted {ing1} layered with aromatic {ing2} and herbs, styled in {style}.",
        steps: [
          "Preheat your oven to 200°C (400°F) and grease a baking dish with olive oil.",
          "Arrange the fresh cut pieces of {ing1} in the center of the dish.",
          "Toss the seasonal vegetables of {ing2} in olive oil, salt, and minced garlic, then spread around.",
          "Scatter the fresh rosemary or thyme sprigs over the skillet for full flavor.",
          "Roast in the oven for 35-40 minutes until skin is crispy and vegetables are fully caramelized.",
          "Serve hot, drizzling the rich pan juices over the plate."
        ]
      },
      ro: {
        title: "Tigaie de {ing1} la Cuptor cu {ing2}",
        description: "O cină caldă reconfortantă în stil {style}, compusă din bucăți crocante de {ing1} coapte lent cu legume dulci de {ing2}.",
        steps: [
          "Preîncălzește cuptorul la 200°C și unge o tavă mare din ceramică cu ulei.",
          "Așază bucățile de {ing1} în tavă și condimentează-le cu sare, piper și usturoi.",
          "Distribuie uniform în jurul legumelor feliile de {ing2}.",
          "Adaugă rămurelele proaspete din condimente pentru o aromă excelentă.",
          "Coace totul timp de 35-40 de minute până când mâncarea devine complet rumenită.",
          "Servește cina fierbinte, turnând deasupra sosul format în tavă."
        ]
      },
      ru: {
        title: "Запеченная Сковорода {ing1} с {ing2}",
        description: "Сытный домашний ужин из нежного запеченного {ing1}, приготовленного на сковороде с ароматными веточками {ing2} в стиле {style}.",
        steps: [
          "Разогрейте духовку до 200°C и смажьте глубокую керамическую форму оливковым маслом.",
          "Выложите свежие нарезанные кусочки {ing1} в центр формы.",
          "Перемешайте овощи {ing2} с оливковым маслом, солью и чесноком, затем разложите вокруг.",
          "Посыпьте свежими ароматными травами для насыщения блюда вкусом.",
          "Запекайте в духовке 35-40 минут до появления хрустящей корочки и карамелизации овощей.",
          "Подавайте горячим, поливая насыщенными соками прямо из формы."
        ]
      },
      de: {
        title: "Ofengemüse-Pfanne {ing1} mit {ing2}",
        description: "Ein herzhaftes Abendessen aus dem Ofen: geröstetes {ing1} geschichtet mit aromatischen Kräutern von {ing2} im {style}-Stil.",
        steps: [
          "Heizen Sie den Ofen auf 200°C vor und fetten Sie eine Auflaufform mit Olivenöl.",
          "Die frisch geschnittenen Stücke von {ing1} in die Mitte der Form legen.",
          "Das frische Gemüse für {ing2} in Olivenöl, Salz und Knoblauch schwenken und verteilen.",
          "Die frischen Kräuterzweige für intensives Aroma über der Pfanne verteilen.",
          "35-40 Minuten im Ofen backen, bis alles knusprig gegrillt und goldbraun ist.",
          "Heiß servieren und mit dem aromatischen Bratensaft beträufeln."
        ]
      },
      es: {
        title: "Sartén de {ing1} Asado con {ing2}",
        description: "Una cena reconfortante hecha con jugosos cortes de {ing1} asados con un toque de hierbas de {ing2} al estilo {style}.",
        steps: [
          "Precalienta el horno a 200°C (400°F) y engrasa una bandeja para hornear con aceite de oliva.",
          "Coloca las porciones cortadas de {ing1} en el centro de la bandeja.",
          "Mezcla los vegetales de {ing2} con aceite de oliva, ajo picado y sal, distribuyéndolos alrededor.",
          "Agrega ramitas frescas de romero o tomillo sobre la bandeja para impregnar sabor.",
          "Hornea durante 35-40 minutos hasta que la superficie esté crujiente y dorada.",
          "Sirve caliente, rociando la salsa concentrada de la cocción por encima."
        ]
      }
    }
  },
  {
    mealType: "dinner",
    prepTime: 12,
    difficulty: "Easy" as const,
    baseCalories: 290,
    baseProtein: 10,
    baseCarbs: 8,
    baseFat: 24,
    diet: "Keto",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600",
    ingredients: [
      { name: "Rucola", amount: "100g", owned: true, category: "Produce" as const },
      { name: "Brânză Feta", amount: "80g", owned: true, category: "Dairy & Eggs" as const },
      { name: "Măsline", amount: "50g", owned: true, category: "Produce" as const },
      { name: "{ing1}", amount: "100g", owned: true, category: "Produce" as const },
      { name: "{ing2}", amount: "2 tbsp", owned: false, category: "Pantry" as const }
    ],
    localizations: {
      en: {
        title: "Mediterranean Salad with {ing1} and {ing2}",
        description: "A super refreshing, keto-friendly Mediterranean dinner loaded with creamy feta cheese, kalamata olives, crunchy {ing1}, and a light splash of {ing2}.",
        steps: [
          "Thoroughly wash the fresh green base leaves and lay them in a wide salad bowl.",
          "Cube the creamy feta cheese and spread it evenly over the top along with flavorful olives.",
          "Finely slice the {ing1} to add color and a crisp, juicy texture.",
          "Whisk the olive oil, lemon juice, and fine herbs in a separate cup for the {ing2} dressing.",
          "Drizzle the dressing over the salad just before serving to keep leaves fresh.",
          "Toss gently with two large salad spoons and enjoy."
        ]
      },
      ro: {
        title: "Salată Mediteraneană cu {ing1} și {ing2}",
        description: "O cină ușoară, proaspătă și complet echilibrată, cu măsline, rucola, brânză feta, legume de {ing1} și dressing fin de {ing2}.",
        steps: [
          "Spală bine frunzele verzi și așază-le ca bază într-un bol mare de salată.",
          "Taie în cuburi brânza feta și adaug-o deasupra alături de măsline.",
          "Taie fin legumele de {ing1} și presară-le pentru o culoare vie.",
          "Amestecă uleiul de măsline cu zeamă de lămâie pentru sosul {ing2}.",
          "Stropește salata proaspătă uniform cu sosul obținut înainte de servire.",
          "Amestecă delicat elementele cu două linguri mari pentru a păstra frunzele întregi."
        ]
      },
      ru: {
        title: "Средиземноморский Салат с {ing1} и {ing2}",
        description: "Освежающий кето-ужин в средиземноморском стиле, наполненный нежным сыром фета, маслинами, хрустящим {ing1} и заправленный {ing2}.",
        steps: [
          "Тщательно промойте свежую салатную зелень и выложите в большую глубокую миску.",
          "Нарежьте сыр фета кубиками и равномерно распределите сверху вместе с маслинами.",
          "Нарежьте {ing1} тонкими ломтиками для сочности и яркости вкуса.",
          "В отдельной чашке смешайте оливковое масло, лимонный сок и специи для заправки {ing2}.",
          "Полейте заправкой салат прямо перед подачей, чтобы сохранить свежесть зелени.",
          "Аккуратно перемешайте салат двумя большими ложками и подавайте к столу."
        ]
      },
      de: {
        title: "Mediterraner Salat mit {ing1} und {ing2}",
        description: "Ein erfrischendes, Keto-freundliches mediterranes Abendessen mit cremigem Feta-Käse, aromatischen Oliven, knackiger {ing1} und leichtem {ing2}-Dressing.",
        steps: [
          "Den Blattsalat gründlich waschen, trocken tupfen und in eine große Schüssel geben.",
          "Den Feta-Käse würfeln und zusammen mit den Oliven gleichmäßig darüber verteilen.",
          "Die {ing1} fein schneiden, um Farbe und Frische hinzuzufügen.",
          "Olivenöl, Zitronensaft und Kräuter in einer Tasse für das {ing2}-Dressing anrühren.",
          "Das Dressing kurz vor dem Servieren gleichmäßig über den Salat träufeln.",
          "Mit zwei großen Löffeln vorsichtig vermengen und genießen."
        ]
      },
      es: {
        title: "Ensalada Mediterránea con {ing1} y {ing2}",
        description: "Una cena mediterránea muy refrescante y baja en carbohidratos, con queso feta cremoso, aceitunas negras, {ing1} crujiente y salsa de {ing2}.",
        steps: [
          "Lava muy bien las hojas verdes y colócalas como base en una ensaladera ancha.",
          "Corta el queso feta en cubos y espárcelo por encima junto con las aceitunas.",
          "Corta finamente el {ing1} para darle una textura crujiente y color al plato.",
          "Bate el aceite de oliva con limón e ingredientes aromáticos para preparar el aderezo {ing2}.",
          "Vierte el aderezo sobre la ensalada justo antes de servir.",
          "Mezcla delicadamente con dos cucharas de ensalada y sirve de inmediato."
        ]
      }
    }
  }
];

// VARIATIONS POOLS
const PROTEINS = [
  { name: "Pui", category: "Meat & Seafood" as const, calMod: 0, protMod: 0, carbMod: 0, fatMod: 0 },
  { name: "Somon", category: "Meat & Seafood" as const, calMod: 60, protMod: -2, carbMod: 0, fatMod: 8 },
  { name: "Curcan", category: "Meat & Seafood" as const, calMod: -20, protMod: 2, carbMod: 0, fatMod: -2 },
  { name: "Creveți", category: "Meat & Seafood" as const, calMod: -50, protMod: -4, carbMod: 0, fatMod: -6 },
  { name: "Tofu", category: "Produce" as const, calMod: -80, protMod: -10, carbMod: 2, fatMod: -4 },
  { name: "Vită", category: "Meat & Seafood" as const, calMod: 80, protMod: 4, carbMod: 0, fatMod: 10 },
  { name: "Păstrăv", category: "Meat & Seafood" as const, calMod: 20, protMod: -2, carbMod: 0, fatMod: 3 }
];

const VEGGIES = [
  "Spanac", "Ciuperci", "Avocado", "Ardei", "Cartofi Dulci", "Broccoli", "Conopidă", 
  "Dovlecel", "Vinete", "Sparanghel", "Morcovi", "Fasole Verde", "Mazăre", "Praz"
];

const STYLES = {
  en: ["Mediterranean Style", "Asian Ginger Style", "Traditional Style", "Spicy Mexican Style", "Classic French Herb Style", "Italian Basil Style"],
  ro: ["Stil Mediteranean", "Stil Asiatic cu Ghimbir", "Stil Tradițional Românesc", "Stil Mexican Picant", "Stil Clasic cu Ierburi de Provence", "Stil Italian Aromat"],
  ru: ["Средиземноморский стиль", "Азиатский имбирный стиль", "Традиционный стиль", "Острый мексиканский стиль", "Классический стиль прованских трав", "Итальянский ароматный стиль"],
  de: ["Mediterraner Stil", "Asiatischer Ingwer-Stil", "Traditioneller Stil", "Scharfer mexikanischer Stil", "Klassischer Kräuter-Stil", "Italienischer Basilikum-Stil"],
  es: ["Estilo Mediterráneo", "Estilo Asiático con Jengibre", "Estilo Tradicional", "Estilo Mexicano Picante", "Estilo Clásico con Hierbas", "Estilo Italiano Aromático"]
};

const DIFFICULTY_POOL = {
  en: ["Easy", "Medium", "Hard"],
  ro: ["Ușor", "Mediu", "Greu"],
  ru: ["Легко", "Средне", "Сложно"],
  de: ["Einfach", "Mittel", "Schwer"],
  es: ["Fácil", "Medio", "Difícil"]
};

export const PANTRY_ITEMS = [
  "Ulei de măsline", "Sos de soia", "Oțet balsamic", "Miere", "Sos Curry", "Pesto proaspăt",
  "Semințe de susan", "Sos Salsa", "Iaurt Grecesc", "Semințe de Chia", "Sirop de Arțar"
];

const ACCURATE_IMAGES = {
  frittata: [
    "https://cdn.hellotaste.ro/wp-content/uploads/2026/02/frittata-cu-ciuperci-si-spanac-portionata.jpg"
  ],
  pancakes: [
    "https://www.amanicolae.ro/wp-content/uploads/2021/08/Pancakes-cu-dovlecel59.jpg",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&q=80&w=600"
  ],
  grilledFish: [
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=600"
  ],
  grilledChicken: [
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=600"
  ],
  grilledBeef: [
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=600"
  ],
  grilledShrimp: [
    "https://www.flaviahiriscau.ro/wp-content/uploads/2020/03/9B08DC1E-D3A8-4A83-A6CE-61E0C058C49C.jpeg"
  ],
  grilledTofu: [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600"
  ],
  curryChicken: [
    "https://lchf.ro/wp-content/uploads/2015/11/currypui11.jpg",
    "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=600"
  ],
  curryFish: [
    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&q=80&w=600"
  ],
  curryBeef: [
    "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600"
  ],
  curryTofu: [
    "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600"
  ],
  roastedChicken: [
    "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&q=80&w=600"
  ],
  roastedBeef: [
    "https://images.unsplash.com/photo-1514516345957-556ca7d90a29?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600"
  ],
  roastedFish: [
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600"
  ],
  roastedTofu: [
    "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=600"
  ],
  salad: [
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=600"
  ]
};

export function getAccurateRecipeImage(i: number, mealType: string, diet: string, proteinName: string, title: string = ""): string {
  if (mealType === "breakfast") {
    if (diet === "Keto") {
      const pool = ACCURATE_IMAGES.frittata;
      return pool[i % pool.length];
    } else {
      if (title.toLowerCase().includes("dovlecel") || title.toLowerCase().includes("zucchini")) {
        return "https://www.amanicolae.ro/wp-content/uploads/2021/08/Pancakes-cu-dovlecel59.jpg";
      }
      const pool = ACCURATE_IMAGES.pancakes.filter(img => img !== "https://www.amanicolae.ro/wp-content/uploads/2021/08/Pancakes-cu-dovlecel59.jpg");
      return pool[i % pool.length];
    }
  }

  // Lunch - Grilled Plate (Gluten-Free)
  if (mealType === "lunch" && diet === "Gluten-Free") {
    if (proteinName === "Somon" || proteinName === "Păstrăv") {
      const pool = ACCURATE_IMAGES.grilledFish;
      return pool[i % pool.length];
    }
    if (proteinName === "Pui" || proteinName === "Curcan") {
      const pool = ACCURATE_IMAGES.grilledChicken;
      return pool[i % pool.length];
    }
    if (proteinName === "Vită") {
      const pool = ACCURATE_IMAGES.grilledBeef;
      return pool[i % pool.length];
    }
    if (proteinName === "Creveți") {
      const pool = ACCURATE_IMAGES.grilledShrimp;
      return pool[i % pool.length];
    }
    const pool = ACCURATE_IMAGES.grilledTofu;
    return pool[i % pool.length];
  }

  // Lunch - Creamy Curry (Balanced)
  if (mealType === "lunch" && diet === "Balanced") {
    if (proteinName === "Pui" || proteinName === "Curcan") {
      const pool = ACCURATE_IMAGES.curryChicken;
      return pool[i % pool.length];
    }
    if (proteinName === "Somon" || proteinName === "Păstrăv" || proteinName === "Creveți") {
      const pool = ACCURATE_IMAGES.curryFish;
      return pool[i % pool.length];
    }
    if (proteinName === "Vită") {
      const pool = ACCURATE_IMAGES.curryBeef;
      return pool[i % pool.length];
    }
    const pool = ACCURATE_IMAGES.curryTofu;
    return pool[i % pool.length];
  }

  // Dinner - Roasted Skillet (Gluten-Free)
  if (mealType === "dinner" && diet === "Gluten-Free") {
    if (proteinName === "Somon" || proteinName === "Păstrăv" || proteinName === "Creveți") {
      const pool = ACCURATE_IMAGES.roastedFish;
      return pool[i % pool.length];
    }
    if (proteinName === "Pui" || proteinName === "Curcan") {
      const pool = ACCURATE_IMAGES.roastedChicken;
      return pool[i % pool.length];
    }
    if (proteinName === "Vită") {
      const pool = ACCURATE_IMAGES.roastedBeef;
      return pool[i % pool.length];
    }
    const pool = ACCURATE_IMAGES.roastedTofu;
    return pool[i % pool.length];
  }

  // Dinner - Mediterranean Salad (Keto)
  const pool = ACCURATE_IMAGES.salad;
  return pool[i % pool.length];
}

// MAIN DYNAMIC LANGUAGE SEED RECIPES ENGINE
export function generate200Recipes(lang: string = "en"): Recipe[] {
  const targetLang = (["en", "ro", "ru", "de", "es"].includes(lang) ? lang : "en") as keyof typeof BASE_RECIPES[0]["localizations"];
  const recipes: Recipe[] = [];
  let idCounter = 1;
  const totalToGenerate = 100;

  for (let i = 0; i < totalToGenerate; i++) {
    const base = BASE_RECIPES[i % BASE_RECIPES.length];
    const loc = base.localizations[targetLang] || base.localizations["en"];

    const protIdx = (i * 3) % PROTEINS.length;
    const vegIdx1 = (i * 7) % VEGGIES.length;
    const vegIdx2 = (i * 11) % VEGGIES.length;
    const styleIdx = (i * 17) % STYLES[targetLang].length;

    const selectedProtein = PROTEINS[protIdx];
    const selectedVeg1 = VEGGIES[vegIdx1];
    const selectedVeg2 = VEGGIES[vegIdx1 === vegIdx2 ? (vegIdx2 + 1) % VEGGIES.length : vegIdx2];
    const selectedStyle = STYLES[targetLang][styleIdx];

    // Translate ingredients based on target language
    const tVeg1 = translateIngredientName(selectedVeg1, targetLang);
    const tVeg2 = translateIngredientName(selectedVeg2, targetLang);
    const tProtein = translateIngredientName(selectedProtein.name, targetLang);

    // Determine swap values
    const hasMeatReference = base.ingredients.some(ing => ing.name === "Pui" || ing.name === "Somon" || ing.name === "Vită");
    let swap1 = tVeg1;
    let swap2 = tVeg2;

    if (hasMeatReference) {
      swap1 = tProtein;
    }

    const replaceText = (text: string): string => {
      return text
        .replace(/{ing1}/g, swap1)
        .replace(/{ing2}/g, swap2)
        .replace(/{style}/g, selectedStyle);
    };

    const title = replaceText(loc.title);
    const description = replaceText(loc.description);
    const steps = loc.steps.map(step => replaceText(step));

    const finalIngredients = base.ingredients.map(ing => {
      let name = ing.name;
      let category = ing.category;

      if (name === "{ing1}") {
        name = swap1;
        if (hasMeatReference) category = selectedProtein.category;
      } else if (name === "{ing2}") {
        name = swap2;
      } else if (name === "Pui" || name === "Somon" || name === "Vită") {
        name = tProtein;
        category = selectedProtein.category;
      } else {
        // Translate base common ingredients
        name = translateIngredientName(name, targetLang);
      }

      return {
        name,
        amount: ing.amount,
        owned: Math.random() > 0.45,
        category
      };
    });

    // Deduplicate finalIngredients by name to avoid React key conflicts
    const seenNames = new Set<string>();
    const deduped = finalIngredients.filter(ing => {
      if (seenNames.has(ing.name)) return false;
      seenNames.add(ing.name);
      return true;
    });

    const pMod = hasMeatReference ? selectedProtein.protMod : 0;
    const cMod = hasMeatReference ? selectedProtein.carbMod : 0;
    const fMod = hasMeatReference ? selectedProtein.fatMod : 0;
    const calMod = hasMeatReference ? selectedProtein.calMod : 0;

    const protein = Math.max(5, base.baseProtein + pMod + Math.floor(Math.random() * 4));
    const carbs = Math.max(2, base.baseCarbs + cMod + Math.floor(Math.random() * 6));
    const fat = Math.max(3, base.baseFat + fMod + Math.floor(Math.random() * 5));
    const calories = Math.max(120, base.baseCalories + calMod + Math.floor(Math.random() * 50));

    let finalDiet = base.diet;
    if (carbs <= 10 && fat >= 18) {
      finalDiet = "Keto";
    } else if (!deduped.some(ing => ing.category === "Meat & Seafood" || ing.name === "Ouă" || ing.name === "Lapte" || ing.name === "Smântână" || ing.name === "Unt" || ing.name === "Cașcaval" || ing.name === "Brânză Feta" || ing.name === "Mozzarella")) {
      finalDiet = "Vegan";
    } else if (Math.random() > 0.6) {
      finalDiet = "Gluten-Free";
    }

    const diffPool = DIFFICULTY_POOL[targetLang] || DIFFICULTY_POOL["en"];
    const difficulty = diffPool[i % diffPool.length] as "Easy" | "Medium" | "Hard";

    // Assign a unique image from the pool based on recipe index
    const recipeImage = getAccurateRecipeImage(i, base.mealType, base.diet, selectedProtein.name, title);

    recipes.push({
      id: `rcp-${idCounter++}`,
      title,
      description,
      image: recipeImage,
      prepTime: base.prepTime + (i % 3) * 5,
      difficulty,
      calories,
      protein,
      carbs,
      fat,
      diet: finalDiet,
      ingredients: deduped,
      steps,
      isFavorite: idCounter <= 3
    });
  }

  return recipes;
}
