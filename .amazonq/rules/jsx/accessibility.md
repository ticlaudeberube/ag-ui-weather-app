# JSX Accessibility Rules

## Semantic HTML

```jsx
// ✅ Use semantic elements
<main>
  <section>
    <h1>Weather Dashboard</h1>
    <article>Weather content</article>
  </section>
</main>

// ❌ Avoid generic divs for structure
<div>
  <div>
    <div>Weather Dashboard</div>
  </div>
</div>
```

## ARIA Labels

```jsx
// ✅ Add aria-label for interactive elements
<button aria-label="Get weather for current location">
  📍
</button>

// ✅ Use aria-describedby for additional context
<input
  aria-describedby="location-help"
  placeholder="Enter city name"
/>
<div id="location-help">{"Enter a city name like 'Montreal'"}</div>
```

## Focus Management

```jsx
// ✅ Ensure keyboard navigation
<button
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
>
  Action
</button>

// ✅ Skip links for screen readers
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

## Color and Contrast

```jsx
// ✅ Don't rely solely on color
<span className="text-red-500" aria-label="Error">
  ❌ Invalid location
</span>

// ✅ Use sufficient contrast ratios
<button className="bg-blue-600 text-white hover:bg-blue-700">
  Get Weather
</button>
```

## Images and Icons

```jsx
// ✅ Always include alt text
<img src="/weather-icon.png" alt="Sunny weather" />

// ✅ Use empty alt for decorative images
<img src="/decoration.png" alt="" />

// ✅ Use aria-hidden for decorative icons
<span aria-hidden="true">🌤️</span>
```
