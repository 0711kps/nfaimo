# 消防署資訊室網站
(內部使用, 已經資訊室主管授權公開部分內容)
## 作業系統
* Debian 9
## 軟體版本
* Ruby: 2.4.2
* Rails: 5.1.4
* mariadb(從原mysql5.7 fork出來): 10.1
## 安裝方式
1. 安裝Debian(或任何其他Linux Distribution，若非Debian安裝package部分可能與教學有異)
2. 安裝git  
`su -c "apt-get install git"`
3. 從NFAIMO來源複製原始碼  
`git clone https://github.com/0711kps/nfaimo`
4. 執行第一個安裝腳本  
`bash setup-1.sh`
5. 重新讀取bashrc file(這一步咯過將導致執行錯誤)
`source ~/.bashrc`
6. 執行第二個安裝腳本  
`bash setup-2.sh`
7. 現在輸入你的IP就能訪問網站  
![](/thumbnail/1.png)
![](/thumbnail/2.png)
![](/thumbnail/3.png)
DEMO 網址 https://nfaimo.herokuapp.com

p.s

當一定時間沒有人連線至DEMO網址，根據heroku運作機制
該服務會進入睡眠狀態,此時網站用戶上傳的檔案會被清除
只有資料庫記錄留下來,所以點擊下載會顯示錯誤在DEMO網站上是正常現象(剛上傳的檔案不在此限制)

when heroku dyno idle for a specific time
it will 'sleep‘ and delete all file you upload to the site(from website)
and leave DB record, so you will get a error message when you download a 'rotten' file(lol)
