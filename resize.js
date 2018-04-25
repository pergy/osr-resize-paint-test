const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs-extra')
let tick = true

app.once('ready', () => {
  let win = null
  const paintsDir = path.join(__dirname, 'paints')
  // Disable this if you want to keep old frame images
  fs.emptyDir(paintsDir)
  // Increase the range to check multiple BrowserWindows. Even 1+ generates paint bug
  for (let i = 0; i < 1; ++i) {
    win = new BrowserWindow({
      frame: false,
      show: false,
      transparent: true,
      fullscreen: false,
      fullscreenable: false,
      enableLargerThanScreen: true,
      useContentSize: true,
      thickFrame: false,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        backgroundThrottling: false,
        offscreen: true,
        webSecurity: true,
        partition: `persist:maxwhere`,
        plugins: true
      }
    })
    const currID = win.id
    win.webContents.on('paint', (event, dirty, image) => {
      const now = new Date().toISOString().replace(/[.:]/g, '-')
      fs.writeFile(path.join(
        paintsDir,
        `frame_${now}_BW-${currID}.png`
      ), image.toPNG(), (err) => {
        if (err) console.error(err)
        console.log('frame', currID, now, 'saved')
      })
    })
    win.webContents.on('did-finish-load', () => {
      win.webContents.executeJavaScript(`
        setNumber(${currID})
      `)
    })
    win.loadURL(path.join(__dirname, 'default.html'))
  }
  // Disable this to check initial state. Even the initial state can be flawed for
  // multiple instances on BrowserWindows
  setInterval(() => {
    BrowserWindow.getAllWindows().forEach(w => {
      w.setContentSize(tick ? 1920 : 800, tick ? 1080 : 600)
      console.log('resized', w.id)
    })
    tick = !tick
  }, 3000)
})
