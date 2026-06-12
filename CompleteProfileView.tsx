import { getGoogleWorkspaceToken } from './gmail';

export const addContactsToGoogle = async (contacts: { name: string; email: string; phone?: string; role?: string }[]) => {
    const token = await getGoogleWorkspaceToken();
    if (!token) {
        throw new Error('Failed to obtain Google Access Token. Cannot sync contacts.');
    }

    let addedCount = 0;
    
    for (const contact of contacts) {
        if (!contact.email && !contact.phone) continue;

        const body: any = {
            names: [{ givenName: contact.name }],
        };

        if (contact.email) {
            body.emailAddresses = [{ value: contact.email, type: 'work' }];
        }

        if (contact.phone) {
            body.phoneNumbers = [{ value: contact.phone, type: 'work' }];
        }
        
        if (contact.role) {
            body.organizations = [{ title: contact.role }];
        }

        try {
            const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                addedCount++;
            } else {
                 console.error('Failed to add contact', await res.text());
            }
        } catch (e) {
            console.error('Error adding contact', e);
        }
    }
    
    return addedCount;
};
