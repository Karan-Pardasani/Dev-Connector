const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');

const connectDB  = async () => {
    try{
        await mongoose.connect(db,
            {   useNewUrlParser: true, 
                useUnifiedTopology:true,
                useCreateIndex: true
            })
        console.log("MongoDB connected")
    }catch(err){
        console.error(err.message)
        process.exit(1) //Exit process with failure
    }
}

module.exports = connectDB