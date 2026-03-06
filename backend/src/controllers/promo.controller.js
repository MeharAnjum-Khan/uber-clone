const promoService = require('../services/promo.service');

const create = async (req, res) => {
  try {
    const { code, discount, type, expires_at } = req.body;

    if (!code || !discount || !type) {
      return res.status(400).json({ error: 'Code, discount, and type are required' });
    }

    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({ error: 'Type must be percentage or fixed' });
    }

    const promo = await promoService.createPromoCode({ code, discount, type, expires_at });
    res.status(201).json(promo);
  } catch (error) {
    if (error.message === 'Promo code already exists') {
      return res.status(409).json({ error: error.message });
    }
    console.error('Create Promo Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getDetails = async (req, res) => {
  try {
    const { code } = req.params;
    const promo = await promoService.getPromoCode(code);
    res.json(promo);
  } catch (error) {
    if (error.message === 'Promo code not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Get Promo Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const validate = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const result = await promoService.validatePromoCode(code);
    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid promo code' || error.message === 'Promo code has expired') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Validate Promo Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const remove = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await promoService.deletePromoCode(code);
    res.json(result);
  } catch (error) {
    if (error.message === 'Promo code not found') {
      return res.status(404).json({ error: error.message });
    }
    console.error('Delete Promo Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  create,
  getDetails,
  validate,
  remove,
};
