# 🚀 QUICK START - 30 Minutes to Working AI Learning Platform

> **You have a working Flutter MVP. This guide gets STEP 3 (AI OCR + Learning Content) live in 30 minutes.**

---

## ⏱️ Timeline

```
0-10 min   → Google Cloud Setup
10-20 min  → Deploy Cloud Functions
20-25 min  → Update Flutter App
25-30 min  → Test Everything
```

---

## Phase 1: Google Cloud Setup (10 minutes)

### 1.1 Open Google Cloud Console

```
🌐 https://console.cloud.google.com
```

### 1.2 Select Your Firebase Project

- Click the project dropdown at top
- Select your project (e.g., "universal-edu-app")

### 1.3 Enable Required APIs

Search and enable each one:

1. **Cloud Vision API**
   - Search: "Cloud Vision API"
   - Click "Enable"
   - Wait 30 seconds

2. **Generative Language API**
   - Search: "Generative Language API"
   - Click "Enable"
   - Wait 30 seconds

3. **Cloud Functions API** (usually already enabled)
   - Search: "Cloud Functions API"
   - Click "Enable" if needed

### 1.4 Create API Key

1. Go to: **APIs & Services > Credentials**
2. Click: **+ Create Credentials > API Key**
3. Copy the key immediately (it shows only once)
4. Click outside the popup to close it
5. **Save this key** — you'll need it in 2 minutes

Example: `AIzaSyD2HW...` (long alphanumeric string)

---

## Phase 2: Deploy Cloud Functions (10 minutes)

### 2.1 Open Terminal/PowerShell

```powershell
# Navigate to functions directory
cd "c:\Users\Polly\Desktop\New folder (3)\universal_edu_app\backend\functions"
```

### 2.2 Install npm Dependencies

```bash
npm install
```

⏳ Wait 2-3 minutes for installation to complete.

You should see:
```
added XX packages
```

### 2.3 Set API Key in Firebase Config

**PASTE YOUR GOOGLE API KEY FROM STEP 1.4:**

```bash
firebase functions:config:set google.apikey="AIzaSyD2HW..." google.model="models/gemini-1.5-mini"
```

Replace `AIzaSyD2HW...` with your actual key.

### 2.4 Verify Configuration

```bash
firebase functions:config:get
```

You should see:
```json
{
  "google": {
    "apikey": "AIzaSyD2HW...",
    "model": "models/gemini-1.5-mini"
  }
}
```

### 2.5 Deploy to Firebase

```bash
firebase deploy --only functions:api
```

⏳ Wait 2-3 minutes. You'll see output like:

```
✔ functions[api]: Successful create operation.
Function URL: https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/api
```

**SAVE THIS URL** (everything after `https://`)

Example: `https://us-central1-universal-edu-app.cloudfunctions.net/api`

---

## Phase 3: Update Flutter App (5 minutes)

### 3.1 Open `lib/pages/upload_page.dart`

- **Find line 29:** `static const String functionsBaseUrl = ...`
- **Replace the URL** with your URL from Phase 2.5

```dart
// BEFORE:
static const String functionsBaseUrl = 'https://YOUR-PROJECT.cloudfunctions.net/api';

// AFTER (example):
static const String functionsBaseUrl = 'https://us-central1-universal-edu-app.cloudfunctions.net/api';
```

### 3.2 Open `lib/pages/learning_results_page.dart`

- **Find line 25:** `late final LearningService _learningService = ...`
- **Replace the URL** in `functionsBaseUrl`

```dart
// BEFORE:
LearningService(functionsBaseUrl: 'https://YOUR-PROJECT.cloudfunctions.net/api');

// AFTER (same URL):
LearningService(functionsBaseUrl: 'https://us-central1-universal-edu-app.cloudfunctions.net/api');
```

### 3.3 Download Dependencies

```bash
flutter pub get
```

⏳ Wait 1 minute for dependencies to download.

---

## Phase 4: Test Everything (5 minutes)

### 4.1 Start Flutter App

```bash
flutter run -d chrome
```

⏳ Wait for Chrome to open. You should see your app running.

### 4.2 Upload a PDF

1. **Click the "Upload" tab** (at bottom)
2. **Click "Choose File"**
3. **Select a PDF** (use a short one: 5-10 pages for testing)
4. **Wait** for message: `"Text extraction complete (X characters)"`

⏳ This takes 30-60 seconds (OCR process).

### 4.3 Generate Learning Content

