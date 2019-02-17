const ipc = require('electron').ipcMain;
require('./routes_management.js');

ipc.on('minimize-app', function (event){
	mainWindow.minimize();
})

ipc.on('maximize-app', function (event){
	if (!mainWindow.isMaximized()) {
       mainWindow.maximize();          
   } else {
       mainWindow.unmaximize();
   }
})

ipc.on('close-app', function (event){
	mainWindow.close();
})