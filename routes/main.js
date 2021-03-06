var express = require('express');
var path = require('path');
const nodemailer=require("nodemailer");
const bodyParser=require("body-parser");
const multer = require("multer");
const mongoose=require('mongoose');
var Schema=require("../models/schema");
var router = express.Router();

var app = express();

// Body Parsers
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

// Schemas of DB's
const studentInfoSchema=Schema.studentInfoSchema;
const ProgSchema=Schema.ProgSchema;
const PaymentSchema=Schema.paymentSchema;

// Connection with different Db
const studentInfo = mongoose.connection.useDb('student_info');
const myProgram = mongoose.connection.useDb('program');
const myPayment = mongoose.connection.useDb('payment');

// create model
const studentInfo_model=studentInfo.model("student_info",studentInfoSchema);
const prog=myProgram.model("program",ProgSchema);
const pay_before_verification=myPayment.model("payment_before_verification",PaymentSchema);
const pay_after_verification=myPayment.model("payment_after_verification",PaymentSchema);

router.get('/', function(req, res) {
    res.render('index');
  });

var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "noumanarain0@gmail.com",
        pass: "03022106768"
    }
  });
  /*------------------SMTP Over-----------------------------*/ 

var rand,mailOptions,host,link;
var name,roll_no,cnic,department,phone_no,email;

router.post('/',function(req,res){
    rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/program?id="+rand;
    mailOptions={
      to : req.body.email,
      subject : "Please confirm your Email account",
      html: `<body style="background-color: #101b31">
      <div style="text-align: center;">
        <h2 style="font-size: 45px; color: #53beec; padding-top: 60px; font-family: sans-serif; margin-bottom: 0px;" >C-CUBE</h2>
        <p style=" color: #996e39; font-size: 15px; font-family: sans-serif; margin-top: -35px !important;">Computing-competitions-Creativity</p>
      </div>
       
      <div style="text-align: center; width: 100%; margin-right: auto; margin-left: auto;">
        <div style="color: white; border-radius: 6px;
            margin-top: 20px; margin-bottom: 30px; padding: 30px 30px;">
              <h3 style="color: white; font-size: 24px; margin-top: 20px; margin-bottom: 10px; font-family: sans-serif;
                        font-weight: 500;" >Hello,</h3>
    
              <h3 style="color: white ;font-size: 23px; margin-top: 20px; margin-bottom: 10px; font-family: sans-serif;
                        font-weight: 500;" >Please Click on the link to verify your email</h3>
              <a style="color: white;font-size: 20px; " href=${link}>Click here to verify</a>
        </div>
      </div>
    </body>`
    }
    smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log(error);
      res.end("error");
    }
    else{
      name=req.body.username;
      roll_no=req.body.roll_no;
      cnic=req.body.cnic;
      department=req.body.department;
      phone_no=req.body.phone_no;
      email=req.body.email;
      res.render("verification");
      res.end()
     }
    });
});

  /* GET Program page after verification. */
router.get('/program',function(req,res){
    mongoose.set('useFindAndModify', false);
    if((req.protocol+"://"+req.get('host'))==("http://"+host))
    {
        if(req.query.id==rand)
        {
            var filter_info=studentInfo_model.findOne({cnic:cnic});
            filter_info.exec(function(err,data){
            if (err) throw error;
            if(data==null || data == "" || data==undefined){
                const newStudent= new studentInfo_model({
                    name: name,
                    roll_no: roll_no,
                    cnic: cnic,
                    department: department,
                    email: email,
                    phone_no: phone_no
                })
                newStudent.save();
            }
            else{
                var filter_Info_update=studentInfo_model.findOneAndUpdate(cnic,{
                    name: name,
                    roll_no: roll_no,
                    cnic: cnic,
                    department: department,
                    email: email,
                    phone_no: phone_no
                });
                filter_Info_update.exec();
            }
            })
            rand=null;
            res.render("program",{cnic:cnic,name:name,roll_no: roll_no});
        }
        else
        {
            res.render("non_verification")
        }
    }
    else
    {
        res.redirect('/');
    }
});

var t;
router.post("/payment",function(req,res){
    mongoose.set('useFindAndModify', false);
    var filter_details=prog.findOne({cnic:req.body.cnic});
    filter_details.exec(function(err,data){
        if (err) throw error;
        if(data==null || data == "" || data==undefined){
            const newStudent= new prog({
                name:req.body.name,
                roll_no:req.body.roll_no,
                cnic:req.body.cnic,
                quiz: req.body.quiz,
                TP:req.body.TP,
                wd:req.body.wd,
                gd:req.body.gd,
                sp:req.body.sp,
                TK:req.body.TK,
                fees:req.body.total
            })
            newStudent.save();
        }
        else{
            var filter_details_update=prog.findOneAndUpdate(req.body.cnic,{
                name:req.body.name,
                roll_no:req.body.roll_no,
                cnic:req.body.cnic,
                quiz: req.body.quiz,
                TP:req.body.TP,
                wd:req.body.wd,
                gd:req.body.gd,
                sp:req.body.sp,
                TK:req.body.TK,
                fees:req.body.total
            });
            filter_details_update.exec();
        }
    })
    t=0;
    res.render("payment",{name:req.body.name,roll_no:req.body.roll_no,cnic:req.body.cnic,fees:req.body.total})
});

// for file upload
var Storage=multer.diskStorage({
    destination:"./public/reciepts/",
    filename:(req,file,cb)=>{
        cb(null,req.body.cnic+path.extname(file.originalname))
    }
})
var upload=multer({
    storage:Storage
}).single('receipt');

router.post("/thanks",upload,function(req,res){
    if(t==0){
        const new_before_payment=new pay_before_verification({
            name:req.body.name,
            roll_no:req.body.roll_no,
            cnic:req.body.cnic,
            ac_type: req.body.ac_type,
            ac_number: req.body.ac_number,
            tid:req.body.tid,
            fees:req.body.fees,
            date:req.body.date,
            image:req.file.filename
        })
        new_before_payment.save();
        
        const new_after_payment=new pay_after_verification({
            name:req.body.name,
            roll_no:req.body.roll_no,
            cnic:req.body.cnic,
            ac_type: req.body.ac_type,
            ac_number: req.body.ac_number,
            tid:req.body.tid,
            fees:req.body.fees,
            date:req.body.date,
            image:req.file.filename
        })
        new_after_payment.save();
        t++;
    }
    res.render("thanks")
});

module.exports=router;