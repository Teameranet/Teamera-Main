# Prisma ORM Integration & Vercel Deployment

## Overview
This guide outlines the complete setup and integration of Prisma ORM as the database layer for Teamera Net, along with deployment instructions for Vercel.

---

## Phase 1: Prisma Setup & Configuration ✅

### 1.1 Install Prisma
```bash
# Install Prisma CLI as dev dependency
npm install -D prisma

# Install Prisma Client
npm install @prisma/client

# Initialize Prisma (creates prisma folder and schema.prisma)
npx prisma init
```

### 1.2 Database Provider Options

Choose one of the following database providers:

#### Option A: PostgreSQL (Recommended for Production)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/teamera?schema=public"
```

#### Option B: MySQL
```env
DATABASE_URL="mysql://username:password@localhost:3306/teamera"
```

#### Option C: MongoDB
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/teamera"
```

#### Option D: SQLite (Development Only)
```env
DATABASE_URL="file:./dev.db"
```

### 1.3 Environment Variables Setup

**Root `.env` file:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/teamera?schema=public"

# JWT Configuration
JWT_SECRET=generate-random-secret-key
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
VITE_API_URL=http://localhost:5000

# Prisma Configuration
DIRECT_URL="${DATABASE_URL}"
```

**Backend `.env` file (if separate):**
```env
DATABASE_URL="postgresql://username:password@localhost:5432/teamera?schema=public"
JWT_SECRET=generate-random-secret-key
PORT=5000
NODE_ENV=production
```

**Important Notes:**
- Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Never commit `.env` files to version control
- Use `.env.example` as template for other developers

---

## Phase 2: Database Schema Definition 📊

### 2.1 Prisma Schema Configuration
**File: `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or "mysql", "mongodb", "sqlite"
  url      = env("DATABASE_URL")
}

// User Model
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  fullName          String
  password          String
  avatar            String?
  bio               String?
  skills            String[]
  github            String?
  linkedin          String?
  portfolio         String?
  projectsCreated   Int       @default(0)
  connectionsHelped Int       @default(0)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  onboarding            UserOnboarding?
  projectsOwned         Project[]               @relation("ProjectOwner")
  projectMemberships    ProjectMember[]
  projectApplications   ProjectApplication[]
  hackathonRegistrations HackathonRegistration[]
  notifications         Notification[]
  messagesSent          Message[]
  dashboardBookmarks    Dashboard[]

  @@map("users")
}

// User Onboarding Model
model UserOnboarding {
  id                String   @id @default(cuid())
  userId            String   @unique
  skillLevel        String
  interests         String[]
  lookingFor        String[]
  availability      String
  completedAt       DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_onboarding")
}

// Project Model
model Project {
  id              String   @id @default(cuid())
  title           String
  description     String
  technologies    String[]
  status          String   @default("Open")
  visibility      String   @default("Public")
  rolesNeeded     String[]
  timeline        String?
  ownerId         String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  owner         User                 @relation("ProjectOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members       ProjectMember[]
  applications  ProjectApplication[]
  messages      Message[]
  dashboards    Dashboard[]

  @@index([ownerId])
  @@map("projects")
}

// Project Members Model
model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  role      String   @default("Member")
  joinedAt  DateTime @default(now())

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@map("project_members")
}

// Project Applications Model
model ProjectApplication {
  id          String   @id @default(cuid())
  projectId   String
  userId      String
  message     String
  status      String   @default("Pending")
  appliedAt   DateTime @default(now())
  respondedAt DateTime?

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([userId])
  @@map("project_applications")
}

// Hackathon Model
model Hackathon {
  id              String   @id @default(cuid())
  title           String
  description     String
  organizerName   String
  organizerLogo   String?
  startDate       DateTime
  endDate         DateTime
  registrationEnd DateTime
  mode            String
  location        String?
  prizes          String[]
  categories      String[]
  website         String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  registrations HackathonRegistration[]

  @@map("hackathons")
}

