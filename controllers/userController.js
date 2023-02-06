const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors')
const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const {attachCookiesToResponce, createTokenUser, checkPermissions} = require('../utils')

const getAllUsers = async (req, res) => {
    console.log(req.user)
    const users = await User.find({role: "user"}).select('-password')
    res.status(StatusCodes.OK).json({users})
}

const getSingleUser = async (req, res) => {
    const userId = req.params.id
    const user = await User.findById(userId).select('-password')
    if(!user) {
        throw new NotFoundError(`No user found with id: ${userId}`)
    }
    checkPermissions(req.user, user._id)
    res.status(StatusCodes.OK).json({user})
}

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json(req.user)
}

const updateUser = async (req, res) => {
    const {name, email} = req.body
    if(!name || !email) {
        throw new BadRequestError('Please provide values for all fields')
    }
    const user = await User.findOneAndUpdate({_id: req.user.user}, {name: name, email: email}, {new: true, runValidators: true})
    const tokenUser = createTokenUser(user)
    attachCookiesToResponce(res, tokenUser)
    res.status(StatusCodes.OK).json({user: tokenUser})
}

const updateUserPassword = async (req, res) => {
    const oldPassword = req.body.oldPassword
    const newPassword = req.body.newPassword
    if(!oldPassword || !newPassword) {
        throw new BadRequestError('Please provide old password and new password')
    }
    const user = await User.findById(req.user.user)
    
    const isPasswordCorrect = await user.comparePassword(oldPassword)
    if(!isPasswordCorrect) {
        throw new UnauthenticatedError('old password does not match')
    }
    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({msg:'Success! Password Updated'})
}

module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword
}