// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')


// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: "test1-5gjipg6526148ba1"
})
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return {  
    openid: wxContext.OPENID,
  }
}