// Hackathon Registration Model
model HackathonRegistration {
  id           String   @id @default(cuid())
  hackathonId  String
  userId       String
  teamName     String?
  status       String   @default("Registered")
  registeredAt DateTime @default(now())

  // Relations
  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([hackathonId, userId])
  @@index([hackathonId])
  @@index([userId])
  @@map("hackathon_registrations")
}

// Notification Model
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  title     String
  message   String
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isRead])
  @@map("notifications")
}

// Dashboard/Bookmarks Model
model Dashboard {
  id          String   @id @default(cuid())
  userId      String
  projectId   String
  bookmarkedAt DateTime @default(now())

  // Relations
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@index([userId])
  @@index([projectId])
  @@map("dashboard")
}

// Collaboration Space - Messages Model
model Message {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  content   String
  fileUrl   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([userId])
  @@map("messages")
}
```

### 2.2 Generate Prisma Client
```bash
# Generate Prisma Client after schema changes
npx prisma generate
```

### 2.3 Create and Apply Migrations
```bash
# Create initial migration
npx prisma migrate dev --name init

# For production deployment
npx prisma migrate deploy

# Reset database (CAUTION: Deletes all data)
npx prisma migrate reset
```

### 2.4 Prisma Studio (Database GUI)
```bash
# Open Prisma Studio to view/edit data
npx prisma studio
```

---

## Phase 3: Backend Integration 🔧

### 3.1 Prisma Client Configuration
**File: `backend/config/prisma.js`**

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma Database Connected');
  } catch (error) {
    console.error('❌ Prisma Connection Error:', error.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = { prisma, connectDatabase };
```

### 3.2 Authentication Controller
**File: `backend/api/controllers/authController.js`**

```javascript
const { prisma } = require('../../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
  try {
    const { email, fullName, password } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true
      }
    });

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

### 3.3 Project Controller
**File: `backend/api/controllers/projectController.js`**

```javascript
const { prisma } = require('../../config/prisma');

