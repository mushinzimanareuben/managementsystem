# Smart Company Management System (SCMS)

SCMS is a modern, professional, and responsive corporate management framework that integrates workforce operations, applicant tracking, programmatic advertisements, and client relations in a unified React + Express codebase.

---

## Technical Stack

- **Frontend**: React.js (Vite), Vanilla CSS design system (Light/Dark themes), Lucide Icons, Chart.js.
- **Backend**: Node.js, Express.js, JWT, Multer (file parsing).
- **Database**: Dual-Mode. Core SQL schemas mapped via Sequelize (SQLite file generated automatically for zero-configuration testing; supports MySQL toggling). Data collection submissions mapped dynamically to MongoDB (Mongoose) with SQL fallback.
- **Storage**: Multi-upload strategy supporting local directory (`backend/uploads/`) with automated Cloudinary API toggle if keys are supplied in `.env`.

---

## Directory Structure

```text
/management system/
  ├── backend/               # Express API and Database Services
  │    ├── config/           # DB Connections (Sequelize & Mongoose)
  │    ├── middleware/       # Auth (JWT & Roles) & Upload (Multer/Cloudinary)
  │    ├── models/           # SQL and MongoDB Models
  │    ├── routes/           # Rest API Routes
  │    ├── uploads/          # Local storage folder for CVs and profile pictures
  │    └── server.js         # Core entry point
  │
  ├── frontend/              # Vite React Client
  │    ├── src/
  │    │    ├── components/  # Layouts (Navbar, Footer)
  │    │    ├── context/     # Auth Context (JWT) & Theme Context (Dark/Light)
  │    │    ├── pages/       # Home, About, Services, Careers, Dashboards
  │    │    └── main.jsx     # DOM entry point
  │    └── index.html        # HTML structure
  │
  └── validate.js            # Workspace structure validation script
```

---

## Configuration & Setup

### 1. Backend Setup

Initialize dependencies and start:

```bash
cd backend
npm install
npm start
```

*Note: On launch, the server will sync database models (creating a local `database.sqlite` file in the backend directory) and seed a default Admin login:*
- **Email**: `admin@company.com`
- **Password**: `AdminPassword123!`

To customize configuration (like connecting MongoDB or MySQL), copy `backend/.env.example` to `backend/.env` and fill out the details:

```ini
PORT=5000
JWT_SECRET=your_secret_key
DB_TYPE=sqlite     # Set to 'mysql' to use MySQL server

# MySQL Details (if DB_TYPE=mysql)
DB_HOST=localhost
DB_USER=root
DB_PASS=password
DB_NAME=company_management

# MongoDB (For Data Collection Module)
# MONGODB_URI=mongodb://localhost:27017/company_management

# Cloudinary (Optional uploads hook)
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...
```

### 2. Frontend Setup

Install packages and boot client dev server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on the default dev port (typically `http://localhost:5173`). Open the browser to interact with the system.

---

## Key Features

1. **Role-Based Access Control**:
   - **Public Pages**: Explore Hero cards, active sponsors announcements, job details, submit contact/inquiry forms, and upload resumes.
   - **Employee Panel**: Review profile indicators, edit personal address/phone/photo records, and read announcements.
   - **Admin Console**: Monitor analytical reports, check visitor metrics, manage employee accounts (CRUD), write job listings, post campaigns, read submissions, and trigger Excel/PDF downloads.
2. **Analytical Visualizations**: Interactive graphs summarizing hiring trends, form shares, and campaign metrics.
3. **Responsive Architecture**: Sleek dark and light styling modes rendering dynamically across mobile, tablet, and desktop views.
