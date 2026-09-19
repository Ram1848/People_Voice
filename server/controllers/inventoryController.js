import inventoryService from '../services/inventoryService.js';
import reorderService from '../services/reorderService.js';
import businessAssistantService from '../services/businessAssistantService.js';

export const addStock = async (req, res, next) => {
  try {
    const result = await inventoryService.addStock(req.body);
    res.json({
      success: true,
      message: `${result.quantity} ${result.unit} of ${result.product} added successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const removeStock = async (req, res, next) => {
  try {
    const result = await inventoryService.removeStock(req.body);
    res.json({
      success: true,
      message: `${result.quantity} ${result.unit} of ${result.product} removed successfully`,
      data: result,
    });
  } catch (error) {
    if (error.availableStock !== undefined) {
      return res.status(400).json({
        success: false,
        message: error.message,
        availableStock: error.availableStock,
        requestedQuantity: error.requestedQuantity,
        product: error.product,
        unit: error.unit,
      });
    }
    next(error);
  }
};

export const explainStock = async (req, res, next) => {
  try {
    const idOrName = req.params.idOrName || req.query.product;
    const explanation = await businessAssistantService.explainProductStock(idOrName);
    res.json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const limit = req.query.limit || 50;
    const filters = {
      action: req.query.action,
      source: req.query.source,
      productId: req.query.productId,
    };
    const history = await inventoryService.getStockHistory(limit, filters);
    res.json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (req, res, next) => {
  try {
    const lowItems = await inventoryService.getLowStock();
    res.json({
      success: true,
      data: lowItems,
      count: lowItems.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    const leadTime = req.query.leadTime || 3;
    const recommendations = await reorderService.getReorderRecommendations(leadTime);
    res.json({
      success: true,
      disclaimer: 'Reorder Suggestions based on sales velocity and safety stock thresholds.',
      data: recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  addStock,
  removeStock,
  explainStock,
  getHistory,
  getLowStock,
  getRecommendations,
};
