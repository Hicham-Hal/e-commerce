import Coupon from "../models/coupon.model.js";

export const getCoupon = async(req, res) => {
    try{
        const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true })
        res.json(coupon || null)
    }catch(err){
        console.log('Error from getCoupon function');
        res.status(500).json({ msg: 'Error', err })
    }
}

export const validateCoupon = async(req, res) => {
    const {couponCode} = req.body;
    try{
        const verifyCoupon = await Coupon.findOne({ code: couponCode, isActive: true, userId: req.user._id })
        if(!verifyCoupon) return res.status(401).json({ msg: 'coupon not found' })
        if(verifyCoupon.expirationDate < Date.now()){
            verifyCoupon.isActive = false;
            await verifyCoupon.save()
            return res.status(404).json({ message: 'coupon expired' })
        }
        res.status(200).json({ verifyCoupon })
    }catch(err){
        console.log("Error from validateCoupon function", err);
        res.status(500).json({ msg:'Error server', err })
    }
}