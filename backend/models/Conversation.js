const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
  messages: [messageSchema],
  startedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Conversation', conversationSchema); 