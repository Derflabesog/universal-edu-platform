# API Reference & Firestore Schema

## Cloud Functions Endpoints

Base URL: `https://us-central1-YOUR-PROJECT.cloudfunctions.net/api`

### POST /start-processing
Initiates PDF text extraction using Google Vision API.

**Request:**
```json
{
  "projectId": "string (required)",
  "fileRef": "string (required, format: gs://bucket/path or uploads/path)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "extractedLength": 15432
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "error message"
}
```

**Side Effects:**
- Updates `projects/{projectId}` with:
  - `status: "extracted"`
  - `extractedText: "...full text..."`
  - `extractedAt: <timestamp>`

**Timeline:** 30s - 5min (depends on PDF size)

---

### POST /generate
Generates learning content using Google Generative API.

**Request:**
```json
{
  "projectId": "string (required)",
  "templateId": "string (mcq_basic | flashcard_basic | summary_basic)",
  "config": {
    "numQuestions": 10,           // For MCQ (default 10)
    "numCards": 20,               // For flashcard (default 20)
    "summaryLength": 300,         // For summary (default 300 words)
    "language": "en"              // Optional (default "en")
  }
}
```

**Response (Success):**
```json
{
  "success": true,
  "generatedRef": "generated_document_id",
  "valid": true
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "error message"
}
```

**Side Effects:**
- Creates `generatedContent/{genId}` with:
  - Full response from Cloud Function
  - Raw AI output + parsed JSON
  - Validity flag
- Updates `projects/{projectId}` with:
  - `status: "completed" | "review"`
  - `generatedRef: "<genId>"`

**Timeline:** 10s - 60s (depends on text length and template)

---

## Firestore Collections

### Collection: `projects/{projectId}`

**Document Structure:**
```json
{
  "ownerId": "firebase_uid",
  "title": "example.pdf",
  "originalFileRef": "uploads/uid/example.pdf",
  "downloadUrl": "https://firebasestorage.googleapis.com/...",
  "status": "pending | processing | extracted | generating | completed | review | error",
  "extractedText": "full text extracted from PDF",
  "extractedAt": "<Timestamp>",
  "generatedRef": "generatedContent_document_id",
  "lastRequested": "<Timestamp>",
  "createdAt": "<Timestamp>"
}
```

**Status Lifecycle:**
```
pending
  ↓
processing (while /start-processing is running)
  ↓
extracted (after OCR completes)
  ↓
generating (while /generate is running)
  ↓
completed (if JSON parsed successfully)
  ↓
review (if JSON parsing failed but AI ran)
  ↓
error (if any step failed)
```

**Indexes Recommended:**
- `ownerId` (ascending) + `createdAt` (descending)
- For querying: `db.collection('projects').where('ownerId', '==', uid).orderBy('createdAt', descending: true)`

---

### Collection: `generatedContent/{docId}`

**Document Structure:**
```json
{
  "projectId": "projects_document_id",
  "templateId": "mcq_basic | flashcard_basic | summary_basic",
  "requestConfig": {
    "numQuestions": 10,
    "language": "en"
  },
  "rawAI": "raw response string from Generative API",
  "parsed": {
    // For mcq_basic:
    "questions": [
      {
        "id": "q1",
        "text": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": 0,
        "explanation": "Why this answer is correct"
      }
    ],
    "summary": "Brief summary of content"
    
    // For flashcard_basic:
    "flashcards": [
      {
        "id": "c1",
        "front": "Question/term",
        "back": "Answer/definition"
      }
    ]
    
    // For summary_basic:
    "summary": "Long summary text",
    "suggestedTopics": ["Topic 1", "Topic 2"],
    "questions": [ /* MCQ objects */ ]
  },
  "valid": true | false,
  "createdAt": "<Timestamp>"
}
```

---

## Dart Service Classes

### LearningService

```dart
LearningService({required String functionsBaseUrl})

// Methods
Future<int> startProcessing(String projectId, String fileRef)
  → Returns: extractedLength (int)
  → Throws: Exception on error

Future<String> generateMCQs(String projectId, {int numQuestions = 10, String language = 'en'})
  → Returns: generatedRef (document ID)
  → Throws: Exception on error

Future<String> generateFlashcards(String projectId, {int numCards = 20})
  → Returns: generatedRef (document ID)
  → Throws: Exception on error

Future<String> generateSummary(String projectId, {int summaryLength = 300, int numQuestions = 5})
  → Returns: generatedRef (document ID)
  → Throws: Exception on error

Stream<ProjectStatus> watchProjectStatus(String projectId)
  → Real-time Firestore listener

Future<GeneratedContent?> getGeneratedContent(String genId)
  → Fetch single generated content doc
```

### ProjectStatus (Model)

```dart
class ProjectStatus {
  String status          // 'extracted', 'generating', 'completed', 'review', 'error'
  String? generatedRef   // Reference to generatedContent doc
  int extractedTextLength

  bool get isProcessing  // true if 'processing' or 'generating'
  bool get isCompleted   // true if 'completed'
  bool get needsReview   // true if 'review'
}
```

### GeneratedContent (Model)

