export interface ChatMessage {
    text: string;
    type: "user" | "bot";
}

export function useStorage() {
    const STORAGE_KEY = 'chatHistory';

    const saveChat = async (messages: ChatMessage[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving chat:', error);
            throw error;
        }
    };

    const loadChat = async () => {
        try {
            const savedChat = localStorage.getItem(STORAGE_KEY);
            return savedChat ? JSON.parse(savedChat) as ChatMessage[] : [];
        } catch (error) {
            console.error('Error loading chat:', error);
            throw error;
        }
    };

    return { saveChat, loadChat };
}
