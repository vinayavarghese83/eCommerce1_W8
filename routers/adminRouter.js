const express=require('express')
const router=express.Router()

const multer = require('multer')
const upload_image = require('../middleware/multer.js')

const adminController = require('../controllers/adminController.js')
const authController=require('../controllers/authController.js')
const productController = require('../controllers/productController.js')
const isAuth = require('../middleware/isAuth.js')
const categoryContoller = require('../controllers/categoryContoller.js')
const brandController = require('../controllers/brandController.js')


router.get('/user-list',isAuth.adminAuth,adminController.usersList)
router.patch('/block-user/:id',isAuth.adminAuth,adminController.blockUser)
router.patch('/unblock-user/:id',isAuth.adminAuth,adminController.unblockUser)

// router.get('/products',isAuth.adminAuth,productController.getAddProducts)
// router.post('/add-products',isAuth.adminAuth,upload_image.array('image',4), productController.postAddProducts)
// router.get('/products',isAuth.adminAuth,productController.getProductsList)
// router.get('/dashboard',isAuth.adminAuth,productController.)
router.get('/',isAuth.adminAuth,adminController.getAdminHome)

router.get('/products',isAuth.adminAuth,productController.getProductsList)
router.get('/add-products',isAuth.adminAuth,productController.getAddProducts)
router.post('/add-products',isAuth.adminAuth,upload_image.array('image',4),productController.addProducts)
router.get('/edit-product/:id',isAuth.adminAuth,productController.editProduct),
router.post('/edit-product',isAuth.adminAuth,upload_image.array('image',4),productController.posteditProduct)
router.get('/delete-product',isAuth.adminAuth,productController.deleteProduct)
router.get('/restore-product',isAuth.adminAuth,productController.restoreProduct)
router.get('/delete-image',isAuth.adminAuth,productController.deleteImage)


// http://localhost:3003/delete-image?id=65e1751679e7ccf12c740f4e&imageId=1709278035032_undefined
//router.get('/delete-product/:id',isAuth.adminAuth,productController.deleteProduct)
// router.get('/restore-product/:id',isAuth.adminAuth,productController.restoreProduct)


router.get('/category',isAuth.adminAuth,categoryContoller.getCategory)
router.post('/add-category',isAuth.adminAuth,categoryContoller.addCategory)
router.get('/edit-category/:id',isAuth.adminAuth,categoryContoller.geteditCategory)
router.post('/edit-category',isAuth.adminAuth,categoryContoller.editCategory)
// router.get('/list-category/:id',isAuth.adminAuth,categoryContoller.listCategory)
// router.get('/unlist-category/:id',isAuth.adminAuth,categoryContoller.unlistCategory)
// router.get('/delete-category',isAuth.adminAuth,categoryContoller.deleteCategory)

// router.get('/list-category/:id',isAuth.adminAuth,categoryContoller.listCategory)
// router.get('/unlist-category/:id',isAuth.adminAuth,categoryContoller.unlistCategory)


router.get('/list-category',isAuth.adminAuth,categoryContoller.listCategory)
router.get('/unlist-category',isAuth.adminAuth,categoryContoller.unlistCategory)

router.get('/delete-category/:id',isAuth.adminAuth,categoryContoller.deleteCategory)

router.get('/brand',isAuth.adminAuth,brandController.getaddBrand)
router.post('/add-brand',isAuth.adminAuth,brandController.addBrand)
router.get('/edit-brand/:id',isAuth.adminAuth,brandController.geteditBrand)
router.post('/edit-brand',isAuth.adminAuth,brandController.editBrand)
router.get('/list-brand/:id',isAuth.adminAuth,brandController.listBrand)
router.get('/unlist-brand/:id',isAuth.adminAuth,brandController.unlistBrand)

module.exports = router