const express = require("express");
const app = express();
const mongoose = require("mongoose");


const cors = require('cors');
app.use(cors());
// Parse JSON bodies
app.use(express.json());
const mongoURL = "mongodb+srv://devblogs:owiEmo84HpiRLKbc@DevBlogs.cc568we.mongodb.net/?retryWrites=true&w=majority"
mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then(() => console.log("Database connected!"))
  .catch(err => console.log(err));
var db = mongoose.connection
 
//NOTES SCHEMA
const notesSchema = new mongoose.Schema({
  userId:{
    type: String, 
    required : true
  },
  title:{
    type: String,
    required : true,
  },
  description:{
    type: String,
    required : true,
  },
    
  time : {
    type : Date,
    value: Date.now
  }
})

const Notes = mongoose.model('Notes', notesSchema)

//USER SCHEMA
const userSchema = new mongoose.Schema({
    // id:{
    //   type: Number,
    //   required:true
    // },
    userId:{
      type : String,
      required: true
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type : String,
      required: true,
    },
    userNotes: [
      {
      type: mongoose.Schema.Types.ObjectId, 
      ref:'Notes'
      }
  ]
  });
  
const User = mongoose.model('User', userSchema);





app.post('/addNote' , async (req,res) => {
  const {title , desc , uName} = req.body
  try{

    const notes = new Notes({
      title ,
      description :desc,
      time: Date.now(),
      userId : uName
    })

    await notes.save()
    
    res.json({msg : "Note Added Successfully" , status : 200})


  }
  catch(err){
    res.json({msg : "Server Failure" , status : 400})
  }
  
})

app.post('/login' , async(req,res) => {
  try{
      const {uName , password} = req.body
      var userAuth = await User.findOne({
        userId : uName 
      })

      if(!userAuth){
        res.json({msg : "User does not exist" , status:400})
      }
      else if(userAuth){
        if(userAuth.password === password)
        res.json({msg : "Logged in Successfully" , status:200})

        else res.json({msg : "Incorrect Password" , status:401})
      }
  }
  catch(err){
    throw err
  }
})

app.post('/newUser' , async(req,res) => {
  try{
  const { uName,name, email, password} = req.body
  var user = await User.findOne({
   userId : uName,
   
  })




  if(user){
    res.json({msg : "Username already taken" , status : 400})
   
  }
 
  else if(!user){
     var user = await User.findOne({
   email
  })

  if(user){
    res.json({msg : "User already exists" , status : 401})
  }
  else{

 
    user = new User({
      name, email, password, userId:uName
    })
    await user.save()
    res.json({msg: "Signup Successfully" , status : 200})
  }} }
  catch (error) {
    console.error('Error creating user:', error);
    res.json({ msg: 'An error occurred while creating the user' ,status: 500 });
  }
 
})

app.get('/readNotes/:id' , (req,res) => {
 
  db.collection('notes').find({userId:req.params.id}).toArray().then(function(notes){
    res.status(200).json(notes)
  }).catch(err => {
    throw(err)
  })

})
app.get('/readNotes' , (req,res) => {
 
  db.collection('notes').find().toArray().then(function(notes){
    res.status(200).json(notes)
  }).catch(err => {
    throw(err)
  })

})


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));