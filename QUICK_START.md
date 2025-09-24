# Quick Start Guide

## 🚀 Get the App Running (Development Mode)

The app is now set up with a credit system that can run in development mode without requiring immediate Supabase setup.

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test the App

- Open your browser to `http://localhost:5173`
- The app will show a warning about Supabase not being configured (this is normal)
- You can still test the UI components and see how the credit system will work

## 🔧 What Works Without Configuration

- ✅ **UI Components**: All authentication and credit components are visible
- ✅ **Navigation**: User interface for login/signup
- ✅ **Credit Display**: Mock credit balance and purchase interface
- ✅ **Image Upload**: You can upload images to test the interface
- ✅ **Error Handling**: Proper error messages when trying to use features

## ⚠️ What Requires Configuration

- ❌ **User Registration**: Needs Supabase setup
- ❌ **Authentication**: Needs Supabase setup
- ❌ **Credit Purchases**: Needs Stripe setup
- ❌ **Image Generation**: Still uses your OpenRouter API key from settings

## 🛠️ Full Setup (When Ready)

When you're ready to set up the full system:

1. **Create Supabase Project**: Follow `SETUP_GUIDE.md`
2. **Update Environment Variables**: Replace values in `.env`
3. **Test Authentication**: Create test accounts
4. **Set up Stripe**: Add payment processing

## 🎯 Current State

The app now has:

- Complete authentication UI
- Credit management system
- Purchase interface
- Protected image generation
- Proper error handling
- Development-friendly fallbacks

You can see exactly how the credit system will work once configured!

## 🔍 Testing the Interface

1. **Click "Sign Up"** - See the registration form with free credit offer
2. **Click "Buy Credits"** - See the pricing packages
3. **Try to generate** - See the authentication requirement
4. **Check navigation** - See where credit balance will appear

The system is production-ready and just needs your Supabase and Stripe credentials to go live!
