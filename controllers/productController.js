const fs=require('fs')
const path=require('path')
const productSchema=require('../model/productModel')
const paginationHelper=require('../helpers/paginationHelper')
const categorySchema=require('../model/categoryModel')
const { error } = require('console')

const brandSchema=require('../model/brandModel')
// const Product = require(path.resolve(__dirname, '../models/productModel'));
module.exports={

    getAddProducts:async(req,res)=>{
        try{
            const categories=await categorySchema.find({status:true})
            const brands=await brandSchema.find({status:true})
            res.render('admin/add-products',{
                admin:req.session.admin,
                categories:categories,
                brands:brands
                
            })
        }catch(error){
            console.log(error);
        }
    },
    //Adding products 
    addProducts:async(req,res)=>{
        try{
            for(let file of req.files){
                if(
                    file.mimetype !== 'image/jpg'&&
                    file.mimetype !== 'image/jpeg' &&
                    file.mimetype !== 'image/png' &&
                    file.mimetype !== 'image/gif'
                ){
                    req.flash('err','Check the image format')
                    return res.redirect('/admin/add-products')
                }
            }
            const img=[]
           

            for(let file of req.files){
                img.push(file.filename)
                console.log(file.filename)
            }
            console.log(img)

            const product=new productSchema({
                name:req.body.name,
                description:req.body.description,
                brand:req.body.brandId,
                image:img,
                category:req.body.categoryId,
                quantity:req.body.quantity,
                price:req.body.price,
                discount:req.body.discount,
                rating:req.body.rating
            })
            await product.save();
            res.redirect('/admin/products')
        }catch(error){
            console.log(error);
        }
    },
    //Getting the current products
    getProductsList : async( req, res ) => {
        try {
            console.log("products")
            const { search, sortData, sortOrder } = req.query
            let page = Number(req.query.page);
            if (isNaN(page) || page < 1) {
            page = 1;
            }
            const sort = {}
            const condition = {}
            if( sortData ) {
                if( sortOrder === "Ascending" ){
                    sort[sortData] = 1
                } else {
                    sort[sortData] = -1
                }
            }
            if ( search ){
                condition.$or = [
                    { name : { $regex : search, $options : "i" }},
                    { brand : { $regex : search, $options : "i" }},
                    { description : { $regex : search, $options : "i" }},  
                ]
            }
            
            const productsCount = await productSchema.find( condition ).count()
            const products = await productSchema.find( condition ).populate( 'category' ).populate( 'offer' ).populate('brand')
            .sort( sort ).skip(( page - 1 ) * paginationHelper.PRODUCT_PER_PAGE ).limit( paginationHelper.PRODUCT_PER_PAGE )

            
            res.render('admin/products',{
                admin : req.session.admin,
                products : products,
                currentPage : page,
                hasNextPage : page * paginationHelper.PRODUCT_PER_PAGE < productsCount,
                hasPrevPage : page > 1,
                nextPage : page + 1,
                prevPage : page -1,
                lastPage : Math.ceil( productsCount / paginationHelper.PRODUCT_PER_PAGE ),
                search : search,
                sortData : sortData,
                sortOrder : sortOrder,
                
            })
        } catch ( error ) { 
            console.log(error);
        }

    },
    editProduct : async(req,res) =>{
        try{
            console.log('edit product')
            const product =  await productSchema.findOne({_id:req.params.id}).populate('brand').populate('category')
            const category = await categorySchema.find({status:true})
            const brands = await brandSchema.find({status:true})
            res.render('admin/edit-products',{
                product : product,
                category : category,
                admin : req.session.admin,
                brands : brands
            })
        }catch(error){
            console.log(error);
        }
    },
    posteditProduct : async(req,res) =>{
        try{
            console.log("posteditProduct")

            const existingProduct=await productSchema.findById(req.body.productId)
            if(req.files){
                for(let file of req.files){
                    if(
                        file.mimetype !== 'image/jpg' &&
                        file.mimetype !== 'image/jpeg' &&
                        file.mimetype !=='image/png'&&
                        file.mimetype !=='image/gif') {
                            req.flash('err','Check the format of Image')
                            return res.redirect(`/admin/edit-product/${existingProduct._id}`)
                        } 
                }
                const images =existingProduct.image
                req.files.forEach(element=>{
                    images.push(element.filename)
                });
                var img=images
            }
            console.log("categoryId",req.body.categoryId)
            console.log("brandId",req.body.brandId)
            console.log("discount",req.body.discount)
            console.log("rating",req.body.rating)


            await productSchema.updateOne({_id:req.body.productId},{
                $set:{
                    name:req.body.name,
                    description:req.body.description,
                    brand:req.body.brandId,
                    image:img,
                    category:req.body.categoryId,
                    quantity:req.body.quantity,
                    price:req.body.price,
                    discount:req.body.discount,
                    rating:req.body.rating
                }
            })
           
          // console.log('/admin/products')

            res.redirect('/admin/products')
          
        }catch(error){
            console.log(error);
        }
    },
    deleteProduct : async(req,res) =>{
        try{
            console.log("delete product")
            const existingProduct=await productSchema.findById(req.query.id)
            if(req.files){
                for(let file of req.files){
                    if(
                        file.mimetype !== 'image/jpg' &&
                        file.mimetype !== 'image/jpeg' &&
                        file.mimetype !=='image/png'&&
                        file.mimetype !=='image/gif') {
                            
                            return res.redirect(`/admin/edit-product/${existingProduct._id}`)
                        } 
                }
                const images =existingProduct.image
                req.files.forEach(element=>{
                    images.push(element.filename)
                });
                var img=images
            }
            console.log("update product")
            await productSchema.updateOne({_id:req.query.id},{
                $set:{
                    status:false
                }
            })
            console.log("/admin/products")
            res.redirect('/admin/products')

        }catch(error){

        }
    },
    //Deleting images of products
    deleteImage:async(req,res)=>{
    try{
        console.log("**************************************************************************deleteImage*****************")

        const id=req.query.id
        const image=req.query.imageId

        // const id=req.params.id
        // const image=req.params.imageId

        console.log(id)
        console.log(image)

        await productSchema.updateOne({_id:id},{$pull:{image:image}})

        var filename = path.join(__dirname,'../pub lic/images/product-images/')+image
        console.log(filename)

        fs.unlink( filename, (err)=>{
            if(err){
                console.error("insi fs unlink",err)
                //res.redirect('/500')
            }
        })

        res.redirect(`/admin/edit-product/${id}`)
    }catch(error){
        console.error("insi fs unlink",error)
        res.redirect('/500')
    }
},
//restore the product
restoreProduct:async(req,res)=>{
    try{
        console.log("restoreProduct")
        await productSchema.updateOne({_id:req.query.id},{
            $set:{
                status:true
            }
        })
        res.redirect('/admin/products')
    }catch(error){
        res.redirect('/500')
    }
}

    
}