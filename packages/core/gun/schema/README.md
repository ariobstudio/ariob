# Gun Schemas

Type-safe data models using Zod for runtime validation and TypeScript inference.

## Overview

Schemas define the structure of your data with:

- **Runtime validation** using Zod
- **TypeScript type inference** for compile-time safety
- **Extensible base schemas** for common patterns
- **Built-in Gun.js compatibility** with soul management
- **Authentication schemas** for multi-method auth

## Core Schemas

### Base Schema: `ThingSchema`

The foundation for all data entities:

```typescript
import { ThingSchema } from '@ariob/core';
import { z } from 'zod';

// ThingSchema includes these fields automatically:
// - id: string (nanoid)
// - soul: string (Gun.js path)
// - schema: string (schema name for validation)
// - createdAt: number (timestamp)
// - updatedAt?: number (timestamp)
// - public: boolean (default: false)
// - createdBy?: string (creator's public key)

// Extend for your use case
const TaskSchema = ThingSchema.extend({
  title: z.string().min(1).max(200),
  completed: z.boolean().default(false),
  dueDate: z.number().optional(),
});

type Task = z.infer<typeof TaskSchema>;
```

### Content Schema: `ContentThingSchema`

For content-rich entities like notes, posts, or articles:

```typescript
import { ContentThingSchema } from '@ariob/core';

// Includes ThingSchema fields plus:
// - title: string
// - body: string
// - tags: string[] (default: [])

const BlogPostSchema = ContentThingSchema.extend({
  excerpt: z.string().max(300),
  coverImage: z.string().url().optional(),
  publishedAt: z.number().optional(),
  category: z.enum(['tech', 'design', 'business']),
});
```

### Relational Schema: `RelationalThingSchema`

For hierarchical data structures:

```typescript
import { RelationalThingSchema } from '@ariob/core';

// Includes ThingSchema fields plus:
// - parent?: string (parent entity ID)
// - children: string[] (child entity IDs)

const CategorySchema = RelationalThingSchema.extend({
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  order: z.number().default(0),
});
```

### Authentication Schemas

#### `WhoSchema` - User Identity

```typescript
import { WhoSchema } from '@ariob/core';

// User identity schema includes:
// - id: string
// - schema: 'who'
// - soul: string
// - alias: string (unique username)
// - pub: string (public key)
// - createdAt: number
// - updatedAt?: number
// - displayName?: string
// - avatar?: string
// - public: boolean (profile visibility)

// The Who schema is typically not extended
// Use separate schemas for user-related data
```

#### `AuthRequestSchema` - Authentication Requests

```typescript
import { AuthRequestSchema } from '@ariob/core';

// Discriminated union for different auth methods:

// Keypair authentication
const keypairAuth: AuthRequest = {
  method: 'keypair',
  alias: 'alice',
  pub: 'optional-public-key',
  priv: 'optional-private-key',
  epub: 'optional-epub',
  epriv: 'optional-epriv',
};

// Mnemonic authentication
const mnemonicAuth: AuthRequest = {
  method: 'mnemonic',
  alias: 'bob',
  mnemonic: 'optional-12-word-phrase',
  passphrase: 'optional-extra-security',
};

// Traditional authentication
const traditionalAuth: AuthRequest = {
  method: 'traditional',
  alias: 'charlie',
  passphrase: 'secure-password-123',
};
```

## Creating Custom Schemas

### Basic Schema Pattern

```typescript
import { ThingSchema } from '@ariob/core';
import { z } from 'zod';

// 1. Define your schema
export const ProductSchema = ThingSchema.extend({
  // Required fields
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP']).default('USD'),
  
  // Optional fields
  description: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  
  // Nested objects
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
    depth: z.number(),
    unit: z.enum(['cm', 'in']).default('cm'),
  }).optional(),
  
  // Complex validations
  sku: z.string().regex(/^[A-Z]{3}-\d{6}$/),
  
  // Arrays with constraints
  categories: z.array(z.string()).min(1).max(5),
  
  // Conditional fields
  inStock: z.boolean().default(true),
  stockCount: z.number().int().min(0).optional(),
});

// 2. Infer the TypeScript type
export type Product = z.infer<typeof ProductSchema>;

// 3. Use in your service
const productService = make(ProductSchema, 'products');
```

