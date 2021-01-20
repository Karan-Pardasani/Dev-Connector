const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth.js');
const User = require('../../models/Users');
const { route } = require('./users.js');
const {check, validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')

// @route    GET api/auth
// @desc     Test Route
//@access    Public
// auth is the middleware which is a function that is called before the callback function of 
// router.get is called
console.log(auth)
console.log(User)
router.get('/', auth,  async (req, res) => {
    try{
        // -password will remove the password from User.findById(req.user.id) since we dont want 
        // to send password
        
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)
        // res.send('Auth Route')
    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @route    POST api/auth
// @desc     Authenticate User and get token
// @access    Public
router.post('/',
    [
        check('email','Please include a valid email').isEmail(),
        check('password',
            'Password is required').exists()
    ],
    async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    const { email, password} = req.body;
    try{

        let user = await User.findOne({email: email});
        if(!user){
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] })
        }
         
        const payload = {
            user:{
                id: user.id
            }
        }

        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            {expiresIn: 360000},
            (err, token) => {
                if(err) throw err;
                return res.json({ token });
            });
        console.log(req.body)

    }catch(err){
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router;