const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const User = require('./models/user')
const Blog = require('./models/blog')
const Comment = require('./models/comment')
const MessageBoard = require('./models/messageboard')
const Guest = require('./models/detail')
// const moment = require('moment')

// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, '/uploads')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now())
//   }
// })
// const upload = multer({
//   storage:storage
//   // dest: __dirname + '/uploads'
// })
var upload = multer({ dest: __dirname +'/uploads' })


const router = express.Router()
// =========================================================注册,登录部分==================================================================

// 注册
router.post('/api/register', function (req, res, next) {
  const body = req.body

  User.findOne({ account: body.account, password: body.password },function (err, data) {
    if (err) {
      return next(err)
    }

    if(data) {
      return res.status(200).json({
        err_code: 1,
        message: '帐号已存在'
      })
    }
    new User(body).save(function (err, user) {
      if (err) {
        return next(err)
      }
      

      res.status(200).json({
        err_code: 0,
        message: 'OK'
      })
    })
  })

})

// 获得帐号所有信息->包括权限
router.post('/api/getaccount', function (req, res, next) {

  User.find(function (err, data) {
    if (err) {
      return next(err)
    }

    res.status(200).json({
      err_code: 0,
      message: 'OK',
      data: data
    })
  })
})

// 修改权限
router.post('/api/editaccount', function (req, res, next) {
  const id = req.body.id
  const status = req.body.status

  User.update({_id: id}, { status: status }, function (err, data) {
    if (err) {
      return next(err)
    }

    res.status(200).json({
      err_code: 0,
      message: 'OK',
      data: data
    })
  })
})

// 删除用户
router.post('/api/deleteaccount',function(req,res,nect){

  const id = req.body.id

  User.remove({_id: id}, (err,i) => {
    if(err) {
      return res.status(500).send('Server error.')
    }
    res.status(200).json({
      err_code: 0,
      message: 'OK'
    })
  })
})



// 登录
router.post('/api/login', function (req, res, next) {
  const body = req.body
  User.findOne({
    account: body.account,
    password: body.password
  }, function (err, user) {
    if (err) {
      return next(err)
    }
    // 如果不存在帐号密码
    if (!user) {
      return res.status(200).json({
        err_code: 1,
        message: '帐号或密码不存在'
      })
    }
    // console.log(req.session.user)
    res.status(200).json({
      err_code: 0,
      message: 'OK',
      user: user
    })
  })
})




// =========================================================文章部分==================================================================
// 添加web文章
router.post('/api/addblog',function(req,res,next){
  const body = req.body
  // console.log(body)
  var blog = new Blog({title: body.title,category: body.category, content: body.content})
  blog.content = blog.content.replace(/\<img/gi,'<img class="rich-img" ')

  blog.save(function (err, user) {
    if (err) {
      return next(err)
    }
    res.status(200).json({
      err_code: 0,
      message: 'OK'
    })
  })

})



// 上传文件
router.post('/api/upload',upload.single('file'),async(req,res,next)=>{
  const file = req.file
  // console.log(file)
  file.url = `http://www.azure33.com/uploads/${file.filename}`
  res.send(file)
})



// 获取文章个数
router.post('/api/bloglength',function(req,res) {
  const category = req.body.category

  if(req.body.category === undefined){
    Blog.find(function (err,data) {
      if (err) {
        return res.status(500).send('Server error.')
      }
      res.status(200).json({
        err_code: 0,
        message: 'OK',
        blogslength: data.length
      })
    })
  }else {
    Blog.find({category: category}, function (err,data) {
      if (err) {
        return res.status(500).send('Server error.')
      }
      res.status(200).json({
        err_code: 0,
        message: 'OK',
        blogslength: data.length
      })
    })
  }

})


// 获取文章
router.post('/api/getblog',function(req,res,next){
  // console.log(req.body)
  const start = parseInt(req.body.start)
  const pagesize = parseInt(req.body.pagesize)
  // 判断前端post是否传参数 决定是传全部文章还是选中的
  if(req.body.category === undefined) {
      
    Blog.find().sort({created_time: -1}).skip(start).limit(pagesize).exec(function(err,blogs){
      if (err) {
        return res.status(500).send('Server error.')
      }
      // console.log(blogs)
      // for(let i = 0 ; i < blogs.length ; i++ ){
      //   console.log(typeof blogs[i].created_time)
      //   console.log(typeof moment(blogs[i].created_time).format('YYYY-MM-DD HH:mm:ss'))
      //   blogs[i].created_time = new Date(moment(blogs[i].created_time).format('YYYY-MM-DD HH:mm:ss'))
      // }
      // console.log(blogs)
      res.status(200).json({
        err_code: 0,
        message: 'OK',
        blogs:blogs
      })
    })
    
  }else{
    const category = req.body.category

    Blog.find({category: category}).sort({created_time: -1}).skip(start).limit(pagesize).exec(function (err, blogs) {
      if (err) {
        return res.status(500).send('Server error.')
      }

      res.status(200).json({
        err_code: 0,
        message: 'OK',
        blogs:blogs
      })
    })
  }

})

