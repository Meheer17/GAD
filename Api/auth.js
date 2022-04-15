const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const session = require('express-session');
const ObjectID = require('mongodb').ObjectId;
const myDB = require('./connections');
const Blog = require('./model.js').Blog;

module.exports = function(app) {

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  //   store: store,
    cookie: { secure: false },
    key: 'express.sid'
  }));

    app.use(passport.initialize());
    app.use(passport.session());

    myDB(async (client) => {

      const adn = await client.db('myFirstDatabase').collection('LS');
    
      app.route('/login').post(passport.authenticate('local', 
        { failureRedirect: "/"}), (req, res) => {
            res.redirect('/blogs/s/u');
      });
    
      app.route('/blogs/add/new-blog').get(ensureAuthenticated, async (req,res) => {
        res.render("new", {blog : new Blog({title: "", description: "", markdown: ""})})
      })
      app.route('/blogs/s/u').get(ensureAuthenticated, async (req,res) => {
          const bg = await (await Blog.find()).reverse()
          res.render("index", {det: bg, user:true}) 
      })
        app.route('/blogs/su/:slug').get(ensureAuthenticated, async (req,res) => {
            const data = await Blog.findOne({slug: req.params.slug}) 
            if(data == null) res.redirect('/blogs')
            res.render('show', {blog: data, user: true})
        })

      app.route('/blogs/edit/:id').get(ensureAuthenticated, async (req,res) => {
        const blog = await Blog.findOne({slug: req.params.id})
        if (blog == null) res.redirect('/blogs')
        res.render("edit", {blog: blog})
      })
    
      app.route('/logout').get((req, res) => {
        req.logout();
        res.redirect('/');
      });

    app.get('/admin/sign',ensureAuthenticated,  (req, res) => {
        res.render('sign')
    })
        
      app.route('/register').post( ensureAuthenticated,
        (req, res, next) => {
          const hash = bcrypt.hashSync(req.body.password, 12);
          adn.findOne({ username: req.body.username }, function (err, user) {
            if (err) {
              next(err);
            } else if (user) {
              res.render('login', {error: "Username already exists"});
            } else {
              adn.insertOne({ username: req.body.username, password: hash }, (err, doc) => {
                if (err) {
                  res.render('sign-up', {error: "There was an error"});
                } else {
                  next();
                }
              });
            }
          });
        },
        passport.authenticate('local', { failureRedirect: '/' }),
        (req, res, next) => {
          res.redirect('/blogs/add/new-blog');
        }
      );
      
        passport.serializeUser((user, done) => {
            done(null, user._id);
        });
    
        passport.deserializeUser((id, done) => {
            adn.findOne({ _id: new ObjectID(id) }, (err, doc) => {
                done(null, doc);
            });
        });   
    
        passport.use(new LocalStrategy(
            (username, password, done) => {
                adn.findOne({username: username}, (err, user) => {
                    console.log("User " + username + " attempted to login");
                    if (err) {return done(err); }
                    if (!user) {return done(null, false);}
                    if (!bcrypt.compareSync(password, user.password)) {return console.log("pas er"), done(null, false);}
                    return done(null, user)
                });
            }
        ));
    
    
    }).catch((e) => {
      app.route('/').get((req, res) => {
        res.redirect('/');
      });
    });
    
    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) {
        res.locals.user = req.user
        return next()
      }
      res.redirect('/')
    }
}   