const mongoose=require("mongoose");
// mongoose.connect('mongodb://localhost:27017/default', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect('mongodb+srv://asdfghjkl:asdfghjkl@nouman.ca2u5.mongodb.net/default?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true});

const signschema = new mongoose.Schema({
    name: String,
    email: String,
    password:String
  });

const studentInfoSchema = new mongoose.Schema({
  name: String,
  roll_no:String,
  cnic:String,
  department:String,
  email:String,
  phone_no:String,
});

const ProgSchema = new mongoose.Schema({
    name:String,
    roll_no:String,
    cnic:String,
    quiz: String,
    TP:String,
    wd:String,
    gd:String,
    sp:String,
    TK:String,
    fees:String
  });

const paymentSchema = new mongoose.Schema({
    name:String,
    roll_no:String,
    cnic:String,
    ac_type: String,
    ac_number:String,
    tid:String,
    fees:String,
    date:String,
    image:String
});

module.exports.signschema=signschema;
module.exports.studentInfoSchema=studentInfoSchema;
module.exports.ProgSchema=ProgSchema;
module.exports.paymentSchema=paymentSchema;