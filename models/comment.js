var mongoose = require('mongoose')

// 连接数据库
mongoose.connect('mongodb://localhost/abc',{useNewUrlParser:true},function(err){
  if(err){
    console.log('Connect error:' + err)
  }else{
    console.log('Connect success' )
  }
})

var Schema = mongoose.Schema

var userSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  nickname: {
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
  }
})

module.exports = mongoose.model('Comment', userSchema)
