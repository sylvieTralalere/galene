// Copyright (c) 2021 by Sylvie Tissot.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// @TODO describe objetcts
/** @type {object} */
let v_params;
/** @type {object} */
let v_DOMevts; // targetid, type, userid,

/** to go to vicinity mode */
getButtonElement('vicinitybutton').onclick = function(e) {
    e.preventDefault();
    let currentVicinity="on";
    setVicinity(currentVicinity);
    serverConnection.userMessage("setVicinity", null, currentVicinity, false);
};
getButtonElement('standardbutton').onclick = function(e) {
    e.preventDefault();
    let currentVicinity="off";
    setVicinity(currentVicinity);
    serverConnection.userMessage("setVicinity", null, currentVicinity, false);
};

/**
 * @param {string} state
 */
function setVicinity(state){
    let currentVicinity = getSettings().vicinity;

    if(state===currentVicinity) {
        // already in state
    }else{
        if(state==="on") {
            setVisibility("video-container", false);
            setVisibility("vicinity-container", true);
            //setVisibility('bullhornbutton', true);

            // media
            mediaVicinity();
            computeEye();
            computeVolume();
        }else{
            setVisibility("video-container", true);
            let video_container = document.getElementById('video-container');
            video_container.classList.remove('no-video');
            setVisibility("vicinity-container", false);
            //setVisibility('bullhornbutton', false);
            // @TODO reset volume to slider value

            // media
            var oldParent = document.getElementById('list-media-v');
            var newParent = document.getElementById('peers');
            while (oldParent.childNodes.length > 0) {
                let theMedia = oldParent.childNodes[0];
                // @TODO removeEvent
                theMedia.classList.remove('v-peer');
                theMedia.classList.remove('v-peer-expand');

                let userid = theMedia.dataset.userid;
                let mediaIndex = parseInt(theMedia.dataset.index);
                users[userid].media[mediaIndex].expanded=0;
                computePositionMedia(userid,mediaIndex);

                theMedia.style.left='unset';
                theMedia.style.top='unset';
                theMedia.style.width='unset';
                theMedia.style.height='unset';
                theMedia.style.display='block';

                let media = document.getElementById(users[userid].media[mediaIndex].id);
                media.volume=1;
                media.style.width='100%';
                media.style.height='unset';

                newParent.appendChild(oldParent.childNodes[0]);
            }

            //-- user expanded ? @Todo create a function
            for(var key in users) {
                if (users[key].expanded==1) {
                    users[key].expanded=0;
                    let div=document.getElementById('user-v-'+key);
                    div.classList.remove("userv-expanded");
                    let btn = document.getElementById('btn-zone-v-' + key);
                    let btnmsg = document.getElementById('btn-msg-v-' + key);
                    btn.style.display="none";
                    btnmsg.style.display="none";
                }else{
                }
               // close button
                for(var i=0;i<users[key].media.length;i++){
                    let peerid = "peer-"+users[key].media[i].id.substr(6,2);
                    let closepeer = document.getElementById("close-"+peerid);
                    closepeer.style.display="none";
                    let resizepeer = document.getElementById("resize-"+peerid);
                    resizepeer.style.display="none";
                }
            }


        }
        updateSetting("vicinity", state);

        resizePeers();
    }


}
/** replace media */
function mediaVicinity(){
    let newParent = document.getElementById('list-media-v');
    let oldParent = document.getElementById('peers');
    while (oldParent.childNodes.length > 0) {
        let theMedia = oldParent.childNodes[0];
        let indexid = theMedia.id.substr(5,2);
        // Keep dataset only for userid and index
        let userData = getUserFromMedia("media-"+indexid);
        theMedia.dataset.userid = userData.userid;
        theMedia.dataset.index = userData.index;


        //-- drag and drop ----------------------
        theMedia.addEventListener("touchstart", dragStart, false);
        theMedia.addEventListener("mousedown", dragStart, false);

        //-- close ----------------------
        div = document.createElement('div');
        div.id = 'close-' + theMedia.id;
        div.classList.add('v-close');
        div.classList.add('fas');
        div.classList.add('fa-window-close');
        div.style.display="none";
        div.onclick = function(e) {
            e.preventDefault();
            v_DOMevts.rightClick=false;
            let indexid = e.target.id.substr(11,3);// 3 is a max
            let div = document.getElementById('peer-'+indexid);
            div.classList.remove('v-peer-expand');
            div.classList.add('v-peer');
            div.style.width="50px";
            div.style.height="60px";
            div.style.zindex="unset";

            users[div.dataset.userid].media[parseInt(div.dataset.index)].expanded=0;
            users[div.dataset.userid].media[parseInt(div.dataset.index)].width=240;
            users[div.dataset.userid].media[parseInt(div.dataset.index)].height=180;

            e.target.style.display="none";

            if(users[div.dataset.userid].expanded==0) {
                div.style.display="none";
            }else{
                //-- compute position
                computePositionMedia(div.dataset.userid,parseInt(div.dataset.index));
            }

            div = document.getElementById('resize-peer-'+indexid);
            div.style.display="none";

            div = document.getElementById('media-'+indexid);
            div.style.width="40px";
            div.style.height="40px";
        };
        //-- DOM --------------
        theMedia.appendChild(div); // close

        //-- resize ----------------------
        div = document.createElement('div');
        div.id = 'resize-' + theMedia.id;
        div.classList.add('v-resize');
        div.style.display="none";
        div.addEventListener("touchstart", dragStart, false);
        div.addEventListener("mousedown", dragStart, false);
        //-- DOM --------------
        theMedia.appendChild(div); //

        //-- style and position --------------
        theMedia.classList.add('v-peer');
        if(userData.userid==="") {
            //impossible ?
            theMedia.style.left=v_params.out_x+"px";
        }else{
            let xdef=users[userData.userid].media[userData.index].x;
            let ydef=users[userData.userid].media[userData.index].y;
            if(userData.userid===serverConnection.id) {
            }else{
                if (xdef<v_params.hall_x) {
                    xdef=v_params.out_x;
                }else{
                }
            }

            users[userData.userid].media[userData.index].currentx=xdef;
            users[userData.userid].media[userData.index].currenty=ydef;
            theMedia.style.left=xdef+"px";
            theMedia.style.top=ydef+"px";

            theMedia.style.display="none";
        }
        users[userData.userid].media[userData.index].width=240;
        users[userData.userid].media[userData.index].height=180;


        newParent.appendChild(oldParent.childNodes[0]);
    }
}
/**
 * @param {string} id
 */
