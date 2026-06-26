import Stripe from "stripe";
import Coupon from "../models/coupon.model.js";
import { model } from "mongoose";
import dotenv from 'dotenv'
import { stripe } from "../utils/stripe.js";
import Order from '../models/order.model.js'

dotenv.config()

export const createCheckoutSession = async (req, res) => {
    try{
        const { products, couponCode } = req.body;

        if(!Array.isArray(products) || products?.length === 0){
            return res.status(404).json({ message: 'Invalid or empty products array' })
        }

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount  = Math.round(product.price * 100); //stripe wants the format with cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    "unit_amount": amount,
                },
                quantity: product.quantity || 1,
            }
        
        })

        let coupon = null;

        if(couponCode){
            coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true })
            if(coupon){
                totalAmount -= Math.round(totalAmount * coupon.discountPercentage / 100)
            }
        }

        const createStripeCoupon = async(percent) => {
            return await stripe.coupons.create({
                percent_off: percent,
                duration: "once",
            })
        }

        const stripeCoupon = coupon
            ? await createStripeCoupon(coupon.discountPercentage)
            :null;

        const session = await stripe.checkout.sessions.create({ 
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_MODE}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_MODE}/purchase-cancel`,
            discounts: stripeCoupon
                ? [
                    {
                        coupon: stripeCoupon.id,
                    },
                ]
                :[],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                )
            }
            })

            if(totalAmount >= 20000){
                await createNewCoupon(req.user._id)
            }



            res.status(200).json({ id: session.id, url: session.url, totalAmount: totalAmount / 100 })
    }catch(err){
        console.log("Error processing checkout:", err)
        res.status(500).json({ message: "Error processing checkout", error: err.message })
    }
}

export const checkoutSuccess = async (req, res) => {
    
    try{
        const {sessionId} = req.body
        const session = await stripe.checkout.sessions.retrieve(sessionId)

        if(session.payment_status === 'paid'){
            if(session.metadata.couponCode){
                await Coupon.findOneAndUpdate(
                    {
                        code: session.metadate.couponeCode,
                        userId: session.metadata.userId,
                    },{
                        isActive: false,
                    } )
            }
        }


        //create a new order
        console.log('this is the session', session.totalAmount)
        const products = JSON.parse(session.metadata.products)
        console.log(products)
        const newOrder = new Order({
            user: session.metadata.userId,
            products: products.map((product) => ({
                product: product.id,
                quantity: product.quantity,
                price: product.price
            })),
            totalAmount: session.amount_total / 1000, // from cents to dollars
            stripeSessionId: sessionId
        })

        await newOrder.save()
    
        res.status(200).json({
            success: true,
            message: "Payment successful, order created, and coupon desactivated if used.",
            orderId: newOrder._id
        })
    
    }catch(err){
        console.log("Error processing successful chekcout: ", err)
        res.status(500).json({ message: "Error processing successful checkout", error: err.message })
    }
}

async function createStripeCoupon(discountPercentage){
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    })
    return coupon.id
}


async function createNewCoupon(id){
    await Coupon.findOneAndDelete({ userId: id })

    const newCoupon = new Coupon({
        code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        discountPercentage: 10,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), //30 days from now
        userId: id
    })

    await newCoupon.save()
    

    return newCoupon;
}