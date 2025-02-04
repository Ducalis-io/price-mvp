import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const PriceCalculator = () => {
  const [users, setUsers] = useState(4);
  const [subscribers, setSubscribers] = useState(1500);
  const [yearly, setYearly] = useState(false);

  const userTiers = [
    { max: 3, price: 20, subs: 1500 },
    { max: 5, price: 18, subs: 5000 },
    { max: 10, price: 16, subs: 15000 },
    { max: 25, price: 15, subs: 35000 },
    { max: 44, price: 12, subs: 75000 },
    { max: 59, price: 10, subs: 150000 },
    { max: Infinity, price: 8, subs: 250000 }
  ];

  const subscriberTiers = [
    { max: 1000, price: 0 },
    { max: 5000, price: 49 },
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
  ];

  const formatNumber = num => {
    if (num >= 1000000) {
      return `${(num/1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num/1000).toFixed(1)}k`;
    }
    return num.toLocaleString('en-US');
  };

  const formatPrice = num => Math.round(num).toLocaleString('en-US');
  
  const formatDiscount = (original, discounted) => {
    return Math.round((1 - discounted/original) * 100);
  };

  const getYearlyPrice = (basePrice) => {
    return Math.round(basePrice * 0.8); // 20% discount
  };

  const handleUserChange = (e) => {
    const value = Math.min(Math.max(1, Number(e.target.value)), 100);
    setUsers(value);
  };

  const handleSubscriberChange = (e) => {
    const value = Math.min(Math.max(0, Number(e.target.value)), 1000000);
    setSubscribers(value);
  };

  const getExtraSubsPrice = (extraSubs) => {
    let price = 0;
    let remainingSubs = extraSubs;
    let currentTierIndex = 0;

    while (remainingSubs > 0 && currentTierIndex < subscriberTiers.length) {
      const currentTier = subscriberTiers[currentTierIndex];
      const prevMax = currentTierIndex > 0 ? subscriberTiers[currentTierIndex - 1].max : 0;
      const tierCapacity = currentTier.max - prevMax;
      const subsInTier = Math.min(remainingSubs, tierCapacity);

      if (subsInTier > 0) {
        price = currentTier.price;
      }

      remainingSubs -= subsInTier;
      currentTierIndex++;
    }

    return price;
  };

  const calculatePrice = useCallback(() => {
    const baseTier = userTiers.find(t => users <= t.max);
    const basePrice = baseTier?.price || 6;
    const userPrice = yearly ? getYearlyPrice(basePrice) : basePrice;
    const includedSubs = baseTier?.subs || 250000;
    const extraSubs = Math.max(0, subscribers - includedSubs);
    const extraSubsPrice = extraSubs > 0 ? getExtraSubsPrice(extraSubs) : 0;

    return {
      usersTotal: users * userPrice,
      extraSubsTotal: extraSubsPrice,
      total: (users * userPrice) + extraSubsPrice,
      includedSubs,
      extraSubs,
      pricePerUser: userPrice
    };
  }, [users, subscribers, yearly]);

  const price = calculatePrice();

  return (
    <Card className="w-full max-w-4xl p-6">
      <CardContent>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Switch id="yearly" checked={yearly} onCheckedChange={setYearly} />
              <Label htmlFor="yearly">Annual billing (20% off)</Label>
            </div>

            <div>
              <Label className="block mb-2">Users</Label>
              <div className="flex gap-4 items-center">
                <Input 
                  type="number"
                  min="1"
                  max="100"
                  value={users}
                  onChange={handleUserChange}
                  className="w-24"
                />
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={users}
                  onChange={handleUserChange}
                  className="flex-1"
                />
              </div>
              <div className="text-sm text-gray-500 mt-1">
                ${formatPrice(price.pricePerUser)}/user/month
              </div>
            </div>

            <div>
              <Label className="block mb-2">Subscribers</Label>
              <div className="flex gap-4 items-center">
                <Input
                  type="number"
                  min="0"
                  max="1000000"
                  step="1000"
                  value={subscribers}
                  onChange={handleSubscriberChange}
                  className="w-32"
                />
                <input
                  type="range"
                  min="0"
                  max="1000000"
                  step="1000"
                  value={subscribers}
                  onChange={handleSubscriberChange}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="grid gap-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Subscribers included:</span>
                  <span>{formatNumber(price.includedSubs)}</span>
                </div>
                {price.extraSubs > 0 && (
                  <div className="flex justify-between">
                    <span>Additional subscribers:</span>
                    <span>{formatNumber(price.extraSubs)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between mb-2">
                <span>Users cost:</span>
                <span>${formatPrice(price.usersTotal)}/mo</span>
              </div>
              {price.extraSubs > 0 && (
                <div className="flex justify-between mb-2">
                  <span>Extra subscribers cost:</span>
                  <span>${formatPrice(price.extraSubsTotal)}/mo</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${formatPrice(price.total)}/{yearly ? 'year' : 'mo'}</span>
                {yearly && <div className="text-sm text-gray-500">(${formatPrice(price.total/12)}/mo)</div>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">User License Tiers</h3>
              <div className="space-y-1 text-sm">
                {userTiers.map((tier, i) => {
                  const yearlyPrice = getYearlyPrice(tier.price);
                  return (
                    <div key={i} className="flex justify-between items-baseline">
                      <span>
                        {i === 0 ? '1' : (userTiers[i-1].max + 1)}-
                        {tier.max === Infinity ? '∞' : tier.max}:
                      </span>
                      <div className="text-right">
                        <div>
                          ${yearly ? yearlyPrice : tier.price}/user
                          {yearly && (
                            <span className="text-green-600 ml-1">
                              (-{formatDiscount(tier.price, yearlyPrice)}%)
                            </span>
                          )}
                        </div>
                        <div className="text-gray-500 text-xs">
                          includes {formatNumber(tier.subs)} subs
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Extra Subscribers Pricing</h3>
              <div className="space-y-1 text-sm">
                {subscriberTiers.map((tier, i) => (
                  <div key={i} className="flex justify-between">
                    <span>Up to {formatNumber(tier.max)}:</span>
                    <span>${tier.price}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceCalculator;