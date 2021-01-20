const express = require('express');
const connectDB = require('./config/db')

const app = express();

//Connect Database
connectDB()

//Init Middleware
app.use(express.json({extended: false}))
app.get('/',(req,res)=>res.send('API Running'))

// Define Routes
app.use('/api/users',require('./routes/api/users'))
app.use('/api/auth',require('./routes/api/auth'))
app.use('/api/posts',require('./routes/api/posts'))
app.use('/api/profile',require('./routes/api/profile'))


const PORT = process.env.PORT || 5000;  //If PORT environment variable is not set, 
                                        //then 5000 PORT is set

app.listen(PORT, ()=>{console.log(`Server started on port ${PORT}`)});  //callback function is called 
                                                                        //when the server is up and running