# STEP 3: Quick Setup Checklist

## ✅ What's Been Created

### Cloud Functions Backend
- ✅ `backend/functions/index.js` - Main handler for `/start-processing` (OCR) and `/generate` (AI)
- ✅ `backend/functions/package.json` - Node.js dependencies
- ✅ `backend/functions/prompts/` - Prompt templates for MCQ, flashcards, summary

### Flutter Client Updates
- ✅ `lib/services/learning_service.dart` - HTTP client for Cloud Functions
- ✅ `lib/pages/upload_page.dart` - Updated with PDF upload + OCR integration
- ✅ `lib/pages/learning_results_page.dart` - Display MCQs, flashcards, summaries
- ✅ `pubspec.yaml` - Added `http: ^0.13.6` dependency

### Documentation
- ✅ `DEPLOYMENT.md` - Complete deployment guide
- ✅ `.env.example` - Configuration template

---

## 🚀 Deployment Steps (In Order)

### Phase 1: Google Cloud Setup (5 minutes)

1. **Open Google Cloud Console:** https://console.cloud.google.com
2. **Select your Firebase project**
3. **Enable APIs:**
   - [ ] Cloud Vision API
   - [ ] Generative Language API
   - [ ] Cloud Functions API
   - [ ] Cloud Firestore API
   - [ ] Cloud Storage API

4. **Create API Key:**
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "API Key"
   - Copy the key and save it
   - (Optional) Restrict to Generative Language + Vision APIs

### Phase 2: Firebase Functions Deploy (10 minutes)

5. **Navigate to functions directory:**
   ```bash
   cd backend/functions
   ```

6. **Install dependencies:**
   ```bash
   npm install
   ```

7. **Set API Key in Firebase config:**
   ```bash
   firebase functions:config:set google.apikey="YOUR_GOOGLE_API_KEY_HERE" google.model="models/gemini-1.5-mini"
   ```

8. **Verify config:**
   ```bash
   firebase functions:config:get
   ```

9. **Deploy Cloud Functions:**
   ```bash
   firebase deploy --only functions:api
   ```

10. **Copy the Functions URL from output:**
    - Look for: `Function URL: https://us-central1-YOUR-PROJECT.cloudfunctions.net/api`
    - Save this URL

### Phase 3: Flutter App Update (5 minutes)

11. **Update Firebase functions URL in TWO places:**
    
    **File: `lib/pages/upload_page.dart` (line ~29)**
    ```dart
    static const String functionsBaseUrl = 'https://us-central1-YOUR-PROJECT.cloudfunctions.net/api';
    ```

    **File: `lib/pages/learning_results_page.dart` (line ~25)**
    ```dart
    late final LearningService _learningService =
        LearningService(functionsBaseUrl: 'https://us-central1-YOUR-PROJECT.cloudfunctions.net/api');
    ```

12. **Update pubspec.yaml dependencies:**
    ```bash
    flutter pub get
    ```

### Phase 4: Testing (5 minutes)

13. **Run the Flutter app:**
    ```bash
    flutter run -d chrome
    ```

14. **Test the flow:**
    - [ ] Navigate to "Upload" tab
    - [ ] Select a small PDF file (5-20 pages for quick testing)
    - [ ] Wait for "Text extraction complete" message
    - [ ] Click "MCQ Questions"
    - [ ] Wait for results (may take 30-60 seconds)
    - [ ] Verify MCQ page displays with questions

15. **Monitor in Firebase Console:**
    - Go to https://console.firebase.google.com
    - Select your project
    - Go to Firestore > Collections
    - Look for `projects` and `generatedContent` collections

---

## 📋 Configuration Checklist

Required before each step:

### Before Deploying Functions
- [ ] Google Cloud Project created
- [ ] Firebase initialized in your project
- [ ] All required APIs enabled
- [ ] Google API Key created
- [ ] `firebase functions:config:set` executed with correct key

