// Utility functions
const formatNumber = (num) => {
    if (num >= 1000000) {
        return `${(num/1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
        return `${(num/1000).toFixed(1)}k`;
    }
    return num.toLocaleString('en-US');
};

const formatPrice = (num) => Math.round(num).toLocaleString('en-US');

const formatDiscount = (original, discounted) => {
    return Math.round((1 - discounted/original) * 100);
};

// Calculator logic
class PriceCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.renderTiers();
        this.calculate();
    }

    initializeElements() {
        // Inputs
        this.yearlyBilling = document.getElementById('yearlyBilling');
        this.usersNumber = document.getElementById('usersNumber');
        this.usersRange = document.getElementById('usersRange');
        this.subscribersNumber = document.getElementById('subscribersNumber');
        this.subscribersRange = document.getElementById('subscribersRange');

        // Output elements
        this.pricePerUser = document.getElementById('pricePerUser');
        this.includedSubs = document.getElementById('includedSubs');
        this.extraSubs = document.getElementById('extraSubs');
        this.usersCost = document.getElementById('usersCost');
        this.extraSubsCost = document.getElementById('extraSubsCost');
        this.totalCost = document.getElementById('totalCost');
        this.monthlyEquivalent = document.getElementById('monthlyEquivalent');
        this.extraSubsRow = document.getElementById('extraSubsRow');
        this.extraSubsCostRow = document.getElementById('extraSubsCostRow');

        // Lists
        this.userTiersList = document.getElementById('userTiersList');
        this.subscriberTiersList = document.getElementById('subscriberTiersList');

        // Add new elements
        this.adviceContainer = document.getElementById('pricingAdvice');
        this.adviceMessage = this.adviceContainer.querySelector('.advice-message');
        this.applyAdviceButton = this.adviceContainer.querySelector('.apply-advice');
    }

    bindEvents() {
        // Sync number and range inputs
        this.usersNumber.addEventListener('input', (e) => {
            const value = Math.min(Math.max(1, Number(e.target.value)), CONFIG.ui.maxUsers);
            this.usersRange.value = value;
            this.usersNumber.value = value;
            this.calculate();
        });

        this.usersRange.addEventListener('input', (e) => {
            this.usersNumber.value = e.target.value;
            this.calculate();
        });

        this.subscribersNumber.addEventListener('input', (e) => {
            const value = Math.min(Math.max(0, Number(e.target.value)), CONFIG.ui.maxSubscribers);
            this.subscribersRange.value = value;
            this.subscribersNumber.value = value;
            this.calculate();
        });

        this.subscribersRange.addEventListener('input', (e) => {
            this.subscribersNumber.value = e.target.value;
            this.calculate();
        });

        this.yearlyBilling.addEventListener('change', () => {
            this.calculate();
            this.renderTiers();
        });

        this.applyAdviceButton.addEventListener('click', () => {
            if (this.optimalConfig) {
                this.usersNumber.value = this.optimalConfig.users;
                this.usersRange.value = this.optimalConfig.users;
                this.subscribersNumber.value = this.optimalConfig.subscribers;
                this.subscribersRange.value = this.optimalConfig.subscribers;
                this.calculate();
            }
        });
    }

    getYearlyPrice(basePrice) {
        return Math.round(basePrice * (1 - CONFIG.yearlyDiscount/100));
    }

    getExtraSubsPrice(subscribers) {
        const baseTier = CONFIG.userTiers.find(t => Number(this.usersNumber.value) <= t.max);
        const includedSubs = baseTier?.subs || CONFIG.userTiers[CONFIG.userTiers.length - 1].subs;
        return calculateExtraSubscribersCost(subscribers, includedSubs);
    }

    findOptimalConfiguration(currentUsers, currentSubscribers, currentTotal) {
        let bestConfig = null;
        let maxSavings = 0;

        // Текущий тир и включенные подписчики
        const currentTier = CONFIG.userTiers.find(t => currentUsers <= t.max);
        const currentIncludedSubs = currentTier?.subs || CONFIG.userTiers[CONFIG.userTiers.length - 1].subs;

        // Если у клиента есть неиспользованные включенные подписчики
        if (currentSubscribers < currentIncludedSubs) {
            bestConfig = {
                users: currentUsers,
                subscribers: currentIncludedSubs,
                total: currentTotal,
                savings: 0,
                includedSubs: currentIncludedSubs,
                extraSubs: 0,
                pricePerUser: currentTier.price,
                unusedSubscribers: currentIncludedSubs - currentSubscribers,
                type: 'unused_subs'
            };
            return bestConfig;
        }

        // Существующая логика поиска лучшей конфигурации...
        for (const tier of CONFIG.userTiers) {
            // Пропускаем варианты с меньшим количеством пользователей
            if (tier.max < currentUsers) continue;
            
            // Используем минимальное необходимое количество пользователей
            const users = Math.max(currentUsers, 
                tier === CONFIG.userTiers[0] ? 1 : CONFIG.userTiers[CONFIG.userTiers.indexOf(tier) - 1].max + 1);
            
            const includedSubs = tier.subs;
            const basePrice = tier.price;
            const userPrice = this.yearlyBilling.checked ? this.getYearlyPrice(basePrice) : basePrice;

            // Проверяем текущее количество подписчиков
            const extraSubs = Math.max(0, currentSubscribers - includedSubs);
            const extraSubsPrice = extraSubs > 0 ? calculateExtraSubscribersCost(currentSubscribers, includedSubs) : 0;
            const total = users * userPrice + extraSubsPrice;

            const savings = currentTotal - total;
            
            console.log('Checking tier:', {
                users,
                includedSubs,
                extraSubs,
                userPrice,
                extraSubsPrice,
                total,
                savings
            });

            // Проверяем, есть ли реальная экономия и увеличение возможностей
            if (savings > maxSavings && 
                (users > currentUsers || extraSubs < (currentSubscribers - includedSubs))) {
                console.log('Found better configuration!');
                maxSavings = savings;
                bestConfig = {
                    users,
                    subscribers: currentSubscribers,
                    total,
                    savings,
                    includedSubs,
                    extraSubs,
                    pricePerUser: userPrice,
                    type: 'upgrade'
                };
            }
        }

        console.log('Best config found:', bestConfig);
        return bestConfig;
    }

    showAdvice(config) {
        console.log('Showing advice for config:', config);
        if (!config) {
            console.log('No advice to show - no config found');
            this.adviceContainer.style.display = 'none';
            return;
        }

        // Сначала удаляем все возможные классы стилей
        this.adviceContainer.classList.remove('savings', 'unused-subs', 'upgrade');

        if (config.type === 'unused_subs') {
            this.adviceContainer.classList.add('unused-subs');
            this.adviceMessage.innerHTML = `
                Optimization tip: You can add ${formatNumber(config.unusedSubscribers)} more subscribers 
                with your current plan at no extra cost!
                <ul>
                    <li>Increase subscribers to ${formatNumber(config.includedSubs)} at the same price</li>
                </ul>
            `;
        } else {
            const savingsPercent = Math.round((config.savings / this.getCurrentTotal()) * 100);
            const additionalUsers = config.users - Number(this.usersNumber.value);
            
            if (config.savings > 0) {
                this.adviceContainer.classList.add('savings');
            } else {
                this.adviceContainer.classList.add('upgrade');
            }
            
            let savingsText = config.savings > 0 
                ? `Save $${formatPrice(config.savings)}/mo (${savingsPercent}% off)`
                : 'Keep the same monthly price';
            
            this.adviceMessage.innerHTML = `
                Optimization tip: Upgrade to ${config.users} users to:
                <ul>
                    <li>${savingsText}</li>
                    <li>Get ${additionalUsers} additional user license${additionalUsers > 1 ? 's' : ''} with the same number of subscribers</li>
                </ul>
            `;
        }
        
        this.adviceContainer.style.display = 'block';
        this.optimalConfig = config;
    }

    getCurrentTotal() {
        const users = Number(this.usersNumber.value);
        const subscribers = Number(this.subscribersNumber.value);
        const baseTier = CONFIG.userTiers.find(t => users <= t.max);
        const basePrice = baseTier?.price || CONFIG.userTiers[CONFIG.userTiers.length - 1].price;
        const userPrice = this.yearlyBilling.checked ? this.getYearlyPrice(basePrice) : basePrice;
        const includedSubs = baseTier?.subs || CONFIG.userTiers[CONFIG.userTiers.length - 1].subs;
        const extraSubsPrice = subscribers > includedSubs ? this.getExtraSubsPrice(subscribers) : 0;
        return users * userPrice + extraSubsPrice;
    }

    calculate() {
        const users = Number(this.usersNumber.value);
        const subscribers = Number(this.subscribersNumber.value);
        const yearly = this.yearlyBilling.checked;

        const baseTier = CONFIG.userTiers.find(t => users <= t.max);
        const basePrice = baseTier?.price || CONFIG.userTiers[CONFIG.userTiers.length - 1].price;
        const userPrice = yearly ? this.getYearlyPrice(basePrice) : basePrice;
        const includedSubs = baseTier?.subs || CONFIG.userTiers[CONFIG.userTiers.length - 1].subs;
        const extraSubs = Math.max(0, subscribers - includedSubs);
        const extraSubsPrice = extraSubs > 0 ? this.getExtraSubsPrice(subscribers) : 0;

        // Update UI
        this.pricePerUser.textContent = `$${formatPrice(userPrice)}/user/month`;
        this.includedSubs.textContent = formatNumber(includedSubs);
        
        if (extraSubs > 0) {
            this.extraSubsRow.style.display = 'flex';
            this.extraSubsCostRow.style.display = 'flex';
            this.extraSubs.textContent = formatNumber(extraSubs);
            this.extraSubsCost.textContent = `$${formatPrice(extraSubsPrice)}/mo`;
        } else {
            this.extraSubsRow.style.display = 'none';
            this.extraSubsCostRow.style.display = 'none';
        }

        const usersTotal = users * userPrice;
        this.usersCost.textContent = `$${formatPrice(usersTotal)}/mo`;

        const total = usersTotal + extraSubsPrice;
        this.totalCost.textContent = `$${formatPrice(total)}/mo`;
        
        if (yearly) {
            this.monthlyEquivalent.textContent = `(billed annually as $${formatPrice(total * 12)}/year)`;
            this.monthlyEquivalent.style.display = 'block';
        } else {
            this.monthlyEquivalent.style.display = 'none';
        }

        // После расчета total, добавляем:
        const optimalConfig = this.findOptimalConfiguration(users, subscribers, total);
        this.showAdvice(optimalConfig);
    }

    renderTiers() {
        const yearly = this.yearlyBilling.checked;

        // Render user tiers
        this.userTiersList.innerHTML = CONFIG.userTiers.map((tier, i) => {
            const yearlyPrice = this.getYearlyPrice(tier.price);
            const price = yearly ? yearlyPrice : tier.price;
            return `
                <div class="tier-item">
                    <span>
                        ${i === 0 ? '1' : (CONFIG.userTiers[i-1].max + 1)}-
                        ${tier.max === Infinity ? '∞' : tier.max}:
                    </span>
                    <div class="tier-details">
                        <div>
                            $${price}/user
                            ${yearly ? `<span class="discount">(-${CONFIG.yearlyDiscount}%)</span>` : ''}
                        </div>
                        <div class="included-subs">
                            includes ${formatNumber(tier.subs)} subs
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Render subscriber tiers
        this.subscriberTiersList.innerHTML = CONFIG.subscriberTiers.map(tier => `
            <div class="tier-item">
                <span>Up to ${formatNumber(tier.max)}:</span>
                <span>$${tier.price}/mo</span>
            </div>
        `).join('');
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PriceCalculator();
});

function calculateExtraSubscribersCost(totalSubscribers, includedSubscribers) {
    const extraSubscribers = Math.max(0, totalSubscribers - includedSubscribers);
    
    if (extraSubscribers === 0) return 0;
    
    // Находим подходящий тир для количества дополнительных подписчиков
    const tier = CONFIG.subscriberTiers.find(t => extraSubscribers <= t.max);
    
    // Если нашли подходящий тир, возвращаем его цену
    return tier ? tier.price : CONFIG.subscriberTiers[CONFIG.subscriberTiers.length - 1].price;
} 