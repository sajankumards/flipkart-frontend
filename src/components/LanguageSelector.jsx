import React, { useState, createContext, useContext } from 'react';
import './LanguageSelector.css';

const LANGUAGES = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
];

export const TRANSLATIONS = {
    en: {
        // Navbar
        search: 'Search for products, brands and more',
        cart: 'Cart', login: 'Login', home: 'Home',
        // Product Card
        addToCart: 'Add to Cart', buyNow: 'Buy Now',
        freeDelivery: 'Free Delivery', returnPolicy: '7 Days Return',
        adding: 'Adding...', added: 'Added!', failed: 'Failed',
        // Wishlist & Orders
        wishlist: 'Wishlist', orders: 'My Orders',
        // Homepage Sections
        electronics: 'Electronics & Gadgets', fashion: 'Trending in Fashion',
        homeKitchen: 'Home & Kitchen', beauty: 'Beauty & Skincare',
        jewellery: 'Jewellery & Accessories', sports: 'Sports & Fitness',
        books: 'Books & Stationery', allProducts: 'All Products',
        // Spin Banner
        spinTitle: 'Spin & Win!', spinSubtitle: 'Win coupons & loyalty points daily!', spinNow: 'Spin Now →',
        // View All
        viewAll: 'View All →',
        // Invoice
        invoice: 'Invoice', downloadInvoice: 'Download Invoice',
        invoiceReady: 'Invoice ready! 🧾', orderNotFound: 'Order data not found!',
    },
    hi: {
        search: 'उत्पाद, ब्रांड और अधिक खोजें',
        cart: 'कार्ट', login: 'लॉगिन', home: 'होम',
        addToCart: 'कार्ट में डालें', buyNow: 'अभी खरीदें',
        freeDelivery: 'मुफ्त डिलीवरी', returnPolicy: '7 दिन वापसी',
        adding: 'जोड़ रहे हैं...', added: 'जोड़ा गया!', failed: 'विफल',
        wishlist: 'विशलिस्ट', orders: 'मेरे ऑर्डर',
        electronics: 'इलेक्ट्रॉनिक्स और गैजेट्स', fashion: 'फैशन में ट्रेंडिंग',
        homeKitchen: 'घर और रसोई', beauty: 'सौंदर्य और स्किनकेयर',
        jewellery: 'ज्वेलरी और एक्सेसरीज', sports: 'खेल और फिटनेस',
        books: 'किताबें और स्टेशनरी', allProducts: 'सभी उत्पाद',
        spinTitle: 'स्पिन करें और जीतें!', spinSubtitle: 'रोज़ कूपन और लॉयल्टी पॉइंट जीतें!', spinNow: 'अभी स्पिन करें →',
        viewAll: 'सभी देखें →',
        invoice: 'इनवॉइस', downloadInvoice: 'इनवॉइस डाउनलोड करें',
        invoiceReady: 'इनवॉइस तैयार है! 🧾', orderNotFound: 'ऑर्डर डेटा नहीं मिला!',
    },
    ta: {
        search: 'தயாரிப்புகள், பிராண்டுகள் தேடுங்கள்',
        cart: 'கார்ட்', login: 'உள்நுழைய', home: 'முகப்பு',
        addToCart: 'கார்ட்டில் சேர்', buyNow: 'இப்போது வாங்கு',
        freeDelivery: 'இலவச டெலிவரி', returnPolicy: '7 நாள் திரும்பல்',
        adding: 'சேர்க்கிறது...', added: 'சேர்க்கப்பட்டது!', failed: 'தோல்வி',
        wishlist: 'விஷ்லிஸ்ட்', orders: 'என் ஆர்டர்கள்',
        electronics: 'எலக்ட்ரானிக்ஸ் & கேஜெட்ஸ்', fashion: 'ட்ரெண்டிங் பேஷன்',
        homeKitchen: 'வீடு & சமையலறை', beauty: 'அழகு & ஸ்கின்கேர்',
        jewellery: 'நகை & ஆபரணங்கள்', sports: 'விளையாட்டு & உடற்பயிற்சி',
        books: 'புத்தகங்கள் & எழுதுபொருள்', allProducts: 'அனைத்து பொருட்கள்',
        spinTitle: 'சுழற்று & வெற்றி பெறு!', spinSubtitle: 'தினமும் கூப்பன்கள் வெல்லுங்கள்!', spinNow: 'இப்போது சுழற்று →',
        viewAll: 'அனைத்தும் காண்க →',
        invoice: 'இன்வாய்ஸ்', downloadInvoice: 'இன்வாய்ஸ் பதிவிறக்கு',
        invoiceReady: 'இன்வாய்ஸ் தயார்! 🧾', orderNotFound: 'ஆர்டர் தரவு கிடைக்கவில்லை!',
    },
    te: {
        search: 'ఉత్పత్తులు, బ్రాండ్లు వెతకండి',
        cart: 'కార్ట్', login: 'లాగిన్', home: 'హోమ్',
        addToCart: 'కార్ట్‌కి జోడించు', buyNow: 'ఇప్పుడు కొనండి',
        freeDelivery: 'ఉచిత డెలివరీ', returnPolicy: '7 రోజుల వాపసు',
        adding: 'జోడిస్తోంది...', added: 'జోడించబడింది!', failed: 'విఫలమైంది',
        wishlist: 'విష్‌లిస్ట్', orders: 'నా ఆర్డర్లు',
        electronics: 'ఎలక్ట్రానిక్స్ & గాడ్జెట్లు', fashion: 'ట్రెండింగ్ ఫ్యాషన్',
        homeKitchen: 'ఇల్లు & వంటగది', beauty: 'అందం & స్కిన్‌కేర్',
        jewellery: 'ఆభరణాలు & యాక్సెసరీలు', sports: 'క్రీడలు & ఫిట్‌నెస్',
        books: 'పుస్తకాలు & స్టేషనరీ', allProducts: 'అన్ని ఉత్పత్తులు',
        spinTitle: 'స్పిన్ చేయండి & గెలవండి!', spinSubtitle: 'రోజూ కూపన్లు గెలవండి!', spinNow: 'ఇప్పుడు స్పిన్ చేయండి →',
        viewAll: 'అన్నీ చూడండి →',
        invoice: 'ఇన్వాయిస్', downloadInvoice: 'ఇన్వాయిస్ డౌన్‌లోడ్',
        invoiceReady: 'ఇన్వాయిస్ సిద్ధం! 🧾', orderNotFound: 'ఆర్డర్ డేటా దొరకలేదు!',
    },
    bn: {
        search: 'পণ্য, ব্র্যান্ড অনুসন্ধান করুন',
        cart: 'কার্ট', login: 'লগইন', home: 'হোম',
        addToCart: 'কার্টে যোগ করুন', buyNow: 'এখনই কিনুন',
        freeDelivery: 'বিনামূল্যে ডেলিভারি', returnPolicy: '৭ দিন ফেরত',
        adding: 'যোগ করা হচ্ছে...', added: 'যোগ হয়েছে!', failed: 'ব্যর্থ',
        wishlist: 'উইশলিস্ট', orders: 'আমার অর্ডার',
        electronics: 'ইলেকট্রনিক্স ও গ্যাজেট', fashion: 'ট্রেন্ডিং ফ্যাশন',
        homeKitchen: 'বাড়ি ও রান্নাঘর', beauty: 'সৌন্দর্য ও স্কিনকেয়ার',
        jewellery: 'গহনা ও আনুষঙ্গিক', sports: 'খেলাধুলা ও ফিটনেস',
        books: 'বই ও স্টেশনারি', allProducts: 'সব পণ্য',
        spinTitle: 'স্পিন করুন ও জিতুন!', spinSubtitle: 'প্রতিদিন কুপন জিতুন!', spinNow: 'এখনই স্পিন করুন →',
        viewAll: 'সব দেখুন →',
        invoice: 'ইনভয়েস', downloadInvoice: 'ইনভয়েস ডাউনলোড',
        invoiceReady: 'ইনভয়েস প্রস্তুত! 🧾', orderNotFound: 'অর্ডার ডেটা পাওয়া যায়নি!',
    },
    mr: {
        search: 'उत्पादने, ब्रँड्स शोधा',
        cart: 'कार्ट', login: 'लॉगिन', home: 'होम',
        addToCart: 'कार्टमध्ये जोडा', buyNow: 'आता खरेदी करा',
        freeDelivery: 'मोफत डिलिव्हरी', returnPolicy: '7 दिवस परतावा',
        adding: 'जोडत आहे...', added: 'जोडले!', failed: 'अयशस्वी',
        wishlist: 'विशलिस्ट', orders: 'माझे ऑर्डर',
        electronics: 'इलेक्ट्रॉनिक्स आणि गॅजेट्स', fashion: 'ट्रेंडिंग फॅशन',
        homeKitchen: 'घर आणि स्वयंपाकघर', beauty: 'सौंदर्य आणि स्किनकेअर',
        jewellery: 'दागिने आणि अॅक्सेसरीज', sports: 'खेळ आणि फिटनेस',
        books: 'पुस्तके आणि स्टेशनरी', allProducts: 'सर्व उत्पादने',
        spinTitle: 'फिरवा आणि जिंका!', spinSubtitle: 'रोज कूपन आणि पॉइंट जिंका!', spinNow: 'आता फिरवा →',
        viewAll: 'सर्व पहा →',
        invoice: 'इनव्हॉइस', downloadInvoice: 'इनव्हॉइस डाउनलोड करा',
        invoiceReady: 'इनव्हॉइस तयार! 🧾', orderNotFound: 'ऑर्डर डेटा सापडला नाही!',
    },
};

