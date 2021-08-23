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
    updateSetting("raiseHand", false);

}

document.getElementById('raise-hand-btn').onclick = function(e) {
    e.preventDefault();
    let raiseHand = getSettings().raiseHand;
    raiseHand = !raiseHand;
    updateSetting("raiseHand", raiseHand);

    //-- button
    let divRaiseHandBtn = document.getElementById('raise-hand-btn');
    let div=document.getElementById('user-'+serverConnection.id);
    let data={command:"",id:serverConnection.id};
    if(raiseHand===true) {
        divRaiseHandBtn.classList.add("muted")
        div.classList.add("raiseHand")
        data.command="raiseHandON";
        serverConnection.userMessage("tralacontrol", null, data, true);// noEcho = true
    }else{
        divRaiseHandBtn.classList.remove("muted")
        div.classList.remove("raiseHand")
        data.command="raiseHandOFF";
        serverConnection.userMessage("tralacontrol", null, data, true);// noEcho = true
    }

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

    let data={command:"",id:serverConnection.id};
    if(muteAll===true) {
        icon.classList.add('fa-microphone-alt-slash');
        icon.classList.remove('fa-microphone-alt');
        divmuteAllBtn.classList.add("muted");
        data.command="muteallON";
        serverConnection.userMessage("tralacontrol", null, data, false);

    }else{
        icon.classList.remove('fa-microphone-alt-slash');
        icon.classList.add('fa-microphone-alt');
        divmuteAllBtn.classList.remove("muted");
        data.command="muteallOFF";
        serverConnection.userMessage("tralacontrol", null, data, false);

    }
};

