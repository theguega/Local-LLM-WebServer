"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useStorage, ChatMessage } from './storage';

const LoadingDots = () => (
    <div className="flex space-x-2 p-4 bg-[#444654]">
        <div className="max-w-3xl mx-auto flex items-start space-x-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#11A37F]">
                A
            </div>
            <div className="flex space-x-2 items-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
            </div>
        </div>
    </div>
);

const ChatInterface = () => {
    const [isClient, setIsClient] = useState(false);
    const [userInput, setUserInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const storage = useStorage();

    useEffect(() => {
        setIsClient(true);
        // Load saved chat when component mounts
        loadSavedChat();
    }, []);

    const loadSavedChat = async () => {
        try {
            const savedMessages = await storage.loadChat();
            if (savedMessages.length > 0) {
                setMessages(savedMessages);
            }
        } catch (error) {
            console.error('Error loading saved chat:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const newMessages = [...messages, { text: userInput, type: "user" as const }];
        setMessages(newMessages);
        setUserInput("");
        setIsLoading(true);

        try {
            const response = await fetch("http://127.0.0.1:8080/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userInput }),
            });

            if (response.ok) {
                const data = await response.json();
                const updatedMessages = [...newMessages, { text: data.response, type: "bot" as const }];
                setMessages(updatedMessages);
                await storage.saveChat(updatedMessages);
            } else {
                setMessages(prev => [...prev, { text: "Sorry, there was an issue with the server.", type: "bot" }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { text: "There was an error processing your request.", type: "bot" }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

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
                                            code({node, inline, className, children, ...props}) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                const language = match ? match[1] : '';

                                                return !inline ? (
                                                    <SyntaxHighlighter
                                                        style={oneDark}
                                                        language={language}
                                                        PreTag="div"
                                                        className="rounded-lg"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className="bg-[#2D2D2D] px-1 rounded" {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            },
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
                {isLoading && <LoadingDots />}
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
