const jwt = require('jsonwebtoken')
const config = require('config')


module.exports = function(req, res, next){
    // Get the token from the header
    const token = req.header('x-auth-token');
    console.log('In auth middleware')
    //Check if not token
    if(!token){
        return res.status(401).json({ msg: "No token, authorization denied" })
    }
    //Verify Token

    try{
        console.log(token)
        const decoded =  jwt.verify(token, config.get('jwtSecret'))
        console.log(decoded)
        req.user = decoded.user;
        console.log(req.user)
        next();
    }catch(err){
        res.status(401).json({ msg: 'Token is not valid' })
    }
}