document.getElementById('ask-for-help').onclick = function(e) {
    e.preventDefault();
    let helpMe = getSettings().helpMe;
    helpMe = !helpMe;
    updateSetting("helpMe", helpMe);

    //-- button
    let divmuteHelpBtn = document.getElementById('ask-for-help');

    let data={command:"",id:serverConnection.id};
    if(helpMe===true) {
        divmuteHelpBtn.classList.add("muted");
        setVisibility('left', true);
        //positionUser();
        data.command="askForHelp";
        data.timestampHelp=Date.now();
        //serverConnection.userMessage("tralacontrol", null, data, false);// noEcho=true
    }else{
        divmuteHelpBtn.classList.remove("muted");
        //unPositionUser();
        data.command="outOfHelp";
        data.timestampHelp=0;
        //serverConnection.userMessage("tralacontrol", null, data, false);// noEcho=true
    }

    let sendCommand = true;
    if(helpMe===true) {
        let usersHelp=[];
        let nbHelp=0;
        for(let uid in serverConnection.users) {
            let u = serverConnection.users[uid];
            if((u.status.timestampHelp===0)||(u.permissions.op)) {
                // no help
            }else{
                nbHelp+=1;
            }
        }
        if (nbHelp> v_params.positionsHelp.length-2) {
            sendCommand = false;
            displayError("Pour l'instant il y a trop de personnes dans le help center");
            updateSetting("helpMe", false);
            let divmuteHelpBtn = document.getElementById('ask-for-help');
            divmuteHelpBtn.classList.remove("muted");
        }else{
            //OK
        }
    }else{
        // OK
    }

    if(sendCommand===true) {
        let currentStatus = serverConnection.users[serverConnection.id].status;
        currentStatus.command=data.command;
        currentStatus.timestampHelp=data.timestampHelp;
        serverConnection.userAction(
            "setstatus", serverConnection.id, currentStatus,
        );
    }else{
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
    switch(message.command){
        case "raiseHandON":
            let div=document.getElementById('user-'+id);
            div.classList.add("raiseHand")
            break;
        case "raiseHandOFF":
            let divOff=document.getElementById('user-'+id);
            divOff.classList.remove("raiseHand");
            break;

        case "raiseHandOFFfromOp":

            let divOffop=document.getElementById('user-'+message.id);
            divOffop.classList.remove("raiseHand");
            updateSetting("raiseHand", false);
            if(message.id===serverConnection.id) {
                let divRaiseHandBtn = document.getElementById('raise-hand-btn');
                divRaiseHandBtn.classList.remove("muted")
            }else{
            }
            break
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
            console.log("helpOff me");
            updateSetting("helpMe", false);
            //-- button
            let divmuteHelpBtn = document.getElementById('ask-for-help');
            divmuteHelpBtn.classList.remove("muted");

            let data={command:"outOfHelp",timestampHelp:0};
            let currentStatus = serverConnection.users[serverConnection.id].status;
            currentStatus.command=data.command;
            currentStatus.timestampHelp=data.timestampHelp;
            serverConnection.userAction(
                "setstatus", serverConnection.id, currentStatus,
            );



            break;

        case "askForHelp":
            /*
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
*/
            break

        case "outForHelp":
            /*
            if(serverConnection.permissions.op) {
                //console.log(serverConnection.id);
                //console.log(id);
                hOutForHelp(id);


            }else{
                // no op
            }
*/
            break
    }

}
function hOutForHelp(id){ // à factoriser avec ce qui suit

    let data=[];
    data[0]={};
    data[0].x=-3000;
    data[0].y=0;
    data[0].id=id;
    //console.log(usersHelp);

    let usersHelp=[];
    for(let uid in serverConnection.users) {
        let u = serverConnection.users[uid];
        if((u.status.timestampHelp===0)||(u.permissions.op)) {
            // no help
        }else{
            usersHelp[usersHelp.length]={id:uid,timestamp:u.status.timestampHelp}
        }
    }
    // sort by timestamp
    usersHelp.sort((a, b) => parseFloat(a.timestamp) - parseFloat(b.timestamp));

    // positions --------------
    for(var i=0;i<usersHelp.length;i++){
        let j=i+1;

        let indice = data.length;
        data[indice]={};
        data[indice].x=v_params.positionsHelp[j][0];
        data[indice].y=v_params.positionsHelp[j][1];
        data[indice].id=usersHelp[i].id;
    }
    serverConnection.userMessage("setPosHelp", null, data, false);
}


function manageHelp(id){

    if(serverConnection.permissions.op) {
        let data=[];

        //-- the op himself -------------------
        if(id===serverConnection.id) {
            data[0]={};
            data[0].x=v_params.positionsHelp[0][0];
            data[0].y=v_params.positionsHelp[0][1];
            let currentStatus = serverConnection.users[serverConnection.id].status;
            currentStatus.x=data[0].x;
            currentStatus.y=data[0].y;
            currentStatus.command="setPos";
            serverConnection.userAction(
                "setstatus", serverConnection.id, currentStatus ,
            );
        }else{
            //-- outOfHelp -----
            let currentu = serverConnection.users[id];

            if(currentu.status.command==="outOfHelp") {
                data[0]={};
                data[0].x=-3000;
                data[0].y=0;
                data[0].id=id;
            }else{
                // no out
            }
            //-- the others -------------------

            let usersHelp=[];
            for(let uid in serverConnection.users) {
                let u = serverConnection.users[uid];
                if((u.status.timestampHelp===0)||(u.permissions.op)) {
                    // no help
                }else{
                    usersHelp[usersHelp.length]={id:uid,timestamp:u.status.timestampHelp}
                }
            }
            // sort by timestamp
            usersHelp.sort((a, b) => parseFloat(a.timestamp) - parseFloat(b.timestamp));
            //console.log(usersHelp)

            // positions --------------
            for(var i=0;i<usersHelp.length;i++){
                let j=i+1;

                let indice = data.length;
                data[indice]={};
                data[indice].x=v_params.positionsHelp[j][0];
                data[indice].y=v_params.positionsHelp[j][1];
                data[indice].id=usersHelp[i].id;
            }
            console.log(data)
            serverConnection.userMessage("setPosHelp", null, data, false);
        }

    }else{
        // no op
    }
    // retrive help
    /*
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
*/
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

}
/*
window.onbeforeunload = function () {
    return 'Voulez-vous vraiment quitter la page ?';
}*/