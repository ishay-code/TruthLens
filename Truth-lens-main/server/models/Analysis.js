const mongoose = require('mongoose');

const AnalysisSchema = new mongoose.Schema({
  inputText: { type: String, required: true },
  biasScore: { type: Number },
  factCheckResult: { type: String },
  aiSummary: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);

