import Order from "../models/order.model.js"
import Product from "../models/product.model.js"
import User from "../models/user.model.js"

export const getAnalyticsData = async() => {
    const totalUsers = await User.countDocuments()
    const totalProducts = await Product.countDocuments()

    const salesData = await Order.aggregate([
        {
            $group: {
                _id: null, //it groups all documents together
                totalSales: {$sum:1},
                totalRevenue: {$sum: "$totalAmount"}
            }
        }
    ])

    const {totalSales, totalRevenue} = salesData[0] || {totalSales: 0, totalRevenue: 0}

    return {
        users: totalUsers,
        products: totalProducts,
        totalSales,
        totalRevenue
    }
}

export const getDailySalesData = async(startDate, endDate) => {
    try{

        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    },
                },
            },
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$createdAt"}},
                    sales: {$sum: 1},
                    revenue: {$sum: "$totalAmount"}
                },
            },
            { $sort: {_id: 1} }
        ])

        // example of dailySalesData
		// [
		// 	{
		// 		_id: "2024-08-18",
		// 		sales: 12,
		// 		revenue: 1450.75
		// 	},
		// ]


        const dateArray = await getDateInRange(startDate, endDate);

        return dateArray.map(date => {
            const foundDate = dailySalesData.find(item => item._id === date)

            return {
                date,
                sales: foundDate?.sales || 0,
                revenue: foundDate?.revenue || 0,
            }
        })


    }catch(err){
        throw err
    }
}



async function getDateInRange(start, end){
    const dates = []
    let currentDate = new Date(start)

    while (currentDate <= end) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1)
    }

    return dates;
}