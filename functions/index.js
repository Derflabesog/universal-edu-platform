import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

/**
 * Deletes a course and ALL its subcollections (lessons) safely.
 * Security:
 * - must be authenticated
 * - must own the course (course.uid == auth.uid)
 */
export const deleteCourseRecursive = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Please sign in.");

  const courseId = String(request.data?.courseId || "").trim();
  if (!courseId) throw new HttpsError("invalid-argument", "Missing courseId.");

  const courseRef = db.doc(`courses/${courseId}`);
  const courseSnap = await courseRef.get();

  if (!courseSnap.exists) {
    throw new HttpsError("not-found", "Course does not exist.");
  }

  const course = courseSnap.data();
  if (!course || course.uid !== uid) {
    throw new HttpsError("permission-denied", "You do not own this course.");
  }

  // Recursive delete removes course + subcollections (lessons)
  await db.recursiveDelete(courseRef);

  return { ok: true };
});