// Context
export const LanguageContext = createContext({
    lang: 'en', t: TRANSLATIONS['en'], setLanguage: () => {},
});

// Provider
export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(localStorage.getItem('language') || 'en');
    const setLanguage = (code) => { localStorage.setItem('language', code); setLang(code); };
    return (
        <LanguageContext.Provider value={{ lang, t: TRANSLATIONS[lang] || TRANSLATIONS['en'], setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

// Hook
export const useTranslation = () => useContext(LanguageContext);

// Globe Icon
const GlobeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
);

// Main Component
const LanguageSelector = () => {
    const { lang, setLanguage } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);
    const handleSelect = (code) => { setLanguage(code); setShowMenu(false); };
    const currentLang = LANGUAGES.find(l => l.code === lang);

    return (
        <div className="lang-selector">
            <button className="lang-btn" onClick={() => setShowMenu(!showMenu)}>
                <GlobeIcon />
                <span className="lang-name">{currentLang?.name}</span>
                <span className="lang-arrow">▾</span>
            </button>
            {showMenu && (
                <>
                    <div className="lang-menu">
                        <div className="lang-menu-header">Select Language</div>
                        {LANGUAGES.map(language => (
                            <button key={language.code}
                                className={`lang-option ${lang === language.code ? 'active' : ''}`}
                                onClick={() => handleSelect(language.code)}>
                                <span className="lang-flag">{language.flag}</span>
                                <span className="lang-label">{language.name}</span>
                                {lang === language.code && <span className="lang-check">✓</span>}
                            </button>
                        ))}
                    </div>
                    <div className="lang-overlay" onClick={() => setShowMenu(false)} />
                </>
            )}
        </div>
    );
};

export default LanguageSelector;


