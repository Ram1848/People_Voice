import productService from '../services/productService.js';

export const getProducts = async (req, res, next) => {
  try {
    const { q, status } = req.query;
    const products = await productService.getProducts({ q, status });
    res.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: `Product "${newProduct.name}" created successfully`,
      data: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updated = await productService.updateProduct(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
