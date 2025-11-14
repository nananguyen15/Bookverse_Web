# Flowbite TypeScript Integration Guide

This guide explains how to use Flowbite components with TypeScript in your React/Vite project.

## Current Setup

Flowbite has been installed and configured for Tailwind CSS v4 with full TypeScript support.

### Package Configuration
- **Flowbite**: `^3.1.2` - UI component library
- **Tailwind CSS**: `^4.1.16` - Utility-first CSS framework
- **TypeScript**: Built-in support with React

### CSS Configuration (`src/index.css`)
```css
@import "flowbite/src/themes/default";
@import "tailwindcss";
@plugin "flowbite/plugin";
@source "../node_modules/flowbite";
```

### JavaScript Import (`src/main.tsx`)
```typescript
import "flowbite";
```

## Using Flowbite Components with TypeScript

### 1. Import Components and Types
```typescript
import { Modal } from 'flowbite';
import type { ModalOptions, ModalInterface } from 'flowbite';
```

### 2. Type-Safe Component Usage
```typescript
const modalOptions: ModalOptions = {
  placement: 'center',
  backdrop: 'dynamic',
  closable: true
};

const modal: ModalInterface = new Modal(modalElement, modalOptions);
```

### 3. React Component Example
See `src/components/Shared/FlowbiteModal.tsx` for a complete React component that wraps Flowbite's Modal with TypeScript types.

### 4. Available Flowbite Components
Flowbite provides TypeScript types for all interactive components:
- Modal
- Dropdown
- Tooltip
- Accordion
- Carousel
- And many more...

## Type Definitions

Flowbite includes comprehensive TypeScript definitions:
- **Component Classes**: `Modal`, `Dropdown`, etc.
- **Interface Types**: `ModalInterface`, `DropdownInterface`, etc.
- **Options Types**: `ModalOptions`, `DropdownOptions`, etc.

## Example Usage

```typescript
import React, { useEffect, useRef } from 'react';
import { Modal } from 'flowbite';
import type { ModalOptions, ModalInterface } from 'flowbite';

const MyComponent: React.FC = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const modalInstanceRef = useRef<ModalInterface | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      const options: ModalOptions = {
        placement: 'center',
        backdrop: 'dynamic'
      };

      modalInstanceRef.current = new Modal(modalRef.current, options);
    }
  }, []);

  const openModal = () => {
    modalInstanceRef.current?.show();
  };

  return (
    <div>
      <button onClick={openModal}>Open Modal</button>
      <div ref={modalRef}>Modal Content</div>
    </div>
  );
};
```

## Benefits of TypeScript with Flowbite

1. **Type Safety**: Catch errors at compile time
2. **IntelliSense**: Better IDE support and autocomplete
3. **Documentation**: Types serve as inline documentation
4. **Refactoring**: Safer code changes and refactoring
5. **Scalability**: Better maintainability for larger projects

## Testing the Setup

Run TypeScript compilation to verify types:
```bash
npx tsc --noEmit
```

Start the development server:
```bash
npm run dev
```

## Resources

- [Flowbite Documentation](https://flowbite.com/docs/getting-started/introduction/)
- [Flowbite TypeScript Guide](https://flowbite.com/docs/getting-started/typescript/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)