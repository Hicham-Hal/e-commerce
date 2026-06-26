import express from 'express'
import { addProduct, allProducts, deleteProduct, featuredProducts, getCatProducts, recommendations, toggleFeatured } from '../controllers/prodcut.controller.js'
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js'

const route = express.Router()

route.get('/', protectRoute, adminRoute, allProducts)
route.get('/featured', featuredProducts)
route.post('/addProduct', protectRoute, adminRoute, addProduct)
route.get('/recommendations', recommendations)
route.delete('/:id', protectRoute, adminRoute, deleteProduct)
route.get('/:cat', getCatProducts)
route.patch('/:id', protectRoute, adminRoute, toggleFeatured)

export default route