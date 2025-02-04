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
    }

    getYearlyPrice(basePrice) {
        return Math.round(basePrice * (1 - CONFIG.yearlyDiscount/100));
    }

    getExtraSubsPrice(extraSubs) {
        let price = 0;
        let remainingSubs = extraSubs;
        let currentTierIndex = 0;

        while (remainingSubs > 0 && currentTierIndex < CONFIG.subscriberTiers.length) {
            const currentTier = CONFIG.subscriberTiers[currentTierIndex];
            const prevMax = currentTierIndex > 0 ? CONFIG.subscriberTiers[currentTierIndex - 1].max : 0;
            const tierCapacity = currentTier.max - prevMax;
            const subsInTier = Math.min(remainingSubs, tierCapacity);

            if (subsInTier > 0) {
                price = currentTier.price;
            }

            remainingSubs -= subsInTier;
            currentTierIndex++;
        }

        return price;
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