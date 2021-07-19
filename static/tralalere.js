/** to go to video mode */
let videoMode=false;
let storyMode=false;
let muteMode=false;
let myTralaStep=1;
let usersHelp=[];

function loadSteps(){
    let permissions = serverConnection.permissions;
    //console.log(permissions)
    if(permissions.op) {
        document.getElementById('mySteps').src = '../resources/steps/index.html?typeUser=admin';
    }else{
        document.getElementById('mySteps').src = '../resources/steps/index.html';
    }

    updateSetting("participants", false);
    updateSetting("muteAll", false);
    updateSetting("showChat", false);
    updateSetting("helpMe", false);

}


getButtonElement('maquetteVideo').onclick = function(e) {
    e.preventDefault();
    storyMode=false;
    if(videoMode===false) {
        videoMode=true;
        document.getElementById('myIframe').src = '../resources/videos/index.html';
        document.getElementById('myIframe').style.zIndex=2000;
        document.getElementById('myIframe').style.display="block";
    }else{
        videoMode=false;
        document.getElementById('myIframe').src = '../resources/empty.html';
        document.getElementById('myIframe').style.zIndex='unset';// pour rafraichir
        document.getElementById('myIframe').style.display="none";

    }
    serverConnection.userMessage("setVideo", null, videoMode, false);
};

getButtonElement('maquetteStoryline').onclick = function(e) {
    e.preventDefault();
    videoMode=false;
    //console.log(storyMode)
    if(storyMode===false) {
        storyMode=true;
        getButtonElement('maquetteStoryline').innerHTML="Hide Storyline";
        document.getElementById('myIframe').src = 'https://boubs.fr/code-decode/';//https://boubs.fr/storyline/';
        document.getElementById('myIframe').style.zIndex=2000;
        document.getElementById('myIframe').style.display="block";
    }else{
        storyMode=false;
        getButtonElement('maquetteStoryline').innerHTML="Show Storyline";
        //console.log("aucun")
        document.getElementById('myIframe').src = '../resources/empty.html';
        document.getElementById('myIframe').style.zIndex='unset';// pour rafraichir
        document.getElementById('myIframe').style.display="none";

    }
    serverConnection.userMessage("setStory", null, storyMode, false);
};



document.getElementById('participant-btn').onclick = function(e) {
    e.preventDefault();
    let participants = getSettings().participants;
    participants = !participants;
    updateSetting("participants", participants);

    //-- button
    let divParticipantsBtn = document.getElementById('participant-btn');
    if(participants===true) {
        divParticipantsBtn.classList.add("muted")
        document.getElementById('left-sidebar').style.display="block";
        document.getElementById('mainrow').style.width="calc(100vw - 200px)";
    }else{
        divParticipantsBtn.classList.remove("muted")
        document.getElementById('left-sidebar').style.display="none";
        document.getElementById('mainrow').style.width="calc(100vw - 0px)";
    }

};

document.getElementById('mute-all-btn').onclick = function(e) {
    e.preventDefault();
    let muteAll = getSettings().muteAll;
    muteAll = !muteAll;
    updateSetting("muteAll", muteAll);

    //-- button
    let divmuteAllBtn = document.getElementById('mute-all-btn');
    let icon = divmuteAllBtn.querySelector("span .fa");

    if(muteAll===true) {
        icon.classList.add('fa-microphone-alt-slash');
        icon.classList.remove('fa-microphone-alt');
        divmuteAllBtn.classList.add("muted");
        serverConnection.userMessage("tralacontrol", null, "muteallON", false);
    }else{
        icon.classList.remove('fa-microphone-alt-slash');
        icon.classList.add('fa-microphone-alt');
        divmuteAllBtn.classList.remove("muted");
        serverConnection.userMessage("tralacontrol", null, "muteallOFF", false);

    }
};

document.getElementById('ask-for-help').onclick = function(e) {
    e.preventDefault();
    let helpMe = getSettings().helpMe;
    helpMe = !helpMe;
    updateSetting("helpMe", helpMe);

    //-- button
    let divmuteHelpBtn = document.getElementById('ask-for-help');

    if(helpMe===true) {
        divmuteHelpBtn.classList.add("muted");
        setVisibility('left', true);
        //positionUser();
        serverConnection.userMessage("tralacontrol", null, "askForHelp", false);// noEcho=true
    }else{
        divmuteHelpBtn.classList.remove("muted");
        //unPositionUser();
        serverConnection.userMessage("tralacontrol", null, "outForHelp", false);// noEcho=true
    }

};
//--------------------
// -- identification control
//--------------------
/*getInputElement('username').onkeydown = function(e) {
    var code;

    if (event.key !== undefined) {
        code = event.key;
    } else if (event.keyIdentifier !== undefined) {
        code = event.keyIdentifier;
    } else if (event.keyCode !== undefined) {
        code = event.keyCode;
    }
    if((code==="Enter")||(code===13)) {

        profileAnalysis();
        document.getElementById("password").focus();
        return true;
    }else{
        return true;
    }

};*/
function profileAnalysis(){
    let username = getInputElement('username').value.trim();
    if(username==="") {
        // anonyme
    }else{
        // op ?
        document.getElementById("tralaformblock").style.display="block";
        getInputElement('presentboth').checked = true;
        document.getElementById('password').value="";

    }
}

