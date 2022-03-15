require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('./Api/db.js');
const auth = require('./Api/auth')
const blog = require('./Api/blog');
const Blog = require('./Api/model').Blog;
const methodOverride = require('method-override');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

app.set('view engine', 'pug');
app.use(cors({optionsSuccessStatus: 200}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.get('/', (req,res) => {
    res.render("abt")
})  

app.get('/blogs', async (req, res) => {
  const bg = await (await Blog.find()).reverse()
  res.render("index", {det: bg})  
})

app.use('/blogs', blog)
auth(app)

app.listen(3000, () => {
  console.log('server started');
}); 