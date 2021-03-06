var express = require('express');
var path = require('path');
const nodemailer=require("nodemailer");
const bodyParser=require("body-parser");
const mongoose=require('mongoose');
var fs = require('fs');
var Schema=require("../models/schema")
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
const admin_signSchema=Schema.signschema;
const PaymentSchema=Schema.paymentSchema;

// Connection with different Db
const studentInfo = mongoose.connection.useDb('student_info');
const myProgram = mongoose.connection.useDb('program');
const admin = mongoose.connection.useDb('admin_info');
const myPayment = mongoose.connection.useDb('payment');

// create model
const studentInfo_model=studentInfo.model("student_info",studentInfoSchema);
const prog_model=myProgram.model("program",ProgSchema);
const signin_model=admin.model("admin",admin_signSchema);
const pay_before_verification=myPayment.model("payment_before_verification",PaymentSchema);
const pay_after_verification=myPayment.model("payment_after_verification",PaymentSchema);

var messagesignin="";

var s,state;


var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
      user: "noumanarain0@gmail.com",
      pass: "03022106768"
  }
});

var rand,mailOptions,host,link;

router.get('/', function(req, res) {
    s=0;
    res.render('signin',{msgsignin:messagesignin});
    messagesignin="";
  });


// middleware for clients to check signin
var validation_signin=function(req,res,next){
    if(s!==0){
      next(); 
    }
    else{
      s++;
      var para={$and:[{email:req.body.email.trim()},{password:req.body.password.trim()}]}
      var filter=signin_model.find(para)
      filter.exec(function(err,data){
          if (err) throw error;
          if (data=="" || data==null || data==undefined){
              s=0;
              messagesignin="Your email/password is incorrect!";
              res.redirect('/admin');
          }
          else{
              messagesignin="";
              next()
          }
      })
  }
}

router.post('/',validation_signin, function(req, res) {
    var filter_data=pay_before_verification.find();
    filter_data.exec(function(err,data){
      if (err) throw error;
      res.render("registration_request",{read:data})
    })
});

// Accept or reject candidate Requests
router.post('/accrej',function(req,res){
  var r=req.body.arbtn.split(".");
  var filter_email=studentInfo_model.findOne({cnic:r[0]});
  var filter_data=pay_before_verification.findOne({cnic:r[0]});

  if(r[1]=="accept"){
    state="Accepted";
    var delete_data=pay_before_verification.findOneAndDelete({cnic:r[0]});
    delete_data.exec();
  }
  else{
    state="Rejected Because you provide wrong payment Information"
    filter_data.exec(function(err,data){
      if (err) throw error;
      fs.unlinkSync(path.join(__dirname, "../public/reciepts/",data.image));
    });
    prog_model.findOneAndDelete({cnic:r[0]}).exec();
    pay_before_verification.findOneAndDelete({cnic:r[0]}).exec();
    pay_after_verification.findOneAndDelete({cnic:r[0]}).exec();
  }
  filter_email.exec(function(err,data){
    if (err) throw error;
    host=req.get('host');
    mailOptions={
      to : data.email,
      subject : "C Cube form",
      html: `<body style="background-color: #101b31">
      <div style="text-align: center;">
        <h2 style="font-size: 45px; color: #53beec; padding-top: 60px; font-family: sans-serif; margin-bottom: 0px;" >C-CUBE</h2>
        <p style=" color: #996e39; font-size: 15px; font-family: sans-serif; margin-top: -35px !important;">Computing-competitions-Creativity</p>
      </div>
      
      <div style="text-align: center; width: 100%; margin-right: auto; margin-left: auto;">
        <div style="color: white; border-radius: 6px;
            margin-top: 20px; margin-bottom: 30px; padding: 30px 30px;">
              <h3 style="color: white; font-size: 24px; margin-top: 20px; margin-bottom: 10px; font-family: sans-serif;
                        font-weight: 500;" >Hi !,</h3>
    
              <h3 style="color: white ;font-size: 23px; margin-top: 20px; margin-bottom: 10px; font-family: sans-serif;
                        font-weight: 500;" >Your form has been ${state}</h3>

              <h3 style="color: white ;font-size: 23px; margin-top: 20px; margin-bottom: 10px; font-family: sans-serif;
                        font-weight: 500;" >Thank You !!</h3>
        </div>
      </div>
    </body>`
    }
    smtpTransport.sendMail(mailOptions, function(error, res){
    if(error){
      console.log(error);
      res.end("error");
    }
    else{
      res.render("verification");
      res.end()
    }
  });
});
  if(r[1]=="reject"){
    studentInfo_model.findOneAndDelete({cnic:r[0]}).exec();
  }
  res.redirect(307,'back');
})

router.post('/viewdetails',function(req,res){
  var filter_info=studentInfo_model.findOne({cnic:req.body.cnic});
  var filter_prog=prog_model.findOne({cnic:req.body.cnic});
  var filter_pay=pay_after_verification.findOne({cnic:req.body.cnic});
  filter_info.exec(function(err,data){
    filter_prog.exec(function(err,data1){
      filter_pay.exec(function(err,data2){
        res.render("student_details",{info:data,prog:data1,pay:data2})
      })
    })
  })
})

router.post('/new_admin_requests',function(req,res){
  res.render("new_admin_request")
})


module.exports=router;