function getUserFromMedia(id){
    let foundedObject={userid:"",index:-1}
    //-- users
    for(var key in users) {
        let founded = -1;
        for(var i=0;i<users[key].media.length; i++){
            if(users[key].media[i].id===id) {
                founded = i;
            }else{
            }
        }
        if (founded>-1) {
            foundedObject.userid=key;
            foundedObject.index=founded;
        }else{
        }
    }
    return foundedObject;
}

/**
 * @param {string} id
 */
function getUserFromStream(id){
    let foundedObject={userid:"",index:-1}
    //-- users
    for(var key in users) {
        let founded = -1;
        for(var i=0;i<users[key].media.length; i++){
            if(users[key].media[i].cid===id) {
                founded = i;
            }else{
            }
        }
        if (founded>-1) {
            foundedObject.userid=key;
            foundedObject.index=founded;
        }else{
        }
    }
    return foundedObject;
}
/**
 * @param {string} id
 * @param {string} name
 */
function addUserVicinity(id, name){
    let div = document.getElementById('list-users-v');
    let user = document.createElement('div');
    user.id = 'user-v-' + id;
    user.classList.add("user-v");
    let currentName= name ? name : '(anon)';
    user.innerHTML = '<div class="circle" id="circle-v-'+id+'"><div class="fas" aria-hidden="true"></div></div><div class="texte">'+currentName+'</div><div class="notification"></div>'

    div.appendChild(user);
    let us = div.children;
    user.dataset.active="false";

    if(id===serverConnection.id) {
        // prepare drag and drop ------------
        user.style.zIndex=2;
        user.addEventListener("mouseover", dragOver, false);
        user.addEventListener("mouseout", dragOut, false);

    }else{
    }

    user.addEventListener("touchstart", dragStart, false);
    user.addEventListener("mousedown", dragStart, false);

    user.addEventListener("contextmenu", rightClick, false);

    //-- zones ---
    div = document.getElementById('list-zones-v');
    let zone = document.createElement('div');
    zone.id = 'zone-v-' + id;
    zone.classList.add("zone-v");
    for(var i=1; i<=5 ;i++){
        let subzone = document.createElement('div');
        subzone.classList.add("sub-zone");
        subzone.classList.add("subzone"+i);
        zone.appendChild(subzone);
    }
     zone.style.display="none";
    div.appendChild(zone);

    //-- btns ---
    div = document.getElementById('list-buttons-v');

    //-- zone ---
    let btn = document.createElement('div');
    btn.id = 'btn-zone-v-' + id;
    btn.classList.add("btn-zone-v");
    div.appendChild(btn);
    btn.onclick = function(e) {
        e.preventDefault();

        v_DOMevts.rightClick=false;


        let indexid = e.target.id.substr(11,e.target.id.length);
        userExpand(indexid,0);

        let confirmClose=confirm("voulez-vous vraiment retirer ce participant du help center ?");
        if(confirmClose) {

            hOutForHelp(id);
            //serverConnection.userMessage("tralacontrol", indexid, "helpOFF", true);// noecho = true
        }else{
        }
       /*
        let div = document.getElementById('zone-v-'+indexid);
        if(div.style.display==="none") {
            div.style.display="block";
            e.target.style.borderWidth="2px";
            e.target.style.borderColor="#28a745";
        }else{
            div.style.display="none";
            e.target.style.borderWidth="1px";
            e.target.style.borderColor="#000";
        }
*/
    };
    //-- msg ---
    btn = document.createElement('div');
    btn.id = 'btn-msg-v-' + id;
    btn.classList.add("btn-msg-v");

    let insidebtn = document.createElement('div');
    insidebtn.classList.add('fas');
    insidebtn.classList.add('fa-comment');
    insidebtn.classList.add('no-pointer-evt');
    btn.appendChild(insidebtn);
    div.appendChild(btn);
    btn.onclick = function(e) {
        e.preventDefault();
        v_DOMevts.rightClick=false;
        let indexid = e.target.id.substr(10,e.target.id.length);
        userExpand(indexid,0);
        v_DOMevts.destMsg=indexid;

        div = document.getElementById('v-dest');
        if(v_DOMevts.destMsg===serverConnection.id) {
            div.innerHTML = "From me to everybody (public)";
        }else{
            div.innerHTML = "From me to "+users[v_DOMevts.destMsg].name+" (private)";
        }
        div = document.getElementById('grey-backgrd');
        div.style.display="block";

    };


}

/**
 * @param {string} id
 */
function delUserVicinity(id) {
    // @TODO remove eventlisteners
    let div = document.getElementById('list-users-v');
    let user = document.getElementById('user-v-' + id);
    div.removeChild(user);

    div = document.getElementById('list-zones-v');
    user = document.getElementById('zone-v-' + id);
    div.removeChild(user);

    div = document.getElementById('list-buttons-v');
    user = document.getElementById('btn-zone-v-' + id);
    div.removeChild(user);
    user = document.getElementById('btn-msg-v-' + id);
    div.removeChild(user);
}

/**
 * @param {Object} e
 */
