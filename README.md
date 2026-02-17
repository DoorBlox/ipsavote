
# IPSA Student Council Election Portal

A professional, secure voting platform for Student Council elections.

## 🚀 Deployment to Vercel

1. **GitHub**: Upload these files to a GitHub repository.
2. **Vercel Dashboard**: Log in to [Vercel](https://vercel.com) and click **Add New Project**.
3. **Import**: Import your GitHub repository.
4. **Environment Variables**:
   - Add `API_KEY` in the project settings. This will be used as the admin passphrase if not explicitly changed in `constants.ts`.
5. **Deploy**: Vercel will automatically detect Vite and deploy your app.

## 🛠 Features

- **Role-Based Ballots**: Automatically shows the correct candidates based on whether the voter is Male, Female, or a Teacher.
- **QR Authentication**: Unique single-use tokens distributed via QR codes.
- **Admin Dashboard**: Real-time stats, turnout tracking, and CSV voter management.
- **Printable Tokens**: Generate A4-ready sheets of QR tokens for physical distribution.

## 📦 Tech Stack

- **React 19**
- **Vite**
- **Tailwind CSS**
- **Lucide React** (Icons)
- **Recharts** (Data Visualization)
- **Html5-Qrcode** (Scanner)
