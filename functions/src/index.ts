/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {Timestamp, getFirestore} from "firebase-admin/firestore";
// import {firestore} from "firebase-admin";
import {generateRoomId} from "./utils";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp();
setGlobalOptions({
  region: "asia-southeast1",
});

interface Room {
  adminPassword: string;
  characters: string[]; // Assuming an array of character names
  createdAt: number; // Assuming a Firebase Timestamp
  playerCount: number;
  players?: { [key: string]: string};
  status?: string;
  updatedAt: number; // Assuming a Firebase Timestamp
}

interface CreateRoom {
  adminPassword: string;
  characters: string[];
  playerCount: number;
}

exports.createRoom = onRequest(async (request, response) => {
  const db = getFirestore();
  const requestRoom: CreateRoom = request.body;
  const roomData: Room = {
    adminPassword: requestRoom.adminPassword,
    characters: requestRoom.characters,
    playerCount: requestRoom.playerCount,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "waiting",
    players: {},
  };
  console.log(roomData);
  const roomId: string = generateRoomId();
  const roomRef = db.collection("rooms").doc(roomId);

  roomRef.set(roomData)
    .then(() => {
      response.status(200).json({success: true, roomId: roomId});
    })
    .catch((error) => {
      logger.error("Error creating room", error);
      response.status(500).json({success: false});
    });
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
