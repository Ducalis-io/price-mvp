import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function NumberStepper(props) {
    // ---------------------------------------------------------------------
    // Internal state mirrors the `value` prop so the component can be used
    // both **controlled** (via `value` + `onChange`) and **uncontrolled**.
    // ---------------------------------------------------------------------
    const [currentValue, setCurrentValue] = useState(props.value ?? props.min)

    // Sync internal state when an external `value` prop changes
    useEffect(() => {
        setCurrentValue(props.value ?? props.min)
    }, [props.value, props.min])

    // Inject CSS once to hide default number input spinners (WebKit & Firefox)
    useEffect(() => {
        if (document.getElementById("number-stepper-style")) return
        const style = document.createElement("style")
        style.id = "number-stepper-style"
        style.textContent = `
            input.number-stepper-input::-webkit-outer-spin-button,
            input.number-stepper-input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input.number-stepper-input {
                -moz-appearance: textfield; /* Firefox */
            }
        `
        document.head.appendChild(style)
    }, [])

    // Helper ‑ keeps the value within min/max bounds
    const clamp = (val) => Math.min(props.max, Math.max(props.min, val))

    // Pass the new value upward (Framer overrides rely on this)
    const propagate = (val) => {
        setCurrentValue(val)
        props.onChange?.(val)
    }

    // ----------------------------------------------------
    // Event handlers
    // ----------------------------------------------------
    const onInputChange = (e) => {
        const raw = e.target.value
        if (raw === "") return // User is mid-typing
        const numeric = Number(raw)
        if (!isNaN(numeric)) propagate(clamp(numeric))
    }

    const increment = () => propagate(clamp(currentValue + props.step))
    const decrement = () => propagate(clamp(currentValue - props.step))

    // Hover states for buttons
    const [isMinusHover, setMinusHover] = useState(false)
    const [isPlusHover, setPlusHover] = useState(false)

    // ----------------------------------------------------
    // Render
    // ----------------------------------------------------
    return (
        <div
            style={{
                width: "100%",
                padding: props.rowPadding,
                background: props.rowBackground,
                border: `1px solid ${props.rowBorderColor}`,
                borderRadius: props.rowBorderRadius,
                display: "flex",
                alignItems: "center",
                gap: props.controlGap,
                fontFamily: "system-ui, -apple-system, sans-serif",
            }}
        >
            {props.showButtons && (
                <button
                    onClick={decrement}
                    disabled={currentValue <= props.min}
                    onMouseEnter={() => setMinusHover(true)}
                    onMouseLeave={() => setMinusHover(false)}
                    style={buttonStyle(
                        props,
                        currentValue <= props.min,
                        isMinusHover
                    )}
                >
                    −
                </button>
            )}

            <input
                className="number-stepper-input"
                type="number"
                value={currentValue}
                min={props.min}
                max={props.max}
                step={props.step}
                onChange={onInputChange}
                style={{
                    flex: 1,
                    minWidth: 0,
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: 300,
                    padding: "8px 12px",
                    borderRadius: 4,
                    border: `1px solid ${props.inputBorderColor}`,
                    background: props.valueBackground,
                    color: props.valueColor,
                }}
            />

            {props.showButtons && (
                <button
                    onClick={increment}
                    disabled={currentValue >= props.max}
                    onMouseEnter={() => setPlusHover(true)}
                    onMouseLeave={() => setPlusHover(false)}
                    style={buttonStyle(
                        props,
                        currentValue >= props.max,
                        isPlusHover
                    )}
                >
                    +
                </button>
            )}
        </div>
    )
}

// -------------------------------------------------------------------------
// Helper – centralises shared button styling so we don't repeat ourselves
// -------------------------------------------------------------------------
const buttonStyle = (props, disabled, hovered = false) => ({
    width: props.buttonSize,
    height: props.buttonSize,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    borderRadius: 4,
    padding: "0 0 2px 0",
    border: `1px solid ${props.buttonBorderColor}`,
    // Apply hover styles only when hovered and not disabled
    background:
        hovered && !disabled
            ? props.buttonHoverBackground
            : props.buttonBackground,
    color: hovered && !disabled ? props.buttonHoverColor : props.buttonColor,
    cursor: "pointer",
    opacity: disabled ? 0.4 : 1,
})

// -------------------------------------------------------------------------
// Default props (also act as sensible design tokens in Framer UI)
// -------------------------------------------------------------------------
NumberStepper.defaultProps = {
    // Value
    min: 1,
    max: 100,
    step: 1,

    // Labels / layout
    rowBackground: "transparent",
    rowBorderColor: "transparent",
    rowBorderRadius: "0px",
    rowPadding: "8px 0",
    controlGap: "8px",

    // Input
    valueColor: "#ffffff",
    valueBackground: "rgba(255,255,255,0.05)",
    inputBorderColor: "#555",

    // Buttons
    showButtons: true,
    buttonSize: 40,
    buttonBackground: "#ffffff",
    buttonColor: "#333",
    buttonBorderColor: "#ccc",
    buttonHoverBackground: "#f0f0f0",
    buttonHoverColor: "#000",
}

// -------------------------------------------------------------------------
// Framer property controls – what shows up in the right sidebar
// -------------------------------------------------------------------------
addPropertyControls(NumberStepper, {
    // Core numeric behaviour
    min: { type: ControlType.Number, title: "Min", defaultValue: 1 },
    max: { type: ControlType.Number, title: "Max", defaultValue: 100 },
    step: { type: ControlType.Number, title: "Step", defaultValue: 1 },

    // Row styling
    rowBackground: { type: ControlType.Color, title: "Row BG" },
    rowBorderColor: { type: ControlType.Color, title: "Row Border" },
    rowBorderRadius: { type: ControlType.String, title: "Row Radius" },
    rowPadding: { type: ControlType.String, title: "Row Padding" },

    // Input styling
    valueColor: { type: ControlType.Color, title: "Value Color" },
    valueBackground: { type: ControlType.Color, title: "Value BG" },
    inputBorderColor: { type: ControlType.Color, title: "Input Border" },

    // Buttons
    showButtons: {
        type: ControlType.Boolean,
        title: "Show ± Buttons",
        defaultValue: true,
    },
    buttonSize: { type: ControlType.Number, title: "Button Size" },
    buttonBackground: { type: ControlType.Color, title: "Button BG" },
    buttonColor: { type: ControlType.Color, title: "Button Color" },
    buttonBorderColor: { type: ControlType.Color, title: "Button Border" },
    buttonHoverBackground: {
        type: ControlType.Color,
        title: "Button Hover BG",
    },
    buttonHoverColor: { type: ControlType.Color, title: "Button Hover Color" },
})
