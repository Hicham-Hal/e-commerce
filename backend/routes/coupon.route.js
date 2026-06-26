import express from 'express'
import { getCoupon, validateCoupon } from '../controllers/coupon.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const route = express.Router()

route.get('/', protectRoute, getCoupon)
route.post('/validate', protectRoute, validateCoupon)

export default route