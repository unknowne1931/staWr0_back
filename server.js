const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const { hash } = require('crypto');
const authMiddleware = require('./module/authmidle');
const adminMidleware = require('./module/adminMidle');
const adminMiddleware = require('./module/adminMidle');
const { type } = require('os');


const app = express();
app.use(express.static('public'))
// app.use(express.json());
app.use(bodyParser.json());

app.use(cors({
    origin: ["http://localhost:3000", "http://192.168.33.78:3000", "http://localhost:3000", "https://www.stawro.com", "https://stawro.com"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
// app.use(cors({
//     origin: '*', // Allow any origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true
// }));


const Time = new Date().toLocaleString();
// MongoDB connection
// const mongoURI = "mongodb+srv://kick:kick@daa.0jeu1rr.mongodb.net/?retryWrites=true&w=majority&appName=DAA"
// const mongoURI = "mongodb+srv://durgansathleticsacademy:ysKUdccnJ5Q94ihU@as.tlrlypo.mongodb.net/?retryWrites=true&w=majority&appName=AS";
const mongoURI = "mongodb+srv://instasecur24:kick@flutterdata.cgalmbt.mongodb.net/?retryWrites=true&w=majority&appName=flutterdata"
mongoose.connect(mongoURI,)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

const UsersSchema = new mongoose.Schema({
      
    Time : String,
    pass : String,
    email : String,
    username : String,
    name : String,

  });
  
const Usermodule = mongoose.model('Pass', UsersSchema);


let transporter = nodemailer.createTransport({
    service: 'gmail', // You can use any email service
    auth: {
        user: 'stawropuzzle@gmail.com',
        pass: 'osrz jhwt tcqx zeyf' // Be careful with your email password
    }
  });
  


//signup datas
app.post('/post/new/user/data', async (req, res) =>{
    const {pass, email, username, name} = req.body;
    try{
        const user = await Usermodule.findOne({email})
        const user1 = await Usermodule.findOne({username});
        if(email.includes("@gmail.com")){
            if(user){
                return res.status(202).json({Status : "IN"})
            }else if(!user){
                if(!user1){
                    bcrypt.hash(pass, 10)
                    .then(hash=>{
                        Usermodule.create({pass : hash, email, username, name, Time})
                        let mailOptions = {
                            from: 'stawropuzzle@gmail.com', // Sender address
                            to: `${email}`, // List of recipients
                            subject: `Congratulations, your account has been successfully created on staWro.`, // Subject line
                            text: '', // Plain text body
                            html: `
                            
                            <html lang="en">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <meta http-equiv="refresh" content="30" />
                                    <title>Document</title>
                                    <style>
                    
                                        @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;700&display=swap');
                    
                    
                                        .email-main-cnt-01{
                                            width: 95%;
                                            justify-content: center;
                                            margin: auto;
                                        }
                    
                                        .email-cnt-01{
                                            width: 90%;
                                            height: auto;
                                            display: flex;
                                            margin: 10px;
                                        }
                    
                                        .email-cnt-01 div{
                                            width: 50px;
                                            height: 50px;
                                            overflow: hidden;
                                            border-radius: 50%;
                                            border: 1px solid;
                                            
                                        }
                    
                                        .email-cnt-01 div img{
                                            width: 100%;
                                            height: 100%;
                                            object-fit: cover;
                                        }
                    
                                        .email-cnt-01 strong{
                                            font-family: Inknut Antiqua;
                                            margin-left: 10px;
                                        }
                    
                                        .email-cnt-btn-01{
                                            width: 120px;
                                            height: 30px;
                                            margin: 10px;
                                            color: aliceblue;
                                            background-color: rgb(5, 148, 195);
                                            border: 1px solid;
                                            border-radius: 5px;
                                            cursor: pointer;
                                        }
                    
                    
                                    </style>
                                </head>
                                <body>
                                    <div class="email-main-cnt-01">
                                        <div class="email-cnt-01">
                                            <strong>staWro</strong>
                                        </div>
                                        <div class="email-cnt-02">
                                            <span>Hello, Dear <strong>${username}</strong> </span><br/>
                                            <p>Welcome to staWro.<br/>
                                            Your account has been successfully created at staWro.
                                             You can go through the website login page by clicking
                                             on the "Login" text.</p><br/>
                                                <a href = "http://localhost:3000/" style="text-decoration: none;">Login</a>
                                            <strong></strong><br/>
                                 
                                            <strong>Thank you</strong>
                    
                                        </div>
                                    </div>
                                    
                                </body>
                                </html>
                    
                            ` // HTML body
                          };
                          
                          // Send email
                          transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                console.log(error);
                                return res.status(202).json({message : "Something went Wrong"})
                            }
                          
                            return res.status(200).json({Status : "OK"})
                          });
                        
                    })
                }else{
                    return res.status(202).json({Status : "UIN"})
                }
            }else{
                return res.status(202).json({Status : "BAD"});
            }
        }else{
            return res.status(202).json({Status : "BAD_EML"});
        }
        
    }catch(error){
        console.log(error)
        return res.status(500).json("message" )
    }
})


//login and token

app.post('/login/data', async (req, res) => {
    const { data, pass } = req.body;
    try {
        // Check if the data is an email or username
        // Find user by email or username
        const user = await Usermodule.findOne({
            $or: [{ username: data.trim() }, { email: data.trim() }]
          });
        if (user) {
            bcrypt.compare(pass, user.pass, (err, response) => {
                if (response) {
                    const token = jwt.sign({ id : user._id }, "kanna_staWro_founders_withhh_1931_liketha", { expiresIn: "365d" });
                    res.json({ Status: "OK", token, user : user._id , username : user.username});
                } else {
                    return res.json({ Status: "BAD" });
                }
            });
        } else {
            return res.status(202).json({ Status: "NO" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/pass/send/requests", async (req, res) =>{
    const {data} = req.body;
    try{
        const user = await Usermodule.findOne({
            $or: [{ username: data.trim() }, { email: data.trim() }]
        });

        if(user){
            const token = jwt.sign({ id: user._id }, "kanna_staWro_founders_withhh_1931_liketha_pass-worff", { expiresIn: "1h" });
            let mailOptions = {
                from: 'stawropuzzle@gmail.com', // Sender address
                to: `${user.email}`, // List of recipients
                subject: `staWro, Change Password`, // Subject line
                text: '', // Plain text body
                html: `
                
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="refresh" content="30" />
                        <title>Document</title>
                        <style>
        
                            @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;700&display=swap');
        
        
                            .email-main-cnt-01{
                                width: 95%;
                                justify-content: center;
                                margin: auto;
                            }
        
                            .email-cnt-01{
                                width: 90%;
                                height: auto;
                                display: flex;
                                margin: 10px;
                            }
        
                            .email-cnt-01 div{
                                width: 50px;
                                height: 50px;
                                overflow: hidden;
                                border-radius: 50%;
                                border: 1px solid;
                                
                            }
        
                            .email-cnt-01 div img{
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            }
        
                            .email-cnt-01 strong{
                                font-family: Inknut Antiqua;
                                margin-left: 10px;
                            }
        
                            .email-cnt-btn-01{
                                width: 120px;
                                height: 30px;
                                margin: 10px;
                                color: aliceblue;
                                background-color: rgb(5, 148, 195);
                                border: 1px solid;
                                border-radius: 5px;
                                cursor: pointer;
                            }
        
        
                        </style>
                    </head>
                    <body>
                        <div class="email-main-cnt-01">
                            <div class="email-cnt-01">
                                <strong>staWro</strong>
                            </div>
                            <div class="email-cnt-02">
                                <span>Hello, Dear <strong>${user.username}</strong> </span><br/>
                                <p>Welcome to staWro.<br/>
                                Change to a new password by clicking on the 'Update' text</p><br/>
                                    <a href = "http://192.168.33.78:3000/changepass?id=${token}&user=${user._id}" style="text-decoration: none;">Update</a>
                                <strong></strong><br/>
                     
                                <strong>Thank you</strong>
        
                            </div>
                        </div>
                        
                    </body>
                    </html>
        
                ` // HTML body
              };
              
              // Send email
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.status(202).json({message : "Something went Wrong"})
                }
                return res.status(200).json({Status : "OK"})
              });


        }else{
            return res.status(202).json({ Status: "NO" });
        }

    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.post("/update/password/without/token", async (req, res) => {
    const { pass, oldpass, user } = req.body;
    try {
        const data = await Usermodule.findOne({_id : user});
        if (!data) {
            return res.status(404).json({ status: "User Not Found" });
        }

        const isMatch = await bcrypt.compare(oldpass, data.pass);
        if (isMatch) {
            const hash = await bcrypt.hash(pass, 10);
            data.pass = hash;
            data.Time = new Date(); // Assuming you want to set the current date/time
            await data.save();
            return res.status(200).json({ Status: "OK" });
        } else {
            return res.status(202).json({ Status: "NO" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/update/new/pass/by/token", async (req, res)=>{
    const {pass, token, id} = req.body;

    try{
        if(token){
            const decoded = jwt.verify(token, 'kanna_staWro_founders_withhh_1931_liketha_pass-worff');
            if(decoded.id === id){
                const User = await Usermodule.findOne({_id : decoded.id})
                const hash = await bcrypt.hash(pass, 10);
              
              // Update the user's password and time
                User.pass = hash;
                User.Time = new Date().toLocaleString();
                await User.save();
                return res.status(200).json({Status : "OK"})
          
            }
            else{
                console.log({Status : "NOT VALID"})
                return res.status(202).json({ Status: "NO Token" });
                
            }

        }else{
            return res.status(202).json({ Status: "NO Token" });
        }
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})




const BalanceSchema = new mongoose.Schema({
    Time: String,
    user: String,
    balance: String,
}, { timestamps: true });

const Balancemodule = mongoose.model('Balance', BalanceSchema);

app.post('/get/balance/new/data',authMiddleware,async(req, res)=>{
    const {user} = req.body;

    try{
        const data = await Balancemodule.findOne({user : user})
        if(!data){
            await Balancemodule.create({user, Time, balance : "15"});
            await Historymodule.create({Time, user, rupee : "15", type : "Credited", tp : "Rupee"});
            const data1 = StarBalmodule.findOne({user})
            if(data1){
                return res.status(200).json({ Status: "OK" });
            }else{
                await Historymodule.create({Time, user, rupee : "2", type : "Credited", tp : "Stars"});
                await StarBalmodule.create({Time, user, balance : "2"});
                return res.status(200).json({ Status: "OK" });
            }
            
        }else{
            return res.status(202).json({ Status: "NO" });
        }
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/get/acount/balence/:user", authMiddleware, async (req, res) =>{
    const user = req.params.user;
    try{
        const data = await Balancemodule.findOne({user : user})
        if(data){
            return res.status(200).json({data})
        }else{
            return res.status(202).json({Status : "NO"})
        }
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const HistorySchema = new mongoose.Schema({
      
    Time : String,
    user : String,
    rupee : String,
    type : String,
    tp : String,

});

const Historymodule = mongoose.model('History', HistorySchema);

app.get('/update/data/:user', authMiddleware, async (req, res) =>{
    const user = req.params.user;
    try{
        const data = await Historymodule.find({user : user})
        return res.status(200).json({data})
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const UPI_BANKSchema = new mongoose.Schema({
    Time: String,
    user: String,
    ac_h_nme: String,
    bank_nme : {
        default : "No",
        type : String
    },
    Acc_no : String,
    ifsc : {
        default : "No",
        type : String
    },
    app : {
        default : "No",
        type : String
    },
    type : String

}, { timestamps: true });

const UPImodule = mongoose.model('Baank_UPI', UPI_BANKSchema);

app.post("/bank/upi/data/collect", async (req, res) =>{
    const {user, ac_h_nme, bank_nme, Acc_no, ifsc, app, type} = req.body;
    try{
        const data = await UPImodule.findOne({user : user})
        if(!data){
            await UPImodule.create({user, ac_h_nme, bank_nme, Acc_no, ifsc, app, type})
            return res.status(200).json({Status : "OK"})
        }else{
            return res.status(200).json({Status : "IN"})
        }
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/get/bank/account/data/:user", authMiddleware, async (req, res) =>{
    const user = req.params.user;
    try{
        const data = await UPImodule.findOne({user : user})
        if(data){
            return res.status(200).json({data})
        }else{
            return res.status(202).json({Status : "No"})
        }
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})



const CoinSchema = new mongoose.Schema({
    Time: String,
    title : String,
    img : String,
    valid : String,
    body : String,
    stars : String,
}, { timestamps: true });

const Coinmodule = mongoose.model('Coins', CoinSchema);

app.post("/coin/new/data", async (req, res) =>{
    const {title, img, valid, body, stars} = req.body;
    try{
        await Coinmodule.create({title, img, valid, body, stars,Time})
        return res.status(202).json({Status : "OK"})

    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/get/coin/data",async (req, res) =>{
    try{
        const data = await Coinmodule.find({})
        return res.status(200).json({data})
    }catch(error) {
        console.log(error);
        return res.status(500).json({ error });
    }
} )

app.get("/get/coin/data/2", adminMidleware,async (req, res) =>{
    try{
        const data = await Coinmodule.find({})
        return res.status(200).json({data})
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
} )


app.delete("/delete/coin/by/:id", async(req, res) =>{
    const id = req.params.id;
    try{
        const data = await Coinmodule.findOne({_id : id})
        if(data){
            await data.deleteOne();
            return res.status(202).json({Status : "OK"})
        }else{
            return res.status(202).json({Status : "BAD"})
        }
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const MyCoinsSchema = new mongoose.Schema({
    Time: String,
    title : String,
    img : String,
    valid : String,
    body : String,
    stars : String,
    type : String,
    user : String
}, { timestamps: true });

const Mycoinsmodule = mongoose.model('My_Coins', MyCoinsSchema);

app.post('/get/my/conis/get', authMiddleware,async (req, res) =>{
    const {id, user} = req.body;
    try{
        const data = await Coinmodule.findById({_id : id})
        const data1 = await StarBalmodule.findOne({user})

        if(data && data1){
            if(parseInt(data1.balance) >= parseInt(data.stars) ){
                const sum = parseInt(data1.balance) - parseInt(data.stars);
                // await StarBalmodule.create({Time, user, balance : "2"});
                await data1.updateOne({balance : sum})
                //coins to my coins
                await Mycoinsmodule.create({Time, title : data.title, img : data.img, valid : data.valid, body : data.body, stars : data.stars, type : "Stars", user})
                await Historymodule.create({Time, user, rupee : data.stars, type : "Debited", tp : "Stars"});
                return res.status(202).json({Status : "OK"})
            }
            else{
                return res.status(202).json({Status : "Low Bal", message : "Low Balance"})
            }

        }else if(!data1){
            await StarBalmodule.create({Time, user, balance : "2"});
            // History
            await Historymodule.create({Time, user, rupee : "2", type : "Credited", tp : "Stars"});
            return res.status(202).json({Status : "Low Bal"})
        }else{
            return res.status(301).json({Status : "BAD"})
        }
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get('/get/coins/data/by/id/:user', authMiddleware,async (req, res) =>{
    const user = req.params.user;
    try{
        const data = await Mycoinsmodule.find({user})
        return res.status(200).json({data})
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const StarBalSchema = new mongoose.Schema({
    Time: String,
    user: String,
    balance: String,
}, { timestamps: true });

const StarBalmodule = mongoose.model('Star_Bal', StarBalSchema);

app.get('/get/stars/balance/:user', async (req, res)=>{
    const user = req.params.user;
    try{
        const data = await StarBalmodule.findOne({user})
        if(!data){
            await StarBalmodule.create({Time, user : user, balance : "2"});
            // History
            await Historymodule.create({Time, user, rupee : "2", type : "Credited", tp : "Stars"});
            return res.status(200).json({Status : "OKK"});
        }else{
            return res.status(200).json({data});
        }
        
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const CliamReqSchema = new mongoose.Schema({
    Time: String,
    title : String,
    img : String,
    valid : String,
    body : String,
    stars : String,
    type : String,
    user : String,
    ID : String
}, { timestamps: true });

const Claimrequestmodule = mongoose.model('Claim_req_Coins', CliamReqSchema);

app.post('/claim/reqst/coins/admin', async (req, res)=>{
    const {user, id} = req.body
    try{
        const Bougt_Coin = await Mycoinsmodule.findById({_id : id})
        if(Bougt_Coin.user === user){
            await Claimrequestmodule.create({Time, 
                title : Bougt_Coin.title,
                img : Bougt_Coin.img,
                valid : Bougt_Coin.valid,
                body : Bougt_Coin.body,
                stars : Bougt_Coin.stars,
                type :  Bougt_Coin.type,
                user : user,
                ID : Bougt_Coin._id
            })
            await PendingNotimodule.create({Time, user, idd : Bougt_Coin._id, type : "Coin", title : Bougt_Coin.title, sub : "pending"})
            await Bougt_Coin.deleteOne();
            return res.status(200).json({Status : "OK"})
        
        }else{
            return res.status(200).json({Status : "BAD"})
        }
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/get/requested/coins/by/:user", authMiddleware, async (req, res)=>{
    const user = req.params.user

    try{
        const data = await Claimrequestmodule.find({user})
        return res.status(200).json({data})
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get('/get/requested/coins/admin', adminMidleware,async (req, res) =>{
    try{
        const data = await Claimrequestmodule.find({})
        return res.status(200).json({data})
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.delete("/find/by/id/and/delete/req/coins/:id", async (req, res) =>{
    const id = req.params.id;
    try{
        const data = await Claimrequestmodule.findById({_id : id})
        if(data){
            await ClaimedCoinsmodule.create({Time,
                title : data.title,
                img : data.img,
                valid : data.valid,
                body : data.body,
                stars : data.stars,
                type : data.type,
                user : data.user
            })
            //Pending Notification
            //sub => pending or completed
            //type => Coin or Money
            await PendingNotimodule.findOneAndDelete({idd : data.ID})
            await PendingNotimodule.create({Time, user : data.user, idd : data._id, type : "Coin", title : data.title, sub : "completed"})
            await data.deleteOne();
            return res.status(202).json({Status : "OK"})
        }else{
            return res.status(202).json({Status : "BAD"})
        }
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const ClimedReqSchema = new mongoose.Schema({
    Time: String,
    title : String,
    img : String,
    valid : String,
    body : String,
    stars : String,
    type : String,
    user : String
}, { timestamps: true });

const ClaimedCoinsmodule = mongoose.model('Claimed_coins', ClimedReqSchema);

app.get('/get/claimed/from/pending/coins', async (req, res) =>{
    try{
        const data = await ClaimedCoinsmodule.find({})
        return res.status(200).json({data})
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get('/get/claimed/from/pending/coins/:user', authMiddleware,async (req, res) =>{
    const user = req.params.user;
    try{
        const data = await ClaimedCoinsmodule.find({user})
        if(data){
            return res.status(200).json({data})
        }else{
            return res.status(200).json({Status : "No"})
        }
        
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
    
})

const PendingNotiSchema = new mongoose.Schema({
      
    Time : String,
    user : String,
    idd : String,
    type : String,
    title : String,
    sub : String

});

const PendingNotimodule = mongoose.model('Pending_Noti', PendingNotiSchema);

app.get('/get/pending/notification/:user', authMiddleware, async (req, res) =>{
    const user = req.params.user;
    try{
        const data = await PendingNotimodule.find({user})
        return res.status(200).json({data})
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const AdminUserSchema = new mongoose.Schema({
    Time: String,
    username : String,
    pass : String,
}, { timestamps: true });

const AdminUsermodule = mongoose.model('Admin_Users', AdminUserSchema);

app.post('/get/new/user/admin/account', async (req, res) =>{
    const {username, pass, quest, answ, id} = req.body;

    try{
        if(quest === "Hero" && answ === "Ki1931cK" && id === "193100"){
            const hash = await bcrypt.hash(pass , 10)
            await AdminUsermodule.create({Time, username, pass : hash, valid : "No" })
            return res.status(202).json({Status : "OK"})
        }else{
            return res.status(202).json({Status : "BAD"})
        }
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }

})

const OTPSchema = new mongoose.Schema({
    Time: String,
    username : String,
    OTP : String,
}, { timestamps: true });

const OTPmodule = mongoose.model('OTP_Data', OTPSchema);

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
  

app.post('/login/to/admin/account', async (req, res) =>{
    const {username} = req.body;
    try{
        const otp = generateOTP() 
        const user = await AdminUsermodule.findOne({username})
        if(user){
            await OTPmodule.findOneAndDelete({username : username})
            const data = await OTPmodule.create({username, Time, OTP : otp})
            let mailOptions = {
                from: 'stawropuzzle@gmail.com', // Sender address
                to: "anvithapujari036@gmail.com", // List of recipients
                subject: `staWro, Admin Login OTP`, // Subject line
                text: '', // Plain text body
                html: `
                
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <meta http-equiv="refresh" content="30" />
                        <title>Document</title>
                        <style>
        
                            @import url('https://fonts.googleapis.com/css2?family=Inknut+Antiqua:wght@400;700&display=swap');
        
        
                            .email-main-cnt-01{
                                width: 95%;
                                justify-content: center;
                                margin: auto;
                            }
        
                            .email-cnt-01{
                                width: 90%;
                                height: auto;
                                display: flex;
                                margin: 10px;
                            }
        
                            .email-cnt-01 div{
                                width: 50px;
                                height: 50px;
                                overflow: hidden;
                                border-radius: 50%;
                                border: 1px solid;
                                
                            }
        
                            .email-cnt-01 div img{
                                width: 100%;
                                height: 100%;
                                object-fit: cover;
                            }
        
                            .email-cnt-01 strong{
                                font-family: Inknut Antiqua;
                                margin-left: 10px;
                            }
        
                            .email-cnt-btn-01{
                                width: 120px;
                                height: 30px;
                                margin: 10px;
                                color: aliceblue;
                                background-color: rgb(5, 148, 195);
                                border: 1px solid;
                                border-radius: 5px;
                                cursor: pointer;
                            }
        
        
                        </style>
                    </head>
                    <body>
                        <div class="email-main-cnt-01">
                            <div class="email-cnt-01">
                                <strong>staWro</strong>
                            </div>
                            <div class="email-cnt-02">
                                <span><strong>Login, Admin Account ${data.username}</strong> </span><br/>
                                <p>Your Account need Attention to Login<br />
                                    By Authentication to Admin Account<br />
                                    This is Your's OTP to Login ${data.OTP}<br />
                                    Don't Share OTP</p>
                                    
                                <strong>OTP ${data.OTP}</strong><br/>
                     
                                <strong>Thank you</strong>
        
                            </div>
                        </div>
                        
                    </body>
                    </html>
        
                ` // HTML body
              };
              
              // Send email
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                return res.json({Status : "OK"})
              });

            // if(user.valid === "Yes"){
            //     const dat = await bcrypt.compare(pass, user.pass)
            //     if(dat){
            //         const token = jwt.sign({ username : user.username }, "kanna_staWro_founders_withhh_1931_liketha_pass-worff_admin_gadi_passkey__", { expiresIn: "24h" });
            //         return res.status(202).json({Status : "OK", token })
            //     }else{
            //         return res.status(202).json({Status : "BAD"})
            //     }
            // }else{
            //     return res.status(202).json({Status : "BAD"})
            // }


        }else{
            return res.status(202).json({Status : "BAD"})
        }
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


// app.post('/verify/otp/and/pass/by/admin', async (req, res) =>{
//     const {otp, username,pass} = req.body;
//     try{
//         const data = await OTPmodule.findOne({username})
//         if(data.OTP === otp){
//             await data.deleteOne();
//             const user = await AdminUsermodule.findOne({username})
//             if(user.username === username){
//                 const True = await bcrypt.compare(pass, user.pass)
//                 if(True){                    
//                     const token = jwt.sign({ username : username }, "kanna_staWro_founders_withhh_1931_liketha_pass-worff_admin_gadi_passkey__", { expiresIn: "24h" });
//                     return res.status(202).json({Status : "OK", token})
//                 }else{
//                     return res.status(202).json({Status : "BAD"})
//                 }
//             }else{
//                 return res.status(202).json({Status : "BAD"})
//             }
            
//         }else{
//             return res.status(202).json({Status : "BAD"})
//         }
//     }catch(error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// })


app.post('/verify/otp/and/pass/by/admin', async (req, res) => {
    const { otp, username, pass } = req.body;
    try {
        const data = await OTPmodule.findOne({ username });
        if (data && data.OTP === otp) {
            await data.deleteOne();
            const user = await AdminUsermodule.findOne({ username });
            if (user && user.username === username) {
                const isPasswordCorrect = await bcrypt.compare(pass, user.pass);
                if (isPasswordCorrect) {
                    const token = jwt.sign(
                        { username: username },
                        "kanna_staWro_founders_withhh_1931_liketha_pass-worff_admin_gadi_passkey__",
                        { expiresIn: "24h" }
                    );
                    return res.status(202).json({ Status: "OK", token });
                } else {
                    return res.status(202).json({ Status: "BAD", message: "Invalid password" });
                }
            } else {
                return res.status(202).json({ Status: "BAD", message: "User not found" });
            }
        } else {
            return res.status(202).json({ Status: "BAD", message: "Invalid OTP" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


const RupeeSchema = new mongoose.Schema({
    Time: String,
    username : String,
    rupee : String,
}, { timestamps: true });

const Rupeemodule = mongoose.model('Rupee', RupeeSchema);

app.post('/rupee/get/for/game', async (req, res)=>{
    const {rupee} = req.body;

    try{
        const username = "admin"
        const user = await Rupeemodule.findOne({username})
        if(user){
            await user.updateOne({rupee : rupee})
            return res.status(200).json({Status : "OK"})
        }else{
            await Rupeemodule.create({rupee, username, Time})
            return res.status(200).json({Status : "OK"})
        }
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get('/get/rupee/data/play', async (req, res) =>{
    try{
        const username = "admin";
        const data = await Rupeemodule.findOne({username})
        return res.status(200).json({data})

    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const StartValidSchema = new mongoose.Schema({
    Time: String,
    user: String,
    valid: String
}, { timestamps: true });

const StartValidmodule = mongoose.model('Start_Valid', StartValidSchema);


app.get('/choose/question/start/game/:lang', async (req, res) =>{
    const {lang, user} = req.params.body;
    try{

        const Total_Questions = await QuestionModule.find({lang : lang})
        const sum = Total_Questions.length - 9;
        const specificNumbers = [];
        for (i = sum ; i > 0; i-=10){
            specificNumbers.push(i);            
        }
        const getRandomNumber = () => {
            const randomIndex = Math.floor(Math.random() * specificNumbers.length);
            return specificNumbers[randomIndex];
        };
        const num = getRandomNumber()
        const Array = [];
        const two = num+10
        for (i = num; i < two; i++){
            Array.push(i)
        }


        // console.log(Array[0])
        // console.log(Array[1])
        // console.log(Array[2])
        // console.log(Array[3])
        // console.log(Array[4])



    }catch (error) {
        console.log(error);
        // Send an error response
        return res.status(500).json({ message: "Internal Server Error" });
    }
})
















const QuestionListSchema = new mongoose.Schema({
    Time: String,
    user: String,
    lang :String,
    list : [],
    oldlist : [],
}, { timestamps: true });

const QuestionListmodule = mongoose.model('Question_List', QuestionListSchema);



// app.post('/start/playing/by/debit/amount', async (req, res) => {
//     const { user, lang } = req.body;
//     const Time = new Date(); // Assuming you want to store the current time

//     try {
//         // Find the user's balance
//         const balance = await Balancemodule.findOne({ user });
//         // Find the fees from the admin user
//         const fees = await Rupeemodule.findOne({ username: "admin" });

//         // Delete any existing start validation for the user
//         await StartValidmodule.findOneAndDelete({ user });

//         if (balance) {
//             // Check if the user's balance is sufficient
//             if (parseInt(balance.balance) >= parseInt(fees.rupee)) {
//                 const create_data = await QuestionListmodule.findOne({ user });

//                 if (create_data) {
//                     const QnoList = create_data.oldlist;
//                     const Total_Questions = await QuestionModule.find({ lang });

//                     // Calculate the starting points for random question selection
//                     const sum = Total_Questions.length - 9;
//                     const specificNumbers = [];

//                     for (let i = sum; i > 0; i -= 10) {
//                         specificNumbers.push(i);
//                     }

//                     const Final = specificNumbers.filter(value => !QnoList.includes(value));

//                     if (Final.length <= 0) {
//                         return res.status(200).json({ Status: "BAD" });
//                     } else {
//                         const rem = parseInt(balance.balance) - parseInt(fees.rupee);

//                         // Update the user's balance
//                         await balance.updateOne({ balance: rem });

//                         // Create a new start validation and history record
//                         await StartValidmodule.create({ Time, user, valid: "yes" });
//                         await Totalusermodule.create({ Time, user });
//                         await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });

//                         const getRandomNumber = () => {
//                             const randomIndex = Math.floor(Math.random() * Final.length);
//                             return Final[randomIndex];
//                         };

//                         const num = getRandomNumber();

//                         // Update question lists
//                         await QuestionListmodule.updateOne(
//                             { _id: create_data._id },
//                             { 
//                                 $push: { oldlist: num },
//                                 $set: { list: [] }
//                             }
//                         );

//                         const two = num + 10;
//                         for (let i = num; i < two; i++) {
//                             await QuestionListmodule.updateOne(
//                                 { _id: create_data._id },
//                                 { $push: { list: i } }
//                             );
//                         }

//                         return res.status(200).json({ Status: "OK" });
//                     }
//                 } else {
//                     const rem = parseInt(balance.balance) - parseInt(fees.rupee);

//                     // Update the user's balance
//                     await balance.updateOne({ balance: rem });

//                     // Create new start validation, history record, and question list
//                     await StartValidmodule.create({ Time, user, valid: "yes" });
//                     await Totalusermodule.create({ Time, user });
//                     await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });

//                     const Question_list = await QuestionListmodule.create({ user, Time, lang, list: [], oldlist: [] });

//                     const Total_Questions = await QuestionModule.find({ lang });

//                     const sum = Total_Questions.length - 9;
//                     const specificNumbers = [];
//                     for (let i = sum; i > 0; i -= 10) {
//                         specificNumbers.push(i);
//                     }

//                     const getRandomNumber = () => {
//                         const randomIndex = Math.floor(Math.random() * specificNumbers.length);
//                         return specificNumbers[randomIndex];
//                     };

//                     const num = getRandomNumber();
//                     await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { oldlist: num } });

//                     const two = num + 10;
//                     for (let i = num; i < two; i++) {
//                         await QuestionListmodule.updateOne(
//                             { _id: Question_list._id },
//                             { $push: { list: i } }
//                         );
//                     }

//                     return res.status(200).json({ Status: "OK" });
//                 }
//             } else {
//                 // Insufficient balance
//                 return res.status(200).json({ Status: "Low-Bal" });
//             }
//         } else {
//             // User not found
//             return res.status(200).json({ Status: "BAD" });
//         }
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });



app.post('/start/playing/by/debit/amount', async (req, res) => {
    const { user, lang } = req.body;

    try {
        // Find the balance of the user
        const balance = await Balancemodule.findOne({ user });
        // Find the fees from the admin user
        const fees = await Rupeemodule.findOne({ username: "admin" });
        // await StartValidmodule.findOneAndDelete({ user });

        if (balance) {
            // Check if the user's balance is sufficient to cover the fees
            if (parseInt(balance.balance) >= parseInt(fees.rupee)) {
                // Calculate the remaining balance
                

                const create_data = await QuestionListmodule.findOne({ user });
                if (create_data) {
                    const QnoList = create_data.oldlist;

                    const Total_Questions = await QuestionModule.find({ lang });

                    const sum = Total_Questions.length - 9;
                    const specificNumbers = [];

                    for (let i = sum; i > 0; i -= 10) {
                        specificNumbers.push(i);
                    }

                    const Final = specificNumbers.filter(value => !QnoList.includes(value));

                    if (Final.length <= 0) {
                        return res.status(200).json({ Status: "BAD" });
                    } else {
                        const rem = parseInt(balance.balance) - parseInt(fees.rupee);

                        // Update the user's balance
                        await balance.updateOne({ balance: rem });

                        // Get the current time

                        // Create a new start record
                        await StartValidmodule.create({ Time, user, valid: "yes" });
                        await Totalusermodule.create({Time, user});

                        // Create a new history record
                        await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });


                        const getRandomNumber = () => {
                            const randomIndex = Math.floor(Math.random() * Final.length);
                            return Final[randomIndex];
                        };
                        const num = getRandomNumber();
                        await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { oldlist: num } });
                        // Clear the 'list' array
                        await QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });

                        const two = num + 10;
                        for (let i = num; i < two; i++) {
                            await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { list: i } });
                        }

                        return res.status(200).json({ Status: "OK" });
                    }
                } else {
                    const rem = parseInt(balance.balance) - parseInt(fees.rupee);

                    // Update the user's balance
                    await balance.updateOne({ balance: rem });

                    // Get the current time
                    // Create a new start record
                    const ValDat = "yes"
                    await StartValidmodule.create({ Time, user, valid: ValDat });
                    await Totalusermodule.create({Time, user});

                    // Create a new history record
                    await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });


                    const Question_list = await QuestionListmodule.create({ user, Time, lang, list: [], oldlist: [] });

                    const Total_Questions = await QuestionModule.find({ lang });

                    const sum = Total_Questions.length - 9;
                    const specificNumbers = [];
                    for (let i = sum; i > 0; i -= 10) {
                        specificNumbers.push(i);
                    }

                    const getRandomNumber = () => {
                        const randomIndex = Math.floor(Math.random() * specificNumbers.length);
                        return specificNumbers[randomIndex];
                    };

                    const num = getRandomNumber();
                    await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { oldlist: num } });

                    const two = num + 10;
                    for (let i = num; i < two; i++) {
                        await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { list: i } });
                    }

                    return res.status(200).json({ Status: "OK" });
                }
            } else {
                // Send a response indicating low balance
                return res.status(200).json({ Status: "Low-Bal" });
            }
        } else {
            // Send a response indicating that the user is not found
            return res.status(200).json({ Status: "BAD" });
        }
    } catch (error) {
        console.log(error);
        // Send an error response
        return res.status(500).json({ message: "Internal Server Error" });
    }
});





// app.post('/start/playing/by/debit/amount', async (req, res) => {
//     const { user, lang } = req.body;

//     try {
//         // Find the balance of the user
//         const balance = await Balancemodule.findOne({ user });
//         // Find the fees from the admin user
//         const fees = await Rupeemodule.findOne({ username: "admin" });
//         await StartValidmodule.findOneAndDelete({ user});

//         if (balance) {
//             // Check if the user's balance is sufficient to cover the fees
//             if (parseInt(balance.balance) >= parseInt(fees.rupee)) {
            

//                 // Calculate the remaining balance
//                 const rem = parseInt(balance.balance) - parseInt(fees.rupee);

//                 // Update the user's balance
//                 await balance.updateOne({ balance: rem });

//                 // Get the current time
//                 const Time = new Date();

//                 // Create a new start record
//                 await StartValidmodule.create({ Time, user, valid: "yes" });

//                 // Create a new history record
//                 await Historymodule.create({ Time, user, rupee: fees.rupee, type: "Debited", tp: "Rupee" });

//                 const create_data = await QuestionListmodule.findOne({user})
//                 if(create_data){

//                     const QnoList = create_data.oldlist;

                    

//                     const Total_Questions = await QuestionModule.find({lang : lang})
        
//                     const sum = Total_Questions.length - 9;
//                     const specificNumbers = [];

                    

//                     for (i = sum ; i > 0; i-=10){
//                         specificNumbers.push(i);            
//                     }

//                     const Ary = [1, 2, 3, 4]  

//                     const Final = specificNumbers.filter(value => !QnoList.includes(value) )

//                     if(Final.length < 0){

//                         return res.status(200).json({Status : "BAD"})

//                     }else{

//                         const getRandomNumber = () => {
//                             const randomIndex = Math.floor(Math.random() * Final.length);
//                             return Final[randomIndex];
//                         };
//                         const num = getRandomNumber()
//                         await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { oldlist: num } });
//                         //update a update epty [] to
//                         await QuestionListmodule.updateOne({ _id: create_data._id }, { $set: { list: [] } });
    
//                         const two = num+10
//                         for (i = num; i < two; i++){
//                             await QuestionListmodule.updateOne({ _id: create_data._id }, { $push: { list: i } });
//                         }
    
//                         return res.status(200).json({ Status: "OK" });
//                     }
                    

//                 }else{
//                     const Question_list = await QuestionListmodule.create({ user, Time, lang, list: [], oldlist: [] });

//                     const Total_Questions = await QuestionModule.find({ lang: lang });

//                     const sum = Total_Questions.length - 9;
//                     const specificNumbers = [];
//                     for (let i = sum; i > 0; i -= 10) {
//                         specificNumbers.push(i);
//                     }

//                     const getRandomNumber = () => {
//                         const randomIndex = Math.floor(Math.random() * specificNumbers.length);
//                         return specificNumbers[randomIndex];
//                     };

//                     const num = getRandomNumber();
//                     await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { oldlist: num } });

//                     const two = num + 10;
//                     for (let i = num; i < two; i++) {
//                         await QuestionListmodule.updateOne({ _id: Question_list._id }, { $push: { list: i } });
//                     }

//                     return res.status(200).json({ Status: "OK" });


//                 }


//                 // Send a success response
//                 // return res.status(200).json({ Status: "OK"});
//             } else {
//                 // Send a response indicating low balance
//                 return res.status(200).json({ Status: "Low-Bal" });
//             }
//         } else {
//             // Send a response indicating that the user is not found
//             return res.status(200).json({ Status: "BAD" });
//         }
//     } catch (error) {
//         console.log(error);
//         // Send an error response
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });








app.delete("/delete/by/user/id/for/valid/data/:user", async (req, res) =>{
    const user = req.params.user;

    try{
        const data = await StartValidmodule.findOne({user});
        if(data){
            await data.deleteOne();
            return res.status(200).json({Status : "OK"})
        }else{
            return res.status(200).json({Status : "BAD"})
        }
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/admin/get/all/users/data/logined", adminMiddleware, async (req, res) => {
    try {
        const data = await StartValidmodule.find({});

        // Use Promise.all to wait for all async operations to complete
        const users = await Promise.all(data.map(async (use) => {
            const data1 = await Usermodule.findOne({ _id: use.user });
            return {
                username: data1.username,
                time: use.Time
            };
        }));

        // Send the response once all user data is gathered
        return res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


const QnoSchema = new mongoose.Schema({
    Time: String,
    user: String,
    img : String,
    Questio : String,
    qno : String,
    a : String,
    b : String,
    c : String,
    d : String,
    Ans : String,
    lang :String,
    tough : String

}, { timestamps: true });

const QuestionModule = mongoose.model('Qno_Count', QnoSchema);

app.post("/get/posted/count/questions", async (req, res) =>{
    const {user, img, Questio, a, b, c, d, Ans, lang, tough} = req.body;

    try{
        const Qno_length = await QuestionModule.find({lang})
        const hash = Ans.trim().toLowerCase();
        await QuestionModule.create({Time, user, img, Questio, qno : Qno_length.length+1, a, b, c, d, Ans : hash, lang, tough})
        return res.status(200).json({Status : "OK", qno : Qno_length.length+1})
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get("/get/question/no/by/user/name/:user", async (req, res) => {
    const user = req.params.user;
    try {
        // Fetch the user's validity status from StartValidmodule
        const Data = await StartValidmodule.findOne({ user });
        // Fetch the user's question list from QuestionListmodule
        const Get_Qno_info = await QuestionListmodule.findOne({ user });

        // Check if the user is valid and has a question list
        if (Data && Data.valid === "yes") {
            if (Get_Qno_info && Get_Qno_info.list.length > 0) {
                // Get the first question number from the list
                const QNO = Get_Qno_info.list[0];
                
                // Find the question in QuestionModule by its number and language
                const Qno = await QuestionModule.findOne({ qno: QNO, lang: Get_Qno_info.lang });
                
                if (Qno) {
                    // Construct the response data
                    const data = {
                        _id: Qno._id,
                        img: Qno.img,
                        Question: Qno.Questio,
                        Qno: Get_Qno_info.list.length, // Calculates the position of the question
                        a: Qno.a,
                        b: Qno.b,
                        c: Qno.c,
                        d: Qno.d,
                    };

                    return res.status(200).json({ data });
                } else {
                    return res.status(404).json({ Status : "BAD" });
                }
            } else {
                return res.status(202).json({ Status : "BAD" });
            }
        } else {
            return res.status(202).json({ Status : "BAD" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

const WonSchema = new mongoose.Schema({
    Time: String,
    user : String,
    no : String,
    ID : String
}, { timestamps: true });

const Wonmodule = mongoose.model('Won', WonSchema);





app.post('/verify/answer/question/number', async (req, res) =>{
    const {answer , user, id} = req.body;
    try{
        const Answer_Verify = await QuestionModule.findById({_id : id})
        const User_List = await QuestionListmodule.findOne({user})
        if(Answer_Verify.Ans === answer){
            if(User_List.list.length === 1){
                await User_List.updateOne({$pull : {list : User_List.list[0] }})
                const won = await Wonmodule.find({})
                const CuponDat = await Cuponmodule.findOne({no : won.length+1})
                if(CuponDat){
                    await Wonmodule.create({Time, user, no : won.length +1, ID : CuponDat._id })

                    await Mycoinsmodule.create({Time : Date.now(), 
                        title : CuponDat.title, 
                        img : CuponDat.img,
                        user : user,
                        type : CuponDat.type,
                        stars : "No",
                        body : CuponDat.body,
                        valid : CuponDat.valid
                    })
                    return res.status(200).json({Status : "OKK", id : CuponDat._id, rank : won.length+1});

                }else{
                    const get_count_data = await StarsCountmodule.findOne({ count: { $gte: won.length+1 } });

                    await Wonmodule.create({Time, user, no : won.length +1, ID : "stars" })
                    const get_prize_list1 = await StarBalmodule.findOne({user})
                    
                    const starsValues = [];
                    const pushData =  await StarsCountmodule.find({})
                    pushData.map((users)=>{
                        starsValues.push(users.stars)
                    })
                    // const sum = parseInt(get_prize_list1.balance) + parseInt(get_count_data.stars)

                    if(get_prize_list1){
                        for (const stars of starsValues) {
                            const get_count_data = await StarsCountmodule.findOne({ stars });
                            
                            if (parseInt(get_count_data.count) >= parseInt(won.length+1)) {
                                await get_prize_list1.updateOne({balance : parseInt(get_prize_list1.balance) + parseInt(get_count_data.stars)})
                                await Historymodule.create({Time, user, rupee : get_count_data.stars, type : "Credited", tp : "Stars"});
                                return res.status(200).json({Status : "STARS", stars : get_count_data.stars});
                            }
                        }
                        
                    }else{
                        for (const stars of starsValues) {
                            const get_count_data = await StarsCountmodule.findOne({ stars });
                            
                            if (parseInt(get_count_data.count) >= parseInt(won.length+1)) {
                                await StarBalmodule.create({Time, user : user, balance : get_count_data.stars});
                                await Historymodule.create({Time, user, rupee : get_count_data.stars, type : "Credited", tp : "Stars"});
                                return res.status(200).json({Status : "STARS", stars : get_count_data.stars});
                            }
                        }

                        // await StarBalmodule.create({Time, user : user, balance : get_count_data.stars});
                        // await Historymodule.create({Time, user, rupee : get_count_data.stars, type : "Credited", tp : "Stars"});
                        // return res.status(200).json({Status : "STARS", stars : get_count_data.stars});
                    }
                    
                }
                


            }else{
                await User_List.updateOne({$pull : {list : User_List.list[0] }})
                return res.status(200).json({Status : "OK"})
            }
            
        }else{
            return res.status(200).json({Status : "BAD"})
        }
    } 
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const CuponSchema = new mongoose.Schema({
    Time: String,
    title : String,
    img : String,
    valid : String,
    body : String,
    type : String,
    user : String,
    no : String
}, { timestamps: true });

const Cuponmodule = mongoose.model('Cupon_s', CuponSchema);

app.post("/get/new/cupon/for/neww/cupon", async (req, res) =>{
    const {title, img, valid, body, type, user} = req.body;
    try{
        const data = await Cuponmodule.find({})
        await Cuponmodule.create({Time, title, img, valid, body, type, user, no : data.length+1})
        return res.status(200).json({Status : "OK"})
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get("/get/cupon/get/all/datas", async (req, res) =>{
    try{
        const data = await Cuponmodule.find({})
        return res.status(200).json({data});
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.delete("/delete/cupon/s/by/id/:id", async (req, res) =>{
    const id = req.params.id

    try{
        const user = await Cuponmodule.findById({_id : id})
        if(user){
            await user.deleteOne()
            return res.status(200).json({Status : "OK"})
        }else{
            return res.status(200).json({Status : "BAD"})
        }
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/get/coin/cupons/sds/by/id/:id", async (req, res) =>{
    const id = req.params.id;
    try{
        const won = await Cuponmodule.findById({_id : id})
        return res.status(200).json({data : won})
    }catch(error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

const TotalUserSchema = new mongoose.Schema({
    Time: String,
    user : String,
}, { timestamps: true });

const Totalusermodule = mongoose.model('Total_Users', TotalUserSchema);

app.get("/get/aal/tottttal/users", adminMiddleware ,async(req, res) =>{
    try{
        const users = await Totalusermodule.find({});
        return res.status(200).json({ users });

    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
} )

app.get("/get/total/users/by/winners/datas/all", adminMiddleware, async (req, res) => {
    try {
        // Fetch all users who are marked as winners
        const users = await Wonmodule.find({});

        // Return the list of users
        return res.status(200).json({ users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/get/singel/user/won/data/:no", async (req, res)=>{
    const no = req.params.no;
    try{
        const user_data = await Wonmodule.findOne({no : no})
        if(user_data){
            const iinfo_data = await Usermodule.findOne({_id : user_data.user})
            const data = {
                username : iinfo_data.username
            }
            return res.status(200).json({ data})
        }else{
            return res.status(200).json({Status : "NO"})
        }
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get('/exact/time/by/new', async (req, res) =>{
    try{
        const now = new Date();

        // Extract year, month, and day
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = now.getDate().toString().padStart(2, '0');

        // Format the date as "YYYY-MM-DD"
        const formattedDate = `${year}-${month}-${day}`;

        return res.status(200).json({formattedDate})
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})




const Chart_LineSchema = new mongoose.Schema({
    Time: String,
    len : String,
}, { timestamps: true });

const ChartLinemodule = mongoose.model('Line_chart-1', Chart_LineSchema);

app.post("/length/and/calcul/ation/of/chart", adminMiddleware, async (req, res) => {
    try {
        // Define the current date
        const now = new Date();

        // Extract year, month, and day
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const day = now.getDate().toString().padStart(2, '0');

        // Format the date as "YYYY-MM-DD"
        const formattedDate = `${year}-${month}-${day}`;

        // Find the total number of users
        const len_find = await Totalusermodule.find({}).exec();
        
        // Find data for the specific date
        const Find_data = await ChartLinemodule.findOne({ Time: formattedDate }).exec();
        
        if (!Find_data) {
            // Create a new chart line entry if no data is found for the date
            await ChartLinemodule.create({ len: len_find.length, Time: formattedDate });
            return res.status(200).json({ Status: "OK" });
        } else {
            return res.status(200).json({ Status: "IN" });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/get/data/for/linechart/01",async (req, res) =>{
    try{
        const data = await ChartLinemodule.find({});
        return res.status(200).json({data})
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get('/get/admin/all/question/lists/:lang', adminMiddleware,async (req, res)=>{
    const lang = req.params.lang;
    try{
        const data = await QuestionModule.find({lang});
        if(data){
            return res.status(200).json({data})
        }else{
            return res.status(200).json({Status : "BAD"})
        }
        
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const Stars_CountsSchema = new mongoose.Schema({
    Time: String,
    stars: String,
    count: String,
}, { timestamps: true });

const StarsCountmodule = mongoose.model('Stars_Counts', Stars_CountsSchema);


app.post("/stars/count/one/stars", async (req, res) => {
    const { stars, count } = req.body;
    const Time = new Date(); // Assuming you want to store the current time
    try {
        const get_data = await StarsCountmodule.findOne({ stars: stars });
        if (get_data) {
            // Update the count for the found document
            await StarsCountmodule.updateOne(
                { stars: stars }, 
                { $set: { count: count, Time: Time } }
            );
            return res.status(200).json({ Status: "OK" });
        } else {
            // Create a new document if none is found
            await StarsCountmodule.create({ stars, count, Time });
            return res.status(200).json({ Status: "OK" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



app.get("/stars/get/all/data/by/stars", async (req, res) =>{
    try{
        const data = await StarsCountmodule.find({})
        return res.status(200).json({data})
    }catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/trial/get/data/:data", async (req, res) => {
    const data = parseInt(req.params.data);

    try {
        const starsValues = ["6", "5", "4", "3", "2", "1"];
        
        for (const stars of starsValues) {
            const get_count_data = await StarsCountmodule.findOne({ stars });
            
            if (parseInt(get_count_data.count) >= data) {
                return res.status(200).json({ Data: get_count_data.stars });
            }
        }

        return res.status(404).json({ message: "No matching data found" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


// app.get("/trial/get/data/:data", async (req, res)=>{
//     const data = req.params.data
//     try {

//         // Find the first document where count is greater than or equal to the specified value
//         const get_count_data6 = await StarsCountmodule.findOne({stars : "6"});
//         const get_count_data5 = await StarsCountmodule.findOne({stars : "5"});
//         const get_count_data4 = await StarsCountmodule.findOne({stars : "4"});
//         const get_count_data3 = await StarsCountmodule.findOne({stars : "3"});
//         const get_count_data2 = await StarsCountmodule.findOne({stars : "2"});
//         const get_count_data1 = await StarsCountmodule.findOne({stars : "1"});

//         if(parseInt(get_count_data6.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data6.stars})
//         }else if(parseInt(get_count_data5.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data5.stars})
//         }else if(parseInt(get_count_data4.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data4.stars})
//         }
//         else if(parseInt(get_count_data3.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data3.stars})
//         }else if(parseInt(get_count_data2.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data2.stars})
//         }else if(parseInt(get_count_data1.count) >= parseInt(data)){
//             return res.status(200).json({Data : get_count_data1.stars})
//         }else{
//             console.log("none")
//         }

//         // Return the result as a JSON response
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// })

// app.get("/get/all/users/usernames/by/id/to/update/balance", async (req, res) => {
//     try {
//         const users = await Usermodule.find({});
//         const usersList = users.map((data) => {
//             return {
//                 id: data._id,
//                 username: data.username,
//             };
//         });
//         return res.status(200).json({ users: usersList });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// });


const Trans_UTR_Schema = new mongoose.Schema({
    Time: String,
    UTR: String,
}, { timestamps: true });

const UTRmodule = mongoose.model('UTR', Trans_UTR_Schema);

app.post("/post/utr/ids/by/admin", async (req, res) =>{
    const {utr} = req.body;

    try{
        const user = await UTRmodule.findOne({UTR : utr})
        if(user){
            return res.status(200).json({Status : "BAD"})
        }else{
            await UTRmodule.create({Time, UTR : utr})
            return res.status(200).json({Status : "OK"})
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


app.get('/question/one/by/:no/:lang', async (req, res) => {
    try {
        // Use findOne to search for a question by both 'lang' and 'qno'
        const question = await QuestionModule.findOne({ lang : req.params.lang, qno : req.params.no });
        
        if (question) {
            return res.status(200).json({ question });
        }
        
        return res.status(404).json({ message: "Question not found" });  // 404 for not found
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});



const Lang_SelSchema = new mongoose.Schema({
    Time: String,
    lang : [],
    user : String
}, { timestamps: true });

const LanguageSelectModule = mongoose.model('Language_select', Lang_SelSchema);


app.post('/get/language/datas/all', async (req, res) => {
    const {lang, user} = req.body;

    try{
        const Users = await LanguageSelectModule.findOne({user})
        if(!Users){
            await LanguageSelectModule.create({lang, user, Time})
            return res.status(200).json({ Status: "OK" });
        }else{
            return res.status(200).json({ Status: "IN" });
        }   
    }
    
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error"});
    }
});

app.get("/get/language/datas/all/get/:user", async (req, res) =>{
    const user = req.params.user;
    try{
        const Users = await LanguageSelectModule.findOne({user})
        if(Users){
            return res.status(200).json({Users})
        }else{
            return res.status(200).json({Status : "IN"})
        }
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error"});
    }
})

app.delete('/get/language/datas/all/get/and/delete/:user', async (req, res) =>{
    const user = req.params.user;
    try{
        const Users = await LanguageSelectModule.findOne({user})
        if(Users){
            await Users.deleteOne();
            return res.status(200).json({Status : "OK"})
        }else{
            return res.status(200).json({Status : "BAD"})
        }
    }catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error"});
    }
})

// app.get('/get/languages/data/with/questions/:user', async (req, res) =>{
//     const user = req.params.user
//     try{
//         const users = await LanguageSelectModule.findOne({user : user})
//         const data = users.lang 
//         const selQue = await QuestionListmodule.find({})
//         return res.status(200).json({data})



//     }catch (error) {
//         console.error("Error:", error);
//         return res.status(500).json({ message: "Internal Server Error"});
//     }
// })


app.get('/get/languages/data/with/questions/:user', async (req, res) => {
    const user = req.params.user;
    try {
        const users = await LanguageSelectModule.findOne({ user: user });

        if (!users) {
            return res.status(404).json({ message: "User not found" });
        }

        const data = users.lang; // The list of languages the user has selected
       
        // Find questions related to the user's selected languages
        const selQue = await QuestionModule.find({
            lang: { $in: data }  
        });

        if (!selQue.length) {
            return res.status(404).json({ message: "No questions found for the selected languages" });
        }

        // Example: Filter questions with the difficulty 'Easy'
        const t1 = "Too Easy";
        const t2 = "Easy";
        const t3 = "Medium";
        const t4 = "Tough";
        const t5 = "Too Tough"
        const FDt = selQue.filter(q => q.tough === t5); // Filters all questions where difficulty is 'Easy'

        return res.status(200).json({ FDt });
        
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});





const AllLanguagesSchema = new mongoose.Schema({
    Time: { type: Date, default: Date.now },  // Use Date for Time field
    lang: [{ type: String }]  // Define lang as an array of strings
}, { timestamps: true });

const AllLanguagemodule = mongoose.model('All_Languages', AllLanguagesSchema);

app.post("/add/all/admin/new/languages/data", async (req, res) => {
    const lang = req.body.lang;  // Assuming req.body contains 'lang'

    try {
        const DataFind = await AllLanguagemodule.findOne({});

        if (!DataFind) {
            // If no document exists, create a new document with the provided language
            const newLanguageDoc = new AllLanguagemodule({ lang: [lang] });
            await newLanguageDoc.save();
            return res.status(200).json({ Status: "OK", message: "New language added successfully" });
        } else {
            // Check if the language already exists in the lang array
            if (DataFind.lang.includes(lang)) {
                return res.status(200).json({ Status: "IN", message: "Language already exists" });
            } else {
                // Add the new language to the lang array
                await DataFind.updateOne({ $push: { lang: lang } });
                return res.status(200).json({ Status: "OK", message: "Language added successfully" });
            }
        }
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/get/all/admin/new/languages/data",adminMiddleware ,async (req, res) =>{
    try{
        const DataFind = await AllLanguagemodule.findOne({});
        if(DataFind){
            const Data = DataFind.lang
            return res.status(200).json({ Data});
        }else{
            return res.status(200).json({ Status: "BAD"});
        }
    }catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.get("/get/all/admin/new/languages/data/user",authMiddleware ,async (req, res) =>{
    try{
        const DataFind = await AllLanguagemodule.findOne({});
        if(DataFind){
            const Data = DataFind.lang
            return res.status(200).json({ Data});
        }else{
            return res.status(200).json({ Status: "BAD"});
        }
    }catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})

app.delete("/delete/all/selected/data/with/onley/one/:lang", async (req, res) =>{
    const lang = req.params.lang;
    try{
        const data = await AllLanguagemodule.findOne({lang : lang})
        if(data){
            await data.updateOne({$pull : {lang : lang}})
            return res.status(200).json({Status : "OK"})
        }else{
            return res.status(200).json({Status : "BAD"})
        }
    }catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
})


const WishSchema = new mongoose.Schema({
    Time: String,
    IP: String,
    City : String,
  }, { timestamps: true });
  
  const WishModule = mongoose.model('Wish_Ip', WishSchema);
  
  
  
  app.post("/wish/to/all/friends/datas/get/all/only", async (req, res) => {
    const { IP, City } = req.body;
    try{
        await WishModule.create({IP, City, Time})
        return res.status(200).json({Status : "OK"})
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
