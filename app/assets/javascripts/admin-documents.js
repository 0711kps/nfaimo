// 不需等候DOM讀取
DOCUMENT.uploadStatus = false
DOCUMENT.isMouseDown = false
DOCUMENT.startPos = {x: null, y:null, scrollY: null}
DOCUMENT.endPos = {x: null, y: null, scrollY: null}
DOCUMENT.menuIsOpen = false
DOCUMENT.clickCount = 0
DOCUMENT.preventDupliUpload = false
const CHUNK_SIZE = 2700000
const KB = 1024
const MB = KB * 1024
const GB = MB * 1024
DOCUMENT.queueFiles = []
class Mission {
  constructor(element, formData, percent, piece, final){
    this.element = element
    this.formData = formData
    this.percent = percent
    this.piece = piece
    this.final = final
  }
  // 上傳這個物件中的檔案
  send(){
    let xhr = new XMLHttpRequest()
    xhr.open('POST',"/ceb9458d5364668953b05327205aa8af/upload",true)
    xhr.mission = this
    if(xhr.mission.piece == 0){
        this.changeStatus(1)
      }
    xhr.addEventListener("load", function(e){
      if(xhr.mission.piece == xhr.mission.final){
        this.mission.changeStatus(2)
        let oldDocCount = parseInt(SHARE.docCount.textContent)
        SHARE.docCount.textContent = oldDocCount + 1
        SHARE.logVue.getLogs()
      }
      DOCUMENT.uploadFile()
      this.mission.showProgress()
      let createdDoc = JSON.parse(e.target.response)
      DOCUMENT.Vue.getFile(false, false)
    },false)
    xhr.send(xhr.mission.formData)
  }
  // 改變這個物件的上傳狀態
  changeStatus(status){
    let element = this.element.children[2]
    element.animate([
      { transform: "rotateY(0deg)" },
      { transform: "rotateY(90deg)"  }
    ],{
  duration: 300,
      fill: "forwards"
    })
    let usehref
    let bgcolor
    switch(status){
      case 0:
        usehref = 'waiting'
        bgcolor = "hsl(0,0%,80%)"
        break
      case 1:
        usehref = 'uploading'
        bgcolor = "hsl(0,100%,50%)"
        break
      case 2:
        usehref = 'complete'
        bgcolor = "hsl(120,100%,30%)"
        break
    }
    usehref = `/assets/icon/icons.svg#item-${usehref}`
    setTimeout(() => {
      element.children[0].setAttribute("href",usehref)
      element.style.backgroundColor=bgcolor
      element.animate([
        { transform: "rotateY(-90deg)"  },
        { transform: "rotateY(0deg)"  }
      ], {
        duration: 300,
        fill: "forwards"
      })
    }, 300)
  }
  // 將上傳進度反應在對應元素上
  showProgress(){
    let target = this
    let percent = target.percent
    if(percent < 100){
      target.element.style.background=`linear-gradient(to right, hsl(0,45%,60%)${percent}%,hsla(0,0%,60%,0.6)0)`
    }else{
      target.element.animate([{background:"hsl(0,45%,60%)"},{background:"hsl(120,45%,60%)"}],{duration: 500,fill: "forwards"})
      target.element.classList.add("complete")
    }
  }
}
//關閉檔案上傳視窗
DOCUMENT.closeFilesScreen = () => {
  DOCUMENT.uploadZone.classList.remove('active')
  setTimeout(()=>{
    DOCUMENT.uploadZone.classList.add('underground')
  },400)
}
//取得起始點與結束點(同起始點)的座標, 然後以座標資訊呼叫drawRect 和 checkTouch
DOCUMENT.setStart = (x, y) => {
  DOCUMENT.startPos = {x: x, y: y, scrollY: DOCUMENT.explorer.scrollTop}
  DOCUMENT.endPos = {x: x, y: y, scrollY: DOCUMENT.explorer.scrollTop}
  //checkTouch()
}
//遊標移動時取得新的End座標，並以該資訊呼叫drawRect和checkTouch
DOCUMENT.setEnd = (x, y) => {
  DOCUMENT.endPos = {x: x, y: y, scrollY: DOCUMENT.explorer.scrollTop}
  DOCUMENT.drawRect()
}
DOCUMENT.selectFile = (layer, e) => {
  e.stopPropagation()
  e.preventDefault()
  if(!DOCUMENT.menuIsOpen) {
    let selected = document.getElementsByClassName('selected')
    let targetElement = e.target
    for(let i=0;i<layer;++i) {
      targetElement = targetElement.parentNode
    }
    if(!e.ctrlKey && e.which === 1){
      while(selected.length > 0){
        selected[0].classList.remove('selected')
      }
    }else if(e.which === 3 && !targetElement.classList.contains('selected')){
      while(selected.length > 0){
        selected[0].classList.remove('selected')
      }
    }
    targetElement.classList.add('selected')
  }
}
// 根據檔案副檔名顯示不同icon
DOCUMENT.identifyType2 = ext => {
  switch(ext){
    // 如果是圖片
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
      return'/assets/icon/icons.svg#image'
      break
    // 如果是影片
    case ".avi":
    case ".mp4":
    case ".webm":
    case ".wmv":
    case ".flv":
    case ".mkv":
      return '/assets/icon/icons.svg#video'
      break
    // 如果是word文件
    case ".doc":
    case ".docx":
      return '/assets/icon/icons.svg#word'
      break
    // 如果是power point 文件
    case ".ppt":
    case ".pptx":
      return  '/assets/icon/icons.svg#ppt'
      break
    // 如果是excel 文件
    case ".xls":
    case ".xlsx":
      return'/assets/icon/icons.svg#excel'
      break
    // 如果是pdf 文件
    case ".pdf":
      return  '/assets/icon/icons.svg#pdf'
      break
    // 如果是壓縮檔
    case ".zip":
    case ".rar":
    case ".7z":
      return '/assets/icon/icons.svg#archive'
      break
    // 其他不在上述的檔案
    default:
      return '/assets/icon/icons.svg#default'
      break
  }
}
//判斷檔案圖示與拖拉方塊是否有接觸
DOCUMENT.checkTouch = e => {
  let files = document.getElementsByClassName('file-container')
  let touch
  let sx = DOCUMENT.startPos.x
  let sy = DOCUMENT.startPos.y
  let delta = DOCUMENT.endPos.scrollY - DOCUMENT.startPos.scrollY
  let ex = DOCUMENT.endPos.x
  let ey = DOCUMENT.endPos.y + delta
  for(file of files) {
    touch = {x: false, y: false}
    if(sx > ex){ // 往左拖拉
      if(file.dataset.left < sx && file.dataset.right > ex) {
        touch.x = true
      }
    }else{//往右拖拉
      if(file.dataset.right > sx && file.dataset.left < ex){
        touch.x = true
      }
    }
    if(sy > ey) { //往上拖拉
      if(file.dataset.top < sy && file.dataset.bottom > ey){
        touch.y = true
      }
    }else{ //往下拖拉
      if(file.dataset.bottom > sy && file.dataset.top < ey){
        touch.y = true
      }
    }
    if(touch.x && touch.y) {
      file.classList.add('selected')
    }else{
      if(!e.ctrlKey) {
        file.classList.remove('selected')
      }
    }
  }
}
//根據輸入兩點座標繪製selectZone
DOCUMENT.drawRect = () => {
  let sx = DOCUMENT.startPos.x
  let sy =DOCUMENT.startPos.y + DOCUMENT.startPos.scrollY
  let ex = DOCUMENT.endPos.x
  let delta = DOCUMENT.endPos.y - DOCUMENT.startPos.y
  let ey = DOCUMENT.endPos.y + DOCUMENT.endPos.scrollY
  let vw = window.innerWidth * 0.01
  let vh = window.innerHeight * 0.01
  let left,top,width,height
  // 起始點在終點左側
  if(sx < ex) {
    left = sx
    width = ex - sx
  // 起始點在終點右側
  }else{
    left = ex
    width = sx - ex
  }
  left = (left - 15.2 * vw) + 'px'
  width = width + 'px'
  // 起始點在終點上方
  if(sy < ey){
    top = sy
    height = ey - sy
  // 起始點在終點下方
  }else{
    top = ey
    height = sy - ey
  }
  top = (top - 14.6 * vh) + 'px'
  height = height + 'px'
  DOCUMENT.selectZone.classList.add('active')
  DOCUMENT.selectZone.style.top = top
  DOCUMENT.selectZone.style.left = left
  DOCUMENT.selectZone.style.height = height
  DOCUMENT.selectZone.style.width = width

}
//拖拽檔案至上傳區的動畫效果
DOCUMENT.dragOverIndicator = () => {
  let dragTimer
    //拖拽檔案進入指定區域時執行
  DOCUMENT.uploadIcon.addEventListener('dragover', e => {
    e.preventDefault()
    e.stopPropagation()
    if(e.dataTransfer.types[0] === 'Files' || e.dataTransfer.types[1] === 'Files'){
      DOCUMENT.uploadIcon.classList.add('drag-over')
      window.clearTimeout(dragTimer)
    }
  })
  //拖拽檔案離開指定區域時執行
  DOCUMENT.uploadIcon.addEventListener('dragleave', e => {
    e.preventDefault()
    e.stopPropagation()
    if(e.dataTransfer.types[0] === 'Files' || e.dataTransfer.types[1] === 'Files'){
      window.clearTimeout(dragTimer)
      dragTimer = window.setTimeout(() => {
        DOCUMENT.uploadIcon.classList.remove('drag-over')
      },50)
    }
  })
    //放開檔案時執行
  DOCUMENT.uploadIcon.addEventListener('drop', e => {
    //預防瀏覽器開啓檔案
    e.preventDefault()
    e.stopPropagation()
    // 移除drag-over畫面效果並預防重複上傳
    if(DOCUMENT.preventDupliUpload) {
      return
    }
    DOCUMENT.preventDupliUpload = true
    window.clearTimeout(dragTimer)
    dragTimer = window.setTimeout(() => {
      DOCUMENT.uploadIcon.classList.remove('drag-over')
      DOCUMENT.preventDupliUpload = false
    },50)
    //若拖拽對象爲外部檔案而非網頁元素
    if(e.dataTransfer.types[0] === 'Files' || e.dataTransfer.types[1] === 'Files') {
      let pass = true
      for(let i=0;i<e.dataTransfer.files.length;i++) {
        if(!e.dataTransfer.files[i].type) {
          pass = false
          break
        }
      }
      if(pass){ 
        DOCUMENT.handleFiles(e.dataTransfer.files) 
      }else{
        SHARE.pushMsg(" 不是正確的檔案格式！")
      }
    }
  })
}
//拖拽上傳的提示動畫
DOCUMENT.openFileScreen = () => {
  DOCUMENT.uploadZone.classList.remove('underground')
  setTimeout(() => {
    DOCUMENT.uploadZone.classList.add('active')
    DOCUMENT.uploadZone.focus()
  }
    ,50)
  DOCUMENT.dragOverIndicator()
}
// 處理選擇上傳檔案後的動作
DOCUMENT.handleFiles = files => {
  for(let i=0;i<files.length;i++){
    DOCUMENT.identifyType(files[i], i)
  }
  DOCUMENT.beginUpload()
  if(!DOCUMENT.uploadZone.classList.contains("uploading")){
    DOCUMENT.uploadZone.classList.add('uploading')
  }
}
//將檔案加至佇列
DOCUMENT.toQueue = (file, el) => {
  let possible="abcdefghijklmnopqrstuvwxyz"
  let randomText = ""
  for(let i=0;i<3;i++){
    let randomNumber=Math.floor(Math.random()*26)
    randomText+=possible[randomNumber]
  }
  let date = new Date()
  let storeName = (date.getYear()+1900).toString()+(date.getMonth()+1).toString()+date.getDate().toString()+(date.getHours()).toString()+(date.getMinutes()).toString()+date.getSeconds().toString()+randomText
  if(file.size < CHUNK_SIZE){
    let fd = new FormData()
    let token = document.getElementsByName("csrf-token")[0].content
    fd.append("authenticity_token", token)
    fd.append("file",file)
    fd.append("filename",file.name)
    fd.append("store_name",storeName)
    fd.append("piece",0)
    fd.append("final",0)
    DOCUMENT.queueFiles.push( new Mission(el, fd, 100, 0, 0))
  }else{
    let startChunk = 0
    let endChunk = startChunk+CHUNK_SIZE
    let totalPiece = Math.ceil(file.size/CHUNK_SIZE)-1
    let piece = 0
    while(endChunk < file.size){
      let fd = new FormData()
      let token = document.getElementsByName("csrf-token")[0].content
      fd.append("authenticity_token",token)
      fd.append("file",file.slice(startChunk,endChunk))
      fd.append("filename",file.name)
      fd.append("store_name",storeName)
      fd.append("piece",piece)
      fd.append("final",totalPiece)
      DOCUMENT.queueFiles.push( new Mission(el, fd, Math.floor(piece/totalPiece*1000)/10, piece, totalPiece))
      piece++
      startChunk=endChunk+1
      endChunk=startChunk+CHUNK_SIZE
    }
    let fd = new FormData()
    let token = document.getElementsByName("csrf-token")[0].content
    fd.append("authenticity_token",token)
    fd.append("file",file.slice(startChunk,file.size-1))
    fd.append("filename",file.name)
    fd.append("store_name",storeName)
    fd.append("piece",piece)
    fd.append("final",totalPiece)
    DOCUMENT.queueFiles.push( new Mission(el, fd, Math.floor(piece/totalPiece*1000)/10, piece, totalPiece))
  }
}
//啓動上傳流程,以status參數避免重複上傳
DOCUMENT.beginUpload = () => {
  if(!DOCUMENT.uploadStatus) {
    DOCUMENT.uploadStatus = true
    DOCUMENT.uploadFile()
    SHARE.docCount.style.transform = "scale(2)"
  }
}
//將佇列中的任務依序上傳(1線)
DOCUMENT.uploadFile = () => {
  if(DOCUMENT.queueFiles.length > 0){
    DOCUMENT.queueFiles.shift().send()
  }else{
    DOCUMENT.uploadStatus = false
    SHARE.pushMsg(' 上傳任務已經全部完成！ ')
    SHARE.docCount.style.transform = null
  }
}
//華麗的清除已完成的上傳
DOCUMENT.clearComplete = () => {
  let targets = document.getElementsByClassName("upload-item complete")
  let total = document.getElementsByClassName("upload-item")
  let delay_time = (targets.length - 1) * 150 + 300
  let keyframes = [
    {transform: "translateX(0)",opacity: 1, height: "10vw"},
    {transform: "translateX(100%)",opacity: 0,height: "0"}
  ]
  let options = {duration: 300, fill: "forwards"}
  for(let i=0;i<targets.length;i++){
    setTimeout(() => {targets[i].animate(keyframes, options)},i * 150)
  }
  setTimeout(() => {
    while(targets.length > 0) {
      targets[0].remove()
    }
    if(targets.length === total.length){
      DOCUMENT.uploadZone.classList.remove("uploading")
    }
  }, delay_time)
}
//分辨檔案類型,產生upload-item
DOCUMENT.identifyType = (file, i) => {
  DOCUMENT.uprogress = document.getElementById("upload-progress") // 上傳進度
  DOCUMENT.upitem = document.createElement('div') // 上傳物件
  DOCUMENT.upitem.classList.add('upload-item')
  DOCUMENT.svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
  DOCUMENT.svg.classList.add("file-type")
  DOCUMENT.icon = document.createElementNS('http://www.w3.org/2000/svg','use')
  DOCUMENT.docName = document.createElement('h1')
  DOCUMENT.docName.classList.add("item-name")
  DOCUMENT.docName.textContent = file.name
  DOCUMENT.docName.title = file.name
  DOCUMENT.docSize = document.createElement('h2')
  DOCUMENT.docSize.classList.add("item-size")
  if(file.size < KB){
    DOCUMENT.docSize.innerText = file.size + " bytes"
  }else if(file.size < MB){
    DOCUMENT.docSize.innerText = (Math.ceil(file.size / KB * 10) / 10) + " kB"
  }else if(file.size < GB){
    DOCUMENT.docSize.innerText = (Math.ceil(file.size / MB * 10) / 10) + " MB"
  }else{
    DOCUMENT.docSize.innerText = (Math.ceil(file.size / GB * 10) / 10) + " GB"
  }
  DOCUMENT.item_status = document.createElementNS('http://www.w3.org/2000/svg','svg')
  DOCUMENT.item_status.classList.add("item-status")
  DOCUMENT.item_status.style.backgroundColor="hsl(0,0%,20%)"
  let status_icon = document.createElementNS('http://www.w3.org/2000/svg','use')
  status_icon.setAttribute("href","/assets/icon/icons.svg#item-waiting")
  DOCUMENT.item_status.appendChild(status_icon)
  // 根據附檔名顯示不同的icon
  switch(file.name.split('.').pop().toLowerCase()){
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      DOCUMENT.icon.setAttribute('href','/assets/icon/icons.svg#image')
      break
    case "avi":
    case "mp4":
    case "webm":
    case "wmv":
    case "flv":
      DOCUMENT.icon.setAttribute('href','/assets/icon/icons.svg#video')
      break
    case "doc":
    case "docx":
      DOCUMENT.icon.setAttribute('href','/assets/icon/icons.svg#word')
      break
    case "ppt":
    case "pptx":
      DOCUMENT.icon.setAttribute('href','/assets/icon/icons.svg#ppt')
      break
    case "xls":
    case "xlsx":
      DOCUMENT.icon.setAttribute('href','/assets/icon/icons.svg#excel')
      break
    case "pdf":
      DOCUMENT.icon.setAttribute('href','/assets/icon/icons.svg#pdf')
      break
    case "zip":
    case "rar":
    case "7z":
      DOCUMENT.icon.setAttribute('href','/assets/icon/icons.svg#archive')
      break
    default:
      DOCUMENT.icon.setAttribute('href','/assets/icon/icons.svg#default')
  }
  DOCUMENT.svg.appendChild(DOCUMENT.icon)
  DOCUMENT.upitem.appendChild(DOCUMENT.svg)
  DOCUMENT.upitem.appendChild(DOCUMENT.docName)
  DOCUMENT.upitem.appendChild(DOCUMENT.item_status)
  DOCUMENT.upitem.appendChild(DOCUMENT.docSize)
  DOCUMENT.uprogress.appendChild(DOCUMENT.upitem)
  DOCUMENT.toQueue(file,DOCUMENT.upitem)
}
//等候DOM讀取
document.addEventListener('DOMContentLoaded',() => {
  //Vue
  DOCUMENT.Vue = new Vue({
    el: "#files-content",
    data: {
      docs: null,
      docsStorage: null,
      docsSplited: null,
      docsCurrentIndex: null,
      usingFilters: [],
      tags: null,
      token: null,
      edit: {
        id: null,
        ids: null,
        title: null,
        newTitle: null,
        targetFile: null,
        targetFiles: null,
        mode: null
      },
    },
    watch: {
      docsCurrentIndex: function(val) {
        this.docs = this.docsSplited[val - 1]
      }
    },
    methods: {
      // 獲取檔案列表
      getFile: function(keepFilter, keepPage) {
        SHARE.workQueue++
        SHARE.showLoading()
        this.$http.get('/ceb9458d5364668953b05327205aa8af/documents.json').then(response => {
          this.docsStorage = JSON.parse(JSON.stringify(response.body.docs))
          tmp_docs = JSON.parse(JSON.stringify(response.body.docs))
          this.docsSplited = []
          while(tmp_docs.length) {
            this.docsSplited.push(tmp_docs.splice(0, 45))
          }
          if(!keepPage) {
            this.docsCurrentIndex = 1
          }
          this.checkPage()
          this.docs = this.docsSplited[this.docsCurrentIndex - 1]
          this.tags = response.body.tags
          if(!keepFilter) {
            this.usingFilters = []
            let usings = document.getElementsByClassName('using')
            while(usings.length > 0) {
              usings[0].classList.remove('using')
            }
            let selected = document.getElementsByClassName('selected')
            while(selected.length > 0) {
              selected[0].classList.remove('selected')
            }
          }
          this.filterFiles()
          this.token = document.getElementsByName('csrf-token')[0].content
          SHARE.workQueue--
          SHARE.showLoading()
        },response => {
          SHARE.pushMsg(" error in render all docs ")
          SHARE.workQueue--
          SHARE.showLoading()
        })
      },
      checkPage: function() {
        if(this.docsCurrentIndex > 1) {
          DOCUMENT.pageLeft.classList.add('active')
        }else{
          DOCUMENT.pageLeft.classList.remove('active')
        }
        if(this.docsCurrentIndex < this.docsSplited.length) {
          DOCUMENT.pageRight.classList.add('active')
        }else{
          DOCUMENT.pageRight.classList.remove('active')
        }
      },
      prevPage: function() {
        if(this.docsCurrentIndex > 1) {
          this.docsCurrentIndex -= 1
          DOCUMENT.explorer.scrollTo(0,0)
          this.checkPage()
          let selected = document.getElementsByClassName('selected')
          while(selected.length > 0) {
            selected[0].classList.remove('selected')
          }
        }
      },
      nextPage: function() {
        if(this.docsCurrentIndex < this.docsSplited.length) {
          this.docsCurrentIndex += 1
          DOCUMENT.explorer.scrollTo(0,0)
          this.checkPage()
          let selected = document.getElementsByClassName('selected')
          while(selected.length > 0) {
            selected[0].classList.remove('selected')
          }
        }
      },
      // 獲取每個檔案的座標位置
      setCoordinate: function() {
        let files = document.getElementsByClassName('file-container')
        for(file of files) {
          let attrs = file.getBoundingClientRect()
          let vw = window.innerWidth * 0.01
          let vh = window.innerHeight * 0.01
          file.dataset.top = attrs.top
          file.dataset.bottom = attrs.bottom
          file.dataset.left = attrs.left
          file.dataset.right = attrs.right
        }
      },
      // 編輯檔案標題
      editFileTitle: function() {
        let selectedList = document.getElementsByClassName('selected')
        if(selectedList.length === 1) {
          this.edit.mode = "0"
          let target = selectedList[0]
          this.edit.targetFile = target
          this.edit.id = target.dataset.id
          this.edit.title = target.dataset.title
          DOCUMENT.editFileTitle.children[2].value = this.edit.title
          DOCUMENT.editFileTitle.children[1].textContent = '重新命名「' + this.edit.title + '」'
          DOCUMENT.editFileTitle.classList.add('active')
          setTimeout(() => {
            DOCUMENT.editFileTitle.classList.remove('underground')
            DOCUMENT.editFileTitle.children[2].focus()
            DOCUMENT.editFileTitle.children[2].setSelectionRange(0, this.edit.title.length)
          }, 0)
        }else if(selectedList.length > 1){
          this.edit.mode = "1"
          this.edit.targetFiles = selectedList
          this.edit.ids = []
          for(s of selectedList) {
            this.edit.ids.push(s.dataset.id)
          }
          this.edit.ids = this.edit.ids.join()
          DOCUMENT.editFileTitle.children[2].value = ""
          DOCUMENT.editFileTitle.children[1].textContent = '重新命名(複數檔案)'
          DOCUMENT.editFileTitle.classList.add('active')
          setTimeout(() => {
            DOCUMENT.editFileTitle.classList.remove('underground')
            DOCUMENT.editFileTitle.children[2].focus()
          }, 200)
        }
      },
      // 更新檔案標題
      updateFileTitle: function() {
        this.edit.newTitle = DOCUMENT.editFileTitle.children[2].value
        if(this.edit.mode === "0"){
          if(this.edit.title === this.edit.newTitle) {
            this.closeEditFileTitle()
          }else{
            let duplicate = false
            for(let i=0,l=this.docsStorage.length;i<l;++i) {
              let fileName = this.docsStorage[i].title
              let extName = this.docsStorage[i].ext
              let fullName = fileName + extName
              if(fullName === this.edit.newTitle+this.edit.targetFile.dataset.ext) {
                duplicate = true
                break
              }
            }
            if(duplicate) {
              SHARE.pushMsg('檔案名稱已存在')
            }else{
              let hash = {'authenticity_token': this.token, 'mode': this.edit.mode, 'id': this.edit.id, 'title': this.edit.newTitle}
              SHARE.workQueue++
              SHARE.showLoading()
              this.$http.patch('/ceb9458d5364668953b05327205aa8af/rename',hash).then(response => {
                SHARE.logVue.getLogs()
                //success
                SHARE.workQueue--
                SHARE.showLoading()
                this.closeEditFileTitle()
                this.getFile(true,true)
                SHARE.pushMsg(' 檔案重新命名成功 ')
              },response => {
                SHARE.pushMsg(' 系統異常, 重新命名失敗 ')
                SHARE.workQueue--
                SHARE.showLoading()
                this.closeEditFileTitle()
              })
            }
          }
        }else if(this.edit.mode === "1") {
          let hash = {'authenticity_token': this.token, 'mode': this.edit.mode, 'ids': this.edit.ids, 'title': this.edit.newTitle}
          SHARE.workQueue++
          SHARE.showLoading()
          this.$http.patch('/ceb9458d5364668953b05327205aa8af/rename',hash).then(response => {
            SHARE.logVue.getLogs()
            //success
            SHARE.workQueue--
            SHARE.showLoading()
            this.closeEditFileTitle()
            this.getFile(true,true)
            SHARE.pushMsg(' 檔案重新命名成功 ')
          },response => {
            SHARE.pushMsg(' 系統異常, 重新命名失敗 ')
            SHARE.workQueue--
            SHARE.showLoading()
            this.closeEditFileTitle()
          })
        }
        DOCUMENT.Vue.getFile(true, true)
      },
      removeFile: function() {
        let selectedList = document.getElementsByClassName('selected')
        if(selectedList.length === 1) {
          if(confirm('確定刪除？')){
            let target = selectedList[0]
            let xhr = new XMLHttpRequest()
            xhr.open('POST', '/ceb9458d5364668953b05327205aa8af/rm')
            let fd = new FormData()
            fd.append('authenticity_token', DOCUMENT.Vue.token)
            fd.append('mode','0')
            fd.append('id',target.dataset.id)
            SHARE.workQueue++
            SHARE.showLoading()
            xhr.send(fd)
            xhr.addEventListener('load', e => {
              if(e.target.status === 200) {
                let oldDocCount = parseInt(SHARE.docCount.textContent)
                SHARE.docCount.style.transform = "scale(2)"
                setTimeout(() => {
                  SHARE.docCount.textContent = oldDocCount-1
                },500)
                setTimeout(() => {
                  SHARE.docCount.style.transform = null
                }, 600)
                SHARE.logVue.getLogs()
                let usingTags = document.getElementsByClassName('using')
                let resetFilter = false
                for(let i=0,l=usingTags.length;i<l;++i) {
                  // 如果是與該檔案相關的標籤且該標籤只剩此一檔案， 則重置使用標籤
                  if(parseInt(usingTags[i].children[1].textContent) <= 1) {
                    resetFilter = true
                  }
                }
                if(resetFilter) {
                  this.getFile(false, false)
                }else{
                  this.getFile(true, true)
                }
                SHARE.pushMsg(' 檔案已經順利刪除 ')
                target.classList.remove('selected')
                SHARE.workQueue--
                SHARE.showLoading()
              }else{
                SHARE.pushMsg(' 發生錯誤, 檔案刪除失敗 ')
                SHARE.workQueue--
                SHARE.showLoading()
              }
            }, false)
          }
        }else if(selectedList.length > 1) {
          if(confirm('確定刪除？')){
            let ids = []
            for(target of selectedList) {
              ids.push(target.dataset.id)
            }
            let xhr = new XMLHttpRequest()
            xhr.open('POST','/ceb9458d5364668953b05327205aa8af/rm')
            let fd = new FormData()
            fd.append('authenticity_token', DOCUMENT.Vue.token)
            fd.append('mode','1')
            fd.append('ids',ids.join())
            SHARE.workQueue++
            SHARE.showLoading()
            xhr.send(fd)
            xhr.addEventListener('load', e => {
              if(e.target.status === 200) {
                let oldDocCount = parseInt(SHARE.docCount.textContent)
                SHARE.docCount.style.transform = "scale(2)"
                setTimeout(() => {
                  SHARE.docCount.textContent = oldDocCount-ids.length
                },500)
                setTimeout(() => {
                  SHARE.docCount.style.transform = null
                }, 600)
                SHARE.logVue.getLogs()
                let usingTags = document.getElementsByClassName('using')
                let resetFilter = false
                for(let i=0,l=usingTags.length;i<l;++i) {
                  // 如果是與該檔案相關的標籤且該標籤只剩此一檔案， 則重置使用標籤
                  if(parseInt(usingTags[i].children[1].textContent) <= selectedList.length) {
                    resetFilter = true
                  }
                }
                if(resetFilter) {
                  this.getFile(false, false)
                }else{
                  this.getFile(true, true)
                }
                SHARE.pushMsg(' 檔案已經順利刪除 ')
                while(selectedList.length) {
                  selectedList[0].classList.remove('selected')
                }
                while(selectedList.length > 0) {
                  selectedList[0].remove()
                }
                SHARE.workQueue--
                SHARE.showLoading()
              }else{
                SHARE.pushMsg(' 發生錯誤, 檔案刪除不完全或執行失敗 ')
                SHARE.workQueue--
                SHARE.showLoading()
              }
            },false)
          }
        }
      },
      downloadFile: function() {
        let selectedList = document.getElementsByClassName('selected')
        if(selectedList.length === 1){
          let target = selectedList[0]
          DOCUMENT.downloadInput.value = target.dataset.id
          DOCUMENT.downloadMode.value = 'single'
          DOCUMENT.downloadForm.submit()
        }else if(selectedList.length > 1){
          let targets = []
          for(s of selectedList){
            targets.push(s.dataset.id)
          }
          targets = targets.join(',')
          DOCUMENT.downloadMode.value = 'multiple'
          DOCUMENT.downloadInput.value = targets
          DOCUMENT.downloadForm.submit()
        }
      },
      closeEditFileTitle: function() {
        DOCUMENT.editFileTitle.classList.remove('active')
        setTimeout(() => {
          DOCUMENT.editFileTitle.classList.add('underground')
          DOCUMENT.explorer.focus()
        },200)
      },
      openTagConsole: function(){
        DOCUMENT.tagConsole.classList.add('active')
        setTimeout(() => {
          DOCUMENT.tagConsole.classList.remove('underground')
          DOCUMENT.addTagField.focus()
        }, 0)
      },
      closeTagConsole: function(){
        DOCUMENT.tagConsole.classList.remove('active')
        setTimeout(() => {
          DOCUMENT.tagConsole.classList.add('underground')
        }, 300)
      },
      openDocTagEditor: function(){
        DOCUMENT.docTagEditor.classList.add('active')
        DOCUMENT.docTagEditor.focus()
        let selected = document.getElementsByClassName('selected')
        if(selected.length === 1){
          selected = selected[0]
          DOCUMENT.docTagTitle.textContent = '編輯「' + selected.dataset.title + '」的標籤'
          let taggedIds = selected.dataset.tags.split(',')
          for(taggedId of taggedIds){
            let targetTag = DOCUMENT.docTagEditor.querySelector(`.editor-tag[data-tag-id="${taggedId}"]`)
            if(targetTag){
              targetTag.classList.add('tagged')
            }
          }
          setTimeout(() => {
            DOCUMENT.docTagEditor.classList.remove('underground')
            DOCUMENT.docTagEditor.dataset.docId = selected.dataset.id
          }, 300)
        }else if(selected.length > 1){
          let tmpArray = selected[0].dataset.tags.split(',')
          for(let i=1,l=selected.length;i<l;++i){
            if(tmpArray.length){
              tmpArray = SHARE.intersection(tmpArray, selected[i].dataset.tags.split(','))
            }else{
              break
            }
            if(tmpArray.length){
              for(taggedId of tmpArray){
                let targetTag = DOCUMENT.docTagEditor.querySelector(`.editor-tag[data-tag-id="${taggedId}"]`)
                if(targetTag){
                  targetTag.classList.add('tagged')
                }
              }
            }
            DOCUMENT.docTagTitle.textContent = `編輯多個檔案的共同標籤(${selected.length})`
          } //AF!@#!@#!@#@$!@#
          let docIds = []
          for(s of selected) {
            docIds.push(s.dataset.id)
          }
          docIds = docIds.join(',')
          setTimeout(() => {
            DOCUMENT.docTagEditor.classList.remove('underground')
            DOCUMENT.docTagEditor.dataset.docId = docIds
          }, 300)
        }
      },
      closeDocTagEditor: function(){
        DOCUMENT.docTagEditor.classList.remove('active')
        setTimeout(() => {
          DOCUMENT.docTagEditor.classList.add('underground')
          DOCUMENT.docTagEditor.dataset.docId = null
          for(tag of document.getElementsByClassName('editor-tag')){
            tag.classList.remove('tagged')
          }
        }, 300)
      },
      createTag: function(){
        let tagNames = []
        for(element of document.getElementsByClassName('console-tag')){
          tagNames.push(element.children[0].textContent)
        }
        let newTagName = DOCUMENT.addTagField.value
        if(!tagNames.includes(newTagName)){
          let hash = {authenticity_token: this.token, tag_name: newTagName}
          this.$http.post('/ceb9458d5364668953b05327205aa8af/tag_create',hash).then(response => {
            SHARE.logVue.getLogs()
            this.getFile(true, true)
            DOCUMENT.addTagField.value=null
            SHARE.pushMsg(`標籤「${newTagName}」已經新增`)
          }, response => {
            SHARE.pushMsg('發生異常，新增標籤失敗')
          })
        }
      },
      delTag: function(e){
        let tag = e.target.parentNode
        let id = tag.dataset.tagId
        let name = tag.children[0].textContent
        if (confirm(`確定要刪除標籤「${name}」嗎`)) {
          let hash = {authenticity_token: this.token, tag_name: name, tag_id: id}
          this.$http.post('/ceb9458d5364668953b05327205aa8af/tag_del',hash).then(response => {
            let targetIndex = this.usingFilters.indexOf(id.toString())
            if(targetIndex >= 0) {
              console.log('你刪除了正在使用的標籤')
              this.usingFilters.splice(targetIndex, 1)
            }
            this.getFile(true, true)
            SHARE.logVue.getLogs()
            SHARE.pushMsg(`標籤「${name}」已經刪除`)
          },fail => {
            SHARE.pushMsg('發生異常, 刪除失敗')
          })
        }
      },
      renameTag: function(e){
        let tag = e.target.parentNode
        let id = tag.dataset.tagId
        let name = tag.children[0].textContent
        let newName = prompt('請輸入新的標籤名稱')
        if(newName === name){
          SHARE.pushMsg('新的名稱不允許與舊有名稱相同')
        }else if(newName === ''){
          SHARE.pushMsg('標籤名稱不得爲空')
        }else if(newName === null){}else{
          let hash = {authenticity_token: this.token, name: newName, id: id}
          this.$http.patch('/ceb9458d5364668953b05327205aa8af/rename_tag',hash).then(response => {
            SHARE.logVue.getLogs()
            this.getFile(true, true)
            SHARE.pushMsg('標籤已重新命名')
          }, response => {
            SHARE.pushMsg('重新命名失敗')
          })
        }
      },
      toggleTag: function(e){
        let mode
        let docId = DOCUMENT.docTagEditor.dataset.docId
        let tagId = e.target.dataset.tagId
        let selected = document.getElementsByClassName('selected')[0]
        let tagged = selected.dataset.tags.split(',')
        let newTagged = tagged
        let multiTag
        if (docId.includes(',')) {
          multiTag = 1
        } else {
          multiTag = 0
        }
        if (e.target.classList.contains('tagged')) {
          mode = 'minus'
          newTagged.splice(tagged.indexOf(tagId))
        }else{
          mode = 'add'
          newTagged.push(tagId)
          newTagged = newTagged.sort()
        }
        newTagged = newTagged.join(',')
        let hash = { authenticity_token: this.token, mode: mode, doc_id: docId, tag_id: tagId, multi_tag: multiTag }
        SHARE.workQueue++
        SHARE.showLoading()
        this.$http.post('/ceb9458d5364668953b05327205aa8af/tag_toggle',hash).then(response => {
          SHARE.logVue.getLogs()
          //
          let usingTags = document.getElementsByClassName('using')
          let resetFilter = false
          for(let i=0,l=usingTags.length;i<l;++i) {
            // 如果是與該檔案相關的標籤且該標籤只剩此一檔案， 則重置使用標籤
            if(multiTag === 0) {
              if(parseInt(usingTags[i].children[1].textContent) <= 1) {
                resetFilter = true
              }
            }else{
              if(parseInt(usingTags[i].children[1].textContent) <= docId.split(',').length) {
                resetFilter = true
              }
            }
          }
          if(resetFilter) {
            this.getFile(false, false)
          }else{
            this.getFile(true, true)
          }
          //
          this.getFile(true, true)
          e.target.classList.toggle('tagged')
          selected.dataset.tags = newTagged
          SHARE.workQueue--
          SHARE.showLoading()
        }, response => {
          SHARE.pushMsg('發生無預期的錯誤')
          SHARE.workQueue--
          SHARE.showLoading()
        })
      },
      toggleFilter: function(e){
        // 如果是增加過濾標籤 則加進usingFilter, 反之則從array中移出
        if(e.target.classList.contains('using')) {
          e.target.classList.remove('using')
          let targetIndex = this.usingFilters.indexOf(e.target.dataset.tagId)
          this.usingFilters.splice(targetIndex, 1)
        }else{
          e.target.classList.add('using')
          this.usingFilters.push(e.target.dataset.tagId)
        }
        // 如果使用標籤不爲空, 開始過濾檔案
        let filters = document.getElementsByClassName('tag-filter')
        if(this.usingFilters.length > 0) {
          this.filterFiles()
        }else{
          this.docsSplited = []
          tmp_docs = JSON.parse(JSON.stringify(this.docsStorage))
          while(tmp_docs.length) {
            this.docsSplited.push(tmp_docs.splice(0, 45))
          }
          this.docs = this.docsSplited[0]
          this.docsCurrentIndex = 1
          DOCUMENT.pageLeft.classList.remove('active')
          if(this.docsSplited.length > 1) {
            DOCUMENT.pageRight.classList.add('active')
          }else{
            DOCUMENT.pageRight.classList.remove('active')
          }
          for(let i=0,l=filters.length;i<l;++i) {
            let docsLength = filters[i].dataset.docIds.split(',').length
            if(filters[i].dataset.docIds.length > 0) {
              filters[i].children[1].textContent = docsLength
              filters[i].style.display = null
            }else{
              filters[i].style.display = "none"
            }
          }
        }
      },
      filterFiles: function() {
        let tmp_array = []
        let l = this.docsStorage.length
        for(let i=0;i<l;++i) {
          if((SHARE.intersection(this.docsStorage[i].taggedWith.split(','), this.usingFilters)).length === this.usingFilters.length) {
            tmp_array.push(this.docsStorage[i])
          }
        }
        let currentResults = []
        for(let i=0,l=tmp_array.length;i<l;++i) {
          currentResults.push(tmp_array[i].id.toString())
        }
        tmp_array_count = tmp_array.length
        this.docsSplited = []
        while(tmp_array.length > 0) {
          this.docsSplited.push(tmp_array.splice(0, 45))
        }
        this.docs = this.docsSplited[0]
        this.docsCurrentIndex = 1
        DOCUMENT.pageLeft.classList.remove('active')
        if(this.docsSplited.length > 1) {
          DOCUMENT.pageRight.classList.add('active')
        }else{
          DOCUMENT.pageRight.classList.remove('active')
        }
        let filters = document.getElementsByClassName('tag-filter')
        for(let i=0,l=filters.length;i<l;++i) {
          if(filters[i].classList.contains('using')) {
            filters[i].children[1].textContent = tmp_array_count
          }else{
            tmpResult = SHARE.intersection(filters[i].dataset.docIds.split(','), currentResults)
            if(tmpResult.length) {
              filters[i].style.display = null
            }else{
              filters[i].style.display = "none"
            }
            filters[i].children[1].textContent = tmpResult.length
          }
        }
      },
      select: function(layer,e){
        DOCUMENT.selectFile(layer, e)
      },
      openFileScreen: function(){
        DOCUMENT.openFileScreen()
      },
      close: function(){
        DOCUMENT.closeFilesScreen()
      },
      showTooltip: function(text){
        SHARE.showTooltip(text)
      },
      hideTooltip: function(){
        SHARE.hideTooltip()
      }
    }
  })
  Vue.config.keyCodes.f2 = 113
  //VUE END
  //Elements
  DOCUMENT.editFileTitle = document.getElementById('edit-file-title')
  DOCUMENT.explorer = document.getElementById('file-explorer')
  DOCUMENT.explorerMenu = document.getElementById('explorer-menu')
  DOCUMENT.downloadAction = document.getElementById('act-dl')
  DOCUMENT.renameAction = document.getElementById('act-rename')
  DOCUMENT.removeAction = document.getElementById('act-rm')
  DOCUMENT.tagAction = document.getElementById('act-tag')
  DOCUMENT.newFileIcon = document.getElementById('new-file-icon')
  DOCUMENT.uploadZone = document.getElementById("upload-zone")
  DOCUMENT.uploadIcon = document.getElementById("upload-icon")
  DOCUMENT.uploadIconUse = DOCUMENT.uploadIcon.children[0]
  DOCUMENT.ffield = document.getElementById('ffield')
  DOCUMENT.closeFile = document.getElementById("close-files")
  DOCUMENT.clearHistory = document.getElementById("clear-history")
  DOCUMENT.selectZone = document.getElementById('select-zone')
  DOCUMENT.downloadForm = document.getElementById('download-form')
  DOCUMENT.downloadInput = document.getElementById('file_id')
  DOCUMENT.downloadMode = document.getElementById('download_mode')
  DOCUMENT.tagConsole = document.getElementById('tag-console')
  DOCUMENT.docTagEditor = document.getElementById('doc-tag-editor')
  DOCUMENT.docTagTitle = document.getElementById('doc-tag-title')
  DOCUMENT.addTagField = document.getElementById('add-tag-field')
  DOCUMENT.tagConsoleList = document.getElementById('tag-console-list')
  DOCUMENT.pageLeft = document.getElementById('doc-page-left')
  DOCUMENT.pageRight = document.getElementById('doc-page-right')
  //Bindings
  DOCUMENT.uploadIcon.addEventListener('click',() => {DOCUMENT.ffield.click()})
  DOCUMENT.ffield.addEventListener('change',e => {
    DOCUMENT.handleFiles(e.target.files)
    e.target.value = ""
  })
  DOCUMENT.clearHistory.addEventListener('click',() => {
    DOCUMENT.clearComplete()
  })
  DOCUMENT.downloadAction.addEventListener('click', e => {
  })
  // left btn down, ready for drag select!
  DOCUMENT.explorer.addEventListener('mousedown', e => {
    DOCUMENT.Vue.setCoordinate()
    if(!DOCUMENT.menuIsOpen) {
      let selected = document.getElementsByClassName('selected')
      if(!e.ctrlKey){
        while(selected.length > 0){
          selected[0].classList.remove('selected')
        }
      }
      if(e.which === 1) {
        DOCUMENT.isMouseDown = true
        DOCUMENT.setStart(e.pageX, e.pageY)
      }
    }
  })
  DOCUMENT.explorer.addEventListener('contextmenu', e => {
    e.preventDefault()
    if(!DOCUMENT.menuIsOpen) {
      let selectedList = document.getElementsByClassName('selected')
      DOCUMENT.downloadAction.textContent = '下載'
      DOCUMENT.renameAction.textContent = '重新命名'
      DOCUMENT.removeAction.textContent = '刪除'
      DOCUMENT.tagAction.textContent = '編輯標籤'
      if(selectedList.length > 1){
        DOCUMENT.downloadAction.textContent = `打包下載(${selectedList.length})`
        DOCUMENT.renameAction.textContent = `批次重新命名(${selectedList.length})`
        DOCUMENT.removeAction.textContent = `刪除多個檔案(${selectedList.length})`
        DOCUMENT.tagAction.textContent = `編輯共同標籤(${selectedList.length})`
      }
      if(selectedList.length >= 1) {
        DOCUMENT.explorerMenu.classList.add('active')
        DOCUMENT.menuIsOpen = true
      }
      let vh = window.innerHeight * 0.01
      let vw = window.innerWidth * 0.01
      let scrollY = DOCUMENT.explorer.scrollTop
      if(e.pageY < DOCUMENT.explorer.getBoundingClientRect().bottom - 90) {
        DOCUMENT.explorerMenu.style.top = (e.pageY - 14.6*vh - 0.5*vw + scrollY)+'px'
      }else{
        DOCUMENT.explorerMenu.style.top = (e.pageY - 14.6*vh - 0.5*vw - 90 + scrollY)+'px'
      }
      if(e.pageX < DOCUMENT.explorer.getBoundingClientRect().right - 130){
        DOCUMENT.explorerMenu.style.left = (e.pageX - 15.2*vw) + 'px'
      }else{
        DOCUMENT.explorerMenu.style.left = (e.pageX - 15.2*vw - 118) + 'px'
      }
    }else{
      DOCUMENT.explorerMenu.classList.remove('active')
      DOCUMENT.menuIsOpen = false
    }
  })
  // left btn up, destroy drag select zone!
  DOCUMENT.explorer.addEventListener('mouseup', e => {
    if(e.which === 1) {
      DOCUMENT.isMouseDown = false
      DOCUMENT.selectZone.classList.remove('active')
      DOCUMENT.explorerMenu.classList.remove('active')
      DOCUMENT.menuIsOpen = false
    }
  })
  DOCUMENT.explorer.addEventListener('keydown', e => {
    if(e.ctrlKey && e.keyCode === 65) {
      e.preventDefault()
      let files = document.getElementsByClassName('file-container')
      for(file of files){
        file.classList.add('selected')
      }
    }
  })
  DOCUMENT.explorer.addEventListener('mousemove', e => {
    if(DOCUMENT.isMouseDown) {
      DOCUMENT.setEnd(e.pageX,e.pageY)
      DOCUMENT.checkTouch(e)
    }
  })
})
