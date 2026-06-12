import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { User } from '../types';

let cachedAccessToken: string | null = null;
let gmailAuthApp: ReturnType<typeof initializeApp> | null = null;

export const getGoogleWorkspaceToken = async (): Promise<string | null> => {
    if (cachedAccessToken) return cachedAccessToken;
    
    if (!gmailAuthApp) {
        gmailAuthApp = initializeApp(firebaseConfig, 'gmailApp');
    }
    const auth = getAuth(gmailAuthApp);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/gmail.send');
    provider.addScope('https://www.googleapis.com/auth/calendar');
    provider.addScope('https://www.googleapis.com/auth/contacts');
    provider.setCustomParameters({
        prompt: 'consent'
    });

    try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
            cachedAccessToken = credential.accessToken;
            return cachedAccessToken;
        }
    } catch (e) {
        console.error('Failed to get Gmail auth token', e);
    }
    return null;
};

// Standard base64url encoding for Gmail API
const encodeBase64Url = (str: string) => {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

export const sendAnnouncementsEmails = async (
    subject: string,
    messageContent: string,
    targetEmails: string[]
) => {
    const token = await getGoogleWorkspaceToken();
    if (!token) {
        throw new Error('Failed to obtain Google Access Token. Cannot send emails.');
    }

    // Send emails sequentially or in batches.
    for (const email of targetEmails) {
        if (!email) continue;
        
        const rawMessage = [
            `To: ${email}`,
            `Subject: ${subject}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            '',
            messageContent
        ].join('\n');

        const encodedMessage = encodeBase64Url(rawMessage);

        try {
            const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    raw: encodedMessage
                })
            });

            if (!res.ok) {
                console.error(`Failed to send email to ${email}`, await res.text());
            }
        } catch (e) {
            console.error(`Error sending email to ${email}`, e);
        }
    }
};
