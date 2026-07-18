const fs = require('fs');

let content = fs.readFileSync('src/firebase/firestore.ts', 'utf8');

if (!content.includes('writeBatch')) {
  content = content.replace(
    'enableIndexedDbPersistence\n} from "firebase/firestore";',
    'enableIndexedDbPersistence,\n  writeBatch,\n  runTransaction,\n  onSnapshot,\n  getDocsFromCache,\n  getDocFromCache,\n  getDocsFromServer\n} from "firebase/firestore";'
  );
}

// Add generic Batch and Transaction
if (!content.includes('executeBatch')) {
  const batchAndTransaction = `
export async function executeBatch(operations: (batch: ReturnType<typeof writeBatch>, db: ReturnType<typeof getFirestore>) => void): Promise<void> {
  if (!firestore) return;
  const batch = writeBatch(firestore);
  operations(batch, firestore);
  await batch.commit();
}

export async function executeTransaction<T>(operation: (transaction: any, db: ReturnType<typeof getFirestore>) => Promise<T>): Promise<T | null> {
  if (!firestore) return null;
  return await runTransaction(firestore, (transaction) => operation(transaction, firestore));
}
`;
  content = content.replace('export const firestoreServices = {', batchAndTransaction + '\nexport const firestoreServices = {');
}

// Update firestoreServices to include subscribe methods
// I'll replace the generic list to support subscribe

fs.writeFileSync('src/firebase/firestore.ts', content);
