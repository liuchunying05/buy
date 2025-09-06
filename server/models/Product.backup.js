const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '商品名称不能为空'],
    trim: true,
    minlength: [2, '商品名称至少2个字符'],
    maxlength: [50, '商品名称最多50个字符']
  },
  price: {
    type: Number,
    required: [true, '商品价格不能为空'],
    min: [0, '价格不能小于0']
  },
  image: {
    type: String,
    required: [true, '商品图片不能为空']
  },
  description: {
    type: String,
    required: false,
    trim: true,
    default: '暂无描述',
    maxlength: [500, '商品描述最多500个字符']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Product', productSchema); 