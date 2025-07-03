import type { ComponentType } from "react"
import React, { createContext, useContext, useState } from "react"
import { Override } from "framer"

// Define the context type
interface PricingContextType {
    users: number
    setUsers: (users: number) => void
    subscribers: number
    setSubscribers: (subscribers: number) => void
    isYearly: boolean
    setIsYearly: (isYearly: boolean) => void
}

// Create the context
const PricingContext = createContext<PricingContextType | null>(null)

// Custom hook to use the context
export const usePricingContext = () => {
    const context = useContext(PricingContext)
    if (!context) {
        throw new Error(
            "usePricingContext must be used within a PricingProvider"
        )
    }
    return context
}

// Provider override - This is the key part!
export function PricingProvider(Component: ComponentType): ComponentType {
    return function WrappedPricingProvider(props: any) {
        const [users, setUsers] = useState(4)
        const [subscribers, setSubscribers] = useState(0)
        const [isYearly, setIsYearly] = useState(false)

        return (
            <PricingContext.Provider
                value={{
                    users,
                    setUsers,
                    subscribers,
                    setSubscribers,
                    isYearly,
                    setIsYearly,
                }}
            >
                <Component {...props} />
            </PricingContext.Provider>
        )
    }
}

// Users slider override
export const UsersSlider: Override = () => {
    const context = usePricingContext()

    return {
        value: context.users,
        min: 1,
        max: 100,
        step: 1,
        label: "Number of Users",
        onChange: (newValue: number) => {
            context.setUsers(newValue)
        },
    }
}

// Subscribers slider override
export const SubscribersSlider: Override = () => {
    const context = usePricingContext()

    return {
        value: context.subscribers,
        min: 0,
        max: 100000,
        step: 500,
        label: "Number of Subscribers",
        onChange: (newValue: number) => {
            context.setSubscribers(newValue)
        },
    }
}

// Price calculator override
export const PriceDisplay: Override = () => {
    const context = usePricingContext()

    return {
        users: context.users,
        subscribers: context.subscribers,
        isYearly: context.isYearly,
    }
}

// Price table override
export const PriceTable: Override = () => {
    const context = usePricingContext()

    return {
        users: context.users,
        subscribers: context.subscribers,
        isYearly: context.isYearly,
    }
}

// Optional: Yearly toggle override
export const YearlyToggle: Override = () => {
    const context = usePricingContext()

    return {
        value: context.isYearly,
        onChange: (newValue: boolean) => {
            context.setIsYearly(newValue)
        },
    }
}
