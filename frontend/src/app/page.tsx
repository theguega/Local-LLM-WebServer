"use client";

import React, { useEffect, useState } from "react";

const ChatInterface = () => {
    const [isClient, setIsClient] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [messages, setMessages] = useState<{ text: string; type: "user" | "bot" }[]>([]);

    useEffect(() => {
        // Set `isClient` to true only when this is running in the browser
        setIsClient(true);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        // Display the user's message in the chat log
        setMessages((prev) => [...prev, { text: userInput, type: "user" }]);
        setUserInput("");

        try {
            const response = await fetch("http://127.0.0.1:8080/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: userInput }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages((prev) => [...prev, { text: data.response, type: "bot" }]);
            } else {
                setMessages((prev) => [...prev, { text: "Sorry, there was an issue with the server.", type: "bot" }]);
            }
        } catch (error) {
            setMessages((prev) => [...prev, { text: "There was an error processing your request.", type: "bot" }]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    // Show loading message while checking if we are on the client side
    if (!isClient) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-2 rounded-lg mb-2 ${
                            msg.type === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-300 text-black self-start"
                        }`}
                    >
                        {msg.type === "user" ? "You: " : "Bot: "}
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="p-4 bg-white flex space-x-2 border-t border-gray-300">
                <input
                    type="text"
                    value={userInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message here..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none"
                />
                <button onClick={handleSendMessage} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatInterface;
