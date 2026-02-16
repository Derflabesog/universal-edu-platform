# STEP 3: AI OCR + Learning Templates - Deployment Guide

## Overview

This guide walks you through deploying the Cloud Functions backend for OCR (text extraction) and AI-powered learning content generation (MCQs, flashcards, summaries).

**Architecture:**
1. User uploads PDF via Flutter app → Firebase Storage
2. App calls `/start-processing` Cloud Function → Google Vision OCR
3. Extracted text stored in Firestore (`projects/{projectId}`)
4. App calls `/generate` with template ID (mcq_basic, flashcard_basic, summary_basic)
5. Cloud Function calls Google Generative API (Gemini) → JSON output
6. Results saved to `generatedContent/{docId}`
7. Flutter app displays results in real-time

---

## Prerequisites

Ensure you have:
- Google Cloud Project (with billing enabled)
- Firebase CLI installed: `npm install -g firebase-tools`
- Node.js 18+ installed
- Google API Key (from Google Cloud Console)

---

## Step 1: Enable Required APIs

In Google Cloud Console (https://console.cloud.google.com):

1. Go to **APIs & Services > Enabled APIs and services**
2. Click **+ Enable APIs and Services**
3. Search for and enable:
   - **Cloud Vision API** (for OCR)
   - **Generative Language API** (for Gemini/AI)
   - **Cloud Firestore API** (database)
   - **Cloud Functions API**
   - **Cloud Storage API**
   - **Cloud Logging API**

---

## Step 2: Create API Key

1. In Cloud Console, go to **APIs & Services > Credentials**
2. Click **+ Create Credentials > API Key**
3. Copy the key (you'll need it shortly)
4. (Optional) Restrict to Generative Language API and Vision API under **Application restrictions**

---

## Step 3: Configure Firebase Functions

Navigate to your functions directory:

```bash
cd backend/functions
```

Set your Google API Key in Firebase config:

```bash
firebase functions:config:set google.apikey="YOUR_GOOGLE_API_KEY_HERE" google.model="models/gemini-1.5-mini"
```

Verify the config was set:

```bash
firebase functions:config:get
```

You should see output like:
```json
{
  "google": {
    "apikey": "YOUR_KEY",
    "model": "models/gemini-1.5-mini"
  }
}
```

---

## Step 4: Install Dependencies

In the `backend/functions` directory:

```bash
npm install
```

This installs:
- `firebase-admin` (Firebase Admin SDK)
- `firebase-functions` (Cloud Functions runtime)
- `express` (HTTP routing)
- `@google-cloud/vision` (Vision OCR)
- `node-fetch` (HTTP client for Generative API)
- `ajv` (JSON schema validation)

---

## Step 5: Deploy Cloud Functions

From the functions directory:

```bash
firebase deploy --only functions:api
```

This will:
1. Build the function
2. Deploy to your Firebase project
3. Output the function URL like:
   ```
   Function URL: https://us-central1-YOUR-PROJECT.cloudfunctions.net/api
   ```

**Save this URL** — you'll use it in the Flutter app.

---

## Step 6: Update Flutter App with Functions URL

In `lib/pages/upload_page.dart`, update:

```dart
static const String functionsBaseUrl = 'https://us-central1-YOUR-PROJECT.cloudfunctions.net/api';
```

Replace `us-central1` with your region if different, and `YOUR-PROJECT` with your actual project ID.

Also update in `lib/pages/learning_results_page.dart`:

```dart
late final LearningService _learningService =
    LearningService(functionsBaseUrl: 'https://us-central1-YOUR-PROJECT.cloudfunctions.net/api');
```

---

## Step 7: Test the Flow

1. **Run your Flutter app:**
   ```bash
   flutter run -d chrome
   ```

2. **Upload a PDF:**
   - Go to the "Upload" tab
   - Select a PDF file
   - Wait for extraction (OCR can take 30-120 seconds for large documents)
   - You should see: "Text extraction complete (X characters)"

3. **Generate Content:**
   - Click "MCQ Questions", "Flashcards", or "Summary & Key Points"
   - Wait for AI generation (typically 10-30 seconds)
   - Results page opens with generated content

4. **Monitor Firestore:**
   - Go to Firebase Console > Firestore
   - Check `projects/{projectId}` for status updates
   - Check `generatedContent/{docId}` for results

5. **Monitor Logs:**
   ```bash
   firebase functions:log
   ```
   or in Firebase Console > Cloud Functions > function logs

---

## Firestore Collections Structure

After successful flows, you'll have:

### `projects/{projectId}`
```json
{
  "ownerId": "uid_of_user",
  "title": "example.pdf",
  "originalFileRef": "uploads/uid/example.pdf",
  "downloadUrl": "https://...",
  "status": "completed",
  "extractedText": "...(full text)...",
  "generatedRef": "generatedContent_doc_id",
  "extractedAt": <timestamp>,
  "createdAt": <timestamp>
}
```

### `generatedContent/{docId}`
```json
{
  "projectId": "project_doc_id",
  "templateId": "mcq_basic",
  "requestConfig": { "numQuestions": 10 },
  "rawAI": "...(raw AI output)...",
  "parsed": {
    "questions": [ { "id": "q1", "text": "...", ... } ],
    "summary": "..."
  },
  "valid": true,
  "createdAt": <timestamp>
}
```

---

## Troubleshooting

### "GOOGLE_API_KEY not set"
- Run: `firebase functions:config:set google.apikey="YOUR_KEY"`
- Redeploy: `firebase deploy --only functions:api`

### "Generative API error 403"
- Check API Key is correct and not revoked
- Ensure Generative Language API is enabled in Cloud Console
- Verify API key permissions (if you set Application restrictions, they must include Generative Language API)

### "Vision API not found"
- Go to Cloud Console > APIs & Services
- Search "Cloud Vision" and click Enable
- Wait 30-60 seconds for enablement to propagate

### "Cloud Functions error: permission denied"
- Ensure your Firebase project has Firestore and Cloud Storage enabled
- Check service account permissions in IAM
- Try re-deploying: `firebase deploy --only functions:api`

### "Timeout during OCR"
- Large PDFs (500+ pages) can exceed the 540-second timeout
- Split large documents and upload separately
- Consider increasing function timeout in `firebase.json` (advanced)

### "Generated JSON is invalid"
- The AI sometimes returns extra markdown or explanatory text
- The function tries to extract JSON from the response
- If still invalid, results show in "review" status with raw output
- Try re-generating with smaller page/question count

### "No Firebase project found"
- Run: `firebase init` and select your project
- Run: `firebase login` to authenticate

---

## Cost Estimates

**Google Generative API** (Gemini):
- Approximately $0.0001 per 1,000 tokens
- A typical PDF → 10 MCQs costs ~$0.01-$0.05

**Cloud Vision API (OCR):**
- $1.50 per 1,000 requests
- Average 30-page PDF = 1 request = ~$0.0015

**Firestore:**
- Reads: $0.06 per 100,000
- Writes: $0.18 per 100,000

**Cloud Functions:**
- Free tier: 2M invocations/month
- Compute: ~$0.000002667 per GB-second

**Estimate for 100 student uploads/month:**
- OCR: ~$0.15
- AI: ~$3-$5
- Firestore: <$0.01
- Functions: <$0.01
- **Total: ~$3.20/month**

---

## Security Best Practices

1. **Never expose API Key in client code**
   - All AI calls must go through Cloud Functions (already done)
   - API key is in backend config, not deployed to app

2. **Set Firestore Rules:**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /projects/{projectId} {
         allow create: if request.auth.uid == resource.data.ownerId;
         allow read, update: if request.auth.uid == resource.data.ownerId;
       }
       match /generatedContent/{docId} {
         allow read: if request.auth.uid == get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.ownerId;
       }
     }
   }
   ```

3. **Set Cloud Storage Rules:**
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /uploads/{userId}/{allPaths=**} {
         allow read, write: if request.auth.uid == userId;
       }
     }
   }
   ```