### Before Running Flutter App
- [ ] `flutter pub get` completed
- [ ] Functions base URL updated in both files
- [ ] Firebase project ID matches in google-services.json (automatic if you ran `flutterfire configure`)

### Before Testing
- [ ] Internet connection working
- [ ] Sample PDF file ready to test
- [ ] Chrome browser available
- [ ] Firebase Console tab open to monitor

---

## 🔍 Testing Progression

### Quick Test (PDF size: 5-10 pages)
**Expected time:** 3-5 minutes total
1. Upload PDF → Should extract in 30-60 seconds
2. Generate MCQs → Should return in 15-30 seconds
3. View results

### Medium Test (PDF size: 20-50 pages)
**Expected time:** 5-15 minutes total
1. Upload PDF → 1-3 minutes OCR
2. Generate all three templates (MCQ, flashcard, summary)
3. Verify each displays correctly

### Stress Test (PDF size: 100+ pages)
**Expected time:** 10-30 minutes
**Note:** May hit Cloud Functions timeout (540 seconds). Use for load estimation only.

---

## ⚠️ Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| "GOOGLE_API_KEY not set" | Run `firebase functions:config:set google.apikey="YOUR_KEY"` again |
| "Generative API error 403" | Check API key in Firebase config and verify Generative API is enabled |
| "Cloud Functions not found" | Verify URL is correct and matches `firebase deploy` output |
| "Vision OCR timeout" | Use smaller PDFs (<100 pages) for testing |
| "JSON parse error in results" | Natural LLM behavior; results show in "review" status with raw output |
| "No Firestore data appearing" | Check Firestore Rules aren't blocking writes (temporary debug: allow all) |

---

## 📊 Expected Outputs

After successful testing, you should see:

### In Firebase Console > Firestore > Collections > `projects`
```
Document: {projectId}
Fields:
  - title: "your-pdf.pdf"
  - status: "completed"
  - extractedText: "[full text from PDF]"
  - generatedRef: "genDoc123..."
  - extractedAt: <timestamp>
```

### In Firebase Console > Firestore > Collections > `generatedContent`
```
Document: {genRef}
Fields:
  - templateId: "mcq_basic" (or flashcard_basic, summary_basic)
  - parsed: {
      "questions": [...],
      "summary": "..."
    }
  - valid: true
  - createdAt: <timestamp>
```

---

## 🎯 Next Steps After Successful Deploy

1. **Optimize Prompts:**
   - Edit files in `backend/functions/prompts/`
   - Redeploy with `firebase deploy --only functions:api`

2. **Add Authentication:**
   - Create login/register pages
   - Connect to AuthService (already implemented)

3. **Set Firestore Security Rules:**
   - See DEPLOYMENT.md for recommended rules
   - Protect user data from public access

4. **Monitor Costs:**
   - Set up Budget Alerts in Google Cloud Billing
   - Expected: $3-10/month for 100 students

5. **Improve UX:**
   - Add progress indicators during OCR
   - Stream results as they become available
   - Show extracted text preview before generation

---

## 📱 Feature Checklist

- [x] PDF upload to Firebase Storage
- [x] OCR extraction via Cloud Vision
- [x] AI generation via Google Generative API
- [x] MCQ question generation
- [x] Flashcard generation
- [x] Summary generation
- [ ] User authentication (next phase)
- [ ] Payment/subscription system (next phase)
- [ ] PDF parsing & better formatting (future)
- [ ] Custom prompt templates (advanced)

---

## 📞 Support Resources

- **Firebase Docs:** https://firebase.google.com/docs
- **Google Vision API:** https://cloud.google.com/vision/docs
- **Generative API:** https://ai.google.dev
- **Flutter HTTP:** https://pub.dev/packages/http
- **Firestore:** https://firebase.google.com/docs/firestore

---

**Status:** Ready to Deploy ✅
**Estimated Setup Time:** 30 minutes
**Go to:** Read DEPLOYMENT.md for detailed instructions
