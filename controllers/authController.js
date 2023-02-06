const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const { 
    CustomAPIError,
    UnauthenticatedError,
    NotFoundError,
    BadRequestError,} = require('../errors')
const jwt = require('jsonwebtoken')    
const {attachCookiesToResponce, createTokenUser} = require('../utils')

const registerController = async (req, res) => {
    const {name, email, password} = req.body
   
    const emailNotUnique = await User.findOne({email})
    if(emailNotUnique) {
        throw new BadRequestError('Email already exists')
    }

    const user = await User.create({name,email,password})
    const tokenUser = createTokenUser(user)
    attachCookiesToResponce(res, tokenUser)

    res.status(StatusCodes.CREATED).json({user: tokenUser})
}

const loginController = async (req, res) => {
    const {email, password} = req.body
    if(!email || !password) {
        throw new BadRequestError('Please provide email and password')
    }
    const user = await User.findOne({email: email})
    if(!user){
        throw new UnauthenticatedError('Invalid credentials')
    }
    const isPasswordCorrect = await user.comparePassword(password)
    if(!isPasswordCorrect) {
    throw new UnauthenticatedError('Incorrect Password')
}

const userToken = createTokenUser(user)
attachCookiesToResponce(res, userToken)
    res.status(StatusCodes.OK).json({user: userToken})
}

const logoutController = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })
    res.status(StatusCodes.OK).json({msg: 'user logged out'})
}

module.exports = {registerController, loginController, logoutController}