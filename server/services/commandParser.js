/**
 * Enhanced Command Parser & AI Business Assistant Service for People Voice
 * 
 * Supports:
 * 1. ADD, REMOVE, CHECK, LOW_STOCK, REORDER, STOCK_EXPLAIN
 * 2. BUSINESS_QUERY: DAILY_ACTIVITY, FASTEST_SELLING, MOST_USED, ATTENTION
 * 3. Mixed / Regional Language (Telugu, Hindi, English hybrid)
 * 4. Fuzzy & Ambiguity-aware product matching
 * 5. Unit normalization & strict quantity handling
 * 6. Confidence scoring (High >= 0.90, Medium 0.70-0.89, Low < 0.70)
 */

// Supported standard units mapping
// Supported standard units mapping covering:
// 1. WEIGHT: mg, g, kg, quintal, tonne, ton
// 2. LIQUID / VOLUME: ml, litre, kilolitre
// 3. COUNT: piece, pieces, unit, units
// 4. PACKAGING / TRADE: bag, bags, packet, packets, box, boxes, carton, cartons, bottle, bottles, can, cans, tin, tins, jar, jars, bundle, bundles, sack, sacks, roll, rolls, pack, packs, crate, crates, tray, trays
// 5. QUANTITY GROUPS: dozen, dozens, pair, pairs, set, sets
// 6. AGRICULTURE / WHOLESALE: quintal, tonne, sack, sacks, bale, bales
export const UNIT_MAP = {
  // --- 1. WEIGHT ---
  'milligram': 'mg',
  'milligrams': 'mg',
  'mg': 'mg',

  'gram': 'grams',
  'grams': 'grams',
  'gm': 'grams',
  'gms': 'grams',
  'g': 'grams',

  'kilogram': 'kg',
  'kilograms': 'kg',
  'kilo': 'kg',
  'kilos': 'kg',
  'kgs': 'kg',
  'kg': 'kg',

  'quintal': 'quintals',
  'quintals': 'quintals',
  'kuntal': 'quintals',
  'kuntallu': 'quintals',

  'tonne': 'tonnes',
  'tonnes': 'tonnes',
  'ton': 'tons',
  'tons': 'tons',

  // --- 2. LIQUID / VOLUME ---
  'millilitre': 'ml',
  'millilitres': 'ml',
  'milliliter': 'ml',
  'milliliters': 'ml',
  'ml': 'ml',

  'litre': 'litres',
  'litres': 'litres',
  'liter': 'litres',
  'liters': 'litres',
  'ltr': 'litres',
  'ltrs': 'litres',
  'l': 'litres',

  'kilolitre': 'kilolitres',
  'kilolitres': 'kilolitres',
  'kiloliter': 'kilolitres',
  'kiloliters': 'kilolitres',
  'kl': 'kilolitres',

  // --- 3. COUNT ---
  'piece': 'pieces',
  'pieces': 'pieces',
  'pc': 'pieces',
  'pcs': 'pieces',
  'item': 'pieces',
  'items': 'pieces',
  'nag': 'pieces',
  'nagulu': 'pieces',

  'unit': 'units',
  'units': 'units',

  // --- 4. PACKAGING / TRADE ---
  'bag': 'bags',
  'bags': 'bags',
  'bosta': 'bags',
  'bostalu': 'bags',
  'bori': 'bags',
  'borilu': 'bags',
  'katta': 'bags',
  'kattalu': 'bags',

  'packet': 'packets',
  'packets': 'packets',
  'pkt': 'packets',
  'pkts': 'packets',

  'box': 'boxes',
  'boxes': 'boxes',
  'peti': 'boxes',
  'petilu': 'boxes',

  'carton': 'cartons',
  'cartons': 'cartons',

  'bottle': 'bottles',
  'bottles': 'bottles',
  'sisa': 'bottles',
  'botlu': 'bottles',

  'can': 'cans',
  'cans': 'cans',

  'tin': 'tins',
  'tins': 'tins',
  'dabba': 'tins',
  'dabbalu': 'tins',

  'jar': 'jars',
  'jars': 'jars',

  'bundle': 'bundles',
  'bundles': 'bundles',
  'kattu': 'bundles',
  'kattulu': 'bundles',

  'sack': 'sacks',
  'sacks': 'sacks',

  'roll': 'rolls',
  'rolls': 'rolls',

  'pack': 'packs',
  'packs': 'packs',

  'crate': 'crates',
  'crates': 'crates',

  'tray': 'trays',
  'trays': 'trays',

  // --- 5. QUANTITY GROUPS ---
  'dozen': 'dozens',
  'dozens': 'dozens',
  'darjan': 'dozens',

  'pair': 'pairs',
  'pairs': 'pairs',
  'jodi': 'pairs',

  'set': 'sets',
  'sets': 'sets',

  // --- 6. AGRICULTURE / WHOLESALE ---
  'bale': 'bales',
  'bales': 'bales',

  // --- 7. TELUGU NATIVE SCRIPT UNITS ---
  'కిలో': 'kg',
  'కిలోలు': 'kg',
  'కిలోల': 'kg',
  'కేజీ': 'kg',
  'కేజీలు': 'kg',
  'కేజీల': 'kg',

  'గ్రాము': 'grams',
  'గ్రాములు': 'grams',
  'గ్రామ్స్': 'grams',
  'గ్రాముల': 'grams',

  'లీటర్': 'litres',
  'లీటర్లు': 'litres',
  'లీటర్ల': 'litres',

  'మిల్లీలీటర్': 'ml',
  'మిల్లీలీటర్లు': 'ml',

  'బ్యాగ్': 'bags',
  'బ్యాగులు': 'bags',
  'బ్యాగుల': 'bags',
  'బస్తా': 'bags',
  'బస్తాలు': 'bags',
  'బస్తాల': 'bags',
  'బోరి': 'bags',
  'బోరీలు': 'bags',
  'కట్ట': 'bags',
  'కట్టలు': 'bags',

  'బాటిల్': 'bottles',
  'బాటిల్స్': 'bottles',
  'బాటిళ్లు': 'bottles',
  'బాటిళ్ల': 'bottles',

  'ప్యాకెట్': 'packets',
  'ప్యాకెట్లు': 'packets',
  'ప్యాకెట్ల': 'packets',

  'బాక్స్': 'boxes',
  'బాక్సులు': 'boxes',
  'బాక్సుల': 'boxes',
  'డబ్బా': 'tins',
  'డబ్బాలు': 'tins',

  'కార్టన్': 'cartons',
  'కార్టన్లు': 'cartons',
  'కార్టన్ల': 'cartons',

  'పీస్': 'pieces',
  'పీసులు': 'pieces',
  'పీసుల': 'pieces',
  'నగం': 'pieces',
  'నగలు': 'pieces',

  'డజన్': 'dozens',
  'డజన్లు': 'dozens',
  'డజన్ల': 'dozens',

  'సాక్': 'sacks',
  'సాక్స్': 'sacks',
  'సాకుల': 'sacks',

  'క్రేట్': 'crates',
  'క్రేట్లు': 'crates',
  'క్రేట్ల': 'crates',

  'బండిల్': 'bundles',
  'బండిల్స్': 'bundles',

  'బేల్': 'bales',
  'బేల్స్': 'bales',

  'క్వింటాల్': 'quintals',
  'క్వింటాళ్లు': 'quintals',
  'క్వింటాలు': 'quintals',

  'టన్ను': 'tonnes',
  'టన్నులు': 'tonnes',
};

