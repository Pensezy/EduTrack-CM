# @edutrack/ui - UI Components Library

A collection of reusable React UI components built for EduTrack, styled with Tailwind CSS.

## Installation

```bash
npm install @edutrack/ui
# or
pnpm add @edutrack/ui
```

## Dependencies

- React 18+
- React DOM 18+

## Available Components

### Button

A flexible button component with multiple variants and sizes.

```jsx
import { Button } from '@edutrack/ui';

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

**Props:**
- `variant`: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' (default: 'default')
- `size`: 'default' | 'sm' | 'lg' | 'icon' (default: 'default')
- `disabled`: boolean
- All standard HTML button attributes

### Card

A container component for grouping related content with optional header, footer, and content sections.

```jsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@edutrack/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Your content here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

**Sub-components:**
- `Card`: Main container
- `CardHeader`: Header section
- `CardTitle`: Title in header
- `CardDescription`: Description text
- `CardContent`: Main content area
- `CardFooter`: Footer section

## Styling

All components are styled using Tailwind CSS and can be customized via the `className` prop.

```jsx
<Button className="custom-class">Customized</Button>
```

## Development

This is a monorepo package. To develop locally:

```bash
# From the root directory
pnpm install
pnpm -F @edutrack/ui dev
```

## License

MIT
