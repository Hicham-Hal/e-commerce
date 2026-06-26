import { create } from "zustand";
import axios from '../lib/axios'
import {toast} from 'react-hot-toast'


export const useProductStore = create((set, get) => ({
    products: [],
    recommendations: [],
    loading: false,

    setProducts: (products) => set({ products }),


    createProduct: async(productData) => {
        set({loading: true})
        try{
            const res = await axios.post('/products/addProduct', productData)
            set((prevState) => ({
                products: [...prevState.products, res.data],
                loading: false
            }))
            toast.success(`${res.data?.name} added successfuly`)
        }catch(err){
            console.log(err)
            set({loading: false})
            toast.error(err.response?.data?.msg)
        }
    },
    fetchAllProducts: async() => {
        set({ loading: true })
        try{
            const res = await axios.get('/products/')

            set({ products: res.data.products, loading: false })
            
        }catch(err){
            set({loading: false})
            toast.error(err.response?.data?.msg || "Failed to fetch products")
        }
    },

    fetchProductsByCategory: async(category) => {
        set({ loading: true })
        try{
            const res = await axios.get(`/products/${category}`)
            set({ products: res.data.products, loading: false })
        }catch(err){
            set({ loading: false })
            console.log(err)
            toast.error(err.response?.data || "An error occurred (fetching by category)")
        }
    },

    deleteProduct: async(id) => {
        set({ loading: false })

        try{
            await axios.delete(`/products/${id}`)
            set((prev) => ({
                products: prev.products.filter((product) => product._id !== id),
                loading: false
            }))
            toast.success('Product deleted successfully')
        }catch(err){
            set({ loading: false })
            toast.error(err.response?.data?.msg || "Failed to delete product")
        }
    },
    toggleFeaturedProduct: async(id) => {
        set({ loading: true })
        try{
            const res = await axios.patch(`/products/${id}`)
            console.log(res)
            set((state) => ({
                    products: state.products.map((product) => 
                        product._id === id ? {...product, isFeatured: res.data.updatedProduct.isFeatured} : product
                ),
                loading: false
            }))
        toast.success('Product toggled successfully')
        }catch(err){
            set({ loading: fasle })
            toast.error(err.response?.data?.msg || "Failed to toggle the product")
        }
    },
    getRecommendations: async() => {
        set({ loading: true })
        try{
            const res = await axios.get('/products/recommendations')
            set({ recommendations: res.data, loading: false})
        }catch(err){
            set({ recommendations: [], loading: false })
            toast.error(err.response?.data?.msg || "An error occurred")
        }
    },
    
    getFeaturedProducts: async() => {
        set({ loading: true })
        try{
            const res = await axios.get('/products/featured')
            set({ products: res.data.featuredProducts, loading: false })
        }catch(err){
            set({ loading: false })
            toast.error(err.response?.data?.msg || "An error occurred")
        }
    }

}))