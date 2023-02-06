const {UnauthenticatedError, UnauthorizedError} = require('../errors')
const {isTokenValid} = require('../utils')

const authenticateUser = async (req, res, next) => {
    
    const token = req.signedCookies.token
    if(!token) {
        throw new UnauthenticatedError('Authentication Invalid (no token present)')
    }
    
    try {
        const result = isTokenValid(token)
        req.user = {
            name: result.name,
            user: result.user,
            role: result.role
        }
        next()
    } catch (error) {
        throw new UnauthenticatedError('Authentication Invalid')
    }
}

const authorizePermissions = async (req, res, next) => {
    const role = req.user.role
    if(role !== 'admin') {
        throw new UnauthorizedError('Unauthorized to access this route')
    }
    next()
}

module.exports = {authenticateUser, authorizePermissions}