// Word-to-number mapping for spoken numbers (English, Telugu script & transliteration, Hindi)
const NUMBER_WORDS = {
  // English
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
  'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
  'twenty five': 25, 'twenty-five': 25,
  'thirty': 30, 'thirty five': 35, 'thirty-five': 35,
  'forty': 40, 'forty five': 45, 'forty-five': 45,
  'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
  'hundred': 100, 'two hundred': 200, 'five hundred': 500,

  // Telugu Numerals (Native Script)
  'ఒకటి': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5,
  'ఆరు': 6, 'ఏడు': 7, 'ఎనిమిది': 8, 'తొమ్మిది': 9, 'పది': 10,
  'పదకొండు': 11, 'పన్నెండు': 12, 'పదమూడు': 13, 'పద్నాలుగు': 14, 'పదిహేను': 15,
  'పదహారు': 16, 'పదిహేడు': 17, 'పద్దెనిమిది': 18, 'పంతొమ్మిది': 19,
  'ఇరవై': 20, 'ముప్పై': 30, 'నలభై': 40, 'యాభై': 50,
  'అరవై': 60, 'డెబ్బై': 70, 'ఎనభై': 80, 'తొంభై': 90,
  'వంద': 100, 'రెండు వందలు': 200, 'ఐదు వందలు': 500, 'వెయ్యి': 1000,

  // Telugu Numerals (Transliterated)
  'okati': 1, 'vendu': 2, 'rendu': 2, 'moodu': 3, 'naalugu': 4, 'nalugu': 4,
  'aidu': 5, 'iydhu': 5, 'aaru': 6, 'yedu': 7, 'edu': 7, 'enimidi': 8,
  'thommidi': 9, 'tommidi': 9, 'padi': 10, 'padhi': 10,
  'iravai': 20, 'muppai': 30, 'nalabhai': 40, 'yaabhai': 50, 'yabhai': 50,
  'aravai': 60, 'debbai': 70, 'enabhai': 80, 'thombhai': 90, 'vanda': 100,

  // Hindi
  'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5, 'panch': 5,
  'che': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10, 'bees': 20, 'pachaas': 50, 'sau': 100,
};

