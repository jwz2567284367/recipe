// pages/list/list.js
import api from "../../utils/api"
import config from "../../utils/config"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lists: [],
    page: 1,
    limit: 5,
    isOff: false
  },
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: options.title,
    })
    this.data.id = options.id || null
    this.data.tag = options.tag
    this.data.title = options.title

    this._getRicpes()
  },
  // 根据条件获取不同菜谱列表
  async _getRicpes() {
    let {
      page,
      limit
    } = this.data
    wx.showLoading({
      title: '数据加载中',
      icon: "loading"
    })
    let where = {}
    let orderBy = {}
    switch (this.data.tag) {
      //去往普通列表页条件
      case "publicPage":
        where = {
          stats: 1,
          typeid: this.data.id
        }
        orderBy = {
          field: "time",
          sort: "desc"
        }
        break;
        //去往热门菜谱页条件
      case "hotRecipe":
        where = {
          stats: 1,
        }
        orderBy = {
          field: "views",
          sort: "desc"
        }
        break;
        //去往搜索页条件
      case "search":
        where = {
          stats: 1,
          recipename: api.db.RegExp({
            regexp: this.data.title,
            options: 'i',
          })
        }
        orderBy = {
          field: "time",
          sort: "desc"
        }
        break;
        //点击头像跳转条件
      case "":
        where = {
          stats: 1,
          _openid: this.data.id
        }
        orderBy = {
          field: "time",
          sort: "desc"
        }
        break;
    }
    //查询
    let res = await api._findByPage(config.tables.recipeTable, where, page, limit, orderBy)
    if (res.data.length < limit) {
      this.setData({
        isOff: true
      })
    }
    console.log(res);
    if (res.errMsg == "collection.get:ok") {
      wx.hideLoading({
        success: (res) => {},
      })
    }
    //    根据每个菜谱的openid获取发布的人
    let users = []
    res.data.map((item, index) => {
      let user = api._findall(config.tables.userTable, {
        _openid: item._openid
      })
      users.push(user)
    })
    users = await Promise.all(users)
    // console.log(users);
    res.data.map((item, index) => {
      res.data[index].userInfo = users[index].data[0].userInfo
    })
    res.data = this.data.lists.concat(res.data)
    this.setData({
      lists: res.data
    })
  },
  // 上拉触底事件
  onReachBottom() {
    this.data.page++
    this._getRicpes()
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