import api from "../../utils/api"
import config from "../../utils/config"
Page({
    data: {
        types: [],
        recipes: [],
    },
    onShow() {
        this._getHotRecipes();
        this._getType()
    },
    // 获取热门菜谱信息
    async _getHotRecipes() {
        let res = await api._findByPage(config.tables.recipeTable, {
            stats: 1
        }, 1, 4, {
            field: "views",
            sort: "desc"
        })

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
        //  console.log(res.data);
        this.setData({
            recipes: res.data
        })


    },
    //    获取首页分类信息
    async _getType() {
        let res = await api._findByPage(config.tables.typeTable, {}, 1, 3, )
        res.data.map(item => {
            item.src = "../../imgs/index_09.jpg"
            item.tag = "publicPage"
        })
        let type = {
            typeName: "动漫分类",
            src: "../../imgs/index_05.jpg",
            tag: "typePage"
        }
        res.data.unshift(type)
        // console.log(res);
        this.setData({
            types: res.data
        })

    },
    // 点击菜单跳转对应界面
    _toTypePage(e) {
        let {
            tag,
            id,
            title
        } = e.currentTarget.dataset
    //  console.log(tag);
        if (tag == "typePage") {
            wx.navigateTo({
                url: '../type/type',
            })
        } else {
            wx.navigateTo({
                url: '../list/list?id=' + id + "&title=" + title + "&tag=" + tag,
            })
        }
    },
    //跳转详情页
    _toDetailPage(e) {
        let {
            title,
            id
        } = e.currentTarget.dataset
        wx.navigateTo({
            url: '../detail/detail?id=' + id + '&title=' + title,
        })
    },
    //点击头像跳转对应的列表页
    _toUserPage(e){
        let {title,tag,id}= e.currentTarget.dataset
wx.navigateTo({
  url: '../list/list?id='+ id + '&title=' + title+'&tag='+tag,
})
    }
})