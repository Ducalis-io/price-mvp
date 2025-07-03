import React, { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * A minimal pill-shaped toggle suitable for billing-cycle switches.
 * No labels ‑ use separate Text layers for “Monthly / Annual”.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 */
export default function YearlyToggle({ style, ...props }) {
    // Allow both controlled & uncontrolled usage -------------------------
    const [internal, setInternal] = useState(props.value ?? false)

    useEffect(() => {
        if (props.value !== undefined) setInternal(props.value)
    }, [props.value])

    const isOn = props.value !== undefined ? props.value : internal

    const toggle = () => {
        const next = !isOn
        props.onChange?.(next)
        if (props.value === undefined) setInternal(next) // uncontrolled
    }

    // Measurements -------------------------------------------------------
    const trackHeight = props.trackHeight
    const trackPadding = props.trackPadding
    const thumbSize = trackHeight - trackPadding * 2

    // Styles -------------------------------------------------------------
    const trackStyle: React.CSSProperties = {
        position: "relative",
        width: "100%", // Framer controls width
        height: trackHeight,
        padding: trackPadding,
        background: isOn ? props.trackOnColor : props.trackOffColor,
        border: `${props.borderWidth}px solid ${props.borderColor}`,
        borderRadius: trackHeight / 2 + props.borderWidth,
        cursor: "pointer",
        transition: "background 0.25s",
        boxSizing: "border-box",
        ...style,
    }

    // Distance thumb needs to travel to reach right side (calculated in CSS)
    const travel = `calc(100% - ${thumbSize + trackPadding * 2}px)`

    const thumbStyle: React.CSSProperties = {
        position: "absolute",
        top: trackPadding,
        left: trackPadding,
        width: thumbSize,
        height: thumbSize,
        borderRadius: "50%",
        background: props.thumbColor,
        boxShadow: props.thumbShadow,
        transform: isOn ? `translateX(${travel})` : "translateX(0)",
        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    }

    return (
        <div style={trackStyle} onClick={toggle}>
            <div style={thumbStyle} />
        </div>
    )
}

// ---------------------------------------------------------------------
// Defaults (also shown in Framer property panel)
// ---------------------------------------------------------------------
YearlyToggle.defaultProps = {
    value: false,
    trackOnColor: "#027aff", // blue
    trackOffColor: "#777777", // grey
    thumbColor: "#ffffff",
    thumbShadow: "0 1px 2px rgba(0,0,0,0.25)",
    borderColor: "#027aff",
    borderWidth: 2,
    trackHeight: 28,
    trackPadding: 2,
}

// ---------------------------------------------------------------------
// Property controls
// ---------------------------------------------------------------------
addPropertyControls(YearlyToggle, {
    value: { type: ControlType.Boolean, title: "On" },
    trackOnColor: { type: ControlType.Color, title: "Track On" },
    trackOffColor: { type: ControlType.Color, title: "Track Off" },
    thumbColor: { type: ControlType.Color, title: "Thumb" },
    thumbShadow: { type: ControlType.String, title: "Thumb Shadow" },
    borderColor: { type: ControlType.Color, title: "Border" },
    borderWidth: { type: ControlType.Number, title: "Border W" },
    trackHeight: { type: ControlType.Number, title: "Height" },
    trackPadding: { type: ControlType.Number, title: "Padding" },
})
