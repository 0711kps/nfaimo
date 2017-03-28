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
TUBE.playTube = vid => {
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
      tubeVidsFull: ""
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
        this.$http.get('/tube_vids.json').then(response=>{
          this.tubeVidsFull = response.body.tube_vids
          let tmp = JSON.parse(JSON.stringify(this.tubeVidsFull))
          this.tubeVidsSplited = []
          while(tmp.length > 0) {
            this.tubeVidsSplited.push(tmp.splice(0, 15))
          }
          this.tubeVidsIndex = 1
          if(this.tubeVidsSplited.length > 1) {
            TUBE.nextPage.classList.add('active')
          }
          this.tubeVids = this.tubeVidsSplited[this.tubeVidsIndex - 1]
          this.token = response.body.token
          SHARE.workQueue--
          SHARE.showLoading()
          let tv = document.getElementsByClassName('tv-container')
        },response=>{
          SHARE.workQueue--
          SHARE.showLoading()
        })
        TUBE.tubeInput = document.getElementById("add-youtube-field")
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
            SHARE.pushMsg(`成功加入影片「'+${response.body.resTitle}+'」!`)
            let oldTubeCount = parseInt(SHARE.tubeCount.textContent)
            SHARE.tubeCount.textContent = oldTubeCount+1
            this.token = response.body.token
            TUBE.newForm.classList.remove('active')
            setTimeout(()=> {
              TUBE.newForm.classList.add('underground')
            }, 300)
            // create TV element
            let newTV = document.createElement('div')
            newTV.classList.add('tv-container')
            newTV.style.marginRight = "-30vw"
            newTV.style.transform = "scale(0) rotate(0deg)"
            newTV.style.opacity = "0"
            newTV.dataset.id = response.body.tvid
            newTV.dataset.title = response.body.resTitle
            let newTVTitle = document.createElement('span')
            newTVTitle.classList.add('tv-title')
            newTVTitle.title = response.body.resTitle
            newTVTitle.innerText = response.body.resTitle
            let newTVContent = document.createElement('div')
            newTVContent.classList.add('a-tv')
            newTVContent.dataset.id = response.body.tvid
            newTVContent.style.backgroundImage=response.body.bgAttr
            newTVContent.addEventListener('click', () => {
              TUBE.playTube(response.body.pid)
            })
            let newTVPanel = document.createElement('div')
            newTVPanel.classList.add('panel')
            let editBtn = document.createElementNS('http://www.w3.org/2000/svg','svg')
            let editBtnIcon = document.createElementNS('http://www.w3.org/2000/svg','use')
            editBtn.classList.add('edit')
            editBtnIcon.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',"/assets/icon/icons.svg#edit")
            editBtn.appendChild(editBtnIcon)
            editBtn.addEventListener('click', e => {
              e.stopPropagation()
              this.editTube(newTV.dataset.id, newTV.dataset.title)
            })
            editBtn.addEventListener('mouseenter', e => { SHARE.showTooltip('編輯影片標題') })
            editBtn.addEventListener('mouseleave', e => { SHARE.hideTooltip() })
            let delBtn = document.createElementNS('http://www.w3.org/2000/svg','svg')
            let delBtnIcon = document.createElementNS('http://www.w3.org/2000/svg','use')
            delBtn.classList.add('delete')
            delBtnIcon.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href',"/assets/icon/icons.svg#del")
            delBtn.appendChild(delBtnIcon)
            delBtn.addEventListener('click', e => {
              e.stopPropagation()
              this.deleteTube(newTV.dataset.id, e)
            })
            delBtn.addEventListener('mouseenter', e => { SHARE.showTooltip('從清單移除影片') })
            delBtn.addEventListener('mouseleave', e => { SHARE.hideTooltip() })
            newTVPanel.appendChild(editBtn)
            newTVPanel.appendChild(delBtn)
            newTVContent.appendChild(newTVPanel)
            newTV.appendChild(newTVTitle)
            newTV.appendChild(newTVContent)
            TUBE.tvList.insertBefore(newTV, TUBE.tvList.childNodes[0])
            setTimeout(() => {
              newTV.style.marginRight = "0vw"
              newTV.style.transform = "scale(1) rotate(0)"
              newTV.style.opacity = "1"
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
        TUBE.tubeInput.value=""
      },
      deleteTube: function(id,e){
        e.stopPropagation()
        if(confirm('移除這個YouTube影片')){
          delUrl="/ceb9458d5364668953b05327205aa8af/dead_tube/"
          SHARE.workQueue++
          SHARE.showLoading()
          this.$http.post(delUrl, {authenticity_token: this.token, id: id}).then(response=>{
            this.token = response.body.token
            let delTarget = document.querySelector(`.tv-container[data-id="${id}"]`)
            delTarget.style.transform = 'scale(0) rotate(540deg)'
            delTarget.style.marginRight = '-30vw'
            delTarget.style.opacity = 0
            setTimeout(() => {
              delTarget.remove()
            }, 800)
            SHARE.workQueue--
            SHARE.showLoading()
            SHARE.pushMsg(`影片「${response.body.victim}」已移除!`)
            let oldTubeCount = parseInt(SHARE.tubeCount.textContent)
            SHARE.tubeCount.textContent = oldTubeCount - 1
          },response=>{
            SHARE.pushMsg('發生錯誤，影片無法移除！ ')
            SHARE.workQueue--
            SHARE.showLoading()
          })
        }
      },
      editTube: function(id, title){
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
            SHARE.pushMsg('更新影片標題失敗')
          })
        }
      }
    }
  })
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
