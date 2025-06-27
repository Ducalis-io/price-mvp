# План по созданию интерактивного Framer Code Component на основе существующего `@config.js`

## 1. Подготовка конфигурационного файла  
Переместить ваш файл `@config.js` в папку **code** проекта Framer. Преобразовать его в ES-модуль, если это ещё не сделано:
```js
// code/config.js
const pricingConfig = {
  tiers: [
    { name: "Basic", price: 10, features: ["A", "B"] },
    { name: "Pro",   price: 20, features: ["A", "B", "C"] },
    { name: "Max",   price: 30, features: ["A", "B", "C", "D"] },
  ],
  currency: "$",
};
export default pricingConfig;
```
Это позволит импортировать настройки напрямую в кодовом компоненте Framer[1].

## 2. Создание Code Component  
1. В Framer: панель **Assets → Code → Create Code File**, назвать его, например, `PricingTable.tsx`.  
2. Основная структура компонента:
   ```tsx
   import * as React from "react";
   import { Stack, addPropertyControls, ControlType } from "framer";
   import pricingConfig from "./config";

   interface Props {
     highlightTier: number;
   }

   export function PricingTable(props: Props) {
     const { highlightTier } = props;
     const [selected, setSelected] = React.useState<number>(highlightTier);

     return (
       <Stack direction="vertical" gap={16}>
         {pricingConfig.tiers.map((tier, index) => (
           <div
             key={index}
             onClick={() => setSelected(index)}
             style={{
               border: index === selected ? "2px solid blue" : "1px solid #ccc",
               padding: 16,
               cursor: "pointer",
             }}
           >
             <h3>{tier.name}</h3>
             <p>{pricingConfig.currency}{tier.price}</p>
           </div>
         ))}
       </Stack>
     );
   }

   PricingTable.defaultProps = {
     highlightTier: 0,
   };

   addPropertyControls(PricingTable, {
     highlightTier: {
       type: ControlType.Number,
       title: "Start Tier",
       min: 0,
       max: pricingConfig.tiers.length - 1,
       step: 1,
     },
   });
   ```
   - **Импорт конфига** через `import pricingConfig from "./config"`[1].  
   - **Стейт** для интерактивного выбора уровня тарифа.  
   - **Property Controls** для начального выделенного тарифа[2].  

## 3. Добавление интерактивного калькулятора  
Внутри компонента можно расширить функционал:
- Добавить `input` для количества пользователей или месяцев.
- Рассчитывать итоговую сумму:  
  ```tsx
  const [quantity, setQuantity] = React.useState(1);
  const total = pricingConfig.tiers[selected].price * quantity;
  ```
- Отобразить `input` и итоговую стоимость:
  ```tsx
  <input
    type="number"
    value={quantity}
    min={1}
    onChange={e => setQuantity(+e.target.value)}
  />
  <p>Total: {pricingConfig.currency}{total}</p>
  ```

## 4. Настройка внешнего вида в Framer  
После создания компонента:
1. Перетащить `PricingTable` из панели компонентов на холст.  
2. В правой панели свойств изменить `Start Tier` и при необходимости стили (цвета, отступы).  
3. Использовать обычные Framer-слои и стеки внутри компонента для полной поддержки адаптивной верстки.

## 5. Итоговая структура проекта  
```
MyFramerProject/
└── code/
    ├── config.js         ← ваш ES-модуль с настройками
    └── PricingTable.tsx  ← кодовой компонент
```

Этот подход позволяет:
- **Повторно использовать** одну и ту же конфигурацию в разных компонентах.
- **Дизайнерам** настраивать параметры через Property Controls.
- **Разрабатывать** логику калькулятора в коде, сохраняя гибкость визуального редактирования в Framer.

Sources
[1] Framer X: Using local JSON data to populate design components https://blog.prototypr.io/framer-x-using-local-json-data-to-populate-design-components-302d453b4300
[2] Use real data in Framer X - Prototypr https://blog.prototypr.io/use-real-data-in-framer-x-3801834e3f59
[3] Components using API data : r/framer - Reddit https://www.reddit.com/r/framer/comments/1d8sktp/components_using_api_data/
[4] Importing a component designed in Framer into a Framer code ... https://www.framersnippets.com/articles/importing-a-component-designed-in-framer-into-a-framer-code-component
[5] JSON Sync — Framer Marketplace https://www.framer.com/marketplace/plugins/json-sync/
[6] Getting started with Property Controls — Framer Code Components https://www.youtube.com/watch?v=ZvFWRUDH41o
[7] How can I use fetch to display a list of items - framer - Reddit https://www.reddit.com/r/framer/comments/1f9ivyp/how_can_i_use_fetch_to_display_a_list_of_items/
[8] Can we use Custom javascript with API call through ElementID https://www.reddit.com/r/framer/comments/1bersvr/can_we_use_custom_javascript_with_api_call/
[9] Framer for Developers https://www.framer.com/developers/
[10] biberDigi/framer - GitHub https://github.com/biberDigi/framer
[11] GitHub - sonnylazuardi/example-framer-esm-setup https://github.com/sonnylazuardi/example-framer-esm-setup/
[12] Framer doesn't see an npm package that exists - Stack Overflow https://stackoverflow.com/questions/78084595/framer-doesnt-see-an-npm-package-that-exists
[13] GitHub - framer/component-importer: The component-importer helps you import your production design system into Framer X https://github.com/framer/component-importer
[14] Simple Inclusion of CSS in Framer via a Code Component https://gist.github.com/neiljohnston/dd1842369e0b93b6d99c31d0ad7e9d47
[15] npm:@framerjs/component-importer - Skypack.dev https://www.skypack.dev/view/@framerjs/component-importer
[16] FAQ - Framer Developers https://www.framer.com/developers/faq
[17] Framer Code Components and Code Override Masterclass [2025] https://segmentui.com/learn/framer-code-components-and-code-override-masterclass
[18] Importing External Modules https://framer.mighty.guide/code-components/importing-other-layers-components-and-packages/importing-external-modules/
[19] Import statements not working in code component - framer - Reddit https://www.reddit.com/r/framer/comments/10kwvjt/import_statements_not_working_in_code_component/
[20] Framer doesn't see an npm package that exists https://stackoverflow.com/questions/78084595/framer-doesnt-see-an-npm-package-that-exists/78103692
[21] Sharing Code - Docs https://standard.framer.wiki/docs/sharing-code
[22] Use real data in Framer X https://blog.prototypr.io/use-real-data-in-framer-x-3801834e3f59?gi=0ebd6b9929a3
[23] Tes Mat https://framer.mighty.guide
[24] How to load JSON data into an A-Frame component? https://stackoverflow.com/questions/41545518/how-to-load-json-data-into-an-a-frame-component
[25] How To Build Framer Code Components With AI https://framer.university/blog/how-to-build-framer-code-components-with-ai
[26] Code Components with Basic CSS - Master No-Code Web Design with Framer - Design+Code https://designcode.io/framer-web-design-code-components/
[27] What's available to import in Framer code? https://www.framer.community/c/developers/what-s-available-to-import-in-framer-code
[28] Add custom Schema JSON as custom code - Framer Community https://www.framer.community/c/support/add-custom-schema-json-as-custom-code
[29] Local Code Component import issue - Framer Community https://www.framer.community/c/developers/local-code-component-import-issue
[30] Import Links for Code Components - Framer Community https://www.framer.community/c/developers/hot-to-manage-js-files-effectively