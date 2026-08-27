/**
 * Hisaab — Quick Guide Content
 * ---------------------------------------------------
 * Save as: src/guideContent.js
 *
 * All Quick Guide text lives here in one place, split by language.
 * To add a new language later: add a new key (e.g. "gujarati") with
 * the same shape as the ones below — nothing else needs to change.
 */

export const LANGUAGES = [
  { code: "english", label: "English" },
  { code: "hindi", label: "हिंदी" },
  { code: "marathi", label: "मराठी" },
];

/* ---------- Auth screen (Login / Signup) steps ---------- */
export const authGuideSteps = {
  english: [
    {
      title: "Welcome to Hisaab",
      text: "Hisaab helps you track your income, expenses, EMIs and savings goals — all in one place. Let's get you logged in.",
    },
    {
      title: "New here? Create an account",
      text: "Tap 'New here? Create an account' below the password box. Enter your email and a password (minimum 6 characters), then tap 'Sign Up'.",
    },
    {
      title: "Already have an account?",
      text: "Enter your registered email and password, then tap 'Log In'. That's it — your dashboard opens automatically.",
    },
    {
      title: "Forgot your password?",
      text: "Currently, use the same email you signed up with. If you're stuck, contact support from the Settings page.",
    },
  ],
  hindi: [
    {
      title: "Hisaab mein aapka swagat hai",
      text: "Hisaab aapki income, expenses, EMI aur savings goals ek hi jagah track karne mein madad karta hai. Chaliye login karte hain.",
    },
    {
      title: "Naye user ho? Account banao",
      text: "Password box ke neeche 'New here? Create an account' pe tap karo. Apna email aur password (kam se kam 6 characters) daalo, phir 'Sign Up' pe tap karo.",
    },
    {
      title: "Pehle se account hai?",
      text: "Apna registered email aur password daalo, phir 'Log In' pe tap karo. Bas — aapka dashboard automatically khul jayega.",
    },
    {
      title: "Password bhool gaye?",
      text: "Abhi ke liye, wahi email use karo jisse aapne sign up kiya tha. Agar problem ho to Settings page se support contact karo.",
    },
  ],
  marathi: [
    {
      title: "Hisaab madhe swagat aahe",
      text: "Hisaab tumchi income, expenses, EMI ani savings goals ek thikani track karayla madat karto. Chala login karूya.",
    },
    {
      title: "Nave user aahat? Account banva",
      text: "Password box chya khali 'New here? Create an account' var tap kara. Tumcha email ani password (kimaan 6 characters) taka, mag 'Sign Up' var tap kara.",
    },
    {
      title: "Aadhipasun account aahe?",
      text: "Tumcha registered email ani password taka, mag 'Log In' var tap kara. Zale — tumcha dashboard aapoap ughadेल.",
    },
    {
      title: "Password visarla?",
      text: "Sadhya, jya emailne sign up kele hote tach email vapra. Adchan asel tar Settings page varun support la sampark kara.",
    },
  ],
};

/* ---------- Dashboard tour steps — each maps to an element id in Dashboard ---------- */
export const dashboardTourSteps = {
  english: [
    { targetId: "tour-summary", title: "Your Summary", text: "This shows your Balance, Income and Expenses for the selected month at a glance." },
    { targetId: "tour-add-transaction", title: "Add a Transaction", text: "Tap here anytime to add money you spent or received." },
    { targetId: "tour-month-selector", title: "Switch Months", text: "Use this dropdown to see any past month's data." },
    { targetId: "tour-bottom-nav", title: "Explore More", text: "Use these tabs to jump to EMI, Budget, Savings and Udhaar tracking." },
  ],
  hindi: [
    { targetId: "tour-summary", title: "Aapka Summary", text: "Yahan aapko selected month ka Balance, Income aur Expenses ek nazar mein dikhta hai." },
    { targetId: "tour-add-transaction", title: "Transaction Add Karo", text: "Kabhi bhi kharch ya income add karne ke liye yahan tap karo." },
    { targetId: "tour-month-selector", title: "Month Badlo", text: "Is dropdown se koi bhi purana month ka data dekh sakte ho." },
    { targetId: "tour-bottom-nav", title: "Aur Explore Karo", text: "Inn tabs se EMI, Budget, Savings aur Udhaar tracking pe jaa sakte ho." },
  ],
  marathi: [
    { targetId: "tour-summary", title: "Tumcha Summary", text: "Ithe tumhala selected month cha Balance, Income ani Expenses ek najaret dista." },
    { targetId: "tour-add-transaction", title: "Transaction Add Kara", text: "Kadhihi kharch kinva income add karnyasathi ithe tap kara." },
    { targetId: "tour-month-selector", title: "Month Badla", text: "Ya dropdown ne koणताही juna month cha data pahu shakta." },
    { targetId: "tour-bottom-nav", title: "Ajun Explore Kara", text: "Ya tabs varun EMI, Budget, Savings ani Udhaar tracking var jau shakta." },
  ],
};

export const STORAGE_KEYS = {
  language: "hisaab_guide_lang",
  tourSeen: "hisaab_tour_seen",
};
