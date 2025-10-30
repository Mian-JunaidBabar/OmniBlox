# 🔐 Recommended Solution: JWT with HTTP-Only Cookies

## The Problem

After investigating Better Auth's API, I discovered that it doesn't expose manual session creation methods (`createSession()`, `destroy()`, etc.). Better Auth is designed to handle authentication end-to-end through its own built-in endpoints.

This means we can't use Better Auth to "just handle sessions" while keeping your custom multi-tenant authentication logic.

## The Recommended Solution

**Use JWT tokens, but store them in HTTP-only cookies instead of localStorage.**

This gives you:

- ✅ **XSS Protection**: HTTP-only cookies can't be accessed by JavaScript
- ✅ **Keep Your Auth Logic**: All your multi-tenant, RBAC, and custom validation stays
- ✅ **Minimal Changes**: Small modifications to existing code
- ✅ **Same Security Level**: HTTP-only cookies are as secure as Better Auth sessions

## What Changed

### Backend (`auth.service.COOKIE_JWT.ts`)

**Before (JWT in response body)**:

```typescript
return {
  accessToken,
  refreshToken,
  user,
  company,
};
```

**After (JWT in HTTP-only cookies)**:

```typescript
// Set tokens as HTTP-only cookies
res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000, // 15 minutes
});

res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

// Return only user data (no tokens!)
return {
  user,
  company,
};
```

### JwtAuthGuard (Extract token from cookie)

**Modify** `apps/server/src/auth/jwt-auth.guard.ts` to read from cookies:

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    // Extract JWT from cookie instead of Authorization header
    const token = request.cookies?.accessToken;
    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }

    return super.canActivate(context);
  }
}
```

### Frontend (`api.COOKIE_JWT.ts`)

**Before**:

```typescript
headers["Authorization"] = `Bearer ${accessToken}`;
```

**After**:

```typescript
credentials: "include", // Send cookies automatically
// No Authorization header needed!
```

## Implementation Steps

### Step 1: Enable Cookie Parser

In `apps/server/main.ts`:

```typescript
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser()); // Add this

  app.enableCors({
    origin: "http://localhost:3000",
    credentials: true, // Required for cookies
  });

  await app.listen(5000);
}
```

Install cookie-parser:

```bash
npm install cookie-parser
npm install -D @types/cookie-parser
```

### Step 2: Replace Backend Files

1. **Replace** `apps/server/src/auth/auth.service.ts` with `auth.service.COOKIE_JWT.ts`
2. **Update** `apps/server/src/auth/jwt-auth.guard.ts` to read from cookies (code above)
3. **Update** `apps/server/src/auth/auth.controller.ts`:
   - Add `@Res({ passthrough: true }) res: Response` to login/signup
   - Add `@Req() req: Request, @Res({ passthrough: true }) res: Response` to logout
   - Pass `res` to service methods

### Step 3: Update Frontend

1. **Update** `apps/client/lib/api.ts`:
   - Add `credentials: 'include'` to all fetch calls
   - Remove Authorization header logic
   - Remove TokenManager class
2. **Update** `apps/client/contexts/auth-context.tsx`:
   - Remove token state
   - Session validation via `/auth/me` on mount
   - No more localStorage

## Files Created

I've created a working version:

- ✅ `apps/server/src/auth/auth.service.COOKIE_JWT.ts` - Complete implementation

## Comparison with Better Auth

| Feature                  | HTTP-Only JWT Cookies | Better Auth                |
| ------------------------ | --------------------- | -------------------------- |
| XSS Protection           | ✅ Yes                | ✅ Yes                     |
| CSRF Protection          | ✅ With SameSite      | ✅ With SameSite           |
| Custom Auth Logic        | ✅ Full control       | ❌ Must use BA endpoints   |
| Multi-tenancy            | ✅ Works as-is        | ⚠️ Requires schema changes |
| Setup Complexity         | ✅ Minimal            | ❌ Significant             |
| Works with Existing Code | ✅ Yes                | ❌ Major rewrite needed    |

## Next Steps

**Would you like me to:**

1. Apply the HTTP-only cookie approach (recommended)?
2. Try the full Better Auth migration (requires rewriting auth logic)?
3. Something else?

Let me know and I'll proceed with the implementation!
