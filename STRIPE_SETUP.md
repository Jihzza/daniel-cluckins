# Stripe Payment Integration Setup

## 🔧 **Environment Variables Required**

Add these to your `.env` file:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Site URL for Stripe redirects
SITE_URL=http://localhost:5173

# Supabase Configuration (if not already set)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📦 **Dependencies to Install**

```bash
npm install @stripe/stripe-js stripe
```

## 🎯 **How It Works**

### **For Appointments:**
1. User says: *"Schedule me a consultation for tomorrow at 3pm for 90 minutes"*
2. Chatbot shows: *"I'll schedule your consultation... The cost is €135.00. Redirecting to payment..."*
3. User gets redirected to Stripe checkout
4. After payment: *"🎉 Payment successful! Your appointment has been confirmed."*

### **For Coaching Subscriptions:**
1. User says: *"I want to subscribe to the premium coaching plan"*
2. Chatbot shows: *"I'll set up your premium coaching subscription. The cost is €230/month. Redirecting to payment..."*
3. User gets redirected to Stripe checkout
4. After payment: *"🎉 Payment successful! Your premium coaching subscription is now active."*

### **For Pitch Deck Requests:**
- **FREE** - No payment required
- User says: *"I'd like to request the GalowClub pitch deck"*
- Chatbot shows: *"Pitch deck request recorded: GalowClub. We'll follow up by email if provided."*

## 💰 **Pricing Structure**

### **Appointments:**
- €90/hour
- 45 min: €67.50
- 60 min: €90.00
- 75 min: €112.50
- 90 min: €135.00
- 105 min: €157.50
- 120 min: €180.00

### **Coaching Subscriptions:**
- Basic: €40/month
- Standard: €90/month
- Premium: €230/month

### **Pitch Deck Requests:**
- **FREE** ✅

## 🚀 **Testing**

1. Set up Stripe test keys
2. Test with: *"Schedule me a consultation for tomorrow at 3pm for 90 minutes"*
3. Use Stripe test card: `4242 4242 4242 4242`
4. Check your Stripe dashboard for successful payments

## 🔒 **Security Notes**

- Never commit real Stripe keys to version control
- Use test keys for development
- Switch to live keys only in production
- Set up webhooks for production payment handling