// Create Project
exports.createProject = async (req, res) => {
  try {
    const { title, description, technologies, rolesNeeded, timeline } = req.body;
    const ownerId = req.user.userId;

    const project = await prisma.project.create({
      data: {
        title,
        description,
        technologies,
        rolesNeeded,
        timeline,
        ownerId,
        members: {
          create: {
            userId: ownerId,
            role: 'Founder'
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatar: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    // Update projects created count
    await prisma.user.update({
      where: { id: ownerId },
      data: { projectsCreated: { increment: 1 } }
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get All Projects
exports.getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, technologies } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status }),
      ...(technologies && { technologies: { hasSome: technologies.split(',') } })
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              avatar: true
            }
          },
          _count: {
            select: { members: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.project.count({ where })
    ]);

    res.json({
      projects,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

### 3.4 Update Server.js
**File: `backend/server.js`**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDatabase } = require('./config/prisma');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./api/routes/authRoutes'));
app.use('/api/projects', require('./api/routes/projectRoutes'));
app.use('/api/users', require('./api/routes/userRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

startServer();
```

---

## Phase 4: Vercel Deployment 🚀

### 4.1 Prepare for Vercel Deployment

**Step 1: Create `vercel.json` in root directory**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Step 2: Update `package.json` scripts**
```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "prisma generate && prisma migrate deploy && npm run build",
    "postinstall": "prisma generate"
  }
}
```

### 4.2 Database Configuration for Vercel

#### Option A: Vercel Postgres (Recommended)
1. Go to Vercel Dashboard → Storage → Create Database
2. Select "Postgres"
3. Copy the connection string
4. Add to Vercel Environment Variables

#### Option B: Railway Postgres
1. Create account at [Railway.app](https://railway.app)
2. Create new Postgres database
3. Get connection string
4. Add to Vercel Environment Variables

#### Option C: Supabase Postgres
1. Create project at [Supabase](https://supabase.com)
2. Go to Settings → Database
3. Copy connection string (Direct Connection)
4. Add to Vercel Environment Variables

### 4.3 Environment Variables in Vercel

**In Vercel Dashboard → Settings → Environment Variables, add:**

```env
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
DIRECT_URL=postgresql://username:password@host:5432/database?sslmode=require
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

### 4.4 Deploy to Vercel

**Method 1: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Method 2: GitHub Integration**
1. Push code to GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure environment variables
6. Deploy

### 4.5 Post-Deployment Steps

1. **Run Database Migration**
```bash
# Run migrations on production database
npx prisma migrate deploy

# Or use Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

2. **Verify Deployment**
- Check build logs in Vercel Dashboard
- Test API endpoints: `https://your-app.vercel.app/health`
- Check database connections
- Test authentication flow

3. **Set up Custom Domain** (Optional)
- Go to Vercel Dashboard → Domains
- Add your custom domain
- Configure DNS records

---

## Phase 5: Performance & Security 🔒

### 5.1 Prisma Optimization

**Enable Connection Pooling**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  
  // Connection pool settings
  relationMode = "prisma"
}
```

**Implement Query Optimization**
```javascript
// Use select to fetch only needed fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    fullName: true,
    email: true
  }
});

// Use pagination for large datasets
const projects = await prisma.project.findMany({
  take: 10,
  skip: page * 10,
  orderBy: { createdAt: 'desc' }
});
```

### 5.2 Security Best Practices

1. **Input Validation**
```javascript
const { body, validationResult } = require('express-validator');

exports.createProject = [
  body('title').trim().isLength({ min: 3, max: 100 }),
  body('description').trim().isLength({ min: 10 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // ... rest of the code
  }
];
```

2. **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 5.3 Monitoring & Logging

**Install Winston for logging**
```bash
npm install winston
```

**Configure Logger**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Log Prisma queries in development
const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    }
  ],
});

prisma.$on('query', (e) => {
  logger.info('Query: ' + e.query);
  logger.info('Duration: ' + e.duration + 'ms');
});
```

---

## Phase 6: Testing & Validation ✅

### 6.1 Database Testing

```bash
# Test database connection
npx prisma db pull

# Validate schema
npx prisma validate

# View data in Prisma Studio
npx prisma studio
```

### 6.2 API Testing Checklist

- [ ] User registration works
- [ ] User login returns JWT token
- [ ] Protected routes require authentication
- [ ] Projects can be created
- [ ] Projects can be fetched with pagination
- [ ] Project applications work
- [ ] Member management functions properly
- [ ] Stats update correctly

### 6.3 Production Checklist

- [ ] All environment variables configured in Vercel
- [ ] Database migrations applied
- [ ] SSL/TLS enabled for database
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Health check endpoint works
- [ ] Custom domain configured (if applicable)

---

## Troubleshooting 🔧

### Common Issues

**1. Migration Errors**
```bash
# Reset database (development only)
npx prisma migrate reset

# Force apply migrations
npx prisma migrate deploy --force
```

**2. Connection Pool Errors**
```env
# Increase connection limit
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=5&pool_timeout=10"
```

**3. Vercel Build Failures**
```bash
# Clear build cache
vercel --force

# Check build logs
vercel logs
```

**4. Prisma Client Issues**
```bash
# Regenerate Prisma Client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

---

## Useful Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema from database
npx prisma db pull

# Push schema to database (no migration)
npx prisma db push
```

---

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Railway Postgres](https://railway.app)
- [Supabase](https://supabase.com)

---

## Estimated Timeline

- **Phase 1-2**: 2-3 hours (Setup & Schema)
- **Phase 3**: 4-6 hours (Backend Integration)
- **Phase 4**: 2-3 hours (Vercel Deployment)
- **Phase 5-6**: 2-3 hours (Optimization & Testing)

**Total**: ~10-15 hours

---

## Next Steps

1. Install Prisma and initialize project
2. Design database schema
3. Create and apply migrations
4. Implement backend controllers
5. Test locally
6. Deploy to Vercel
7. Test production deployment

---

## Notes

- Always test migrations in development first
- Use Prisma Studio for quick data inspection
- Keep schema file well-documented
- Use transactions for complex operations
- Monitor database performance in production
- Regularly backup production database
