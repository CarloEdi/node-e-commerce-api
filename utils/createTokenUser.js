const createTokenUser = (user) => {
    return {user: user._id, name: user.name, role: user.role}
}

module.exports = createTokenUser