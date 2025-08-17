# JSX Performance Rules

## Component Optimization

```jsx
// ✅ Use React.memo for expensive components
const WeatherCard = React.memo(({ weather }) => (
  <div>{weather.temperature}°</div>
));

// ✅ Use useMemo for expensive calculations
const processedData = useMemo(
  () => weather.map((item) => transformWeatherData(item)),
  [weather],
);

// ✅ Use useCallback for event handlers passed to children
const handleLocationChange = useCallback((location) => {
  setLocation(location);
}, []);
```

## Avoid Inline Objects and Functions

```jsx
// ❌ Creates new object on every render
<Component style={{ margin: 10 }} />

// ✅ Define outside component or use useMemo
const cardStyle = { margin: 10 };
<Component style={cardStyle} />

// ❌ Creates new function on every render
<button onClick={() => console.log('clicked')}>Click</button>

// ✅ Use useCallback or define outside
const handleClick = useCallback(() => console.log('clicked'), []);
<button onClick={handleClick}>Click</button>
```

## Lazy Loading

```jsx
// ✅ Use React.lazy for code splitting
const WeatherChart = React.lazy(() => import("./WeatherChart"));

// ✅ Wrap with Suspense
<Suspense fallback={<div>Loading chart...</div>}>
  <WeatherChart data={weatherData} />
</Suspense>;
```

## List Rendering

```jsx
// ✅ Use stable keys and avoid index
{
  locations.map((location) => (
    <LocationCard key={location.id} location={location} />
  ));
}

// ✅ Consider virtualization for large lists
import { FixedSizeList as List } from "react-window";

<List height={400} itemCount={items.length} itemSize={50}>
  {({ index, style }) => (
    <div style={style}>
      <WeatherItem data={items[index]} />
    </div>
  )}
</List>;
```
