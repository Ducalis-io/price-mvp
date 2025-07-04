import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function PriceRecipe({ style, ...props }) {
    const [totalPrice, setTotalPrice] = useState(0)
    const [config, setConfig] = useState(null)
    const [breakdown, setBreakdown] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // ---------------------------------------------------------------------
    // Load pricing config (same as before, but stripped of try-catch noise)
    // ---------------------------------------------------------------------
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch(
                    "https://ducalis-io.github.io/price-mvp/config.js"
                )
                const text = await response.text()
                const match = text.match(/const CONFIG = ({[\s\S]*?});/)
                if (match) {
                    setConfig(eval(`(${match[1]})`))
                }
            } catch {
                // Fallback — mirrors previous defaults
                setConfig({
                    yearlyDiscount: 20,
                    userTiers: [
                        { max: 3, price: 10, subs: 500 },
                        { max: 5, price: 10, subs: 2000 },
                        { max: 10, price: 9, subs: 7500 },
                        { max: 20, price: 8, subs: 15000 },
                        { max: Infinity, price: 7, subs: 20000 },
                    ],
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
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchConfig()
    }, [])

    // ---------------------------------------------------------------------
    // Pricing logic (unchanged from original)
    // ---------------------------------------------------------------------
    const calculate = (users, subscribers, yearly = false) => {
        if (!config) return { total: 0, breakdown: null }

        const tier =
            config.userTiers.find((t) => users <= t.max) ||
            config.userTiers[config.userTiers.length - 1]
        const perUserPrice = tier.price
        const userCost = users * perUserPrice

        const included = tier.subs || 0
        const extraSubs = Math.max(0, subscribers - included)

        let extraSubsCost = 0
        if (extraSubs > 0) {
            const subTier =
                config.subscriberTiers.find((t) => extraSubs <= t.max) ||
                config.subscriberTiers[config.subscriberTiers.length - 1]
            extraSubsCost = subTier.price
        }

        let total = userCost + extraSubsCost
        if (yearly && config.yearlyDiscount) {
            total = total * (1 - config.yearlyDiscount / 100)
        }

        return {
            total,
            breakdown: {
                perUserPrice,
                userCost,
                includedSubscribers: included,
                extraSubscribers: extraSubs,
                extraSubscribersCost: extraSubsCost,
                discountPercent: yearly ? config.yearlyDiscount || 0 : 0,
            },
        }
    }

    // Re-calc when inputs change
    useEffect(() => {
        if (config) {
            const { total, breakdown } = calculate(
                props.users,
                props.subscribers,
                props.isYearly
            )
            setTotalPrice(total)
            setBreakdown(breakdown)
        }
    }, [props.users, props.subscribers, props.isYearly, config])

    if (isLoading || !breakdown)
        return (
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "24px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    ...style,
                }}
            >
                <span
                    style={{
                        color: props.loaderColor,
                        fontSize: props.loaderFontSize,
                    }}
                >
                    {props.loaderText}
                </span>
            </div>
        )

    const rows = [
        {
            left: `${props.users} users × $${breakdown.perUserPrice}`,
            right: `$${breakdown.userCost.toFixed(0)}`,
        },
        {
            left: `${breakdown.includedSubscribers.toLocaleString()} subscribers included`,
            right: "$0",
        },
        // Always show extra subscribers row to maintain layout consistency
        {
            left: `${breakdown.extraSubscribers.toLocaleString()} extra subscribers`,
            right: `$${breakdown.extraSubscribersCost}`,
        },
    ]

    // Discount row
    rows.push({
        left: "Annual discount",
        right: `${breakdown.discountPercent}%`,
    })

    return (
        <div
            style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                width: "100%",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                ...style,
            }}
        >
            {/* Divider */}
            <hr
                style={{
                    borderLeft: "none",
                    borderRight: "none",
                    borderBottom: "none",
                    borderTop: "2px dashed rgba(73, 73, 73, 0.35)",
                    width: "100%",
                    paddingBottom: "8px",
                }}
            />

            {/* Breakdown rows */}
            {rows.map((r, idx) => (
                <div
                    key={idx}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        fontSize: 14,
                        color: "#000",
                        marginBottom: 6,
                        width: "100%",
                        fontVariantNumeric: "tabular-nums",
                        paddingBottom: "8px",
                    }}
                >
                    <span style={{ fontWeight: 400 }}>{r.left}</span>
                    <span style={{ fontWeight: 400 }}>{r.right}</span>
                </div>
            ))}

            {/* Divider */}
            <hr
                style={{
                    borderLeft: "none",
                    borderRight: "none",
                    borderBottom: "none",
                    borderTop: "2px dashed rgba(73, 73, 73, 0.35)",
                    width: "100%",
                    paddingBottom: "18px",
                }}
            />

            {/* Upgraded total row */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#000",
                    fontVariantNumeric: "tabular-nums",
                    width: "100%",
                }}
            >
                <span>Total</span>
                <span style={{ color: props.priceColor }}>
                    ${totalPrice.toFixed(0)}/mo
                </span>
            </div>
        </div>
    )
}

PriceRecipe.defaultProps = {
    users: 0,
    subscribers: 0,
    isYearly: false,
    priceColor: "#0070f3",
    // Loader defaults
    loaderText: "Calculating…",
    loaderColor: "#888888",
    loaderFontSize: 16,
}

addPropertyControls(PriceRecipe, {
    loaderText: { type: ControlType.String, title: "Loader Text" },
    loaderColor: { type: ControlType.Color, title: "Loader Color" },
    loaderFontSize: { type: ControlType.Number, title: "Loader Size" },
})