### Advanced Schema Patterns

#### Schema Composition

```typescript
// Base schemas for reuse
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string().length(2),
  zip: z.string().regex(/^\d{5}$/),
  country: z.string().default('US'),
});

const ContactSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/),
  website: z.string().url().optional(),
});

// Compose into larger schemas
const VenueSchema = ThingSchema.extend({
  name: z.string(),
  type: z.enum(['restaurant', 'bar', 'cafe', 'club']),
  address: AddressSchema,
  contact: ContactSchema,
  capacity: z.number().int().positive(),
  amenities: z.array(z.string()).default([]),
  hours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
  })),
});
```

#### Discriminated Unions

```typescript
// Event schema with different types
const EventSchema = ThingSchema.extend({
  title: z.string(),
  date: z.number(),
  type: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('online'),
      platform: z.enum(['zoom', 'teams', 'meet']),
      link: z.string().url(),
      password: z.string().optional(),
    }),
    z.object({
      type: z.literal('inPerson'),
      venue: z.string(), // Venue ID
      address: AddressSchema,
      parking: z.boolean().default(false),
    }),
    z.object({
      type: z.literal('hybrid'),
      venue: z.string(),
      address: AddressSchema,
      platform: z.enum(['zoom', 'teams', 'meet']),
      link: z.string().url(),
    }),
  ]),
});

type Event = z.infer<typeof EventSchema>;
```

#### Schema Refinements

```typescript
const BookingSchema = ThingSchema.extend({
  startDate: z.number(),
  endDate: z.number(),
  guests: z.object({
    adults: z.number().int().min(1),
    children: z.number().int().min(0).default(0),
  }),
  totalPrice: z.number().positive(),
  deposit: z.number().min(0),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine((data) => data.deposit <= data.totalPrice, {
  message: "Deposit cannot exceed total price",
  path: ["deposit"],
});
```

## Schema Validation

### Manual Validation

```typescript
import { ProductSchema } from './schemas';

// Validate data
const result = ProductSchema.safeParse({
  name: 'Widget',
  price: 29.99,
  categories: ['electronics'],
  sku: 'WDG-123456',
});

if (result.success) {
  console.log('Valid product:', result.data);
} else {
  console.error('Validation errors:', result.error.flatten());
}
```

### Automatic Validation in Services

Services automatically validate data:

```typescript
const productService = make(ProductSchema, 'products');

// This will validate against ProductSchema
const result = await productService.create({
  name: 'Widget',
  price: -10, // Invalid! Will return validation error
});

result.match(
  (product) => console.log('Created:', product),
  (error) => {
    if (error.type === 'VALIDATION_ERROR') {
      console.error('Validation failed:', error.details);
    }
  }
);
```

## ReactLynx Component Examples

### Form with Schema Validation

```typescript
import { useState } from '@lynx-js/react';
import { ProductSchema } from './schemas';
import { useProductStore } from './stores';

function ProductForm() {
  const { create } = useProductStore();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    currency: 'USD',
    categories: [] as string[],
    sku: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    // Validate with schema
    const result = ProductSchema.safeParse({
      ...formData,
      price: parseFloat(formData.price),
    });

    if (!result.success) {
      // Show validation errors
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(
        Object.entries(fieldErrors).reduce((acc, [key, messages]) => {
          acc[key] = messages?.[0] || '';
          return acc;
        }, {} as Record<string, string>)
      );
      return;
    }

    // Create product
    const createResult = await create(result.data);
    createResult.match(
      (product) => {
        console.log('Created product:', product);
        // Reset form or navigate
      },
      (error) => alert(error.message)
    );
  };

  return (
    <view className="product-form">
      <text className="title">Add Product</text>
      
      <view className="form-field">
        <text>Name</text>
        <input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Product name"
        />
        {errors.name && <text className="error">{errors.name}</text>}
      </view>
      
      <view className="form-field">
        <text>Price</text>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="0.00"
        />
        {errors.price && <text className="error">{errors.price}</text>}
      </view>
      
      <view className="form-field">
        <text>SKU (Format: XXX-######)</text>
        <input
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          placeholder="ABC-123456"
        />
        {errors.sku && <text className="error">{errors.sku}</text>}
      </view>
      
      <view className="submit-btn" bindtap={handleSubmit}>
        <text>Create Product</text>
      </view>
    </view>
  );
}
```

