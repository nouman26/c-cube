var express = require('express');
var path = require('path');
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
const ProgSchema=Schema.ProgSchema;

// Connection with different Db
const myProgram = mongoose.connection.useDb('program');

// create model
const prog_model=myProgram.model("program",ProgSchema);


router.post('/',function(req,res){
    res.render("registration details")
})

router.post('/quiz',function(req,res){
    var filter_prog=prog_model.find({quiz:"Quiz"});
    filter_prog.exec(function(err,data){
        res.render("program_wise_student_list",{read:data})
    })
});

router.post('/speed_programming',function(req,res){
    var filter_prog=prog_model.find({sp:"Speed Programming"});
    filter_prog.exec(function(err,data){
        res.render("program_wise_student_list",{read:data})
    })
});

router.post('/tik_tok',function(req,res){
    var filter_prog=prog_model.find({Tk:"Tiktok"});
    filter_prog.exec(function(err,data){
        res.render("program_wise_student_list",{read:data})
    })
});

router.post('/graphic_designing',function(req,res){
    var filter_prog=prog_model.find({gd:"Graphic Designing"});
    filter_prog.exec(function(err,data){
        res.render("program_wise_student_list",{read:data})
    })
});

router.post('/web_designing',function(req,res){
    var filter_prog=prog_model.find({wd:"Web Designing"});
    filter_prog.exec(function(err,data){
        res.render("program_wise_student_list",{read:data})
    })
});

router.post('/technical_presentation',function(req,res){
    var filter_prog=prog_model.find({TP:"Technical Presentation"});
    filter_prog.exec(function(err,data){
        res.render("program_wise_student_list",{read:data})
    })
});

module.exports=router;