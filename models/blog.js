var mongoose = require('mongoose')

// 连接数据库
mongoose.connect('mongodb://localhost/test',{useNewUrlParser:true},function(err){
  if(err){
    console.log('Connect error:' + err)
  }else{
    console.log('Connect success' )
  }
})

var Schema = mongoose.Schema

var userSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  created_time: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    required: true
  },
  watcher: {
    type: Number,
    default: 0
  }
})

module.exports = mongoose.model('Blog', userSchema)
