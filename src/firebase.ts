import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: true,
      tenantId: null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by the Firebase integration skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is disconnected.');
      return false;
    }
    // A permission-denied or not-found on 'test/connection' means backend was reached
    return true;
  }
}

export interface LeaderboardRecord {
  id?: string;
  playerName: string;
  score: number;
  highestTile: number;
  movesCount: number;
  devicePlatform: string;
  themeUsed: string;
  createdAt?: any;
}

const LEADERBOARD_PATH = 'leaderboard';

export async function submitScoreToFirebase(record: Omit<LeaderboardRecord, 'id' | 'createdAt'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, LEADERBOARD_PATH), {
      ...record,
      score: Math.floor(record.score),
      highestTile: Math.floor(record.highestTile),
      movesCount: Math.floor(record.movesCount),
      playerName: record.playerName.trim().slice(0, 30) || 'Android Player',
      devicePlatform: (record.devicePlatform || 'Android Compose').slice(0, 30),
      themeUsed: (record.themeUsed || 'Material You').slice(0, 40),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, LEADERBOARD_PATH);
  }
}

export function subscribeToLeaderboard(
  onData: (records: LeaderboardRecord[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    collection(db, LEADERBOARD_PATH),
    orderBy('score', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const records: LeaderboardRecord[] = [];
      snapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        records.push({
          id: docSnapshot.id,
          playerName: data.playerName || 'Anonymous',
          score: data.score || 0,
          highestTile: data.highestTile || 2,
          movesCount: data.movesCount || 0,
          devicePlatform: data.devicePlatform || 'Android',
          themeUsed: data.themeUsed || 'Default',
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
        });
      });
      onData(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, LEADERBOARD_PATH);
      } catch (e) {
        if (onError && e instanceof Error) {
          onError(e);
        }
      }
    }
  );
}

export async function fetchTopLeaderboard(): Promise<LeaderboardRecord[]> {
  try {
    const q = query(
      collection(db, LEADERBOARD_PATH),
      orderBy('score', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    const records: LeaderboardRecord[] = [];
    snapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      records.push({
        id: docSnapshot.id,
        playerName: data.playerName || 'Anonymous',
        score: data.score || 0,
        highestTile: data.highestTile || 2,
        movesCount: data.movesCount || 0,
        devicePlatform: data.devicePlatform || 'Android',
        themeUsed: data.themeUsed || 'Default',
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
      });
    });
    return records;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, LEADERBOARD_PATH);
  }
}
