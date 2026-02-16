# FlutterFlow Build Instructions (high-level)

1. Create a FlutterFlow project and connect it to your Firebase project (use the same Firebase project you will deploy functions to).
2. Create these Firestore collections:
   - users
   - projects
   - templates
   - generatedContent
3. Build these screens:
   - Authentication (Sign In / Register)
   - Dashboard (projects grid)
   - Upload Document (File Upload widget to Firebase Storage)
   - Template Gallery (read templates from `templates` collection)
   - Template Config (form)
   - Generation Progress (listen to projects/{projectId}.status)
   - Preview & Edit (display generatedContent)
4. Configure File Upload widget to store files in Firebase Storage.
5. Add HTTP Requests in FlutterFlow:
   - POST to Cloud Function endpoint: `/start-processing`
     Body: { projectId, fileRef }
   - POST to Cloud Function endpoint: `/generate`
     Body: { projectId, templateId, config }
6. Use FlutterFlow realtime bindings to show progress (projects/{projectId})
7. For export (PDF/PPT), use an export Cloud Function (not included in this skeleton) or client-side conversion.
8. Test with small text files first, then PDFs. For scanned PDFs, enable OCR in the processing step.
