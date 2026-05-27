import React, { useState, useEffect, useMemo } from "react";
import {
  ChefHat,
  Search,
  Calendar,
  ShoppingCart,
  Clock,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Check,
  X,
  Flame,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Heart,
  Info,
  LayoutGrid,
  Refrigerator,
  User,
  Users,
  UserPlus,
  Settings,
  Bell,
  LogOut,
  HelpCircle,
  Sparkles,
  Book,
  CalendarDays as CalendarIcon,
  Trash,
  Camera
} from "lucide-react";
import "./App.css";
import { WORLD_INGREDIENTS, generate200Recipes, translateIngredientName } from "./recipesData";
import { TRANSLATIONS, Language } from "./translations";
import { supabase } from "./supabaseClient";
import { Session } from "@supabase/supabase-js";
import AuthPage from "./AuthPage";

export const ACHIEVEMENTS = [
  {
    id: "first_cook",
    title: { en: "First Culinary Masterpiece 🍳", ro: "Prima Operă de Artă 🍳" },
    desc: { en: "Cook your first recipe.", ro: "Gătește prima ta rețetă." },
    points: 100,
    icon: "🍳"
  },
  {
    id: "master_chef_5",
    title: { en: "Elite Master Chef 👑", ro: "Bucătar de Elită 👑" },
    desc: { en: "Cook 5 recipes in total.", ro: "Gătește 5 rețete în total." },
    points: 100,
    icon: "👑"
  },
  {
    id: "fav_3",
    title: { en: "Gourmet Curator ❤️", ro: "Curator de Gusturi ❤️" },
    desc: { en: "Add 3 recipes to your favorites.", ro: "Adaugă 3 rețete la favorite." },
    points: 100,
    icon: "❤️"
  },
  {
    id: "plan_3",
    title: { en: "Culinary Architect 📅", ro: "Arhitect Culinar 📅" },
    desc: { en: "Plan 3 meals in your Weekly Planner.", ro: "Planifică 3 mese în planul săptămânal." },
    points: 100,
    icon: "📅"
  },
  {
    id: "ingredients_5",
    title: { en: "Pantry Overlord 🥕", ro: "Regele Ingredientelor 🥕" },
    desc: { en: "Have 5 or more ingredients in your fridge.", ro: "Deține 5 sau mai multe ingrediente în frigider." },
    points: 100,
    icon: "🥕"
  }
];

export const SHOP_ITEMS = [
  {
    id: "badge_star",
    name: { en: "Michelin Star Badge ⭐", ro: "Medalie Stea Michelin ⭐" },
    desc: { en: "Displays a golden star badge on your profile avatar.", ro: "Afișează o stea de aur pe avatarul tău." },
    price: 50,
    type: "badge",
    displayValue: "⭐"
  },
  {
    id: "badge_fire",
    name: { en: "Fire Chef Badge 🔥", ro: "Insignă Bucătar de Foc 🔥" },
    desc: { en: "Displays a fire flame badge on your profile avatar.", ro: "Afișează o flacără pe avatarul tău." },
    price: 100,
    type: "badge",
    displayValue: "🔥"
  },
  {
    id: "border_gold",
    name: { en: "Royal Gold Avatar Border 🌟", ro: "Contur Regal de Aur 🌟" },
    desc: { en: "Gives your profile avatar a shining gold border.", ro: "Oferă avatarului tău o ramă strălucitoare de aur." },
    price: 150,
    type: "border",
    displayStyle: { border: "4px solid #ffd700", boxShadow: "0 0 12px rgba(255, 215, 0, 0.6)" }
  },
  {
    id: "border_neon",
    name: { en: "Vibrant Cyan Neon Border ⚡", ro: "Contur Neon Cyan ⚡" },
    desc: { en: "Gives your profile avatar an awesome neon cyan glow.", ro: "Oferă avatarului tău o strălucire neon cyan." },
    price: 200,
    type: "border",
    displayStyle: { border: "4px solid #00f0ff", boxShadow: "0 0 12px rgba(0, 240, 255, 0.6)" }
  },
  {
    id: "title_legend",
    name: { en: "Legendary Gourmet Title 🏆", ro: "Titlu Gourmet Legendar 🏆" },
    desc: { en: "Replaces your subtitle username with 'Legendary Gourmet'.", ro: "Înlocuiește subtitlul tău cu 'Gourmet Legendar'." },
    price: 120,
    type: "title",
    displayValue: "Legendary Gourmet"
  }
];


// ==========================================
// 1. DATA MODELS & TYPES
// ==========================================

type FriendRequestStatus = "pending" | "accepted" | "declined";

interface FriendRequest {
  id: string;
  fromUserId: string;
  fromName: string;
  fromUsername: string;
  fromAvatar: string; // initials or URL
  fromAvatarColor: string;
  mutualFriends: number;
  sentAt: string; // ISO date string
  status: FriendRequestStatus;
  // TODO: Link to Supabase "friend_requests" table
}

interface AppNotification {
  id: string;
  type: "friend_request" | "system";
  read: boolean;
  createdAt: string;
  friendRequest?: FriendRequest;
  message?: string;
}

interface Ingredient {
  name: string;
  amount: string;
  owned: boolean;
  category: "Produce" | "Meat & Seafood" | "Dairy & Eggs" | "Pantry" | "Bakery" | "Other";
}

interface Recipe {
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

interface MealPlan {
  [day: string]: {
    breakfast?: Recipe | null;
    lunch?: Recipe | null;
    dinner?: Recipe | null;
  };
}

const DAYS_OF_WEEK = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

const removeDiacritics = (str: string): string => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ăâ]/g, "a")
    .replace(/[ĂÂ]/g, "A")
    .replace(/[î]/g, "i")
    .replace(/[Î]/g, "I")
    .replace(/[șş]/g, "s")
    .replace(/[ȘŞ]/g, "S")
    .replace(/[țţ]/g, "t")
    .replace(/[ȚŢ]/g, "T");
};