### Type-Safe Data Display

```typescript
import { Product } from './schemas';

function ProductCard({ product }: { product: Product }) {
  // TypeScript knows all Product fields
  return (
    <view className="product-card">
      <text className="name">{product.name}</text>
      <text className="price">
        {product.price} {product.currency}
      </text>
      
      {product.dimensions && (
        <view className="dimensions">
          <text>
            {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} {product.dimensions.unit}
          </text>
        </view>
      )}
      
      <view className="categories">
        {product.categories.map(cat => (
          <text key={cat} className="category-tag">{cat}</text>
        ))}
      </view>
      
      <view className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
        <text>{product.inStock ? 'In Stock' : 'Out of Stock'}</text>
        {product.stockCount !== undefined && (
          <text>({product.stockCount} available)</text>
        )}
      </view>
    </view>
  );
}
```

## Best Practices

1. **Start with schemas** - Define your data model before implementation
2. **Use strict validation** - Be explicit about required vs optional fields
3. **Leverage TypeScript** - Let type inference guide your code
4. **Keep schemas focused** - One schema per concept
5. **Reuse common patterns** - Compose schemas from smaller parts
6. **Document constraints** - Add descriptions to complex validations
7. **Version carefully** - Schema changes can break existing data

## Schema Evolution

### Adding Fields

```typescript
// Version 1
const UserProfileV1 = ThingSchema.extend({
  bio: z.string(),
});

// Version 2 - Safe to add optional fields
const UserProfileV2 = ThingSchema.extend({
  bio: z.string(),
  location: z.string().optional(), // New optional field
  social: z.object({               // New optional object
    twitter: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
});
```

### Changing Fields

```typescript
// Use transforms for backward compatibility
const UserProfileV3 = ThingSchema.extend({
  bio: z.string(),
  location: z.string().optional(),
  // Renamed field with transform
  socials: z.object({
    twitter: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
}).transform((data) => {
  // Handle old 'social' field name
  if ('social' in data && !('socials' in data)) {
    return { ...data, socials: data.social };
  }
  return data;
});
```

## Error Handling

```typescript
// Schema validation errors are automatically handled
const result = await service.create(invalidData);

result.match(
  (item) => console.log('Success:', item),
  (error) => {
    if (error.type === 'VALIDATION_ERROR') {
      // Access detailed validation errors
      console.error('Validation errors:', error.details);
      
      // Show user-friendly messages
      const messages = error.details?.fieldErrors || {};
      Object.entries(messages).forEach(([field, errors]) => {
        console.error(`${field}: ${errors.join(', ')}`);
      });
    }
  }
);
```

## Testing Schemas

```typescript
import { describe, it, expect } from '@jest/globals';
import { ProductSchema } from './schemas';

describe('ProductSchema', () => {
  it('validates correct data', () => {
    const result = ProductSchema.safeParse({
      name: 'Test Product',
      price: 29.99,
      currency: 'USD',
      categories: ['test'],
      sku: 'TST-123456',
      inStock: true,
    });
    
    expect(result.success).toBe(true);
  });
  
  it('rejects invalid SKU format', () => {
    const result = ProductSchema.safeParse({
      name: 'Test Product',
      price: 29.99,
      categories: ['test'],
      sku: 'INVALID',
    });
    
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('sku');
  });
  
  it('ensures price is positive', () => {
    const result = ProductSchema.safeParse({
      name: 'Test Product',
      price: -10,
      categories: ['test'],
      sku: 'TST-123456',
    });
    
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toContain('price');
  });
});
``` 