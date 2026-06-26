import cookieParser from 'cookie-parser';
import { configDotenv } from 'dotenv';
import express from 'express';
import cartRoute from './routes/cart.route.js';
import couponRoute from './routes/coupon.route.js';
import paymentRoute from './routes/payment.route.js';
import productRoute from './routes/product.route.js';
import analyticsRoute from './routes/analytics.route.js'
import userRoute from './routes/user.route.js';
import dbConnection from './utils/db.js';
import path from 'path';
import cors from 'cors'


const app = express()
configDotenv()
const PORT = process.env.PORT || 1000;

const __dirname = path.resolve()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json({ limit: "10mb" }))
app.use(cookieParser())

app.use('/api/user', userRoute)
app.use('/api/products', productRoute)
app.use('/api/cart', cartRoute)
app.use('/api/coupon', couponRoute)
app.use('/api/payment', paymentRoute)
app.use('/api/analytics', analyticsRoute)


if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, "/client/dist")))

  app.get('*', (req, res)=>{
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"))
  })
}

app.listen(PORT, () => {
    console.log(`The server is running on PORT:${PORT}`)
    dbConnection()
})


