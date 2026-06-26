import express from 'express'
import { protectRoute } from '../middleware/auth.middleware.js'

const route = express.Router()

route.patch('/firstOffer', protectRoute, getFirstOffer)


export default route