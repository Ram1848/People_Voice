import voiceService from '../services/voiceService.js';
import businessAssistantService from '../services/businessAssistantService.js';
import { explainStock } from '../services/stockExplanationService.js';
import reorderService from '../services/reorderService.js';

/**
 * Voice Controller
 * Exposes clean, structured REST endpoints for voice interaction.
 */

// POST /api/voice/command
export const processVoiceCommand = async (req, res, next) => {
  try {
    const { 
      command, 
      transcript, 
      source = 'VOICE', 
      confirmed = false, 
      dryRun = false 
    } = req.body;

    const rawCommand = command || transcript;

    const result = await voiceService.handleVoiceCommand({
      command: rawCommand,
      source,
      confirmed,
      dryRun,
    });

    const statusCode = result.success ? 200 : (result.suggestCreate ? 404 : 400);
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/voice/confirm
export const confirmCommand = async (req, res, next) => {
  try {
    const { commandId, pendingCommandId, confirmedQuantity } = req.body;
    const targetId = commandId || pendingCommandId;
    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'A valid commandId is required to confirm an action.',
      });
    }
    const result = await voiceService.confirmPendingCommand({
      commandId: parseInt(targetId, 10),
      confirmedQuantity,
    });
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

// POST /api/voice/cancel
export const cancelCommand = async (req, res, next) => {
  try {
    const { commandId, pendingCommandId } = req.body;
    const targetId = commandId || pendingCommandId;
    if (!targetId) {
      return res.status(400).json({
        success: false,
        message: 'A valid commandId is required to cancel an action.',
      });
    }
    const result = await voiceService.cancelPendingCommand({
      commandId: parseInt(targetId, 10),
    });
    return res.json(result);
  } catch (error) {
    next(error);
  }
};

// GET /api/voice/history
export const getVoiceHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '30', 10);
    const history = await voiceService.getVoiceHistory(limit);
    return res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/voice/pending
export const getPendingCommand = async (req, res, next) => {
  try {
    const pending = await voiceService.getPendingVoiceCommands();
    return res.json({
      success: true,
      data: pending,
      hasPending: Boolean(pending),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/voice/business-summary
export const getBusinessSummary = async (req, res, next) => {
  try {
    const summary = await businessAssistantService.getTodayActivity();
    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/voice/stock-explanation/:productId
export const getStockExplanation = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const explanation = await explainStock(productId);
    return res.json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/voice/reorder-suggestions
export const getReorderSuggestions = async (req, res, next) => {
  try {
    const leadTime = parseInt(req.query.leadTime || '3', 10);
    const suggestions = await businessAssistantService.getPurchaseSuggestions();
    return res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  processVoiceCommand,
  confirmCommand,
  cancelCommand,
  getVoiceHistory,
  getPendingCommand,
  getBusinessSummary,
  getStockExplanation,
  getReorderSuggestions,
};
