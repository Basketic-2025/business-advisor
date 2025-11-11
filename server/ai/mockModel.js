const adviceLibrary = {
  kiosk: {
    pricing:
      "Track competitor prices daily; bundle airtime + snacks for +KES 10 margins.",
    branding:
      "Keep shelves clean, label prices clearly, use bright chalkboard offers.",
    competition:
      "Offer early-bird tea and mandazi to capture commuters before rivals open.",
    marketing:
      "Use WhatsApp status for fresh stock updates; reward return jars with discounts.",
  },
  boda: {
    pricing:
      "Log fuel + maintenance, set base fare + per-km so every trip covers KES 30 profit.",
    branding:
      "Wear reflective vest with name/number; keep helmet clean to show professionalism.",
    competition:
      "Pool with other riders for zone scheduling to avoid price wars at stages.",
    marketing:
      "Offer loyalty card—6th trip in a day gets KES 20 off; partner with nearby shops.",
  },
  mitumba: {
    pricing:
      "Sort bale by quality; premium pieces 2.5x cost, fast-movers 1.5x to turn float quickly.",
    branding:
      "Use neat racks, ring light photos, and clear size tags to build trust online.",
    competition:
      "Launch “happy hour” discounts during slow afternoons to pull passersby.",
    marketing:
      "Collect customer contacts, drop weekly style tips on WhatsApp broadcast lists.",
  },
  pastries: {
    pricing:
      "Cost flour, sugar, fuel per batch; keep 35% gross margin even for promos.",
    branding:
      "Use labeled kraft bags, add reheating instructions, wear branded apron.",
    competition:
      "Rotate flavors midweek and offer sampler boxes to stand out from supermarkets.",
    marketing:
      "Deliver to offices via boda partners; run pay-later for trusted chama groups.",
  },
  farming: {
    pricing:
      "Bundle produce (tomato + sukuma) to move perishables fast without slashing prices.",
    branding:
      "Display harvest dates, emphasize organic inputs, share farm photos on Facebook.",
    competition:
      "Negotiate kiosk pre-orders so competitors can’t undercut during glut.",
    marketing:
      "Join local market days, offer tasting plates, and share cooking ideas to upsell.",
  },
};

const planSnippets = {
  kiosk: {
    overview:
      "Grow a neighborhood kiosk that balances fast-moving goods with M-Pesa float discipline.",
    steps: [
      "Audit weekly sales to identify top 20 SKUs and eliminate dead stock.",
      "Introduce bundle promos (bread + milk + airtime) for commuters.",
      "Dedicate KES 500 daily to restock float and capture bill payments.",
      "Track supplier credits and settle every Friday to earn trust.",
      "Use a simple ledger app or notebook for expense vs income tracking.",
    ],
    risks: [
      "Stock spoilage from heat—invest in shade and rotate items mid-day.",
      "Float shortages—keep reserve at home and top up via trusted agent.",
      "Security at night—install motion sensor light and share watch with neighbors.",
    ],
    marketing:
      "Paint storefront with bold price highlights, run WhatsApp order line, and partner with boda riders for deliveries.",
    finances:
      "Start with KES 20,000 stock + KES 10,000 float. Target KES 3,000 daily revenue with 18% gross margin.",
  },
  boda: {
    overview:
      "Operate a reliable boda service focusing on safety, predictable earnings, and fleet-ready discipline.",
    steps: [
      "Record every trip, fare, and fuel refill to know net profit per route.",
      "Schedule preventive maintenance each Sunday afternoon.",
      "Offer cashless payments via M-Pesa QR to office clients.",
      "Join a riders’ SACCO to access emergency funds and insurance.",
      "Upsell parcel delivery during off-peak passenger hours.",
    ],
    risks: [
      "Accidents—increase reflective gear, regular brake checks.",
      "Fuel spikes—negotiate bulk fuel voucher with petrol station.",
      "Police checks—maintain valid license, insurance, and clean logbook copies.",
    ],
    marketing:
      "Provide referral cards, keep contact stickers at salons/shops, and run a loyalty program for frequent riders.",
    finances:
      "Budget KES 120,000 bike + KES 10,000 gear. Aim for KES 2,500 revenue per day, KES 1,400 net after fuel and savings.",
  },
  mitumba: {
    overview:
      "Flip high-quality mitumba bundles quickly through curated drops and digital storytelling.",
    steps: [
      "Define target niche (kids wear, office looks) and source consistent bale supplier.",
      "Steam/iron premium pieces and shoot clear photos for WhatsApp catalogues.",
      "Host twice-weekly live sales to move inventory in under 10 days.",
      "Track unit cost vs sale price in a ledger to know real margins.",
      "Set aside 15% of proceeds toward next bale to avoid borrowing.",
    ],
    risks: [
      "Bale quality disappoints—inspect supplier lots and demand sample preview.",
      "Cashflow gaps—offer deposits on pre-orders before opening a bale.",
      "Weather disruptions—invest in tarps and indoor rack options.",
    ],
    marketing:
      "Collect testimonials, share styling reels, partner with boda riders for 2-hour deliveries within estates.",
    finances:
      "Allocate KES 18,000 for bale, KES 5,000 for branding/steamer, expect 45-55% gross margin if stock clears in 7 days.",
  },
  pastries: {
    overview:
      "Scale a neighborhood pastry kitchen focused on freshness, low wastage, and office delivery contracts.",
    steps: [
      "Standardize recipes with cost cards per ingredient to maintain margins.",
      "Split production into morning (fresh) and afternoon (custom orders).",
      "Invest in airtight containers and daily wastage log.",
      "Secure 3 anchor clients (offices/cafes) for predictable orders.",
      "Offer subscription snack boxes via weekly prepay.",
    ],
    risks: [
      "Ingredient price swings—buy flour/sugar in bulk with chama partners.",
      "Power outages—budget for gas backup or charcoal oven.",
      "Late payments—use 50% deposit terms for custom cakes.",
    ],
    marketing:
      "Leverage Instagram/Facebook stories, run tasting pop-ups at salons, and share behind-the-scenes hygiene videos.",
    finances:
      "Initial KES 25,000 for equipment + KES 10,000 ingredients. Target 35% margin and 60% recurring orders.",
  },
  farming: {
    overview:
      "Build a smallholder venture that balances farm-gate sales with direct-to-consumer deliveries.",
    steps: [
      "Plan crop calendar around rainfall and market demand (e.g., sukuma + onions).",
      "Adopt drip irrigation/ mulch to reduce water cost.",
      "Form buyer agreements with kiosks/CSAs to lock prices.",
      "Process part of harvest (dried veggies/purees) to extend shelf life.",
      "Track input costs vs harvest proceeds for each plot.",
    ],
    risks: [
      "Pest outbreaks—schedule scouting every 3 days and keep organic sprays ready.",
      "Transport delays—partner with boda logistics in advance.",
      "Price drops—store produce in charcoal cooler and sell during evening peak.",
    ],
    marketing:
      "Share farm progress on Facebook groups, invite chamas for farm tours, and bundle produce with simple recipes.",
    finances:
      "Budget KES 15,000 inputs + KES 8,000 irrigation. Aim for KES 5,000 weekly net after labor.",
  },
};

