"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';

const ChatInterface = () => {
    const [isClient, setIsClient] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [messages, setMessages] = useState<{ text: string; type: "user" | "bot" }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        <div className="flex flex-col h-screen bg-[#343541]">
            <div className="flex-1 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-4 ${msg.type === "user" ? "bg-[#343541]" : "bg-[#444654]"}`}
                    >
                        <div className="max-w-3xl mx-auto flex items-start space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.type === "user" ? "bg-[#5436DA]" : "bg-[#11A37F]"
                                }`}>
                                {msg.type === "user" ? "U" : "A"}
                            </div>
                            <div className="flex-1">
                                {msg.type === "bot" ? (
                                    <ReactMarkdown
                                        className="text-white prose prose-invert max-w-none"
                                        components={{
                                            pre: ({ children, ...props }) => (
                                                <pre className="bg-[#2D2D2D] p-4 rounded-lg overflow-x-auto" {...props}>
                                                    {children}
                                                </pre>
                                            ),
                                            code: ({ children, className, ...props }: any) => (
                                                <code className={className ? `${className} bg-[#2D2D2D] px-1 rounded` : 'text-sm'} {...props}>
                                                    {children}
                                                </code>
                                            ),
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                ) : (
                                    <p className="text-white">{msg.text}</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {error && (
                    <div className="text-red-500 p-2">
                        Error: {error}
                    </div>
                )}
                {isLoading && (
                    <div className="animate-pulse bg-gray-200 p-2 rounded-lg">
                        Loading...
                    </div>
                )}
            </div>
            <div className="border-t border-gray-700 p-4">
                <div className="max-w-3xl mx-auto flex space-x-4">
                    <input
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        className="flex-1 p-3 bg-[#40414F] text-white rounded-lg border border-gray-700 focus:outline-none focus:border-gray-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="bg-[#11A37F] text-white px-4 py-2 rounded-lg hover:bg-[#0F916F] transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
