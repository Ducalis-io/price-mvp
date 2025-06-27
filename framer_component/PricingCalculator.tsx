import * as React from "react";
import { Stack, addPropertyControls, ControlType } from "framer";
import { CONFIG } from "https://ducalis-io.github.io/price-mvp/framer_component/config_framer.js";

interface Props {
  users: number;
  subscribers: number;
  yearlyBilling: boolean;
}

export function PricingCalculator(props: Props) {
  const { users, subscribers, yearlyBilling } = props;

  // Placeholder for pricing calculation logic
  const calculatePrice = (numUsers: number, numSubscribers: number, isYearly: boolean) => {
    let userPrice = 0;
    for (const tier of CONFIG.userTiers) {
      if (numUsers <= tier.max) {
        userPrice = tier.price * numUsers;
        break;
      }
    }

    let subscriberPrice = 0;
    for (const tier of CONFIG.subscriberTiers) {
      if (numSubscribers <= tier.max) {
        subscriberPrice = tier.price * numSubscribers;
        break;
      }
    }

    let totalPrice = userPrice + subscriberPrice;

    if (isYearly) {
      totalPrice *= (1 - CONFIG.yearlyDiscount / 100);
    }

    return totalPrice;
  };

  const totalPrice = calculatePrice(users, subscribers, yearlyBilling);

  return (
    <Stack direction="vertical" gap={16} padding={20} background="#fff" borderRadius={8} shadow="0 2px 10px rgba(0,0,0,0.1)">
      <h2 style={{ color: "#333" }}>Pricing Calculator</h2>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <p>Users: {users}</p>
        <p>Subscribers: {subscribers}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <p>Yearly Billing: {yearlyBilling ? "Yes" : "No"}</p>
      </div>
      <h3 style={{ color: "#007bff" }}>Total Price: ${totalPrice.toFixed(2)} / month</h3>
    </Stack>
  );
}

PricingCalculator.defaultProps = {
  users: CONFIG.ui.defaultUsers,
  subscribers: CONFIG.ui.defaultSubscribers,
  yearlyBilling: false,
};

addPropertyControls(PricingCalculator, {
  users: {
    type: ControlType.Number,
    title: "Users",
    min: 1,
    max: CONFIG.ui.maxUsers,
    step: 1,
    defaultValue: CONFIG.ui.defaultUsers,
  },
  subscribers: {
    type: ControlType.Number,
    title: "Subscribers",
    min: 0,
    max: CONFIG.ui.maxSubscribers,
    step: CONFIG.ui.subscribersStep,
    defaultValue: CONFIG.ui.defaultSubscribers,
  },
  yearlyBilling: {
    type: ControlType.Boolean,
    title: "Yearly Billing",
    defaultValue: false,
  },
});
