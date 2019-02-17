const electron = require('electron')
// global.autoUpdater = require("electron-updater").autoUpdater;
const dialog = require('electron').dialog;
require('./assets/js/main_functions.js');



global.app = electron.app

const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')

global.mainWindow
function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 800, height: 600,minHeight:480, minWidth:360 ,show:false, frame:false})
	// and load the index.html of the app.
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/views/index.html'),
		protocol: 'file:',
		slashes: true
	}))
	// Open the DevTools.
	mainWindow.webContents.openDevTools()
	// Emitted when the window is closed.
	mainWindow.on('closed', function () {
		// Dereference the window object, usually you would store windows
		// in an array if your app supports multi windows, this is the time
		// when you should delete the corresponding element.
		mainWindow = null
	})
	mainWindow.setMenu(null);
  // require('./menu/menu.js');
}

app.on('ready', function(){
	createWindow();
	mainWindow.once('ready-to-show', () => {
      // splash.destroy();
      mainWindow.show();
    });      
})

app.on('window-all-closed', function () {
	// On OS X it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
app.on('activate', function () {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === null) {
		createWindow()
	}
})