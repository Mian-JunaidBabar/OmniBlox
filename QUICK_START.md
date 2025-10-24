# OmniBlox - Quick Start Guide

## 🚀 Getting Started

### Backend Setup (apps/server)

1. **Install dependencies**

   ```powershell
   cd e:/Projects/OmniBlox/apps/server
   npm install
   ```

2. **Configure database**

   ```powershell
   # Copy environment template
   cp .env.example .env

   # Edit .env and add your PostgreSQL connection string
   # DATABASE_URL="postgresql://user:password@localhost:5432/omniblox?schema=public"
   ```

3. **Set up database**

   ```powershell
   npm run prisma:migrate
   npm run prisma:generate
   ```

4. **Start server**
   ```powershell
   npm run start:dev
   ```
   Server runs on: `http://localhost:5000`

### Frontend Setup (apps/client)

1. **Install dependencies**

   ```powershell
   cd e:/Projects/OmniBlox/apps/client
   npm install
   ```

2. **Start development server**
   ```powershell
   npm run dev
   ```
   Frontend runs on: `http://localhost:3000`

---

## 📋 Product Module Endpoints

### Backend API Routes

| Method | Endpoint               | Description                   |
| ------ | ---------------------- | ----------------------------- |
| POST   | `/products`            | Create new product            |
| GET    | `/products`            | List all products (paginated) |
| GET    | `/products/categories` | Get all categories            |
| GET    | `/products/brands`     | Get all brands                |
| GET    | `/products/low-stock`  | Get low stock products        |
| GET    | `/products/sku/:sku`   | Find product by SKU           |
| GET    | `/products/:id`        | Get product by ID             |
| PUT    | `/products/:id`        | Update product                |
| PUT    | `/products/:id/stock`  | Update stock level            |
| DELETE | `/products/:id`        | Delete product                |

### Frontend Routes

| Route                          | Description    |
| ------------------------------ | -------------- |
| `/dashboard/products`          | Product list   |
| `/dashboard/products/new`      | Create product |
| `/dashboard/products/:id`      | View product   |
| `/dashboard/products/:id/edit` | Edit product   |

---

## 🔧 Common Tasks

### Reset Database

```powershell
cd apps/server
npm run prisma:reset
```

### Build for Production

```powershell
# Backend
cd apps/server
npm run build

# Frontend
cd apps/client
npm run build
```

### Run Tests

```powershell
# Backend
cd apps/server
npm test

# Frontend
cd apps/client
npm test
```

---

## 🐛 Troubleshooting

### Issue: "PrismaClientConstructorValidationError"

**Solution**: Make sure `DATABASE_URL` is set in `apps/server/.env`

### Issue: "Session expired" on 404 errors

**Solution**: This has been fixed. 404 errors no longer trigger logout.

### Issue: Product API calls failing

**Solution**:

1. Verify backend is running on port 5000
2. Check `NEXT_PUBLIC_API_URL` in frontend `.env.local` (should be `http://localhost:5000`)
3. Ensure JWT token is valid (login again)

---

## 📁 Project Structure

```
OmniBlox/
├── apps/
│   ├── client/          # Next.js frontend
│   │   ├── app/         # Pages and routes
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and API client
│   └── server/          # NestJS backend
│       ├── src/
│       │   ├── auth/    # Authentication module
│       │   ├── products/# Products module
│       │   └── prisma/  # Database service
│       └── prisma/      # Database schema & migrations
└── extras/
    └── docs/            # Documentation
```

---

## ✅ Recent Fixes (Oct 24, 2025)

1. **Auth Context Fix**: 404 errors no longer redirect to login
2. **Database Connection**: Fixed Prisma undefined datasource error
3. **Product Routes**: Verified all frontend/backend routes match
4. **Environment Setup**: Added .env.example with all required vars

For detailed information, see `FIXES_2025-10-24.md`

---

## 🔐 Authentication

All product endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

The frontend automatically handles this through the `use-authenticated-api` hook.

---

## 📞 Support

For issues or questions, refer to:

- `FIXES_2025-10-24.md` - Recent bug fixes
- `apps/server/README.md` - Server setup details
- `apps/server/.env.example` - Environment configuration
