const Blog = require('./model.js').Blog;
const express = require('express');
const router = express.Router();
const Com = require('./model.js').Com;
const app = express()

router.get('/:slug', async (req,res) => {
    const data = await Blog.findOne({slug: req.params.slug}) 
    if(data == null) res.redirect('/blogs')
    res.render('show', {blog: data})
})

router.get('/admin/login', (req, res) => {
    res.render('login')
})

router.get('/admin/sign', (req, res) => {
    res.render('sign')
})

router.post('/', async (req, res, next) => {
    req.blog = new Blog() 
    next()
}, saveAndRedirect('new'))

router.put('/:id', async(req, res , next) => {
    req.blog = await Blog.findOne({slug: req.params.id})
    next()
}, saveAndRedirect('edit'))

router.delete('/delete/:id', async (req,res) => {
    await Blog.findByIdAndDelete(req.params.id)
    res.redirect('/blogs/s/u')
})

router.delete('/delete/com/:bid/:cid', async (req,res) => {
    await Blog.comment.findByIdAndDelete(req.params.bid)
    res.redirect(`/blogs/${blog.slug}`)
})

router.route('/com/add/:id').post(function(req, res){
    let bookid = req.params.id;
    let ucom = req.body.comment
    const text = new Com({comment: ucom})
    if(!ucom){
      res.send("missing required field comment")
      return;
    } 
    Blog.findById(bookid, (err, bdata) => {
      if(!bdata){
        res.send("no book exists")
      } else {
          bdata.comment.push(text);
          bdata.save()
          res.redirect(`/blogs/${bdata.slug}`)
      }
    });
})

function saveAndRedirect() {
    return async (req, res) => {
        let blog = req.blog
        blog.title = req.body.title
        blog.description =  req.body.description
        blog.markdown =  req.body.markdown
        blog.date = new Date().toLocaleDateString()
        try {
            blog = await blog.save()
            res.redirect(`/blogs/su/${blog.slug}`)
        } catch (e) {
            console.log(e)
            res.render('new', {blog: blog , error: "Make sure to fill all the fields"})
        }
    }
}

module.exports = router