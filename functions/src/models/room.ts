import {getFirestore} from "firebase-admin/firestore";
import {generateRoomId} from "./utils";

export interface Room {
    adminPassword: string;
    characters: string[]; // Assuming an array of character names
    createdAt: number; // Assuming a Firebase Timestamp
    playerCount: number;
    players?: {[key: string]: string};
    status?: string;
    updatedAt: number; // Assuming a Firebase Timestamp
}

export interface RequestRoom {
    adminPassword: string;
    characters: string[];
    playerCount: number;
}

export interface CreateResult {
    success: boolean;
    roomId?: string;
    error?: Error;
}

export const create = async (requestRoom: RequestRoom):
  Promise<CreateResult | null> => {
  const db = getFirestore();
  const roomData: Omit<Room, "id"> = {
    adminPassword: requestRoom.adminPassword,
    characters: requestRoom.characters,
    playerCount: requestRoom.playerCount,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: "waiting",
  };
  const roomId: string = generateRoomId();

  try {
    const roomRef = await db.collection("rooms").doc(roomId);
    await roomRef.set(roomData);
    return {success: true, roomId};
  } catch (error) {
    throw error;
  }
};
