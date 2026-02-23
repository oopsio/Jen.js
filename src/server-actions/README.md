# Server Actions

Server Actions in Jen.js provide a way to define server-side functions that can be called from the client with full type safety, validation, and error handling.

## Features

- **Validation**: Built-in schema validation before handler execution
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Form Submission Support**: Seamless integration with HTML forms and fetch requests
- **Streaming Responses**: Support for streaming data back to clients
- **TypeScript Support**: Full TypeScript support with type inference
- **Middleware**: Action-specific middleware for authentication, logging, etc.

## Directory Structure

Server actions are discovered from the `site/actions` directory:

```
site/
├── actions/
│   ├── submit-form.ts          # /actions/submit-form
│   ├── blog/
│   │   ├── publish.ts          # /actions/blog/publish
│   │   └── delete.ts           # /actions/blog/delete
│   └── user/
│       └── [id]/
│           └── update.ts       # /actions/user/:id/update
```

## Basic Example

### Simple Action

```typescript
// site/actions/greet.ts
import type { ServerActionContext } from "jenjs";

export default async (ctx: ServerActionContext) => {
  const { name } = ctx.body;
  return { message: `Hello, ${name}!` };
};
```

### Calling from Client

```typescript
// Using fetch
const response = await fetch("/actions/greet", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice" })
});

const result = await response.json();
console.log(result); // { success: true, message: "Hello, Alice!" }
```

## Validation

### Using Validation Schemas

```typescript
// site/actions/submit-form.ts
import type { ServerActionContext } from "jenjs";
import { required, minLength, email } from "jenjs";

export const validation = {
  name: [required(), minLength(2)],
  email: [required(), email()],
  message: [required(), minLength(10)]
};

export default async (ctx: ServerActionContext) => {
  // Validation runs automatically before this handler
  const { name, email, message } = ctx.body;
  
  // Process form submission
  await saveComment({ name, email, message });
  
  return { success: true };
};
```

The validation runs automatically before the handler. If validation fails, a 400 response is returned with error details:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email address"
  }
}
```

### Available Validators

- `required()` - Field is required
- `minLength(n)` - Minimum string length
- `maxLength(n)` - Maximum string length
- `email()` - Valid email format
- `url()` - Valid URL format
- `pattern(regex)` - Matches regex pattern
- `range(min, max)` - Number in range
- `enumValue(values)` - One of allowed values
- `type(expected)` - Specific type
- `custom(fn)` - Custom validator function

### Custom Validators

```typescript
import { custom } from "jenjs";

export const validation = {
  username: [
    custom(
      (value) => {
        if (value.length < 3) return "Min 3 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Alphanumeric only";
        return true; // Valid
      },
      "Invalid username"
    )
  ]
};
```

## Dynamic Routes

Actions support dynamic route segments:

```typescript
// site/actions/user/[id]/update.ts
export default async (ctx: ServerActionContext) => {
  const { id } = ctx.params;
  const { name, email } = ctx.body;
  
  await updateUser(id, { name, email });
  
  return { success: true };
};
```

Called with: `POST /actions/user/123/update`

## Streaming Responses

For long-running operations, stream data back to the client:

```typescript
// site/actions/process-file.ts
export default async (ctx: ServerActionContext) => {
  const stream = ctx.stream();
  
  const items = await fetchLargeDataset();
  
  for (const item of items) {
    // Stream each item as it's processed
    stream.write({ status: "processing", item });
    await processItem(item);
  }
  
  stream.close();
  return { success: true };
};
```

The response uses NDJSON (newline-delimited JSON) format:

```
{"status":"processing","item":{...}}
{"status":"processing","item":{...}}
```

## Metadata and Configuration

```typescript
// site/actions/publish-post.ts
import type { ServerActionContext } from "jenjs";

export const metadata = {
  name: "publishPost",
  description: "Publish a blog post to the site",
  requiresAuth: true,
  rateLimit: 2 // 2 requests per second
};

export const validation = {
  title: [required(), minLength(5)],
  content: [required(), minLength(20)]
};

