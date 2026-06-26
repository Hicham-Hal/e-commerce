import Product from "../models/product.model.js"
import cloudinary from "../utils/cloudinary.js"
import { redis } from "../utils/redis.js"

export const allProducts = async(req, res) => {
    try{
        const products = await Product.find({})
        if(!products) return res.status(404).json({ msg: 'error fetching' })
        res.status(200).json({ products, msg: 'products fetched successfully' })
    }catch(err){
        res.status(500).json({ msg: err.message })
    }
}

export const featuredProducts = async(req, res) => {
    try{
        let featuredProducts = await redis.get('featured_products')
        const featuredProductsData = await Product.find({ isFeatured:true }).lean()
        if(JSON.parse(featuredProducts) === featuredProductsData){
            return res.json(JSON.parse(featuredProducts))
        }
        //.lean() is gonna return a plain javaScript object instead of a mongodb document
        // which is good for performance
        featuredProducts = featuredProductsData;
        if(!featuredProducts){
            return res.status(404).json({ message: 'No featured products found' })
        }
        
        await redis.set('featured_products', JSON.stringify(featuredProducts))
        res.status(201).json({featuredProducts});
    }catch(err){
        res.status(500).json({ msg: err.message })
    }
}

export const addProduct = async(req, res) => {
    const { name, description, price, image, category, isFeatured } = req.body

    try{
        let cloudinaryResponse;

        if(image){
            cloudinaryResponse = await cloudinary.uploader.upload(image, {folder: 'products'})
        }
        const newProduct = new Product({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse?.secure_url : '',
            category,
            isFeatured
        })
        newProduct.save()

        res.status(201).json(newProduct)
    }catch(err){
        console.log('error at addProduct function', err)
        res.status(500).json({ msg: err })
    }
}

export const deleteProduct = async(req, res) => {
    const {id} = req.params;
    try{
        const product = await Product.findById(id)
        if(!product) return res.status(404).json({ msg: 'Product not founded' })
        if(product.image){
            const publicId = product.image.split('/').pop().split('.')[0]
            try{
                await cloudinary.uploader.destroy(`products/${publicId}`)
                console.log('deleted image from cloudinary')
            }catch(err){
                console.log('Error deleting image from cloudinary', err)
            }
        }
        await Product.findByIdAndDelete(id);
        res.status(200).json({ msg: `${product.name} ${product.category} has been deleted successfully` })
    }catch(err){
        console.log('Error at deleteProduct function', err.message)
        res.status(500).json({ msg: err.message })
    }
}

export const recommendations = async(req, res) => {
    try{
        const products = await Product.aggregate([
            {
                $sample: {size:3}
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    description:1,
                    image:1,
                    price:1
                }
            }
        ])
        res.status(200).json(products)
    }catch(err){
        console.log('Error at recommendation function', err)
        res.status(500).json({ msg: err.message })
    }
}

export const getCatProducts = async(req, res) => {
    const {cat} = req.params
    try{
        const products = await Product.find({ category: cat })
        if(!products) return res.status(404).json({ msg: `No products in ${cat} category founded` })
        res.status(200).json({products})
    }catch(err){
        console.log('Error from getCatProducts function', err.message)
        res.status(500).json({ msg: err.message })
    }
}

export const toggleFeatured = async(req, res) => {
    const {id} = req.params;
    try{
        const product = await Product.findById(id)
        if(!product) return res.status(404).json({ msg: 'product not founded' })
        product.isFeatured = !product.isFeatured
        const updatedProduct = await product.save()
        await updateFeaturedProductCache(updatedProduct)
        res.status(201).json({ msg: 'toggled', updatedProduct})
    }catch(err){
        console.log('Error from toggleFeatured function', err.message)
        res.status(500).json({ msg: err.message })
    }
}

const updateFeaturedProductCache = async() => {
    try{
        const featuredProducts = await Product.find({ isFeatured: true }).lean()
        await redis.set('featured_products', JSON.stringify(featuredProducts))
    }catch(err){
        console.log('Error from updateFeaturedProductCache function', err)
    }
}