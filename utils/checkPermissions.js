const {UnauthorizedError} = require('../errors')

const checkPermissions = (requestUser, resourceUserId) => {
    if(requestUser.role === 'admin') return
    if(requestUser.user === resourceUserId.toString()) return
    throw new UnauthorizedError('Not authorized to access this information')
}

module.exports = checkPermissions