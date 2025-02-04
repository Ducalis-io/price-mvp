const CONFIG = {
    // Yearly discount percentage
    yearlyDiscount: 20,

    // User license tiers
    userTiers: [
        { max: 3, price: 20, subs: 1500 },
        { max: 5, price: 18, subs: 2500 },
        { max: 10, price: 16, subs: 7500 },
        { max: 20, price: 15, subs: 15000 },
        { max: 44, price: 12, subs: 30000 },
        { max: 59, price: 10, subs: 50000 },
        { max: Infinity, price: 8, subs: 70000 }
    ],

    // Subscriber tiers pricing
    subscriberTiers: [
        { max: 100, price: 0 },
        { max: 500, price: 5 },
        { max: 1500, price: 14 },
        { max: 5000, price: 49 },
        { max: 7000, price: 69 },
        { max: 10000, price: 99 },
        { max: 15000, price: 149 },
        { max: 25000, price: 199 },
        { max: 50000, price: 249 },
        { max: 100000, price: 399 },
        { max: 150000, price: 599 },
        { max: 200000, price: 799 },
        { max: 300000, price: 1199 },
        { max: 400000, price: 1599 },
        { max: 500000, price: 1999 },
        { max: 600000, price: 2399 },
        { max: 700000, price: 2799 },
        { max: 800000, price: 3199 },
        { max: 900000, price: 3599 },
        { max: 1000000, price: 3999 }
    ],

    // UI settings
    ui: {
        maxUsers: 100,
        maxSubscribers: 1000000,
        subscribersStep: 500,
        defaultUsers: 4,
        defaultSubscribers: 0
    }
}; 