function rightClick(e) {

    e.preventDefault();
    v_DOMevts.rightClick=true;

    let target=e.target;
    let thisid=e.target.id.substr(7,e.target.id.length);
    let btn = document.getElementById('btn-zone-v-' + thisid);
    let btnmsg = document.getElementById('btn-msg-v-' + thisid);

    if(users[thisid].expanded===0) {

        // verify the distance
        let allowRightClick = true;
        if(thisid===serverConnection.id){
            //OK
        }else{
            let distance=distancePoints(users[serverConnection.id].x, users[serverConnection.id].y, users[thisid].x, users[thisid].y);
            if (distance < v_params.distance_m) {
                //OK
            }else{
                if( users[thisid].bullhorn===true) {
                    //OK
                }else{
                    allowRightClick=false;
                }
            }
        }

        if(allowRightClick===true) {
            users[thisid].expanded=1;


            target.classList.add("userv-expanded");

            //-- sound zone -----------------
            let zone = document.getElementById('zone-v-' + thisid);
            zone.style.left=(users[thisid].x-((v_params.zone_w-50)/2))+"px";
            zone.style.top=(users[thisid].y-((v_params.zone_w-50)/2))+"px";

            // @ TODO optimize in the future. Keep like that for the prototype
            let btnx = (users[thisid].x + 25) + (v_params.radius * Math.cos(v_params.offsetangle + v_params.angle));
            let btny = (users[thisid].y + 12) + (v_params.radius * Math.sin(v_params.offsetangle + v_params.angle));
            btn.style.left=btnx - (40/2)+"px";
            btn.style.top=btny - (40/2)+"px"; //!!!!!!!!!! Attention : la bulle scalée est plus haute que large d'où le 25 et 12
            if(serverConnection.permissions.op) {
                btn.style.display="block"; // only op can eject from helpcenter
            }else{
                btn.style.display="none";
            }


            btnx = (users[thisid].x + 25) + (v_params.radius * Math.cos(v_params.offsetangle + v_params.angle*2));
            btny = (users[thisid].y + 12) + (v_params.radius * Math.sin(v_params.offsetangle + v_params.angle*2));
            btnmsg.style.left=btnx - (40/2)+"px";
            btnmsg.style.top=btny - (40/2)+"px";
            btnmsg.style.display="block";


            //-- media ----------------------
            for(var i=0;i<users[thisid].media.length;i++){
                if(users[thisid].media[i].expanded===0) {
                    computePositionMedia(thisid,i);
                    let peerid = "peer-"+users[thisid].media[i].id.substr(6,2);
                    let div = document.getElementById(peerid);

                    if(users[thisid].media[i].types==="camera") {
                        if(users[thisid].media[i].owner==="op") {
                            div.style.display="block";
                        }else{
                            div.style.display="none";
                        }
                    }else{
                        div.style.display="block";
                    }

                }else{
                    // expanded
                }
            }

            var alluserv = document.getElementsByClassName("user-v");
            for (var i=0; i < alluserv.length; i++) {
                console.log(alluserv[i].id);
                alluserv[i].style.zIndex=1;
            }
            target.style.zIndex=2;
        }else{
            // alert @TODO mettre displayError
            let div = document.getElementById("grey-cartoon");
            div.style.display="block";
        }


    }else{

    }
    return false;
}
/**
 * @param {string} thisid
 * @param {number} i
 */
function computePositionMedia(thisid,i){
    let mx = (users[thisid].x + 25) + (v_params.radius * Math.cos(v_params.offsetangle + (v_params.angle*(i+3))));
    let my = (users[thisid].y + 12) + (v_params.radius * Math.sin(v_params.offsetangle + (v_params.angle*(i+3))));
    users[thisid].media[i].x=mx - 25;
    users[thisid].media[i].y=my - 25;

    let peerid = "peer-"+users[thisid].media[i].id.substr(6,2);
    let div = document.getElementById(peerid);
    div.style.left=(mx - 25)+"px";
    div.style.top=(my - 25)+"px";
    users[thisid].media[i].currentx=(mx - 25);
    users[thisid].media[i].currenty=(my - 25);
}
/**
 * @param {Object} e
 */
function dragOver(e) {
    e.preventDefault();
    let target=e.target;
    let circle = target.children[0];
    circle.style.borderColor="#000";
}
/**
 * @param {Object} e
 */
function dragOut(e) {
    e.preventDefault();
    let target=e.target;
    let circle = target.children[0];
    circle.style.borderColor="#DDD";
}
/**
 * @param {Object} e
 */
