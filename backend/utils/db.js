import mongoose from "mongoose";

const dbConnection = async() => {
    try{
        mongoose.connect(process.env.MONGO_URI)
        .then(res => {
            console.log('connected')
        })
        .catch(err => {
            console.log(err)
        })
    }catch(err){
        console.log(err)
    }
}

export default dbConnection