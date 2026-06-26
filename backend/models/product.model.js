import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"]
        },
        description: {
            type: String,
        },
        price: {
            type: Number,
            required: [true, 'Price is required']
        },
        image: {
            type: String,
            required: [false, "Image is required"]
        },
        category: {
            type: String,
            required: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        }
    },
    {
        timestamps: true
    }
)

const Product = mongoose.model('product', productSchema)

export default Product