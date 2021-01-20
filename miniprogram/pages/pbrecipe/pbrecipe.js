// pages/pbrecipe/pbrecipe.js
import api from "../../utils/api"
import config from "../../utils/config"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    files: [],
    types: []
  },
  onLoad() {
    this._getType()
  },
  async _getType() {
    let res = await api._findall(config.tables.typeTable)
    this.setData({
      types: res.data
    })
  },
  // 选择上传的图片
  _chooseImg(e) {
    // console.log(e);
    let tempFilePaths = e.detail.tempFilePaths
    let files = tempFilePaths.map(item => {
      return {
        url: item
      }
    })
    // console.log(files);
    files = this.data.files.concat(files)
    this.setData({
      files
    })

  },
  // 删除所选图片
  _delChooseImg(e) {
    console.log(e);
    let index = e.detail.index
    this.data.files.splice(index, 1)
  },
  // 提交发布菜谱
  async _doSubmit(e) {
    //  //  去  b-on  查询ison字段的值   如果为true。就可以发布，如果为false，就不能发布
    //  let reson=await api._findall(config.tables.onTable,{ison:true})
    //  console.log(reson);
    //  if(reson==null) return
   
    let {
      makes,
      recipename,
      typeid
    } = e.detail.value
    console.log(e);
    if (makes == '' || recipename == '' || this.data.files.length <= 0) {
      wx.showToast({
        title: '请补全信息',
        icon: "none"
      })
    }
    let pics = await this._updfiles(this.data.files)
    console.log(pics);
    let follows = 0,
      views = 0,
      stats = 1,
      time = new Date().getTime()
    // 插入数据库
    let res =await api._add(config.tables.recipeTable, {
      makes,
      recipename,
      typeid,
      pics,
      follows: 0,
      views: 0,
      stats: 1,
      time: new Date().getTime()
    })
// console.log(res);
    if (res._id) {
      wx.showToast({
        title: '发布成功',
      })
      setTimeout(()=>{
        wx.navigateBack({
          delta: 1,
        })
      },1500)
    } else {
      wx.showToast({
        title: '发布失败',
        icon: "none"
      })
    }
  },
  // 多文件上传
  async _updfiles(files) {
    let pics = []
    files.map((item, index) => {
      let extname = item.url.split(".").pop()
      let cloudPath = "web0824/" + new Date().getTime() + "." + extname
      let pic = wx.cloud.uploadFile({
        cloudPath,
        filePath: item.url,
      })
      pics.push(pic)
    })
    pics = await Promise.all(pics)
    // pics.map(item => {
    //   return item.fileID
    // })
    return pics

  }
})