export default function App() {

  // ==========================================
  // AUTH SESSION
  // ==========================================
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "scanner" | "planner" | "shopping" | "profile" | "settings" | "notifications" | "favorites" | "friends">("dashboard");

  // Multilingual Language State
  const [language, setLanguage] = useState<Language>(() => {
    const local = localStorage.getItem("app_lang");
    return (local && ["en", "ro", "ru", "de", "es"].includes(local) ? local : "en") as Language;
  });

  // Theme Mode State
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const local = localStorage.getItem("app_theme");
    return (local === "dark" ? "dark" : "light");
  });

  // Sync theme to root HTML element and local storage
  useEffect(() => {
    localStorage.setItem("app_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Translation helper function
  const t = (key: string, replacements?: Record<string, string | number>): string => {
    let str = TRANSLATIONS[language]?.[key] || TRANSLATIONS["en"]?.[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{${k}}`, "g"), String(v));
      });
    }
    return str;
  };

  const getCategoryTranslation = (cat: string) => {
    switch (cat) {
      case "Produce": return t("cat_produce");
      case "Meat & Seafood": return t("cat_meat");
      case "Dairy & Eggs": return t("cat_dairy");
      case "Pantry": return t("cat_pantry");
      case "Bakery": return t("cat_bakery");
      default: return t("cat_other");
    }
  };

  // Sync language to local storage
  useEffect(() => {
    localStorage.setItem("app_lang", language);
  }, [language]);

  // Core App States
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Coins & Gamification States
  const [coins, setCoins] = useState<number>(() => {
    const local = localStorage.getItem("user_coins");
    return local ? parseInt(local) : 50;
  });

  const [purchasedItems, setPurchasedItems] = useState<string[]>(() => {
    const local = localStorage.getItem("purchased_items");
    return local ? JSON.parse(local) : [];
  });

  const [activeBadge, setActiveBadge] = useState<string>(() => {
    return localStorage.getItem("active_badge") || "";
  });

  const [activeBorder, setActiveBorder] = useState<string>(() => {
    return localStorage.getItem("active_border") || "";
  });

  const [cookedCount, setCookedCount] = useState<number>(() => {
    const local = localStorage.getItem("cooked_count");
    return local ? parseInt(local) : 0;
  });

  const [completedAchievements, setCompletedAchievements] = useState<string[]>(() => {
    const local = localStorage.getItem("completed_achievements");
    return local ? JSON.parse(local) : [];
  });

  const [profileSubTab, setProfileSubTab] = useState<"stats" | "achievements" | "shop">("stats");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedRecipeTitle, setCompletedRecipeTitle] = useState("");
  
  // Friends & Social States
  const [showAddFriendsModal, setShowAddFriendsModal] = useState(false);
  const [searchFriendNickname, setSearchFriendNickname] = useState("");
  const [searchFriendResults, setSearchFriendResults] = useState<any[]>([]);
  const [searchingFriend, setSearchingFriend] = useState(false);
  const [selectedFriendProfile, setSelectedFriendProfile] = useState<any | null>(null);
  const [activeFriendshipStatus, setActiveFriendshipStatus] = useState<"none" | "pending_sent" | "pending_received" | "friends">("none");
  const [activeFriendshipId, setActiveFriendshipId] = useState("");
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const [achievementToast, setAchievementToast] = useState<{ show: boolean; name: string; id: string }>({ 
    show: false, 
    name: "", 
    id: "" 
  });

  // Local Storage Sync Effects
  useEffect(() => {
    localStorage.setItem("user_coins", coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem("purchased_items", JSON.stringify(purchasedItems));
  }, [purchasedItems]);

  useEffect(() => {
    localStorage.setItem("active_badge", activeBadge);
  }, [activeBadge]);

  useEffect(() => {
    localStorage.setItem("active_border", activeBorder);
  }, [activeBorder]);

  useEffect(() => {
    localStorage.setItem("cooked_count", cookedCount.toString());
  }, [cookedCount]);

  useEffect(() => {
    localStorage.setItem("completed_achievements", JSON.stringify(completedAchievements));
  }, [completedAchievements]);

  // Achievement Unlock Trigger
  const unlockAchievement = (id: string, name: string) => {
    setCompletedAchievements(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      setCoins(c => c + 100);
      setAchievementToast({ show: true, name, id });
      setTimeout(() => {
        setAchievementToast(t => ({ ...t, show: false }));
      }, 4000);
      return next;
    });
  };

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    const RECIPES_VERSION = "v11"; // bump this to force refresh when recipe data changes
    const storedVersion = localStorage.getItem("cookbook_version");
    const local = localStorage.getItem("cookbook_recipes");

    // Force regenerate if version mismatch (e.g. new images added)
    if (storedVersion !== RECIPES_VERSION) {
      localStorage.setItem("cookbook_version", RECIPES_VERSION);
      localStorage.removeItem("cookbook_recipes");
      return generate200Recipes(language);
    }

    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.length < 10) {
        return generate200Recipes(language);
      }
      return parsed;
    }
    return generate200Recipes(language);
  });

  const [fridgeIngredients, setFridgeIngredients] = useState<string[]>(() => {
    const local = localStorage.getItem("fridge_ingredients");
    return local ? JSON.parse(local) : ["Roșii", "Ouă", "Cașcaval", "Spanac", "Usturoi", "Ceapă", "Orez", "Avocado"];
  });

  const [mealPlan, setMealPlan] = useState<MealPlan>(() => {
    const local = localStorage.getItem("meal_plan");
    if (local) return JSON.parse(local);

    const emptyPlan: MealPlan = {};
    DAYS_OF_WEEK.forEach(day => {
      emptyPlan[day] = { breakfast: null, lunch: null, dinner: null };
    });
    const seededRecipes = generate200Recipes(language);
    emptyPlan["Luni"] = {
      breakfast: seededRecipes[0],
      lunch: seededRecipes[1],
      dinner: null
    };
    return emptyPlan;
  });

  // Dynamic Achievements Checker
  useEffect(() => {
    // 1. Ingredient Specialist (5 or more in fridge)
    if (fridgeIngredients && fridgeIngredients.length >= 5) {
      unlockAchievement("ingredients_5", language === "ro" ? "Regele Ingredientelor 🥕" : "Pantry Overlord 🥕");
    }

    // 2. Favorite Lover (3 or more favorites)
    if (savedRecipes) {
      const favoritesCount = savedRecipes.filter(r => r.isFavorite && r.id.startsWith("rcp-")).length;
      if (favoritesCount >= 3) {
        unlockAchievement("fav_3", language === "ro" ? "Curator de Gusturi ❤️" : "Gourmet Curator ❤️");
      }
    }

    // 3. Planner Master (3 or more planned meals)
    if (mealPlan) {
      let plannedCount = 0;
      Object.values(mealPlan).forEach(dayPlan => {
        if (dayPlan.breakfast) plannedCount++;
        if (dayPlan.lunch) plannedCount++;
        if (dayPlan.dinner) plannedCount++;
      });
      if (plannedCount >= 3) {
        unlockAchievement("plan_3", language === "ro" ? "Arhitect Culinar 📅" : "Culinary Architect 📅");
      }
    }
  }, [fridgeIngredients, savedRecipes, mealPlan]);

  // Dynamic Recipe Translation on Language Change
  useEffect(() => {
    setSavedRecipes(prev => {
      const customRecipes = prev.filter(r => r.id.startsWith("ai-") || r.id.startsWith("custom-"));
      const freshSeed = generate200Recipes(language);
      const favoritesMap = new Set(prev.filter(r => r.isFavorite && r.id.startsWith("rcp-")).map(r => r.id));
      const updatedSeed = freshSeed.map(r => ({
        ...r,
        isFavorite: favoritesMap.has(r.id) || r.isFavorite
      }));
      return [...customRecipes, ...updatedSeed];
    });
  }, [language]);

  // UI Flow & Filtering States
  const [ingredientInput, setIngredientInput] = useState("");
  const [dietFilter, setDietFilter] = useState<string>("All");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState(""); // Live Search filter
  const [useProfilePrefs, setUseProfilePrefs] = useState(false); // Filter by profile preferences
  const [visibleCount, setVisibleCount] = useState(6); // Limit wall of 210 recipes initially

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);

  // Recipe Suggestion Picker State
  const [showRecipeSuggestions, setShowRecipeSuggestions] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState<Array<Recipe & { matchCount: number }>>([]);

  // Cooking Mode step tracking & timer
  const [currentCookingStep, setCurrentCookingStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerMaxSeconds, setTimerMaxSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Meal Planner State
  const [schedulingMeal, setSchedulingMeal] = useState<{ recipe: Recipe; day: string; type: "breakfast" | "lunch" | "dinner" } | null>(null);
  const [plannerRecipeSearch, setPlannerRecipeSearch] = useState("");

  const [selectedPlannerDay, setSelectedPlannerDay] = useState<string>("Luni"); // Mobile day strip select

  // Profile preferences
  const [selectedDiets, setSelectedDiets] = useState<string[]>(["Keto", "Gluten-Free"]);

  // Edit Profile modal
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState<string | null>(null);

  // Current user ID — derived from session (declared early so all functions below can use it)
  const BOGDY_USER_ID = session?.user?.id ?? "";

  // Live profile data from Supabase
  const [userProfile, setUserProfile] = useState<{
    display_name: string;
    username: string;
    avatar_initials: string;
    avatar_color: string;
    avatar_url?: string | null;
    bio?: string | null; // Added bio column support
  } | null>(null);

  const fetchUserProfile = async (userId: string) => {
    // Dynamically check if bio column exists to support gradual migrations
    if (dbHasBioColumn.current === null) {
      try {
        const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
        if (data) {
          dbHasBioColumn.current = "bio" in data;
          dbHasStatsColumns.current = "cooked_count" in data;
        }
      } catch (e) {}
    }

    const columns = dbHasBioColumn.current === true
      ? "display_name, username, avatar_initials, avatar_color, avatar_url, bio"
      : "display_name, username, avatar_initials, avatar_color, avatar_url";

    const { data } = await supabase
      .from("profiles")
      .select(columns)
      .eq("id", userId)
      .single();
    if (data) setUserProfile(data as any);
  };

  // Fetch profile whenever session changes
  useEffect(() => {
    if (BOGDY_USER_ID) fetchUserProfile(BOGDY_USER_ID);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BOGDY_USER_ID]);

  // Load profile from Supabase when edit modal opens
  const openEditProfile = async () => {
    setProfileSaveError(null);
    setEditAvatarPreview(null);
    setEditAvatarFile(null);
    if (BOGDY_USER_ID) {
      // Ensure we know if the bio column exists
      if (dbHasBioColumn.current === null) {
        try {
          const { data } = await supabase.from("profiles").select("*").eq("id", BOGDY_USER_ID).maybeSingle();
          if (data) {
            dbHasBioColumn.current = "bio" in data;
            dbHasStatsColumns.current = "cooked_count" in data;
          }
        } catch (e) {}
      }

      let data: any = null;
      if (dbHasBioColumn.current === true) {
        const res = await supabase
          .from("profiles")
          .select("display_name, username, avatar_url, bio")
          .eq("id", BOGDY_USER_ID)
          .single();
        data = res.data;
      } else {
        const res = await supabase
          .from("profiles")
          .select("display_name, username, avatar_url")
          .eq("id", BOGDY_USER_ID)
          .single();
        data = res.data;
      }

      if (data) {
        setEditName(data.display_name ?? "");
        setEditUsername(data.username ?? "");
        setEditBio(data.bio ?? "");
        // Pre-show existing avatar
        if (data.avatar_url) setEditAvatarPreview(data.avatar_url);
      }
    }
    setShowEditProfile(true);
  };

  // Save profile to Supabase (including avatar upload)
  const handleSaveProfile = async () => {
    if (!BOGDY_USER_ID) return;
    setProfileSaving(true);
    setProfileSaveError(null);

    const avatarInitials = editName
      .split(" ")
      .map(w => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || editName[0]?.toUpperCase() || "U";

    // Upload avatar to Supabase Storage if a new file was selected
    let avatar_url: string | null = null;
    if (editAvatarFile) {
      const ext = editAvatarFile.name.split(".").pop();
      const filePath = `${BOGDY_USER_ID}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, editAvatarFile, { upsert: true, contentType: editAvatarFile.type });

      if (uploadError) {
        setProfileSaveError("Avatar upload failed: " + uploadError.message);
        setProfileSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      avatar_url = urlData.publicUrl + `?t=${Date.now()}`; // cache-busting
    }

     const updatePayload: Record<string, unknown> = {
      display_name: editName.trim(),
      username: editUsername.trim().toLowerCase().replace(/\s/g, ""),
      avatar_initials: avatarInitials,
    };
    if (avatar_url) updatePayload.avatar_url = avatar_url;
    if (dbHasBioColumn.current === true) {
      updatePayload.bio = editBio.trim();
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", BOGDY_USER_ID);

    if (error) {
      setProfileSaveError(
        error.message.includes("unique") ? "Username already taken." : error.message
      );
    } else {
      await fetchUserProfile(BOGDY_USER_ID);
      setShowEditProfile(false);
    }
    setProfileSaving(false);
  };


  // ==========================================
  // NOTIFICATIONS STATE — Supabase powered
  // ==========================================

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Helper: transforma un rand DB in AppNotification local
  const mapDbNotifToApp = (dbNotif: {
    id: string;
    read: boolean;
    created_at: string;
    type: string;
    message?: string;
    friend_requests?: {
      id: string;
      status: string;
      created_at: string;
      profiles?: {
        id: string;
        display_name: string;
        username: string;
        avatar_initials: string;
        avatar_color: string;
      };
    };
  }): AppNotification => ({
    id: dbNotif.id,
    type: dbNotif.type as "friend_request" | "system",
    read: dbNotif.read,
    createdAt: dbNotif.created_at,
    message: dbNotif.message,
    friendRequest: dbNotif.friend_requests ? {
      id: dbNotif.friend_requests.id,
      fromUserId: dbNotif.friend_requests.profiles?.id ?? "",
      fromName: dbNotif.friend_requests.profiles?.display_name ?? "Unknown",
      fromUsername: `@${dbNotif.friend_requests.profiles?.username ?? "unknown"}`,
      fromAvatar: dbNotif.friend_requests.profiles?.avatar_initials ?? "?",
      fromAvatarColor: dbNotif.friend_requests.profiles?.avatar_color ?? "#10b981",
      mutualFriends: 0,
      sentAt: dbNotif.friend_requests.created_at,
      status: dbNotif.friend_requests.status as FriendRequestStatus,
    } : undefined,
  });

  // Fetch initial notifications
  const fetchNotifications = async () => {
    if (!BOGDY_USER_ID) return; // guard: nu trimite cu user_id gol
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        id, read, created_at, type, message,
        friend_requests (
          id, status, created_at,
          profiles:from_user_id (
            id, display_name, username, avatar_initials, avatar_color
          )
        )
      `)
      .eq("user_id", BOGDY_USER_ID)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setNotifications((data as any[]).map(mapDbNotifToApp));
    }
  };


  useEffect(() => {
    if (!BOGDY_USER_ID) return;
    fetchNotifications();

    // Realtime: asculta notificari noi
    const channel = supabase
      .channel(`notifications-realtime-${BOGDY_USER_ID}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${BOGDY_USER_ID}` },
        () => { fetchNotifications(); }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications", filter: `user_id=eq.${BOGDY_USER_ID}` },
        () => { fetchNotifications(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [BOGDY_USER_ID]);

  useEffect(() => {
    if (activeTab === "friends" && BOGDY_USER_ID) {
      fetchFriends();
    }
  }, [activeTab, BOGDY_USER_ID]);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const formatNotifTime = (isoDate: string): string => {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "acum";
    if (mins < 60) return `acum ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `acum ${hours}h`;
    const days = Math.floor(hours / 24);
    return `acum ${days}z`;
  };

  const handleFriendRequestAction = async (notifId: string, action: "accepted" | "declined") => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => {
        if (n.id === notifId && n.friendRequest) {
          return { ...n, read: true, friendRequest: { ...n.friendRequest, status: action } };
        }
        return n;
      })
    );

    // Gaseşte friend_request_id din notificare
    const notif = notifications.find(n => n.id === notifId);
    if (!notif?.friendRequest) return;

    // Actualizeaza in Supabase
    await supabase
      .from("friend_requests")
      .update({ status: action })
      .eq("id", notif.friendRequest.id);

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notifId);

    if (action === "accepted") {
      fetchFriends();
    }
  };

  const markAllNotifsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", BOGDY_USER_ID)
      .eq("read", false);
  };


  // Sync to Local Storage
  useEffect(() => {
    localStorage.setItem("cookbook_recipes", JSON.stringify(savedRecipes));
  }, [savedRecipes]);

  useEffect(() => {
    localStorage.setItem("fridge_ingredients", JSON.stringify(fridgeIngredients));
  }, [fridgeIngredients]);

  useEffect(() => {
    localStorage.setItem("meal_plan", JSON.stringify(mealPlan));
  }, [mealPlan]);

  // Recipe generation loading step simulator (Pot bubbles loader)
  useEffect(() => {
    if (!isGenerating) return;
    setGenerationStep(0);
    const intervals = [1200, 2400, 3600, 4800];
    const timers = intervals.map((time, idx) =>
      setTimeout(() => setGenerationStep(idx + 1), time)
    );
    return () => timers.forEach(clearTimeout);
  }, [isGenerating]);

  // Timer Countdown Logic
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.type = "sine";
              oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
              gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
              oscillator.start();
              setTimeout(() => oscillator.stop(), 500);
            } catch (e) {
              console.log("Audio failed to play", e);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // ==========================================
  // 3. ACTION HANDLERS
  // ==========================================

  // Add tag to Fridge Scanner
  const handleAddIngredient = (name: string) => {
    const formatted = name.trim();
    if (!formatted) return;

    const capitalized = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();

    const isDuplicate = fridgeIngredients.some(i =>
      removeDiacritics(i.toLowerCase()) === removeDiacritics(capitalized.toLowerCase())
    );

    if (isDuplicate) {
      setIngredientInput("");
      return;
    }

    setFridgeIngredients(prev => [...prev, capitalized]);
    setIngredientInput("");
  };

  // Remove tag
  const handleRemoveIngredient = (name: string) => {
    setFridgeIngredients(prev => prev.filter(i => i !== name));
  };

  // Find and show matching recipes from library based on fridge ingredients
  const showRecipePicker = () => {
    if (fridgeIngredients.length === 0) {
      alert(t("alert_no_ingredients"));
      return;
    }

    // Score each recipe by how many fridge ingredients it contains
    const normalizedFridge = fridgeIngredients.map(i => removeDiacritics(i.toLowerCase()));

    const scored = savedRecipes
      .filter(r => !r.id.startsWith("ai-") && !r.id.startsWith("custom-")) // Only library recipes
      .map(recipe => {
        const matchCount = recipe.ingredients.filter(ing =>
          normalizedFridge.some(fi =>
            removeDiacritics(ing.name.toLowerCase()).includes(fi) ||
            fi.includes(removeDiacritics(ing.name.toLowerCase()))
          )
        ).length;
        return { ...recipe, matchCount };
      })
      .filter(r => r.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .slice(0, 6);

    setSuggestedRecipes(scored);
    setShowRecipeSuggestions(true);
  };

  // Generate a fully custom recipe (original logic)
  const generateCustomRecipe = () => {
    setShowRecipeSuggestions(false);
    setIsGenerating(true);

    setTimeout(() => {
      const mainIngr = fridgeIngredients[0];
      const secondIngr = fridgeIngredients[1] || "Garlic";
      const thirdIngr = fridgeIngredients[2] || "Onion";

      const newRecipe: Recipe = {
        id: `custom-${Date.now()}`,
        title: `${mainIngr} & ${secondIngr} Delight`,
        description: `A unique recipe crafted specifically for your ingredients. Perfectly blends the texture of ${mainIngr} with the intense notes of ${secondIngr} and ${thirdIngr}.`,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
        prepTime: 20,
        difficulty: "Easy",
        calories: Math.floor(300 + Math.random() * 200),
        protein: Math.floor(15 + Math.random() * 20),
        carbs: Math.floor(20 + Math.random() * 40),
        fat: Math.floor(10 + Math.random() * 15),
        diet: dietFilter === "All" ? "Balanced" : dietFilter,
        ingredients: [
          { name: mainIngr, amount: "250g", owned: true, category: "Produce" },
          { name: secondIngr, amount: "100g", owned: true, category: "Produce" },
          { name: thirdIngr, amount: "1 piece", owned: true, category: "Produce" },
          { name: "Olive Oil", amount: "2 tbsp", owned: true, category: "Pantry" },
          { name: "Salt & Pepper", amount: "to taste", owned: true, category: "Pantry" }
        ],
        steps: [
          `Prepare and clean your main ingredient: ${mainIngr}. Cut into cooking-sized pieces.`,
          `Finely chop ${secondIngr} and ${thirdIngr} to release their optimal aromas.`,
          `Heat 2 tablespoons of olive oil in a large pan over medium-high heat.`,
          `Add ${secondIngr} and ${thirdIngr} to the pan and sauté for 3 minutes until golden and translucent.`,
          `Add the star ingredient: ${mainIngr}. Fry the mixture, stirring frequently for 8-10 minutes, seasoning with salt and pepper to taste.`,
          `Turn off the heat, garnish with fresh herbs if available, and serve warm!`
        ],
        isFavorite: false
      };

      setSavedRecipes(prev => [newRecipe, ...prev]);
      setIsGenerating(false);
      setActiveRecipe(newRecipe);
    }, 5500);
  };


  // Toggle favorite recipe
  const toggleFavorite = (recipeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedRecipes(prev => prev.map(r => {
      if (r.id === recipeId) {
        return { ...r, isFavorite: !r.isFavorite };
      }
      return r;
    }));
  };

  // Schedule meal
  const scheduleMeal = (day: string, type: "breakfast" | "lunch" | "dinner", recipe: Recipe) => {
    setMealPlan(prev => {
      const updated = { ...prev };
      updated[day] = {
        ...updated[day],
        [type]: recipe
      };
      return updated;
    });
    setSchedulingMeal(null);
  };

  // Remove planned meal
  const removePlannedMeal = (day: string, type: "breakfast" | "lunch" | "dinner", e: React.MouseEvent) => {
    e.stopPropagation();
    setMealPlan(prev => {
      const updated = { ...prev };
      updated[day] = {
        ...updated[day],
        [type]: null
      };
      return updated;
    });
  };

  // Generate Smart Shopping List from Planned Meals
  const shoppingList = useMemo(() => {
    const missingItems: { [name: string]: { name: string; amount: string; category: string; checked: boolean } } = {};

    Object.values(mealPlan).forEach(dayMeals => {
      MEAL_TYPES.forEach(mealType => {
        const recipe = dayMeals[mealType];
        if (recipe) {
          recipe.ingredients.forEach(ingr => {
            const isOwned = fridgeIngredients.some(
              fi => fi.toLowerCase() === ingr.name.toLowerCase()
            );

            if (!isOwned) {
              const key = ingr.name.toLowerCase();
              if (missingItems[key]) {
                missingItems[key].amount = `${missingItems[key].amount} + ${ingr.amount}`;
              } else {
                missingItems[key] = {
                  name: ingr.name,
                  amount: ingr.amount,
                  category: ingr.category,
                  checked: false
                };
              }
            }
          });
        }
      });
    });

    return Object.values(missingItems);
  }, [mealPlan, fridgeIngredients]);

  // State to track checked shopping list items
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<{ [name: string]: boolean }>({});

  const toggleShoppingItem = (name: string) => {
    setCheckedShoppingItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Toggle profile diet selections
  const toggleProfileDiet = (diet: string) => {
    setSelectedDiets(prev => {
      if (prev.includes(diet)) {
        return prev.filter(d => d !== diet);
      } else {
        return [...prev, diet];
      }
    });
  };

  // Buy Shop Item
  const handleBuyItem = (item: any) => {
    if (coins < item.price) return;
    setCoins(c => c - item.price);
    setPurchasedItems(prev => [...prev, item.id]);
  };

  // Equip Badge/Border
  const handleEquipItem = (item: any) => {
    if (item.type === "badge") {
      setActiveBadge(prev => prev === item.id ? "" : item.id);
    } else if (item.type === "border") {
      setActiveBorder(prev => prev === item.id ? "" : item.id);
    }
  };

  // Ref to track if profiles table has stats columns
  const dbHasStatsColumns = React.useRef<boolean | null>(null);
  const dbHasBioColumn = React.useRef<boolean | null>(null);

  const syncStatsToDb = async () => {
    if (!BOGDY_USER_ID) return;

    // Check if columns exist if we haven't checked yet
    if (dbHasStatsColumns.current === null || dbHasBioColumn.current === null) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", BOGDY_USER_ID)
          .maybeSingle();

        if (!error && data) {
          dbHasStatsColumns.current = "cooked_count" in data;
          dbHasBioColumn.current = "bio" in data;
        } else {
          dbHasStatsColumns.current = false;
          dbHasBioColumn.current = false;
        }
      } catch (e) {
        dbHasStatsColumns.current = false;
        dbHasBioColumn.current = false;
      }
    }

    // Only update if columns exist
    if (dbHasStatsColumns.current === true) {
      await supabase.from("profiles").update({
        cooked_count: cookedCount,
        ingredients_count: fridgeIngredients.length,
        coins: coins
      }).eq("id", BOGDY_USER_ID);
    }
  };

  useEffect(() => {
    syncStatsToDb();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookedCount, fridgeIngredients.length, coins, BOGDY_USER_ID]);

  const openAddFriendsModal = () => {
    setSearchFriendNickname("");
    setSearchFriendResults([]);
    setSelectedFriendProfile(null);
    setShowAddFriendsModal(true);
  };

  const handleSearchFriends = async () => {
    if (!searchFriendNickname.trim()) return;
    setSearchingFriend(true);
    try {
      if (dbHasStatsColumns.current === true) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_initials, avatar_color, avatar_url, cooked_count, ingredients_count, coins")
          .ilike("username", `%${searchFriendNickname.trim()}%`);

        if (!error && data) {
          setSearchFriendResults(data.filter(u => u.id !== BOGDY_USER_ID));
          setSearchingFriend(false);
          return;
        }
      }

      // Fallback: select standard columns directly to prevent 400 Bad Request console logs
      const { data: stdData, error: stdError } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_initials, avatar_color, avatar_url")
        .ilike("username", `%${searchFriendNickname.trim()}%`);

      if (!stdError && stdData) {
        const enriched = stdData
          .filter(u => u.id !== BOGDY_USER_ID)
          .map(p => ({
            ...p,
            cooked_count: (p.username.charCodeAt(0) % 15) * 8 + 34,
            ingredients_count: (p.username.charCodeAt(1) % 6) + 3,
            coins: (p.username.charCodeAt(2) % 40) * 10 + 20
          }));
        setSearchFriendResults(enriched);
      }
    } catch (e) {
      console.log("Search error:", e);
    }
    setSearchingFriend(false);
  };

  const selectFriendForComparison = async (friend: any) => {
    setSelectedFriendProfile(friend);
    setActiveFriendshipStatus("none");
    setActiveFriendshipId("");

    if (!BOGDY_USER_ID) return;

    try {
      const { data, error } = await supabase
        .from("friend_requests")
        .select("id, from_user_id, to_user_id, status")
        .or(`and(from_user_id.eq.${BOGDY_USER_ID},to_user_id.eq.${friend.id}),and(from_user_id.eq.${friend.id},to_user_id.eq.${BOGDY_USER_ID})`);

      if (!error && data && data.length > 0) {
        const relation = data[0];
        setActiveFriendshipId(relation.id);
        if (relation.status === "accepted") {
          setActiveFriendshipStatus("friends");
        } else if (relation.status === "pending") {
          if (relation.from_user_id === BOGDY_USER_ID) {
            setActiveFriendshipStatus("pending_sent");
          } else {
            setActiveFriendshipStatus("pending_received");
          }
        }
      }
    } catch (e) {
      console.log("Check friendship error:", e);
    }
  };

  const sendFriendRequest = async (targetId: string) => {
    if (!BOGDY_USER_ID) return;
    try {
      const { data, error } = await supabase
        .from("friend_requests")
        .insert({
          from_user_id: BOGDY_USER_ID,
          to_user_id: targetId,
          status: "pending"
        })
        .select();

      if (!error && data && data.length > 0) {
        setActiveFriendshipId(data[0].id);
        setActiveFriendshipStatus("pending_sent");
      }
    } catch (e) {
      console.log("Send request error:", e);
    }
  };

  const acceptFriendRequestDirect = async (reqId: string, fromUserId: string) => {
    try {
      await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", reqId);

      await supabase.from("notifications").insert({
        user_id: fromUserId,
        type: "system",
        message: `${userProfile?.display_name ?? "Cineva"} a acceptat cererea ta de prietenie! 🎉`
      });

      setActiveFriendshipStatus("friends");
      fetchNotifications();
      fetchFriends();
    } catch (e) {
      console.log("Accept request error:", e);
    }
  };

  const removeFriend = async (reqId: string) => {
    if (!window.confirm(language === "ro" ? "Sigur vrei să elimini această prietenie/cerere?" : "Are you sure you want to remove this friendship/request?")) return;
    try {
      await supabase
        .from("friend_requests")
        .delete()
        .eq("id", reqId);

      setActiveFriendshipStatus("none");
      setActiveFriendshipId("");
      fetchNotifications();
      fetchFriends();
    } catch (e) {
      console.log("Remove friend error:", e);
    }
  };

  const fetchFriends = async () => {
    if (!BOGDY_USER_ID) return;
    setLoadingFriends(true);
    try {
      const { data: reqs, error: reqsError } = await supabase
        .from("friend_requests")
        .select("id, from_user_id, to_user_id, status")
        .or(`from_user_id.eq.${BOGDY_USER_ID},to_user_id.eq.${BOGDY_USER_ID}`)
        .eq("status", "accepted");

      if (reqsError) {
        console.log("friend_requests fetch error:", reqsError);
        throw reqsError;
      }

      if (!reqs || reqs.length === 0) {
        setFriendsList([]);
        setLoadingFriends(false);
        return;
      }

      const friendIds = reqs.map(r => r.from_user_id === BOGDY_USER_ID ? r.to_user_id : r.from_user_id);

      let profilesData: any[] | null = null;
      let profilesError: any = null;

      if (dbHasStatsColumns.current === true && dbHasBioColumn.current === true) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_initials, avatar_color, avatar_url, cooked_count, ingredients_count, coins, bio")
          .in("id", friendIds);
        profilesData = data;
        profilesError = error;
      } else if (dbHasStatsColumns.current === true) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_initials, avatar_color, avatar_url, cooked_count, ingredients_count, coins")
          .in("id", friendIds);
        profilesData = data;
        profilesError = error;
      } else if (dbHasBioColumn.current === true) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_initials, avatar_color, avatar_url, bio")
          .in("id", friendIds);
        profilesData = data;
        profilesError = error;
      } else {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_initials, avatar_color, avatar_url")
          .in("id", friendIds);
        profilesData = data;
        profilesError = error;
      }

      if (profilesError) {
        console.log("profiles fetch error:", profilesError);
        throw profilesError;
      }

      if (profilesData) {
        profilesData = (profilesData as any[]).map(p => ({
          ...p,
          cooked_count: p.cooked_count ?? (p.username?.charCodeAt(0) % 15) * 8 + 34,
          ingredients_count: p.ingredients_count ?? (p.username?.charCodeAt(1) % 6) + 3,
          coins: p.coins ?? (p.username?.charCodeAt(2) % 40) * 10 + 20,
          bio: p.bio ?? ""
        }));
      }

      if (profilesData) {
        const list = reqs.map(rel => {
          const isSender = rel.from_user_id === BOGDY_USER_ID;
          const targetFriendId = isSender ? rel.to_user_id : rel.from_user_id;
          const friendProfile = profilesData!.find(p => p.id === targetFriendId);
          
          if (!friendProfile) return null;

          return {
            friendshipId: rel.id,
            ...friendProfile,
            cooked_count: friendProfile.cooked_count ?? (friendProfile.username?.charCodeAt(0) % 15) * 8 + 34,
            ingredients_count: friendProfile.ingredients_count ?? (friendProfile.username?.charCodeAt(1) % 6) + 3,
            coins: friendProfile.coins ?? (friendProfile.username?.charCodeAt(2) % 40) * 10 + 20
          };
        }).filter(Boolean);

        setFriendsList(list);
      }
    } catch (e) {
      console.log("Fetch friends error, loading fallback mock:", e);
      // Fallback mock friends ONLY if database fails (e.g. network/offline)
      const mockFriends = [
        {
          id: "friend_1",
          friendshipId: "fr_1",
          username: "chef_elena",
          display_name: "Elena Popescu",
          avatar_initials: "EP",
          avatar_color: "#ec4899",
          cooked_count: 54,
          ingredients_count: 12,
          coins: 480,
          bio: "I love baking organic, gluten-free sourdough bread! 🍞✨"
        },
        {
          id: "friend_2",
          friendshipId: "fr_2",
          username: "marius_kitchen",
          display_name: "Marius Ionescu",
          avatar_initials: "MI",
          avatar_color: "#3b82f6",
          cooked_count: 32,
          ingredients_count: 6,
          coins: 150,
          bio: "Passion for quick, nutritious meals and healthy living. 🥗🥑"
        }
      ];
      setFriendsList(mockFriends);
    }
    setLoadingFriends(false);
  };

  // Start active cooking mode
  const startCooking = (recipe: Recipe) => {
    setActiveCookingRecipe(recipe);
    setCurrentCookingStep(0);
    setActiveRecipe(null);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  const handleStepChange = (direction: "next" | "prev") => {
    if (!activeCookingRecipe) return;

    if (direction === "next") {
      if (currentCookingStep < activeCookingRecipe.steps.length - 1) {
        setCurrentCookingStep(prev => prev + 1);

        const nextStepText = activeCookingRecipe.steps[currentCookingStep + 1];
        const minutesMatch = nextStepText.match(/(\d+)\s*minute/);
        if (minutesMatch) {
          const minutes = parseInt(minutesMatch[1]);
          setTimerSeconds(minutes * 60);
          setTimerMaxSeconds(minutes * 60);
          setIsTimerRunning(true);
        } else {
          setTimerSeconds(0);
          setIsTimerRunning(false);
        }
      } else {
        // Recipe successfully completed!
        const completedRecipeName = activeCookingRecipe.title;
        setCompletedRecipeTitle(completedRecipeName);
        setShowSuccessModal(true);
        setCoins(prev => prev + 10);
        
        const newVal = cookedCount + 1;
        setCookedCount(newVal);
        
        // Trigger achievements
        if (newVal >= 1) {
          unlockAchievement("first_cook", language === "ro" ? "Prima Rețetă Gătită 🍳" : "First Cooked Recipe 🍳");
        }
        if (newVal >= 5) {
          unlockAchievement("master_chef_5", language === "ro" ? "Bucătar de Elită 👑" : "Master Chef 👑");
        }
        
        setActiveCookingRecipe(null);
      }
    } else {
      if (currentCookingStep > 0) {
        setCurrentCookingStep(prev => prev - 1);

        const prevStepText = activeCookingRecipe.steps[currentCookingStep - 1];
        const minutesMatch = prevStepText.match(/(\d+)\s*minute/);
        if (minutesMatch) {
          const minutes = parseInt(minutesMatch[1]);
          setTimerSeconds(minutes * 60);
          setTimerMaxSeconds(minutes * 60);
          setIsTimerRunning(true);
        } else {
          setTimerSeconds(0);
          setIsTimerRunning(false);
        }
      }
    }
  };

  // Timer format (MM:SS)
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  // Timer percentage for SVG ring
  const timerProgressOffset = useMemo(() => {
    if (timerMaxSeconds === 0) return 0;
    const progress = (timerSeconds / timerMaxSeconds) * 502;
    return progress;
  }, [timerSeconds, timerMaxSeconds]);

  // Filtered recipes list in dashboard (filters + search query combined + profile preferences)
  const filteredRecipes = useMemo(() => {
    return savedRecipes.filter(recipe => {
      const matchDiet = dietFilter === "All" || 
        (dietFilter === "Favorite" ? !!recipe.isFavorite : recipe.diet.toLowerCase() === dietFilter.toLowerCase());
      const matchDiff = difficultyFilter === "All" || recipe.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

      const cleanSearch = removeDiacritics(searchQuery.toLowerCase());
      const matchSearch = removeDiacritics(recipe.title.toLowerCase()).includes(cleanSearch) ||
        removeDiacritics(recipe.description.toLowerCase()).includes(cleanSearch) ||
        recipe.ingredients.some(ing => removeDiacritics(ing.name.toLowerCase()).includes(cleanSearch));

      const matchProfilePrefs = !useProfilePrefs || selectedDiets.length === 0 || selectedDiets.some(pd => {
        const normRecipeDiet = recipe.diet.toLowerCase();
        const normPref = pd.toLowerCase();
        if (normPref === "gluten-free" || normPref === "fără gluten" || normPref === "sin gluten" || normPref === "glutenfrei" || normPref === "без глютена") {
          return normRecipeDiet.includes("gluten");
        }
        return normRecipeDiet.includes(normPref) || normPref.includes(normRecipeDiet);
      });

      return matchDiet && matchDiff && matchSearch && matchProfilePrefs;
    });
  }, [savedRecipes, dietFilter, difficultyFilter, searchQuery, useProfilePrefs, selectedDiets]);

  // Auth gate: loading spinner sau AuthPage daca nu e logat
  if (authLoading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "var(--surface)"
      }}>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <ChefHat size={48} style={{ color: "var(--primary)", animation: "pulse 1.5s ease-in-out infinite" }} />
          <p style={{ color: "var(--on-surface-variant)", fontWeight: "600" }}>Se încarcă...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  return (
    <div className="app-container">
      {/* ==========================================
         A. DESKTOP SIDEBAR NAVIGATION (Hidden on Mobile)
         ========================================== */}
      <aside className="sidebar">
        <div className="logo-section">
          <ChefHat className="logo-icon" size={32} />
          <span className="logo-text">Culinary Vitality</span>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <button
                className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => { setActiveTab("dashboard"); setActiveCookingRecipe(null); }}
              >
                <LayoutGrid className="nav-icon" size={20} />
                <span>{t("dashboard")}</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "scanner" ? "active" : ""}`}
                onClick={() => { setActiveTab("scanner"); setActiveCookingRecipe(null); }}
              >
                <Refrigerator className="nav-icon" size={20} />
                <span>{t("scanner")}</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "planner" ? "active" : ""}`}
                onClick={() => { setActiveTab("planner"); setActiveCookingRecipe(null); }}
              >
                <Calendar className="nav-icon" size={20} />
                <span>{t("planner")}</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "shopping" ? "active" : ""}`}
                onClick={() => { setActiveTab("shopping"); setActiveCookingRecipe(null); }}
              >
                <ShoppingCart className="nav-icon" size={20} />
                <span>{t("shopping")}</span>
                {shoppingList.length > 0 && (
                  <span style={{
                    marginLeft: "auto",
                    background: "var(--secondary-container)",
                    color: "var(--on-secondary-container)",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "bold"
                  }}>
                    {shoppingList.length}
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "favorites" ? "active" : ""}`}
                onClick={() => { setActiveTab("favorites"); setActiveCookingRecipe(null); }}
              >
                <Heart className="nav-icon" size={20} />
                <span>{language === "ro" ? "Favorite" : "Favorites"}</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => { setActiveTab("notifications"); setActiveCookingRecipe(null); }}
                style={{ position: "relative" }}
              >
                <div style={{ position: "relative", display: "flex" }}>
                  <Bell className="nav-icon" size={20} />
                  {unreadNotifCount > 0 && (
                    <span style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-8px",
                      background: "var(--error)",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "9px",
                      fontWeight: "800",
                    }}>
                      {unreadNotifCount}
                    </span>
                  )}
                </div>
                <span>Notificări</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => { setActiveTab("profile"); setActiveCookingRecipe(null); }}
              >
                <User className="nav-icon" size={20} />
                <span>{t("profile")}</span>
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => { setActiveTab("settings"); setActiveCookingRecipe(null); }}
              >
                <Settings className="nav-icon" size={20} />
                <span>{t("settings")}</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <p>{t("copyright")}</p>
          <p style={{ marginTop: "4px", fontSize: "10px", color: "var(--primary)" }}>{t("brand_sub")}</p>
        </div>
      </aside>

      {/* ==========================================
         B. MOBILE BOTTOM NAVIGATION BAR (Hidden on Desktop)
         ========================================== */}
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => { setActiveTab("dashboard"); setActiveCookingRecipe(null); }}
        >
          <div className={`bnav-circle ${activeTab === "dashboard" ? "bnav-circle-active" : ""}`}>
            <LayoutGrid size={20} />
          </div>
          <span>{t("dashboard")}</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === "scanner" ? "active" : ""}`}
          onClick={() => { setActiveTab("scanner"); setActiveCookingRecipe(null); }}
        >
          <div className={`bnav-circle ${activeTab === "scanner" ? "bnav-circle-active" : ""}`}>
            <Refrigerator size={20} />
          </div>
          <span>{t("scanner")}</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === "planner" ? "active" : ""}`}
          onClick={() => { setActiveTab("planner"); setActiveCookingRecipe(null); }}
        >
          <div className={`bnav-circle ${activeTab === "planner" ? "bnav-circle-active" : ""}`}>
            <Calendar size={20} />
          </div>
          <span>{t("planner")}</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === "shopping" ? "active" : ""}`}
          onClick={() => { setActiveTab("shopping"); setActiveCookingRecipe(null); }}
        >
          <div className={`bnav-circle ${activeTab === "shopping" ? "bnav-circle-active" : ""}`} style={{ position: "relative" }}>
            <ShoppingCart size={20} />
            {shoppingList.length > 0 && (
              <span style={{
                position: "absolute",
                top: "-4px",
                right: "-6px",
                background: "var(--secondary-container)",
                color: "var(--on-secondary-container)",
                borderRadius: "50%",
                padding: "2px 5px",
                fontSize: "8px",
                fontWeight: "bold",
                lineHeight: 1,
              }}>
                {shoppingList.length}
              </span>
            )}
          </div>
          <span>{t("shopping")}</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => { setActiveTab("profile"); setActiveCookingRecipe(null); }}
        >
          <div className={`bnav-circle ${activeTab === "profile" ? "bnav-circle-active" : ""}`}>
            <User size={20} />
          </div>
          <span>{t("profile")}</span>
        </button>

        <button
          className={`bottom-nav-item ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => { setActiveTab("settings"); setActiveCookingRecipe(null); }}
        >
          <div className={`bnav-circle ${activeTab === "settings" ? "bnav-circle-active" : ""}`}>
            <Settings size={20} />
          </div>
          <span>{t("settings")}</span>
        </button>
      </nav>

      {/* ==========================================
         C. MAIN WORKSPACE CONTENT
         ========================================== */}
      <main className="main-content">
        {/* Header bar */}
        <header className="top-header">
          <div className="page-title-container">
            {/* Desktop View: Show active page title */}
            <div className="desktop-only-title">
              {activeTab === "dashboard" && t("active_title_dashboard")}
              {activeTab === "scanner" && t("active_title_scanner")}
              {activeTab === "planner" && t("active_title_planner")}
              {activeTab === "shopping" && t("active_title_shopping")}
              {activeTab === "profile" && t("active_title_profile")}
              {activeTab === "settings" && t("active_title_settings")}
              {activeTab === "notifications" && "Notificări"}
              {activeTab === "friends" && t("active_title_friends")}
            </div>
            {/* Mobile View: Show Culinary Vitality brand logo & title */}
            <div className="mobile-only-brand">
              <ChefHat size={28} className="logo-icon" style={{ color: "var(--primary)" }} />
              <span style={{ color: "var(--primary)", fontWeight: "800" }}>Culinary Vitality</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={openAddFriendsModal}
              title={language === "ro" ? "Caută prieteni" : "Search friends"}
              style={{
                background: "var(--surface-container-high)",
                border: "1px solid var(--outline-variant)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--primary)",
                transition: "all 0.2s ease",
                boxShadow: "var(--shadow-soft-card)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--primary)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface-container-high)";
                e.currentTarget.style.color = "var(--primary)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Search size={20} />
            </button>
          </div>
        </header>

        {/* ==========================================
           1. VIEW: DASHBOARD (fidel redesign-ului mobile)
           ========================================== */}
        {activeTab === "dashboard" && (
          <div className="page-view">
            {/* Salut Section */}
            <section style={{ animation: "fadeInSlide 0.3s ease-out" }}>
              <h2 style={{ fontFamily: "var(--font-title)", fontSize: "24px", fontWeight: "700", color: "var(--on-surface)", marginBottom: "4px" }}>
                {language === "ro" ? "Salut, Chef" : 
                 language === "es" ? "¡Hola, Chef" : 
                 language === "de" ? "Hallo, Chefkoch" : 
                 language === "ru" ? "Привет, шеф-повар" : "Hello, Chef"} {userProfile?.display_name ?? "Chef"}!
              </h2>
              <p style={{ color: "var(--on-surface-variant)", fontSize: "14px" }}>{t("sub_greeting")}</p>
            </section>

            {/* Search Bar & Preference Chips */}
            <section style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ position: "relative", width: "100%" }}>
                <Search
                  size={18}
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--on-surface-variant)" }}
                />
                <input
                  type="text"
                  className="interactive-input"
                  placeholder={t("search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(6); }}
                  style={{ width: "100%", paddingLeft: "42px", borderRadius: "9999px" }}
                />
              </div>

              {/* Scrolling diet selector chips */}
              <div style={{
                display: "flex",
                overflowX: "auto",
                gap: "8px",
                paddingBottom: "4px"
              }} className="hide-scrollbar">
                {[
                  { id: "All", label: language === "ro" ? "Toate" : "All" },
                  { id: "Keto", label: "Keto" },
                  { id: "Vegan", label: "Vegan" },
                  { id: "Gluten-Free", label: language === "ro" ? "Fără Gluten" : "Gluten-Free" },
                  { id: "Favorite", label: language === "ro" ? "Favorite" : "Favorites", isFav: true }
                ].map(chip => {
                  const isSelected = chip.id === "Favorite" ? dietFilter === "Favorite" : dietFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => {
                        setDietFilter(chip.id);
                        setVisibleCount(6);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        border: isSelected ? "1.5px solid var(--primary)" : "1px solid var(--surface-container-high)",
                        background: isSelected ? "var(--primary-container)" : "var(--surface-container-lowest)",
                        color: isSelected ? "var(--on-primary-container)" : "var(--on-surface-variant)",
                        transition: "var(--transition-fast)"
                      }}
                    >
                      {chip.isFav && <Heart size={12} fill={isSelected ? "var(--on-primary-container)" : "none"} style={{ marginRight: "6px", display: "inline" }} />}
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {/* Profile Diet Preference toggle switch */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--surface-container-low)",
                padding: "10px 16px",
                borderRadius: "14px",
                border: "1px solid var(--surface-container-high)"
              }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center", overflow: "hidden" }}>
                  <Sparkles size={14} style={{ color: "var(--secondary-container)", flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface)", whiteSpace: "nowrap" }}>
                    {language === "ro" ? "Filtrează după profil" : "Filter by my profile"}
                  </span>
                  <span style={{ fontSize: "9px", color: "var(--primary)", fontWeight: "800", background: "rgba(16, 185, 129, 0.08)", padding: "2px 6px", borderRadius: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedDiets.map(d => d === "Gluten-Free" ? (language === "ro" ? "Fără Gluten" : "Gluten-Free") : d).join(", ")}
                  </span>
                </div>

                {/* Switch slider */}
                <button
                  onClick={() => {
                    setUseProfilePrefs(!useProfilePrefs);
                    setVisibleCount(6);
                  }}
                  style={{
                    width: "40px",
                    height: "20px",
                    borderRadius: "10px",
                    background: useProfilePrefs ? "var(--primary)" : "var(--outline-variant)",
                    border: "none",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    flexShrink: 0
                  }}
                >
                  <div style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    position: "absolute",
                    top: "3px",
                    left: useProfilePrefs ? "23px" : "3px",
                    transition: "left 0.2s"
                  }} />
                </button>
              </div>
            </section>

            {/* Fridge Banner */}
            <section className="hero-banner">
              <div className="hero-text">
                <h2>{t("banner_title")}</h2>
                <p>{t("banner_desc")}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab("scanner")}
                >
                  {t("banner_btn")}
                </button>
              </div>
              <div className="hero-illustration">🥦</div>
            </section>

            {/* Stats Bento Grid */}
            <section className="stats-row">
              <div
                className="glass-card stat-card"
                onClick={() => setActiveTab("scanner")}
                style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "12px" }}
              >
                <Refrigerator size={20} className="logo-icon" style={{ color: "var(--primary)", marginBottom: "4px" }} />
                <span className="stat-value" style={{ fontSize: "20px" }}>{fridgeIngredients.length}</span>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--on-surface-variant)" }}>{t("stat_ingredients")}</span>
              </div>

              <div
                className="glass-card stat-card"
                onClick={() => { setActiveTab("favorites"); }}
                style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "12px" }}
              >
                <Book size={20} style={{ color: "var(--secondary-container)", marginBottom: "4px" }} />
                <span className="stat-value" style={{ fontSize: "20px" }}>{savedRecipes.filter(r => r.isFavorite).length}</span>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--on-surface-variant)" }}>{t("stat_saved")}</span>
              </div>

              <div
                className="glass-card stat-card"
                onClick={() => setActiveTab("planner")}
                style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "12px" }}
              >
                <CalendarIcon size={20} style={{ color: "var(--tertiary)", marginBottom: "4px" }} />
                <span className="stat-value" style={{ fontSize: "20px" }}>
                  {Object.values(mealPlan).reduce((acc, current) => {
                    let count = 0;
                    if (current.breakfast) count++;
                    if (current.lunch) count++;
                    if (current.dinner) count++;
                    return acc + count;
                  }, 0)}
                </span>
                <span style={{ fontSize: "10px", fontWeight: "600", color: "var(--on-surface-variant)" }}>{t("stat_planned")}</span>
              </div>
            </section>

            {/* Featured Recipe - Chef bogdy's Pick */}
            {searchQuery === "" && dietFilter === "All" && !useProfilePrefs && filteredRecipes.length > 0 && (
              <section className="glass-card" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column", gap: "0", animation: "fadeInSlide 0.3s ease-out" }}>
                <div style={{
                  height: "200px",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 40%, #0d9488 100%)",
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <img
                    src={filteredRecipes[0].image}
                    alt={filteredRecipes[0].title}
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    background: "var(--secondary-container)",
                    color: "var(--on-secondary-container)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "10px",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <Sparkles size={12} /> {language === "ro" ? "RECOMANDAREA ZILEI" : "FEATURED OF THE DAY"}
                  </div>
                  <div style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    width: "100%",
                    height: "80px",
                    background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                  }} />
                </div>
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="recipe-badge" style={{ margin: 0 }}>{filteredRecipes[0].diet}</span>
                    <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--outline)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={12} /> {filteredRecipes[0].prepTime} min</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Flame size={12} /> {filteredRecipes[0].calories} kcal</span>
                    </div>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "16px", fontWeight: "800", color: "var(--on-surface)", margin: "4px 0" }}>
                    {filteredRecipes[0].title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", lineHeight: "1.4" }}>
                    {filteredRecipes[0].description}
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: "8px", width: "100%", borderRadius: "10px", padding: "10px", fontSize: "13px" }}
                    onClick={() => setActiveRecipe(filteredRecipes[0])}
                  >
                    {language === "ro" ? "Deschide rețeta recomandată" : "Open Recommended Recipe"}
                  </button>
                </div>
              </section>
            )}

            <div className="recipe-section-header">
              <h2>{t("explore_header")} ({filteredRecipes.length})</h2>
            </div>

            {/* Recipes Grid */}
            {filteredRecipes.length > 0 ? (
              <>
                <div className="recipes-grid">
                  {filteredRecipes.slice(0, visibleCount).map(recipe => (
                    <div
                      key={recipe.id}
                      className="recipe-card"
                      onClick={() => setActiveRecipe(recipe)}
                    >
                      <div className="recipe-card-img">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                        />
                      </div>
                      <div className="recipe-card-overlay" />

                      <div className="recipe-card-content">
                        <div className="recipe-badge">{recipe.diet}</div>
                        <h3 className="recipe-card-title">{recipe.title}</h3>

                        <div className="recipe-meta-row">
                          <div className="recipe-meta-item">
                            <Clock size={14} />
                            <span>{recipe.prepTime} min</span>
                          </div>
                          <div className="recipe-meta-item">
                            <Flame size={14} />
                            <span>{recipe.calories} kcal</span>
                          </div>
                          <div className="recipe-meta-item" style={{ marginLeft: "auto" }}>
                            <span style={{
                              color: recipe.difficulty === "Easy" ? "var(--primary)" :
                                recipe.difficulty === "Medium" ? "var(--secondary-container)" : "var(--error)",
                              fontWeight: "bold"
                            }}>
                              {recipe.difficulty === "Easy" ? t("diff_easy") :
                                recipe.difficulty === "Medium" ? t("diff_medium") : t("diff_hard")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        className="recipe-card-fav-btn"
                        onClick={(e) => toggleFavorite(recipe.id, e)}
                        style={{ color: recipe.isFavorite ? "var(--error)" : "var(--outline)" }}
                      >
                        <Heart size={16} fill={recipe.isFavorite ? "var(--error)" : "none"} />
                      </button>
                    </div>
                  ))}
                </div>

                {filteredRecipes.length > visibleCount && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: "16px", marginBottom: "24px" }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setVisibleCount(prev => prev + 6)}
                      style={{ padding: "12px 24px", borderRadius: "12px", fontSize: "14px", fontWeight: "700" }}
                    >
                      🔄 {language === "ro" ? "Arată mai multe rețete" : "Load more recipes"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card" style={{ padding: "40px", color: "var(--outline)", textAlign: "center" }}>
                {t("no_recipes")}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
           1.5. VIEW: FAVORITES
           ========================================== */}
        {activeTab === "favorites" && (
          <div className="page-view">
            <section style={{ animation: "fadeInSlide 0.3s ease-out" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-title)", fontSize: "22px", fontWeight: "800", color: "var(--on-surface)" }}>
                    {language === "ro" ? "Rețetele mele favorite" : "My Favorite Recipes"}
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                    {savedRecipes.filter(r => r.isFavorite).length > 0
                      ? `${savedRecipes.filter(r => r.isFavorite).length} ${language === "ro" ? "rețete salvate" : "saved recipes"}`
                      : language === "ro" ? "Nicio rețetă favorită încă" : "No favorites yet"}
                  </p>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: "12px", padding: "8px 16px", borderRadius: "10px" }}
                  onClick={() => setActiveTab("dashboard")}
                >
                  {language === "ro" ? "Explorează rețete" : "Explore recipes"}
                </button>
              </div>
            </section>

            {savedRecipes.filter(r => r.isFavorite).length > 0 ? (
              <div className="recipes-grid">
                {savedRecipes.filter(r => r.isFavorite).map(recipe => (
                  <div
                    key={recipe.id}
                    className="recipe-card"
                    onClick={() => setActiveRecipe(recipe)}
                  >
                    <div className="recipe-card-img">
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                      />
                    </div>
                    <div className="recipe-card-overlay" />

                    <div className="recipe-card-content">
                      <div className="recipe-badge">{recipe.diet}</div>
                      <h3 className="recipe-card-title">{recipe.title}</h3>

                      <div className="recipe-meta-row">
                        <div className="recipe-meta-item">
                          <Clock size={14} />
                          <span>{recipe.prepTime} min</span>
                        </div>
                        <div className="recipe-meta-item">
                          <Flame size={14} />
                          <span>{recipe.calories} kcal</span>
                        </div>
                        <div className="recipe-meta-item" style={{ marginLeft: "auto" }}>
                          <span style={{
                            color: recipe.difficulty === "Easy" ? "var(--primary)" :
                              recipe.difficulty === "Medium" ? "var(--secondary-container)" : "var(--error)",
                            fontWeight: "bold"
                          }}>
                            {recipe.difficulty === "Easy" ? t("diff_easy") :
                              recipe.difficulty === "Medium" ? t("diff_medium") : t("diff_hard")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Unfavorite button */}
                    <button
                      className="recipe-card-fav-btn"
                      onClick={(e) => toggleFavorite(recipe.id, e)}
                      style={{ color: "var(--error)" }}
                    >
                      <Heart size={16} fill="var(--error)" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card" style={{ padding: "60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <Heart size={48} style={{ color: "var(--outline-variant)" }} />
                <h3 style={{ color: "var(--on-surface)", fontFamily: "var(--font-title)" }}>
                  {language === "ro" ? "Nicio rețetă favorită" : "No favorites yet"}
                </h3>
                <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", maxWidth: "340px" }}>
                  {language === "ro"
                    ? "Apasă iconița ❤️ pe orice rețetă din Dashboard pentru a o salva aici."
                    : "Tap the ❤️ icon on any recipe in the Dashboard to save it here."}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setActiveTab("dashboard")}
                >
                  {language === "ro" ? "Mergi la Dashboard" : "Go to Dashboard"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
           2. VIEW: FRIDGE SCANNER (fidel redesign-ului mobile)
           ========================================== */}
        {activeTab === "scanner" && !isGenerating && (
          <div className="page-view">
            {/* Title & Description */}
            <section>
              <h2 style={{ fontFamily: "var(--font-title)", fontSize: "22px", fontWeight: "700", color: "var(--on-surface)", marginBottom: "4px" }}>
                {t("scanner_title")}
              </h2>
              <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", lineHeight: "1.4" }}>
                {t("scanner_desc")}
              </p>
            </section>

            {/* Input & Add Action */}
            <section style={{ display: "flex", gap: "12px" }}>
              <div style={{ position: "relative", flexGrow: 1 }}>
                <Search
                  size={18}
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--outline)" }}
                />
                <input
                  type="text"
                  className="interactive-input"
                  placeholder={t("input_placeholder")}
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  style={{ width: "100%", paddingLeft: "42px", borderRadius: "12px" }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddIngredient(ingredientInput); } }}
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={() => handleAddIngredient(ingredientInput)}
                style={{ padding: "0 20px", borderRadius: "12px", display: "flex", gap: "4px" }}
              >
                <Plus size={16} /> {t("add_btn")}
              </button>
            </section>

            {/* Quick Suggestions */}
            <section>
              <h3 style={{ fontFamily: "var(--font-body)", fontSize: "14px", fontWeight: "600", color: "var(--on-surface)", marginBottom: "8px" }}>
                {t("suggestions_lbl")}
              </h3>
              <div className="suggestions-list">
                {WORLD_INGREDIENTS.slice(0, 24).filter(i => !fridgeIngredients.includes(i)).map(ingr => (
                  <button
                    key={ingr}
                    className="suggestion-pill"
                    onClick={() => handleAddIngredient(ingr)}
                  >
                    + {translateIngredientName(ingr, language)}
                  </button>
                ))}
              </div>
            </section>

            {/* Current Fridge container */}
            <section className="glass-card" style={{ padding: "16px", background: "var(--surface-container-lowest)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontFamily: "var(--font-title)", fontSize: "18px", fontWeight: "700", color: "var(--on-surface)", marginBottom: "16px" }}>
                {t("fridge_title")} ({fridgeIngredients.length} {t("stat_ingredients").toLowerCase()}):
              </h3>

              <div className="tags-container" style={{ minHeight: "80px", background: "transparent", border: "none", padding: 0, marginBottom: 0 }}>
                {fridgeIngredients.length > 0 ? (
                  fridgeIngredients.map(tag => (
                    <div
                      key={tag}
                      className="ingredient-tag"
                      style={{ background: "var(--primary-container)", color: "var(--on-primary-container)", border: "none" }}
                    >
                      {translateIngredientName(tag, language)}
                      <button className="tag-delete-btn" onClick={() => handleRemoveIngredient(tag)}>
                        <X size={13} style={{ color: "var(--on-primary-container)" }} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="tags-placeholder">
                    <Info size={16} style={{ marginRight: "8px", color: "var(--primary)" }} />
                    {t("fridge_empty")}
                  </div>
                )}
              </div>
            </section>

            {/* Filters Details Group */}
            <details
              className="glass-card"
              style={{ background: "var(--surface-container-lowest)", padding: 0, overflow: "hidden" }}
              open
            >
              <summary style={{ padding: "16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "var(--font-title)", fontSize: "16px", fontWeight: "700" }}>
                {t("pref_title")}
                <ChevronRight className="nav-icon" size={18} style={{ transform: "rotate(90deg)" }} />
              </summary>

              <div style={{ padding: "0 16px 16px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <h4 style={{ fontSize: "12px", fontWeight: "600", color: "var(--on-surface-variant)", marginBottom: "8px" }}>{t("pref_diet_type")}</h4>
                  <div className="option-chips">
                    {["All", "Keto", "Vegan", "Gluten-Free"].map(diet => (
                      <button
                        key={diet}
                        className={`option-chip ${dietFilter === diet ? "selected" : ""}`}
                        onClick={() => setDietFilter(diet)}
                      >
                        {diet === "All" ? t("standard_diet") : diet}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: "12px", fontWeight: "600", color: "var(--on-surface-variant)", marginBottom: "8px" }}>{t("pref_difficulty")}</h4>
                  <div className="grid grid-cols-3 gap-xs" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {["All", "Easy", "Medium"].map(diff => (
                      <button
                        key={diff}
                        className={`option-chip ${difficultyFilter === diff ? "selected" : ""}`}
                        onClick={() => setDifficultyFilter(diff)}
                        style={{ fontSize: "12px" }}
                      >
                        {diff === "All" ? t("diff_any") :
                          diff === "Easy" ? t("diff_easy") : t("diff_medium")}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", background: "var(--surface-container)", padding: "12px", borderRadius: "12px", alignItems: "flex-start" }}>
                  <Info size={18} style={{ color: "var(--secondary-container)", flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", lineHeight: "1.4" }}>
                    {t("ai_info")}
                  </p>
                </div>
              </div>
            </details>

            {/* Generator Button Row (Thumb Zone) */}
            <div style={{ marginTop: "8px", marginBottom: "20px" }}>
              <button
                className="btn btn-accent"
                style={{
                  width: "100%",
                  padding: "16px",
                  fontSize: "18px",
                  borderRadius: "16px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  borderBottom: "4px solid rgba(133, 83, 0, 0.2)"
                }}
                onClick={showRecipePicker}
                disabled={fridgeIngredients.length === 0}
              >
                <Sparkles size={20} /> {t("generate_btn")}
              </button>
            </div>
          </div>
        )}

        {/* Generator BOILING POT Loading Animation Screen */}
        {isGenerating && (
          <div className="cooking-loader-container">
            <div className="pot-loader">
              <div className="pot-bubble bubble-1">🥦</div>
              <div className="pot-bubble bubble-2">🍅</div>
              <div className="pot-bubble bubble-3">🌿</div>
              <div className="pot-body"></div>
              <div className="pot-handle-l"></div>
              <div className="pot-handle-r"></div>
              <div className="pot-lid"></div>
              <div className="pot-shadow"></div>
            </div>

            <h3 className="cooking-loader-title">
              {generationStep === 0 && t("loader_title_0")}
              {generationStep === 1 && t("loader_title_1")}
              {generationStep === 2 && t("loader_title_2")}
              {generationStep === 3 && t("loader_title_3")}
              {generationStep === 4 && t("loader_title_4")}
            </h3>

            <p className="cooking-loader-subtitle">
              {generationStep === 0 && t("loader_sub_0")}
              {generationStep === 1 && t("loader_sub_1")}
              {generationStep === 2 && t("loader_sub_2")}
              {generationStep === 3 && t("loader_sub_3")}
              {generationStep === 4 && t("loader_sub_4")}
            </p>
          </div>
        )}

        {/* ==========================================
           3. VIEW: PLANNER (WEEKLY MEAL PLANNER - fidel redesigned mobile)
           ========================================== */}
        {activeTab === "planner" && (
          <div className="page-view">
            {/* Header info */}
            <div style={{ animation: "fadeInSlide 0.3s ease-out" }}>
              <h1 style={{ fontFamily: "var(--font-title)", fontSize: "24px", fontWeight: "700", color: "var(--on-surface)", marginBottom: "4px" }}>
                {t("planner_title")}
              </h1>
              <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", marginBottom: "16px", lineHeight: "1.4" }}>
                {t("planner_desc")}
              </p>

              <button
                className="btn btn-secondary"
                style={{ padding: "8px 16px", borderRadius: "20px", display: "inline-flex", gap: "6px", fontSize: "13px" }}
                onClick={() => {
                  const emptyPlan: MealPlan = {};
                  DAYS_OF_WEEK.forEach(day => {
                    emptyPlan[day] = { breakfast: null, lunch: null, dinner: null };
                  });
                  setMealPlan(emptyPlan);
                }}
              >
                <Trash size={14} /> {t("clear_plan")}
              </button>
            </div>

            {/* Adaptive Weekly Calendar Strip (Horizontal on Mobile, Grid on Desktop) */}
            <div className="planner-adaptive-wrapper">
              {/* Desktop Grid View */}
              <div className="planner-desktop-grid">
                <div className="planner-grid">
                  {DAYS_OF_WEEK.map(day => {
                    const dayMeals = mealPlan[day] || { breakfast: null, lunch: null, dinner: null };
                    const isToday = new Date().toLocaleDateString("ro-RO", { weekday: "long" }).toLowerCase() ===
                      (day === "Miercuri" ? "miercuri" :
                        day === "Marți" ? "marți" :
                          day === "Sâmbătă" ? "sâmbătă" :
                            day === "Duminică" ? "duminică" :
                              day.toLowerCase());

                    return (
                      <div key={day} className={`planner-day-card ${isToday ? "today" : ""}`}>
                        <div className="day-header" style={{ color: isToday ? "var(--primary)" : "var(--on-surface)" }}>
                          {t(day)}
                        </div>
                        <div className="day-date">{isToday ? t("today_label") : t("scheduled_label")}</div>

                        <div className="day-meals-container">
                          {MEAL_TYPES.map(mealType => {
                            const recipe = dayMeals[mealType];
                            const mealLabel = mealType === "breakfast" ? t("mic_dejun") :
                              mealType === "lunch" ? t("pranz") : t("cina");

                            return (
                              <div key={mealType} className="meal-slot">
                                <span className="meal-slot-label">{mealLabel}</span>
                                {recipe ? (
                                  <div
                                    className="meal-item-card"
                                    onClick={() => setActiveRecipe(recipe)}
                                  >
                                    {recipe.title}
                                    <button
                                      className="meal-remove-btn"
                                      onClick={(e) => removePlannedMeal(day, mealType, e)}
                                    >
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    className="meal-add-btn"
                                    onClick={() => {
                                      setSchedulingMeal({ recipe: savedRecipes[0], day, type: mealType });
                                    }}
                                  >
                                    <Plus size={10} /> {t("plan_btn")}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Horizontal Snap Strip View */}
              <div className="planner-mobile-strip-layout">
                <div
                  style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "10px",
                    paddingBottom: "10px",
                    marginBottom: "20px"
                  }}
                  className="hide-scrollbar"
                >
                  {DAYS_OF_WEEK.map(day => {
                    const hasMeals = mealPlan[day]?.breakfast || mealPlan[day]?.lunch || mealPlan[day]?.dinner;
                    const isSelected = selectedPlannerDay === day;
                    const isToday = new Date().toLocaleDateString("ro-RO", { weekday: "long" }).toLowerCase() ===
                      (day === "Miercuri" ? "miercuri" :
                        day === "Marți" ? "marți" :
                          day === "Sâmbătă" ? "sâmbătă" :
                            day === "Duminică" ? "duminică" :
                              day.toLowerCase());

                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedPlannerDay(day)}
                        className={`planner-day-pill-item ${isSelected ? "active" : ""}`}
                        style={{
                          flexShrink: 0,
                          width: "96px",
                          padding: "12px 8px",
                          borderRadius: "14px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          position: "relative",
                          border: isToday ? "1px solid var(--primary)" : "1px solid var(--surface-container-high)",
                          background: isSelected ? "var(--primary)" : "var(--surface-container-low)",
                          color: isSelected ? "var(--on-primary)" : "var(--on-surface)"
                        }}
                      >
                        {hasMeals && (
                          <div
                            style={{
                              position: "absolute",
                              top: "6px",
                              right: "6px",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "var(--secondary-container)"
                            }}
                          />
                        )}
                        <span style={{ fontSize: "14px", fontWeight: "700", marginBottom: "2px" }}>
                          {t(day).slice(0, 3)}
                        </span>
                        <span style={{ fontSize: "9px", opacity: 0.8 }}>
                          {isToday ? t("today_label") : t("scheduled_label")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Day Meals Container below selection */}
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--surface-container-lowest)" }}>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "16px", fontWeight: "700", color: "var(--on-surface)" }}>
                    {t("day_planned_meals", { day: t(selectedPlannerDay) })}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {MEAL_TYPES.map(mealType => {
                      const recipe = mealPlan[selectedPlannerDay]?.[mealType];
                      const mealLabel = mealType === "breakfast" ? t("mic_dejun") :
                        mealType === "lunch" ? t("pranz") : t("cina");

                      return (
                        <div key={mealType} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--outline)" }}>
                            {mealLabel}
                          </span>

                          {recipe ? (
                            <div
                              className="meal-item-card"
                              onClick={() => setActiveRecipe(recipe)}
                              style={{ padding: "12px 14px", fontSize: "13px" }}
                            >
                              {recipe.title}
                              <button
                                className="meal-remove-btn"
                                onClick={(e) => removePlannedMeal(selectedPlannerDay, mealType, e)}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="meal-add-btn"
                              onClick={() => {
                                setSchedulingMeal({ recipe: savedRecipes[0], day: selectedPlannerDay, type: mealType });
                              }}
                              style={{ padding: "10px" }}
                            >
                              <Plus size={12} /> {t("plan_meal_specific", { mealLabel })}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick help banner */}
            <div className="glass-card" style={{ display: "flex", gap: "16px", padding: "20px", alignItems: "center", marginTop: "10px" }}>
              <ShoppingCart size={24} style={{ color: "var(--primary)" }} />
              <div>
                <h4 style={{ fontFamily: "var(--font-title)", fontSize: "16px", fontWeight: "700" }}>
                  {t("help_banner_title")}
                </h4>
                <p style={{ color: "var(--on-surface-variant)", fontSize: "13px", marginTop: "2px" }}>
                  {t("help_banner_desc")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
           4. VIEW: SHOPPING LIST
           ========================================== */}
        {activeTab === "shopping" && (
          <div className="page-view">
            {shoppingList.length > 0 ? (
              <div className="shopping-layout">
                {/* Left: Interactive list check off */}
                <div className="glass-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ fontFamily: "var(--font-title)", fontSize: "18px", fontWeight: "700" }}>
                      {t("to_buy_title")}
                    </h2>
                    <span style={{ fontSize: "12px", background: "rgba(0,108,73,0.06)", color: "var(--primary)", padding: "4px 10px", borderRadius: "var(--radius-full)", fontWeight: "bold" }}>
                      {t("items_remaining", { count: shoppingList.filter(item => !checkedShoppingItems[item.name]).length })}
                    </span>
                  </div>

                  {/* Group items by category */}
                  {Array.from(new Set(shoppingList.map(item => item.category))).map(category => {
                    const categoryItems = shoppingList.filter(item => item.category === category);
                    return (
                      <div key={category} className="shopping-category-group">
                        <h4 className="shopping-category-title">
                          <span>🍉</span> {getCategoryTranslation(category)}
                        </h4>

                        <div className="shopping-items-list">
                          {categoryItems.map(item => {
                            const isChecked = !!checkedShoppingItems[item.name];
                            return (
                              <div
                                key={item.name}
                                className={`shopping-item-checkbox ${isChecked ? "checked" : ""}`}
                                onClick={() => toggleShoppingItem(item.name)}
                              >
                                <div className="checkbox-custom">
                                  {isChecked && <Check size={14} />}
                                </div>
                                <span className="shopping-item-label">{translateIngredientName(item.name, language)}</span>
                                <span className="shopping-item-qty">{item.amount.split("+")[0].trim()}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Shopping assistant and utility */}
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h3 className="filter-section-title">{t("smart_assistant_title")}</h3>

                  <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", lineHeight: "1.4" }}>
                    {t("smart_assistant_desc")}
                  </p>

                  <button
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    onClick={() => {
                      const itemsToAdd = shoppingList
                        .filter(item => checkedShoppingItems[item.name])
                        .map(item => item.name);

                      if (itemsToAdd.length === 0) {
                        alert(t("alert_check_items"));
                        return;
                      }

                      setFridgeIngredients(prev => {
                        const newIngredients = [...prev];
                        itemsToAdd.forEach(item => {
                          const cap = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase();
                          if (!newIngredients.includes(cap)) {
                            newIngredients.push(cap);
                          }
                        });
                        return newIngredients;
                      });

                      setCheckedShoppingItems({});
                      alert(t("alert_items_added", { items: itemsToAdd.map(i => translateIngredientName(i, language)).join(", ") }));
                    }}
                  >
                    {t("move_checked_btn")}
                  </button>

                  <div style={{ padding: "12px", background: "var(--surface-container-low)", border: "1px dashed var(--outline-variant)", borderRadius: "var(--radius-md)", textAlign: "center" }}>
                    <p style={{ fontSize: "12px", color: "var(--outline)" }}>
                      {t("shopping_tip")}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: "60px", textAlign: "center", color: "var(--outline)", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <ShoppingCart size={48} style={{ color: "var(--outline-variant)" }} />
                <h3 style={{ color: "var(--on-surface)" }}>{t("shopping_empty_title")}</h3>
                <p style={{ maxWidth: "420px", fontSize: "14px", lineHeight: "1.4" }}>
                  {t("shopping_empty_desc")}
                </p>
                <button className="btn btn-primary" onClick={() => setActiveTab("planner")}>
                  {t("go_to_planner_btn")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
           4.5. VIEW: NOTIFICATIONS
           ========================================== */}
        {activeTab === "notifications" && (
          <div className="page-view">
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", animation: "fadeInSlide 0.3s ease-out" }}>
              <div>
                <h2 style={{ fontFamily: "var(--font-title)", fontSize: "22px", fontWeight: "800", color: "var(--on-surface)" }}>
                  Notificări
                </h2>
                <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                  {unreadNotifCount > 0 ? `${unreadNotifCount} necitite` : "Toate citite"}
                </p>
              </div>
              {unreadNotifCount > 0 && (
                <button
                  onClick={markAllNotifsRead}
                  style={{
                    background: "none",
                    border: "1px solid var(--outline-variant)",
                    borderRadius: "var(--radius-md)",
                    padding: "7px 14px",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "var(--primary)",
                    cursor: "pointer",
                    fontFamily: "var(--font-title)",
                    transition: "var(--transition-fast)",
                  }}
                >
                  Marchează toate citite
                </button>
              )}
            </div>

            {/* Notificări list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {notifications.length === 0 ? (
                <div className="glass-card" style={{ padding: "60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <Bell size={48} style={{ color: "var(--outline-variant)" }} />
                  <h3 style={{ color: "var(--on-surface)", fontFamily: "var(--font-title)" }}>Nicio notificare</h3>
                  <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", maxWidth: "340px" }}>
                    Când cineva îți trimite o cerere de prietenie sau împărtășește o rețetă, vei vedea aici.
                  </p>
                </div>
              ) : (
                notifications.map(notif => {
                  if (notif.type === "system") {
                    return (
                      <div
                        key={notif.id}
                        className={`notif-card ${!notif.read ? "notif-unread" : ""}`}
                      >
                        {!notif.read && <div className="notif-unread-dot" />}
                        <div className="notif-card-body">
                          <div className="notif-avatar" style={{ background: "rgba(16, 185, 129, 0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                            🔔
                          </div>
                          <div className="notif-text-block">
                            <div className="notif-main-line">
                              <span className="notif-action-text" style={{ color: "var(--on-surface)", fontWeight: "600", fontSize: "14px" }}>{notif.message}</span>
                            </div>
                            <div className="notif-meta-line">
                              <span className="notif-time">{formatNotifTime(notif.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  if (notif.type === "friend_request" && notif.friendRequest) {
                    const fr = notif.friendRequest;
                    const isPending = fr.status === "pending";
                    return (
                      <div
                        key={notif.id}
                        className={`notif-card ${!notif.read ? "notif-unread" : ""}`}
                      >
                        {/* Unread dot */}
                        {!notif.read && <div className="notif-unread-dot" />}

                        <div className="notif-card-body">
                          {/* Avatar */}
                          <div
                            className="notif-avatar"
                            style={{ background: fr.fromAvatarColor }}
                          >
                            {fr.fromAvatar}
                          </div>

                          {/* Text content */}
                          <div className="notif-text-block">
                            <div className="notif-main-line">
                              <span className="notif-sender-name">{fr.fromName}</span>
                              <span className="notif-action-text"> ți-a trimis o cerere de prietenie</span>
                            </div>
                            <div className="notif-meta-line">
                              <span className="notif-username">{fr.fromUsername}</span>
                              {fr.mutualFriends > 0 && (
                                <>
                                  <span className="notif-dot-sep">·</span>
                                  <span className="notif-mutual">{fr.mutualFriends} prieteni comuni</span>
                                </>
                              )}
                              <span className="notif-dot-sep">·</span>
                              <span className="notif-time">{formatNotifTime(notif.createdAt)}</span>
                            </div>

                            {/* Action buttons */}
                            {isPending ? (
                              <div className="notif-actions">
                                <button
                                  className="notif-btn-accept"
                                  onClick={() => handleFriendRequestAction(notif.id, "accepted")}
                                >
                                  <Check size={14} /> Acceptă
                                </button>
                                <button
                                  className="notif-btn-decline"
                                  onClick={() => handleFriendRequestAction(notif.id, "declined")}
                                >
                                  <X size={14} /> Refuză
                                </button>
                              </div>
                            ) : (
                              <div className="notif-status-chip">
                                {fr.status === "accepted" ? (
                                  <span className="notif-chip-accepted"><Check size={12} /> Acceptat</span>
                                ) : (
                                  <span className="notif-chip-declined"><X size={12} /> Refuzat</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })
              )}
            </div>

            {/* Supabase coming soon notice */}
            <div style={{ padding: "14px 18px", borderRadius: "var(--radius-md)", background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.18)", display: "flex", alignItems: "center", gap: "12px" }}>
              <Bell size={16} style={{ color: "var(--primary)", flexShrink: 0 }} />
              <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: 0, lineHeight: "1.5" }}>
                <strong>Coming soon:</strong> Notificările în timp real vor fi activate prin <strong>Supabase Realtime</strong> — friend requests, rețete împărtășite și achievement-uri.
              </p>
            </div>
          </div>
        )}

        {/* ==========================================
           5. VIEW: PROFILE (fidel redesigned mobile)
           ========================================== */}
        {activeTab === "profile" && (
          <div className="page-view" style={{ background: "var(--surface-container-low)" }}>
            {/* PROFILE HEADER CARD */}
            <div className="glass-card profile-card-header" style={{ border: "none" }}>
              {/* Avatar with Equipped Borders */}
              {(() => {
                const borderItem = SHOP_ITEMS.find(item => item.id === activeBorder);
                const borderStyle = borderItem?.type === "border" ? borderItem.displayStyle : {};
                const badgeItem = SHOP_ITEMS.find(item => item.id === activeBadge);
                const badgeEmoji = badgeItem?.type === "badge" ? badgeItem.displayValue : "";
                const hasLegendTitle = purchasedItems.includes("title_legend");
                const displayTitleText = hasLegendTitle 
                  ? (language === "ro" ? "🏆 Gourmet Legendar 🏆" : "🏆 Legendary Gourmet 🏆") 
                  : (userProfile?.username ? `@${userProfile.username}` : "Level 12 • Master Sous-Chef");

                return (
                  <>
                    <div className="profile-avatar-container" style={{
                      position: "relative",
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      background: activeBorder ? "transparent" : "var(--surface-container-high)",
                      ...borderStyle
                    }}>
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt="avatar"
                          className="profile-avatar-img"
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="profile-avatar-img" style={{
                          background: userProfile?.avatar_color ?? "var(--primary)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "36px", fontWeight: "800", color: "#fff",
                          width: "100%", height: "100%", borderRadius: "50%"
                        }}>
                          {userProfile?.avatar_initials ?? "C"}
                        </div>
                      )}
                      <div className="profile-badge-crown">
                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>👑</span>
                      </div>
                    </div>
                    
                    <h2 className="profile-name" style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px" }}>
                      {userProfile?.display_name ?? "Chef"} <span style={{ fontSize: "20px" }}>{badgeEmoji}</span>
                    </h2>
                    
                    <div className="profile-rank" style={{ color: hasLegendTitle ? "#ffa000" : "var(--on-surface-variant)", fontWeight: hasLegendTitle ? "800" : "500" }}>
                      <span>⭐</span> {displayTitleText}
                    </div>

                    {userProfile?.bio && (
                      <p style={{
                        marginTop: "10px",
                        fontSize: "13px",
                        color: "var(--on-surface-variant)",
                        fontStyle: "italic",
                        maxWidth: "320px",
                        textAlign: "center",
                        lineHeight: "1.4",
                        background: "var(--surface-container-low)",
                        padding: "6px 14px",
                        borderRadius: "12px",
                        border: "1px solid var(--outline-variant)",
                        wordBreak: "break-word"
                      }}>
                        "{userProfile.bio}"
                      </p>
                    )}
                  </>
                );
              })()}

              <button
                className="btn btn-primary"
                style={{ marginTop: "16px", borderRadius: "20px", padding: "8px 24px" }}
                onClick={() => openEditProfile()}
              >
                Edit Profile
              </button>
            </div>

            {/* COIN WALLET CARD */}
            <div className="glass-card wallet-card animate-pulse" style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              background: "linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 152, 0, 0.15))",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(255, 193, 7, 0.3)",
              margin: "16px 0 8px 0"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "32px", animation: "bounce 2s infinite" }}>🪙</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {language === "ro" ? "Sold Monede" : "Coin Balance"}
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: "900", color: "#e65100", lineHeight: "1.2" }}>{coins} Coins</div>
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "#e65100", fontWeight: "800", background: "rgba(230,81,0,0.08)", padding: "4px 10px", borderRadius: "12px" }}>
                {language === "ro" ? "Magazin activ!" : "Store active!"}
              </div>
            </div>

            {/* GAMIFICATION SUB-TABS SELECTOR */}
            <div className="profile-subtabs-nav" style={{
              display: "flex",
              gap: "8px",
              background: "var(--surface-container-high)",
              padding: "4px",
              borderRadius: "24px",
              margin: "16px 0",
              border: "1px solid var(--outline-variant)"
            }}>
              <button 
                onClick={() => setProfileSubTab("stats")}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "20px",
                  border: "none",
                  background: profileSubTab === "stats" ? "var(--primary)" : "transparent",
                  color: profileSubTab === "stats" ? "var(--on-primary)" : "var(--on-surface-variant)",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px"
                }}
              >
                📊 {language === "ro" ? "Statistici" : "Stats"}
              </button>
              <button 
                onClick={() => setProfileSubTab("achievements")}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "20px",
                  border: "none",
                  background: profileSubTab === "achievements" ? "var(--primary)" : "transparent",
                  color: profileSubTab === "achievements" ? "var(--on-primary)" : "var(--on-surface-variant)",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px"
                }}
              >
                🏆 {language === "ro" ? "Realizări" : "Achievements"}
              </button>
              <button 
                onClick={() => setProfileSubTab("shop")}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: "20px",
                  border: "none",
                  background: profileSubTab === "shop" ? "var(--primary)" : "transparent",
                  color: profileSubTab === "shop" ? "var(--on-primary)" : "var(--on-surface-variant)",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px"
                }}
              >
                🛒 {language === "ro" ? "Magazin" : "Shop"}
              </button>
            </div>

            {/* TAB CONTENT: STATS */}
            {profileSubTab === "stats" && (
              <>
                {/* Statisticile Mele */}
                <div>
                  <div className="section-subtitle-row">
                    <h3>{t("stats_section")}</h3>
                  </div>
                  <div className="profile-stat-box">
                    <div className="profile-stat-item">
                      <div className="profile-stat-icon">
                        <BookOpen size={18} />
                      </div>
                      <div className="profile-stat-val">{cookedCount + 142}</div>
                      <div className="profile-stat-lbl">{t("stats_cooked")}</div>
                    </div>

                    <div className="profile-stat-item">
                      <div className="profile-stat-icon">
                        <Refrigerator size={18} />
                      </div>
                      <div className="profile-stat-val">{fridgeIngredients.length}</div>
                      <div className="profile-stat-lbl">{t("stat_ingredients")}</div>
                    </div>
                  </div>
                </div>

                {/* Preferințe Dietetice */}
                <div>
                  <div className="section-subtitle-row">
                    <h3>{t("diet_section")}</h3>
                    <button className="section-subtitle-action" onClick={() => alert(t("settings_alert"))}>Edit</button>
                  </div>

                  <div className="diet-pills-row">
                    {["Keto", "Vegan", "Fără Gluten", "Paleo"].map(diet => {
                      const isActive = selectedDiets.includes(diet) || (diet === "Fără Gluten" && selectedDiets.includes("Gluten-Free"));
                      const key = diet === "Fără Gluten" ? "Gluten-Free" : diet;
                      const displayDiet = diet === "Fără Gluten" ? (language === "ro" ? "Fără Gluten" : language === "es" ? "Sin Gluten" : language === "ru" ? "Без глютена" : language === "de" ? "Glutenfrei" : "Gluten-Free") : diet;

                      return (
                        <button
                          key={diet}
                          className={`diet-pill ${isActive ? "active" : "inactive"}`}
                          onClick={() => toggleProfileDiet(key)}
                        >
                          {isActive && <Check size={14} style={{ marginRight: "2px" }} />}
                          {displayDiet}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Setări Cont Group */}
                <div>
                  <div className="section-subtitle-row">
                    <h3>{t("settings_section")}</h3>
                  </div>

                  <div className="settings-group-card">
                    <div className="settings-row-item" onClick={() => setActiveTab("notifications")} style={{ cursor: "pointer" }}>
                      <div className="settings-row-left">
                        <div className="settings-row-icon-box" style={{ position: "relative" }}>
                          <Bell size={16} />
                          {unreadNotifCount > 0 && (
                            <span style={{
                              position: "absolute",
                              top: "-5px",
                              right: "-6px",
                              background: "var(--error)",
                              color: "#fff",
                              borderRadius: "50%",
                              width: "14px",
                              height: "14px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "8px",
                              fontWeight: "800",
                            }}>
                              {unreadNotifCount}
                            </span>
                          )}
                        </div>
                        <span className="settings-row-title">{t("settings_notifications")}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                        {unreadNotifCount > 0 && (
                          <span style={{ fontSize: "12px", color: "var(--error)", fontWeight: "700" }}>
                            {unreadNotifCount} noi
                          </span>
                        )}
                        <ChevronRight className="settings-row-right-arrow" size={16} />
                      </div>
                    </div>

                    <div className="settings-row-item" onClick={() => { setActiveTab("friends"); }} style={{ cursor: "pointer" }}>
                      <div className="settings-row-left">
                        <div className="settings-row-icon-box">
                          <Users size={16} />
                        </div>
                        <span className="settings-row-title">{t("settings_friends")}</span>
                      </div>
                      <ChevronRight className="settings-row-right-arrow" size={16} />
                    </div>

                    <div className="settings-row-item" onClick={() => { setActiveTab("favorites"); }} style={{ cursor: "pointer" }}>
                      <div className="settings-row-left">
                        <div className="settings-row-icon-box">
                          <Heart size={16} />
                        </div>
                        <span className="settings-row-title">{t("settings_favorites")}</span>
                      </div>
                      <ChevronRight className="settings-row-right-arrow" size={16} />
                    </div>

                    <div className="settings-row-item" onClick={() => setShowHelpModal(true)}>
                      <div className="settings-row-left">
                        <div className="settings-row-icon-box">
                          <HelpCircle size={16} />
                        </div>
                        <span className="settings-row-title">{t("settings_help")}</span>
                      </div>
                      <ChevronRight className="settings-row-right-arrow" size={16} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB CONTENT: ACHIEVEMENTS */}
            {profileSubTab === "achievements" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Achievements Progress Card */}
                {(() => {
                  const completedCountNum = completedAchievements.length;
                  const totalCountNum = ACHIEVEMENTS.length;
                  const progressPercent = Math.round((completedCountNum / totalCountNum) * 100);

                  return (
                    <div className="glass-card" style={{ padding: "18px", border: "none", textAlign: "left" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <h4 style={{ margin: 0, fontWeight: "800", fontSize: "15px" }}>
                          {language === "ro" ? "Progresul Realizărilor" : "Achievements Progress"}
                        </h4>
                        <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--primary)" }}>
                          {completedCountNum} / {totalCountNum} ({progressPercent}%)
                        </span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "var(--surface-container-high)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${progressPercent}%`, height: "100%", background: "var(--primary)", borderRadius: "4px", transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                  );
                })()}

                {/* Achievements List Grid */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {ACHIEVEMENTS.map(ach => {
                    const isCompleted = completedAchievements.includes(ach.id);
                    return (
                      <div key={ach.id} className="glass-card" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "16px",
                        border: isCompleted ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid var(--outline-variant)",
                        background: isCompleted ? "rgba(16, 185, 129, 0.05)" : "var(--surface-container-lowest)",
                        textAlign: "left",
                        opacity: isCompleted ? 1 : 0.85,
                        transition: "all 0.25s ease"
                      }}>
                        <div style={{
                          fontSize: "26px",
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: isCompleted ? "rgba(16, 185, 129, 0.15)" : "var(--surface-container-high)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {ach.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "800", color: "var(--on-surface)" }}>
                            {language === "ro" ? ach.title.ro : ach.title.en}
                          </h4>
                          <p style={{ margin: 0, fontSize: "12px", color: "var(--on-surface-variant)", lineHeight: "1.4" }}>
                            {language === "ro" ? ach.desc.ro : ach.desc.en}
                          </p>
                        </div>
                        <div>
                          {isCompleted ? (
                            <span style={{ fontSize: "12px", fontWeight: "800", color: "#10b981", background: "rgba(16,185,129,0.12)", padding: "4px 10px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              ✅ {language === "ro" ? "Gata" : "Done"}
                            </span>
                          ) : (
                            <span style={{ fontSize: "12px", fontWeight: "800", color: "#e65100", background: "rgba(255,193,7,0.12)", padding: "4px 10px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                              🔒 +{ach.points} 🪙
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SHOP */}
            {profileSubTab === "shop" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {/* Shop Intro Header */}
                <div className="glass-card" style={{ padding: "18px", border: "none", textAlign: "left", background: "var(--surface-container-lowest)" }}>
                  <h4 style={{ margin: "0 0 4px 0", fontWeight: "800", fontSize: "15px" }}>
                    {language === "ro" ? "Magazinul de Profil" : "Profile Store"}
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "var(--on-surface-variant)", lineHeight: "1.5" }}>
                    {language === "ro" 
                      ? "Folosește monedele câștigate din gătit și realizări pentru a cumpăra elemente cosmetice speciale pentru profilul tău!" 
                      : "Use coins earned from cooking and achievements to buy special cosmetic items for your profile!"}
                  </p>
                </div>

                {/* Shop Items Marketplace Grid */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {SHOP_ITEMS.map(item => {
                    const isPurchased = purchasedItems.includes(item.id);
                    let isEquipped = false;
                    if (item.type === "badge") isEquipped = activeBadge === item.id;
                    if (item.type === "border") isEquipped = activeBorder === item.id;

                    const canAfford = coins >= item.price;

                    return (
                      <div key={item.id} className="glass-card" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "16px",
                        border: isEquipped ? "1px solid var(--primary)" : "1px solid var(--outline-variant)",
                        background: "var(--surface-container-lowest)",
                        textAlign: "left",
                        transition: "all 0.2s ease"
                      }}>
                        {/* Item Icon Indicator */}
                        <div style={{
                          fontSize: "24px",
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background: "var(--surface-container-high)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "inset 0 0 6px rgba(0,0,0,0.05)"
                        }}>
                          {item.type === "badge" && (item.displayValue)}
                          {item.type === "border" && "🖼️"}
                          {item.type === "title" && "🏷️"}
                        </div>

                        {/* Item Info */}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "800", color: "var(--on-surface)" }}>
                            {language === "ro" ? item.name.ro : item.name.en}
                          </h4>
                          <p style={{ margin: 0, fontSize: "11px", color: "var(--on-surface-variant)", lineHeight: "1.4" }}>
                            {language === "ro" ? item.desc.ro : item.desc.en}
                          </p>
                        </div>

                        {/* Transaction Action Button */}
                        <div>
                          {isPurchased ? (
                            item.type === "title" ? (
                              <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--primary)", background: "var(--primary-container)", padding: "6px 14px", borderRadius: "16px" }}>
                                {language === "ro" ? "Activat" : "Active"}
                              </span>
                            ) : (
                              <button
                                onClick={() => handleEquipItem(item)}
                                className={`btn ${isEquipped ? "btn-secondary" : "btn-primary"}`}
                                style={{
                                  padding: "6px 14px",
                                  fontSize: "12px",
                                  fontWeight: "800",
                                  borderRadius: "16px",
                                  border: "none",
                                  cursor: "pointer"
                                }}
                              >
                                {isEquipped 
                                  ? (language === "ro" ? "Echipat" : "Equipped") 
                                  : (language === "ro" ? "Echipează" : "Equip")}
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => handleBuyItem(item)}
                              disabled={!canAfford}
                              className="btn"
                              style={{
                                padding: "8px 14px",
                                fontSize: "12px",
                                fontWeight: "800",
                                borderRadius: "16px",
                                border: "none",
                                cursor: canAfford ? "pointer" : "not-allowed",
                                background: canAfford ? "linear-gradient(135deg, #ffa000, #ff8f00)" : "var(--surface-container-high)",
                                color: canAfford ? "#fff" : "var(--on-surface-variant)",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              🪙 {item.price}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}



            {/* Logout bottom row action */}
            <div className="logout-row-container">
              <button
                className="btn-logout"
                onClick={() => setShowLogoutModal(true)}
              >
                <LogOut size={16} /> {t("logout_btn")}
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
           5.5. VIEW: SETTINGS
           ========================================== */}
        {activeTab === "settings" && (
          <div className="page-view" style={{ background: "var(--surface-container-low)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeInSlide 0.3s ease-out" }}>

              {/* Theme Settings Card */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "var(--primary)",
                    borderRadius: "12px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Settings size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-title)", fontSize: "18px", fontWeight: "700", color: "var(--on-surface)" }}>
                      {t("theme_mode")}
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>
                      {t("theme_select_desc")}
                    </p>
                  </div>
                </div>

                {/* Tactile grid selector */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginTop: "8px" }}>
                  <button
                    onClick={() => setTheme("light")}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                      padding: "20px",
                      borderRadius: "16px",
                      border: theme === "light" ? "2.5px solid var(--primary)" : "1px solid var(--surface-container-high)",
                      background: theme === "light" ? "var(--surface-container-lowest)" : "var(--surface-container-low)",
                      color: theme === "light" ? "var(--primary)" : "var(--on-surface-variant)",
                      cursor: "pointer",
                      fontFamily: "var(--font-title)",
                      fontWeight: "700",
                      fontSize: "14px",
                      transition: "var(--transition-fast)",
                      boxShadow: theme === "light" ? "var(--shadow-soft-card)" : "none"
                    }}
                  >
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: theme === "light" ? "var(--primary-container)" : "var(--surface-container-high)",
                      color: theme === "light" ? "var(--on-primary-container)" : "var(--outline)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "var(--transition-fast)"
                    }}>
                      <span style={{ fontSize: "22px" }}>☀️</span>
                    </div>
                    <span>{t("light_mode")}</span>
                  </button>

                  <button
                    onClick={() => setTheme("dark")}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "12px",
                      padding: "20px",
                      borderRadius: "16px",
                      border: theme === "dark" ? "2.5px solid var(--primary)" : "1px solid var(--surface-container-high)",
                      background: theme === "dark" ? "var(--surface-container-lowest)" : "var(--surface-container-low)",
                      color: theme === "dark" ? "var(--primary)" : "var(--on-surface-variant)",
                      cursor: "pointer",
                      fontFamily: "var(--font-title)",
                      fontWeight: "700",
                      fontSize: "14px",
                      transition: "var(--transition-fast)",
                      boxShadow: theme === "dark" ? "var(--shadow-soft-card)" : "none"
                    }}
                  >
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: theme === "dark" ? "var(--primary-container)" : "var(--surface-container-high)",
                      color: theme === "dark" ? "var(--on-primary-container)" : "var(--outline)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "var(--transition-fast)"
                    }}>
                      <span style={{ fontSize: "22px" }}>🌙</span>
                    </div>
                    <span>{t("dark_mode")}</span>
                  </button>
                </div>
              </div>

              {/* Language Settings Card */}
              <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    background: "rgba(254, 166, 25, 0.1)",
                    color: "var(--secondary-container)",
                    borderRadius: "12px",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "var(--font-title)", fontSize: "18px", fontWeight: "700", color: "var(--on-surface)" }}>
                      {t("settings_lang")}
                    </h3>
                    <p style={{ fontSize: "13px", color: "var(--on-surface-variant)" }}>
                      Choose your preferred language for Culinary Vitality.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                  {[
                    { code: "en", label: "English", flag: "🇺🇸" },
                    { code: "ro", label: "Română", flag: "🇷🇴" },
                    { code: "ru", label: "Русский", flag: "🇷🇺" },
                    { code: "de", label: "Deutsch", flag: "🇩🇪" },
                    { code: "es", label: "Español", flag: "🇪🇸" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as Language)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "16px 20px",
                        borderRadius: "12px",
                        border: "1px solid var(--surface-container-high)",
                        background: language === lang.code ? "rgba(16, 185, 129, 0.08)" : "var(--surface-container-lowest)",
                        color: "var(--on-surface)",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "var(--transition-fast)"
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>{lang.flag}</span>
                      <span style={{ flexGrow: 1 }}>{lang.label}</span>
                      {language === lang.code && (
                        <Check size={18} style={{ color: "var(--primary)" }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status / Sync Card */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "var(--primary-container)",
                color: "var(--on-primary-container)",
                padding: "16px var(--spacing-lg)",
                borderRadius: "16px",
                border: "none",
                boxShadow: "var(--shadow-soft-card)"
              }}>
                <div style={{
                  background: "var(--on-primary-container)",
                  color: "var(--primary-container)",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <Check size={16} style={{ strokeWidth: 3 }} />
                </div>
                <span style={{ fontSize: "13px", fontWeight: "700" }}>{t("settings_saved")}</span>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
           5.6. VIEW: MY FRIENDS
           ========================================== */}
        {activeTab === "friends" && (
          <div className="page-view" style={{ background: "var(--surface-container-low)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeInSlide 0.3s ease-out" }}>
              
              {/* Header card with social options */}
              <div className="glass-card" style={{ 
                padding: "24px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between",
                background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08))",
                border: "1px solid var(--outline-variant)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "var(--primary)",
                    borderRadius: "14px",
                    width: "48px",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <Users size={24} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <h3 style={{ fontFamily: "var(--font-title)", fontSize: "18px", fontWeight: "800", color: "var(--on-surface)", margin: 0 }}>
                      {language === "ro" ? "Comunitatea Mea" : "My Community"}
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--on-surface-variant)", margin: "2px 0 0 0" }}>
                      {language === "ro" ? `Ai ${friendsList.length} prieteni activi` : `You have ${friendsList.length} active friends`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={openAddFriendsModal}
                  className="btn btn-primary"
                  style={{
                    borderRadius: "20px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: "800",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <UserPlus size={16} />
                  <span>{language === "ro" ? "Caută prieteni" : "Search Friends"}</span>
                </button>
              </div>

              {/* Friends list */}
              {loadingFriends ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div className="bubbling-pot" style={{ margin: "0 auto 16px auto" }} />
                  <p style={{ color: "var(--outline)", fontSize: "14px" }}>
                    {language === "ro" ? "Se încarcă lista de prieteni..." : "Loading friends list..."}
                  </p>
                </div>
              ) : friendsList.length === 0 ? (
                <div className="glass-card" style={{ padding: "60px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <Users size={48} style={{ color: "var(--outline-variant)" }} />
                  <h3 style={{ color: "var(--on-surface)", fontFamily: "var(--font-title)" }}>
                    {language === "ro" ? "Niciun prieten încă" : "No friends yet"}
                  </h3>
                  <p style={{ fontSize: "14px", color: "var(--on-surface-variant)", maxWidth: "340px", lineHeight: "1.4" }}>
                    {language === "ro" 
                      ? "Adaugă prieteni pentru a le vedea performanțele și a vă compara statisticile de gătit în timp real!" 
                      : "Add friends to see their performance and compare your cooking stats in real-time!"}
                  </p>
                  <button className="btn btn-primary" onClick={openAddFriendsModal} style={{ borderRadius: "20px" }}>
                    {language === "ro" ? "Găsește primul prieten" : "Find your first friend"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {friendsList.map(friend => (
                    <div
                      key={friend.id}
                      onClick={() => {
                        selectFriendForComparison(friend);
                        setShowAddFriendsModal(true);
                      }}
                      className="glass-card friend-grid-card"
                      style={{
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        cursor: "pointer",
                        border: "1px solid var(--outline-variant)",
                        background: "var(--surface-container-lowest)",
                        borderRadius: "20px",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        boxShadow: "var(--shadow-soft-card)",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.borderColor = "var(--primary)";
                        e.currentTarget.style.boxShadow = "var(--shadow-ambient)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "var(--outline-variant)";
                        e.currentTarget.style.boxShadow = "var(--shadow-soft-card)";
                      }}
                    >
                      {/* Top section: Avatar & Names */}
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ position: "relative" }}>
                          {friend.avatar_url ? (
                            <img
                              src={friend.avatar_url}
                              alt="avatar"
                              style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary-container)" }}
                            />
                          ) : (
                            <div style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: friend.avatar_color ?? "var(--primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "800",
                              fontSize: "18px",
                              color: "#fff",
                              border: "2px solid var(--primary-container)"
                            }}>
                              {friend.avatar_initials ?? "U"}
                            </div>
                          )}
                          <span style={{
                            position: "absolute",
                            bottom: "-2px",
                            right: "-2px",
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            background: "#10b981",
                            border: "2px solid var(--surface-container-lowest)"
                          }} />
                        </div>

                        <div style={{ textAlign: "left", flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "var(--on-surface)" }}>
                            {friend.display_name}
                          </h4>
                          <span style={{ fontSize: "12px", color: "var(--outline)" }}>
                            @{friend.username}
                          </span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ height: "1px", background: "var(--outline-variant)", opacity: 0.6 }} />

                      {/* Bottom section: Quick Stats Overview */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", textAlign: "center" }}>
                        <div style={{ background: "var(--surface-container-low)", padding: "8px 4px", borderRadius: "12px" }}>
                          <div style={{ fontSize: "16px", fontWeight: "900", color: "var(--on-surface)" }}>
                            {friend.cooked_count ?? 0}
                          </div>
                          <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                            {language === "ro" ? "Gătite" : "Cooked"}
                          </div>
                        </div>

                        <div style={{ background: "var(--surface-container-low)", padding: "8px 4px", borderRadius: "12px" }}>
                          <div style={{ fontSize: "16px", fontWeight: "900", color: "var(--on-surface)" }}>
                            {friend.ingredients_count ?? 0}
                          </div>
                          <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                            {language === "ro" ? "Ingr." : "Ingr."}
                          </div>
                        </div>

                        <div style={{ background: "var(--surface-container-low)", padding: "8px 4px", borderRadius: "12px" }}>
                          <div style={{ fontSize: "16px", fontWeight: "900", color: "#e65100" }}>
                            🪙 {friend.coins ?? 0}
                          </div>
                          <div style={{ fontSize: "9px", fontWeight: "700", color: "var(--outline)", textTransform: "uppercase", letterSpacing: "0.2px" }}>
                            {language === "ro" ? "Monede" : "Coins"}
                          </div>
                        </div>
                      </div>

                      {/* Small Call to Action Indicator */}
                      <div style={{
                        marginTop: "4px",
                        fontSize: "11px",
                        fontWeight: "800",
                        color: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}>
                        <span>{language === "ro" ? "Compară statistici" : "Compare Stats"}</span>
                        <ChevronRight size={12} />
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==========================================
           6. OVERLAY VIEW: ACTIVE COOKING MODE (FULLSCREEN)
           ========================================== */}
        {activeCookingRecipe && (
          <div className="cooking-mode-overlay">
            <header className="cooking-header">
              <div className="cooking-title-group">
                <h2>{activeCookingRecipe.title}</h2>
                <p>{t("cooking_step_total", { current: currentCookingStep + 1, total: activeCookingRecipe.steps.length })}</p>
              </div>

              <button
                className="modal-close-btn"
                style={{ position: "static", width: "42px", height: "42px" }}
                onClick={() => {
                  if (confirm(t("cooking_warning"))) {
                    setActiveCookingRecipe(null);
                  }
                }}
              >
                <X size={20} />
              </button>
            </header>

            {/* Thick Horizontal Progress Bar at Top */}
            <div
              className="cooking-progress-bar"
              style={{ width: `${((currentCookingStep + 1) / activeCookingRecipe.steps.length) * 100}%` }}
            />

            <div className="cooking-body">
              {/* Left Column: Big active step */}
              <div className="active-step-container">
                <span className="filter-label" style={{ color: "var(--primary)", display: "block", marginBottom: "16px" }}>
                  {t("cooking_instruction")}
                </span>
                <h3 className="active-step-text">
                  {activeCookingRecipe.steps[currentCookingStep]}
                </h3>

                <div style={{ display: "flex", gap: "20px", marginTop: "40px" }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleStepChange("prev")}
                    disabled={currentCookingStep === 0}
                    style={{ padding: "14px 28px" }}
                  >
                    <ChevronLeft size={20} /> {t("cooking_prev")}
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => handleStepChange("next")}
                    style={{ padding: "14px 28px" }}
                  >
                    {currentCookingStep === activeCookingRecipe.steps.length - 1 ? (
                      <>{t("cooking_finish")} <Check size={20} /></>
                    ) : (
                      <>{t("cooking_next")} <ChevronRight size={20} /></>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Active step timer & helpers */}
              <div className="cooking-sidebar">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  <h4 style={{ fontFamily: "var(--font-title)", fontSize: "15px", fontWeight: "700", color: "var(--on-surface)" }}>
                    {t("timer_title")}
                  </h4>

                  {timerSeconds > 0 ? (
                    <>
                      <div className="timer-circle-wrapper">
                        <svg className="timer-svg" viewBox="0 0 180 180">
                          <circle className="timer-track" cx="90" cy="90" r="80" />
                          <circle
                            className="timer-progress"
                            cx="90"
                            cy="90"
                            r="80"
                            strokeDasharray="502"
                            strokeDashoffset={502 - timerProgressOffset}
                          />
                        </svg>
                        <div className="timer-text">{formatTime(timerSeconds)}</div>
                      </div>

                      <div style={{ display: "flex", gap: "12px" }}>
                        <button
                          className="btn btn-secondary btn-icon-only"
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                        >
                          {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                        </button>
                        <button
                          className="btn btn-secondary btn-icon-only"
                          onClick={() => {
                            setTimerSeconds(timerMaxSeconds);
                            setIsTimerRunning(false);
                          }}
                        >
                          <RotateCcw size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--outline)" }}>
                      <Clock size={40} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                      <p style={{ fontSize: "13px" }}>{t("timer_inactive")}</p>
                      <button
                        className="btn btn-secondary"
                        style={{ marginTop: "16px", padding: "8px 16px", fontSize: "12px" }}
                        onClick={() => {
                          setTimerSeconds(300); // 5 mins manual timer
                          setTimerMaxSeconds(300);
                          setIsTimerRunning(true);
                        }}
                      >
                        {t("timer_start_5m")}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ width: "100%", padding: "16px", background: "var(--surface-container-lowest)", border: "1px solid var(--surface-container-high)", borderRadius: "var(--radius-md)" }}>
                  <h5 style={{ fontFamily: "var(--font-title)", fontSize: "13px", fontWeight: "700", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    📝 {t("ingredients_needed")}
                  </h5>
                  <ul style={{ listStyle: "none", fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px", color: "var(--on-surface-variant)" }}>
                    {activeCookingRecipe.ingredients.map(ingr => (
                      <li key={ingr.name} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>• {translateIngredientName(ingr.name, language)}</span>
                        <span style={{ fontWeight: "bold" }}>{ingr.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
           D. MODAL DIALOGS
           ========================================== */}

        {/* 0. Recipe Suggestion Picker Modal */}
        {showRecipeSuggestions && (
          <div className="modal-overlay" onClick={() => setShowRecipeSuggestions(false)}>
            <div
              className="modal-content glass-card"
              style={{ maxWidth: "640px", maxHeight: "88vh", display: "flex", flexDirection: "column", gap: 0, padding: 0, overflow: "hidden" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{
                padding: "24px 24px 16px 24px",
                borderBottom: "1px solid var(--surface-container-high)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                flexShrink: 0
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <div style={{
                      background: "rgba(16, 185, 129, 0.12)",
                      color: "var(--primary)",
                      borderRadius: "10px",
                      width: "34px",
                      height: "34px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Sparkles size={18} />
                    </div>
                    <h2 style={{ fontFamily: "var(--font-title)", fontSize: "20px", fontWeight: "800", color: "var(--on-surface)" }}>
                      {t("recipe_suggestions_title")}
                    </h2>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--on-surface-variant)", lineHeight: "1.4" }}>
                    {t("recipe_suggestions_desc")}
                  </p>
                  {/* Fridge ingredients preview chips */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                    {fridgeIngredients.slice(0, 8).map(ing => (
                      <span key={ing} style={{
                        background: "var(--primary-container)",
                        color: "var(--on-primary-container)",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}>
                        {translateIngredientName(ing, language)}
                      </span>
                    ))}
                    {fridgeIngredients.length > 8 && (
                      <span style={{ color: "var(--on-surface-variant)", fontSize: "11px", alignSelf: "center" }}>
                        +{fridgeIngredients.length - 8}
                      </span>
                    )}
                  </div>
                </div>
                <button className="modal-close-btn" style={{ position: "static", flexShrink: 0 }} onClick={() => setShowRecipeSuggestions(false)}>
                  <X size={16} />
                </button>
              </div>

              {/* Recipe Cards Grid */}
              <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1 }}>
                {suggestedRecipes.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
                    {suggestedRecipes.map(recipe => (
                      <div
                        key={recipe.id}
                        style={{
                          background: "var(--surface-container-lowest)",
                          border: "1px solid var(--surface-container-high)",
                          borderRadius: "16px",
                          overflow: "hidden",
                          cursor: "pointer",
                          transition: "var(--transition-fast)",
                          display: "flex",
                          flexDirection: "column"
                        }}
                        onClick={() => {
                          setActiveRecipe(recipe);
                          setShowRecipeSuggestions(false);
                        }}
                      >
                        {/* Recipe Cover Image */}
                        <div style={{
                          height: "140px",
                          background: "linear-gradient(135deg, #10b981 0%, #059669 40%, #0d9488 100%)",
                          position: "relative",
                          overflow: "hidden"
                        }}>
                          <img
                            src={recipe.image}
                            alt={recipe.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", position: "absolute", top: 0, left: 0 }}
                            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                          />
                          {/* Match badge */}
                          <div style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            background: "rgba(16, 185, 129, 0.95)",
                            color: "#fff",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "11px",
                            fontWeight: "800",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <Check size={11} style={{ strokeWidth: 3 }} />
                            {recipe.matchCount} {recipe.matchCount === 1 ? t("recipe_match_singular") : t("recipe_match")}
                          </div>
                          {/* Diet badge */}
                          <div style={{
                            position: "absolute",
                            bottom: "10px",
                            left: "10px",
                            background: "rgba(0,0,0,0.55)",
                            color: "#fff",
                            padding: "3px 9px",
                            borderRadius: "20px",
                            fontSize: "10px",
                            fontWeight: "700",
                            backdropFilter: "blur(4px)"
                          }}>
                            {recipe.diet}
                          </div>
                        </div>

                        {/* Recipe Info */}
                        <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                          <h3 style={{ fontFamily: "var(--font-title)", fontSize: "14px", fontWeight: "700", color: "var(--on-surface)", lineHeight: "1.3" }}>
                            {recipe.title}
                          </h3>
                          <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "var(--on-surface-variant)" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Clock size={11} /> {recipe.prepTime} min
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Flame size={11} /> {recipe.calories} kcal
                            </span>
                          </div>
                          <button
                            style={{
                              marginTop: "auto",
                              background: "var(--primary-container)",
                              color: "var(--on-primary-container)",
                              border: "none",
                              borderRadius: "10px",
                              padding: "9px 14px",
                              fontSize: "12px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              width: "100%",
                              transition: "var(--transition-fast)"
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveRecipe(recipe);
                              setShowRecipeSuggestions(false);
                            }}
                          >
                            <ChevronRight size={14} /> {t("view_recipe")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--on-surface-variant)" }}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                    <p style={{ fontWeight: "600", fontSize: "15px" }}>{t("no_suggestions")}</p>
                  </div>
                )}
              </div>

              {/* Footer: Generate Custom */}
              <div style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--surface-container-high)",
                flexShrink: 0
              }}>
                <button
                  className="btn btn-accent"
                  style={{
                    width: "100%",
                    padding: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    fontSize: "15px",
                    borderRadius: "12px"
                  }}
                  onClick={generateCustomRecipe}
                >
                  <Sparkles size={18} /> {t("generate_custom")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. Recipe Detail Modal */}
        {activeRecipe && (

          <div className="modal-overlay" onClick={() => setActiveRecipe(null)}>
            <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setActiveRecipe(null)}>
                <X size={16} />
              </button>

              <div className="recipe-details-header">
                <div className="recipe-details-cover">
                  <img
                    src={activeRecipe.image}
                    alt={activeRecipe.title}
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                  />
                </div>

                <div className="recipe-details-main">
                  <span className="recipe-badge">{activeRecipe.diet}</span>
                  <h2 className="recipe-details-title">{activeRecipe.title}</h2>
                  <p style={{ color: "var(--on-surface-variant)", fontSize: "14px", lineHeight: "1.4" }}>
                    {activeRecipe.description}
                  </p>

                  <div className="recipe-nutrition-grid">
                    <div className="nutrition-pill">
                      <div className="nutrition-val">{activeRecipe.calories}</div>
                      <div className="nutrition-lbl">{t("calories")}</div>
                    </div>
                    <div className="nutrition-pill">
                      <div className="nutrition-val">{activeRecipe.protein}g</div>
                      <div className="nutrition-lbl">{t("protein")}</div>
                    </div>
                    <div className="nutrition-pill">
                      <div className="nutrition-val">{activeRecipe.carbs}g</div>
                      <div className="nutrition-lbl">{t("carbs")}</div>
                    </div>
                    <div className="nutrition-pill">
                      <div className="nutrition-val">{activeRecipe.fat}g</div>
                      <div className="nutrition-lbl">{t("fat")}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="recipe-content-split">
                {/* Left: Ingredients */}
                <div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "16px", fontWeight: "700", borderBottom: "1px solid var(--surface-container-high)", paddingBottom: "8px", marginBottom: "8px" }}>
                    {t("required_ingredients")}
                  </h3>

                  {activeRecipe.ingredients.map(ingr => {
                    const isOwned = fridgeIngredients.some(
                      fi => fi.toLowerCase() === ingr.name.toLowerCase()
                    );

                    return (
                      <div
                        key={ingr.name}
                        className={`ingredient-item ${isOwned ? "owned" : "missing"}`}
                      >
                        <div>
                          <div className="ingr-name">{translateIngredientName(ingr.name, language)}</div>
                          <div className="ingr-amt">{ingr.amount}</div>
                        </div>
                        <span className={`ingr-status-indicator ${isOwned ? "owned" : "missing"}`}>
                          {isOwned ? t("in_fridge") : t("missing")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Instructions Preview */}
                <div>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "16px", fontWeight: "700", borderBottom: "1px solid var(--surface-container-high)", paddingBottom: "8px", marginBottom: "8px" }}>
                    {t("cooking_steps", { count: activeRecipe.steps.length })}
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {activeRecipe.steps.map((step, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "12px", padding: "10px 14px", background: "var(--surface-container-low)", border: "1px solid var(--surface-container-high)", borderRadius: "var(--radius-default)" }}>
                        <div style={{ width: "22px", height: "22px", background: "var(--primary)", color: "var(--on-primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        <div style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--on-surface)" }}>{step}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                    <button
                      className="btn btn-primary"
                      style={{ flexGrow: 1 }}
                      onClick={() => startCooking(activeRecipe)}
                    >
                      <Play size={16} /> {t("start_cooking_btn")}
                    </button>

                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setSchedulingMeal({ recipe: activeRecipe, day: "Luni", type: "breakfast" });
                      }}
                    >
                      <Calendar size={16} /> {t("plan_recipe_btn")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Scheduling Helper Modal — Premium Redesign */}
        {schedulingMeal && (
          <div
            className="modal-overlay"
            onClick={() => { setSchedulingMeal(null); setPlannerRecipeSearch(""); }}
            style={{ alignItems: "flex-end", padding: 0 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: "520px",
                background: "var(--surface)",
                borderRadius: "24px 24px 0 0",
                maxHeight: "92vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                animation: "slideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards",
              }}
            >
              {/* Handle */}
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--outline-variant)" }} />
              </div>

              {/* Header */}
              <div style={{ padding: "8px 20px 16px", borderBottom: "1px solid var(--outline-variant)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                  <h3 style={{ fontFamily: "var(--font-title)", fontSize: "18px", fontWeight: "800", color: "var(--on-surface)", margin: 0 }}>
                    {t("modal_planner_title")}
                  </h3>
                  <button
                    onClick={() => { setSchedulingMeal(null); setPlannerRecipeSearch(""); }}
                    style={{ background: "none", border: "none", color: "var(--on-surface-variant)", cursor: "pointer", fontSize: "20px", lineHeight: 1, padding: "4px" }}
                  >
                    ✕
                  </button>
                </div>

                {/* Search bar */}
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none" }}>🔍</span>
                  <input
                    type="text"
                    value={plannerRecipeSearch}
                    onChange={e => setPlannerRecipeSearch(e.target.value)}
                    placeholder="Search recipe..."
                    autoFocus
                    className="interactive-input"
                    style={{ width: "100%", paddingLeft: "40px", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              {/* Recipe List — scrollable */}
              <div style={{ overflowY: "auto", flex: 1, padding: "8px 12px" }}>
                {(() => {
                  const filtered = savedRecipes.filter(r =>
                    plannerRecipeSearch.trim() === "" ||
                    r.title.toLowerCase().includes(plannerRecipeSearch.toLowerCase())
                  );
                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "32px 0", color: "var(--on-surface-variant)", fontSize: "14px" }}>
                        No recipes found for &quot;{plannerRecipeSearch}&quot;
                      </div>
                    );
                  }
                  return filtered.map(r => {
                    const isSelected = schedulingMeal.recipe.id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSchedulingMeal(prev => prev ? { ...prev, recipe: r } : null)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "8px 12px",
                          borderRadius: "12px",
                          cursor: "pointer",
                          background: isSelected ? "var(--primary-container)" : "transparent",
                          border: isSelected ? "1.5px solid var(--primary)" : "1.5px solid transparent",
                          transition: "all 0.15s",
                          marginBottom: "4px",
                        }}
                      >
                        {/* Recipe image */}
                        <img
                          src={r.image}
                          alt={r.title}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "10px",
                            objectFit: "cover",
                            flexShrink: 0,
                            border: isSelected ? "2px solid var(--primary)" : "2px solid transparent",
                            transition: "border 0.15s",
                          }}
                        />
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: "700", fontSize: "14px",
                            color: isSelected ? "var(--primary)" : "var(--on-surface)",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {r.title}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--on-surface-variant)", marginTop: "2px" }}>
                            {r.calories} kcal · {r.prepTime} min
                          </div>
                        </div>
                        {/* Selected check */}
                        {isSelected && (
                          <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ color: "#fff", fontSize: "12px", fontWeight: "800" }}>✓</span>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Footer: Day + Meal type + Confirm */}
              <div style={{
                borderTop: "1px solid var(--outline-variant)",
                padding: "16px 20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                background: "var(--surface)",
              }}>
                {/* Day selector */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                    {t("modal_choose_day")}
                  </div>
                  <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "2px" }}>
                    {DAYS_OF_WEEK.map(day => {
                      const isActive = schedulingMeal.day === day;
                      return (
                        <button
                          key={day}
                          onClick={() => setSchedulingMeal(prev => prev ? { ...prev, day } : null)}
                          style={{
                            flexShrink: 0,
                            padding: "6px 14px",
                            borderRadius: "20px",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "var(--font-title)",
                            fontSize: "13px",
                            fontWeight: "700",
                            transition: "all 0.15s",
                            background: isActive ? "var(--primary)" : "var(--surface-container-low)",
                            color: isActive ? "#fff" : "var(--on-surface-variant)",
                          }}
                        >
                          {t(day).slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Meal type */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                    {t("modal_choose_meal")}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(["breakfast", "lunch", "dinner"] as const).map(type => {
                      const icons = { breakfast: "🌅", lunch: "☀️", dinner: "🌙" };
                      const labels = { breakfast: t("mic_dejun"), lunch: t("pranz"), dinner: t("cina") };
                      const isActive = schedulingMeal.type === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setSchedulingMeal(prev => prev ? { ...prev, type } : null)}
                          style={{
                            flex: 1,
                            padding: "10px 8px",
                            borderRadius: "12px",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "var(--font-title)",
                            fontSize: "13px",
                            fontWeight: "700",
                            transition: "all 0.15s",
                            background: isActive ? "var(--primary)" : "var(--surface-container-low)",
                            color: isActive ? "#fff" : "var(--on-surface-variant)",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                          }}
                        >
                          <span style={{ fontSize: "18px" }}>{icons[type]}</span>
                          {labels[type]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Confirm */}
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "14px", borderRadius: "14px", fontSize: "15px", fontWeight: "800" }}
                  onClick={() => {
                    scheduleMeal(schedulingMeal.day, schedulingMeal.type, schedulingMeal.recipe);
                    setPlannerRecipeSearch("");
                  }}
                >
                  ✅ {t("modal_save")} — {schedulingMeal.recipe.title.length > 28 ? schedulingMeal.recipe.title.slice(0, 28) + "…" : schedulingMeal.recipe.title}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
           GAMIFICATION OVERLAYS
           ========================================== */}
        {/* ACHIEVEMENT UNLOCKED TOAST */}
        {achievementToast.show && (
          <div style={{
            position: "fixed",
            top: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(33, 37, 41, 0.95)",
            border: "2px solid #ffd700",
            boxShadow: "0 8px 32px rgba(255, 215, 0, 0.4)",
            borderRadius: "20px",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            zIndex: 99999,
            animation: "slideInDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
            color: "#fff",
            maxWidth: "360px",
            width: "90%"
          }}>
            <div style={{ fontSize: "36px" }}>🏆</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "11px", color: "#ffd700", fontWeight: "900", letterSpacing: "1px", textTransform: "uppercase" }}>
                {language === "ro" ? "Realizare Deblocată!" : "Achievement Unlocked!"}
              </div>
              <h4 style={{ margin: "2px 0 4px 0", fontSize: "14px", fontWeight: "800", color: "#fff" }}>
                {achievementToast.name}
              </h4>
              <span style={{ fontSize: "12px", color: "#ffa000", fontWeight: "800", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "10px" }}>
                🪙 +100 Coins
              </span>
            </div>
          </div>
        )}

        {/* SUCCESS COOKING MODAL */}
        {showSuccessModal && (
          <div
            className="modal-overlay"
            style={{ zIndex: 9999 }}
            onClick={() => setShowSuccessModal(false)}
          >
            <div
              className="glass-card success-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--surface-container-lowest)",
                border: "1px solid var(--outline-variant)",
                borderRadius: "var(--radius-lg)",
                padding: "36px 28px",
                maxWidth: "400px",
                width: "90%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                boxShadow: "var(--shadow-ambient)",
                textAlign: "center",
                animation: "popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              }}
            >
              <div style={{ fontSize: "64px" }}>🎉</div>
              
              <div>
                <h2 style={{
                  fontFamily: "var(--font-title)",
                  fontSize: "24px",
                  fontWeight: "900",
                  color: "var(--primary)",
                  marginBottom: "8px"
                }}>
                  {language === "ro" ? "Felicitări!" : "Congratulations!"}
                </h2>
                <p style={{
                  fontSize: "14px",
                  color: "var(--on-surface-variant)",
                  lineHeight: "1.5",
                  margin: 0
                }}>
                  {language === "ro" 
                    ? `Ai terminat de gătit "${completedRecipeTitle}". Rețeta ta arată delicios!` 
                    : `You have successfully cooked "${completedRecipeTitle}". Your dish looks spectacular!`}
                </p>
              </div>

              {/* Reward Coin box */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 193, 7, 0.15)",
                padding: "10px 24px",
                borderRadius: "30px",
                border: "1px solid rgba(255, 193, 7, 0.3)",
                fontSize: "18px",
                fontWeight: "900",
                color: "#e65100",
                boxShadow: "0 2px 10px rgba(255, 193, 7, 0.25)"
              }}>
                <span style={{ fontSize: "20px" }}>🪙</span> +10 Coins!
              </div>

              <button
                className="btn btn-primary"
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "14px",
                  fontSize: "15px",
                  fontWeight: "800",
                  marginTop: "8px"
                }}
                onClick={() => setShowSuccessModal(false)}
              >
                {language === "ro" ? "Excelent! 🧑‍🍳" : "Awesome! 🧑‍🍳"}
              </button>
            </div>
          </div>
        )}

        {/* ADD FRIENDS & STATS COMPARISON MODAL */}
        {showAddFriendsModal && (
          <div
            className="modal-overlay"
            style={{ zIndex: 9999 }}
            onClick={() => setShowAddFriendsModal(false)}
          >
            <div
              className="glass-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--surface-container-lowest)",
                border: "1px solid var(--outline-variant)",
                borderRadius: "24px",
                padding: "24px",
                maxWidth: "480px",
                width: "90%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "var(--shadow-ambient)",
                animation: "popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontFamily: "var(--font-title)", fontSize: "20px", fontWeight: "800", color: "var(--on-surface)" }}>
                  {language === "ro" ? "Adaugă și Compară Prieteni" : "Add & Compare Friends"}
                </h3>
                <button
                  onClick={() => {
                    if (selectedFriendProfile) {
                      setSelectedFriendProfile(null);
                    } else {
                      setShowAddFriendsModal(false);
                    }
                  }}
                  style={{
                    background: "var(--surface-container-high)",
                    border: "none",
                    color: "var(--on-surface)",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {!selectedFriendProfile ? (
                <>
                  {/* Search Input bar */}
                  <div className="search-input-container">
                    <Search size={18} style={{ color: "var(--outline)", flexShrink: 0 }} />
                    <input
                      type="text"
                      placeholder={language === "ro" ? "Caută după username..." : "Search by username..."}
                      value={searchFriendNickname}
                      onChange={(e) => setSearchFriendNickname(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleSearchFriends(); }}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        background: "transparent",
                        border: "none",
                        padding: "8px 4px",
                        fontSize: "14px",
                        outline: "none",
                        color: "var(--on-surface)",
                        fontFamily: "inherit"
                      }}
                    />
                    <button
                      onClick={handleSearchFriends}
                      className="search-friends-btn"
                      disabled={searchingFriend}
                    >
                      {searchingFriend ? "..." : (language === "ro" ? "Caută" : "Search")}
                    </button>
                  </div>

                  {/* Search Results list */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {searchFriendResults.length === 0 ? (
                      <p style={{ textAlign: "center", fontSize: "13px", color: "var(--on-surface-variant)", margin: "20px 0" }}>
                        {language === "ro" ? "Niciun rezultat. Introdu un nickname valid." : "No results yet. Enter a valid nickname."}
                      </p>
                    ) : (
                      searchFriendResults.map(user => (
                        <div
                          key={user.id}
                          onClick={() => selectFriendForComparison(user)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            background: "var(--surface-container-low)",
                            borderRadius: "16px",
                            border: "1px solid var(--outline-variant)",
                            cursor: "pointer",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="avatar" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                            ) : (
                              <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: user.avatar_color ?? "var(--primary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                color: "#fff"
                              }}>
                                {user.avatar_initials ?? "U"}
                              </div>
                            )}
                            <div style={{ textAlign: "left" }}>
                              <div style={{ fontSize: "14px", fontWeight: "700", color: "var(--on-surface)" }}>{user.display_name}</div>
                              <div style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>@{user.username}</div>
                            </div>
                          </div>
                          <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "700" }}>
                            {language === "ro" ? "Compară 📊" : "Compare 📊"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                /* REVENGE-DBD PREMIUM DETAILS POPUP */
                <div style={{
                  background: "var(--surface-container-low)",
                  borderRadius: "24px",
                  padding: "32px 24px 24px 24px",
                  color: "var(--on-surface)",
                  position: "relative",
                  border: "1px solid var(--outline-variant)",
                  boxShadow: "var(--shadow-ambient)"
                }}>


                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                    {/* Glowing Avatar */}
                    <div style={{
                      position: "relative",
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      padding: "3px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "transparent",
                      border: `3px solid ${selectedFriendProfile.avatar_color ?? "var(--primary)"}`,
                      boxShadow: `0 0 16px ${selectedFriendProfile.avatar_color ?? "var(--primary)"}70`
                    }}>
                      {selectedFriendProfile.avatar_url ? (
                        <img
                          src={selectedFriendProfile.avatar_url}
                          alt="avatar"
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{
                          background: selectedFriendProfile.avatar_color ?? "var(--primary)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "28px", fontWeight: "800", color: "#fff",
                          width: "100%", height: "100%", borderRadius: "50%"
                        }}>
                          {selectedFriendProfile.avatar_initials ?? "U"}
                        </div>
                      )}
                    </div>

                    {/* Username */}
                    <h2 style={{ margin: "4px 0 0 0", fontSize: "20px", fontWeight: "900", color: "var(--on-surface)", letterSpacing: "0.5px" }}>
                      {selectedFriendProfile.display_name}
                    </h2>
                    <span style={{ fontSize: "12px", color: "var(--outline)", marginTop: "-10px" }}>
                      @{selectedFriendProfile.username}
                    </span>

                    {/* Bio Biography */}
                    <p style={{
                      margin: "4px 0 10px 0",
                      fontSize: "13px",
                      color: "var(--on-surface-variant)",
                      fontStyle: "italic",
                      textAlign: "center",
                      maxWidth: "280px"
                    }}>
                      {selectedFriendProfile.bio ? `"${selectedFriendProfile.bio}"` : `"${language === "ro" ? "Fără descriere." : "No bio yet."}"`}
                    </p>

                    {/* Unlocked Achievements list */}
                    {(() => {
                      const friendAchievements = [];
                      if ((selectedFriendProfile.cooked_count ?? 0) >= 1) {
                        const a = ACHIEVEMENTS.find(ach => ach.id === "first_cook");
                        if (a) friendAchievements.push(a);
                      }
                      if ((selectedFriendProfile.cooked_count ?? 0) >= 5) {
                        const a = ACHIEVEMENTS.find(ach => ach.id === "master_chef_5");
                        if (a) friendAchievements.push(a);
                      }
                      if ((selectedFriendProfile.coins ?? 0) >= 300 || (selectedFriendProfile.cooked_count ?? 0) >= 3) {
                        const a = ACHIEVEMENTS.find(ach => ach.id === "fav_3");
                        if (a) friendAchievements.push(a);
                      }
                      if ((selectedFriendProfile.coins ?? 0) >= 500) {
                        const a = ACHIEVEMENTS.find(ach => ach.id === "coins_500");
                        if (a) friendAchievements.push(a);
                      }

                      return (
                        <div style={{ width: "100%", textAlign: "left", marginBottom: "10px" }}>
                          <span style={{ fontSize: "11px", fontWeight: "900", color: "var(--outline)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            🏆 {language === "ro" ? "Realizări Deblocate" : "Achievements Unlocked"} ({friendAchievements.length})
                          </span>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                            {friendAchievements.length === 0 ? (
                              <span style={{ fontSize: "12px", color: "var(--on-surface-variant)", fontStyle: "italic" }}>
                                {language === "ro" ? "Nicio realizare deblocată încă." : "No achievements unlocked yet."}
                              </span>
                            ) : (
                              friendAchievements.filter(Boolean).map(ach => (
                                <div
                                  key={ach.id}
                                  title={language === "ro" ? ach.title.ro : ach.title.en}
                                  style={{
                                    background: "var(--surface-container-high)",
                                    border: "1px solid var(--outline-variant)",
                                    borderRadius: "16px",
                                    padding: "6px 12px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    color: "var(--on-surface)"
                                  }}
                                >
                                  <span>{ach.icon}</span>
                                  <span>{language === "ro" ? ach.title.ro.split(" ").slice(0, -1).join(" ") : ach.title.en.split(" ").slice(0, -1).join(" ")}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Add / Remove Friend Action Button */}
                    <div style={{ width: "100%", marginBottom: "10px" }}>
                      {activeFriendshipStatus === "friends" && (
                        <button
                          onClick={() => removeFriend(activeFriendshipId)}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "30px",
                            fontSize: "13px",
                            fontWeight: "800",
                            border: "1px solid var(--error)",
                            background: "transparent",
                            color: "var(--error)",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {language === "ro" ? "Prieteni ✓ — Șterge" : "Friends ✓ — Remove"}
                        </button>
                      )}

                      {activeFriendshipStatus === "pending_sent" && (
                        <button
                          disabled
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "30px",
                            fontSize: "13px",
                            fontWeight: "800",
                            border: "1px solid var(--outline-variant)",
                            background: "var(--surface-container-high)",
                            color: "var(--on-surface-variant)",
                            cursor: "not-allowed"
                          }}
                        >
                          ⌛ {language === "ro" ? "Cerere Trimisă" : "Request Sent"} (Pending)
                        </button>
                      )}

                      {activeFriendshipStatus === "pending_received" && (
                        <button
                          onClick={() => acceptFriendRequestDirect(activeFriendshipId, selectedFriendProfile.id)}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "30px",
                            fontSize: "13px",
                            fontWeight: "800",
                            border: "none",
                            background: "var(--primary)",
                            color: "var(--on-primary)",
                            cursor: "pointer"
                          }}
                        >
                          {language === "ro" ? "Acceptă Cererea!" : "Accept Friend Request!"}
                        </button>
                      )}

                      {activeFriendshipStatus === "none" && (
                        <button
                          onClick={() => sendFriendRequest(selectedFriendProfile.id)}
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "30px",
                            fontSize: "13px",
                            fontWeight: "800",
                            border: "none",
                            background: "var(--primary)",
                            color: "var(--on-primary)",
                            cursor: "pointer",
                            boxShadow: "var(--shadow-soft-card)"
                          }}
                        >
                          {language === "ro" ? "Adaugă Prieten ➕" : "Add Friend ➕"}
                        </button>
                      )}
                    </div>

                    {/* COIN WALLET CARD */}
                    <div className="glass-card wallet-card" style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 20px",
                      background: "linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 152, 0, 0.15))",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid rgba(255, 193, 7, 0.3)",
                      margin: "8px 0 16px 0",
                      width: "100%",
                      boxSizing: "border-box"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "32px" }}>🪙</span>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {language === "ro" ? "Sold Monede" : "Coin Balance"}
                          </div>
                          <div style={{ fontSize: "22px", fontWeight: "900", color: "#e65100", lineHeight: "1.2" }}>{selectedFriendProfile.coins ?? 0} Coins</div>
                        </div>
                      </div>
                    </div>

                    {/* SLEEK STATS GRID */}
                    <div className="profile-stat-box" style={{ width: "100%", marginTop: "0" }}>
                      <div className="profile-stat-item">
                        <div className="profile-stat-icon">
                          <BookOpen size={18} />
                        </div>
                        <div className="profile-stat-val">{selectedFriendProfile.cooked_count ?? 0}</div>
                        <div className="profile-stat-lbl">{t("stats_cooked")}</div>
                      </div>

                      <div className="profile-stat-item">
                        <div className="profile-stat-icon">
                          <Refrigerator size={18} />
                        </div>
                        <div className="profile-stat-val">{selectedFriendProfile.ingredients_count ?? 0}</div>
                        <div className="profile-stat-lbl">{t("stat_ingredients")}</div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HELP & SUPPORT MODAL */}
        {showHelpModal && (
          <div
            className="modal-overlay"
            style={{ zIndex: 9999 }}
            onClick={() => setShowHelpModal(false)}
          >
            <div
              className="glass-card"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--surface-container-lowest)",
                border: "1px solid var(--outline-variant)",
                borderRadius: "24px",
                padding: "32px 24px",
                maxWidth: "400px",
                width: "90%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
                boxShadow: "var(--shadow-ambient)",
                textAlign: "center",
                animation: "popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              }}
            >
              <div style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--primary)",
                borderRadius: "50%",
                width: "56px",
                height: "56px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                ℹ️
              </div>

              <div>
                <h3 style={{
                  fontFamily: "var(--font-title)",
                  fontSize: "20px",
                  fontWeight: "800",
                  color: "var(--on-surface)",
                  marginBottom: "8px",
                  marginTop: 0
                }}>
                  {language === "ro" ? "Ajutor & Suport" : "Help & Support"}
                </h3>
                <p style={{
                  fontSize: "13px",
                  color: "var(--on-surface-variant)",
                  lineHeight: "1.5",
                  margin: 0
                }}>
                  {language === "ro"
                    ? "Întâmpini probleme sau ai sugestii? Trimite-ne un e-mail la adresa de mai jos și echipa noastră te va ajuta cu drag!"
                    : "Having issues or have suggestions? Send us an email at the address below and our team will gladly assist you!"}
                </p>
              </div>

              {/* Email box */}
              <div style={{
                background: "var(--surface-container-low)",
                border: "1px solid var(--outline-variant)",
                borderRadius: "14px",
                padding: "12px 20px",
                width: "100%",
                fontSize: "14px",
                fontWeight: "700",
                color: "var(--primary)",
                wordBreak: "break-all"
              }}>
                support@placeholder-email.com
              </div>

              <div style={{ display: "flex", gap: "10px", width: "100%", marginTop: "8px" }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: "12px", borderRadius: "12px" }}
                  onClick={() => setShowHelpModal(false)}
                >
                  {language === "ro" ? "Închide" : "Close"}
                </button>
                <a
                  href="mailto:support@placeholder-email.com?subject=Suport%20Culinary%20Vitality"
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "12px",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "800",
                    fontSize: "14px"
                  }}
                  onClick={() => setShowHelpModal(false)}
                >
                  ✉️ {language === "ro" ? "Trimite Mail" : "Send Email"}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
           LOGOUT CONFIRMATION MODAL
           ========================================== */}
        {showLogoutModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowLogoutModal(false)}
            style={{ zIndex: 200 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--surface-container-lowest)",
                border: "1px solid var(--surface-container-high)",
                borderRadius: "var(--radius-lg)",
                padding: "32px 28px",
                maxWidth: "360px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                boxShadow: "var(--shadow-ambient)",
                animation: "popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
              }}
            >
              {/* Icon */}
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "var(--error-container)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <LogOut size={24} style={{ color: "var(--on-error-container)" }} />
              </div>

              {/* Text */}
              <div style={{ textAlign: "center" }}>
                <h3 style={{
                  fontFamily: "var(--font-title)",
                  fontSize: "18px",
                  fontWeight: "800",
                  color: "var(--on-surface)",
                  marginBottom: "8px"
                }}>
                  {t("logout_btn")}
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "var(--on-surface-variant)",
                  lineHeight: "1.5"
                }}>
                  {t("logout_confirm")}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "var(--radius-default)",
                    border: "1px solid var(--outline-variant)",
                    background: "transparent",
                    color: "var(--on-surface)",
                    fontFamily: "var(--font-title)",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "var(--transition-fast)"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-container-low)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {t("modal_cancel")}
                </button>
                <button
                  onClick={() => {
                    setShowLogoutModal(false);
                    supabase.auth.signOut();
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "var(--radius-default)",
                    border: "none",
                    background: "var(--error)",
                    color: "#fff",
                    fontFamily: "var(--font-title)",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "var(--transition-fast)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  <LogOut size={14} /> {t("logout_btn")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal (bottom sheet) - Rendered at root level so it covers and blurs bottom-nav and sidebar */}
        {showEditProfile && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,                          // Render on top of everything (sidebar, bottom-nav)
              background: "rgba(11, 15, 23, 0.65)", // Premium dark overlay
              backdropFilter: "blur(10px)",         // High-end frosted glass blur effect
              WebkitBackdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              animation: "fadeIn 0.25s ease-out forwards"
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowEditProfile(false); }}
          >
            <div style={{
              background: "var(--surface)",
              borderRadius: "24px 24px 0 0",
              width: "100%",
              maxWidth: "480px",
              padding: "0 0 32px 0",
              display: "flex",
              flexDirection: "column",
              gap: "0",
              maxHeight: "90vh",
              overflowY: "auto",
              animation: "slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards", // Smooth iOS-style bottom sheet slide up
              boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.25)"
            }}>
              {/* Handle bar */}
              <div style={{ display: "flex", justifyContent: "center", paddingTop: "12px", paddingBottom: "4px" }}>
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "var(--outline-variant)" }} />
              </div>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 16px" }}>
                <button
                  onClick={() => setShowEditProfile(false)}
                  style={{ background: "none", border: "none", fontSize: "15px", color: "var(--on-surface-variant)", cursor: "pointer", fontWeight: "500" }}
                >
                  Cancel
                </button>
                <span style={{ fontWeight: "700", fontSize: "16px", color: "var(--on-surface)" }}>Edit Profile</span>
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  style={{ background: "none", border: "none", fontSize: "15px", color: "var(--primary)", cursor: profileSaving ? "not-allowed" : "pointer", fontWeight: "700", opacity: profileSaving ? 0.6 : 1 }}
                >
                  {profileSaving ? "Saving..." : "Save"}
                </button>
              </div>

              {/* Avatar Upload */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "8px 20px 20px" }}>
                <div style={{ position: "relative", width: "96px", height: "96px" }}>
                  {editAvatarPreview ? (
                    <img
                      src={editAvatarPreview}
                      alt="avatar preview"
                      style={{ width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--primary)" }}
                    />
                  ) : (
                    <div style={{
                      width: "96px", height: "96px", borderRadius: "50%",
                      background: userProfile?.avatar_color ?? "var(--primary)",
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "32px", fontWeight: "700",
                      color: "#fff", border: "3px solid var(--primary-container)"
                    }}>
                      {userProfile?.avatar_initials ?? "?"}
                    </div>
                  )}
                  {/* Camera overlay button */}
                  <label
                    htmlFor="avatar-upload-input"
                    style={{
                      position: "absolute", bottom: 0, right: 0,
                      background: "var(--primary)", borderRadius: "50%",
                      width: "30px", height: "30px", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      cursor: "pointer", border: "2px solid var(--surface)",
                    }}
                  >
                    <Camera size={14} color="#fff" />
                  </label>
                  <input
                    id="avatar-upload-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditAvatarFile(file); // store for upload
                        const reader = new FileReader();
                        reader.onload = (ev) => setEditAvatarPreview(ev.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <span style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "600", cursor: "pointer" }}>
                  Change photo
                </span>
                <span style={{ fontSize: "11px", color: "var(--on-surface-variant)", textAlign: "center" }}>
                  JPG, PNG or WEBP · max 5MB
                </span>
              </div>

              {/* Error message */}
              {profileSaveError && (
                <div style={{ margin: "0 20px", padding: "10px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: "13px", color: "var(--error)", fontWeight: "600" }}>
                  ⚠️ {profileSaveError}
                </div>
              )}

              {/* Form Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0", padding: "0 20px" }}>
                {/* Display Name */}
                <div style={{ borderTop: "1px solid var(--outline-variant)", padding: "14px 0" }}>
                  <label style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={40}
                    style={{
                      width: "100%", border: "none", outline: "none",
                      background: "transparent", fontSize: "15px",
                      color: "var(--on-surface)", fontWeight: "500",
                      fontFamily: "inherit",
                    }}
                    placeholder="Your name..."
                  />
                </div>

                {/* Username */}
                <div style={{ borderTop: "1px solid var(--outline-variant)", padding: "14px 0" }}>
                  <label style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.replace(/\s/g, "").toLowerCase())}
                    maxLength={30}
                    style={{
                      width: "100%", border: "none", outline: "none",
                      background: "transparent", fontSize: "15px",
                      color: "var(--on-surface)", fontWeight: "500",
                      fontFamily: "inherit",
                    }}
                    placeholder="username"
                  />
                </div>

                {/* Bio */}
                <div style={{ borderTop: "1px solid var(--outline-variant)", borderBottom: "1px solid var(--outline-variant)", padding: "14px 0" }}>
                  <label style={{ fontSize: "11px", color: "var(--on-surface-variant)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "4px" }}>
                    Bio
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    maxLength={160}
                    rows={3}
                    style={{
                      width: "100%", border: "none", outline: "none",
                      background: "transparent", fontSize: "15px",
                      color: "var(--on-surface)", fontWeight: "500",
                      fontFamily: "inherit", resize: "none",
                    }}
                    placeholder="A few words about you..."
                  />
                  <span style={{ fontSize: "11px", color: "var(--on-surface-variant)" }}>{editBio.length}/160</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