function normalizeBusinessType(type = "") {
  const key = type.toLowerCase();
  if (key.includes("mitumba")) return "mitumba";
  if (key.includes("pastry") || key.includes("bak")) return "pastries";
  if (key.includes("farm")) return "farming";
  if (key.includes("boda")) return "boda";
  if (key.includes("kiosk") || key.includes("duka")) return "kiosk";
  return "generic";
}

function buildGenericAdvice(payload) {
  return {
    pricing: `Keep markup above 25% by reviewing supplier invoices every Friday for ${payload.businessType}.`,
    branding: `Use clean signage and consistent colors so customers remember your ${payload.businessType} brand.`,
    competition:
      "Study nearby players, match service quality, and add small freebies instead of deep discounts.",
    marketing:
      "Collect contacts, share two tips per week online, and encourage referrals with instant rewards.",
  };
}

function buildGenericPlan(payload) {
  return {
    overview: `Launch a resilient ${payload.businessType} that balances cash discipline and customer love.`,
    steps: [
      "Interview 5 target customers to refine offer.",
      "Map startup costs (inventory, licenses, tools) and trim non-essentials.",
      "Create daily sales+expense log and review weekly.",
      "Run a simple promo (bundle or loyalty card) to spark word of mouth.",
      "Reinvest at least 20% of profits for growth.",
    ],
    risks: [
      "Demand dips—add complementary products/services quickly.",
      "Supplier delays—keep two backup vendors with updated contacts.",
      "Cash leaks—separate mobile money for business vs personal.",
    ],
    marketing:
      "Tell your origin story, show proof of quality, and maintain fast response on WhatsApp/Facebook.",
    finances: `Start with KES ${payload.budget || "??"} budget, cap expenses at 70% of capital, and reserve 10% emergency float.`,
  };
}

export function generateAdvice(payload) {
  const key = normalizeBusinessType(payload.businessType);
  const advice = adviceLibrary[key] || buildGenericAdvice(payload);
  return {
    advice,
    tokensUsed: 0,
  };
}

export function generatePlan(payload) {
  const key = normalizeBusinessType(payload.businessType);
  const basePlan = planSnippets[key] || buildGenericPlan(payload);
  return {
    plan: basePlan,
    tokensUsed: 0,
  };
}

export function generateFinanceTips() {
  return {
    tips: [
      "Set aside at least KES 50 daily in a locked tin or chama to grow float.",
      "Separate personal and business M-Pesa; reconcile float every evening.",
      "Write down stock purchases (bale, flour, airtime) and compare sales weekly.",
      "Rotate promo bundles (e.g., bread + milk + airtime) to move slow stock without cutting prices.",
      "Keep a simple fuel/maintenance log if you run deliveries or a boda.",
      "Join a chama or SACCO for emergency funds instead of dipping into float.",
      "Review cashflow every Sunday and tag red-flag expenses you can trim.",
    ],
    tokensUsed: 0,
  };
}
