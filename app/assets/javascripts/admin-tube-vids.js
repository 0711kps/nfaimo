//vars and functions
//關閉YouTube播放視窗
TUBE.closeTubeScreen=()=>{
  TUBE.tubeViewer.classList.remove('visible')
  setTimeout(()=>{
    TUBE.tubeViewer.src=''
    TUBE.closeTube.classList.remove('visible')
  },300)
}
//開啓YouTube播放視窗並開始播放影片
TUBE.playTube=(vid)=>{
  TUBE.tubeViewer.src=`https://www.youtube.com/embed/${vid}?autoplay=1&rel=0&iv_load_policy=3&showinfo=0`
  TUBE.tubeViewer.classList.add('visible')
  setTimeout(()=>{
    TUBE.closeTube.classList.add('visible')
  },500)
}
document.addEventListener('DOMContentLoaded',() => {
  //Vue
  TUBE.Vue = new Vue({
    el: "#tube-content",
    data: {
      tubePid: "",
      token: "",
      tubeVids: {
        id: "",
        title: "",
        vid: ""
      },
      tubeVidsSplited: "",
      tubeVidsIndex: "",
      tubeVidsFull: "",
      rememberPage: ""
    },
    watch: {
      tubeVidsIndex: function(val) {
        this.tubeVids = this.tubeVidsSplited[val - 1]
      }
    },
    methods: {
      playTube: function(vid){
        TUBE.playTube(vid)
      },
      openTubeForm: function(){
        TUBE.newForm.classList.add('active')
        setTimeout(() => {
          TUBE.newForm.classList.remove('underground')
          TUBE.tubeInput.focus()
        }, 0)
      },
      closeTubeForm: function(){
        TUBE.newForm.classList.remove('active')
        setTimeout(() => {
          TUBE.newForm.classList.add('underground')
          TUBE.tubeInput.value=''
        }, 300)
      },
      showTooltip: function(text){
        SHARE.showTooltip(text)
      },
      hideTooltip: function(){
        SHARE.hideTooltip()
      },
      loadTubes: function(){
        SHARE.workQueue++
        SHARE.showLoading()
        this.$http.get('/ceb9458d5364668953b05327205aa8af/tube_vids.json').then(response=>{
          this.tubeVidsFull = response.body.tube_vids
          let tmp = JSON.parse(JSON.stringify(this.tubeVidsFull))
          this.tubeVidsSplited = []
          while(tmp.length > 0) {
            this.tubeVidsSplited.push(tmp.splice(0, 15))
          }
          if(this.rememberPage) {
            this.rememberPage = false
          }else{
            this.tubeVidsIndex = 1
          }
          if(this.tubeVidsSplited.length > 1) {
            TUBE.nextPage.classList.add('active')
          }
          this.tubeVids = this.tubeVidsSplited[this.tubeVidsIndex - 1]
          this.token = response.body.token
          SHARE.workQueue--
          SHARE.showLoading()
          let tv = document.getElementsByClassName('tv-container')
          let editBtns = document.getElementsByClassName('edit')
          for(let i=0,l=tv.length;i<l;++i) {
            editBtns[i].addEventListener('click', e => {
              e.stopPropagation()
              this.editTube(tv[i].dataset.id, tv[i].dataset.title)
            })
          }
        },response=>{
          SHARE.workQueue--
          SHARE.showLoading()
        })
      },
      nextPage: function(){
        this.tubeVidsIndex += 1
        if(this.tubeVidsIndex > 1) {
          TUBE.prevPage.classList.add('active')
        }else{
          TUBE.prevPage.classList.remove('active')
        }
        //
        if(this.tubeVidsIndex < this.tubeVidsSplited.length) {
          TUBE.nextPage.classList.add('active')
        }else{
          TUBE.nextPage.classList.remove('active')
        }
      },
      prevPage: function(){
        this.tubeVidsIndex -= 1
        if(this.tubeVidsIndex > 1) {
          TUBE.prevPage.classList.add('active')
        }else{
          TUBE.prevPage.classList.remove('active')
        }
        //
        if(this.tubeVidsIndex < this.tubeVidsSplited.length) {
          TUBE.nextPage.classList.add('active')
        }else{
          TUBE.nextPage.classList.remove('active')
        }
      },
      //建立YouTube影片連結
      createTube: function(){
        if(TUBE.tubeInput.value.search(/.*youtube\.com\/watch\?v.+/)>=0 || TUBE.tubeInput.value.search(/.*youtu.be\/.+/)>=0){
          let tmp = TUBE.tubeInput.value.match(/\?v[^&]+/)
          if(tmp){
            this.tubePid = tmp[0].slice(3)
          }else{
            this.tubePid = TUBE.tubeInput.value.match(/\/[^\/]+$/)[0].slice(1)
          }
          SHARE.workQueue++
          SHARE.showLoading()
          this.$http.post("/ceb9458d5364668953b05327205aa8af/tube_vids.json",{authenticity_token: this.token,pid: this.tubePid}).then(response=>{
            TUBE.tubeInput.value=""
            SHARE.logVue.getLogs()
            SHARE.pushMsg(`成功加入影片「'+${response.body.resTitle}+'」!`)
            let oldTubeCount = parseInt(SHARE.tubeCount.textContent)
            SHARE.tubeCount.style.transform = "scale(2)"
            setTimeout(() => {
            SHARE.tubeCount.textContent = oldTubeCount+1
            },500)
            setTimeout(() => {
              SHARE.tubeCount.style.transform = null
            }, 600)
            this.token = response.body.token
            TUBE.newForm.classList.remove('active')
            setTimeout(()=> {
              TUBE.newForm.classList.add('underground')
            }, 300)
            // create TV element
            let newTV = new tube({
              props: {
                id: {default: response.body.tvid},
                title: {default: response.body.resTitle},
                vid: {default: response.body.pid}
              }
            }).$mount().$el
            newTV.style.marginRight = "-30vw"
            newTV.style.transform = "scaleX(0)"
            newTV.style.opacity = "0"
            TUBE.tvList.insertBefore(newTV, TUBE.tvList.children[0])
            setTimeout(() => {
              newTV.style.marginRight = null
            newTV.style.transform = null
            newTV.style.opacity = null
            },50)
            // create TV element end
            SHARE.workQueue--
            SHARE.showLoading()
          },response=>{
            SHARE.pushMsg('新增影片失敗！')
            SHARE.workQueue--
            SHARE.showLoading()
          })
        }else{
            SHARE.pushMsg('新增影片失敗,可能是由於網址不正確所造成！')
          }
      },
      deleteTube: function(id, e){
        e.stopPropagation()
        if(confirm('移除這個YouTube影片')){
          delUrl="/ceb9458d5364668953b05327205aa8af/dead_tube/"
          SHARE.workQueue++
          SHARE.showLoading()
          this.$http.post(delUrl, {authenticity_token: this.token, id: id}).then(response=>{
            SHARE.logVue.getLogs()
            this.token = response.body.token
            this.rememberPage = true
            this.loadTubes()
            SHARE.workQueue--
            SHARE.showLoading()
            SHARE.pushMsg(`影片「${response.body.victim}」已移除!`)
            let oldTubeCount = parseInt(SHARE.tubeCount.textContent)
            SHARE.tubeCount.style.transform = "scale(2)"
            setTimeout(() => {
            SHARE.tubeCount.textContent = oldTubeCount-1
            },500)
            setTimeout(() => {
              SHARE.tubeCount.style.transform = null
            }, 600)
          },response=>{
            SHARE.pushMsg('發生錯誤，影片無法移除！ ')
            SHARE.workQueue--
            SHARE.showLoading()
          })
        }
      },
      editTube: function(id, title, e){
        e.stopPropagation()
        this.tubeVids.id = id
        this.tubeVids.title = title
        TUBE.editTubeTarget.value = title
        TUBE.editTube.classList.add('active')
        TUBE.editTube.classList.remove('underground')
        TUBE.editTubeTarget.focus()
        setTimeout(() => {
          TUBE.editTubeTarget.setSelectionRange(0, TUBE.editTubeTarget.value.length)
        }, 0)
        document.execCommand('selectAll')
      },
      closeEditTube: function(){
        TUBE.editTube.classList.remove('active')
        setTimeout(()=>{
          TUBE.editTube.classList.add('underground')
          TUBE.editTubeTarget.value = ""
        },200)
      },
      updateTube: function(){
        let id = this.tubeVids.id
        let title = TUBE.editTubeTarget.value
        if(title === this.tubeVids.title){
          this.closeEditTube()
        }else{
          this.$http.patch(`/ceb9458d5364668953b05327205aa8af/tube_vids/${id}`,{'authenticity_token': this.token,'title': title}).then(response=>{
            SHARE.logVue.getLogs()
            this.token = response.body.token
            let targetTitle = response.body.resTitle
            let targetElement = document.querySelector(`.tv-container[data-id="${id}"]`)
            let targetTitleSpan = targetElement.children[0]
            let keyframe = [{opacity: 1}, {opacity: 0}, {opacity: 1}]
            let options = {fill: "forwards", duration: 600}
            targetElement.animate(keyframe, options)
            SHARE.pushMsg(`已順利改名爲「${targetTitle}」`)
            setTimeout(() => {
              targetTitleSpan.textContent = targetTitle
              targetTitleSpan.title = targetTitle
              targetElement.dataset.title = title
            }, 300)
            this.closeEditTube()
          },response=>{
            SHARE.pushMsg('更新影片標題失敗!')
          })
        }
      }
    }
  })
  let tube = Vue.extend({
    props: ['id', 'title', 'vid', 'token'],
    methods: {
      loadTubes: function(){
        SHARE.workQueue++
        SHARE.showLoading()
        this.$http.get('/ceb9458d5364668953b05327205aa8af/tube_vids.json').then(response=>{
          TUBE.Vue.tubeVidsFull = response.body.tube_vids
          let tmp = JSON.parse(JSON.stringify(TUBE.Vue.tubeVidsFull))
          TUBE.Vue.tubeVidsSplited = []
          while(tmp.length > 0) {
            TUBE.Vue.tubeVidsSplited.push(tmp.splice(0, 15))
          }
          if(TUBE.Vue.rememberPage) {
            TUBE.Vue.rememberPage = false
          }else{
            TUBE.Vue.tubeVidsIndex = 1
          }
          if(TUBE.Vue.tubeVidsSplited.length > 1) {
            TUBE.nextPage.classList.add('active')
          }
          TUBE.Vue.tubeVids = TUBE.Vue.tubeVidsSplited[TUBE.Vue.tubeVidsIndex - 1]
          TUBE.Vue.token = response.body.token
          SHARE.workQueue--
          SHARE.showLoading()
          let tv = document.getElementsByClassName('tv-container')
          let editBtns = document.getElementsByClassName('edit')
          for(let i=0,l=tv.length;i<l;++i) {
            editBtns[i].addEventListener('click', e => {
              e.stopPropagation()
              TUBE.Vue.editTube(tv[i].dataset.id, tv[i].dataset.title)
            })
          }
        },response=>{
          SHARE.workQueue--
          SHARE.showLoading()
        })
      },
      playTube: function(vid){
        TUBE.playTube(vid)
      },
      showTooltip: function(text){
        SHARE.showTooltip(text)
      },
      hideTooltip: function(){
        SHARE.hideTooltip()
      },
      deleteTube: function(id, e){
        e.stopPropagation()
        if(confirm('移除這個YouTube影片')){
          delUrl="/ceb9458d5364668953b05327205aa8af/dead_tube/"
          SHARE.workQueue++
          SHARE.showLoading()
          TUBE.Vue.$http.post(delUrl, {authenticity_token: TUBE.Vue.token, id: id}).then(response=>{
            SHARE.logVue.getLogs()
            TUBE.Vue.token = response.body.token
            TUBE.Vue.rememberPage = true
            TUBE.Vue.loadTubes()
            SHARE.workQueue--
            SHARE.showLoading()
            e.target.parentNode.parentNode.parentNode.remove()
            SHARE.pushMsg(`影片「${response.body.victim}」已移除!`)
            let oldTubeCount = parseInt(SHARE.tubeCount.textContent)
            SHARE.tubeCount.style.transform = "scale(2)"
            setTimeout(() => {
            SHARE.tubeCount.textContent = oldTubeCount-1
            },500)
            setTimeout(() => {
              SHARE.tubeCount.style.transform = null
            }, 600)
          },response=>{
            SHARE.pushMsg('發生錯誤，影片無法移除！ ')
            SHARE.workQueue--
            SHARE.showLoading()
          })
        }
      },
      editTube: function(id, title, e){
        e.stopPropagation()
        TUBE.Vue.tubeVids.id = id
        TUBE.Vue.tubeVids.title = title
        TUBE.editTubeTarget.value = title
        TUBE.editTube.classList.add('active')
        TUBE.editTube.classList.remove('underground')
        TUBE.editTubeTarget.focus()
        setTimeout(() => {
          TUBE.editTubeTarget.setSelectionRange(0, TUBE.editTubeTarget.value.length)
        }, 0)
        document.execCommand('selectAll')
      },
      closeEditTube: function(){
        TUBE.editTube.classList.remove('active')
        setTimeout(()=>{
          TUBE.editTube.classList.add('underground')
          TUBE.editTubeTarget.value = ""
        },200)
      },
      updateTube: function(){
        let id = TUBE.Vue.tubeVids.id
        let title = TUBE.editTubeTarget.value
        if(title === TUBE.Vue.tubeVids.title){
          TUBE.Vue.closeEditTube()
        }else{
          TUBE.Vue.$http.patch(`/ceb9458d5364668953b05327205aa8af/tube_vids/${id}`,{'authenticity_token': TUBE.Vue.token,'title': title}).then(response=>{
            SHARE.logVue.getLogs()
            TUBE.Vue.token = response.body.token
            let targetTitle = response.body.resTitle
            let targetElement = document.querySelector(`.tv-container[data-id="${id}"]`)
            let targetTitleSpan = targetElement.children[0]
            let keyframe = [{opacity: 1}, {opacity: 0}, {opacity: 1}]
            let options = {fill: "forwards", duration: 600}
            targetElement.animate(keyframe, options)
            SHARE.pushMsg(`已順利改名爲「${targetTitle}」`)
            setTimeout(() => {
              targetTitleSpan.textContent = targetTitle
              targetTitleSpan.title = targetTitle
              targetElement.dataset.title = title
            }, 300)
            TUBE.Vue.closeEditTube()
          },response=>{
            SHARE.pushMsg('更新影片標題失敗!')
          })
        }
      }
    },
    template: `
      <div class="tv-container" :data-id="id" :data-title="title">
        <span class="tv-title" :title="title">
          {{title}}
        </span>
        <div class="a-tv" :style="{'background-image': 'url(https://img.youtube.com/vi/'+vid+'/mqdefault.jpg)'}" @click="playTube(vid)" @mouseleave="hideTooltip">
          <div class="panel">
            <svg class="edit" @mouseenter="showTooltip('編輯影片標題')" @mouseleave="hideTooltip" @click="editTube(id, title, $event)">
              <use xlink:href="/assets/icon/icons.svg#edit"></use>
            </svg>
            <svg class="delete" @mouseenter="showTooltip('從清單移除這部影片')" @mouseleave="hideTooltip" @click="deleteTube(id,$event)" >
              <use xlink:href="/assets/icon/icons.svg#del"></use>
            </svg>
          </div>
        </div>
      </div>
    `
  })
  Vue.component('tube', tube)
  //Vue End
  //Elements
  TUBE.editTube = document.getElementById('edit-tube')
  TUBE.editTubeTarget = document.getElementById('edit-tube-target')
  TUBE.closeTube = document.getElementById('close-tube')
  TUBE.tubeViewer = document.getElementById("tube-viewer")
  TUBE.tvList = document.getElementById('tv-list')
  TUBE.newForm = document.getElementById('new-tube-form')
  TUBE.tubeInput = document.getElementById('tube-url')
  TUBE.nextPage = document.getElementById('tube-page-right')
  TUBE.prevPage = document.getElementById('tube-page-left')
  //Bindings
  TUBE.closeTube.addEventListener('click',TUBE.closeTubeScreen)
})
