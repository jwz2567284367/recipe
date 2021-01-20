// pages/my/my.js
import api from "../../utils/api"
import config from "../../utils/config"
Page({
  data: {
    activeIndex: '0',
    userInfo: {},
    isLogin: true, //是否登录。 false 未登录  true，已经登录
    recipes: [],
    lists: [],
  },
  // 检测是否登录
  onShow() {
    wx.checkSession({
      success: (res) => {
        let userInfo = wx.getStorageSync('userInfo')
        this.setData({
          isLogin: true,
          userInfo
        })
      },
      fail: () => {
        this.setData({
          isLogin: false
        })
        wx.showToast({
          title: '请先登录',
          icon: "none"
        })
      }
    })
    this._getmenulist()
  },
  // 执行登录
  _doLogin(e) {
    let _this = this
    // console.log(e);
    if (e.detail.errMsg != "getUserInfo:ok") {
      wx.showToast({
        title: '登录之后才能发布菜谱',
        icon: "none"
      })
      return
    }
    let userInfo = e.detail.userInfo
    console.log(userInfo);
    // 执行登录
    wx.login({
      success(res) {
        // console.log(res);
        wx.cloud.callFunction({
          name: "login",
          async success(loginres) {
            // console.log(loginres);
            let _openid = loginres.result.openid
            //  console.log(_openid);
            let result = await api._findall(config.tables.userTable, {
              _openid
            })
            //  console.log(config.tables.userTable,123);
            if (result == null) {
              let address = await api._add(config.tables.userTable, {
                userInfo
              })
              console.log(address);
            }
            wx.showToast({
              title: '登录成功',
            })
            _this.setData({
              isLogin: true,
              userInfo
            })
            wx.setStorageSync('userInfo', userInfo)
            wx.setStorageSync('openid', _openid)
          }
        })
      }
    })
  },
  // 进入菜单管理页面
  _toTypeNamepage() {
    let openid = wx.getStorageSync('openid')
    console.log('openid');
    if (openid != config.mangerId) return
    wx.navigateTo({
      url: '../category/category',
    })
  },
  // 处理遮罩层显示问题
  _delStyle(e) {
    // 获取索引
    let index = e.currentTarget.dataset.index;
    // 将所有的列表都设置不显示
    this.data.recipes.map((item) => {
      item.opacity = 0;
    })
    // 将长按的列表项设置为选中
    this.data.recipes[index].opacity = 1;
    this.setData({
      recipes: this.data.recipes
    })

  },
  // 执行删除操作
  _doDelete(e) {
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    // 如果没有显示删除图标，点击删除，直接返回
    if (!this.data.recipes[index].opacity) return;
    let _this = this;
    wx.showModal({
      title: "删除提示",
      content: "您确定删除么？",
      async success(res) {
        if (res.confirm) {
          //执行删除
          let result = await api._updById(config.tables.recipeTable, id, {
            stats: 0
          })
          _this.data.recipes.splice(index, 1)
          _this.setData({
            recipes: _this.data.recipes
          })
          console.log(result)
        } else {
          //取消删除
          _this.data.recipes[index].opacity = 0;
          _this.setData({
            recipes: _this.data.recipes
          })
        }
      }
    })
  },
  // 跳转发布页面
async  _topbrecipePage() {
       //  去  b-on  查询ison字段的值   如果为true。就可以发布，如果为false，就不能发布
     let reson=await api._findall(config.tables.onTable,{ison:true})
     if(reson==null) return
    wx.navigateTo({
      url: '../pbrecipe/pbrecipe',
    })
  },
  // 切换菜单
  _changemenu(e) {
    let index = e.target.dataset.index
    this.setData({
      activeIndex: index
    })
    this._getchangeinfo()
  },
  //获取切换内容
  _getchangeinfo() {
    let activeIndex = this.data.activeIndex
    switch (activeIndex) {
      case '0':
        this._getmenulist()
        break;
      case '1':
        this._getfollowlist()
        break;
    }
  },
  //获取菜单内容
  async _getmenulist() {
    let _openid = wx.getStorageSync('openid')
    let where = {
      _openid,
      stats: 1
    }
    let res = await api._findall(config.tables.recipeTable, where, {
      field: "time",
      sort: "desc"
    })
    // console.log(res.data);
    if (res == null) return
    res.data.map((item, index) => {
      res.data[index].opacity = 0
    })
    // console.log(res.data);
    this.setData({
      recipes: res.data
    })
  },
  //获取关注内容async
  async _getfollowlist() {
    let _openid = wx.getStorageSync('openid')
    let where = {
      _openid
    }
    let res = await api._findall(config.tables.followTable, where)
    //处理菜谱信息
    let recipes = []
    // console.log(res);
    res.data.map((item, index) => {
      let recipe = api._findById(config.tables.recipeTable, item.recipeid)
      recipes.push(recipe)
    })
    recipes = await Promise.all(recipes)
    res.data.map((item, index) => {
      item.recipe = recipes[index].data
    })

    //获取用户信息
    let users = []
    res.data.map((item, index) => {
      let user = api._findall(config.tables.userTable, {
        _openid: item.recipe._openid
      })
      users.push(user)
    })
    users = await Promise.all(users)
    // console.log(users);
    res.data.map((item, index) => {
      res.data[index].userInfo = users[index].data[0].userInfo
    })

    //  console.log(res.data);

    this.setData({
      lists: res.data
    })

  },
   //去往详情页
   _toDetailPage(e) {
    let {
        title,
        id
    } = e.currentTarget.dataset
    wx.navigateTo({
        url: '../detail/detail?id=' + id + '&title=' + title,
    })
}
})