const express = require('express');
const router = express.Router();
const productModel = require('../models/productModel');
const batchModel = require('../models/batchModel');
const saleModel = require('../models/saleModel');
const fifoService = require('../services/fifoService');
const producer = require('../kafka/producer');

router.get('/health', (req,res)=>res.json({ok:true}));

router.get('/products', async (req,res)=>{
  try {
    const rows = await productModel.getAllProducts();
    const mapped = rows.map(r => {
      const qty = Number(r.current_quantity);
      const total = parseFloat(r.total_inventory_cost || 0);
      const avg = qty === 0 ? 0 : (total / qty);
      return { product_id: r.id, name: r.name, current_quantity: qty, total_inventory_cost: Number(total.toFixed(2)), average_cost_per_unit: Number(avg.toFixed(2)) };
    });
    res.json(mapped);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

router.get('/ledger', async (req,res)=>{
  try {
    const ledger = await saleModel.getLedger(200);
    res.json(ledger);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

router.post('/event', async (req,res)=>{
  try {
    const event = req.body;
    await producer.produceEvent(event);
    res.json({ok:true, event});
  } catch (err) {
    res.status(500).json({error:err.message});
  }
});

router.post('/force-sale', async (req,res)=>{
  try {
    const { product_id, quantity, timestamp } = req.body;
    const result = await fifoService.processSale({ product_id, quantity, timestamp });
    res.json(result);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

router.post('/force-purchase', async (req,res)=>{
  try {
    const { product_id, quantity, unit_price, timestamp } = req.body;
    const b = await batchModel.createBatch({ product_id, quantity, unit_price, created_at: timestamp });
    res.json({ok:true, batch: b});
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

module.exports = router;
