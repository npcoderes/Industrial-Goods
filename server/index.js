const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 3000;
const sequelize = require('./config/sqldb');
const customerRoutes = require('./routes/customer');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const cors = require('cors');
const fileUpload = require("express-fileupload");
const {cloudinaryConnect } = require("./config/cloudinary");
const manageUserRoutes=require("./routes/manageuser")
const contactRoutes = require('./controllers/contact');
const reviewRoutes = require('./routes/review');


app.use(express.json());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
cloudinaryConnect();

app.get('/',(req,res)=>{
    res.send('Hello World');
})

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})


const startdb = async()=>{
    try{
        await sequelize.sync()
        console.log('Database Connected');

    }catch(err){
        console.log(err);
    }
}
app.use(cors(
    {
        origin: '*',
        methods: 'GET,POST,PUT,DELETE',
        allowedHeaders: 'Content-Type,Authorization'
    }
));


app.use('/api/customer',customerRoutes);
app.use('/api/auth',authRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/manageuser',manageUserRoutes);
app.use('/api/contact',contactRoutes);
app.use('/api/review',reviewRoutes);
startdb();

