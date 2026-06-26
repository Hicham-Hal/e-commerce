import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

configDotenv()

export const protectRoute = async(req, res, next) => {
    try{
        const accessToken = req.cookies.accessToken;

        if(!accessToken) return res.status(404).json({ msg: 'Unauthorized - No access token provided' })
        
        try{
            const decode = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
            
            const user = await User.findById(decode.id).select('-password')
            if(!user) return res.status(401).json({ msg: 'Unauthorized - user not found' })
            
            req.user = user;
            next()
        }catch(err){
            if(err.name === 'TokenExpiredError'){
                return res.status(401).json({ message: 'Unauthorized - Access token expired' })
            }
        }

    }catch(err){
        console.log('Error in protect route middleware', err.message)
        res.status(500).json({ message: 'Unauthorized - Invalid access token' })
    }
}

export const adminRoute = async(req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        next()
    }else{
        return res.status(403).json({ message: 'Access denied - Admin only  ' })
    }
}