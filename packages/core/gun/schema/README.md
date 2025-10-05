# Gun Schemas

Type-safe data models using Zod for runtime validation and TypeScript inference.

## Overview

Schemas define the structure and validation rules for your data.

- Runtime validation with Zod
- TypeScript type inference
- Extensible base schemas
- Gun.js soul management
- Multi-method authentication schemas

## Core Schemas

### ThingSchema

Foundation for all data entities:

```typescript
import { ThingSchema } from '@ariob/core';
import { z } from 'zod';

// ThingSchema includes:
// - id: string (nanoid)
// - soul: string (Gun.js path)
// - schema: string (type discriminator)
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

### ContentThingSchema

For content-rich entities:

```typescript
import { ContentThingSchema } from '@ariob/core';

// Includes ThingSchema fields plus:
// - title: string
// - body: string
// - tags: string[] (default: [])

const BlogPostSchema = ContentThingSchema.extend({
  excerpt: z.string().max(300),
  coverImage: z.string().url().optional(),
  category: z.enum(['tech', 'design', 'business']),
});
```

### RelationalThingSchema

For hierarchical data:

```typescript
import { RelationalThingSchema } from '@ariob/core';

// Includes ThingSchema fields plus:
// - parent?: string (parent entity ID)
// - children: string[] (child entity IDs)

const CategorySchema = RelationalThingSchema.extend({
  name: z.string(),
  icon: z.string().optional(),
  order: z.number().default(0),
});
```

### WhoSchema

User identity schema:

```typescript
import { WhoSchema } from '@ariob/core';

// User schema includes:
// - id: string
// - schema: 'who'
// - soul: string
// - alias: string (unique username)
// - pub: string (public key)
// - createdAt: number
// - updatedAt?: number
// - displayName?: string
// - avatar?: string
// - public: boolean
```

### AuthRequestSchema

Authentication requests (discriminated union):

```typescript
import { AuthRequestSchema } from '@ariob/core';

// Keypair authentication
const keypairAuth = {
  method: 'keypair',
  alias: 'alice',
  pub: 'optional-public-key',
  priv: 'optional-private-key',
};

// Mnemonic authentication
const mnemonicAuth = {
  method: 'mnemonic',
  alias: 'bob',
  mnemonic: 'optional-12-word-phrase',
  passphrase: 'optional-extra-security',
};

// Traditional authentication
const traditionalAuth = {
  method: 'traditional',
  alias: 'charlie',
  passphrase: 'secure-password-123',
};
```

## Creating Custom Schemas

### Basic Pattern

```typescript
import { ThingSchema } from '@ariob/core';
import { z } from 'zod';

// 1. Define schema
export const ProductSchema = ThingSchema.extend({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP']).default('USD'),
  description: z.string().optional(),
  images: z.array(z.string().url()).default([]),
  sku: z.string().regex(/^[A-Z]{3}-\d{6}$/),
  categories: z.array(z.string()).min(1).max(5),
  inStock: z.boolean().default(true),
});

// 2. Infer TypeScript type
export type Product = z.infer<typeof ProductSchema>;

// 3. Use in service
const productService = make(ProductSchema, 'products');
```

### Schema Composition

```typescript
// Reusable schemas
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
  type: z.enum(['restaurant', 'bar', 'cafe']),
  address: AddressSchema,
  contact: ContactSchema,
  capacity: z.number().int().positive(),
});
```

### Discriminated Unions

```typescript
const EventSchema = ThingSchema.extend({
  title: z.string(),
  date: z.number(),
  type: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('online'),
      platform: z.enum(['zoom', 'teams', 'meet']),
      link: z.string().url(),
    }),
    z.object({
      type: z.literal('inPerson'),
      venue: z.string(),
      address: AddressSchema,
    }),
  ]),
});
```

### Schema Refinements

```typescript
const BookingSchema = ThingSchema.extend({
  startDate: z.number(),
  endDate: z.number(),
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

## Validation

### Manual Validation

```typescript
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

### Automatic Validation

Services automatically validate data:

```typescript
const productService = make(ProductSchema, 'products');

const result = await productService.create({
  name: 'Widget',
  price: -10, // Invalid!
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

## Best Practices

1. **Define schemas first** - Let your data model drive implementation
2. **Use strict validation** - Be explicit about required vs optional fields
3. **Leverage TypeScript** - Let type inference guide your code
4. **Keep schemas focused** - One schema per concept
5. **Reuse common patterns** - Compose schemas from smaller parts
6. **Version carefully** - Schema changes can break existing data

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
  social: z.object({
    twitter: z.string().optional(),
    github: z.string().optional(),
  }).optional(),
});
```

### Backward Compatibility

```typescript
// Use transforms for migrations
const UserProfileV3 = ThingSchema.extend({
  bio: z.string(),
  location: z.string().optional(),
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
const result = await service.create(invalidData);

result.match(
  (item) => console.log('Success:', item),
  (error) => {
    if (error.type === 'VALIDATION_ERROR') {
      const messages = error.details?.fieldErrors || {};
      Object.entries(messages).forEach(([field, errors]) => {
        console.error(`${field}: ${errors.join(', ')}`);
      });
    }
  }
);
```

## See Also

- [Gun Module](../README.md) - Gun.js integration
- [Services Module](../services/README.md) - Using schemas with services
- [Main Documentation](../../README.md) - Package overview
- [Zod Documentation](https://zod.dev/)
