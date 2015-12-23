var submit = document.getElementById('submit');
var cancel = document.getElementById('cancel');
var wordinput = document.getElementById('word-input');
var meaninput = document.getElementById('mean-input');

wordinput.focus();
var ipcRenderer = require('electron').ipcRenderer;

submit.addEventListener('click',function(){
    var word = wordinput.value;
    var mean = meaninput.value;
    if(word == "" || mean == "")
    {
        return;
    }
    ipcRenderer.send('new-word-submit',{"word":word,"mean":mean});
    wordinput.value = "";
    meaninput.value = "";
});

cancel.addEventListener('click',function(){
    
    console.log("cancel click");
    wordinput.value = "";
    meaninput.value = "";
    ipcRenderer.send('new-word-cancel');
});

