const express = require('express');

const app = express();


app.get('/',(req,res)=>res.send('API Running'))
const PORT = process.env.PORT || 5000;  //If PORT environment variable is not set, 
                                        //then 5000 PORT is set

app.listen(PORT, ()=>{console.log(`Server started on port ${PORT}`)});  //callback function is called 
                                                                        //when the server is up and running