// Product Aliases & Multilingual Transliterations
const PRODUCT_ALIASES = {
  'rice': ['rice', 'ries', 'chawal', 'biyyam', 'biyam', 'రైస్', 'బియ్యం', 'బియ్యము', 'బియ్యపు'],
  'sugar': ['sugar', 'cheeni', 'chini', 'chakkera', 'panchadara', 'షుగర్', 'చక్కెర', 'పంచదార'],
  'cooking oil': ['cooking oil', 'oil', 'edible oil', 'tel', 'nune', 'నూనె', 'తైలం', 'ఆయిల్'],
  'sunflower oil': ['sunflower oil', 'sun flower oil', 'సన్‌ఫ్లవర్ ఆయిల్'],
  'groundnut oil': ['groundnut oil', 'ground nut oil', 'peanut oil', 'pallila nune'],
  'palm oil': ['palm oil'],
  'wheat flour': ['wheat flour', 'atta', 'godhuma pindi', 'gehun atta', 'గోధుమ పిండి', 'గోధుమలు'],
  'milk': ['milk', 'doodh', 'paalu', 'పాలు'],
  'water': ['water', 'neellu', 'neeru', 'mineral water', 'నీళ్లు', 'నీరు', 'వాటర్'],
  'tea powder': ['tea powder', 'tea', 'chai', 'chaye', 'teapowder', 'టీ పొడి', 'టీ'],
  'coffee powder': ['coffee powder', 'coffee', 'kaapi', 'కాఫీ'],
  'biscuits': ['biscuits', 'biscuit', 'biskit', 'బిస్కెట్లు', 'బిస్కెట్'],
  'soap': ['soap', 'soaps', 'sabun', 'sabbu', 'సబ్బులు', 'సబ్బు'],
  'salt': ['salt', 'namak', 'uppu', 'ఉప్పు'],
  'dal': ['dal', 'daal', 'toor dal', 'pappu', 'కందిపప్పు', 'పప్పు'],
};

