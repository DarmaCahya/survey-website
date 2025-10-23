# Backend Authentication API

Backend Go untuk sistem authentication yang terpisah dari frontend Next.js.

## 🏗️ Struktur Backend

```
apps/api/
├── main.go                    # Entry point server
├── go.mod                     # Go dependencies
├── Dockerfile                 # Container image
├── env.example               # Environment variables template
└── internal/
    ├── config/               # Configuration management
    ├── database/            # Database connection & migration
    ├── model/               # GORM models (User, Session)
    ├── repository/          # Data access layer
    ├── service/             # Business logic & JWT
    ├── handler/             # HTTP handlers
    └── middleware/          # JWT authentication middleware
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
cd apps/api
cp env.example .env
# Edit .env dengan database URL dan JWT secret
```

### 2. Install Dependencies
```bash
go mod download
```

### 3. Run Server
```bash
go run main.go
```

Server akan berjalan di `http://localhost:8080`

## 🔧 Environment Variables

```env
# Database
DATABASE_URL=postgres://survey_user:survey_password@localhost:5432/survey_db?sslmode=disable

# JWT Secret (ubah di production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=8080
GIN_MODE=debug
```

## 📚 API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints

#### Get User Profile
```http
GET /api/v1/profile
Authorization: Bearer <access_token>
```

#### Update User Profile
```http
PUT /api/v1/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Updated"
}
```

#### Logout
```http
POST /api/v1/logout
Authorization: Bearer <access_token>
```

### Health Check
```http
GET /health
```

## 🔐 Authentication Flow

1. **Register/Login** → Client dapat `access_token` + `refresh_token`
2. **API Calls** → Gunakan `access_token` di header `Authorization: Bearer <token>`
3. **Token Expired** → Gunakan `refresh_token` untuk mendapatkan `access_token` baru
4. **Logout** → Invalidate token (implementasi bisa ditambahkan)

## 🛠️ Tech Stack

- **Framework**: Gin (HTTP router)
- **Database**: PostgreSQL + GORM (ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **Password**: bcrypt (hashing)
- **Validation**: Manual validation
- **CORS**: Configured untuk frontend

## 🔒 Security Features

- **Password Hashing**: bcrypt dengan salt
- **JWT Tokens**: 
  - Access token: 15 menit
  - Refresh token: 7 hari
- **CORS**: Configured untuk frontend domain
- **Input Validation**: Server-side validation
- **Error Handling**: Proper HTTP status codes

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    token_id VARCHAR(36) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testing API

### Menggunakan curl:

```bash
# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile (protected)
curl -X GET http://localhost:8080/api/v1/profile \
  -H "Authorization: Bearer <access_token>"
```

### Menggunakan Postman/Insomnia:

1. Import collection dengan endpoints di atas
2. Set environment variable `base_url` = `http://localhost:8080/api/v1`
3. Test semua endpoints

## 🚀 Production Deployment

### Docker
```bash
# Build image
docker build -t survey-api ./apps/api

# Run container
docker run -d \
  -p 8080:8080 \
  -e DATABASE_URL="postgres://user:pass@host:5432/db" \
  -e JWT_SECRET="your-production-secret" \
  survey-api
```

### Binary
```bash
# Build binary
cd apps/api
go build -o survey-api .

# Run
./survey-api
```

## 🔧 Development

### Hot Reload
```bash
# Install air untuk hot reload
go install github.com/cosmtrek/air@latest

# Run dengan hot reload
air
```

### Database Migration
- GORM auto-migrate saat aplikasi start
- Models akan otomatis dibuat/updated
- Untuk production, gunakan proper migration tool

## 📝 Next Steps

1. **Test API** dengan Postman/curl
2. **Integrate dengan frontend** yang sudah ada
3. **Add email verification** untuk production
4. **Add password reset** functionality
5. **Add rate limiting** untuk security
6. **Add logging** untuk monitoring

## 🤝 Integration dengan Frontend

Frontend Next.js bisa menggunakan API ini dengan:

```javascript
// Login example
const response = await fetch('http://localhost:8080/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { access_token, user } = await response.json();

// Store token
localStorage.setItem('token', access_token);

// Use token for API calls
const apiResponse = await fetch('http://localhost:8080/api/v1/profile', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
```