function dragStart(e) {
    v_DOMevts.rightClick=false;

    let div = document.getElementById("right");
    var xOffset = div.offsetLeft;
    var yOffset = div.offsetTop;

    let target=e.target;
    let allowedToMove=false;
    let expanded=0;
    let currentx, currenty;


    switch(target.classList[0]){
        case "user-v":
        case "peer":
            v_DOMevts.type=target.classList[0];
            v_DOMevts.target = target;

             //-- controle : is it expanded ?
            if(target.classList[0]==="user-v") {
                if(serverConnection.id===target.id.substr(7,target.id.length)) {
                    // me :
                    expanded = users[serverConnection.id].expanded;
                    if(expanded===0){
                        allowedToMove=true;
                        currentx = users[serverConnection.id].currentx;
                        currenty = users[serverConnection.id].currenty;
                    }else{
                        // not allowed to drag
                    }
                }else{
                    // others : not allowed to drag
                    target.zIndex="unset";
                }

            }else{
                expanded = users[target.dataset.userid].media[parseInt(target.dataset.index)].expanded;
                if(expanded===0){
                    // not allowed to drag (the inverse)
                }else{
                    allowedToMove=true;
                    currentx = users[target.dataset.userid].media[parseInt(target.dataset.index)].currentx;
                    currenty = users[target.dataset.userid].media[parseInt(target.dataset.index)].currenty;
                }
            }
            //-- conclusion ---------
            if(allowedToMove===true) {
                target.style.cursor="grabbing";
                // @TODO clean the comments. Keep for the moment
                if (e.type === "touchstart") {
                    //target.dataset.initialx = e.touches[0].clientX - xOffset;
                    //target.dataset.initialy = e.touches[0].clientY - yOffset;
                    v_DOMevts.initialx = e.touches[0].clientX - xOffset;
                    v_DOMevts.initialy = e.touches[0].clientX - xOffset;
                } else {
                    //target.dataset.initialx = e.clientX - xOffset - parseInt(target.dataset.currentx);
                    //target.dataset.initialy = e.clientY - yOffset - parseInt(target.dataset.currenty);
                    v_DOMevts.initialx = e.clientX - xOffset - parseInt(currentx);
                    v_DOMevts.initialy = e.clientY - yOffset - parseInt(currenty);
                }
                v_DOMevts.currentx = parseInt(currentx);//!!!!!!!!!!!!
                v_DOMevts.currenty = parseInt(currenty);//!!!!!!!!!!!!

                v_DOMevts.active = "true";
                //target.dataset.active = "true";
                //-- prepare end
                if(target.classList[0]==="user-v") {
                    let userid = serverConnection.id;//target.id.substr(7,target.id.length);
                    users[userid].localx=parseInt(currentx);
                    users[userid].localy=parseInt(currenty);
                }else{
                }
            }else{
                // not allowed to drag
            }

            break;
        case "v-resize":
            v_DOMevts.type=target.classList[0];
            v_DOMevts.target = target;
            let peerid = "peer-"+target.id.substr(12,3);
            if (e.type === "touchstart") {
                //target.dataset.initialx = e.touches[0].clientX - xOffset;
                //target.dataset.initialy = e.touches[0].clientY - yOffset;
                v_DOMevts.initialx = e.touches[0].clientX - xOffset;
                v_DOMevts.initialy = e.touches[0].clientX - xOffset;
            } else {
                //target.dataset.initialx = e.clientX - xOffset - parseInt(target.dataset.currentx);
                //target.dataset.initialy = e.clientY - yOffset - parseInt(target.dataset.currenty);
                v_DOMevts.initialx = e.clientX - xOffset ;
                v_DOMevts.initialy = e.clientY - yOffset ;
            }
            v_DOMevts.currentx =  v_DOMevts.initialx;
            v_DOMevts.currenty =  v_DOMevts.initialy;
            v_DOMevts.peer_media_id = target.id.substr(12,3);
            v_DOMevts.active = "true";
        default:
            break;
    }
    document.getElementById("vicinity-container").addEventListener(
        'mousemove', drag, false,
    );
    document.getElementById("vicinity-container").addEventListener(
        'touchmove', drag, false,
    );
    document.getElementById("vicinity-container").addEventListener(
        'mouseup', dragEnd, false,
    );
    document.getElementById("vicinity-container").addEventListener(
        'touchend', dragEnd, false,
    );

}
/**
 * @param {Object} e
 */
function drag(e) {
    let div = document.getElementById("right");
    var xOffset = div.offsetLeft;
    var yOffset = div.offsetTop;
    let target=v_DOMevts.target;

    e.preventDefault();
    if (v_DOMevts.active==="true") {

        //-- ne pas pouvoir bouger les participants
        if ((v_DOMevts.type==="user-v")&&!(serverConnection.permissions.op)){
            // participant
        }else{
            // animateur ou autre que user-v
            if (e.type === "touchmove") {
                v_DOMevts.currentx = e.touches[0].clientX - xOffset - parseInt(v_DOMevts.initialx);
                v_DOMevts.currenty = e.touches[0].clientY - yOffset - parseInt(v_DOMevts.initialy);
            } else {
                v_DOMevts.currentx = e.clientX - xOffset - parseInt(v_DOMevts.initialx);
                v_DOMevts.currenty = e.clientY - yOffset - parseInt(v_DOMevts.initialy);
            }

            switch(v_DOMevts.type) {
                case "user-v":
                case "peer":
                    if(v_DOMevts.currentx<0) {
                        v_DOMevts.currentx=0;
                    }else{
                    }

                    setTranslate(v_DOMevts.currentx, v_DOMevts.currenty, target);

                    let data = {x:parseInt(v_DOMevts.currentx), y:parseInt(v_DOMevts.currenty)};
                    if(v_DOMevts.type==="user-v") {

                        users[serverConnection.id].x=data.x;
                        users[serverConnection.id].y=data.y;
                        computeVolume();
                        computeEye();
                        serverConnection.userMessage("setPos", null, data, true);

                        //-- sound zone -----------------
                        let zone = document.getElementById('zone-v-' + serverConnection.id);
                        zone.style.left=(users[serverConnection.id].x-((v_params.zone_w-50)/2))+"px";
                        zone.style.top=(users[serverConnection.id].y-((v_params.zone_w-50)/2))+"px";



                    }else{
                        users[target.dataset.userid].media[parseInt(target.dataset.index)].x=data.x;
                        users[target.dataset.userid].media[parseInt(target.dataset.index)].y=data.y;
                        // @TODO delete this case in usermedia message
                        // data.cid=users[serverConnection.id].media[target.dataset.index].cid;
                        // serverConnection.userMessage("setPosMedia", null, data, true);
                    }
                    break;

                case "v-resize":

                    let peerdiv = document.getElementById("peer-"+v_DOMevts.peer_media_id);
                    let width = users[peerdiv.dataset.userid].media[parseInt(peerdiv.dataset.index)].width;
                    let heigth = users[peerdiv.dataset.userid].media[parseInt(peerdiv.dataset.index)].height;


                    let newWidth = width + v_DOMevts.currentx;
                    let newHeight = heigth + v_DOMevts.currenty;
                    peerdiv.style.width=newWidth+"px";
                    peerdiv.style.height=newHeight+"px";

                    let mediadiv = document.getElementById("media-"+v_DOMevts.peer_media_id);
                    mediadiv.style.width=newWidth+"px";
                    mediadiv.style.height=newHeight+"px";

                    break;
            }
        }



    }else{
    }
}
/**
 * @param {Object} e
 */
