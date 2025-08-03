const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// Validate reservation before saving
exports.validateReservation = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { machineId, date, startTime, endTime } = data;

  try {
    // Check for time conflicts
    const conflictingReservations = await db.collection("reservations")
      .where("machineId", "==", machineId)
      .where("date", "==", date)
      .get();

    const hasConflict = conflictingReservations.docs.some((doc) => {
      const reservation = doc.data();
      return (
        (startTime >= reservation.startTime && startTime < reservation.endTime) ||
                (endTime > reservation.startTime && endTime <= reservation.endTime) ||
                (startTime <= reservation.startTime && endTime >= reservation.endTime)
      );
    });

    if (hasConflict) {
      throw new functions.https.HttpsError("already-exists", "Time slot conflicts with existing reservation");
    }

    return { valid: true };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Create reservation with server-side validation
exports.createReservation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { machineId, date, startTime, endTime, studentName } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  try {
    // Validate email domain
    const allowedDomains = ["peralta.edu", "gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
    const emailDomain = userEmail.split("@")[1];

    if (!allowedDomains.includes(emailDomain)) {
      throw new functions.https.HttpsError("permission-denied", "Email domain not allowed");
    }

    // Check for conflicts
    const conflictingReservations = await db.collection("reservations")
      .where("machineId", "==", machineId)
      .where("date", "==", date)
      .get();

    const hasConflict = conflictingReservations.docs.some((doc) => {
      const reservation = doc.data();
      return (
        (startTime >= reservation.startTime && startTime < reservation.endTime) ||
                (endTime > reservation.startTime && endTime <= reservation.endTime) ||
                (startTime <= reservation.startTime && endTime >= reservation.endTime)
      );
    });

    if (hasConflict) {
      throw new functions.https.HttpsError("already-exists", "Time slot conflicts with existing reservation");
    }

    // Create reservation
    const reservation = {
      userId: userId,
      userEmail: userEmail,
      studentName: studentName,
      machineId: machineId,
      date: date,
      startTime: startTime,
      endTime: endTime,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "confirmed",
    };

    const docRef = await db.collection("reservations").add(reservation);

    // Log audit event
    await db.collection("audit").add({
      userId: userId,
      userEmail: userEmail,
      action: "create_reservation",
      reservationId: docRef.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      reservationId: docRef.id,
      message: "Reservation created successfully",
    };

  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Delete reservation (only owner or admin)
exports.deleteReservation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { reservationId } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;

  try {
    const reservationDoc = await db.collection("reservations").doc(reservationId).get();

    if (!reservationDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Reservation not found");
    }

    const reservation = reservationDoc.data();
    const isAdmin = ["admin@peralta.edu", "vince@peralta.edu"].includes(userEmail);

    // Check if user owns the reservation or is admin
    if (reservation.userId !== userId && !isAdmin) {
      throw new functions.https.HttpsError("permission-denied", "Not authorized to delete this reservation");
    }

    await db.collection("reservations").doc(reservationId).delete();

    // Log audit event
    await db.collection("audit").add({
      userId: userId,
      userEmail: userEmail,
      action: "delete_reservation",
      reservationId: reservationId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "Reservation deleted successfully",
    };

  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});