1. **Click one of these buttons:**
   - "MCQ Questions" (creates quiz)
   - "Flashcards" (creates study cards)
   - "Summary & Key Points" (creates summary)

2. **Wait** for results page to open (15-30 seconds)

3. **See the generated content!** 🎉
   - For MCQ: see questions with correct answers highlighted
   - For Flashcards: tap cards to flip them
   - For Summary: read text and see suggested topics

### 4.4 Verify in Firebase Console

1. **Open Firebase Console:** https://console.firebase.google.com
2. **Select your project**
3. **Go to Firestore > Collections**
4. **Check these appear:**
   - `projects` collection (with your PDFs)
   - `generatedContent` collection (with results)

✅ **If you see data in Firestore, you're live!**

---

## ✅ Success Checklist

- [ ] All 3 Google APIs enabled
- [ ] API Key created and copied
- [ ] Cloud Functions deployed (URL copied)
- [ ] Flutter URLs updated (2 places)
- [ ] `flutter pub get` completed
- [ ] Flutter app launches in Chrome
- [ ] Can select and upload PDF
- [ ] OCR completes with "extraction complete" message
- [ ] Can click "MCQ Questions" button
- [ ] Results page appears with generated questions
- [ ] Firestore console shows `projects` and `generatedContent` collections
- [ ] No red error messages in browser console

---

## 🎓 How It Works

```
1. You upload PDF
   ↓
2. Cloud Function receives PDF path
   ↓
3. Google Vision API reads PDF (OCR)
   ↓
4. Text saved to Firestore
   ↓
5. You click "Generate MCQs"
   ↓
6. Cloud Function reads text
   ↓
7. Google Gemini AI creates questions
   ↓
8. Results saved to Firestore
   ↓
9. Flutter app displays them beautifully
```

---

## ⚠️ Common Issues (Quick Fixes)

### Issue: "functions not found" (404 error)
**Fix:** Double-check your functions URL is correct in both files

### Issue: "Generative API error 403"
**Fix:** 
1. Verify API key is correct
2. Check Generative Language API is enabled in Cloud Console

### Issue: "pdf extraction taking too long"
**Fix:** Use a smaller PDF (5-10 pages) for testing first

### Issue: "App crashes when generating"
**Fix:** Check `firebase functions:log` for errors:
```bash
firebase functions:log
```

### Issue: "No data in Firestore"
**Fix:** 
1. Check if Firestore has security rules blocking writes
2. Temporarily allow all (debug): edit Firestore Rules to `allow read, write: if true;`
3. Try uploading again

---

## 🎯 What You Have Now

✅ **Backend:**
- Cloud Functions running OCR + AI
- Google Vision API extracting text
- Google Gemini generating learning content

✅ **Frontend:**
- Beautiful PDF upload page
- Automatic OCR after upload
- Three generation options
- Results page with MCQs, flashcards, summary
- Real-time Firestore data sync

✅ **Documentation:**
- 4 comprehensive guides (all in project)
- API reference
- Security best practices

---

## 📚 Next: Deeper Learning

If you want to understand more:

1. **For Overview:** Read `STEP3_SUMMARY.md`
2. **For Details:** Read `DEPLOYMENT.md`
3. **For API Docs:** Read `API_REFERENCE.md`
4. **For Troubleshooting:** See `SETUP_CHECKLIST.md`

---

## 🎯 Next Phase: User Authentication

The next step is:
1. Create Login/Register pages
2. Connect to Firebase Auth
3. Restrict uploads to authenticated users

But that's for STEP 4. For now, celebrate! 🎉

---

## 💬 Summary

You just:
1. ✅ Set up Google Cloud APIs (10 min)
2. ✅ Deployed a production Cloud Function (10 min)
3. ✅ Updated your Flutter app (5 min)
4. ✅ Tested with real PDF + AI (5 min)

**Total Time: 30 minutes**
**Working Features: 3 (MCQ, Flashcards, Summary)**
**Cost: ~$5/month for 100 students**

---

## 🎊 You're Live!

Your platform can now:
- 📄 Extract text from PDFs automatically
- 🧠 Generate MCQs with explanations
- 📇 Create flashcards for spaced repetition
- 📋 Summarize content with key topics
- 💾 Store everything in Firestore

**Ready for students!**

---

**Time Elapsed: ~30 minutes**
**Status: ✅ STEP 3 Complete & Live**
**Next: STEP 4 - User Authentication**

👉 **Questions?** Check the detailed guides in the project folder.
