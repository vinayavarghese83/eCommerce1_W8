const bcrypt = require('bcrypt')
const userSchema = require('../model/userModels')
const adminSchema = require('../model/adminSchema')
const verificationController = require('../controllers/verificationController')


module.exports={
    getHome:async(req,res)=>{
            try{
                res.render('shop/home')
            }catch(error){
                console.log(error)
            }
    },
    getUserLogin:async(req,res)=>{
        try{
            res.render('auth/userLogin')
        }catch(error){
            console.log(error)
        }
    },
    // userLogin: async (req,res)=>{
    //     res.render('shop/home')
    // },
    userLogin: async (req, res) => {
        try {
            // Find the user by email
            const userData = await userSchema.findOne({ email: req.body.email });
    
            // Check if user exists and is not an admin
            if (userData && userData.isAdmin !== 1) {
                // Check if the user is not blocked
                if (userData.isBlocked === false) {
                    console.log("User Active")
                    // Compare passwords
                    const passwordMatch = await bcrypt.compare(req.body.password, userData.password);
                    if (passwordMatch) {
                        // Passwords match, render home page
                        res.render('shop/home');
                    } else {
                        // Incorrect password
                        
                        res.redirect('/login');
                    }
                } else {
                    // User is blocked
                    console.error("User Blocked")
                    req.flash('userBlocked',"User Blocked")
                    res.redirect('/login');
                }
            } else {
               
               
                res.redirect('/login');
            }
        } catch (error) {
            console.log(error);
            
        }
    },
    
    
    usersignUp : async(req,res)=>{
        try{
            res.render('auth/userSignup')
        }catch(error){
            console.log(error);
        }
    },
    postuserSignup :  async(req,res)=>{
        try{

                    // if(Number(req.body.mobile) <=0 )
                    // {
                    //     console.log("Wrong mobile format");
                    //     req.flash('FormatErr',"Wrong format - Mobile")
                    //     return res.redirect('/usersignup')
                    // }

            //checking if there any existing user in the site
            const userData = await userSchema.findOne({email:req.body.email})

            //if user exist
            if(userData){
                req.flash('userExist',"User Already Exist..............")
                return res.redirect('/usersignup')
            }
            else{
                // if(isNaN(req.body.mobile))
                // {
                //     if(Number(req.body.mobile) <=0 )
                //     {
                //         console.log("Wrong mobile format");
                //         req.flash('FormatErr',"Wrong format - Mobile")
                //         return res.redirect('/signup')
                //     }
                // }
                const otp = verificationController.sendMail(req.body.email)
                const password = await bcrypt.hash(req.body.password,12)

                
                const user = new userSchema({
                    firstName : req.body.firstName,
                    lastName : req.body.lastName,
                    email : req.body.email,
                    isAdmin: 0,
                    mobile : req.body.mobile,
                    password : password,
                    token :{
                        otp : otp,
                        generatedTime : new Date()
                    }
                })
                    await user.save()
                    req.session.unVerifiedMail=req.body.email
                    res.redirect('/otp-verification')
            }
        }catch(error){
            console.log(error);
        }
    },

    // otp verification page
    getotpVerification :(req,res)=>{
        res.render('auth/signup-otp')

    },
    //signup verification
    signupVerification : async(req,res)=>{
        try{
            
            const entertime = new Date()
            let {val1,val2,val3,val4,val5,val6} = req.body
            userotp = val1 + val2 + val3 + val4 + val5 + val6
            console.log(userotp);
            //checking otp in database
            const otpCheck = await userSchema.findOne({email : req.session.unVerifiedMail,'token.otp' :userotp})
            
            if(otpCheck){
                //calculating the expire of otp 
                const timeDiff=(new Date(entertime)-otpCheck.token.generatedTime)/1000/60
                
                if(timeDiff <= 1){
                    await userSchema.updateOne({email:otpCheck.email},{$set:{    
                    isVerified : true
                    }})
                }
                req.session.user = otpCheck._id;
                req.session.unVerfiedMail = null
                        req.session.user = otpCheck._id
                        res.redirect('/shop')
                
            }else{
                res.redirect('/otp-verification')
            }

        }catch(error){
            console.log(error);
        }
    },

    //resending otp
    resendOtp : async(req,res)=>{
        try{
            let email = req.session.unVerifiedMail
            const otp = verificationController.sendMail(email)
            await userSchema.updateOne({email:email},{$set:{
                token : {
                    otp : otp ,
                    generatedTime : new Date()
                }
            }})
        }catch(error){
            console.log(error);
        }
    },
    forgotresendOtp : async(req,res)=>{
        try{
            let email = req.session.unVerifiedMail
            const otp = verificationController.sendMail(email)
            await userSchema.updateOne({email: email},{$set:{
                token :{
                    otp : otp,
                    generatedTime : new Date()
                }
            }})
        }catch(error){
            console.log(error);
        }
    },
    doUserLogout:(req,res)=>{
        try{
            req.session.user=null
            req.session.productCount=0;
            res.redirect('/login')
        }catch(error){
            res.redirect('/500')
            console.log(error)
        }
    },
    doAdminLogout:(req,res)=>{
        try{
            req.session.destroy()
            
            req.session.admin=null
            req.session.user=null
            req.session.productCount=0;
            res.redirect('/adminsign')
        }catch(error){
            res.redirect('/500')
            console.log(error)
        }
    },
    adminsignUp : async(req,res)=>{
        try{
            res.render('auth/adminLogin')
        }catch(error){
            console.log(error);
        }
    },
    postadminlogin : async(req,res)=>{
        try{

            // const adminData = await adminSchema.findOne({email:req.body.email})
            // if(adminData && adminData.isAdmin == 1){
            //     const password = await bcrypt.compare(req.body.password,adminData.password)
            //     if(password){
            //         req.session.admin = adminData._id
            //         res.redirect('/admin/dashboard')
            //     }else{
            //         res.render('auth/adminLogin',{
            //             err : "Incorrect Password"
            //         })
            //     }
            // }else{
            //     res.render('auth/adminLogin',{
            //         err : 'Incorrect Email'
            //     })
            // }



            const values = {
                email : "admin@gmail.com",
                password : 12345
            }
            if(req.body.email== values.email && req.body.password == values.password){
                req.session.admin=req.body.email;
                res.render('admin/dashboard')
                
            }
        }catch(error){
            console.log(error);
        }
    },
    forgotpassword : async(req,res)=>{
        res.render('auth/forgot-password')
    },
    postforgotpassword : async(req,res)=>{

        try{
            const emailExist = await userSchema.findOne({email:req.body.email})
            if(emailExist){
                const newOtp = verificationController.sendMail(req.body.email,req.body.lastname)
                await userSchema.updateOne(
                    { email: req.body.email },
                    {
                        $set: {
                            'token.otp': newOtp,
                            'token.generatedTime': new Date()
                        }
                    }
                )
                req.session.unVerifiedMail = req.body.email
                res.render('/auth/forgot-password-otp')
            }else{
                res.redirect('/forgot-password')
            }
        }catch(error){
            console.log(error);
        }
        
    }
}