// pages/search/search.js
import api from "../../utils/api"
import config from "../../utils/config"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchVal: '',
    searchs: [],
    hotSearchs: []
  },
  _toListPage(e) {
    let tag = "search"
    let title = e.target.dataset.title || this.data.searchVal
    if (title == '') {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      })
      return
    }
    let searchs = wx.getStorageSync('searchs') || []
    let index = searchs.indexOf(title)
    if (index == -1) {
      searchs.unshift(title)
    } else {
      searchs.splice(index, 1)
      searchs.unshift(title)
    }
    wx.setStorageSync('searchs', searchs)
    wx.navigateTo({
      url: '../list/list?tag=' + tag + '&title=' + title,
    })
  },
  onShow() {
    this._getSearchs()
    this._getHotSearchs()
  },
  // 获取近期搜索
  _getSearchs() {
    let searchs = wx.getStorageSync('searchs') || []
    this.setData({
      searchs
    })
  },
  //获取热门搜索
  async _getHotSearchs() {
    let res = await api._findByPage(config.tables.recipeTable, {
      stats: 1
    }, 1, 6, {
      field: "views",
      sort: "desc"
    })
    // console.log(res);
    this.setData({
      hotSearchs: res.data
    })
  }

})