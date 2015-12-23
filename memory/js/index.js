var meanel = document.getElementById('mean');
var wordel = document.getElementById('word');
var passel = document.getElementById('pass');
var delel = document.getElementById('del');
var countel = document.getElementById('count');

wordel.addEventListener('mouseover',function(){
    meanel.style.visibility = "visible";
});


var remote = require('remote');
var Tray = remote.require('tray');
var Menu = remote.require('menu');
var path = require('path');
var ipcRenderer = require('electron').ipcRenderer;

var trayIcon = null;
var trayMenu = null;

trayIcon = new Tray(path.join(__dirname, 'img/dev.png'));
trayIcon.setToolTip('Memory is build for remember word');

var trayMenuTemplate = [
    {
        label: 'Memory',
        enabled: false
    },
    {
        label:'new word(ctrl+shitf+w)',
        click:function(){
           ipcRenderer.send('new-word');
        }
    },
    {
        label: 'next(ctrl+shift+n)',
        click: function () {
            ipcRenderer.send('next-word');
        }
    },
    {
        label: 'quit(ctrl+q)',
        click: function () {
            ipcRenderer.send('app-quit');
        }
    }
];
trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
trayIcon.setContextMenu(trayMenu);


 ipcRenderer.on('next-word-rep', function(event, arg) {
  wordel.innerHTML=arg.word;
  meanel.innerHTML=arg.mean;
  countel.innerHTML = arg.addtime;
  meanel.style.visibility = "hidden";
});

passel.addEventListener('click',function(){
   ipcRenderer.send('pass'); 
});
delel.addEventListener('click',function(){
   ipcRenderer.send('del',wordel.innerText); 
});

$('#main').mouseenter(function(){
    ipcRenderer.send('mouse-enter');
});

$('#main').mouseleave(function() {
  ipcRenderer.send('mouse-leave');
});