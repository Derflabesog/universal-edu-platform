# Universal Learning Platform - Starter Project (MVP)

This starter package helps you build the Universal Learning Platform MVP using:
- FlutterFlow (frontend - visual builder)
- Firebase (Auth, Firestore, Storage)
- Cloud Functions (Node.js) as secure AI gateway
- Google AI Studio / Gemini for AI generation + Vision OCR for scanned PDFs

What's included:
- backend/functions/: Cloud Functions skeleton (Node.js) with endpoints:
  - POST /start-processing  -> extract text using Vision OCR, create project
  - POST /generate         -> send extracted text + template config to AI and save JSON output
- prompts/: Prompt templates for MCQ, Flashcards, Summary
- firestore-schema.json : suggested collections and sample documents
- flutterflow-instructions.md : step-by-step actions to build UI in FlutterFlow
- assets/: placeholder base64 logo
- backend/README_API.md: API docs and endpoints

Important notes:
- Replace `GOOGLE_API_KEY` with your Google AI Studio key in Cloud Function environment.
- Enable Cloud Vision API and Generative AI API in Google Cloud console.
- This starter is a functional skeleton. It requires customization and testing with real documents.