// 删除web文章
router.post('/api/deleteblog',function(req,res,nect){

  const id = req.body.id

  Blog.remove({_id: id},(err,i) => {
    if(err) {
      return res.status(500).send('Server error.')
    }
    res.status(200).json({
      err_code: 0,
      message: 'OK'
    })
  })
})

// 前端请求文章具体数据
router.get('/api/getblog/:id', (req,res,next) =>{
  // 得到前端请求的id
  let id = req.params.id
  id = mongoose.Types.ObjectId(id)
  // console.log(id)
  // 在Blog中查找这个id的数据
  Blog.find({_id:id}, (err, bloginfo) => {
    let watcher = ++bloginfo[0].watcher
    Blog.update({_id:id},{watcher: watcher},(err,data)=>{})
    if (err) {
      return res.status(500).send('Server error.')
    }
    
    // console.log(bloginfo[0])
    res.status(200).json({
      err_code: 0,
      message: 'OK',
      bloginfo: bloginfo
    })
  })
})

// 更新文章数据
router.post('/api/updateblog/:id',function(req,res,next){
  // 得到前端请求的id
  const id = req.params.id
  // 在Blog中查找这个id的数据 更新
  Blog.update({_id: id}, {title: req.body.title, content: req.body.content, category: req.body.category}, (err) => {
    if (err) {
      return res.status(500).send('Server error.')
    }
    res.status(200).json({
      err_code: 0,
      message: 'OK'
    })
  })
})

// ===========================================================文章评论部分===========================================================================

// 上传评论
router.post('/api/comment',function(req,res,next){
  const body = req.body
  // console.log(body)
  // body.id = mongoose.Types.ObjectId(body._id)
  // console.log(body)
  new Comment(body).save(function (err, data) {
    if (err) {
      return next(err)
    }
    res.status(200).json({
      err_code: 0,
      message: 'OK'
    })
  })

})

// 前端请求评论数据
router.get('/api/comment/:id',function(req,res,next){
  // 得到前端请求的id
  const id = req.params.id
  // 在Blog中查找这个id的数据
  Comment.find({id}, (err, comment) => {
    if (err) {
      return res.status(500).send('Server error.')
    }
    res.status(200).json({
      err_code: 0,
      message: 'OK',
      comment: comment
    })
  })
})

// ===========================================================messagboard留言板部分========================================================================
router.get('/api/getmessageboard',function(req,res,next){

  MessageBoard.find((err, data) => {
    if (err) {
      return res.status(500).send('Server error.')
    }
    data.reverse()
    res.status(200).json({
      err_code: 0,
      message: 'OK',
      data: data
    })
  })
})

router.post('/api/addmessageboard',function(req,res,next){
  const body = req.body
  // console.log(body)
  new MessageBoard(body).save((err, data) => {
    if (err) {
      return res.status(500).send('Server error.')
    }
    res.status(200).json({
      err_code: 0,
      message: 'ok'
    })
  })
})

router.post('/api/deletemessageboard',function(req,res,next){

  const id = req.body.id
  // console.log(id)

  MessageBoard.remove({_id:id}, (err, data) => {
    if (err) {
      return res.status(500).send('Server error.')
    }
    res.status(200).json({
      err_code: 0,
      message: 'ok'
    })
  })
})

// =====================================================访客=======================================================================
router.get('/api/guest',function(req,res,next){

  Guest.findById('5dc97a722c338bcfcc86458c',(err,data)=>{
    ++data.guest
    // 持久化到数据库中
    Guest.update({_id:'5dc97a722c338bcfcc86458c'},{guest: data.guest},(err,data)=>{})

    if (err) {
      return res.status(500).send('Server error.')
    }
    res.status(200).json({
      err_code: 0,
      message: 'ok',
      data
    })
  
  })
})

module.exports = router
