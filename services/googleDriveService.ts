import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add Google Drive scopes
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token caching
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize Auth State Listener
export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try to retrieve token or trigger sign-in state
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google (called from UI interaction)
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Google Auth');
    }

    cachedAccessToken = credential.accessToken;
    
    // Store the connected email in local storage for associating with the tutor
    localStorage.setItem('tutor_khuji_google_email', result.user.email || '');
    
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  localStorage.removeItem('tutor_khuji_google_email');
};

// ============================================================================
// Google Drive API Integration Helpers
// ============================================================================

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';

// Fetch helper with auth header
const driveFetch = async (url: string, options: RequestInit = {}): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token is not available. Please connect Google Drive first.');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Google Drive API error (${response.status}):`, errorText);
    throw new Error(`Google Drive API error: ${response.statusText || response.status}. Details: ${errorText}`);
  }

  // Handle 204 No Content for DELETE requests
  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
};

/**
 * Find or create a specific folder in Google Drive.
 * Defaults to "TutorKhuji_Materials"
 */
export const getOrCreateFolder = async (folderName: string = 'TutorKhuji_Materials'): Promise<string> => {
  try {
    // 1. Search for existing folder
    const searchUrl = `${DRIVE_API_BASE}/files?q=mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false&fields=files(id)`;
    const result = await driveFetch(searchUrl);
    
    if (result.files && result.files.length > 0) {
      return result.files[0].id;
    }

    // 2. Folder doesn't exist, create it
    const createUrl = `${DRIVE_API_BASE}/files`;
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    };

    const newFolder = await driveFetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(folderMetadata)
    });

    return newFolder.id;
  } catch (error) {
    console.error('Error finding/creating Google Drive folder:', error);
    throw error;
  }
};

/**
 * List files in the specific app folder.
 */
export const listFiles = async (folderId?: string): Promise<any[]> => {
  try {
    let q = 'trashed=false';
    if (folderId) {
      q += ` and '${folderId}' in parents`;
    }
    
    const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,webViewLink,webContentLink,size,iconLink)&orderBy=name`;
    const result = await driveFetch(url);
    return result.files || [];
  } catch (error) {
    console.error('Error listing files from Google Drive:', error);
    throw error;
  }
};

/**
 * Make file reader-friendly to anyone with the link (public reader permission)
 */
export const makeFilePublic = async (fileId: string): Promise<void> => {
  try {
    const url = `${DRIVE_API_BASE}/files/${fileId}/permissions`;
    await driveFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
  } catch (error) {
    console.warn('Could not make Google Drive file public. The student might need to request permission.', error);
  }
};

/**
 * Upload a file to Google Drive using multipart upload
 */
export const uploadFileToDrive = async (file: File, folderId?: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const token = getAccessToken();
    if (!token) {
      reject(new Error('Google Drive access token not available.'));
      return;
    }

    const metadata = {
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      parents: folderId ? [folderId] : undefined
    };

    const boundary = 'tutor_khuji_boundary_' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const close_delim = `\r\n--${boundary}--`;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      try {
        const metadataPart = JSON.stringify(metadata);
        const contentType = file.type || 'application/octet-stream';
        
        // Build multipart body
        const headerEncoder = new TextEncoder();
        const headerPart = headerEncoder.encode(
          `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${metadataPart}${delimiter}Content-Type: ${contentType}\r\n\r\n`
        );
        const footerPart = headerEncoder.encode(close_delim);

        const fileBytes = new Uint8Array(reader.result as ArrayBuffer);
        const body = new Uint8Array(headerPart.length + fileBytes.length + footerPart.length);
        
        body.set(headerPart, 0);
        body.set(fileBytes, headerPart.length);
        body.set(footerPart, headerPart.length + fileBytes.length);

        const uploadUrl = `${UPLOAD_API_BASE}/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,size`;
        
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`
          },
          body
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Upload failed with status ${response.status}: ${errText}`);
        }

        const uploadedFile = await response.json();
        
        // Make the file publicly viewable so students can download/open it directly
        await makeFilePublic(uploadedFile.id);
        
        resolve(uploadedFile);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Delete a file from Google Drive.
 * Requires user confirmation from the UI before calling this.
 */
export const deleteFileFromDrive = async (fileId: string): Promise<boolean> => {
  try {
    const url = `${DRIVE_API_BASE}/files/${fileId}`;
    await driveFetch(url, {
      method: 'DELETE'
    });
    return true;
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    throw error;
  }
};
