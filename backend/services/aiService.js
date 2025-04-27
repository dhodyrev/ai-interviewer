// backend/services/aiService.js
const OpenAI = require('openai');
const { InterviewSession } = require('../models/InterviewSession');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateFollowUpQuestion(sessionId, context) {
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const prompt = this._buildPrompt(session, context);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI interviewer conducting user research interviews. Your goal is to gather deep insights about user experiences and needs."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return response.choices[0].message.content;
  }

  async analyzeResponse(sessionId, message) {
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const analysisPrompt = this._buildAnalysisPrompt(session, message);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Analyze the user's response for sentiment, key themes, and potential follow-up areas."
        },
        {
          role: "user",
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    });

    return JSON.parse(response.choices[0].message.content);
  }

  _buildPrompt(session, context) {
    return `
      Interview Context:
      Template: ${session.template.name}
      Target Audience: ${session.template.targetAudience}
      Objectives: ${session.template.objectives.join(', ')}

      Previous Conversation:
      ${context}

      Generate a relevant follow-up question that:
      1. Probes deeper into the user's experience
      2. Maintains natural conversation flow
      3. Aligns with the interview objectives
      4. Avoids leading questions
    `;
  }

  _buildAnalysisPrompt(session, message) {
    return `
      Analyze the following user response:
      "${message}"

      Please provide a JSON response with:
      {
        "sentiment": "positive/negative/neutral",
        "keyThemes": ["theme1", "theme2", ...],
        "followUpAreas": ["area1", "area2", ...],
        "confidence": 0.0-1.0
      }
    `;
  }

  async generateSessionSummary(sessionId) {
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const summaryPrompt = this._buildSummaryPrompt(session);
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Generate a comprehensive summary of the interview session, highlighting key insights and findings."
        },
        {
          role: "user",
          content: summaryPrompt
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    });

    return response.choices[0].message.content;
  }

  _buildSummaryPrompt(session) {
    return `
      Interview Summary Request:
      Template: ${session.template.name}
      Objectives: ${session.template.objectives.join(', ')}
      
      Conversation History:
      ${session.messages.map(m => `${m.role}: ${m.content}`).join('\n')}

      Please provide a structured summary including:
      1. Key findings and insights
      2. User pain points and needs
      3. Potential opportunities
      4. Recommendations for next steps
    `;
  }
}

module.exports = new AIService();