function dragEnd(e) {
    let target=v_DOMevts.target;

    if (v_DOMevts.active==="true") {


        switch(v_DOMevts.type) {
            case "user-v":
            case "peer":
                target.style.cursor="grab";
                v_DOMevts.active = "false";

                //-- position by default -----------
                let newPos = {x:v_DOMevts.currentx, y:v_DOMevts.currenty}
                let data = {x:parseInt(newPos.x), y:parseInt(newPos.y)}
                //-- user case :
                if(v_DOMevts.type==="user-v") {


                    newPos=computePosition(v_DOMevts.currentx, v_DOMevts.currenty);
                    data = {x:parseInt(newPos.x-v_params.offset_dragendx), y:parseInt(newPos.y-v_params.offset_dragendy)}
                    //-- sound zone -----------------
                    let zone = document.getElementById('zone-v-' + serverConnection.id);

                    if (data.x<v_params.hall_x) {
                        //-- if in SAS -------------
                        data.x=v_params.ori_x;
                        data.y=v_params.ori_y;
                        zone.style.display='none';

                        let btn = document.getElementById('btn-zone-v-' + serverConnection.id);
                        btn.style.borderWidth="1px";
                        btn.style.borderColor="#000";
                    }else{
                    }
                    zone.style.left=(data.x-((v_params.zone_w-50)/2))+"px";
                    zone.style.top=(data.y-((v_params.zone_w-50)/2))+"px";

                }else{
                }

                // memorisation position
                // @TODO : solve pb on tablet
                v_DOMevts.currentx = data.x;
                v_DOMevts.currenty = data.y;

                // @TODO verify if x=currentx and y=currenty and eliminate currentx and currenty
                if(v_DOMevts.type==="user-v") {

                    if(serverConnection.permissions.op) {

                        target.style.left=v_DOMevts.currentx+"px";
                        target.style.top=v_DOMevts.currenty+"px";
                        users[serverConnection.id].x=data.x;
                        users[serverConnection.id].y=data.y;
                        users[serverConnection.id].currentx=data.x;
                        users[serverConnection.id].currenty=data.y;
                        //console.log(data.x+","+data.y);
                        computeVolume();
                        computeEye();
                        serverConnection.userMessage("setPos", null, data, true);

                    }else{
                        // participants
                    }




                }else{

                    target.style.left=v_DOMevts.currentx+"px";
                    target.style.top=v_DOMevts.currenty+"px";
                    users[target.dataset.userid].media[parseInt(target.dataset.index)].x=data.x;
                    users[target.dataset.userid].media[parseInt(target.dataset.index)].y=data.y;
                    users[target.dataset.userid].media[parseInt(target.dataset.index)].currentx=data.x;
                    users[target.dataset.userid].media[parseInt(target.dataset.index)].currenty=data.y;
                    // @TODO delete this case in usermedia message
                    //data.cid=users[serverConnection.id].media[target.dataset.index].cid;
                    //serverConnection.userMessage("setPosMedia", null, data, true);
                }
                break;

            case "v-resize":

                let peerdiv = document.getElementById("peer-"+v_DOMevts.peer_media_id);
                users[peerdiv.dataset.userid].media[parseInt(peerdiv.dataset.index)].width=parseInt(peerdiv.style.width);
                users[peerdiv.dataset.userid].media[parseInt(peerdiv.dataset.index)].height=parseInt(peerdiv.style.height);

                break;
            default:
                break;
        }



    }else{
        // not drag
        if(v_DOMevts.rightClick==true) {
            // nothing
        }else{
            switch(v_DOMevts.type) {
                case "user-v":
                    // click on user that is already expanded
                    //let thisid=e.target.id.substr(7,e.target.id.length);//!!!!!!!!!!!!!!!
                    let thisid=target.id.substr(7,target.id.length);

                    if (users[thisid].expanded==1) {
                        // @TODO : put u=in a function :
                        users[thisid].expanded=0;
                        let btn = document.getElementById('btn-zone-v-' + thisid);
                        let btnmsg = document.getElementById('btn-msg-v-' + thisid);
                        target.classList.remove("userv-expanded");
                        btn.style.display="none";
                        btnmsg.style.display="none";

                        for(var i=0;i<users[thisid].media.length;i++){
                            if(users[thisid].media[i].expanded===0) {
                                let peerid = "peer-"+users[thisid].media[i].id.substr(6,2);
                                let div = document.getElementById(peerid);
                                div.style.display="none";
                            }else{
                                // expanded
                            }

                        }
                    }else{
                        // already 0
                    }
                    break;
                case "peer":
                    target.classList.remove('v-peer');
                    // screenshare :
                    target.classList.add('v-peer-expand');
                    //console.log(target.dataset.userid+" / "+target.dataset.index)
                    users[target.dataset.userid].media[parseInt(target.dataset.index)].expanded=1;
                    //console.log(users[target.dataset.userid].media)

                    let div = document.getElementById("close-"+target.id);
                    div.style.display="block";
                    div = document.getElementById("resize-"+target.id);
                    div.style.display="block";

                    // resize
                    let peerdiv = document.getElementById("peer-"+target.id.substr(5,3));
                    let newWidth = 240;
                    let newHeight = 180;
                    peerdiv.style.width=newWidth+"px";
                    peerdiv.style.height=newHeight+"px";
                    peerdiv.style.top="5px";
                    peerdiv.style.left="5px";
                    peerdiv.style.zIndex=2;

                    let mediadiv = document.getElementById("media-"+target.id.substr(5,3));
                    mediadiv.style.width=newWidth+"px";
                    mediadiv.style.height=newHeight+"px";

                    // user off --------
                    let userid=target.dataset.userid;
                    users[userid].expanded=0;
                    let btn = document.getElementById('btn-zone-v-' + userid);
                    let btnmsg = document.getElementById('btn-msg-v-' + userid);
                    let userv = document.getElementById('user-v-' + userid);
                    userv.classList.remove("userv-expanded");
                    btn.style.display="none";
                    btnmsg.style.display="none";

                    for(var i=0;i<users[userid].media.length;i++){
                        if(users[userid].media[i].expanded===0) {
                            let peerid = "peer-"+users[userid].media[i].id.substr(6,2);
                            let divpeer = document.getElementById(peerid);
                            divpeer.style.display="none";
                        }else{
                            // expanded
                        }

                    }

                    break;
            }
        }


    }

    document.getElementById("vicinity-container").removeEventListener(
        'mousemove', drag, false,
    );
    document.getElementById("vicinity-container").removeEventListener(
        'touchmove', drag, false,
    );
    document.getElementById("vicinity-container").removeEventListener(
        'mouseup', dragEnd, false,
    );
    document.getElementById("vicinity-container").removeEventListener(
        'touchend', dragEnd, false,
    );
}
/**
 * @param {number} userid
 */
