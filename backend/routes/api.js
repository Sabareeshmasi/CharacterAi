const express = require('express');
const User = require('../models/User');
const Character = require('../models/Character');
const Conversation = require('../models/Conversation');
const router = express.Router();
const { CohereClient } = require("cohere-ai");
require('dotenv').config();
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

// User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, avatar } = req.body;
    const user = new User({ username, email, password, avatar });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Character CRUD
router.post('/characters', async (req, res) => {
  try {
    const character = new Character(req.body);
    await character.save();
    res.status(201).json(character);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/characters', async (req, res) => {
  const characters = await Character.find().populate('creator');
  res.json(characters);
});

router.get('/characters/:id', async (req, res) => {
  const character = await Character.findById(req.params.id).populate('creator');
  if (!character) return res.status(404).json({ error: 'Not found' });
  res.json(character);
});

router.put('/characters/:id', async (req, res) => {
  const character = await Character.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!character) return res.status(404).json({ error: 'Not found' });
  res.json(character);
});

router.delete('/characters/:id', async (req, res) => {
  const character = await Character.findByIdAndDelete(req.params.id);
  if (!character) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// Conversation endpoints
router.post('/conversations', async (req, res) => {
  try {
    const conversation = new Conversation(req.body);
    await conversation.save();
    res.status(201).json(conversation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/conversations/:id', async (req, res) => {
  const conversation = await Conversation.findById(req.params.id).populate('user character');
  if (!conversation) return res.status(404).json({ error: 'Not found' });
  res.json(conversation);
});

router.post('/conversations/:id/messages', async (req, res) => {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) return res.status(404).json({ error: 'Not found' });
  conversation.messages.push(req.body);
  await conversation.save();
  res.json(conversation);
});

// AI chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { characterId, messages } = req.body;
    if (!characterId || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'characterId and messages are required.' });
    }
    const character = await Character.findById(characterId);
    if (!character) {
      return res.status(404).json({ error: 'Character not found.' });
    }
    // Build system message with character personality
    const systemMessage = `You are ${character.name}. ${character.personality || ''} ${character.description || ''}`;
    
    // Convert messages to Cohere Chat format
    // IMPORTANT: Cohere API requires capitalized roles: 'User', 'Chatbot', 'System', 'Tool'
    const chatMessages = messages.map(msg => ({
      role: msg.sender === 'User' ? 'User' : 'Chatbot',
      message: msg.text
    }));
    
    // Get the last message (current user message)
    const lastMessage = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].message : '';
    // Get chat history (all messages except the last one)
    const chatHistory = chatMessages.slice(0, -1);
    
    // Call Cohere Chat API (replaces deprecated Generate API)
    // Using 'command-a-03-2025' - currently supported and recommended model
    // Alternative: 'command-r-08-2024' or 'command-r7b-12-2024'
    // Note: 'command', 'command-r', 'command-r-plus' were removed on Sept 15, 2025
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      message: lastMessage,
      chatHistory: chatHistory.length > 0 ? chatHistory : undefined,
      preamble: systemMessage,
      maxTokens: 80,
      temperature: 0.8,
    });
    
    const aiResponse = response.text.trim();
    res.json({ aiResponse });
  } catch (err) {
    console.error('Chat error:', err);
    // Provide more detailed error message
    if (!process.env.COHERE_API_KEY || process.env.COHERE_API_KEY === 'your_cohere_api_key_here') {
      res.status(500).json({ error: 'Cohere API key is not configured. Please add your COHERE_API_KEY to the .env file.' });
    } else if (err.message && err.message.includes('authentication')) {
      res.status(500).json({ error: 'Invalid Cohere API key. Please check your COHERE_API_KEY in the .env file.' });
    } else {
      res.status(500).json({ error: `Failed to get AI response: ${err.message || 'Unknown error'}` });
    }
  }
});

module.exports = router; 