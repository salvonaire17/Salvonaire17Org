import { getGoogleWorkspaceToken } from './gmail';

export const addEventToGoogleCalendar = async (
    title: string,
    description: string,
    dateString: string
) => {
    // We reuse the token from Gmail/Calendar setup because it's combined scopes.
    const token = await getGoogleWorkspaceToken();
    if (!token) {
        throw new Error('Failed to obtain Google Access Token. Cannot add to calendar.');
    }

    const eventDate = new Date(dateString);
    if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid date provided.');
    }

    // Default to an all-day event or 1 hour event starting at that date
    // If we only have date string like 'YYYY-MM-DD', we create an all day event
    const isAllDay = dateString.length <= 10;
    
    let start, end;
    
    if (isAllDay) {
        start = { date: dateString };
        end = { date: dateString }; // For all day, start and end can be same 
    } else {
        start = { dateTime: eventDate.toISOString() };
        eventDate.setHours(eventDate.getHours() + 1);
        end = { dateTime: eventDate.toISOString() };
    }

    const eventDetails = {
        summary: title,
        description: description,
        start,
        end
    };

    try {
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventDetails)
        });

        if (!res.ok) {
            console.error(`Failed to add event to Google Calendar`, await res.text());
            throw new Error('Failed to add event to Google Calendar.');
        }
        
        return await res.json();
    } catch (e) {
        console.error(`Error adding event to Google Calendar`, e);
        throw e;
    }
};