function positionUser(){//!!!!!!! obsolete ?
    let newx = -3000;
    let newy = 0;

    // contrôle
    let repositionne=false;
    if(serverConnection.permissions.op) {
        if(users[serverConnection.id].x>0) {
        }else{
             newx = v_params.positionsHelp[0][0];
             newy = v_params.positionsHelp[0][1];

            repositionne=true;
        }
    }else{
        //-- recherche première position
        //console.log("pas op ");

        let indexi=-1;
        for(var i=1;i<v_params.positionsHelp.length;i++){// 0 réservé à animateur
            let curx=v_params.positionsHelp[i][0];
            let cury=v_params.positionsHelp[i][1];
            let foundi=false;

            for(var key in users) {
                if((users[key].x===curx)&&(users[key].y===cury)){
                    foundi=true;
                }else{
                }
            }

            if(foundi===false) {
                indexi=i;
                i=v_params.positionsHelp.length;// to stop
            }else{
            }
        }
        if(indexi===-1) {
            // too meny people
            displayMessage("too many people");
            let divmuteHelpBtn = document.getElementById('ask-for-help');
            divmuteHelpBtn.classList.remove("muted");
        }else{
            newx = v_params.positionsHelp[indexi][0];
            newy = v_params.positionsHelp[indexi][1];
            repositionne=true;
        }

    }

    if(repositionne===true) {
        newPos=computePosition(newx, newy);//(v_DOMevts.currentx, v_DOMevts.currenty);
        data = {x:parseInt(newPos.x-v_params.offset_dragendx), y:parseInt(newPos.y-v_params.offset_dragendy)}
        //-- sound zone -----------------
        let zone = document.getElementById('zone-v-' + serverConnection.id);

        if (data.x<v_params.hall_x) {
            //-- if in SAS -------------
            data.x=v_params.ori_x;
            data.y=v_params.ori_y;
            zone.style.display='none';

            let btn = document.getElementById('btn-zone-v-' + serverConnection.id);
            btn.style.borderWidth="1px";
            btn.style.borderColor="#000";
        }else{
        }
        propagatePosition(serverConnection.id,data);
    }else{
        // dejà positionné
    }

}
function unPositionUser(){//!!!!!!! obsolete ?
    //-- if in SAS -------------
    let zone = document.getElementById('zone-v-' + serverConnection.id);
    let data={x:v_params.ori_x,y:v_params.ori_y};
    zone.style.display='none';

    let btn = document.getElementById('btn-zone-v-' + serverConnection.id);
    btn.style.borderWidth="1px";
    btn.style.borderColor="#000";

    propagatePosition(serverConnection.id,data);

}
function propagatePosition(id,data){ //!!!!!!! obsolete ?
    let zone = document.getElementById('zone-v-' + serverConnection.id);
    zone.style.left=(data.x-((v_params.zone_w-50)/2))+"px";
    zone.style.top=(data.y-((v_params.zone_w-50)/2))+"px";

    users[id].x=data.x;
    users[id].y=data.y;
    users[id].currentx=data.x;
    users[id].currenty=data.y;


    let userv = document.getElementById('user-v-' + id);
    userv.style.left=data.x+"px";
    userv.style.top=data.y+"px";

    computeVolume();
    computeEye();
    serverConnection.userMessage("setPos", null, data, true);
}


/**
 * @param {number} userid
 * @param {number} state
 */
function userExpand(userid,state){
    users[userid].expanded=state;
    let btn = document.getElementById('btn-zone-v-' + userid);
    let btnmsg = document.getElementById('btn-msg-v-' + userid);
    let userv = document.getElementById('user-v-' + userid);

    if (state===0) {
        userv.classList.remove("userv-expanded");
        btn.style.display="none";
        btnmsg.style.display="none";

        for(var i=0;i<users[userid].media.length;i++){
            if(users[userid].media[i].expanded===0) {
                let peerid = "peer-"+users[userid].media[i].id.substr(6,2);
                let divpeer = document.getElementById(peerid);
                divpeer.style.display="none";
            }else{
                // expanded
            }
        }
    }else{
        // @TODO case 1
    }


}
/**
 * @param {number} xPos
 * @param {number} yPos
 * @returns {Object}
 */
function computePosition(xPos, yPos){
    let r, s;
    let xm, ym;
    let nearestH;
    xm=xPos;
    ym=yPos;
    r = 30;
    s = Math.sqrt(3 * Math.pow(r, 2) / 4);
    nearestH={x:0,y:0,dist:10000};

    // create hexagons
    let counter = 0;
    let currentDist;
    for (let y = 0; y < 1080 + s; y += 2*s) {
        for (let x = 0; x < 1920 + r; x += 3*r) {
            currentDist = distancePoints(xm, ym, x,y);
            if(currentDist < nearestH.dist) {
                nearestH.x=x;
                nearestH.y=y;
                nearestH.dist=currentDist;
            }else{
            }
            currentDist = distancePoints(xm, ym, x + 1.5 * r,y + s);
            if(currentDist < nearestH.dist) {
                nearestH.x=x + 1.5 * r;
                nearestH.y=y + s;
                nearestH.dist=currentDist;
            }else{
            }
        }
    }
    return (nearestH);
}
/**
 * @param {number} xm
 * @param {number} ym
 * @param {number} x
 * @param {number} y
 */
