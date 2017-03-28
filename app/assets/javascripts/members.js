//監聽器 文件讀取完畢 本文開始
document.addEventListener('DOMContentLoaded',()=>{
  // Vue 元件
  MEMBER.Vue = new Vue({
    el: '#members-content',
    data: {
      members: null,
      edit:{
        id: null,
        col: null,
        value: null,
        title: null,
        token: null,
        tryCount: 0
      },
    },
    mounted: function(){
      this.getMembers()
    },
    methods:{
      showTooltip: function(text) {
        SHARE.showTooltip(text)
      },
      hideTooltip: function() {
        SHARE.hideTooltip()
      },
      getMembers: function() {
        SHARE.workQueue++
        SHARE.showLoading()
        this.$http.get('/members.json').then(response => {
          this.members = response.body.members
          this.edit.token = response.body.token
          SHARE.workQueue--
          SHARE.showLoading()
        }, response => {
          SHARE.pushMsg("發生錯誤，成員獲取失敗")
          SHARE.workQueue--
          SHARE.showLoading()
        })
      },
      mailTo: function (address) {
        window.location = `mailto:${address}`
      }
    }
  })
  let member = Vue.extend({
    props: ['id', 'name', 'title', 'resp', 'ext', 'mail'],
    methods: {
      showTooltip: function(text) {
        MEMBER.Vue.showTooltip(text)
      },
      hideTooltip: function() {
        MEMBER.Vue.hideTooltip()
      },
      mailTo: function(address) {
        MEMBER.Vue.mailTo(address)
      }
    },
    template: `
      <div class="cTableRow z1" :data-id="id">
        <div class="cTableCell name">
          {{name}}
        </div>
        <div class="cTableCell title">
          {{title}}
        </div>
        <div v-html="resp" class="cTableCell resp">
          {{resp}}
        </div>
        <div class="cTableCell ext">{{ ext }}</div>
        <div class="cTableCell mail" @mouseenter="showTooltip('寄信給此人')" @mouseleave="hideTooltip" @click="mailTo(mail)">
          <svg class="mail-icon">
            <use xlink:href="/assets/icon/icons.svg#mail"></use>
          </svg>{{mail}}
        </div>
      </div>
    `
  })
  Vue.component('member', member)
  // 預先選取元素
  MEMBER.list = document.getElementById("member-list") // 成員名單
  if (document.cookie) { // cookie 不爲空
    let cookieArray = document.cookie.split(';')
    let cookieAttrs = {} // 建立一object用以parse cookie
    for (c of cookieArray) { // 遞迴每一個cookieKey=cookieValue
      cookieAttrs[c.split('=')[0].trim()] = c.split('=')[1] // assign 給 cookieAttrs
    }
    if (typeof cookieAttrs.visitCount === 'undefined') { // 如果visitCount這條不存在, 表示首次訪問
      cookieAttrs.visitCount = 1
      SHARE.pushMsg('不知道怎麼使用嗎？點擊下方問號可以查看使用說明！')
    } else if (cookieAttrs.visitCount < 6) {
      cookieAttrs.visitCount++
      SHARE.pushMsg('不知道怎麼使用嗎？點擊下方問號可以查看使用說明！')
    }
    for (key of Object.keys(cookieAttrs)) {
      document.cookie = `${key}=${cookieAttrs[key]}` // 從cookieAttrs轉換回cookie的格式
    }
  } else { // cookie 爲空
    document.cookie = 'visitCount=1'
    SHARE.pushMsg('不知道怎麼使用嗎？點擊下方問號可以查看使用說明！')
  }
})
