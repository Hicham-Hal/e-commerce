import express from 'express'
import { getProfile, logout, refreshToken, signin, signup } from '../controllers/user.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'

const route = express.Router()

route.post('/signin', signin)
route.post('/signup', signup)
route.post('/logout', logout)
route.get('/refresh-token', refreshToken)
route.get('/profile', protectRoute, getProfile)

export default route

