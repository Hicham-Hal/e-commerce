import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';

import { addToCart, getCartProduct, removeAllFromCart, updateQuantity } from '../controllers/cart.controller.js';

const route = express.Router()

route.get('/', protectRoute, getCartProduct);
route.post('/add-to-cart', protectRoute, addToCart);
route.delete('/', protectRoute, removeAllFromCart);
route.put('/:id', protectRoute, updateQuantity);

export default route