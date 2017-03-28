// 不需等候DOM讀取
DOCUMENT.isMouseDown = false
DOCUMENT.startPos = {x: null, y:null, scrollY: null}
DOCUMENT.endPos = {x: null, y: null, scrollY: null}
DOCUMENT.menuIsOpen = false
DOCUMENT.clickCount = 0
DOCUMENT.resultFiles = [] // 檔案過濾結果
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
DOCUMENT.identifyType2 = ext => {
  switch(ext){
    case ".jpg":
    case ".jpeg":
    case ".png":
    case ".gif":
      return'/assets/icon/icons.svg#image'
      break
    case ".avi":
    case ".mp4":
    case ".webm":
    case ".wmv":
    case ".flv":
    case ".mkv":
      return '/assets/icon/icons.svg#video'
      break
    case ".doc":
    case ".docx":
      return '/assets/icon/icons.svg#word'
      break
    case ".ppt":
    case ".pptx":
      return  '/assets/icon/icons.svg#ppt'
      break
    case ".xls":
    case ".xlsx":
      return'/assets/icon/icons.svg#excel'
      break
    case ".pdf":
      return  '/assets/icon/icons.svg#pdf'
      break
    case ".zip":
    case ".rar":
    case ".7z":
      return '/assets/icon/icons.svg#archive'
      break
    default:
      return '/assets/icon/icons.svg#default'
      break
  }
}
//判斷檔案圖示與拖拉方塊是否有接觸
DOCUMENT.checkTouch = (e) => {
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
      rememberPage: null,
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
    watch:{
      docsCurrentIndex: function(val) {
        this.docs = this.docsSplited[val - 1]
      }
    },
    methods: {
      // 獲取檔案列表
      getFile: function(){
        SHARE.workQueue++
        SHARE.showLoading()
        this.$http.get('/documents.json').then(response => {
          this.docsStorage = JSON.parse(JSON.stringify(response.body.docs))
          tmp_docs = JSON.parse(JSON.stringify(response.body.docs))
          this.docsSplited = []
          while(tmp_docs.length) {
            this.docsSplited.push(tmp_docs.splice(0, 45))
          }
          if(!this.rememberPage) {
            this.docsCurrentIndex = 1
          }
          this.checkPage()
          this.docs = this.docsSplited[this.docsCurrentIndex - 1]
          this.tags = response.body.tags
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
      //toggleFilter: function(e){
        //// 切換using class 並將標籤物件加入usingFilters
        //e.target.classList.toggle('using')
        //if(e.target.classList.contains('using')){ // use tag
          //let tagName = e.target.children[0].textContent
          //let tagArray = e.target.dataset.docIds.split(',')
          //DOCUMENT.usingFilters[tagName] = tagArray
        //}else{ // cancel tag
          //let tagName = e.target.children[0].textContent
          //delete DOCUMENT.usingFilters[tagName]
        //}
        //// 切換using class 並將標籤物件加入usingFilters
        ////
        //// 將目標next-tags派給resultFiles, 但如果next-tags爲空 則不做
        //if(e.target.dataset.nextTags === ''){
          //DOCUMENT.resultFiles = []
        //}else{
          //DOCUMENT.resultFiles = e.target.dataset.nextTags.split(',')
        //}
        //// 將目標next-tags派給resultFiles, 但如果next-tags爲空 則不做
        ////
        //// show/hide file based on resultFiles info
        //let files = document.getElementsByClassName('file-container')
        //let tags = document.getElementsByClassName('tag-filter')
        //if(Object.keys(DOCUMENT.usingFilters).length > 0){
          //for(f of files) {
            //if(DOCUMENT.resultFiles.includes(f.dataset.id)){ // 如果檔案符合標籤過濾條件, style保持不動(恢復預設)
              //f.style.display = null
            //}else{ // 如果檔案不符標籤過濾條件, style.display設爲none
              //f.style.display = 'none'
            //}
          //}
          //// recalculate next-tags and assign count
          //for(t of tags) {
            //if(t.classList.contains('using')){ // used now
              //let tmpUsingFilters = JSON.parse(JSON.stringify(DOCUMENT.usingFilters)) // clone 一份使用中filters做下一步預測
              //let tagName = t.children[0].textContent
              //delete tmpUsingFilters[tagName]
              //let files = document.getElementsByClassName('file-container')
              //let predictResult = []
              //for(f of files) {
                //predictResult.push(f.dataset.id)
              //}
              //if(Object.keys(tmpUsingFilters).length > 0){
                //for(let tuf in tmpUsingFilters){
                  //predictResult = SHARE.intersection(predictResult, tmpUsingFilters[tuf])
                  //if(predictResult.length === 0){
                    //break
                  //}
                //}
                //t.children[1].textContent = DOCUMENT.resultFiles.length
                //predictResult = predictResult.join(',')
              //}else{
                //t.children[1].textContent = t.dataset.docIds.split(',').length
                //predictResult = t.dataset.docIds
              //}
              //t.dataset.nextTags = predictResult
            //}else{ // unused now
              //let predictResult = SHARE.intersection(DOCUMENT.resultFiles, t.dataset.docIds.split(','))
              //t.children[1].textContent = predictResult.length
              //if(predictResult.length === 0){
                //t.style.display = 'none'
              //}else{
                //t.style.display = null
              //}
              //DOCUMENT.explorer.scrollTo(0,0)
              //predictResult = predictResult.join(',')
              //t.dataset.nextTags = predictResult
            //}
          //}
          //// recalculate next-tags and assign count
        //}else{
          //for(f of files) {
            //f.style.display = null
          //}
          //for(t of tags) {
            //t.style.display = null
            //t.children[1].textContent = t.dataset.docIds.split(',').length
            //t.dataset.nextTags = t.dataset.docIds
          //}
        //}
        //// show/hide file based on resultFiles info
        ////
      //},
      select: function(layer,e){
        DOCUMENT.selectFile(layer, e)
      },
      showTooltip: function(text){
        SHARE.showTooltip(text)
      },
      hideTooltip: function(){
        SHARE.hideTooltip()
      }
    }
  })
  //VUE END
  DOCUMENT.explorer = document.getElementById('file-explorer')
  DOCUMENT.explorerMenu = document.getElementById('explorer-menu')
  DOCUMENT.downloadAction = document.getElementById('act-dl')
  DOCUMENT.newFileIcon = document.getElementById('new-file-icon')
  DOCUMENT.selectZone = document.getElementById('select-zone')
  DOCUMENT.downloadForm = document.getElementById('download-form')
  DOCUMENT.downloadInput = document.getElementById('file_id')
  DOCUMENT.downloadMode = document.getElementById('download_mode')
  DOCUMENT.pageLeft = document.getElementById('doc-page-left')
  DOCUMENT.pageRight = document.getElementById('doc-page-right')
  //Bindings
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
      if(selectedList.length > 1){
        DOCUMENT.downloadAction.textContent = `打包下載(${selectedList.length})`
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
