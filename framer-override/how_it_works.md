# System Architecture for Framer Pricing Calculator

**Main Takeaway:**  
A modular pricing calculator in Framer combines (1) reusable slider components, (2) a React Context provider override to share state, and (3) calculation and toggle overrides that consume that state. The system lives entirely within Framer’s Code Components and Overrides ecosystem, ensuring a clear separation of concerns and easy customization.

## 1. Reusable Slider Components  
Each slider (e.g. for “Users” and “Subscribers”) is a standalone Code Component. It:
- Renders an `` with fully customizable props (min, max, step, track/​thumb colors, labels).  
- Manages its own visual state and calls an `onChange(value)` callback to report the numeric value upward.  

You apply a **UsersSlider** or **SubscribersSlider** override (written as a React HOC) to connect each component to shared state. The override supplies the `value` and `onChange` from context rather than local state, unifying all sliders under one store[1].

## 2. React Context Provider Override  
Framer **Overrides** are just React Higher-Order Components (HOCs) that wrap a design layer or Code Component on the canvas[1]. The **PricingProvider** override:

```tsx
export const PricingProvider: Override = (Component) => {
  return (props) => {
    const [users, setUsers] = useState(4)
    const [subscribers, setSubscribers] = useState(0)
    const [isYearly, setIsYearly] = useState(false)

    return (
      
        
      
    )
  }
}
```

- **createContext** defines a shared store object[2].  
- **PricingContext.Provider** wraps one **Container Frame** on the canvas, so all nested Code Components (sliders, toggle, calculator) consume the same state[3].

## 3. Child Overrides: Sliders, Toggle, Price Display  
Inside the provider’s Frame, apply these overrides to your Code Components:

1. **UsersSlider** / **SubscribersSlider**  
   ```tsx
   export const UsersSlider: Override = () => {
     const { users, setUsers } = usePricingContext()
     return { value: users, onChange: setUsers, … }
   }
   ```
2. **YearlyToggle**  
   ```tsx
   export const YearlyToggle: Override = () => {
     const { isYearly, setIsYearly } = usePricingContext()
     return { value: isYearly, onChange: setIsYearly }
   }
   ```
3. **PriceDisplay**  
   ```tsx
   export const PriceDisplay: Override = () => {
     const { users, subscribers, isYearly } = usePricingContext()
     return { users, subscribers, isYearly }
   }
   ```

Each override reads from and writes to the shared context, ensuring all components stay in sync.

## 4. Canvas Setup  
1. **Container Frame** (apply **PricingProvider** override)  
2. Inside it, add Code Components and assign overrides:  
   - Users Slider → **UsersSlider**  
   - Subscribers Slider → **SubscribersSlider**  
   - Yearly Toggle → **YearlyToggle**  
   - Price Calculator → **PriceDisplay**  

Previewing this structure ensures that each child lives **inside** the context provider’s tree so `usePricingContext()` never throws errors[1].

## 5. Further Reading & Sources  
- Framer Code Overrides Overview (HOC pattern)  
  https://www.framer.com/developers/overrides-introduction[1]  
- Framer Blog: Building Synced Pricing Cards with Overrides  
  https://www.framer.com/blog/overrides/[4]  
- React Context API (`createContext`, `useContext`)  
  https://react.dev/reference/react/createContext[2]  
  https://react.dev/reference/react/useContext[3]

[1] https://www.framer.com/developers/overrides-introduction
[2] https://react.dev/reference/react/createContext
[3] https://react.dev/reference/react/useContext
[4] https://www.framer.com/blog/overrides/
[5] https://everythingframer.com/faq/how-to-use-overrides
[6] https://www.loginradius.com/blog/engineering/react-context-api
[7] https://www.framersnippets.com/articles/how-to-add-an-override-in-framer
[8] https://www.framerverse.com/resources/swipe-variant-changer
[9] https://legacy.reactjs.org/docs/legacy-context.html
[10] https://www.youtube.com/watch?v=r_J4Uso27fY
[11] https://www.framer.community/c/developers/newbie-help-with-code-overrides
[12] https://www.framer.com/blog/framer-overrides/
[13] https://legacy.reactjs.org/docs/context.html
[14] https://www.freecodecamp.org/news/how-to-use-react-context/
[15] https://www.codecademy.com/resources/docs/react/context/createContext
[16] https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/context/
[17] https://www.w3schools.com/react/react_usecontext.asp
[18] https://react.dev/learn/passing-data-deeply-with-context
[19] https://szczecinski.eu/docs/advanced-react/context/intro