const CONFIG = {
    // Yearly discount percentage
    yearlyDiscount: 20,

    // User license tiers
    userTiers: [
        { max: 3, price: 10, subs: 500 },
        { max: 5, price: 10, subs: 2000 },
        { max: 10, price: 9, subs: 7500 },
        { max: 20, price: 8, subs: 15000 },
        { max: Infinity, price: 7, subs: 20000 }
    ],

    // Subscriber tiers pricing
    subscriberTiers: [
        { max: 100, price: 3 },
        { max: 500, price: 5 },
        { max: 1500, price: 14 },
        { max: 5000, price: 49 },
        { max: 7000, price: 69 },
        { max: 10000, price: 99 },
        { max: 15000, price: 149 },
        { max: 25000, price: 199 },
        { max: 50000, price: 249 },
        { max: 100000, price: 399 },
    ],

    // UI settings
    ui: {
        maxUsers: 100,
        maxSubscribers: 1000000,
        subscribersStep: 500,
        defaultUsers: 4,
        defaultSubscribers: 0
    },

    // Optimization thresholds
    optimization: {
        // Максимальное увеличение цены для предложения апгрейда
        maxPriceIncreasePercent: 15,
        
        // Минимальное увеличение ресурсов для предложения апгрейда
        minUsersIncreasePercent: 50,
        minSubscribersIncreasePercent: 40,
        
        // Приоритеты для разных типов оптимизации (чем выше, тем приоритетнее)
        priority: {
            savings: 3,          // Экономия денег
            unusedSubs: 2,       // Неиспользованные подписчики
            valueUpgrade: 1      // Выгодный апгрейд
        }
    }
}; 