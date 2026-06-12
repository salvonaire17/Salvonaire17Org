import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, push } from 'firebase/database';
import { storage, rtdb } from './firebase';

export interface Resource {
    id: string;
    downloadUrl: string;
    fileName: string;
    fileType?: string;
    moduleCode?: string;
    uploadedBy: string;
    timestamp: number;
}

export const uploadResource = async (
    courseId: string,
    moduleCode: string,
    file: File,
    userId: string
): Promise<string> => {
    // 1. Upload to Storage
    const path = `resources/${courseId}/${moduleCode}/${file.name}`;
    const sRef = storageRef(storage, path);
    await uploadBytes(sRef, file);
    const downloadUrl = await getDownloadURL(sRef);

    // 2. Save metadata to Realtime Database
    const resourcesRef = dbRef(rtdb, `resources/${moduleCode}`);
    await push(resourcesRef, {
        downloadUrl,
        fileName: file.name,
        uploadedBy: userId,
        timestamp: Date.now()
    });

    return downloadUrl;
};
