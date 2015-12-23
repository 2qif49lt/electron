'use strict';
var ipcMain = require('electron').ipcMain;
var app = require('app');

var BrowserWindow = require('browser-window');
var globalShortcut = require('global-shortcut');


var mainWindow = null;
var tickoject = null;

var fs = require("fs");
var file = process.env.HOME  + "/memory.db";
var exists = fs.existsSync(file);

if(!exists) {
  var fd = fs.openSync(file, "w");
  fs.closeSync(fd);
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
  if(!exists) {
    db.run("CREATE TABLE memory (id INTERGER AUTO_INCREMENT,word TEXT,mean TEXT,addtime DATE)");
  }
});
  
var newwordwin = null;
// app.dock.hide();
app.on('ready', function() {
    var atomScreen = require('screen');
    var size = atomScreen.getPrimaryDisplay().workAreaSize;
    
    mainWindow = new BrowserWindow({
        transparent: true,
        alwaysOnTop:true,
        frame:false,
        resizable:false,
        height: 101,
        width: 375,
        x:size.width,
        y:0
    });
    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.loadURL('file://' + __dirname + '/memory/index.html');
    var webContents = mainWindow.webContents;
    
    webContents.on('did-finish-load',function(){
        tickfunc();
    });
    
    newwordwin = new BrowserWindow({
                transparent: true,
                alwaysOnTop:true,
                resizable:false,
                frame:false,
                show:false,
                height: 200,
                width: 355,
                center:true
                
                });
            
    newwordwin.on('closed', function() {
        newwordwin = null;
    });

    newwordwin.loadURL('file://' + __dirname + '/memory/newword.html');

   globalShortcut.register('ctrl+shift+n',function(){
        tickfunc();
    });
    globalShortcut.register('ctrl+shift+d',function(){
        db.run("delete from  memory where word = ?",arg,function(err){
        });
        mainWindow.hide();
    });
    globalShortcut.register('ctrl+shift+p',function(){
        mainWindow.hide();
    });
    
    globalShortcut.register('ctrl+shift+w',function(){
        newwordwin.show();
    });
    
   globalShortcut.register('ctrl+q',function(){
       app.quit();
    });
    
    
});
app.on('will-quit', function() {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
  clearInterval(tickoject);
});
ipcMain.on('app-quit',function(){
    db.close();
    app.quit();   
});


ipcMain.on('next-word',function(event, arg){
    tickfunc();
});



ipcMain.on('pass',function(){
    mainWindow.hide();   
});

ipcMain.on('del',function(event,arg){ 
     db.run("delete from  memory where word = ?",arg,function(err){
        console.log("delete",arg,err);
    });
    mainWindow.hide();
});


tickoject = setInterval(tickfunc,10*1000);
var timeafterobject = null;

function tickfunc(){
     db.get("SELECT  word,mean,addtime FROM memory where word is not null order by random() limit 1",
     [], function(err, row) {
        if(row)
        {
            if(mainWindow.isVisible() == false)
                mainWindow.showInactive();
            mainWindow.webContents.send('next-word-rep',row);
            if(timeafterobject != null)
            {
                clearTimeout(timeafterobject);
            }
            timeafterobject = setTimeout(function() {
                mainWindow.hide();
            }, 5 * 1000);
        }
            
    });
}



ipcMain.on('new-word',function(){ 
    newwordwin.show();
});

ipcMain.on('new-word-cancel',function(){ 
    newwordwin.hide();   
});

ipcMain.on('new-word-submit',function(event, arg){
    db.run("insert into memory (word,mean,addtime) values(?,?,date())",arg.word,arg.mean,function(err){
    });
    newwordwin.hide();
});

ipcMain.on('mouse-enter',function(){
    if(timeafterobject != null){
        clearTimeout(timeafterobject);
        timeafterobject = null;
    }
});

ipcMain.on('mouse-leave',function(){
    if(timeafterobject != null)
        clearTimeout(timeafterobject);
    timeafterobject = setTimeout(function() {
               mainWindow.hide();
            }, 5 * 1000);
});