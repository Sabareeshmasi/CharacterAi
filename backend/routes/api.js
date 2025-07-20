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
    // Build prompt: persona + chat history
    let prompt = `You are ${character.name}, ${character.personality || ''}.\n`;
    for (const msg of messages) {
      prompt += `${msg.sender}: ${msg.text}\n`;
    }
    prompt += `${character.name}:`;
    // Call Cohere
    const response = await cohere.generate({
      model: 'command',
      prompt,
      max_tokens: 80,
      temperature: 0.8,
      stop_sequences: ["User:", `${character.name}:`],
    });
    const aiResponse = response.generations[0].text.trim();
    res.json({ aiResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});

module.exports = router; 