export default async (ctx: ServerActionContext) => {
  // Check authentication if required
  if (metadata.requiresAuth && !ctx.data.userId) {
    return { 
      success: false, 
      message: "Authentication required" 
    };
  }
  
  const { title, content } = ctx.body;
  const post = await createPost({
    title,
    content,
    authorId: ctx.data.userId
  });
  
  return { success: true, post };
};
```

## Request Context

Server actions receive a rich context object with request data:

```typescript
export default async (ctx: ServerActionContext) => {
  // Request data
  ctx.req          // Node.js IncomingMessage
  ctx.res          // Node.js ServerResponse
  ctx.url          // URL object (pathname, searchParams, etc.)
  ctx.method       // HTTP method (POST, PUT, etc.)
  
  // Parsed data
  ctx.body         // Parsed request body (JSON or form data)
  ctx.query        // Query string parameters
  ctx.params       // Route parameters (from [id] segments)
  ctx.headers      // Request headers
  ctx.cookies      // Parsed cookies
  ctx.data         // Custom data from middleware
  
  // Utilities
  ctx.validate(input, schema)  // Validate input against schema
  ctx.stream()     // Create streaming response
};
```

## Form Integration

Seamless integration with HTML forms:

```html
<form action="/actions/subscribe" method="POST">
  <input type="email" name="email" required>
  <button type="submit">Subscribe</button>
</form>
```

```typescript
// site/actions/subscribe.ts
export const validation = {
  email: [required(), email()]
};

export default async (ctx: ServerActionContext) => {
  const { email } = ctx.body;
  await subscribeToNewsletter(email);
  return { success: true, message: "Subscribed!" };
};
```

## Error Handling

Actions have built-in error handling:

```typescript
export default async (ctx: ServerActionContext) => {
  try {
    const result = await riskyOperation();
    return { success: true, result };
  } catch (error) {
    // In production, error details are hidden
    // In development, full error message is included
    return { 
      success: false, 
      message: error.message 
    };
  }
};
```

All unhandled errors return a 500 response with a generic message (full details in development).

## Middleware

Actions support middleware for cross-cutting concerns:

```typescript
// site/actions/admin/delete-user.ts
export const middleware = [
  authRequired(), // Custom middleware
  checkPermission("admin")
];

export default async (ctx: ServerActionContext) => {
  // Middleware has already authenticated and checked permissions
  const { userId } = ctx.body;
  await deleteUser(userId);
  return { success: true };
};
```

## Response Format

All server action responses follow a standard format:

```json
{
  "success": true|false,
  "data": {...},
  "errors": {...},
  "message": "Optional message"
}
```

Success response:
```json
{ "success": true, "data": { "post": {...} } }
```

Validation error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": { "email": "Invalid email" }
}
```

Runtime error:
```json
{ "success": false, "message": "Internal server error" }
```

## Type Safety

For TypeScript, define action types:

```typescript
// lib/actions.ts
import type { ServerActionContext } from "jenjs";

export interface CommentInput {
  postId: string;
  text: string;
  authorName: string;
}

export interface CommentResult {
  success: boolean;
  comment?: { id: string; createdAt: string };
  errors?: Record<string, string>;
}

export async function submitComment(
  input: CommentInput
): Promise<CommentResult> {
  const response = await fetch("/actions/submit-comment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return response.json();
}
```

## Scanning and Discovery

Server actions are automatically discovered at startup:

```
[INFO] Server actions discovered: 5
  /submit-form (submitForm)
  /blog/publish (blog.publish)
  /blog/delete (blog.delete)
  /user/:id/update (user.update)
  /subscribe (subscribe)
```

## Integration with Framework

The server actions system integrates seamlessly with:

- **Middleware Pipeline**: Actions run within the framework's middleware chain
- **Route Scanning**: Automatic discovery from file system
- **Error Handling**: Consistent error handling with framework patterns
- **Logging**: Integrated with framework logging utilities
- **Development Mode**: Hot module replacement (HMR) support for action files

## Performance Considerations

- Actions are cached after first load for performance
- Module cache is invalidated on file changes (dev mode)
- Validation runs only once before handler execution
- Streaming responses enable processing large datasets efficiently
- Support for both sync and async handlers

## Security

- CSRF protection should be implemented at middleware level
- Authentication checks can be done in action or middleware
- Input validation prevents invalid data from reaching handlers
- Error messages don't expose sensitive details in production
- Rate limiting can be configured per action