function distancePoints(xm, ym, x,y) {
    let distsquare = (xm - x)*(xm - x) + (ym - y)*(ym - y);
    return Math.sqrt(distsquare);
}


function computeVolume(){
    let currentVicinity = getSettings().vicinity;

    for(var key in users) {
        if(key===serverConnection.id) {
            // nothing

        }else{
            let volume= 1;
            if(( users[key].bullhorn===true)||(myTralaStep==1)||(myTralaStep==4) ){//!!!!!! rendre universel
                // all is high
                //console.log("cas 1")
            }else{
                if(users[serverConnection.id].x<v_params.hall_x) {
                    volume= 0;

                    //console.log("cas 2")
                }else{

                    //console.log("cas 3")
                    let distance=distancePoints(users[serverConnection.id].x, users[serverConnection.id].y, users[key].x, users[key].y);
                    distance = Math.max(0,distance-90);

                    //@TODO use the conditions in order to calibrate the sound
                    /*
                    if(distance<v_params.distance_confort) {
                        volume =v_params.linear_a*distance + v_params.linear_b;
                    }else{
                        if(distance>v_params.distance_confortmax) {
                            volume =v_params.linear_a*distance + v_params.linear_b;
                        }else{

                        }

                    }*/
                    //@TODO remove unused methods
                    switch(v_params.type_gain){
                        case "linear":
                            volume =v_params.linear_a*distance + v_params.linear_b;
                            break;
                        case "1/d^2":
                            volume = Math.pow((v_params.gain_a +1)/(v_params.gain_a+distance),2);
                            break;
                        case "quadratic":
                            volume = Math.pow(distance,-v_params.gain_a);
                            break;
                    }

                    volume = Math.max(0,volume);
                    volume = Math.min(1,volume);
                }

            }

            //console.log(volume)
            let nbmedia = users[key].media.length;
            for(var i=0;i<nbmedia; i++){
                let media = document.getElementById(users[key].media[i].id);
                media.volume=volume;
            }
        }

    }
}

function computeEye(){
    // @TODO rewrite this part
/*    for(var key in users) {
        if(key===serverConnection.id) {
            // nothing
        }else{
            for(var i=0;i<users[key].media.length; i++){
                let peerid = "peer-"+users[key].media[i].id.substr(6,2);
                let div = document.getElementById('eye-'+peerid);
                let distance=distancePoints(users[serverConnection.id].x, users[serverConnection.id].y, users[key].media[i].x, users[key].media[i].y);
                if (distance < v_params.distance_m) {
                    div.style.display="block";
                }else{
                    if( users[key].bullhorn===true) {
                        div.style.display="block";
                    }else{
                        div.style.display="none";
                    }
                }
            }
         }
    }
*/
}

/**
 * @param {number} xPos
 * @param {number} yPos
 * @param {Object} el
 */
function setTranslate(xPos, yPos, el) {

    el.style.top=yPos+"px";
    el.style.left=xPos+"px";
}



/** bullHorn Button */
document.getElementById('bullhornbutton').onclick = function(e) {
    e.preventDefault();
    let bullhorn = getSettings().bullhorn;
    bullhorn = !bullhorn;
    updateSetting("bullhorn", bullhorn);
    users[serverConnection.id].bullhorn=bullhorn;

    //-- button look
    div = document.getElementById('user-v-'+serverConnection.id);
    divHornBtn = document.getElementById('bullhornbutton');
    let circle = div.children[0];
    let icon = circle.children[0];
    if(bullhorn===true) {
        icon.classList.add("fa-bullhorn")
        divHornBtn.classList.add("muted")
    }else{
        icon.classList.remove("fa-bullhorn")
        divHornBtn.classList.remove("muted")
    }
    //-- notification
    serverConnection.userMessage("setBullhorn", null, bullhorn, true);

};

/** grey-backgrd */
document.getElementById('grey-backgrd').onclick = function(e) {
    e.preventDefault();
    if(e.target.id.substr(0,2)==="v-") {
        // input and button
    }else{
        div = document.getElementById('grey-backgrd');
        div.style.display="none";
    }


};
/** grey-cartoon */
document.getElementById('grey-cartoon').onclick = function(e) {
    e.preventDefault();
    div = document.getElementById('grey-cartoon');
    div.style.display="none";


};
// @TODO keep only one function handelInput
function handleInputVicinity() {
    let input = /** @type {HTMLTextAreaElement} */
        (document.getElementById('v-input'));
    let data = input.value;
    input.value = '';

    let message, me;

    if(data === '')
        return;

    if(data[0] === '/') {
        if(data.length > 1 && data[1] === '/') {
            message = data.slice(1);
            me = false;
        } else {
            let cmd, rest;
            let space = data.indexOf(' ');
            if(space < 0) {
                cmd = data.slice(1);
                rest = '';
            } else {
                cmd = data.slice(1, space);
                rest = data.slice(space + 1);
            }

            if(cmd === 'me') {
                message = rest;
                me = true;
            } else {
                let c = commands[cmd];
                if(!c) {
                    displayError(`Uknown command /${cmd}, type /help for help`);
                    return;
                }
                if(c.predicate) {
                    let s = c.predicate();
                    if(s) {
                        displayError(s);
                        return;
                    }
                }
                try {
                    c.f(cmd, rest);
                } catch(e) {
                    displayError(e);
                }
                return;
            }
        }
    } else {
        message = data;
        me = false;
    }

    if(!serverConnection || !serverConnection.socket) {
        displayError("Not connected.");
        return;
    }

    try {
        if(v_DOMevts.destMsg===serverConnection.id) {
            serverConnection.chat(me ? 'me' : '', '', message);
        }else{
            serverConnection.chat(me ? 'me' : '', v_DOMevts.destMsg, message);
            addToChatbox(serverConnection.id, v_DOMevts.destMsg, serverConnection.username,
                Date.now(), false, '',message);
        }

    } catch(e) {
        console.error(e);
        displayError(e);
    }

    div = document.getElementById('grey-backgrd');
    div.style.display="none";


}
/**
 * @param {number} userid
 */
