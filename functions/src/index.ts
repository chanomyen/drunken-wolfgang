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
import * as RoomModel from "./models/room";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

initializeApp();
setGlobalOptions({
  region: "asia-southeast1",
});

exports.createRoom = onRequest(async (request, response) => {
  const requestRoom: RoomModel.RequestRoom = request.body;
  try {
    const roomData = await RoomModel.create(requestRoom);
    response.status(200).json(roomData);
  } catch (error) {
    logger.error("Error creating room ", error);
    response.status(500).send(error);
  }
});

exports.getRoom = onRequest(async (request, response) => {
  const roomId: string = request.query.roomId as string;
  const adminPassword: string = request.query.adminPassword as string;
  try {
    const room = await RoomModel.get(roomId, adminPassword);
    response.status(200).json(room);
  } catch (error) {
    logger.error("Error getting room ", error);
    response.status(500).send(error);
  }
});

exports.joinRoom = onRequest(async (request, response) => {
  const requestJoin: RoomModel.RequestJoin = request.body;
  try {
    const remainingPlayer = await RoomModel.join(requestJoin);
    response.status(200).json({remainingPlayer});
  } catch (error) {
    response.status(500).send(error);
    logger.error("Error joining room ", error);
  }
});

exports.start = onRequest(async (request, response) => {
  const roomId: string = request.query.roomId as string;
  const adminPassword: string = request.query.adminPassword as string;
  try {
    const room = await RoomModel.assignCharacter(roomId, adminPassword);
    response.status(200).json(room);
  } catch (error) {
    logger.error("Error starting room ", error);
    response.status(500).send(error);
  }
});

exports.getCharacter = onRequest(async (request, response) => {
  const roomId: string = request.query.roomId as string;
  const playerName: string = request.query.playerName as string;
  try {
    const character = await RoomModel.getCharacter(roomId, playerName);
    response.status(200).json(character);
  } catch (error) {
    logger.error("Error getting character", error);
    response.status(500).send(error);
  }
});

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
