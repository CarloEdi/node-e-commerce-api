const express = require('express')
const router = express.Router()

const {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
} = require('../controllers/productController')

const {authenticateUser, authorizePermissions} = require('../middleware/authentication')

router.route('/')
.post([authenticateUser, authorizePermissions], createProduct)
.get(getAllProducts)

router.route('/uploadImage')
.post(authenticateUser, authorizePermissions, uploadImage)

router.route('/:id')
.get(getSingleProduct)
.patch([authenticateUser, authorizePermissions], updateProduct)
.delete([authenticateUser, authorizePermissions], deleteProduct)


module.exports = router