function showNotification(userid){

    if(userid===serverConnection.id) {
        // don't show
    }else{
        let div=document.getElementById('user-v-'+userid);
        let arrayDiv=div.getElementsByClassName('notification');
        if(typeof arrayDiv === 'undefined'){
        }else{
            if(arrayDiv.length>0) {
                arrayDiv[0].style.display="block";
                clearTimeout(users[userid].tnotification);
                users[userid].tnotification = setTimeout(resetNotification,v_params.delay_notification,userid);
            }else{
            }
        }
    }

}
/**
 * @param {number} userid
 */
function resetNotification(userid){
    div=document.getElementById('user-v-'+userid);
    let arrayDiv=div.getElementsByClassName('notification');
    arrayDiv[0].style.display="none";

}
document.getElementById('v-inputform').onsubmit = function(e) {
    e.preventDefault();
    handleInputVicinity();
};
document.getElementById('v-inputbutton').onmouseup = function(e) {
    e.preventDefault();
    handleInputVicinity();
};

document.getElementById('v-input').onkeypress = function(e) {
    if(e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        handleInputVicinity();
    }
};


/** Vicinity Initialisation */
function vicinityStart() {
    updateSetting("vicinity", "off");

    //@TODO remove unused methods
    // parameters
    let linear_a = (1.0 - 0.0)/(55.0 - 180.0);
    let linear_b = 1.0 - 55.0*linear_a;

    // @TODO give the explaination and roles of the attributes and put it in an external file
    v_params={
        ori_x:-3000,//10
        ori_y:85,
        hall_x:0,//60
        out_x:-3000,

        linear_a:linear_a,
        linear_b:linear_b,
        gain_a:30,
        type_gain:"1/d^2", // or "1/d^2" or "quadratic"
        offset_y:110,
        offset_dragendx:-5,
        offset_dragendy:25,
        distance_m:380,
        distance_confortmin:100,
        distance_confortmax:500,
        zone_w:250,
        angle:Math.PI/6,
        offsetangle:-Math.PI/2,
        radius:80,
        delay_notification:8000,
                       // 0 réservé à animateur
        positionsHelp:[[140,156],[95,182],[140,208],[185,182],[185,130],[140,104],[95,130],[50,156],[50,208],[95,234],[140,260],[185,234],[230,208],[230,156],[230,104],[185,78],[140,52],[95,78],[50,104]]
    };
    // color interface

    let htmlText    = "";
    let tabBckgColors = [" #741981", " #9e0b7b", " #c20a70", " #de2361", " #f24250", " #ff633c", " #ff8525", " #ffa600"];
    for(let i=0;i<tabBckgColors.length;i++){
        htmlText += '<div class="btn-color" id="btn-color'+i+'" myColor="'+i+'"></div>';
        htmlText += "\n";
    }
    /*let tabBckgColors = [];
    for(let i=0;i<8;i++){
        tabBckgColors[i]=window.getComputedStyle(document.documentElement).getPropertyValue('--color'+i)
        htmlText += '<div class="btn-color" id="btn-color'+i+'" myColor="'+i+'"></div>';
        htmlText += "\n";
    }*/
    document.getElementById('vicinity-listColors').innerHTML = htmlText;

    for(var i=0;i<tabBckgColors.length;i++){
        document.getElementById('btn-color'+i).style.backgroundColor=tabBckgColors[i];
        document.getElementById('btn-color'+i).onclick = function(e) {
            e.preventDefault()
            let mycolor = document.getElementById(this.id).getAttribute('mycolor')
            document.querySelectorAll('.btn-color').forEach(function(button) {
                button.style.borderWidth='1px';
            });
            document.getElementById(this.id).style.borderWidth='6px';
            getInputElement('usercolor').value=mycolor;
        };
    }
    document.getElementById('btn-color'+0).style.borderWidth='6px';
    getInputElement('usercolor').value=0;

    //-- DOM drag and drop
    v_DOMevts={};

}
vicinityStart();

//-- @TODO remove after tests ------------------------
//document.addEventListener("keydown", keyDownHandler, false);

function keyDownHandler(e) {
    var keyOn = e.key;
    switch(keyOn){
        case "1":
            //v_params.type_gain="linear";
            serverConnection.chat('', '', "linear");
            serverConnection.userMessage("gainMethod1", null, '', false);
            break;
        case "2":
            //v_params.type_gain="1/d^2";
            //v_params.gain_a = -0.9;
            serverConnection.chat('', '', "1/d^2 et a= 20");
            serverConnection.userMessage("gainMethod2", null, '', false);
            break;
        case "3":
            //v_params.type_gain="1/d^2";
            //v_params.gain_a = 30; 
            serverConnection.chat('', '', "1/d^2 et a=30");
            serverConnection.userMessage("gainMethod3", null, '', false);
            break;
        case "4":
            //v_params.type_gain="1/d^2";
            //v_params.gain_a = 50;
            serverConnection.chat('', '', "1/d^2 et a=50");
            serverConnection.userMessage("gainMethod4", null, '', false);
            break;
        case "5":
            //v_params.type_gain="1/d^2";
            //v_params.gain_a = 100;
            serverConnection.chat('', '', "1/d^2 et a=100");
            serverConnection.userMessage("gainMethod5", null, '', false);
            break;
        case "6":
            //v_params.type_gain="quadratic";
            //v_params.gain_a = 0;
            serverConnection.chat('', '', "quadratic et a=0");
            serverConnection.userMessage("gainMethod6", null, '', false);
            break;
        case "7":
            //v_params.type_gain="quadratic";
           // v_params.gain_a = 4;
            serverConnection.chat('', '', "quadratic et a=4");
            serverConnection.userMessage("gainMethod7", null, '', false);
            break;
        case "8":
            //v_params.type_gain="quadratic";
            //v_params.gain_a = 5;
            serverConnection.chat('', '', "quadratic et a=5");
            serverConnection.userMessage("gainMethod8", null, '', false);
            break;
    }
}