# Deployment Guide - AI Poster Shop

## 1. Supabase Setup (Backend)

### 1.1 Create Project
1. Go to https://supabase.com
2. Create new project
3. Save:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 Run Database Schema
1. Go to SQL Editor
2. Copy contents from `lib/supabase/schema.sql`
3. Run the SQL

### 1.3 Insert Test Products
```sql
INSERT INTO products (sku, name, format_size, aspect_ratio, base_price_cents, material) VALUES
('POSTER-A4', 'Poster A4', '210×297 mm', 0.71, 1299, 'Matte Paper 250g'),
('POSTER-A3', 'Poster A3', '297×420 mm', 0.71, 1999, 'Matte Paper 250g'),
('POSTER-A2', 'Poster A2', '420×594 mm', 0.71, 2999, 'Matte Paper 250g'),
('POSTER-30x40', 'Poster 30×40 cm', '300×400 mm', 0.75, 2499, 'Matte Paper 250g'),
('POSTER-50x70', 'Poster 50×70 cm', '500×700 mm', 0.71, 3999, 'Matte Paper 250g');
```

### 1.4 Enable Auth
1. Go to Authentication → Providers
2. Enable "Email" provider
3. Configure email templates (German)
4. Set Site URL to your Vercel domain

---

## 2. Stripe Setup (Payments)

### 2.1 Account
1. Go to https://stripe.com
2. Create account (test mode for now)
3. Get API keys from Developers → API Keys

### 2.2 Webhook
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
4. Save webhook secret

---

## 3. Replicate Setup (AI)

1. Go to https://replicate.com
2. Create account
3. Get API token from Account Settings
4. Enable "black-forest-labs/flux-schnell" model

---

## 4. Vercel Deployment

### 4.1 Prepare Project
```bash
cd my-app
# Ensure all dependencies installed
npm install
# Test build locally
npm run build
```

### 4.2 Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Replicate (Flux)
REPLICATE_API_TOKEN=r8_...

# WISO Mein Büro (optional for now)
WISO_API_KEY=your_wiso_key
WISO_API_SECRET=your_wiso_secret
WISO_OWNERSHIP_ID=your_ownership_id

# HP DesignJet Z2100 (optional for now)
PRINTER_IP=192.168.1.xxx
PRINTER_SNMP_COMMUNITY=public

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4.3 Deploy
1. Push to GitHub
2. Go to https://vercel.com
3. Import project
4. Add environment variables
5. Deploy

---

## 5. Post-Deployment Checklist

### 5.1 Test Shop Flow
- [ ] View products
- [ ] Upload image
- [ ] AI generation
- [ ] Stripe checkout (test mode)
- [ ] Success page

### 5.2 Test Admin
- [ ] Login
- [ ] View dashboard
- [ ] View orders
- [ ] Kanban board
- [ ] Newsletter export

### 5.3 Configure Domain (Optional)
1. Add custom domain in Vercel
2. Update `NEXT_PUBLIC_APP_URL`
3. Update Supabase Auth redirect URLs
4. Update Stripe webhook URL

---

## 6. Production Checklist

### 6.1 Security
- [ ] Enable RLS policies verified
- [ ] Stripe in live mode
- [ ] Replicate token secured
- [ ] No hardcoded secrets

### 6.2 GDPR
- [ ] Privacy page created
- [ ] Imprint page created
- [ ] Cookie banner (if needed)
- [ ] Data processing agreement with Supabase

### 6.3 Monitoring
- [ ] Vercel Analytics enabled
- [ ] GA4 configured (optional)
- [ ] Error tracking (Sentry optional)

---

## Quick Commands

```bash
# Local dev
npm run dev

# Build test
npm run build

# Lint
npm run lint

# Deploy (if using Vercel CLI)
vercel --prod
```