const {StatusCodes} = require('http-status-codes')
const {BadRequestError, NotFoundError} = require('../errors')
const Product = require('../models/Product')
const Order = require('../models/Order')
const { checkPermissions } = require('../utils')

const getAllOrders = async (req, res) => {
    const orders = await Order.find({})
    res.status(StatusCodes.OK).json({orders, count: orders.length})
}

const getSingleOrder = async (req, res) => {
    const orderId = req.params.id
    const order = await Order.findOne({_id: orderId})
    if(!order) {
        throw new NotFoundError(`No order with id: ${orderId}`)
    }
    checkPermissions(req.user, order.user)
    res.status(StatusCodes.OK).json({order})
}

const getCurrentUserOrders = async (req, res) => {
    const userId = req.user.user
    const orders = await Order.find({user: userId})
    if(!orders) {
        throw new NotFoundError(`No orders exist for ${req.user.name}`)
    }
    res.status(StatusCodes.OK).json({orders, count: orders.length})
}

const fakeStripeApi = async ({amount, currency}) => {
    const client_secret = 'someRandomValue'
    return {client_secret, amount}
}

const createOrder = async (req, res) => {
    const {tax, shippingFee, items: cartItems} = req.body
    if(!cartItems || cartItems.length < 1){
        throw new BadRequestError('There are no items in cart')
    }
    if(!tax || !shippingFee) {
        throw new BadRequestError('Please provide tax and shipping fee')
    }
     
    let orderItems = []
    let subtotal = 0

    for(const item of cartItems){
        const dbProduct = await Product.findOne({_id: item.product})
        if(!dbProduct) {
            throw new NotFoundError(`No product with id: ${item.product}`)
        }
        const {name, price, image, _id} = dbProduct
        const singleOrderItem = {
            name,
            image,
            price,
            quantity: item.amount,
            product: _id
        }
        // add item to order
        orderItems = [...orderItems, singleOrderItem]
        // calculate subtotal
        subtotal = subtotal + (item.amount * dbProduct.price)
    }
    // calculate total
    const total = subtotal + tax + shippingFee
    // get client secret
    const paymentIntent = await fakeStripeApi({
        amount: total,
        currency: 'usd'
    })

    // create order
    const order = await Order.create({
        orderItems,
        subtotal,
        tax,
        shippingFee,
        total,
        clientSecret: paymentIntent.client_secret,
        user: req.user.user
    }) 

    res.status(StatusCodes.CREATED).json({order, clientSecret: order.clientSecret})

}

const updateOrder = async (req, res) => {
    const orderId = req.params.id
    const {paymentIntentId} = req.body

    const order = await Order.findOne({_id: orderId})
    if(!order) {
        throw new NotFoundError(`No order with id: ${orderId}`)
    }

    checkPermissions(req.user, order.user)

    order.paymentIntentId = paymentIntentId
    order.status = 'paid'
    await order.save()

    res.status(StatusCodes.OK).json({msg: 'Success! Order Updated', order})
}

module.exports = {
    getAllOrders,
    getSingleOrder,
    getCurrentUserOrders,
    createOrder,
    updateOrder
}