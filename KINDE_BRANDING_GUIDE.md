# Kinde Branding Customization Guide

This guide will help you customize your Kinde authentication pages to match the Zezamii Cloud brand.

---

## 🎨 Brand Colors to Use

Based on your new login page design:

**Primary Colors:**
- **Primary Brand Color**: `#06b6d4` (Cyan 500)
- **Secondary Color**: `#2563eb` (Blue 600)
- **Accent Color**: `#0891b2` (Cyan 600)

**Gradient (for reference):**
- From: `#06b6d4` (cyan-500)
- To: `#2563eb` (blue-600)

**Background:**
- **Dark Background**: `#0f172a` (Slate 900)

---

## 📝 Step-by-Step Customization

### 1. **Access Kinde Dashboard**

1. Go to: https://app.kinde.com/
2. Log in to your Zezamii account
3. Select your **Zezamii** organization/business

---

### 2. **Navigate to Design Settings**

1. Click **Settings** in the left sidebar
2. Click **Design** (or **Branding**)
3. You'll see options for:
   - Logo
   - Brand colors
   - Button styles
   - Background

---

### 3. **Upload Your Logo**

**Recommended Logo Specs:**
- **Format**: PNG with transparent background
- **Size**: 200x200px (or larger, will be scaled)
- **Design**: Cyan-blue cloud icon similar to your landing page

**What to Upload:**
- Create a simple logo with a cloud icon in cyan/blue gradient
- Or use text: "Zezamii Cloud" in a clean font

**Where to Upload:**
- **Settings → Design → Logo**
- Upload for both light and dark backgrounds

---

### 4. **Set Brand Colors**

In **Settings → Design → Colors**:

**Primary Button Color:**
- Set to: `#06b6d4` (Cyan 500)
- This will be your "Continue", "Sign In" buttons

**Primary Button Hover Color:**
- Set to: `#0891b2` (Cyan 600)

**Link Color:**
- Set to: `#06b6d4` (Cyan 500)

**Text Color:**
- Keep default (black/dark gray)

**Background Color (optional):**
- If you want a dark background like your landing page:
- Set to: `#0f172a` (Slate 900)
- However, Kinde looks better with white/light background

---

### 5. **Customize Button Style**

**Button Radius:**
- Set to: `8px` (rounded-lg)

**Button Style:**
- Select: **Filled** (solid color)

---

### 6. **Social Button Customization**

For Google login button:

**Style:**
- Keep as outlined/bordered
- Kinde will automatically show Google branding

---

### 7. **Page Layout**

**Authentication Page Style:**
- Choose: **Centered** or **Card**
- This matches your landing page card design

---

### 8. **Custom Text (Optional)**

In **Settings → Design → Text**:

**Login Page Heading:**
- Change to: "Welcome to Zezamii"

**Login Page Subheading:**
- Change to: "Sign in to access your administration dashboard"

**Sign Up Page Heading:**
- Change to: "Join Zezamii"

**Sign Up Subheading:**
- Change to: "Create your account to get started"

---

### 9. **Custom CSS (Advanced - Requires Business Plan)**

If you have access to custom CSS:

```css
/* Gradient buttons like your landing page */
.primary-button {
  background: linear-gradient(to right, #06b6d4, #2563eb);
  border: none;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.primary-button:hover {
  background: linear-gradient(to right, #0891b2, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Card shadow */
.auth-card {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

---

### 10. **Favicon**

**Upload Favicon:**
- **Settings → Design → Favicon**
- Upload a 32x32px or 64x64px PNG icon
- Use the cyan-blue cloud icon

---

## 🖼️ Logo Creation Guide

Since you don't have a logo yet, here's what I recommend:

**Option 1: Simple Icon + Text**
- Use the cloud icon (from lucide-react)
- Add "Zezamii" text next to it
- Colors: Cyan to Blue gradient
- Font: Clean sans-serif (Inter, Poppins, or similar)

**Option 2: Icon Only**
- Just the cloud icon
- Cyan-blue gradient fill
- Rounded square background

**Where to Create:**
- Use Figma (free)
- Or use Canva (free)
- Or hire a designer on Fiverr ($5-20)

---

## ✅ Checklist

Before you finish:

- [ ] Logo uploaded (light and dark versions)
- [ ] Primary color set to `#06b6d4`
- [ ] Button radius set to `8px`
- [ ] Custom text updated (Welcome Back, etc.)
- [ ] Favicon uploaded
- [ ] Google social login enabled
- [ ] Test login flow at your app

---

## 🔗 Useful Links

- **Kinde Design Settings**: https://app.kinde.com/ → Settings → Design
- **Color Reference**: https://tailwindcss.com/docs/customizing-colors
- **Lucide Icons**: https://lucide.dev/ (for cloud icon inspiration)

---

## 📸 What It Should Look Like

After customization, your Kinde page should have:

✅ Your logo at the top
✅ Cyan/blue buttons (matching your landing page)
✅ "Welcome Back" heading
✅ Google login button (if enabled)
✅ Email/password form
✅ Clean, modern design

---

## 🚀 Next Steps

1. Follow this guide to customize Kinde
2. Test login at: http://localhost:3000
3. Check both email and Google login work
4. Share a screenshot if you want feedback!

---

**Questions?** Let me know if you need help with any step!
