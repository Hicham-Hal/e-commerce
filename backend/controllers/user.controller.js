import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import { redis } from '../utils/redis.js'


const generateTokens = (id) => {
    const accessToken = jwt.sign({id}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15m'
    })

    const refreshToken = jwt.sign({id}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    })
    
    return {accessToken, refreshToken}
}


const storeRefreshToken = async(id, refreshToken) => {
    await redis.set(`refresh_token_${id}`, refreshToken, 'EX', 7*24*60*60) //7days
}

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true, // prevent XSS attacks, cross sites scripting attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // prevent CSRF attacks
        maxAge: 15*60*1000,
    })

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 7*24*60*60*1000,
    })
}

export const signin = async(req, res, next) => {
    const { email, password } = req.body
    try{
        const user = await User.findOne({ email })
        if(!user) return res.status(404).json({ msg: "No user exist with that email" })
        if(!await user.compare(password)) return res.status(404).json({ msg: 'Incorrect password, please try again!!' })
        const {accessToken, refreshToken} = generateTokens(user._id)
        storeRefreshToken(user._id, refreshToken)
        setCookies(res, accessToken, refreshToken)
        res.status(201).json({ user, msg: 'Login successfully' })
    }catch(err){
        res.status(500).json({ msg: err })
    }
}

export const signup = async(req, res, next) => {
    const { email, name, password } = req.body

    try{
        const user = await User.findOne({ email })
        if(user) return res.status(300).json({ msg: 'User already exist' })
        const newUser = new User({name, email, password})
        await newUser.save()
        //authenticate
        const {accessToken, refreshToken} = generateTokens(newUser._id)
        await storeRefreshToken(newUser._id, refreshToken)
        setCookies(res, accessToken, refreshToken)
            res.json({ user: newUser,accessToken, refreshToken, msg: 'user created successfully' })
    }catch(err){
        res.status(500).json({ msg: err })
    }
}

export const logout = async(req, res) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        console.log('logout...')
        if(refreshToken){
            const decode = jwt.decode(refreshToken, process.env.REFRESH_TOKEN_SECRET)
            console.log(decode)
            await redis.del(`refresh_token_${decode.id}`)
        }
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        return res.json({ msg: 'logged out successfully' })
    }catch(err){
        res.status(500).json(err.message)
    }
}

export const refreshToken = async(req, res, next) => {
    try{
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) return logout();
        const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        const storedRefreshToken = await redis.get(`refresh_token_${decode.id}`)
        if(refreshToken !== storedRefreshToken) return res.status(401).json({ msg: 'Invalid refresh token' })
        
        
        const accessToken = jwt.sign({ userId: decode.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 15*60*1000,
        })
        res.status(201).json({ msg: 'refreshed token' })
    }catch(err){
        res.status(500).json({ msg: err.message })
    }
}


export const getProfile = async (req, res) => {
    try{
        res.json(req.user)
    }catch(err){
        res.status(500).json({ message: 'Server Error', error: err.message })
    }
}