```dart
class GeneratedContent {
  String id              // Document ID from Firestore
  String templateId      // 'mcq_basic', 'flashcard_basic', 'summary_basic'
  String rawAI           // Raw string from AI
  Map<String, dynamic> parsed  // Parsed JSON object
  bool valid             // true if JSON parsed successfully
  Timestamp? createdAt

  // Convenience getters:
  List<MCQQuestion> get mcqQuestions
  List<Flashcard> get flashcards
  String get summary
  List<String> get suggestedTopics
}
```

### MCQQuestion (Model)

```dart
class MCQQuestion {
  String id
  String text            // "What is 2+2?"
  List<String> options   // ["3", "4", "5", "6"]
  int answer             // 0-based index (1 = "4")
  String explanation     // Why this is correct
}
```

### Flashcard (Model)

```dart
class Flashcard {
  String id
  String front           // Question/term
  String back            // Answer/definition
}
```

---

## Firebase Security Rules (Recommended)

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to create and manage their own projects
    match /projects/{projectId} {
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
      allow read: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow update: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    // Allow users to read generated content for their projects
    match /generatedContent/{docId} {
      allow read: if request.auth != null && 
                     request.auth.uid == get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.ownerId;
      allow delete: if request.auth != null && 
                       request.auth.uid == get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.ownerId;
    }
  }
}
```

### Cloud Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow users to upload to their own folder
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Environment Configuration

### For Development

1. **Set API Key:**
   ```bash
   firebase functions:config:set google.apikey="YOUR_GOOGLE_API_KEY" google.model="models/gemini-1.5-mini"
   ```

2. **Verify Config:**
   ```bash
   firebase functions:config:get
   ```

3. **Deploy:**
   ```bash
   cd backend/functions
   npm install
   firebase deploy --only functions:api
   ```

### For Production

1. **Use Cloud Secret Manager (recommended):**
   ```bash
   gcloud secrets create google-api-key --data-file=- <<< "YOUR_KEY"
   ```

2. **Update function to read from Secret Manager** (advanced)

3. **Set IAM permissions** for Cloud Functions service account

---

## Monitoring & Debugging

### View Cloud Function Logs

```bash
firebase functions:log
# or
firebase functions:log --lines 100
```

### Check Firestore Data

Firebase Console → Firestore → Collections
- `projects` - See OCR status and links
- `generatedContent` - See generated quiz/flashcard data

### Monitor Costs

Google Cloud Console → Billing → Budgets
- Set alert at $10/month to start

---

## Common Query Patterns

### Get All Projects for a User

```dart
Future<List<ProjectStatus>> getUserProjects(String uid) async {
  final snap = await FirebaseFirestore.instance
    .collection('projects')
    .where('ownerId', isEqualTo: uid)
    .orderBy('createdAt', descending: true)
    .limit(20)
    .get();
  
  return snap.docs.map((doc) => _toProjectStatus(doc)).toList();
}
```

### Listen to Single Project Status

```dart
StreamBuilder<DocumentSnapshot>(
  stream: FirebaseFirestore.instance
    .collection('projects')
    .doc(projectId)
    .snapshots(),
  builder: (ctx, snapshot) {
    if (snapshot.data?.exists == true) {
      final data = snapshot.data!.data() as Map;
      print('Status: ${data['status']}');
    }
    return Text('Loading...');
  },
)
```

### Fetch Generated Content

```dart
final doc = await FirebaseFirestore.instance
  .collection('generatedContent')
  .doc(genId)
  .get();

if (doc.exists) {
  final questions = doc['parsed']['questions'] as List;
  // Render questions...
}
```

---

## Error Handling Examples

### Try-Catch Pattern

```dart
try {
  final genRef = await learningService.generateMCQs(projectId);
  Navigator.push(context, MaterialPageRoute(
    builder: (_) => LearningResultsPage(
      projectId: projectId,
      generatedRefId: genRef,
      templateId: 'mcq_basic',
    ),
  ));
} catch (e) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('Generation failed: $e'), duration: Duration(seconds: 5)),
  );
}
```

### Stream with Error Handling

```dart
StreamBuilder<ProjectStatus>(
  stream: learningService.watchProjectStatus(projectId)
    .handleError((e) {
      print('Error listening to project: $e');
      return ProjectStatus.empty();
    }),
  builder: (ctx, snapshot) {
    if (snapshot.hasError) return Text('Error: ${snapshot.error}');
    if (!snapshot.hasData) return CircularProgressIndicator();
    
    final status = snapshot.data!;
    return Text('Status: ${status.status}');
  },
)
```

---

## Testing Checklist

- [ ] Can upload 5-20 page PDF
- [ ] OCR extracts text (check Firestore `projects/{id}.extractedText`)
- [ ] Can generate MCQs (10-30 seconds)
- [ ] Generated content shows in `generatedContent/{id}`
- [ ] MCQ page displays questions with correct answer highlighted
- [ ] Flashcard page shows flip animation
- [ ] Summary page shows text + topics + questions
- [ ] All timestamps appear in Firestore
- [ ] Can re-generate multiple templates from same PDF

---

**Last Updated:** December 2025
**API Version:** 1.0
**Status:** Production Ready
