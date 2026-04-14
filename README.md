# 🚀 Apn-E-Dukaan

The ultimate hyperlocal marketplace combining the best of Meesho, OLX, and WhatsApp.

## ✨ Current Highlights

- OTP-secured auth flows: register/login/forgot-password
- Role-based platform: Buyer, Seller, Admin
- Dedicated admin entry page at `/admin-login`
- Dynamic wishlist/cart ecosystem with move-to-cart and live navbar updates
- Seller productivity tools (edit listing, quick restock, order pipeline)
- Admin operations suite (moderation queue, user management, audit logs, analytics, CSV export)

## 📂 Folder Structure

```
Apn-E-Dukaan/
├── backend/                  # Django & DRF Backend
│   ├── config/               # Main settings, URLs
│   ├── users/                # User Auth & Roles (Buyer/Seller)
│   ├── products/             # Product Management
│   ├── orders/               # Cart & Checkout System
│   ├── chat/                 # WhatsApp-style chat/negotiation
│   ├── manage.py
│   └── requirements.txt
└── frontend/                 # React & Vite Frontend
    ├── src/
    │   ├── api/              # Axios interceptors config
    │   ├── components/       # Reusable UI (Navbar, etc)
    │   ├── context/          # React Context (Auth)
    │   ├── pages/            # Home, Login, Dashboards, Cart, Detail
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js    # Premium Design System constraints
    └── package.json
```

## 🔌 API Endpoints List

**Auth (`/api/auth/`)**
* `POST /register/` - Register new user (Buyer/Seller)
* `POST /register/verify-otp/` - Verify registration OTP
* `POST /login/` - Validate username+email+password and send login OTP
* `POST /login/otp/verify/` - Verify login OTP and return JWT tokens
* `POST /resend-otp/` - Resend OTP (login/registration)
* `POST /password-reset/request/` - Request password reset OTP
* `POST /password-reset/verify/` - Verify password reset OTP
* `POST /password-reset/reset/` - Reset password with reset token
* `GET/PUT /profile/` - View/update profile

**Products (`/api/products/`)**
* `GET /products/` - List products (supports search/filter/sort)
* `POST /products/` - Add product (Seller)
* `GET /products/{id}/` - Product detail
* `PATCH/DELETE /products/{id}/` - Edit/remove product

**Wishlist (`/api/wishlist/`)**
* `GET /wishlist/` - List saved products
* `POST /wishlist/` - Add product to wishlist
* `DELETE /wishlist/{id}/` - Remove item from wishlist
* `POST /wishlist/move_to_cart/` - Move wishlist item to cart

**Cart & Orders (`/api/cart/` & `/api/orders/`)**
* `GET /cart/` - View active cart
* `POST /cart/add_item/` - Add product to cart
* `DELETE /cart/remove_item/` - Remove from cart
* `PATCH /cart/update_item/` - Update item quantity
* `POST /orders/` - Checkout and place an order
* `GET /orders/` - Buyer/Seller specific order lists

**Chat (`/api/chat/`)**
* `GET /chat/` - Retrieve chat history
* `POST /chat/` - Send a message or make an offer
* `POST /chat/{id}/counter_offer/` - Counter-offer flow

**Notifications (`/api/notifications/`)**
* `GET /notifications/` - List notifications
* `POST /notifications/mark_all_read/` - Mark all as read

**Reports & Moderation (`/api/reports/`)**
* `GET /reports/` - List reports (admin supports filters)
* `POST /reports/` - Create report
* `PATCH /reports/{id}/update_status/` - Update report status/notes (admin)
* `PATCH /reports/bulk_update/` - Bulk status update (admin)

**Admin Ops**
* `GET /api/admin/analytics/` - KPI + risk metrics
* `GET /api/admin/users/` - User management list/search
* `POST /api/admin/users/{id}/suspend/` - Suspend user
* `POST /api/admin/users/{id}/reactivate/` - Reactivate user
* `POST /api/admin/users/{id}/change_role/` - Change user role
* `POST /api/admin/users/{id}/force_password_reset/` - Force reset OTP
* `GET /api/admin/audit-logs/` - Admin audit trail

## 🧭 Role Entry Points

- Buyer register: `http://localhost:5173/register?role=BUYER`
- Seller register: `http://localhost:5173/register?role=SELLER`
- Standard login: `http://localhost:5173/login`
- Admin login: `http://localhost:5173/admin-login`

## ⚙️ Setup Instructions (Local)

1. **Backend Database**
   By default, the app is configured to use `db.sqlite3` for a frictionless quickstart.

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   # Activate venv: .\venv\Scripts\activate (Windows) or source venv/bin/activate (Mac/Linux)
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 8000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the App**
   Open your browser and navigate to `http://localhost:5173`. 
   The backend API will be running on `http://localhost:8000`.

## 🛡️ Admin Login Notes

- Admin login is via `/admin-login` (frontend) with OTP verification.
- Make sure admin user has:
  - `role='ADMIN'`
  - `is_verified=True`
  - `is_active=True` and not suspended
- If required, promote a user in Django shell:
  ```bash
  cd backend
  python manage.py shell
  ```
  ```python
  from users.models import User
  u = User.objects.get(email="your_admin_email@example.com")
  u.role = "ADMIN"
  u.is_verified = True
  u.is_staff = True
  u.is_superuser = True
  u.save()
  ```

## 🚀 Deployment Guide (Production & PostgreSQL)

### 1. PostgreSQL Preparation
When deploying, inject your Postgres URL via environment variables. The `requirements.txt` already includes `psycopg2-binary` and `django-environ`.
- In `backend/config/settings.py`, replace the `DATABASES` section to use `dj-database-url` and pull `DATABASE_URL` from the environment.

### 2. Backend Deployment (Render or Railway)
- Connect your GitHub repository to Render/Railway.
- Set the root directory to `backend`.
- Build Command: `pip install -r requirements.txt && python manage.py migrate`
- Start Command: `gunicorn config.wsgi:application` (Install `gunicorn` first).
- **Environment Variables**: Add `SECRET_KEY`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `DATABASE_URL`.

### 3. Frontend Deployment (Vercel)
- Connect your GitHub repository to Vercel.
- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- **Environment Variables**: Add `VITE_API_URL` pointing to your deployed backend URL (e.g., `https://your-backend.onrender.com/api/`). Update `axios.js` to use `import.meta.env.VITE_API_URL`.
