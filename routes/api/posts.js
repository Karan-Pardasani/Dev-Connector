const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator')
const User = require('../../models/Users')
const Post = require('../../models/Post')
const Profile = require('../../models/Profile')

// @route    POST api/posts
// @desc     Create a post
//@access    Private
router.post('/',[
    auth,
    check('text',"Text is required").not().isEmpty()
],async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    try{
        const user = await User.findById(req.user.id).select('-password')
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        const post = await newPost.save()

        return res.json({post})
    }catch(err){
        console.error(err);
        return res.status(500).send('Server Error');
    }

});


// @route    GET api/posts
// @desc     Get all posts
// @access   Private

router.get('/',[auth], async (req,res)=>{
    try{

        const posts = await Post.find().sort({ date: -1 });
        return res.json(posts)
    }catch(err){
        console.error(err)
        res.status(500).send('Server 500')
    }
});


// @route    GET api/posts/:id
// @desc     Get posts by id
// @access   Private

router.get('/:id',[auth], async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(404).json({"msg": 'Post Not Found.'});
        }
        return res.json(post)
    }catch(err){
        
        if(err.kind === 'ObjectId'){
            return res.status(404).json({"msg": 'Post Not Found.'});
        }

        console.error(err)
        res.status(500).send('Server 500')
    }
});


// @route    DELETE api/posts/:id
// @desc     Delete posts by id
// @access   Private

router.delete('/:id',[auth], async (req,res)=>{
    try{
        const post = await Post.findById(req.params.id);


        if(!post){
            return res.status(404).json({"msg": 'Post Not Found.'});
        }


        // Check on the user
        if(post.user.toString() != req.user.id){
            return res.status(401).json({ msg: 'User not authorised' });
        }

        await post.remove()
        return res.json({ msg: "Post removed" })
    }catch(err){
        
        if(err.kind === 'ObjectId'){
            return res.status(404).json({"msg": 'Post Not Found.'});
        }

        console.error(err)
        res.status(500).send('Server 500')
    }
});



// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private

router.put('/like/:id',[auth],async (req,res)=>{
    try {
        
        const post = await Post.findById(req.params.id);
        //Check if user has already been liked
        if( post.likes.filter(like => like.user.toString() === req.user.id ).length > 0 ){
            return res.status(400).json({ msg: "Post already liked." })
        }
        post.likes.unshift({ user: req.user.id });
        await post.save()
        return res.json(post.likes);

    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error')
    }
});


// @route    PUT api/posts/unlike/:id
// @desc     UnLike a post
// @access   Private

router.put('/unlike/:id',[auth],async (req,res)=>{
    try {
        
        const post = await Post.findById(req.params.id);
        //Check if user has already been liked
        if( post.likes.filter(like => like.user.toString() === req.user.id ).length === 0 ){
            return res.status(400).json({ msg: "Post has not yet been liked." })
        }
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)
        post.likes.splice(removeIndex,1);

        await post.save()
        return res.json(post.likes);

    } catch (err) {
        console.log(err);
        res.status(500).send('Server Error')
    }
});


// @route    POST api/posts/comment/:id
// @desc     Comment on a post
//@access    Private
router.post('/comment/:id',[
    auth,
    check('text',"Text is required").not().isEmpty()
],async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }

    try{
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
        post.comments.unshift(newComment)
        await post.save()

        return res.json(post.comments)
    }catch(err){
        console.error(err);
        return res.status(500).send('Server Error');
    }

});

// @route    Delete api/posts/comment/:id/:comment_id
// @desc     Delete a comment
// @access    Private
router.delete('/comment/:id/:comment_id',[auth],async (req,res)=>{
    try {
        
        const post = await Post.findById(req.params.id)

        //Pull out comment
        const comment = post.comments.find( comment => comment.id === req.params.comment_id );

        //Make sure comment exists
        if(!comment){
            return res.status(404).json({ msg: "Comment does not exist." })
        }

        //Check user

        if( comment.user.toString() !==  req.user.id ){
            return res.status(401).json({ msg: "User not authorised." })
        }

        const removeIndex = post.comments.map( comment => comment.user.toString() ).indexOf(req.user.id);

        post.comments.splice(removeIndex,1)
 
        await post.save()

        return res.json(post.comments)

    } catch (err) {
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg: "Comment does not exist." })
        }
        console.log(err);
        res.status(500).send('Server Error')
    }
})

module.exports = router;