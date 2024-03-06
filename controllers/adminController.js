const userSchema = require('../model/userModels')
const productSchema = require('../model/productModel')
const paginationHelper=require('../helpers/paginationHelper')
const { contains } = require('jquery')

module.exports = {
    getAdminHome:async(req,res)=>{
        console.log("home")
        try{
            // const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date() - 14 * 24 * 60 * 60 * 1000;
            
            
            // const endDate=req.query.endDate || new Date()
            // const today=new Date();
            // today.setHours(0,0,0,0)
            // const yesterday=new Date(today)
            // yesterday.setDate(today.getDate()-1)
            // const now =new Date();
            // const currentYear = new Date().getFullYear();
            // const currentMonth=now.getMonth();
            // const currentMonthStartDate=new Date(currentYear,currentMonth,1,0,0,0)
            // const previousMonthStartDate=new Date(currentYear,currentMonth-1,1,0,0,0)
            // const previousMonthEndDate=new Date(currentYear,currentMonth,0,23,59,59)

            const promises=[
                productSchema.find({status:true}).count(),
                userSchema.find({isBlocked:false,isVerified:true,isAdmin:0}).count(),
                // dashboardHelper.currentMonthRevenue(currentMonthStartDate,now),
                // dashboardHelper.previousMonthRevenue(previousMonthStartDate,previousMonthEndDate),
                // dashboardHelper.paymentMethodAmount(),
                // dashboardHelper.todayIncome(today,now),
                // dashboardHelper.yesterdayIncome(today,yesterday),
                // dashboardHelper.totalRevenue(),
                // orderSchema.find({ orderStatus : "Confirmed" }).count(),
                // orderSchema.find({ orderStatus : "Delivered" }).count(),
                // dashboardHelper.dailyChart(startDate,endDate),
                // dashboardHelper.categorySales()
                
            ]
            const results=await Promise.all(promises)
            const productCount=results[0]
            const userCount=results[1]
            // const revenueCurrentMonth=results[2]
            // const revenuePreviousMonth=results[3]
            // const paymentMethodAmount=results[4]
            // const todayIncome=results[5]
            // const yesterdayIncome=results[6]
            // const  totalRevenue=results[7]
            // const ordersToShip=results[8]
            // const completedOrders=results[9]
            // const dailyChart=results[10]
            // const categorySales=results[11]
            
            
            // const razorPayAmount=paymentMethodAmount && paymentMethodAmount.length>0?paymentMethodAmount[0].amount.toString():0
            // const codPayAmount=paymentMethodAmount && paymentMethodAmount.length>0?paymentMethodAmount[1].amount.toString():0
            
            // const monthlyGrowth=revenuePreviousMonth===0?100:(((revenueCurrentMonth-revenuePreviousMonth)/revenuePreviousMonth)*100).toFixed(1);
            // const dailyGrowth = ((( todayIncome - yesterdayIncome ) / yesterdayIncome ) * 100).toFixed( 1 )  
            
            

            res.render('admin/dashboard',{
                admin : req.session.admin,
                todayIncome : 10000,
                dailyGrowth : 10,
                totalRevenue : 100000,
                revenueCurrentMonth : 1000,
                monthlyGrowth : 10000,
                razorPayAmount : 100,
                codPayAmount : 1000,
                userCount : userCount,
                ordersToShip : 1,
                completedOrders : 2,
                productCount : 8,
                           })
        }catch(error){
            console.error(error)
            res.redirect('/500')
        }
    },
    usersList : async(req,res)=>{
        try {
            const { search, sortData, sortOrder } = req.query;
        
            let page = Number(req.query.page);
            if (isNaN(page) || page < 1) {
                page = 1;
            }
        
            const condition = { isAdmin: 0 };
        
            const sort = {};
            if (sortData) {
                if (sortOrder === "Ascending") {
                    sort[sortData] = 1;
                } else {
                    sort[sortData] = -1;
                }
            }
        
            if (search) {
                condition.$or = [
                    { firstName: { $regex: search, $options: "i" } },
                    { lastName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { mobile: { $regex: search, $options: "i" } },
                ];
            }
        
            const userCount = await userSchema.countDocuments(condition);
            const userList = await userSchema.find(condition)
                .sort(sort)
                .skip((page - 1) * paginationHelper.USERS_PER_PAGE)
                .limit(paginationHelper.USERS_PER_PAGE);
        
            res.render('admin/userList', {
                userList: userList,
                admin: req.session.admin,
                currentPage: page,
                hasNextPage: page * paginationHelper.USERS_PER_PAGE < userCount,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(userCount / paginationHelper.USERS_PER_PAGE),
                search: search,
                sortData: sortData,
                sortOrder: sortOrder
            })    

        }catch(error){
            console.log(error);
        }
    },
    blockUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const userData = await userSchema.findByIdAndUpdate(userId);
            await userData.updateOne({ $set: { isBlocked: true } });
            res.redirect('/admin/userList'); 
        } catch (error) {
            console.log(error); 
        }
    },
    unblockUser : async(req,res) =>{
        try{
            const userId = req.params.id;
            const userData = await userSchema.findById(userId);
            await userData.updateOne({ $set: { isBlocked: false } });
            res.redirect('/admin/userList');
        }catch(error){
            console.log(error);
        }
    }
    
    
}