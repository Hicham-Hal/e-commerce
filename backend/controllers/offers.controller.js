export const getFirstOffer = async(req, res) => {
    const {id} = req.params
    const user = req.user;
    
    try{
        if(!user) return res.status(404).json({ msg: 'Unauthorized - no access token valid' })
        user.pack = 'first'
    }catch(err){
        console.log('Error from getFirstOffer function', err.message)
        res.status(500).json({ msg: err.message })
    }
}