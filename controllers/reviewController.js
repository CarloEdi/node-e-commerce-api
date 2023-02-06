const {NotFoundError, BadRequestError} = require('../errors')
const {StatusCodes} = require('http-status-codes')
const Review = require('../models/Review')
const Product = require('../models/Product')
const {checkPermissions} = require('../utils')

const createReview = async (req, res) => {
    const {product: productId} = req.body
    const product = await Product.findOne({_id: productId})
    if(!product) {
        throw new NotFoundError(`No product with id: ${productId}`)
    }
    
    const alreadyCreatedReview = await Review.findOne({
        user: req.user.user, 
        product: productId
    })
    if(alreadyCreatedReview) {
        throw new BadRequestError('You already created a review for this product')
    }

    req.body.user = req.user.user
    const review = await Review.create(req.body)
    res.status(StatusCodes.CREATED).json({review})
}

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({}).populate({
        path: 'product',
        select: 'name company price'
    })
    .populate({
        path: 'user',
        select: 'name'
    })

    res.status(StatusCodes.OK).json({reviews, count: reviews.length})
}

const getSingleReview = async (req, res) => {
    const reviewId = req.params.id
    const review = await Review.findOne({_id: reviewId})
    .populate({
        path: 'product',
        select: 'name company price'
    })
    .populate({
        path: 'user',
        select: 'name'
    })
    
    if(!review) {
        throw new NotFoundError(`No review with id: ${reviewId}`)
    }

    res.status(StatusCodes.OK).json({review})
}

const updateReview = async (req, res) => {
    const {rating, title, comment} = req.body
    const reviewId = req.params.id
    const review = await Review.findOne({_id: reviewId})
    if(!review) {
        throw new NotFoundError(`No review with id: ${reviewId}`)
    }
    checkPermissions(req.user, review.user)
    review.rating = rating
    review.title = title
    review.comment = comment
    await review.save()
    res.status(StatusCodes.OK).json({msg: 'Success! Review Updated', review})
}

const deleteReview = async (req, res) => {
    const reviewId = req.params.id
    const review = await Review.findOne({_id: reviewId})
    if(!review) {
        throw new NotFoundError(`No review with id: ${reviewId}`)
    }
    
    checkPermissions(req.user, review.user)
    await review.remove()

    res.status(StatusCodes.OK).json({msg: 'Success! Review Deleted', review})
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview
}