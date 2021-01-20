// pages/detail/detail.js
import api from "../../utils/api"
import config from "../../utils/config"
let _ = api.db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recipes: {},
    isFollow: false
  },
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: options.title,
    })
    this.data.id = options.id
    this._getRecipes()
  },
  // 处理获取分类
  async _getRecipes() {
    // 处理获取分类名称
    let res = await api._findById(config.tables.recipeTable, this.data.id)
    // console.log(res);
    let typeid = res.data.typeid
    let typeres = await api._findById(config.tables.typeTable, typeid)
    // console.log(typeres);
    res.data.typeName = typeres.data.typeName

    // 处理用户信息
    let users = await api._findall(config.tables.userTable, {
      _openid: res.data._openid
    })
    console.log(users);
    res.data.userInfo = users.data[0].userInfo
    //根据当前菜谱id，更新views字段，每次+1
    api._updById(config.tables.recipeTable, this.data.id, {
      views: _.inc(1)
    })
    //更新页面数据
    res.data.views += 1
    //处理follows字段
    //判断是否登录
    let _openid = wx.getStorageSync("openid") || null
    //未登录
    if (_openid == null) {
      this.setData({
        isFollow: false,
        recipes: res.data
      })
      return
    }
    //已登录
    let where = {
      _openid,
      recipeid: this.data.id
    }
    let result = await api._findall(config.tables.followTable, where)
    if (result == null) {
      // 未关注
      this.setData({
        isFollow: false,
        recipes: res.data
      })
    } else {
      //获取进入详情页，已经登录，已经关注，获取当前关注id
      this.data.followid=result.data[0]._id
      this.setData({
        isFollow: true,
        recipes: res.data
      })
    }



  },
  //执行/取消关注
  async _doFollow() {
    //判断是否登录
    let _openid = wx.getStorageSync("openid") || null
    //未登录
    if (_openid == null) {
      wx.showToast({
        title: '请先登录再关注',
        icon: "none"
      })
      return
    }

    if (this.data.isFollow) {
      //取消关注
      // 删除关注表
let res=await api._delById(config.tables.followTable,this.data.followid)
// console.log(res);
if(res.stats.removed){
  let updres = await api._updById(config.tables.recipeTable, this.data.id, {
    follows: _.inc(-1)
  })
  this.data.recipes.follows--
  //执行关注之后，保存返回来的关注的id
  this.data.followid=res._id
  this.setData({
    isFollow: false,
    recipes: this.data.recipes
  })
}
    } else {
      //执行关注
      let res = await api._add(config.tables.followTable, {
        recipeid: this.data.id
      })
      // console.log(res);
      if (res._id) {
        let updres = await api._updById(config.tables.recipeTable, this.data.id, {
          follows: _.inc(1)
        })
        this.data.recipes.follows++
        //执行关注之后，保存返回来的关注的id
        this.data.followid=res._id
        this.setData({
          isFollow: true,
          recipes: this.data.recipes
        })
      }
    }
  }




})