# JSX Quote Handling Rules

## Best Practice: Use Curly Braces with JavaScript Strings

When including quotes in JSX text content, wrap the text in curly braces with JavaScript strings:

```jsx
// ✅ Recommended
<p className="text-sm">{"What's the weather like?"}</p>
<p className="text-sm">{'Weather in "Montreal"'}</p>

// ❌ Avoid - causes ESLint errors
<p className="text-sm">"What's the weather like?"</p>

// ❌ Avoid - harder to read/maintain
<p className="text-sm">&ldquo;What&rsquo;s the weather like?&rdquo;</p>
```

## Why This Approach

- Prevents `react/no-unescaped-entities` ESLint errors
- Most readable and maintainable
- Allows mixing single and double quotes naturally
- Standard JavaScript string handling
