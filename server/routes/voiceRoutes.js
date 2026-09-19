import express from 'express';
import {
  processVoiceCommand,
  confirmCommand,
  cancelCommand,
  getVoiceHistory,
  getPendingCommand,
  getBusinessSummary,
  getStockExplanation,
  getReorderSuggestions,
} from '../controllers/voiceController.js';
import {
  validateCommandInput,
  validateConfirmationInput,
  validateCancellationInput,
} from '../validators/voiceCommandValidator.js';

const router = express.Router();

// Voice Command Execution & Simulation
router.post('/command', validateCommandInput, processVoiceCommand);
router.post('/validate', validateCommandInput, (req, res, next) => {
  req.body.dryRun = true;
  processVoiceCommand(req, res, next);
});

// Confirmation System
router.post('/confirm', validateConfirmationInput, confirmCommand);
router.post('/cancel', validateCancellationInput, cancelCommand);

// Query Endpoints
router.get('/history', getVoiceHistory);
router.get('/pending', getPendingCommand);
router.get('/business-summary', getBusinessSummary);
router.get('/stock-explanation/:productId', getStockExplanation);
router.get('/reorder-suggestions', getReorderSuggestions);

export default router;
