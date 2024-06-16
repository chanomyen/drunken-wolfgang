import {getFirestore} from "firebase-admin/firestore";
import {generateRoomId} from "./utils";

export interface Player {
    name: string;
    character: string;
}
export interface Room {
    adminPassword: string;
    characters: string[]; // Assuming an array of character names
    createdAt: number; // Assuming a Firebase Timestamp
    playerCount: number;
    players: Player[];
    status: string;
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

export interface RequestRoomInfo {
    roomId: string;
    adminPassword: string;
}

export interface RequestJoin {
    roomId: string;
    playerName: string;
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
    players: []
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

export const get = async (roomId: string, adminPassword: string):
  Promise<Room | null> => {
  const db = getFirestore();
  const roomRef = db.collection("rooms").doc(roomId);
  const roomDoc = await roomRef.get();
  const room = roomDoc.data() as Room;
  if (room.adminPassword !== adminPassword) {
    throw new Error("Invalid admin password");
  }
  return room;
};

export const join = async (requestJoin: RequestJoin) => {
  const db = getFirestore();
  const roomRef = db.collection("rooms").doc(requestJoin.roomId);
  const roomDoc = await roomRef.get();
  const { playerCount, players } = roomDoc.data() as Room;
  if (playerCount === players.length) {
    throw new Error("Room is full");
  }
  
  // check duplication player name
  if (players.some((player) => player.name === requestJoin.playerName)) {
    throw new Error("Duplicate player name");
  }
  
  const newPlayer: Player = {name: requestJoin.playerName, character: ""};
  await players.push(newPlayer);

  const remainingPlayer: number = playerCount - players.length;
  if (remainingPlayer === 0) {
    await roomRef.update({players, status: "ready", updatedAt: Date.now()});
  } else {
    await roomRef.update({players, updatedAt: Date.now()});
  }

  return remainingPlayer;
};

export const assignCharacter = async (roomId: string, adminPassword: string):
  Promise<Room | null> => {
  const db = getFirestore();
  const roomRef = db.collection("rooms").doc(roomId);
  const roomDoc = await roomRef.get();
  const room: Room = roomDoc.data() as Room;

  if (room.adminPassword !== adminPassword) {
    throw new Error("Invalid admin password");
  }

  if (room.players.length !== room.playerCount) {
    throw Error("Room is not full")
  }

  if (room.status !== "ready") {
    throw Error("Room is not ready")
  }
  // get used charactors
  // const assignedCharactors: string[] = [];

  const quota = characterCondition(room.characters);
  
  // random character
  room.players = await Promise.all(room.players.map(async (player) => {
    let randomCharacter;
    do {
      randomCharacter = room.characters[Math.floor(Math.random() * room.characters.length)];
    } while (quota[randomCharacter] <= 0);
  
    quota[randomCharacter]--;
    player.character = randomCharacter;
    return player;
  }));
  
  room.updatedAt = Date.now();
  room.status = "started";
  roomRef.update({players: room.players, status: room.status, updatedAt: Date.now()});
  return room;
};

const characterCondition = (characters: string[]): { [key: string]: number } => {
  const characterCount: { [key: string]: number } = {};

  characters.forEach((character) => {
    if (characterCount[character]) {
      characterCount[character]++;
    } else {
      characterCount[character] = 1;
    }
  });

  return characterCount;
}

// const isValidCharacter = async (
//   newCharacter: string, existingCharacters: string[], condition: string[]) => {

//   if (!existingCharacters.includes(newCharacter)) {
//     return true;
//   }
  
//   return false;
//  }