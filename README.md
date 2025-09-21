# DaGalow - Personal Coaching & Business Platform

A comprehensive React-based web application for Daniel DaGalow's personal coaching, consultation, and investment services. This platform provides a complete solution for client management, service booking, payment processing, and multi-language support.

## 🌟 Features

### Core Services
- **Individual Consultations** - 90€/hour personal coaching sessions
- **Direct Coaching** - Monthly subscription plans (Basic: 40€, Standard: 90€, Premium: 230€)
- **Investment Opportunities** - Pitch deck requests for current and upcoming ventures

### Service Areas
- **Mindset & Psychology** - Mental resilience and growth mindset development
- **Social Media Growth** - Content strategy and audience building
- **Finance & Wealth** - Investment principles and wealth-building strategies
- **Marketing & Sales** - Digital campaigns and brand development
- **Business Building** - Business planning and scaling guidance
- **Relationships** - Personal and professional relationship coaching

### Key Features
- 🔐 **User Authentication** - Secure login/signup with Google OAuth
- 📅 **Advanced Scheduling** - Multi-step booking system with calendar integration
- 💳 **Payment Processing** - Stripe integration for secure payments and subscriptions
- 🤖 **AI Chatbot** - Interactive chat interface for client support
- 🌍 **Multi-language Support** - English, Spanish, Portuguese (PT/BR)
- 📱 **Responsive Design** - Mobile-first approach with modern UI/UX
- 📊 **User Dashboard** - Profile management, appointments, subscriptions tracking
- 🎯 **Service Management** - Comprehensive booking and payment workflow

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **React Hook Form** - Form management and validation
- **React Query** - Server state management and caching

### Backend & Services
- **Supabase** - Backend-as-a-Service (Database, Auth, Functions)
- **Stripe** - Payment processing and subscription management
- **Netlify** - Hosting and serverless functions
- **i18next** - Internationalization framework

### UI Components
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library
- **Mantine** - Additional UI components
- **Swiper** - Touch slider/carousel
- **React Calendar** - Calendar components

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Stripe account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DaGalow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── chatbot/         # AI chatbot interface
│   ├── common/          # Shared components
│   ├── hero/            # Landing page sections
│   ├── scheduling/      # Booking system components
│   ├── ui/              # Base UI components
│   └── ...
├── contexts/            # React contexts (Auth, Notifications)
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API service functions
├── utils/               # Utility functions
└── lib/                 # Configuration files
```

## 🌐 Internationalization

The platform supports multiple languages:
- **English** (en) - Default
- **Spanish** (es)
- **Portuguese Portugal** (pt-PT)
- **Portuguese Brazil** (pt-BR)

Language files are located in `public/locales/` and managed through i18next.

## 💳 Payment Integration

### Stripe Configuration
- **Consultations**: One-time payments (90€/hour)
- **Coaching**: Monthly subscriptions (40€, 90€, 230€)
- **Investment**: Pitch deck requests (free)

### Payment Flow
1. Service selection and configuration
2. Contact information collection
3. Payment processing via Stripe Checkout
4. Webhook handling for subscription management
5. Success/cancellation redirects

## 🔐 Authentication

### Features
- Email/password authentication
- Google OAuth integration
- Password reset functionality
- Protected routes and user sessions
- Profile management

### User Roles
- **Clients** - Can book services and manage appointments
- **Admin** - Full platform access and management

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile** - Optimized for smartphones
- **Tablet** - Enhanced layout for medium screens
- **Desktop** - Full-featured experience for large screens

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Set environment variables in Netlify dashboard
4. Deploy

### Other Platforms
The application can be deployed to any static hosting service that supports SPA routing.

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Quality
- ESLint configuration for code quality
- Prettier for code formatting
- TypeScript support (optional)

## 📊 Database Schema

### Key Tables
- **users** - User profiles and authentication
- **appointments** - Booking and scheduling data
- **subscriptions** - Coaching plan subscriptions
- **pitch_deck_requests** - Investment opportunity requests
- **testimonials** - Client testimonials and reviews

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary. All rights reserved.

## 📞 Support

For technical support or questions about the platform, please contact the development team.

---

**Built with ❤️ for Daniel DaGalow's coaching business**