document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('userInput');
    const chatLog = document.getElementById('chatLog');
    const sendButton = document.getElementById('sendButton'); // Assuming your button has the ID 'sendButton'

    // Add an event listener to trigger sendMessage on Enter key press
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Add an event listener for the Send button
    sendButton.addEventListener('click', sendMessage);

    async function sendMessage() {
        const userMessage = input.value;

        if (!userMessage) return; // Exit if no message is entered

        // Display user's message in the chat log
        chatLog.innerHTML += `<p class="user-message">You: ${userMessage}</p>`;
        input.value = ''; // Clear the input field

        try {
            const response = await fetch('http://127.0.0.1:8080/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage })
            });

            console.log('Response status:', response.status); // Log the response status

            if (response.ok) {
                // Get the JSON response from the server
                const data = await response.json();
                console.log('Response data:', data); // Log the response data

                // Display the server's response (fake LLM response) in the chat log
                chatLog.innerHTML += `<p class="bot-response">Bot: ${data.response}</p>`;
            } else {
                // Handle server errors
                chatLog.innerHTML += `<p class="bot-response error">Bot: Sorry, there was an issue with the server.</p>`;
            }

            // Scroll to the bottom of the chat log
            chatLog.scrollTop = chatLog.scrollHeight;
        } catch (error) {
            console.error('Error occurred while sending message:', error);
            chatLog.innerHTML += `<p class="bot-response error">Bot: Sorry, there was an error while processing your request.</p>`;
        }
    }
});
