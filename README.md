# Finance Dashboard Backend

A role-based finance dashboard backend built with NestJS, PostgreSQL, and Prisma ORM.
Designed to manage financial records, users, and provide analytical insights through
a clean and structured REST API.

---

## Tech Stack

- **Framework** — NestJS (Node.js)
- **Database** — PostgreSQL (via Docker)
- **ORM** — Prisma v7
- **Auth** — JWT (JSON Web Tokens) via Passport
- **Validation** — class-validator + class-transformer
- **Containerisation** — Docker + Docker Compose

---

## Features

### User & Role Management
- Admin can create, update, and soft delete users
- Three roles supported — `ADMIN`, `ANALYST`, `VIEWER`
- Role-based access control enforced via NestJS Guards
- User status management — `ACTIVE` / `INACTIVE`
- User permanantly soft deleted - `isDeleted`

### Financial Records
- Full CRUD operations on financial records
- Record types — `INCOME` and `EXPENSE`
- Soft delete support — records are never permanently lost
- Filter records by type, category, amount range, and date range
- Pagination support on record listing

### Category Management
- Admin controlled categories — no free text input from users
- Two stage lifecycle managed via separate flags:
  - `isActive` — controls availability for new records. Deactivating hides the 
    category from new record creation but preserves all existing records that 
    reference it. Admin can reactivate at any time.
  - `isDeleted` — permanent soft delete. Marks the category as fully removed 
    from the system without physically deleting the database row, preserving 
    referential integrity with existing financial records.
- Dashboard analytics include historical data from deactivated categories 
  for complete and accurate reporting

### Dashboard & Analytics
- Summary stats — total income, total expenses, net balance
- Category wise breakdown with income, expense, and net per category
- Monthly trends — aggregated income and expense per month (up to 12 months)
- Weekly trends — aggregated income and expense per week (up to 12 weeks)
- All dashboard endpoints support category filtering

### Access Control

| Endpoint | VIEWER | ANALYST | ADMIN |
|---|---|---|---|
| Dashboard summary | ✅ | ✅ | ✅ |
| View records | ❌ | ✅ | ✅ |
| Filter records | ❌ | ✅ | ✅ |
| Create / Edit / Delete records | ❌ | ❌ | ✅ |
| Manage categories | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |

---

## Project Structure

## Project Structure
```
finance-backend/
├── prisma/
│   ├── generated/          # Prisma generated client (auto generated, not committed)
│   ├── migrations/         # Database migration history
│   ├── prisma.service.ts   # PrismaService — database connection
│   ├── schema.prisma       # Database schema and models
│   └── seed.ts             # Database seeder — default admin, categories, users
│
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   └── login.dto.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   └── jwt.strategy.ts
│   │
│   ├── category/
│   │   ├── dto/
│   │   │   └── category.dto.ts
│   │   ├── category.controller.ts
│   │   ├── category.module.ts
│   │   └── category.service.ts
│   │
│   ├── users/
│   │   ├── dto/
│   │   │   └── user.dto.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   └── users.service.ts
│   │
│   ├── records/
│   │   ├── dto/
│   │   ├── records.controller.ts
│   │   ├── records.module.ts
│   │   └── records.service.ts
│   │
│   ├── dashboard/
│   │   ├── dto/
│   │   │   └── records.dto.ts
│   │   ├── dashboard.controller.ts
│   │   ├── dashboard.module.ts
│   │   └── dashboard.service.ts
│   │
│   ├── common/
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   ├── services/
│   │   │   └── filter.service.ts
│   ├── app.module.ts
│   └── main.ts
│
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```


---

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Node.js 20+ (only needed if running outside Docker)

### Run with Docker
```bash
# Clone the repository
git clone https://github.com/your-username/finance-backend.git
cd finance-backend

# Copy environment file
cp .env.example .env

# Start all containers (NestJS app + PostgreSQL + pgAdmin)
docker compose up --build
```

### Run Migrations and Seed
```bash
# In a separate terminal after containers are up
docker compose exec app npx prisma migrate dev --name init
docker compose exec app npx prisma db seed
```

### Access Points

| Service | URL |
|---|---|
| API | http://localhost:3000 |
| Prisma Studio | Run `docker compose exec app npx prisma studio` |

---

## Environment Variables

Create a `.env` file based on `.env.example`:
```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/finance_db
JWT_SECRET=your_secret_key_here
```

---

## API Overview

### Auth

POST   /auth/login              # Login and receive JWT token

### Users (Admin only)
GET    /users/get-all-users     # List all users with pagination

POST   /users/create-user            # Create a new user

PATCH  /users/update-user-role/:id   # Update user role

PATCH  /users/update-user-status/:id # Activate or deactivate user

DELETE /users/delete-user/:id        # Soft delete a user

GET    /users/get-viewers            # List all viewers with pagination

GET    /users/get-analysts           # List all analysts with pagination

GET    /users/get-admins             # List all admins with pagination


### Records (Admin full access, Analyst read only)
POST   /records/create-record                 # Create a record

GET    /records/filter-records                # Filter records by type, category, amount, date

PATCH  /records/update-record/:id             # Update a record

DELETE /records/delete-record/:id             # Soft delete a record


### Categories (Admin only)
GET    /categories/get-all-categories              # List all active categories

POST   /categories/create-category                 # Create a category

PATCH  /categories/update-category/:id             # Update a category

DELETE /categories/delete-category/:id             # Soft delete (deactivate) a category


### Dashboard (All roles)
GET    /dashboard/summary-and-category-stats   # Summary + category breakdown

GET    /dashboard/trends-monthly               # Monthly income and expense trends

GET    /dashboard/trends-weekly                # Weekly income and expense trends

GET    /dashboard/recent-activity              # last n records created based on category filter

---

## Seeded Credentials

After running `npm run seed` the following users are available:

| Role | Email | Password |
|---|---|---|
| Admin | admin1@example.com | admin1123 |
| Analyst | analyst1@example.com | analyst1123 |
| Viewer | viewer1@example.com | viewer1123 |

---

## Design Decisions

**PostgreSQL over MongoDB** — Financial data is relational and requires ACID transactions. Aggregations like monthly totals and category breakdowns are natural SQL operations. PostgreSQL handles millions of rows comfortably before scaling becomes a concern.

**Soft deletes everywhere** — Financial records and users are never permanently deleted. This preserves audit history and prevents data loss from accidental deletions.

**Category controlled by Admin** — Free text category input leads to inconsistent data and unreliable aggregations. Admin managed categories ensure dashboard analytics are always accurate.

**Aggregation in PostgreSQL not JavaScript** — Monthly and weekly trends use raw SQL with `DATE_TRUNC` and `GROUP BY`. This keeps data transfer minimal — only aggregated rows travel over the network instead of thousands of raw records.

**Single groupBy for summary** — Category stats and overall summary are derived from a single `groupBy` query rather than separate aggregate queries. This guarantees consistency — all numbers come from the same database snapshot.

---

## Assumptions

- All users are created by an Admin — no self registration
- Financial records are company wide data, not user owned — `createdById` is an audit field only
- A deactivated category still appears on existing records for historical accuracy but is hidden from new record creation
- JWT tokens expire in 7 days by default

---

## Author

Built as part of a backend engineering assessment.
