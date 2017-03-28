Vue.config.productionTip = false
Vue.config.devtools = false
// 不等候html文件讀取完畢即執行
const SHARE = {} // 定義一專門用在共用功能的namespace
const MEMBER = {} // 定義一專門用在成員功能的namespace
const DOCUMENT = {} // 定義一專門用在檔案功能的namespace
const TUBE = {} // 定義一專門用在YouTube功能的namespace
SHARE.msgQueue = [] // 系統廣播訊息佇列
SHARE.msgStatus = false // 廣播訊息是否正在播放中
SHARE.workQueue = 0 // 任務佇列數量
SHARE.doubleClickTimer = null // 雙擊按鍵重置計時器
SHARE.doubleClickCount = 0 // 雙擊按鍵計數器
SHARE.documentMounted = false // 檔案功能是否已被掛載
SHARE.tubeMounted = false // YouTube功能是否已被掛載
SHARE.dbmw = null // 用於dontBlockMyWay的綁定
//遊標靠近系統訊息時,自動將訊息Z軸移至下層以防止按鈕被阻擋
SHARE.dontBlockMyWay = e => {
  if (SHARE.sysMsg.classList.contains('visible')) {
    let msgRect=SHARE.sysMsg.getBoundingClientRect() // 取得系統訊息的矩形資訊派給msgRect此一變數
    let msgCx = ( msgRect.left + msgRect.right ) / 2 // 矩形X軸中心點
    let msgCy = ( msgRect.top + msgRect.bottom )/ 2 // 矩形Y軸中心點
    let distX = Math.abs( Math.round(e.pageX-msgCx) ) // 遊標X座標與矩形X軸軸心之距離
    let distY = Math.abs( Math.round(e.pageY-msgCy) ) // 遊標Y座標與矩形Y軸軸心之距離
    let limitX = msgRect.width / 2 + 5 // X軸距離小於多少時觸發Z軸動作
    let limitY = msgRect.height / 2 + 5 // Y軸距離小於多少時觸發Z軸動作
    // 當遊標的X軸距離與Y軸距離皆小於界限，則表示進入守備範圍，觸發Z軸動作
    if (distX < limitX && distY < limitY) {
      SHARE.sysMsg.style.opacity = "0.2" // 將透明度設爲能剛好看見的程度
      SHARE.sysMsg.style.pointerEvents = "none" // 取消sysMsg的點擊事件，現在遊標點在上面會「透」過去
    } else {
      SHARE.sysMsg.removeAttribute('style') // 移除行內style，還原爲開始之可見狀態
    }
  }
}
//隱藏功能提示
SHARE.hideTooltip = () => {
  SHARE.tooltip.textContent = "" // 將工具提示的文字內容設爲空
}
//換頁處理器 根據按鍵組合往左或右切換
SHARE.pageHandler = key => {
  switch (key) {
    case 37:
      SHARE.toLeft(SHARE.root)
      break
    case 39:
      SHARE.toRight(SHARE.root)
      break
  }
}
//推送系統訊息至佇列並呼叫showMsg
SHARE.pushMsg = text => {
  SHARE.msgQueue.push(text)
  if (!SHARE.msgStatus) {
    SHARE.showMsg()
  }
}
//顯示處理中的動畫
SHARE.showLoading = ()=> {
  if (SHARE.workQueue > 0) {
    SHARE.loadIcon.classList.add("visible","z5")
  } else {
    SHARE.loadIcon.classList.remove("visible","z5")
  }
}
//依序顯示佇列中的系統訊息
SHARE.showMsg = () => {
  if (!SHARE.msgStatus) {
    SHARE.msgStatus = true
    document.addEventListener('mousemove', SHARE.dbmw = e => {
      SHARE.dontBlockMyWay(e)
    })
  }
  SHARE.sysMsgText.innerText=SHARE.msgQueue.shift()
  SHARE.sysMsg.classList.add("visible")
  setTimeout(()=>{
    SHARE.sysMsg.classList.remove("visible")
    if(SHARE.msgQueue.length > 0){
      SHARE.showMsg()
    }else{
      SHARE.msgStatus = false
      document.removeEventListener('mousemove', SHARE.dbmw)
    }
  },3000)
}
//Array做交集
SHARE.intersection = (arrayA,arrayB) => {
  let result = []
  for(element of arrayA){
    if(arrayB.includes(element)){
      result.push(element)
    }
  }
  return result
}
//顯示對應功能提示
SHARE.showTooltip=(text)=>{
  SHARE.tooltip.innerText = text
}
//往左切換頁面
SHARE.toLeft=(target)=>{
  target.className
  switch(target.className){
    case "second":
      SHARE.root.className = "first"
      document.getElementsByClassName("now")[0].classList.remove("now")
      SHARE.menuBtns[0].classList.add("now")
      break
    case "third":
      SHARE.root.className = "second"
      document.getElementsByClassName("now")[0].classList.remove("now")
      SHARE.menuBtns[1].classList.add("now")
      if(!SHARE.documentMounted) {
        DOCUMENT.Vue.getFile()
        SHARE.documentMounted = true
      }
      break
  }
}
//往右切換頁面
SHARE.toRight=(target)=>{
  target.className
  switch(target.className){
    case "first":
      SHARE.root.className="second"
      document.getElementsByClassName("now")[0].classList.remove("now")
      SHARE.menuBtns[1].classList.add("now")
      if (!SHARE.documentMounted) {
        DOCUMENT.Vue.getFile()
        SHARE.documentMounted = true
      }
      break
    case "second":
      SHARE.root.className="third"
      document.getElementsByClassName("now")[0].classList.remove("now")
      SHARE.menuBtns[2].classList.add("now")
      if(!SHARE.tubeMounted) {
        TUBE.Vue.loadTubes()
        SHARE.tubeMounted = true
      }
      break
  }
}
// 等候html文件讀取完成後執行
document.addEventListener('DOMContentLoaded',() => {
  window.scrollTo(0,0)
  // 預先選取的元素
  SHARE.tooltip = document.getElementById("tooltip") // 工具提示
  SHARE.menuBtns = document.getElementsByClassName("menu-option") // 選單按鈕
  SHARE.loadIcon = document.getElementById("loading-icon") // 讀取中圖示
  SHARE.sysMsg = document.getElementById("sys-msg") // 系統訊息
  SHARE.sysMsgText = SHARE.sysMsg.getElementsByTagName("span")[0] // 系統訊息內文
  SHARE.root = document.getElementById("root-content") // 網站根元素
  SHARE.membCount = document.getElementById('memb-count') // 成員按鈕旁的計數器
  SHARE.docCount = document.getElementById('doc-count') // 檔案按鈕旁的計數器
  SHARE.tubeCount = document.getElementById('tube-count') // YouTube按鈕旁的計數器
  SHARE.killPopup = document.getElementsByClassName('popup-kill') // 一部分彈出視窗共用的關閉按鈕
  SHARE.manualBtn = document.getElementById('manual-btn') // 使用手冊按鈕
  SHARE.logo = document.getElementById('logo') // 鳳凰logo
  // 元素與事件的綁定
  // 在logo上右鍵連點兩次切換至後臺入口
  SHARE.logo.addEventListener('contextmenu', e => {
    e.preventDefault()
    if (SHARE.doubleClickTimer) {
      clearTimeout(SHARE.doubleClickTimer)
    }
    SHARE.doubleClickCount++ // 雙擊計數器加一
    if (SHARE.doubleClickCount > 1) {
      window.location = '/@admin_entry'
    }
    // 設置雙擊計時器，如果超過300毫秒，清除計數器
    SHARE.doubleClickTimer = setTimeout(() => {
      SHARE.doubleClickCount = 0
    }, 300)
  })
  // 點擊手冊按鈕在新視窗開啓使用手冊
  SHARE.manualBtn.addEventListener('click', () => {
    window.open('/manual','_blank')
  })
  //  遊標移過手冊按鈕顯示對應工具提示
  SHARE.manualBtn.addEventListener('mouseenter', () => {
    SHARE.showTooltip('閱讀使用手冊')
  })
  // 遊標移出手冊按鈕隱藏工具提示
  SHARE.manualBtn.addEventListener('mouseleave', () => {
    SHARE.hideTooltip()
  })
  //在頁面按下按鍵時觸發
  document.addEventListener('keydown', e => {
    // 按下任何按鍵後50毫秒，重置畫面位置(避免版型跑掉)
    setTimeout(() => {
      window.scrollTo(0,0)
    }, 50)
    // shift+左或右移動至對應功能區
    if (e.shiftKey && (e.keyCode === 37 || e.keyCode === 39)) {
      SHARE.pageHandler(e.keyCode)
    }
  })
  // 放止因滾輪滾動造成的跑版
  document.addEventListener('scroll', e => {
    setTimeout(() => {
      window.scrollTo(0,0)
    }, 50)
  })
  // 遞迴主選單的按鈕
  for (let i = 0, l = SHARE.menuBtns.length; i < l; ++i) {
    SHARE.menuBtns[i].addEventListener('mouseenter', e => {
      let order
      if(e.target.tagName === "svg"){
        order = e.target.dataset.order
      } else {
        order = e.target.parentNode.dataset.order
      }
      window.scrollTo(0,0)
      switch (order) {
        case "0":
          SHARE.showTooltip('切換至資訊室成員')
          break
        case "1":
          SHARE.showTooltip('切換至檔案專區')
          break
        case "2":
          SHARE.showTooltip('切換至YouTube專區')
          break
      }
    })
     // 遊標移出選單按鈕時隱藏工具提示
    SHARE.menuBtns[i].addEventListener('mouseleave', SHARE.hideTooltip)
    // 點擊選單按鈕時移動至相關功能區
    SHARE.menuBtns[i].addEventListener('click', e => {
      let currentBtn = document.getElementsByClassName('now')[0]
      currentBtn.classList.remove('now')
      let order
      let newBtn
      if(e.target.tagName === "svg") {
        newBtn = e.target
      } else {
        newBtn = e.target.parentNode
      }
      order = newBtn.dataset.order
      newBtn.classList.add("now")
      switch (order) {
        case "0":
          SHARE.root.classList = "first"
          break
        case "1":
          SHARE.root.classList = "second"
          setTimeout(() => {
            DOCUMENT.explorer.focus()
          }, 300)
          if (!SHARE.documentMounted) {
            DOCUMENT.Vue.getFile()
            SHARE.documentMounted = true
          }
          break
        case "2":
          SHARE.root.classList = "third"
          if (!SHARE.tubeMounted) {
            TUBE.Vue.loadTubes()
            SHARE.tubeMounted = true
          }
          break
      }
    })
  }
})
