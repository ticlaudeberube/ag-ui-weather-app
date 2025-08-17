# JSX Best Practices

## Component Structure

```jsx
// ✅ Use "use client" for client components
"use client";

// ✅ Group imports logically
import React from "react";
import { useState, useEffect } from "react";
import { useCopilotAction } from "@copilotkit/react-core";
```

## Event Handlers

```jsx
// ✅ Use arrow functions for inline handlers
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Use function references when no parameters
<button onClick={handleClick}>Click</button>

// ❌ Avoid binding in render
<button onClick={this.handleClick.bind(this)}>Click</button>
```

## Conditional Rendering

```jsx
// ✅ Use logical AND for simple conditions
{
  isLoading && <LoadingSpinner />;
}

// ✅ Use ternary for if/else
{
  error ? <ErrorMessage /> : <SuccessMessage />;
}

// ❌ Avoid complex nested ternaries
{
  condition ? nested ? <A /> : <B /> : <C />;
}
```

## Props and Attributes

```jsx
// ✅ Use boolean shorthand
<Button disabled />

// ✅ Spread props when needed
<Component {...commonProps} />

// ❌ Avoid unnecessary prop spreading
<div {...props} className="fixed" />
```

## Fragment Usage

```jsx
// ✅ Use React.Fragment or shorthand
<>
  <Header />
  <Main />
</>

// ❌ Avoid unnecessary wrapper divs
<div>
  <Header />
  <Main />
</div>
```

## Key Props

```jsx
// ✅ Use stable, unique keys
{
  items.map((item) => <Item key={item.id} data={item} />);
}

// ❌ Avoid array indices as keys
{
  items.map((item, index) => <Item key={index} data={item} />);
}
```
