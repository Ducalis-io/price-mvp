import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * PricingTable – Lists user & subscriber tiers with highlight of the
 * currently-selected tiers from the shared PricingContext.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function PricingTable(props) {
    // Values are passed in via Framer overrides (see PricingContext.tsx)
    const users = props.users ?? 0
    const subscribers = props.subscribers ?? 0

    const [config, setConfig] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch remote pricing configuration (same URL used elsewhere)
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
                /* eslint-disable no-console */
                console.warn("Failed to fetch remote pricing config – falling back to defaults")
                /* eslint-enable no-console */
                // Same offline defaults we use in FinalCalculation
                setConfig({
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

    if (isLoading || !config)
        return (
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "24px",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    ...props.style,
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

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    const formatNumber = (n) => {
        if (n === Infinity) return "∞"
        if (n >= 1000) return `${(n / 1000).toFixed(1)}k` // e.g. 1500 -> "1.5k"
        return n.toString()
    }

    // Determine current tiers for highlight
    const currentUserTierIndex = config.userTiers.findIndex(
        (t) => users <= t.max
    )

    // Extra subscribers above the included allowance of current user tier
    const includedSubs =
        (currentUserTierIndex >= 0 ? config.userTiers[currentUserTierIndex].subs : 0) || 0
    const extraSubs = Math.max(0, subscribers - includedSubs)

    const currentSubTierIndex = config.subscriberTiers.findIndex(
        (t) => extraSubs <= t.max
    )

    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------
    return (
        <div
            style={{
                width: "100%",
                fontFamily: "system-ui, -apple-system, sans-serif",
                ...props.style,
            }}
        >
            {/* ----------------------------------- */}
            {/* USER LICENSE TIERS                 */}
            {/* ----------------------------------- */}
            <h3
                style={{
                    margin: "0 0 12px 0",
                    fontSize: props.titleFontSize,
                    color: props.titleColor,
                    fontWeight: 600,
                }}
            >
                User License Tiers
            </h3>
            {config.userTiers.map((tier, idx) => {
                const min = idx === 0 ? 1 : config.userTiers[idx - 1].max + 1
                const maxLabel = formatNumber(tier.max)
                const isActive = idx === currentUserTierIndex

                return (
                    <div
                        key={`user-${idx}`}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: 12,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? props.highlightColor : "#000",
                        }}
                    >
                        <div
                            style={{
                                fontSize: props.tierFontSize,
                                color: isActive ? props.highlightColor : props.tierColor,
                            }}
                        >
                            {`${min}– ${maxLabel}:`}
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div
                                style={{
                                    fontSize: props.priceFontSize,
                                    color: isActive ? props.highlightColor : props.priceColor,
                                }}
                            >
                                {`$${tier.price}/user`}
                            </div>
                            <div
                                style={{
                                    fontSize: props.includedFontSize,
                                    color: isActive ? props.highlightColor : props.includedColor,
                                    opacity: 0.6,
                                }}
                            >
                                includes {formatNumber(tier.subs)} subs
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* ----------------------------------- */}
            {/* EXTRA SUBSCRIBER TIERS             */}
            {/* ----------------------------------- */}
            <h3
                style={{
                    margin: "32px 0 12px 0",
                    fontSize: props.titleFontSize,
                    color: props.titleColor,
                    fontWeight: 600,
                }}
            >
                Extra Subscribers Pricing
            </h3>
            {config.subscriberTiers.map((tier, idx) => {
                const isActive = idx === currentSubTierIndex && extraSubs > 0
                return (
                    <div
                        key={`subs-${idx}`}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            marginBottom: 8,
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? props.highlightColor : "#000",
                        }}
                    >
                        <span
                            style={{
                                fontSize: props.tierFontSize,
                                color: isActive ? props.highlightColor : props.tierColor,
                            }}
                        >{`Up to ${formatNumber(tier.max)}:`}</span>
                        <span
                            style={{
                                fontSize: props.priceFontSize,
                                color: isActive ? props.highlightColor : props.priceColor,
                            }}
                        >{`$${tier.price}/mo`}</span>
                    </div>
                )
            })}
        </div>
    )
}

// -------------------------------------------------------------------------
// Defaults & property controls
// -------------------------------------------------------------------------
PricingTable.defaultProps = {
    highlightColor: "#0070f3",
    // Typography defaults
    titleColor: "#ffffff",
    titleFontSize: 24,
    tierColor: "#ffffff",
    tierFontSize: 14,
    priceColor: "#ffffff",
    priceFontSize: 14,
    includedColor: "#ffffff",
    includedFontSize: 12,
    // Loader defaults
    loaderText: "Loading pricing…",
    loaderColor: "#888888",
    loaderFontSize: 16,
}

addPropertyControls(PricingTable, {
    highlightColor: { type: ControlType.Color, title: "Highlight" },
    // Title
    titleColor: { type: ControlType.Color, title: "Title Color" },
    titleFontSize: { type: ControlType.Number, title: "Title Size" },
    // Tier name
    tierColor: { type: ControlType.Color, title: "Tier Color" },
    tierFontSize: { type: ControlType.Number, title: "Tier Size" },
    // Price value
    priceColor: { type: ControlType.Color, title: "Price Color" },
    priceFontSize: { type: ControlType.Number, title: "Price Size" },
    // Included value
    includedColor: { type: ControlType.Color, title: "Included Color" },
    includedFontSize: { type: ControlType.Number, title: "Included Size" },
    // Loader controls
    loaderText: { type: ControlType.String, title: "Loader Text" },
    loaderColor: { type: ControlType.Color, title: "Loader Color" },
    loaderFontSize: { type: ControlType.Number, title: "Loader Size" },
}) 