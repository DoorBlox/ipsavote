# 🏛️ IPSA Student Council Election Portal

The **IPSA Election Portal** is a robust, high-security digital voting solution specifically engineered for school student council elections. It replaces traditional paper ballots with a modern, "kiosk-first" experience that ensures election integrity while providing administrators with powerful real-time tools.

Designed for the International Program Student Association (IPSA), the platform focuses on a seamless end-to-end workflow: from bulk voter provisioning to secure QR-based authentication and live result visualization.

---

## ✨ Key Features

### 🔐 Security & Integrity
- **QR Token Authentication**: Single-use, cryptographically unique tokens ensure each student votes exactly once.
- **Secret Ballot Architecture**: The system tracks *who* has voted (participation) but decouples that identity from *how* they voted, ensuring total candidate selection privacy.
- **Single-Use Enforcement**: Tokens are invalidated immediately upon successful submission.
- **Admin Passphrase Protection**: Staff-only dashboard access for election management and monitoring.

### 🗳️ Intelligent Voting Logic
- **Role-Based Provisioning**:
  - **Male Students**: Automated access to the Male Presidential ballot.
  - **Female Students**: Automated access to the Female Presidential ballot.
  - **Teachers/Faculty**: Dual-voting capability for both executive seats.
- **Rich Candidate Profiles**: High-quality imagery and vice-presidential ticket details displayed directly on the digital ballot.

### 📊 Administrative Power
- **Live Metrics Dashboard**: Real-time bar charts and participation trackers (Turnout %, Votes Cast, Remaining Voters).
- **Bulk Provisioning**: Instant voter registry creation via simple CSV uploads (Name and Role).
- **Print-Ready Ballot Generator**: Built-in tool to generate and print A4 sheets of QR-coded credentials with security watermarks.
- **Result Exporting**: One-click CSV export of raw election data for official school records.

### ⚡ Technical Excellence
- **Hybrid Offline/Cloud Sync**: Powered by **Supabase** for real-time database updates with robust **Local Persistence** for resilience against internet drops.
- **Scanner Optimization**: High-performance QR engine that supports both live camera scanning and image file uploads.
- **Responsive Kiosk Design**: Aesthetically striking UI optimized for desktops, tablets, and dedicated voting terminals.

---

## 🚀 Quick Start & Deployment

### 1. Database Setup (Supabase)
This app uses **Supabase** for real-time data sync. 
1. Create a project at [supabase.com](https://supabase.com).
2. Create a table named `voters` with the following columns:
   - `id`: uuid (primary key)
   - `name`: text
   - `role`: text (male, female, or teacher)
   - `token`: text (unique)
   - `used`: boolean (default: false)
   - `maleVote`: text (nullable)
   - `femaleVote`: text (nullable)
3. Enable **RLS (Row Level Security)** and create a policy allowing public `SELECT`, `INSERT`, and `UPDATE`.

### 2. Deployment (Vercel)
1. Push your code to GitHub.
2. Import the repo to [Vercel](https://vercel.com).
3. Add the following **Environment Variables**:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
   - `VITE_ADMIN_PASSPHRASE`: Your chosen password for staff access.

---

## 🛠️ Customization Guide

### Changing Candidates
Open `constants.ts` to update the nominee list:
- Update names, vice-president partners, and image URLs.
- Note: Use high-resolution square (1:1) images for the best visual appearance on the ballot.

### Updating Branding
In `constants.ts`, change the `APP_LOGO` URL to your school's official crest. This will automatically update the browser favicon, the header, the scanning UI, and the printed voter cards.

---

## 📋 Election Day Workflow

1. **Provisioning**: Upload your student list CSV (Name, Role).
2. **Credentialing**: Print the generated QR tokens and distribute them to students.
3. **Voting**: Students scan their tokens at the kiosk and select their candidates.
4. **Monitoring**: Admins watch the results accumulate in real-time from a separate device.
5. **Finalizing**: Export the final CSV and perform a **System Hard Reset** to clear the database for the next year.

---
*Developed for the IPSA Executive Board 2026.*