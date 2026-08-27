/**
 * Hisaab — Quick Guide Content
 * ---------------------------------------------------
 * Save as: src/guideContent.js
 *
 * All Quick Guide text lives here in one place, split by language.
 * Hindi and Marathi are written in proper Devanagari script — not
 * Roman-letter transliteration ("Hinglish"). They are two distinct
 * languages with their own wording, not the same sentence reused.
 *
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
      title: "हिसाब में आपका स्वागत है",
      text: "हिसाब आपकी आय, खर्च, ईएमआई और बचत के लक्ष्य — सब कुछ एक ही जगह पर ट्रैक करने में मदद करता है। चलिए लॉग इन करते हैं।",
    },
    {
      title: "नए हैं? खाता बनाएं",
      text: "पासवर्ड बॉक्स के नीचे 'New here? Create an account' पर टैप करें। अपना ईमेल और पासवर्ड (कम से कम 6 अक्षर) डालें, फिर 'Sign Up' पर टैप करें।",
    },
    {
      title: "पहले से खाता है?",
      text: "अपना रजिस्टर्ड ईमेल और पासवर्ड डालें, फिर 'Log In' पर टैप करें। बस — आपका डैशबोर्ड अपने आप खुल जाएगा।",
    },
    {
      title: "पासवर्ड भूल गए?",
      text: "फिलहाल, वही ईमेल इस्तेमाल करें जिससे आपने साइन अप किया था। अगर दिक्कत हो तो सेटिंग्स पेज से सहायता से संपर्क करें।",
    },
  ],
  marathi: [
    {
      title: "हिसाब मध्ये आपले स्वागत आहे",
      text: "हिसाब तुमचे उत्पन्न, खर्च, ईएमआय आणि बचतीची उद्दिष्टे — सर्व काही एकाच ठिकाणी ट्रॅक करण्यास मदत करते. चला लॉग इन करूया.",
    },
    {
      title: "नवीन आहात? खाते तयार करा",
      text: "पासवर्ड बॉक्सच्या खाली 'New here? Create an account' वर टॅप करा. तुमचा ईमेल आणि पासवर्ड (किमान 6 अक्षरे) टाका, मग 'Sign Up' वर टॅप करा.",
    },
    {
      title: "आधीच खाते आहे?",
      text: "तुमचा नोंदणीकृत ईमेल आणि पासवर्ड टाका, मग 'Log In' वर टॅप करा. झाले — तुमचा डॅशबोर्ड आपोआप उघडेल.",
    },
    {
      title: "पासवर्ड विसरलात?",
      text: "सध्या, ज्या ईमेलने साइन अप केले होते तोच ईमेल वापरा. अडचण असल्यास सेटिंग्स पेजवरून सपोर्टशी संपर्क साधा.",
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
    { targetId: "tour-summary", title: "आपका सारांश", text: "यहां आपको चुने गए महीने का बैलेंस, आय और खर्च एक नज़र में दिखता है।" },
    { targetId: "tour-add-transaction", title: "ट्रांजैक्शन जोड़ें", text: "कभी भी खर्च या आय जोड़ने के लिए यहां टैप करें।" },
    { targetId: "tour-month-selector", title: "महीना बदलें", text: "इस ड्रॉपडाउन से किसी भी पुराने महीने का डेटा देख सकते हैं।" },
    { targetId: "tour-bottom-nav", title: "और भी बहुत कुछ", text: "इन टैब्स से ईएमआई, बजट, बचत और उधार ट्रैकिंग पर जा सकते हैं।" },
  ],
  marathi: [
    { targetId: "tour-summary", title: "तुमचा सारांश", text: "इथे तुम्हाला निवडलेल्या महिन्याचे बॅलन्स, उत्पन्न आणि खर्च एका नजरेत दिसतो." },
    { targetId: "tour-add-transaction", title: "व्यवहार जोडा", text: "कधीही खर्च किंवा उत्पन्न जोडण्यासाठी इथे टॅप करा." },
    { targetId: "tour-month-selector", title: "महिना बदला", text: "या ड्रॉपडाउनने कोणत्याही जुन्या महिन्याचा डेटा पाहू शकता." },
    { targetId: "tour-bottom-nav", title: "आणखी एक्सप्लोर करा", text: "या टॅब्सवरून ईएमआय, बजेट, बचत आणि उधार ट्रॅकिंगवर जाऊ शकता." },
  ],
};

export const STORAGE_KEYS = {
  language: "hisaab_guide_lang",
  tourSeen: "hisaab_tour_seen",
};
