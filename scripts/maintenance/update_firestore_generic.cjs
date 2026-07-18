const fs = require('fs');

let content = fs.readFileSync('src/firebase/firestore.ts', 'utf8');

if (!content.includes('subscribeCollectionDocs')) {
  const genericSubscribe = `
export function subscribeCollectionDocs<T = DocumentData>(
  collectionName: string,
  onUpdate: (data: T[]) => void,
  onError?: (error: any) => void,
  ...queryConstraints: QueryConstraint[]
): () => void {
  if (!firestore) return () => {};
  const colRef = collection(firestore, collectionName);
  const q = query(colRef, ...queryConstraints);
  
  return onSnapshot(q, (snapshot) => {
    const items: T[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as T);
    });
    onUpdate(items);
  }, (error) => {
    console.error(\`Error subscribing to \${collectionName}:\`, error);
    if (onError) onError(error);
  });
}

export function subscribeDocData<T = DocumentData>(
  collectionName: string,
  docId: string,
  onUpdate: (data: T | null) => void,
  onError?: (error: any) => void
): () => void {
  if (!firestore) return () => {};
  const docRef = doc(firestore, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate({ id: docSnap.id, ...docSnap.data() } as T);
    } else {
      onUpdate(null);
    }
  }, (error) => {
    console.error(\`Error subscribing to \${collectionName}/\${docId}:\`, error);
    if (onError) onError(error);
  });
}
`;
  content = content.replace('export const firestoreServices = {', genericSubscribe + '\nexport const firestoreServices = {');
}

// Update the `firestoreServices` object to include `.subscribe` and `.subscribeDoc`
const servicesRegex = /list: \(\.\.\.constraints: QueryConstraint\[\]\) => queryCollectionDocs<([^>]+)>\("([^"]+)", \.\.\.constraints\)/g;
content = content.replace(servicesRegex, (match, type, collName) => {
  return "list: (...constraints: QueryConstraint[]) => queryCollectionDocs<" + type + '>("' + collName + '", ...constraints),\n    subscribe: (onUpdate: (data: ' + type + '[]) => void, ...constraints: QueryConstraint[]) => subscribeCollectionDocs<' + type + '>("' + collName + '", onUpdate, undefined, ...constraints),\n    subscribeDoc: (docId: string, onUpdate: (data: ' + type + ' | null) => void) => subscribeDocData<' + type + '>("' + collName + '", docId, onUpdate)';
});

fs.writeFileSync('src/firebase/firestore.ts', content);
