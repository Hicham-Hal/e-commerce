import Product from '../models/product.model.js';

export const getCartProduct = async(req, res) => {
    const user = req.user;
    try{
        const products = await Product.find({_id:{$in:req.user.cartItems}});
        if(products.length === 0) return res.status(404).json({ msg: 'no products founded' })
        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItem => cartItem.id === product.id)
            return {
                ...product.toJSON(),
                quantity: item.quantity
            }
        })
        res.status(200).json(cartItems)
    }catch(err){
        console.log('Error from getCart function', err.message)
        res.status(500).json({ msg: err.message })
    }
}


export const addToCart = async(req, res) => {
    const {productId} = req.body;
    const user = req.user;
    try{
        const existingProduct = user.cartItems.find(product => product.id === productId)
        if(existingProduct){
            existingProduct.quantity += 1;
        }else{
            user.cartItems.push(productId)
        }
        await user.save()

        res.status(200).json({ user })
    }catch(err){
        console.log('Error from addToCart function', err);
        res.status(500).json({ err: err.message })
    }
}


export const removeAllFromCart = async(req, res) => {
    const user = req.user;
    
    const {productId} = req.body;
    try{
        if(!productId){
            user.cartItems = [];
        }
        user.cartItems = user.cartItems.filter(item => item.id !== productId);
        await user.save();
        res.status(200).json({ msg: 'cart items deleted successfully' })
    }catch(err){
        console.log('Error from removeAllFromCart function', err)
        res.status(500).json({ err: err.message })
    }
}

export const updateQuantity = async(req, res) => {
    const {id: productId} = req.params;
    const {quantity} = req.body;
    const user = req.user;
    try{
        const productQuantity = user.cartItems.quantity
        const existingItem = user.cartItems.find(item => item.id === productId)
        if(existingItem){
            if(existingItem.quantity === 0){
                user.cartItems = user.cartItems.filter(item => item.id !== productId)
                await user.save()
                return res.status(200).json({ msg: 'item removed successfully', user })
            }
            existingItem.quantity = quantity;
            user.cartItems.quantity = quantity;
            await user.save()
            return res.status(200).json({ user, existingItem })
        }else{
            res.status(404).json({ msg: 'product not found' })
        }
    }catch(err){
        console.log("Error from updateQuantity function", err);
        res.status(500).json({ err: err.message })
    }
}

