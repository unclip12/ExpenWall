# 🔥 Firestore Setup Instructions

## One-Time Setup Required

You need to deploy the Firestore security rules **once manually**. After that, GitHub Actions will handle all app deployments automatically.

## Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```bash
firebase login
```

## Step 3: Deploy Firestore Rules

Run this command in your project directory:

```bash
firebase deploy --only firestore:rules
```

You should see:
```
✔  Deploy complete!
```

## Step 4: Verify Rules are Deployed

Go to [Firebase Console](https://console.firebase.google.com/) → Your Project → Firestore Database → Rules tab

You should see rules for these collections:
- ✅ transactions
- ✅ **cravings** (NEW!)
- ✅ products
- ✅ priceHistory
- ✅ budgets
- ✅ buyingList
- ✅ wallets
- ✅ merchantRules
- ✅ recurringTransactions
- ✅ userProfiles

## Step 5: Test Cravings Feature

Now try logging a craving in your app:
1. Go to Cravings page
2. Click "+ Log Craving"
3. Add item (e.g., Chicken Biryani, ₹181)
4. Click "Log Craving"
5. Should work! 🎉

---

## Why Manual Deployment?

The GitHub Actions service account doesn't have the required IAM permissions to deploy Firestore rules automatically. This is a Firebase limitation for security reasons.

**Good news:** You only need to do this **once**. After that:
- App deployments are automatic
- Code changes deploy automatically
- Only rules changes need manual deployment (rare)

---

## Troubleshooting

### Error: "Permission denied"

Make sure you're logged into the correct Firebase account:
```bash
firebase logout
firebase login
```

### Error: "No project active"

Make sure `.firebaserc` exists with your project ID, or run:
```bash
firebase use --add
```

Then select your project.

### Still Getting Permission Errors in App?

1. Check Firebase Console → Firestore → Rules
2. Make sure the rules were deployed (check timestamp)
3. Wait 1-2 minutes for rules to propagate
4. Clear browser cache and reload

---

## Summary

**One command to fix everything:**

```bash
firebase deploy --only firestore:rules
```

Then your Cravings feature will work perfectly! 🚀✨