const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const authRoutes=require('./routes/authRoutes');
const cookieParser = require("cookie-parser");
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
const Task = require('./models/tasks');
const path = require("path");



const app = express();

const PORT=process.env.PORT || 3000;

const publicStaticDirPath = path.join(__dirname, './public')

// middleware
app.use(express.static(publicStaticDirPath));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));



// view engine
app.set('view engine', 'ejs');

const dbURI = 'mongodb+srv://Advait:ZOUS5Ljvwzf5Foku@cluster0.0bbfe.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true})
  .then((result) => app.listen(PORT, () => console.log('Server is up and running on port : ',PORT)))
  .catch((err) => console.log(err));

// routes
app.get('*',checkUser);
app.get('/',(req, res) => res.render('home',{title:'Home'}));
app.get('/dashboard',requireAuth,(req, res) => res.render('dashboard',{title:'Dashboard'}));
app.get('/courses',requireAuth,(req, res) => res.render('courses',{title:'Courses'}));
app.get('/coursePage',requireAuth,(req, res) => res.render('coursePage',{title:'Courses'}));
app.get('/tasks',requireAuth,(req, res) => res.render('tasks',{title:'Manage Tasks'}));
app.get('/userProfile',requireAuth,(req, res) => res.render('userProfile',{title:'User Profile'}));



app.get('/tasks/create', (req, res) => {
  res.render('newTask', { title: 'Create a new Task' });
});

app.get('/tasks', (req, res) => {
  Task.find().sort({ createdAt: -1 })
    .then(result => {
      res.render('tasks', { tasks: result, title: 'All Tasks' });
    })
    .catch(err => {
      console.log(err);
    });
});

app.post('/newTask', (req, res) => {
  // console.log(req.body);
  const task = new Task(req.body);

  task.save()
    .then(result => {
      res.redirect('/tasks');
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/tasks/:id', (req, res) => {
  const id = req.params.id;
  Task.findById(id)
    .then(result => {
      res.render('details', { tasks: result, title: 'Task Details' });
    })
    .catch(err => {
      console.log(err);
    });
});

app.delete('/tasks/:id', (req, res) => {
  const id = req.params.id;
  
  Task.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/tasks' });
    })
    .catch(err => {
      console.log(err);
    });
});



app.use(authRoutes);