4. **Monitor function logs for errors:**
   ```bash
   firebase functions:log --lines 100
   ```

---

## Advanced: Scaling & Optimization

### Use Cloud Tasks for Long Processing
For documents >100 pages, use Cloud Tasks to queue OCR jobs and avoid timeouts.

### Cache Prompts in Firestore
Store prompt templates in `templates/{templateId}` and load at function startup instead of hardcoding.

### Implement Exponential Backoff
For production, add retry logic when calling Generative API in case of rate limits.

### Monitor Costs
Set up budget alerts in Google Cloud Console > Billing > Budgets.

---

## Next Steps

1. ✅ Deploy backend & update Flutter URLs
2. ✅ Test with a sample PDF
3. 🔄 Monitor Firestore for data (check collections in Firebase Console)
4. 🔄 Iterate on prompt templates in `backend/functions/prompts/`
5. 🔄 Implement user authentication pages (login/signup)
6. 🔄 Add payment system for premium features (higher quotas)

---

## Support & Resources

- **Firebase CLI Docs:** https://firebase.google.com/docs/cli
- **Cloud Functions:** https://firebase.google.com/docs/functions
- **Google Vision API:** https://cloud.google.com/vision/docs
- **Google Generative API:** https://ai.google.dev/tutorials/python_quickstart
- **Firestore Rules:** https://firebase.google.com/docs/firestore/security/start

---

**Last Updated:** December 2025
