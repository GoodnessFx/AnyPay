# AnyPay - Universal Value Router

The "Google Translate of money" - seamlessly convert between different payment methods like airtime, gift cards, crypto, bank transfers, M-Pesa, etc.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── App.tsx                 # Main application component
├── components/             # Reusable UI components
│   ├── ui/                # Shadcn/ui components
│   └── ...                # Custom components
├── styles/                # Global styles and Tailwind config
├── utils/                 # Utility functions
├── hooks/                 # Custom React hooks
└── supabase/             # Backend functions
```

## 🛠️ Tech Stack

- **Frontend:** React 18 + Next.js 14 + TypeScript
- **Styling:** Tailwind CSS v4
- **Animation:** Motion (Framer Motion)
- **Backend:** Supabase (Database + Auth + Edge Functions)
- **UI Components:** Shadcn/ui + Radix UI
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## 📦 Key Dependencies

- `next` - React framework
- `react` & `react-dom` - Core React
- `tailwindcss` - Utility-first CSS framework
- `motion` - Animation library
- `@supabase/supabase-js` - Supabase client
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `lucide-react` - Icon library
- `sonner` - Toast notifications
- `recharts` - Data visualization

## 🔧 Development

To start development:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌍 Environment Setup

Make sure to configure your Supabase project and add the environment variables to `.env.local`.

## 📱 Features

- Universal value conversion
- Multi-currency wallet
- Real-time transaction tracking
- Cross-border payments
- Mobile-first responsive design
- Secure authentication
- Transaction history
- Quick actions and stats

## 🚀 Deployment

This app is ready to deploy on Vercel, Netlify, or any Node.js hosting platform.

For Vercel deployment:
```bash
npm run build
```

Then connect your GitHub repository to Vercel for automatic deployments.