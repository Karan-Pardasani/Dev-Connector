const express = require('express');
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const router = express.Router();
const {check, validationResult} = require('express-validator')

//load Users model
const User = require('../../models/Users')

// @route    POST api/users
// @desc     Register User
//@access    Public
router.post('/',
    [
        // Middleware to check whether request contains "name" field
        check('name','Name is required').not().isEmpty(),
        // Middleware to check whether request contains valid "email" field
        check('email','Please include a valid email').isEmail(),
        // Middleware to check whether request contains "password" field 
        // with atleast 6 characters
        check('password',
            'Please enter a password with 6 or more characters').isLength({min: 6})
    ],
    async (req, res) => {
        // To get the list of errors that were added in request during validation check
        // in the middleware functions.
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() })
        }
        const {name, email, password} = req.body;
        try{
            //See if user exist
            let user = await User.findOne({email: email});
            if(user){
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
            }
            //Get users gravatar
            const avatar = gravatar.url(email,{
                s: '200',
                r: 'pg',
                d: 'mm'
            })

            user = new User({
                name,
                email,
                avatar,
                password
            });

            //Encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save()

            //Return json webtoken
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
            // res.send('User Registered')
        }catch(err){
            console.log(err.message)
            res.status(500).send('Server Error')
        }
        
})

module.exports = router;