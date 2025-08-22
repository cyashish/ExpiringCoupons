# CouponPilot - Netlify Deployment Guide

## Quick Deploy to Netlify

1. **Fork/Clone this repository** to your GitHub account

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account and select this repository

3. **Build Settings** (should auto-detect):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

4. **Deploy**: Click "Deploy site"

## Configuration Files

### netlify.toml
- Configures build settings and redirects
- Routes API calls to serverless functions
- Handles SPA routing

### netlify/functions/api.ts
- Serverless function handling all backend API routes
- Uses in-memory storage (perfect for demos)
- No database setup required

### _redirects (fallback)
- Alternative redirect configuration
- Routes `/api/*` to `/.netlify/functions/api/*`

## Environment Variables

No environment variables needed for basic functionality! The app uses:
- In-memory storage for development/demo
- Mock Gmail OAuth for demonstration
- Sample coupon data

## Live Demo Features

✅ **Coupon Management**: Add, view, and organize digital coupons
✅ **Categories**: Food, ecommerce, travel, banking groupings  
✅ **Mock Gmail Integration**: Simulated OAuth flow (no real email access)
✅ **Export Functionality**: Download coupon data as spreadsheet format
✅ **Responsive Design**: Works on desktop and mobile

## Production Considerations

For production use, you would need to:
1. Set up a real database (Netlify + PlanetScale/Supabase)
2. Configure real Gmail OAuth with Google Cloud Console
3. Add environment variables for API keys
4. Implement proper authentication

## Custom Domain (Optional)

Once deployed, you can add a custom domain:
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

Your app will be live at: `https://your-site-name.netlify.app`