// Normalize input string
export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\_`~()?'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const parseCommand = (rawInput, knownProducts = []) => {
  const normalized = normalizeText(rawInput);

  const result = {
    action: null,
    product: null,
    quantity: null,
    unit: null,
    rawText: rawInput,
    confidence: 0.95,
    confidenceLevel: 'HIGH', // 'HIGH' (>=0.90) | 'MEDIUM' (0.70-0.89) | 'LOW' (<0.70)
    requiresConfirmation: false,
    confirmationReason: null,
    isBusinessQuery: false,
    isAmbiguous: false,
    candidates: [],
  };

  if (!normalized) {
    result.confidence = 0;
    result.confidenceLevel = 'LOW';
    return result;
  }

  // Uncertainty indicators
  const uncertaintyPatterns = ['maybe', 'around', 'probably', 'not sure', 'perhaps', 'guess', 'approx', 'approximately'];
  const hasUncertainty = uncertaintyPatterns.some(w => normalized.includes(w)) || rawInput.includes('...');

  // Ambiguity guard: "పోయాయి" / "poyayi" can mean lost, spoiled, or sold.
  if (normalized.includes('పోయాయి') || /\b(poyayi|poyindi)\b/i.test(normalized)) {
    if (!normalized.includes('entha') && !normalized.includes('ఎంత') && !normalized.includes('how')) {
      result.action = 'AMBIGUOUS_ACTION';
      result.isAmbiguous = true;
      result.clarificationType = 'DISCARD_OR_SALE';
      result.message = "Did you sell or discard these items? Please say 'Remove [quantity]' or 'Sold [quantity]' to confirm.";
      result.spokenMessage = "Did you sell or discard these items? Please clarify if you sold or discarded them.";
      result.confidence = 0.6;
      result.confidenceLevel = 'LOW';
      return result;
    }
  }

  // Voice confirmation / cancellation commands
  const confirmPhrases = [
    'yes', 'yes do it', 'confirm', 'confirm it', 'go ahead', 'proceed', 'remove it', 'add it',
    'do it', 'అవును', 'అవును చెయ్యి', 'చెయ్యి', 'కన్ఫర్మ్ చెయ్యి', 'సరే', 'ఓకే',
    'yes cheyyi', 'confirm cheyyi', 'okay proceed', 'avunu cheyyi', 'sare cheyyi'
  ];
  const cancelPhrases = [
    'cancel', 'cancel it', 'no', "don't do it", 'dont do it', 'stop', 'abort',
    'వద్దు', 'క్యాన్సిల్', 'ఆపు', 'చేయొద్దు', 'వద్దు చెయ్యొద్దు',
    'cancel cheyyi', 'vaddhu', 'vaddu', 'cheyoddu', 'aapu'
  ];

  if (confirmPhrases.includes(normalized)) {
    result.action = 'CONFIRM_PENDING';
    result.isConfirmationAction = true;
    result.confidence = 0.99;
    result.confidenceLevel = 'HIGH';
    return result;
  }
  if (cancelPhrases.includes(normalized)) {
    result.action = 'CANCEL_PENDING';
    result.isCancellationAction = true;
    result.confidence = 0.99;
    result.confidenceLevel = 'HIGH';
    return result;
  }

  // Build catalog of known products
  const productCatalog = [...new Set([
    ...knownProducts.map(p => p.toLowerCase()),
    'cooking oil', 'sunflower oil', 'groundnut oil', 'palm oil',
    'rice', 'sugar', 'wheat flour', 'biscuits', 'milk', 'tea powder',
    'coffee powder', 'soap', 'salt', 'dal', 'water'
  ])];

  // Intelligent product matcher with aliases & fuzzy lookup (handles suffixes like ki, lo, nunchi, ni, nu, కి, లో, ని)
  const matchProductInfo = (text) => {
    // 1. Direct exact alias match
    for (const [canonical, aliases] of Object.entries(PRODUCT_ALIASES)) {
      for (const alias of aliases) {
        const regex = new RegExp(`(^|\\s)${alias}(?:ki|lo|nunchi|nu|ni|నుండి|కి|క్కి|లో|ని|ను)?(?:\\s|$)`, 'i');
        if (regex.test(text)) {
          // Check if user specifically mentioned a sub-type like "cooking oil" vs just "oil"
          if (canonical === 'cooking oil' && (alias === 'oil' || alias === 'nune' || alias === 'tel' || alias === 'నూనె')) {
            // Check if there are multiple oil products in knownProducts
            const oilCandidates = knownProducts.filter(p => p.toLowerCase().includes('oil'));
            const candidates = oilCandidates.length > 1 ? oilCandidates : ['Cooking Oil', 'Sunflower Oil'];
            return {
              matched: null,
              isAmbiguous: true,
              candidates,
            };
          }
          return { matched: canonical, isAmbiguous: false, candidates: [] };
        }
      }
    }

    // 2. Direct catalog substring/word match (longer names first)
    const sortedCatalog = [...productCatalog].sort((a, b) => b.length - a.length);
    for (const prod of sortedCatalog) {
      const regex = new RegExp(`(^|\\s)${prod}(?:ki|lo|nunchi|nu|ni|నుండి|కి|క్కి|లో|ని|ను|\\b|\\s|$)`, 'i');
      if (regex.test(text)) {
        return { matched: prod, isAmbiguous: false, candidates: [] };
      }
    }

    return { matched: null, isAmbiguous: false, candidates: [] };
  };

  // 1. FASTEST_SELLING / MOST_USED BUSINESS QUERIES
  const fastestSellingPatterns = [
    'selling fastest', 'fastest selling', 'highest selling', 'top selling',
    'which product sells fastest', 'most sold', 'best seller', 'top product',
    'బాగా వాడుతున్నాం', 'ఎక్కువగా అమ్ముతున్నాం', 'త్వరగా అయిపోతున్నాయి',
    'ఎక్కువగా అవసరం అవుతున్నాయి', 'ఎంత అమ్మకం జరిగింది'
  ];
  if (fastestSellingPatterns.some(p => normalized.includes(p))) {
    result.action = 'FASTEST_SELLING';
    result.isBusinessQuery = true;
    result.confidence = 0.95;
    result.confidenceLevel = 'HIGH';
    return result;
  }

  const mostUsedPatterns = [
    'most used', 'most used products', 'frequently used', 'high usage', 'most active products'
  ];
  if (mostUsedPatterns.some(p => normalized.includes(p))) {
    result.action = 'MOST_USED';
    result.isBusinessQuery = true;
    result.confidence = 0.94;
    result.confidenceLevel = 'HIGH';
    return result;
  }

  // 2. STOCK_EXPLAIN ("How is my rice stock?", "Explain my rice stock", "బియ్యం స్టాక్ ఎలా ఉంది?")
  const explainPatterns = [
    // English
    'how is my', 'how is the', 'explain my', 'explain', 'tell me about',
    'how is', 'stock status of', 'do i have enough', 'summary of', 'details of',
    'stock okay', 'should i order more', 'why is', 'why do i need to reorder',
    'how long will', 'use every day', 'average usage',
    // Telugu Script
    'స్టాక్ ఎలా ఉంది', 'స్టాక్ పరిస్థితి ఏంటి', 'గురించి చెప్పు', 'ఎంత రోజులు వస్తుంది',
    'ఎన్ని రోజులు వస్తుంది', 'ఎందుకు తక్కువగా ఉంది', 'ఇంకా కొనాలా', 'ఎప్పుడు రీస్టాక్ చేయాలి',
    'స్టాక్ బాగుందా', 'బాగుందా', 'పరిస్థితి ఏంటి', 'బిజినెస్ స్టాక్ ఎలా ఉంది',
    // Telugu Transliterated
    'stock ela undi', 'paristhiti enti', 'gurinchi cheppu', 'enni rojulu vastundi',
    'rojuki entha vadutunnam', 'inka konala', 'stock bagunda', 'minimum stock entha',
    'reorder suggestion enti', 'ela undi', 'stock ela undi'
  ];
  const isExplainTrigger = explainPatterns.some(p => normalized.includes(p));
  if (isExplainTrigger) {
    const prodMatch = matchProductInfo(normalized);
    if (prodMatch.matched) {
      const canonicalName = knownProducts.find(p => p.toLowerCase() === prodMatch.matched.toLowerCase()) || 
                            prodMatch.matched.charAt(0).toUpperCase() + prodMatch.matched.slice(1);
      result.action = 'STOCK_EXPLAIN';
      result.product = canonicalName;
      result.isBusinessQuery = true;
      result.confidence = 0.96;
      result.confidenceLevel = 'HIGH';
      return result;
    }
  }

  // 3. DAILY_ACTIVITY ("Show today's stock changes", "ఈరోజు స్టాక్లో ఏం మారింది?")
  const activityPatterns = [
    // English
    'stock changes', 'what changed today', 'today s stock changes', 'todays stock changes',
    'stock activity', 'today activity', 'today s activity', 'show today', 'what happened today',
    'how much stock did i add today', 'how much stock was added today',
    'how much stock was removed today', 'how much did i remove today', 'today summary',
    'what did i add today', 'what did i remove today', 'today s transactions', 'todays transactions',
    'how much stock came in today', 'how much stock went out today', 'what happened to my inventory today',
    // Telugu Script
    'ఈరోజు స్టాక్లో ఏం మారింది', 'ఈరోజు ఏం యాడ్ చేశాం', 'ఈరోజు ఏం అమ్మాం', 'ఈరోజు ఏం తీసివేశాం',
    'ఈరోజు ట్రాన్సాక్షన్స్ చూపించు', 'ట్రాన్సాక్షన్స్ చూపించు', 'ఈరోజు ఎంత స్టాక్ వచ్చింది',
    'ఈరోజు ఎంత స్టాక్ పోయింది', 'ఈరోజు ఇన్వెంటరీ ఎలా ఉంది', 'ఏం మారింది',
    // Telugu Transliterated
    'em stock changes unnayi', 'em add chesam', 'today em add chesam', 'today em sell chesam',
    'em sell chesam', 'today s transactions chupinchu', 'todays transactions chupinchu',
    'transactions chupinchu', 'today stock changes enti', 'inventory lo em jarigindi today',
    'em jarigindi today', 'ivala em marindi', 'stock lo em marindi', 'today rice emaina add ayyinda',
    'today rice emaina sell ayyinda'
  ];
  if (activityPatterns.some(p => normalized.includes(p))) {
    result.action = 'DAILY_ACTIVITY';
    const prodMatch = matchProductInfo(normalized);
    result.product = prodMatch.matched;
    result.isBusinessQuery = true;
    result.confidence = 0.95;
    result.confidenceLevel = 'HIGH';
    return result;
  }

  // 4. ATTENTION ("Which items need attention?", "ఏ వస్తువుల మీద దృష్టి పెట్టాలి?")
  const attentionPatterns = [
    'need attention', 'needs attention', 'urgent items', 'critical products', 'almost finished',
    'దృష్టి పెట్టాలి'
  ];
  if (attentionPatterns.some(p => normalized.includes(p))) {
    result.action = 'ATTENTION';
    result.isBusinessQuery = true;
    result.confidence = 0.95;
    result.confidenceLevel = 'HIGH';
    return result;
  }

  // 5. LOW_STOCK ("What is running low?", "ఏవి తక్కువగా ఉన్నాయి?", "Em stock takkuvaga undi")
  const lowStockPatterns = [
    // English
    'running low', 'low stock', 'what is running low', 'what s running low', 'whats running low',
    'which products are low', 'show low stock', 'low stock items', 'what needs attention',
    'almost finished', 'running out', 'what should i restock', 'which products need restocking',
    'below minimum stock', 'are any products running low', 'critical products',
    // Telugu Script
    'ఏ వస్తువులు తక్కువగా ఉన్నాయి', 'ఏవి తక్కువ స్టాక్లో ఉన్నాయి', 'ఏవి అయిపోతున్నాయి',
    'ఏ వస్తువులు అయిపోవడానికి దగ్గరలో ఉన్నాయి', 'ఏవి మళ్లీ కొనాలి', 'ఏ వస్తువులు రీస్టాక్ చేయాలి',
    'తక్కువ స్టాక్ ఉన్నవి చూపించు', 'స్టాక్ తక్కువగా ఉన్న వస్తువులు ఏవి', 'ఏ వస్తువులకు స్టాక్ కావాలి',
    'ఏవి వెంటనే కొనాలి', 'తక్కువగా ఉన్నాయి', 'అయిపోతున్నాయి',
    // Telugu Transliterated
    'low stock products chupinchu', 'low stock chupinchu', 'takkuva unnaayi', 'takkuvaga unnayi',
    'takkuvaga undi', 'takkuva undi', 'takkuva undhi', 'takkuvaga undhi',
    'em stock takkuvaga undi', 'em takkuvaga undi', 'em stock takkuva undi', 'em takkuva undi',
    'takkuva stock', 'kam stock', 'which products low ga unnayi', 'low ga unnayi',
    'almost aipothunnayi', 'aipothunnayi', 'ayipothunnayi', 'naaku low stock items cheppu'
  ];
  if (lowStockPatterns.some(p => normalized.includes(p))) {
    result.action = 'LOW_STOCK';
    result.isBusinessQuery = true;
    result.confidence = 0.96;
    result.confidenceLevel = 'HIGH';
    return result;
  }

  // 6. REORDER / BUY_TODAY ("What do I need to buy today?", "ఈరోజు ఏం కొనాలి?", "Em konali?")
  const reorderPatterns = [
    // English
    'what do i need to buy today', 'what should i buy today', 'what should i buy',
    'what to buy today', 'what to buy', 'what do i need to reorder', 'what should i reorder',
    'what to reorder', 'purchase suggestions', 'today s purchase suggestions',
    'todays purchase suggestions', 'which products should i purchase', 'how much should i reorder',
    'how much should i order', 'before stock runs out', 'reorder recommendations',
    'which products need immediate restocking',
    // Telugu Script
    'ఈరోజు ఏం కొనాలి', 'ఈ రోజు ఏం కొనాలి', 'ఏం రీస్టాక్ చేయాలి', 'ఏ వస్తువులు మళ్లీ కొనాలి',
    'ఏం ఆర్డర్ చేయాలి', 'ఎంత ఆర్డర్ చేయాలి', 'ఎంత కొనాలి', 'ఈరోజు కొనాల్సిన వస్తువులు ఏవి',
    'స్టాక్ అయిపోకముందు ఏం కొనాలి', 'కొనాల్సిన వాటి లిస్ట్ చూపించు', 'కొనాల్సిన వాటి లిస్ట్',
    'ఏం కొనాలి',
    // Telugu Transliterated
    'em purchase cheyyali today', 'em purchase cheyyali', 'em order cheyyali', 'entha order cheyyali',
    'reorder kavala', 'ivala em konalo cheppu', 'naaku ivala em konalo cheppu', 'reorder',
    'em konali', 'em konali cheppu', 'em konalo'
  ];
  if (reorderPatterns.some(p => normalized.includes(p))) {
    result.action = 'REORDER';
    result.isBusinessQuery = true;
    result.confidence = 0.96;
    result.confidenceLevel = 'HIGH';
    return result;
  }

  // 7. CHECK ("How much rice do I have?", "బియ్యం ఎంత ఉంది?", "Rice stock entha undi?")
  const checkPatterns = [
    // English
    'how much', 'how many', 'check', 'what is the stock', 'what s the', 'whats the',
    'show me', 'show stock', 'available stock', 'do i have', 'how many bags of',
    'how many bottles of', 'how much sugar is available', 'how many bottles of water are there',
    'tell me my', 'show me available', 'do i have enough', 'how much inventory do i have',
    'what s left in stock', 'whats left in stock',
    // Telugu Script
    'ఎంత ఉంది', 'ఎన్ని ఉన్నాయి', 'స్టాక్ ఎంత ఉంది', 'నా దగ్గర ఎంత', 'ఎన్ని బ్యాగులు ఉన్నాయి',
    'ఎన్ని బాటిల్స్ ఉన్నాయి', 'నా స్టాక్ చూపించు', 'స్టాక్ ఎంత ఉంది', 'ఏ ఏ వస్తువులు స్టాక్లో ఉన్నాయి',
    'ఇంకా ఎంత మిగిలింది', 'సరిపోతుందా', 'ఉంది', 'ఉన్నాయి',
    // Telugu Transliterated
    'entha undi', 'entha undhi', 'enni unnayi', 'stock entha undi', 'stock entha',
    'na inventory chupinchu', 'na stock lo em unnayi', 'inka entha migilindi',
    'stock low unda', 'saripotunda', 'kitna hai', 'dikhao'
  ];
  const isExplicitCheck = checkPatterns.some(p => normalized.includes(p));

  // 8. ADD & REMOVE Keywords (Multilingual Telugu, Hindi, English)
  const addKeywords = [
    // English
    'add', 'added', 'put', 'put in stock', 'increase', 'received', 'i received', 'got', 'i got',
    'stock up', 'came', 'bought', 'i bought', 'purchased', 'plus', 'restock',
    // Telugu Script
    'యాడ్ చెయ్యి', 'యాడ్ చేయి', 'స్టాక్లో పెట్టు', 'స్టాక్ లో పెట్టు', 'పెట్టు',
    'వచ్చాయి', 'వచ్చింది', 'కొన్నాను', 'కలుపు', 'చేర్చు',
    // Telugu Transliterated
    'add cheyyi', 'add chey', 'vesey', 'veseyi', 'kalupu', 'cherchu', 'pettu',
    'stocklo pettu', 'vachayi', 'vachindi', 'konnanu', 'karo', 'dal do'
  ];

  const removeKeywords = [
    // English
    'remove', 'removed', 'take out', 'reduce', 'decrease', 'sell', 'sold', 'i sold',
    'delete', 'minus', 'dispatch', 'deduct', 'take away',
    // Telugu Script
    'తీసివేయి', 'తీసేయి', 'తగ్గించు', 'అమ్మాను', 'అమ్మాం', 'అమ్మేసాం', 'సేల్ చెయ్యి', 'రిమూవ్ చెయ్యి',
    // Telugu Transliterated
    'remove cheyyi', 'remove chey', 'teesey', 'theesey', 'theeyi', 'teeyi', 'teesiveyi',
    'tagginchu', 'ammanu', 'ammamu', 'ammam', 'ammesam', 'nikalo', 'hatao', 'kam karo', 'becha'
  ];

  let action = null;

  if (isExplicitCheck) {
    action = 'CHECK';
  } else {
    // Check removal keywords first
    for (const kw of removeKeywords) {
      const regex = new RegExp(`(^|\\s)${kw}(\\s|$)`, 'i');
      if (regex.test(normalized)) {
        action = 'REMOVE';
        break;
      }
    }

    if (!action) {
      for (const kw of addKeywords) {
        const regex = new RegExp(`(^|\\s)${kw}(\\s|$)`, 'i');
        if (regex.test(normalized)) {
          action = 'ADD';
          break;
        }
      }
    }
  }

  // Fallback heuristic for action
  if (!action) {
    if (normalized.startsWith('how') || normalized.startsWith('what') || normalized.includes('have') || normalized.includes('entha')) {
      action = 'CHECK';
    } else if (normalized.includes('add') || normalized.includes('plus')) {
      action = 'ADD';
    } else if (normalized.includes('remove') || normalized.includes('minus') || normalized.includes('tees')) {
      action = 'REMOVE';
    } else {
      action = 'ADD';
    }
  }

  result.action = action;

  // 9. EXTRACT QUANTITY (including negative numbers or words)
  // Inquiry actions do not set/modify inventory quantity
  const isInquiryAction = ['CHECK', 'STOCK_EXPLAIN', 'LOW_STOCK', 'REORDER', 'DAILY_ACTIVITY', 'ATTENTION', 'FASTEST_SELLING', 'MOST_USED'].includes(action);

  if (!isInquiryAction) {
    // Check for negative numbers like -10 or - 10
    const negMatch = normalized.match(/(?:^|\s)(-\s*\d+(?:\.\d+)?)(?:\s|$)/);
    if (negMatch) {
      result.quantity = parseFloat(negMatch[1].replace(/\s+/g, ''));
    } else {
      const numberRegex = /\b(\d+(?:\.\d+)?)\b/;
      const numMatch = normalized.match(numberRegex);
      if (numMatch) {
        result.quantity = parseFloat(numMatch[1]);
      } else {
        // Check word numerals
        for (const [word, val] of Object.entries(NUMBER_WORDS)) {
          if (word === 'do') {
            // Guard against English auxiliary verb "do"
            if (/\b(?:how|what|why|where)\s+do\b/i.test(normalized) || /\bdo\s+(?:i|you|we|they|not|n't)\b/i.test(normalized)) {
              continue;
            }
          }
          const wordRegex = new RegExp(`(^|\\s)${word.trim()}(\\s|$)`, 'i');
          if (wordRegex.test(normalized)) {
            result.quantity = val;
            break;
          }
        }
      }
    }
  }

  // 10. EXTRACT UNIT
  const sortedUnitKeys = Object.keys(UNIT_MAP).sort((a, b) => b.length - a.length);
  for (const unitKey of sortedUnitKeys) {
    const unitRegex = new RegExp(`(^|\\s)${unitKey}(\\s|$)`, 'i');
    if (unitRegex.test(normalized)) {
      result.unit = UNIT_MAP[unitKey];
      break;
    }
  }

  // 11. EXTRACT PRODUCT
  const prodMatch = matchProductInfo(normalized);
  if (prodMatch.isAmbiguous) {
    result.isAmbiguous = true;
    result.candidates = prodMatch.candidates;
    result.product = null;
  } else if (prodMatch.matched) {
    // Standardize casing to match DB canonical names
    const canonicalName = knownProducts.find(p => p.toLowerCase() === prodMatch.matched.toLowerCase()) || 
                          prodMatch.matched.charAt(0).toUpperCase() + prodMatch.matched.slice(1);
    result.product = canonicalName;
  } else if (['ADD', 'REMOVE', 'CHECK', 'STOCK_EXPLAIN'].includes(action)) {
    // Custom product extraction by stripping stopwords
    let cleaned = normalized;
    cleaned = cleaned.replace(/\b-?\d+(?:\.\d+)?\b/g, '');
    Object.keys(NUMBER_WORDS).forEach(w => {
      cleaned = cleaned.replace(new RegExp(`\\b${w.trim()}\\b`, 'gi'), '');
    });
    Object.keys(UNIT_MAP).forEach(u => {
      cleaned = cleaned.replace(new RegExp(`\\b${u}\\b`, 'gi'), '');
    });
    const noiseWords = [
      'add', 'added', 'remove', 'removed', 'sold', 'sell', 'how', 'much', 'many',
      'do', 'i', 'have', 'what', 'is', 'the', 'stock', 'of', 'in', 'inventory',
      'please', 'can', 'you', 'cheyyi', 'chey', 'theeyi', 'teeyi', 'teesey', 'theesey',
      'karo', 'hai', 'undi', 'undhi', 'unnaayi', 'unnaaya', 'bosta', 'bori', 'veseyi',
      'vesey', 'kalupu', 'dabba', 'dikhao', 'chupu', 'chupinchu', 'to', 'from', 'bags',
      'cartons', 'kg', 'litres', 'grams', 'explain', 'tell', 'status', 'check',
      'ki', 'lo', 'nunchi', 'stakki', 'stocklo', 'inka', 'today', 'ivala', 'na', 'naaku',
      'cheppu', 'stak', 'ni', 'nu', 'ని', 'ను', 'enti', 'ela', 'ఏంటి', 'ఎలా',
      'వచ్చాయి', 'వచ్చింది', 'కొన్నాను', 'తీసేయి', 'తీసివేయి', 'తగ్గించు',
      'అమ్మాను', 'అమ్మాం', 'ఎంత', 'ఎన్ని', 'ఉంది', 'ఉన్నాయి', 'ఈరోజు', 'స్టాక్', 'స్టాక్కి',
      'లో', 'కి', 'క్కి', 'నుండి', 'నంచి'
    ];
    noiseWords.forEach(nw => {
      cleaned = cleaned.replace(new RegExp(`(^|\\s)${nw}(\\s|$)`, 'gi'), ' ');
    });
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    if (cleaned && cleaned.length >= 2) {
      // Capitalize first letter
      result.product = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }

  // 12. CONFIDENCE EVALUATION
  let score = 0.20;
  if (result.action) score += 0.30;
  if (result.product) score += 0.25;
  if (result.quantity !== null && !isNaN(result.quantity)) score += 0.15;
  if (result.unit) score += 0.10;

  // Inquiries like CHECK, STOCK_EXPLAIN, LOW_STOCK, REORDER do not have quantities/units
  if (['CHECK', 'STOCK_EXPLAIN'].includes(result.action) && result.product) {
    score = 0.95;
  } else if (['LOW_STOCK', 'REORDER', 'DAILY_ACTIVITY', 'ATTENTION', 'FASTEST_SELLING', 'MOST_USED'].includes(result.action)) {
    score = 0.95;
  }

  if (hasUncertainty) {
    score -= 0.25;
  }

  // Cap score
  result.confidence = Math.max(0.20, Math.min(0.98, parseFloat(score.toFixed(2))));

  if (result.confidence >= 0.90) {
    result.confidenceLevel = 'HIGH';
  } else if (result.confidence >= 0.70) {
    result.confidenceLevel = 'MEDIUM';
    result.requiresConfirmation = true;
    result.confirmationReason = 'Confidence is moderate (70–89%). Please verify details.';
  } else {
    result.confidenceLevel = 'LOW';
    result.requiresConfirmation = true;
    result.confirmationReason = 'Low confidence (below 70%). Please clarify command.';
  }

  return result;
};

export default {
  parseCommand,
  normalizeText,
  UNIT_MAP,
};
