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
      rows: null, // 裝着object的array
      startY: null,
      startScroll: null,
      dragHeight: null,
      posChange: null
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
        this.$http.get('/ceb9458d5364668953b05327205aa8af/members.json').then(response => {
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
      delMember: function(id) {
        if (confirm('確定刪除成員？')) {
          SHARE.workQueue++
          SHARE.showLoading()
          this.$http.post(`/ceb9458d5364668953b05327205aa8af/del/${id}.json`, {'authenticity_token': this.edit.token}).then(response => {
            SHARE.workQueue--
            SHARE.showLoading()
            SHARE.pushMsg(`成員「${response.body.victim}」已刪除！ `)
            SHARE.logVue.getLogs()
            let oldMembCount = parseInt(SHARE.membCount.textContent)
            SHARE.membCount.style.transform = "scale(2)"
            setTimeout(() => {
              SHARE.membCount.textContent = oldMembCount-1
            },500)
            setTimeout(() => {
              SHARE.membCount.style.transform = null
            }, 600)
            let target = document.querySelector(`.cTableRow[data-id="${id}"]`)
            target.style.transformOrigin = "right center"
            target.style.transform = "scaleX(0)"
            target.style.opacity = 0
            setTimeout(() => {
              target.remove()
            }, 200)
            this.edit.token = response.body.token
          },response => {
            SHARE.pushMsg("發生錯誤，成員無法刪除！")
            SHARE.workQueue--
            SHARE.showLoading()
          })
        }
      },
      addMember: function() {
        this.openMemberForm(MEMBER.newMember)
        setTimeout(function(){
          MEMBER.newMemberName.focus()
        },0)
      },
      openMemberForm: function(el) {
        el.classList.remove("underground")
        setTimeout(() => {
          el.classList.add("active")
        },0)
      },
      closeMemberForm: function() {
        this.edit.tryCount = 0
        let targets = [MEMBER.newMember, MEMBER.editForm, MEMBER.editRespBox]
        let newFields = document.querySelectorAll("#new-member-form.active input,#new-member-form.active textarea")
        let editField = document.querySelector("#edit-member-resp.active textarea,#edit-member-form.active input")
        for (let i = 0, l = targets.length; i < l; ++i) {
          targets[i].classList.remove("active")
        }
        setTimeout(() => {
          for(let i = 0, l = targets.length; i < l; ++i) {
            targets[i].classList.add("underground")
          }
        }, 300)
        setTimeout(() => {
          for (let i = 0, l = newFields.length; i < l; ++i) {
            newFields[i].value = ""
          }
        }, 300)
        originEditVal=this.edit.value
        if(editField){
          setTimeout(function(){
            editField.value=originEditVal
          },500)
        }
      },
      createMember: function(token){
        if(document.querySelectorAll("#new-member-form input:valid, #new-member-form textarea:valid").length === 5){
          this.edit.tryCount=0
          let params = document.querySelectorAll("#new-member-form input, #new-member-form textarea")
          SHARE.workQueue++
          SHARE.showLoading()
          this.$http.post("/ceb9458d5364668953b05327205aa8af/members.json", {'authenticity_token': token, 'name':params[0].value, 'title':params[1].value, 'resp':params[2].value, 'ext':params[3].value, 'mail':params[4].value}).then(response => {
            SHARE.workQueue--
            SHARE.showLoading()
            SHARE.logVue.getLogs()
            // 建立新的成員元素
            let createdMember = new member({
              props: {
                id: {default: response.body.id},
                name: {default: response.body.name},
                title: {default: response.body.title},
                resp: {default: response.body.resp},
                ext: {default: response.body.ext},
                mail: {default: response.body.mail}
              }
            }).$mount().$el
            createdMember.style.opacity = "0"
            createdMember.style.transform = "translateX(-100%)"
            createdMember.style.transition = "transform 300ms, opacity 300ms"
            MEMBER.list.appendChild(createdMember)
            setTimeout(() => {
              createdMember.style.opacity = null
              createdMember.style.transform = null
            }, 50)
            //
            SHARE.pushMsg(`成員「${params[0].value}」已順利新增`)
            let oldMembCount = parseInt(SHARE.membCount.textContent)
            SHARE.membCount.style.transform = "scale(2)"
            setTimeout(() => {
              SHARE.membCount.textContent = oldMembCount+1
            },500)
            setTimeout(() => {
              SHARE.membCount.style.transform = null
            }, 600)
            for(let i=0,len=params.length;i<len;++i){
              params[i].value=''
            }
            this.edit.token=response.body.token
            params[0].focus()
          },response=>{
            SHARE.pushMsg("新增成員失敗！")
            SHARE.pushMsg("請檢查分機或信箱地址是否重複 ")
            SHARE.workQueue--
            SHARE.showLoading()
          })
        }else{
          document.querySelector('#new-member-form input:invalid,#new-member-form textarea:invalid').focus()
          this.edit.tryCount++
          if(this.edit.tryCount>6){
            let missingInputs=document.querySelectorAll("#new-member-form input:invalid,#new-member-form textarea:invalid")
            let missingArray=[]
            for(let i=0,len=missingInputs.length;i<len;++i){
              switch(missingInputs[i].id){
                case 'name':
                  missingArray.push('姓名')
                  break
                case 'title':
                  missingArray.push('職稱')
                  break
                case 'resp':
                  missingArray.push('業務')
                  break
                case 'ext':
                  missingArray.push('分機')
                  break
                case 'mail':
                  missingArray.push('信箱')
                  break
              }
            }
            let missingColnames=missingArray.join('、')
            SHARE.pushMsg(`${missingColnames}未填寫或格式不正確`)
          }
        }
      },
      editMember: function(id, col, event){
        this.openMemberForm(MEMBER.editForm)
        this.edit.id = id
        this.edit.col = col
        this.edit.value = event.target.dataset.val
        MEMBER.editTarget.focus()
        setTimeout(()=>{
          MEMBER.editTarget.setSelectionRange(0,MEMBER.editTarget.value.length)
        },50)
        switch(col){
          case "name":
            this.edit.title="編輯 姓名"
            break
          case "title":
            this.edit.title="編輯 職稱"
            break
          case "resp":
            this.edit.title="編輯 業務內容"
            break
          case "ext":
            this.edit.title="編輯 分機"
            break
          case "mail":
            this.edit.title="編輯 信箱"
            break
        }
      },
      editResp: function(id, col, event){
        this.openMemberForm(MEMBER.editRespBox)
        //更新那一個member？
        this.edit.id = id
        //更新哪一欄位？
        this.edit.col = col
        //更新爲某一數值？
        this.edit.value = event.target.dataset.val.replace(/<br>/g,'\n')
        MEMBER.editResp.focus()
        setTimeout(()=>{
          MEMBER.editResp.setSelectionRange(0,MEMBER.editResp.value.length)
        },0)
      },
      updateMember: function(id, col, val, token){
        //確認數值有所變動才patch更新member column
        let newVal = MEMBER.editTarget.value
        hash = {authenticity_token:token}
        hash[col] = newVal
        if(newVal != this.edit.value){
          SHARE.workQueue++
          SHARE.showLoading()
          this.$http.patch("/ceb9458d5364668953b05327205aa8af/members/"+id,hash).then(response=>{
            SHARE.logVue.getLogs()
            switch(col){
              case "name":
                SHARE.pushMsg('「姓名」欄位已順利修改!')
                break
              case "title":
                SHARE.pushMsg('「職稱」欄位已順利修改!')
                break
              case "ext":
                SHARE.pushMsg('「分機」欄位已順利修改!')
                break
              case "mail":
                SHARE.pushMsg('「信箱」欄位已順利修改!')
                break
            }
            let target = document.querySelector(`.cTableRow[data-id="${id}"] > .cTableCell.${col}`)
            if(col !== 'mail') {
              let keyframes = [{opacity: 1}, {opacity: 0}, {opacity: 1}]
              let options = {fill: 'forwards', duration: 600}
              target.animate(keyframes, options)
              setTimeout(() => {
                target.textContent =  newVal
                target.dataset.val = newVal
              }, 300)
            }else{
              let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
              svg.classList.add('mail-icon')
              let use = document.createElementNS('http://www.w3.org/2000/svg', 'use')
              use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '/assets/icon/icons.svg#mail')
              svg.appendChild(use)
              let keyframes = [{opacity: 1}, {opacity: 0}, {opacity: 1}]
              let options = {fill: 'forwards', duration: 600, iterations: 1}
              target.animate(keyframes, options)
              setTimeout(() => {
                target.innerHTML = ""
                target.appendChild(svg)
                target.innerHTML += newVal
                target.dataset.val = newVal
              }, 300)
            }
            SHARE.workQueue--
            SHARE.showLoading()
          },response=>{
            SHARE.pushMsg(' 成員資料更新失敗...')
            SHARE.pushMsg(' 請確認分機或信箱地址有無重複 ')
            SHARE.workQueue--
            SHARE.showLoading()
          })
        }
        this.closeMemberForm()
      },
      updateResp: function(id, val, token){
        newVal = MEMBER.editResp.value
        hash = {authenticity_token: token,resp:newVal}
        if(newVal != val){
          SHARE.workQueue++
          SHARE.showLoading()
          this.$http.patch(`/ceb9458d5364668953b05327205aa8af/members/${id}`, hash).then(response=>{
            SHARE.logVue.getLogs()
            SHARE.pushMsg('「業務」欄位已順利修改!')
            let displayVal = newVal.replace(/\n/g,'<br>')
            let target = document.querySelector(`.cTableRow[data-id="${id}"] > .cTableCell.resp`)
            setTimeout(() => {
              target.innerHTML = displayVal
              target.dataset.val = displayVal
            }, 300)
            let keyframes = [{opacity: 1}, {opacity: 0}, {opacity: 1}]
            let options = {fill: 'forwards', duration: 600}
            target.animate(keyframes, options)
            SHARE.workQueue--
            SHARE.showLoading()
          },response=>{
            SHARE.pushMsg("發生錯誤，更新成員資訊失敗！")
            SHARE.workQueue--
            SHARE.showLoading()
          })
        }
        this.closeMemberForm()
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
      editMember: function(id, col, event) {
        MEMBER.Vue.editMember(id, col, event)
      },
      editResp: function(id, col, event) {
        MEMBER.Vue.editResp(id, col, event)
      },
      delMember: function(id) {
        MEMBER.Vue.delMember(id, MEMBER.Vue.edit.token)
      },
      readyToDrag: function(e) {
        MEMBER.Vue.rows = []
        MEMBER.Vue.startY = e.pageY
        MEMBER.Vue.startScroll = MEMBER.list.scrollTop
        let targetRow = e.target.parentNode.parentNode
        MEMBER.Vue.dragHeight = targetRow.getBoundingClientRect().height
        let allRows = document.getElementsByClassName("cTableRow")
        for (r of allRows) {
          r.style.opacity = "0.75"
          if (r !== targetRow) {
            MEMBER.Vue.rows.push({
              element: r,
              centerYpos: (r.getBoundingClientRect().top + r.getBoundingClientRect().bottom)/2 + MEMBER.Vue.startScroll,
              moved: false
            })
          }
        }
        targetRow.style.opacity = null
        let allCells = document.getElementsByClassName("cTableCell")
        for (c of allCells) {
          c.style.borderStyle = "dashed"
          c.style.color = "white"
        }
        let hiddenBtns = document.querySelectorAll(".del-icon, .draggable-icon")
        for(h of hiddenBtns) {
          h.style.opacity = "0"
          h.style.pointerEvents = "none"
        }
        let dragMember = e => {
          this.dragMember(e, targetRow)
        }
        let dragComplete = () => {
          this.dragComplete(targetRow, dragComplete, dragMember, hiddenBtns)
        }
        document.addEventListener('mouseup', dragComplete)
        document.addEventListener('mousemove', dragMember)
      },
      dragMember: function(e, el) {
        el.style.transform = `translateY(${e.pageY - MEMBER.Vue.startY + MEMBER.list.scrollTop - MEMBER.Vue.startScroll}px)`
        el.style.position = "relative"
        el.style.zIndex = "119"
        MEMBER.Vue.posChange = 0
        for (r of MEMBER.Vue.rows) {
          // 往下移動的時候
          if (e.pageY + MEMBER.list.scrollTop > r.centerYpos && MEMBER.Vue.startY + MEMBER.Vue.startScroll < r.centerYpos) {
            r.element.style.transform = `translateY(-${MEMBER.Vue.dragHeight}px)`
            if (r.moved === false) {
              r.moved = -MEMBER.Vue.dragHeight*0.4
              r.centerYpos+=r.moved
              console.log(r.moved)
            }
            MEMBER.Vue.posChange++
            // 往上移動的時候
          }else if (e.pageY + MEMBER.list.scrollTop <= r.centerYpos && MEMBER.Vue.startY + MEMBER.Vue.startScroll >= r.centerYpos) {
            r.element.style.transform = `translateY(${MEMBER.Vue.dragHeight}px)`
            if (r.moved === false) {
              r.moved = MEMBER.Vue.dragHeight*0.4
              r.centerYpos+=r.moved
              console.log(r.moved)
            }
            MEMBER.Vue.posChange--
          }else{
            r.element.style.transform = "none"
            if (r.moved !== false) {
              r.centerYpos-=r.moved
              r.moved = false
            }
          }
        }
      },
      dragComplete: function(el, completeBind, dragBind, hiddenBtns) {
        el.style.transform = null
        el.style.position = null
        el.style.zIndex = null
        document.removeEventListener('mouseup', completeBind)
        document.removeEventListener('mousemove', dragBind)
        let allRows = document.getElementsByClassName("cTableRow")
        let allCells = document.getElementsByClassName("cTableCell")
        for (c of allCells) {
          c.style.borderStyle = null
          c.style.color = null
        }
        for(h of hiddenBtns) {
          h.style.opacity = null
          h.style.pointerEvents = null
        }
        if (MEMBER.Vue.posChange > 0) {
          let targetPos = el
          for (let i=0;i<MEMBER.Vue.posChange+1;++i) {
            targetPos = targetPos.nextSibling
          }
          MEMBER.list.insertBefore(el, targetPos)
        }else if (MEMBER.Vue.posChange < 0) {
          let targetPos = el
          for (let i=0;i>MEMBER.Vue.posChange;--i) {
            targetPos = targetPos.previousSibling
          }
          MEMBER.list.insertBefore(el, targetPos)
        }
        if (MEMBER.Vue.posChange !== 0) {
          let hash = {
            id: el.dataset.id,
            change_amount: MEMBER.Vue.posChange,
            authenticity_token: MEMBER.Vue.edit.token
          }
          MEMBER.Vue.$http.patch('/ceb9458d5364668953b05327205aa8af/alter_order', hash).then(response => {
            SHARE.pushMsg('修改成員順序成功')
          },response => {
            SHARE.pushMsg('修改成員順序時發生錯誤')
          })
        }
        let x = 1
        for (r of allRows) {
          r.style.opacity = null
          r.style.transition = "none"
          r.style.transform = null
          r.dataset.display_order = x
          x++
        }
        setTimeout(() => {
          for (r of allRows) {
            r.style.transition = null
          }
        },50)
      }
    },
    template: `
  <div class="cTableRow z1" :data-id="id">
    <div class="cTableCell">
      <svg class="draggable-icon" @mouseenter="showTooltip('拖拽以更改顯示順序')" @mouseleave="hideTooltip" @mousedown="readyToDrag($event)">
        <use xlink:href="/assets/icon/icons.svg#draggable"></use>
      </svg>
    </div>
    <div class="cTableCell name" @mouseenter="showTooltip('編輯姓名')" @mouseleave="hideTooltip" :data-val="name" @click="editMember(id, 'name', $event)">
      {{name}}
    </div>
    <div class="cTableCell title" @mouseenter="showTooltip('編輯職稱')" @mouseleave="hideTooltip" :data-val="title" @click="editMember(id, 'title', $event)">
      {{title}}
    </div>
    <div v-html="resp" class="cTableCell resp" @mouseenter="showTooltip('編輯業務內容')" @mouseleave="hideTooltip" :data-val="resp" @click="editResp(id, 'resp',$event)">
      {{resp}}
    </div>
    <div class="cTableCell ext" @mouseenter="showTooltip('編輯分機')" @mouseleave="hideTooltip" :data-val="ext" @click="editMember(id, 'ext', $event)">
      {{ ext }}
    </div>
    <div class="cTableCell mail" @mouseenter="showTooltip('編輯信箱地址')" @mouseleave="hideTooltip" :data-val="mail" @click="editMember(id, 'mail', $event)">
      <svg class="mail-icon">
        <use xlink:href="/assets/icon/icons.svg#mail"></use>
      </svg>
      {{mail}}
    </div>
    <div class="cTableCell">
      <svg class="del-icon" @click="delMember(id)" @mouseenter="showTooltip('點擊此圖示以刪除成員')" @mouseleave="hideTooltip">
        <use xlink:href="/assets/icon/icons.svg#del"></use>
      </svg>
    </div>
  </div>
    `
  })
  Vue.component('member', member)
  // 預先選取元素
  MEMBER.list = document.getElementById("member-list") // 成員名單
  MEMBER.editForm = document.getElementById("edit-member-form") // 編輯表單
  MEMBER.editTarget = document.getElementById("edit-target") // 編輯表單的輸入區
  MEMBER.newMember = document.getElementById("new-member-form") // 新增表單的表單
  MEMBER.editRespBox = document.getElementById("edit-member-resp") // 編輯業務的表單
  MEMBER.editResp = document.querySelector("#edit-resp") // 編輯業務表單的輸入區
  MEMBER.newMemberName = document.getElementById("name") // 新增表單的姓名
  MEMBER.newMemberIcon = document.getElementById('new-member-icon') // 新增成員按鈕

  if (document.cookie) { // cookie 不爲空
    let cookieArray = document.cookie.split(';')
    let cookieAttrs = {} // 建立一object用以parse cookie
    for (c of cookieArray) { // 遞迴每一個cookieKey=cookieValue
      cookieAttrs[c.split('=')[0].trim()] = c.split('=')[1] // assign 給 cookieAttrs
    }
    if (typeof cookieAttrs.backendVisitCount === 'undefined') { // 如果backendVisitCount這條不存在, 表示首次訪問
      cookieAttrs.backendVisitCount = 1
      SHARE.pushMsg('不知道怎麼使用嗎？點擊下方問號可以查看使用說明！')
    } else if (cookieAttrs.backendVisitCount < 6) {
      cookieAttrs.backendVisitCount++
      SHARE.pushMsg('不知道怎麼使用嗎？點擊下方問號可以查看使用說明！')
    }
    for (key of Object.keys(cookieAttrs)) {
      document.cookie = `${key}=${cookieAttrs[key]}` // 從cookieAttrs轉換回cookie的格式
    }
  } else { // cookie 爲空
    document.cookie = 'backendVisitCount=1'
    SHARE.pushMsg('不知道怎麼使用嗎？點擊下方問號可以查看使用說明！')
  }
})