function gereControl(id,message){
    switch(message){
        case "muteallON":
            if(serverConnection.permissions.op) {
            }else{
                muteMode=true;
                setLocalMute(true, true);
            }

            break;
        case "muteallOFF":
            if(serverConnection.permissions.op) {
            }else{
                muteMode=false;
            }

            break;

        case "helpOFF":
            /*updateSetting("helpMe", false);
            //-- button
            let divmuteHelpBtn = document.getElementById('ask-for-help');
            divmuteHelpBtn.classList.remove("muted");
            unPositionUser();*/


            break;

        case "askForHelp":

            if(serverConnection.permissions.op) {
                //console.log(serverConnection.id);
                //console.log(id);
                let nbHelp = usersHelp.length;
                let data=[];

                if(id === serverConnection.id) {
                    data[0]={};
                    data[0].x=v_params.positionsHelp[0][0];
                    data[0].y=v_params.positionsHelp[0][1];
                    data[0].id=id;
                    serverConnection.userMessage("setPosHelp", null, data, false);
                }else{
                    if(nbHelp<v_params.positionsHelp.length-2) {
                        usersHelp[usersHelp.length] = id;
                        for(var i=0;i<usersHelp.length;i++){
                            let j=i+1;

                            let indice = data.length;
                            data[indice]={};
                            data[indice].x=v_params.positionsHelp[j][0];
                            data[indice].y=v_params.positionsHelp[j][1];
                            data[indice].id=usersHelp[i];
                        }
                        serverConnection.userMessage("setPosHelp", null, data, false);
                    }else{
                        serverConnection.userMessage("tooManyHelp", id, "unused", true);// noecho=true
                    }
                }







            }else{
                // no op
            }

            break

        case "outForHelp":
            if(serverConnection.permissions.op) {
                //console.log(serverConnection.id);
                //console.log(id);
                hOutForHelp(id);


            }else{
                // no op
            }

            break
    }

}
function hOutForHelp(id){
    let data=[];
    let founded = usersHelp.indexOf(id);
    if(founded>=0) {
        usersHelp.splice(founded, 1);
        data[0]={};
        data[0].x=-3000;
        data[0].y=0;
        data[0].id=id;

    }else{
        // no founded
    }
    //console.log(usersHelp);

    for(var i=0;i<usersHelp.length;i++){
        let j=i+1;

        let indice = data.length;
        data[indice]={};
        data[indice].x=v_params.positionsHelp[j][0];
        data[indice].y=v_params.positionsHelp[j][1];
        data[indice].id=usersHelp[i];
    }
    serverConnection.userMessage("setPosHelp", null, data, false);
}
function refreshSteps(nb){
    myIframe=document.getElementById('mySteps');
    myIframe.contentWindow.postMessage("goStep"+nb, '*');
}

// réception des messages de iframe ---------
window.onmessage = function (e) {

    e.preventDefault();
    //console.log('reçu de iframe :');
    //console.log(e.data);
    switch(e.data){
        case "goStep1":
            // normal
            //console.log("envoi du message 1")
            serverConnection.userMessage("goStep1", null, 'messageUnused', false); //le false = noEcho = false donc echo = true !!!

            break;
        case "goStep2":
            // désafficher la vidéo et mettre iframe
            serverConnection.userMessage("goStep2", null, 'messageUnused', false);
            /*
            let currentVicinity="on";
            setVicinity(currentVicinity);
            serverConnection.userMessage("setVicinity", null, currentVicinity, false);
             */
            break;
        case "goStep3":
            myTralaStep=3;
            myIframe=document.getElementById('mySteps');
            myIframe.contentWindow.postMessage("goStep3", '*');
            /*document.getElementById('myIframe').src = 'https://www.code-decode.net/embed/start?lesson=531226';
            document.getElementById('myIframe').style.zIndex=2000;
            document.getElementById('myIframe').style.display="block";
            document.getElementById('video-container').style.display="none";*/
            break;
        case "goStep4":
            // normal
            //console.log("envoi du message 4")
            serverConnection.userMessage("goStep4", null, 'messageUnused', false); //le false = noEcho = false donc echo = true !!!
            break;
    }
    /*if(e.data=='ifVideoPlay') {
        serverConnection.userMessage("setVideoMode", null, 'play', false);
    }else{
    }
    if(e.data=='ifVideoPause') {
        serverConnection.userMessage("setVideoMode", null, 'pause', false);
    }else{
    }*/
}

