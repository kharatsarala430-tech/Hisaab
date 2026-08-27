/**
 * Hisaab — App-wide Translations
 * ---------------------------------------------------
 * Save as: src/translations.js
 *
 * This is the single source of truth for every piece of UI text in
 * the app (not the Quick Guide content — that stays in guideContent.js).
 *
 * How it grows: as each screen is migrated, add its strings here
 * under a clearly-named key, in all three languages at once. Keep
 * keys grouped by screen (dashboard.*, settings.*, auth.*, ...) so
 * it's easy to find what belongs where as the file grows.
 *
 * Usage in a component:
 *   import { useLanguage } from "../LanguageContext";
 *   const { t } = useLanguage();
 *   <h3>{t("dashboard.balance")}</h3>
 */

export const translations = {
  english: {
    common: {
      appName: "Hisaab",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      done: "Done",
      next: "Next",
      back: "Back",
      skip: "Skip",
    },
    auth: {
      tagline: "Your Smart Personal Finance Companion",
      email: "Email",
      password: "Password (min 6 characters)",
      logIn: "Log In",
      signUp: "Sign Up",
      pleaseWait: "Please wait...",
      newHere: "New here? Create an account",
      alreadyHaveAccount: "Already have an account? Log in",
    },
    dashboard: {
      balance: "Balance",
      income: "Income",
      expenses: "Expenses",
      spendingByCategory: "Spending by Category",
    },
    transactions: {
      title: "Recent Transactions",
      loading: "Loading transactions...",
      empty: "No transactions yet. Add your first one above!",
    },
    addTransaction: {
      expense: "Expense",
      income: "Income",
      amountPlaceholder: "Amount (₹)",
      notePlaceholder: "Note (optional)",
      repeatMonthly: "🔁 Repeat every month",
      adding: "Adding...",
      submit: "Add Transaction",
    },
    settings: {
      title: "Settings",
      account: "Account",
      email: "Email",
      logout: "Logout",
      appearance: "Appearance",
      darkMode: "Dark Mode",
      permissions: "Permissions",
      notifications: "Notifications",
      allowed: "Allowed",
      help: "Help",
      quickGuide: "Quick Guide",
      replayTour: "Replay Dashboard Tour",
      inviteFriends: "Invite Friends",
      language: "Language",
      footer: "Hisaab · Made in India 🇮🇳",
    },
    nav: {
      dashboard: "Dashboard",
      emi: "EMI",
      budget: "50/30/20",
      savings: "Savings",
    },
  },

  hindi: {
    common: {
      appName: "हिसाब",
      cancel: "रद्द करें",
      save: "सेव करें",
      delete: "हटाएं",
      edit: "बदलें",
      done: "हो गया",
      next: "आगे",
      back: "पीछे",
      skip: "छोड़ें",
    },
    auth: {
      tagline: "आपका स्मार्ट पर्सनल फाइनेंस साथी",
      email: "ईमेल",
      password: "पासवर्ड (कम से कम 6 अक्षर)",
      logIn: "लॉग इन करें",
      signUp: "साइन अप करें",
      pleaseWait: "कृपया प्रतीक्षा करें...",
      newHere: "नए हैं? खाता बनाएं",
      alreadyHaveAccount: "पहले से खाता है? लॉग इन करें",
    },
    dashboard: {
      balance: "बैलेंस",
      income: "आय",
      expenses: "खर्च",
      spendingByCategory: "श्रेणी के अनुसार खर्च",
    },
    transactions: {
      title: "हाल के लेन-देन",
      loading: "लेन-देन लोड हो रहे हैं...",
      empty: "अभी तक कोई लेन-देन नहीं। ऊपर अपना पहला लेन-देन जोड़ें!",
    },
    addTransaction: {
      expense: "खर्च",
      income: "आय",
      amountPlaceholder: "राशि (₹)",
      notePlaceholder: "नोट (वैकल्पिक)",
      repeatMonthly: "🔁 हर महीने दोहराएं",
      adding: "जोड़ा जा रहा है...",
      submit: "लेन-देन जोड़ें",
    },
    settings: {
      title: "सेटिंग्स",
      account: "खाता",
      email: "ईमेल",
      logout: "लॉगआउट",
      appearance: "दिखावट",
      darkMode: "डार्क मोड",
      permissions: "अनुमतियां",
      notifications: "नोटिफिकेशन",
      allowed: "अनुमति है",
      help: "सहायता",
      quickGuide: "क्विक गाइड",
      replayTour: "डैशबोर्ड टूर फिर से देखें",
      inviteFriends: "दोस्तों को आमंत्रित करें",
      language: "भाषा",
      footer: "हिसाब · भारत में निर्मित 🇮🇳",
    },
    nav: {
      dashboard: "डैशबोर्ड",
      emi: "ईएमआई",
      budget: "50/30/20",
      savings: "बचत",
    },
  },

  marathi: {
    common: {
      appName: "हिसाब",
      cancel: "रद्द करा",
      save: "सेव्ह करा",
      delete: "काढा",
      edit: "बदला",
      done: "झाले",
      next: "पुढे",
      back: "मागे",
      skip: "वगळा",
    },
    auth: {
      tagline: "तुमचा स्मार्ट पर्सनल फायनान्स साथी",
      email: "ईमेल",
      password: "पासवर्ड (किमान 6 अक्षरे)",
      logIn: "लॉग इन करा",
      signUp: "साइन अप करा",
      pleaseWait: "कृपया थांबा...",
      newHere: "नवीन आहात? खाते तयार करा",
      alreadyHaveAccount: "आधीच खाते आहे? लॉग इन करा",
    },
    dashboard: {
      balance: "बॅलन्स",
      income: "उत्पन्न",
      expenses: "खर्च",
      spendingByCategory: "श्रेणीनुसार खर्च",
    },
    transactions: {
      title: "अलीकडील व्यवहार",
      loading: "व्यवहार लोड होत आहेत...",
      empty: "अजून कोणतेही व्यवहार नाहीत. वरती तुमचा पहिला व्यवहार जोडा!",
    },
    addTransaction: {
      expense: "खर्च",
      income: "उत्पन्न",
      amountPlaceholder: "रक्कम (₹)",
      notePlaceholder: "टीप (ऐच्छिक)",
      repeatMonthly: "🔁 दर महिन्याला पुन्हा करा",
      adding: "जोडत आहे...",
      submit: "व्यवहार जोडा",
    },
    settings: {
      title: "सेटिंग्ज",
      account: "खाते",
      email: "ईमेल",
      logout: "लॉगआउट",
      appearance: "दिसणे",
      darkMode: "डार्क मोड",
      permissions: "परवानग्या",
      notifications: "सूचना",
      allowed: "परवानगी आहे",
      help: "मदत",
      quickGuide: "क्विक गाइड",
      replayTour: "डॅशबोर्ड टूर पुन्हा पहा",
      inviteFriends: "मित्रांना आमंत्रित करा",
      language: "भाषा",
      footer: "हिसाब · भारतात बनवले 🇮🇳",
    },
    nav: {
      dashboard: "डॅशबोर्ड",
      emi: "ईएमआय",
      budget: "50/30/20",
      savings: "बचत",
    },
  },
};

export const APP_LANG_STORAGE_KEY = "hisaab_app_lang";
