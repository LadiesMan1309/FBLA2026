# Email Setup Guide for Immersive LFA

## Overview
This guide will help you set up email notifications for booking confirmations using EmailJS (100% free for educational use).

## Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click "Sign Up" (top right)
3. Create a free account with your email
4. Verify your email address

## Step 2: Add Email Service

1. After logging in, go to "Email Services" in the dashboard
2. Click "Add New Service"
3. Choose your email provider (Gmail is easiest):
   - Select "Gmail"
   - Click "Connect Account"
   - Sign in with your Gmail account
   - Allow EmailJS to send emails on your behalf
4. Give your service a name (e.g., "Immersive LFA Notifications")
5. Copy the **Service ID** (you'll need this later)

## Step 3: Create Email Template

1. Go to "Email Templates" in the dashboard
2. Click "Create New Template"
3. Use this template content:

### Template Subject:
```
Booking Confirmation - {{subject_name}} Session
```

### Template Body:
```
Hello {{to_name}},

Thank you for booking a private tutoring session with Immersive LFA!

Here are your session details:

📚 Subject: {{subject_name}}
📅 Date: {{booking_date}}
🕐 Time: {{booking_time}}
⏱️ Duration: {{booking_duration}}

📝 Your Notes:
{{booking_notes}}

We're excited to help you learn! A tutor will reach out to you at {{user_email}} to confirm the session shortly.

If you need to reschedule or have any questions, please reply to this email.

Best regards,
The Immersive LFA Team

---
This is an automated confirmation email.
```

4. In the "Settings" tab:
   - **From Name**: Immersive LFA
   - **From Email**: Use your Gmail address
   - **To Email**: {{to_email}}
5. Copy the **Template ID** (you'll need this)
6. Click "Save"

## Step 4: Get Your Public Key

1. Go to "Account" (click your profile in top right)
2. Find "API Keys" section
3. Copy your **Public Key**

## Step 5: Update Your Code

1. Open `main.html`
2. Find this line (around line 15):
   ```javascript
   publicKey: "YOUR_PUBLIC_KEY",
   ```
3. Replace `YOUR_PUBLIC_KEY` with your actual Public Key from Step 4

4. Open `script.js`
5. Find these lines (around line 564-566):
   ```javascript
   await emailjs.send(
       'YOUR_SERVICE_ID',     // Replace with your EmailJS service ID
       'YOUR_TEMPLATE_ID',    // Replace with your EmailJS template ID
   ```
6. Replace:
   - `YOUR_SERVICE_ID` with the Service ID from Step 2
   - `YOUR_TEMPLATE_ID` with the Template ID from Step 3

## Step 6: Test It!

1. Start your localhost server:
   ```bash
   cd "c:\Users\hcyar\Desktop\FBLA 2026"
   python -m http.server 8000
   ```

2. Open http://localhost:8000/main.html

3. Login with your account

4. Book a test session:
   - Click "Book a Private Session"
   - Fill out the form
   - Submit

5. Check your email inbox - you should receive a confirmation email!

## Free Tier Limits

EmailJS Free Account includes:
- ✅ 200 emails per month
- ✅ Unlimited email templates
- ✅ No credit card required
- ✅ Perfect for school projects and demos

## Troubleshooting

### Emails Not Sending?
1. Check browser console (F12) for errors
2. Verify all IDs are correctly copied (no extra spaces)
3. Make sure your Gmail account is connected in EmailJS dashboard
4. Check Gmail's spam folder

### "Invalid Public Key" Error?
- Make sure you copied the entire Public Key
- Check for extra spaces before/after the key

### Still Having Issues?
- Visit EmailJS documentation: https://www.emailjs.com/docs/
- Check that your Gmail allows "Less secure app access" (if using Gmail)

## Security Note

The Public Key is safe to include in your code - it's designed to be public. The Service ID and Template ID are also safe to expose. EmailJS handles all the security server-side.

## Next Steps

Once emails are working:
1. Customize the email template with your school branding
2. Add more template variables if needed
3. Consider creating separate templates for different types of notifications

---

**Need Help?** Contact EmailJS support or check their documentation at https://www.emailjs.com/docs/
