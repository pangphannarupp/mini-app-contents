# Mini App Contents & Authentication Server

Lightweight, high-performance REST API server for the **MCNC Super App** providing user authentication, session management, and the central Mini App catalog.

---

## 📁 Project Structure

```
mini-app-contents/
├── data/
│   ├── users.json       # User accounts & login credentials
│   └── miniapps.json    # Complete Mini App ecosystem catalog
├── server.js            # Express.js REST API server
├── package.json         # Node.js dependencies and scripts
└── README.md            # API documentation & guide
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
# Production mode
npm start

# Development mode (with auto-restart on changes)
npm run dev
```

The server will be running at `http://localhost:3000`.

---

## 🔑 Authentication Endpoints

### 1. User Login
- **Endpoint**: `POST /api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "userId": "admin",
  "password": "password123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "superapp_session_admin_1771757650000_abc123",
  "user": {
    "userId": "admin",
    "userName": "System Administrator",
    "role": "Super Admin",
    "email": "admin@superapp.com",
    "avatarUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces",
    "department": "IT Operations & Security"
  }
}
```

### 2. List Demo Users
- **Endpoint**: `GET /api/auth/users`
- Returns all test accounts (excluding passwords).

### 3. Get User Profile by Token
- **Endpoint**: `GET /api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`

---

## 📱 Mini App Catalog Endpoints

### 1. List All Mini Apps
- **Endpoint**: `GET /api/miniapps`
- **Query Parameters**:
  - `section`: Filter by section (`discover`, `categories`, `popular`)
  - `category`: Filter by category ID (`cat_entertainment`, `cat_shop`, `cat_telecom`, etc.)
  - `search`: Case-insensitive text search across title and description

*Example*:
```bash
# Get all mini apps in the 'popular' section
curl http://localhost:3000/api/miniapps?section=popular

# Search for coffee apps
curl http://localhost:3000/api/miniapps?search=coffee
```

### 2. Get Single Mini App by App ID
- **Endpoint**: `GET /api/miniapps/:appId`
- *Example*: `GET /api/miniapps/smart_service`

---

## 👥 Pre-configured Demo Accounts

| User ID | Password | Name | Role | Department |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | `password123` | System Administrator | Super Admin | IT Operations & Security |
| `phanna` | `password123` | Phanna Pang | Lead Architect | Core Engineering |
| `reader01` | `password123` | Sophea Chan | Premium Reader | Digital Library |
| `partner_dev` | `password123` | Bona Sok | Mini App Developer | Partner Ecosystem |

---

## 🧪 Testing with cURL

```bash
# 1. Test Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"phanna","password":"password123"}'

# 2. Get Mini Apps
curl http://localhost:3000/api/miniapps
```
