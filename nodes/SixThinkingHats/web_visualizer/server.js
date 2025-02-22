const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname)));

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// API endpoint to get dialogue data
app.get('/api/dialogue-data', (req, res) => {
    try {
        const conversation = global.latestConversation || {
            name: "Root",
            children: []
        };
        console.log('Sending conversation data:', JSON.stringify(conversation));
        res.json(processConversation(conversation));
    } catch (error) {
        console.error('Error serving dialogue data:', error);
        res.status(500).json({ error: 'Failed to process conversation data' });
    }
});

// Convert flat conversation history to tree structure
function processConversation(conversation) {
    console.log('Processing conversation:', conversation);
    if (!conversation.conversation) return { name: "No data", children: [] };

    const messages = conversation.conversation;
    const tree = { name: "Dialogue", children: [] };
    const messagesMap = new Map();

    // First pass: create nodes
    messages.forEach(msg => {
        messagesMap.set(msg.id, {
            name: msg.content,
            hat: msg.hat,
            content: msg.content,
            timestamp: msg.timestamp,
            children: []
        });
    });

    // Second pass: build tree
    messages.forEach(msg => {
        const node = messagesMap.get(msg.id);
        if (msg.response_to) {
            const parent = messagesMap.get(msg.response_to);
            if (parent) {
                parent.children.push(node);
            } else {
                tree.children.push(node);
            }
        } else {
            tree.children.push(node);
        }
    });

    return tree;
}

// Start server
const port = process.env.VISUALIZER_PORT || 3001;
app.listen(port, '0.0.0.0', () => {
    console.log(`Visualization server running on port ${port}`);
}).on('error', (error) => {
    console.error('Failed to start server:', error);
});