import {create} from 'zustand'
import axios from '../lib/axios'
import {toast} from 'react-hot-toast'


export const useCarteStore = create((set, get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false,

    getMyCoupon: async() => {
        try{
            const res = await axios.get('/coupon')
            set({ coupon: res.data })
        }catch(err){
            console.log("Error fetching coupon: ", err)
        }
    },

    applyCoupon: async(couponCode) => {
        try{
            const res = await axios.post('/coupon/validate', {couponCode})
            set({ isCouponApplied: true, coupon: res.data.verifyCoupon })
            get().calculateTotals()
            toast.success('Coupon applied successfully')
        }catch(err){
            toast.error(error.response?.data?.message || "Failed to apply coupon");
        }
    },

    removeCoupon: () => {
        set({ coupon: null, isCouponApplied: false })
        get().calculateTotals()
        toast.success("Coupon removed")
    },

    getCartItems: async() => {

        try{
            const res = await axios.get('/cart/')
            set({ cart: res.data })
            get().calculateTotals()
        }catch(err){
            set({ cart: [] })
            toast.error(err.response?.data?.msg || 'An error occurred')
        }
    },
    
    clearCart : async() => {
        set({ total: 0, subtotal: 0, coupon: null, cart: [] })
    },

    addToCart: async(product) => {
        try{
            const res = await axios.post('/cart/add-to-cart', {productId: product._id})
            toast.success("Product added to cart")
            set((prev) => {
                const existingItem = prev.cart.find((item) => item._id === product._id)
                const newCart = existingItem
                    ? prev.cart.map((item) => 
                            item._id === product._id ? {...item, quantity: item.quantity + 1} : item
                        )
                    : [...prev.cart, {...product, quantity: 1}];
                return {cart: newCart}
            })
            get().calculateTotals()

        }catch(err){
            toast.error(err.response?.data?.msg || "An error occurred add to cart")
        }
    },

    calculateTotals: () => {
        const {cart, coupon} = get()
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let total = subtotal;

        if(coupon){
            const discount = subtotal * (coupon.discountPercentage / 100)
            total = subtotal - discount
        }

        set({ subtotal, total })
    },

    removeFromCart: async(productId) => {
        try{
            const res = await axios.delete('/cart', {data: {productId}})
            set((prev) => ({ cart: prev.cart.filter(item => item._id !== productId) }))
            get().calculateTotals()
        }catch(err){
            toast.error(err.response?.data?.msg || 'An error occurred')
        }
    },
    updateQuantity: async(productId, addedQuantity) => {
        if(addedQuantity === 0){
            get().removeFromCart(productId)
            return
        }
        try{
            const res = await axios.put(`/cart/${productId}`, { quantity: addedQuantity })
            console.log(res)
            set((prev) => ({
                cart: prev.cart.map((item) => (item._id === productId ? {...item, quantity: addedQuantity} : item))
            }))
            get().calculateTotals()

        }catch(err){
            toast.error(err.response?.data?.msg || 'An error occurred')
        }
    }
}))
