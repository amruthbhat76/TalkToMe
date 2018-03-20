'use strict'

//var threadCount=2;
function TalkToMe(){
this.checkSetup();

this.msgList=document.getElementById("msgs");

this.threadList=document.getElementById("threads");
this.threadInput=document.getElementById("username");
this.msgForm=document.getElementById("msgform");
this.msgInput=document.getElementById("msg");
this.submitButton=document.getElementById("submit");
this.submitImage=document.getElementById("submitImage");
this.imageForm=document.getElementById("imgform");
this.mediaCapture=document.getElementById("mediaCapture");
this.signInSnackbar=document.getElementById("must-signin-snackbar");
this.userPic=document.getElementById("user-pic");
this.userName=document.getElementById("user-name");
this.SignOut=document.getElementById("sign-out");
this.SignIn=document.getElementById("sign-in");
this.AddThread=document.getElementById("addbutton");
this.msgForm.addEventListener('submit', this.saveMessage.bind(this));
this.SignOut.addEventListener('click', this.signOut.bind(this));
this.SignIn.addEventListener('click', this.signIn.bind(this));
this.AddThread.addEventListener('click',this.addThread.bind(this));


var buttonTogglingHandler = this.toggleButton.bind(this);
  this.msgInput.addEventListener('keyup', buttonTogglingHandler);
  this.msgInput.addEventListener('change', buttonTogglingHandler);


  this.submitImage.addEventListener('click', function(e) {
    e.preventDefault();
    this.mediaCapture.click();
  }.bind(this));
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  this.initFirebase();



}


var abc;


TalkToMe.prototype.initFirebase=function(){
this.auth=firebase.auth();
this.database=firebase.database();
this.storage=firebase.storage();
this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

}


var active_thread;

TalkToMe.prototype.loadMessages=function(id){
  var removeParent=this.msgList;
removeParent.innerHTML='';
  active_thread=id;
 this.messagesRef = firebase.database().ref('Threads/'+active_thread+'/messages');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};




TalkToMe.Thread_TEMPLATE =
    '<div class="thread-container mdl-js-ripple-effect" onclick="open(this.id)">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="thread"></div>' +
      '<div class="name"></div>' +
    '</div>';




TalkToMe.prototype.loadThreads=function(user){
  if (this.checkSignedInWithMessage()) {

  abc=this;
var userTag=user.email.split('.')[0];
var userThreadsRef = firebase.database().ref('Users/' +userTag+ '/threads');
var usersRef=firebase.database().ref('Users');
userThreadsRef.on('child_added', function(snapshot) {
  
  var ab=snapshot.val();
 // ab.forEach(function(ThreadId)
 {
    if(ab!=0){
  var threadPath2 = firebase.database().ref('Threads/'+ab+'/user2');
  var threadPath1 = firebase.database().ref('Threads/'+ab+'/user1');
  
  threadPath1.on('value',function(snapshot){
    
    if(snapshot.val()!==user.email.split('.')[0] ){
        var userTag=snapshot.val();
        usersRef.child(userTag).once('value',function(snapshot){
        var container = document.createElement('div');
        container.innerHTML = TalkToMe.Thread_TEMPLATE;
        var div = container.firstChild;
        div.setAttribute('id', ab);
        //abc=this;
       div.onclick=function(){
  var a=this.id;
  var elem=document.getElementsByClassName('visited')[0];
  if(elem)
    {
      elem.classList.remove("visited");
    }
   div.classList.add("visited");
           abc.loadMessages(a);
  // Make sure we remove all previous listeners.

         }
;
        
        document.getElementById("threads").appendChild(div);
        var threadElement = div.querySelector('.thread');

        threadElement.textContent =snapshot.val().username;
        div.querySelector('.pic').style.backgroundImage = 'url(' + snapshot.val().profile_picture + ')';
        setTimeout(function() {div.classList.add('visible')}, 1);
       // this.threadList.scrollTop = this.threadList.scrollHeight;
  
    });
  }
    else {
         threadPath2.on('value',function(snapshot){ 
          var userTag=snapshot.val();
          usersRef.child(snapshot.val()).once('value',function(snapshot){
            var container = document.createElement('div');
            container.innerHTML = TalkToMe.Thread_TEMPLATE;
            var div = container.firstChild;
            div.setAttribute('id', ab);
            div.onclick=function(){
  var a=this.id;
  var elem=document.getElementsByClassName('visited')[0];
  if(elem)
    {
      elem.classList.remove("visited");
    }
   div.classList.add("visited");
           abc.loadMessages(a);
  // Make sure we remove all previous listeners.

         }
;
            document.getElementById("threads").appendChild(div);
            var threadElement = div.querySelector('.thread');
            threadElement.textContent = snapshot.val().username;
            div.querySelector('.pic').style.backgroundImage = 'url(' + snapshot.val().profile_picture + ')';
            setTimeout(function() {div.classList.add('visible')}, 1);
           // this.threadList.scrollTop = this.threadList.scrollHeight;
          });
         });
      }
  });
}
}

});
}

this.threadList.scrollTop = this.threadList.scrollHeight;
};


TalkToMe.prototype.saveMessage=function(e){
e.preventDefault();
if(this.msgInput.value && this.checkSignedInWithMessage()){
var currentUser=this.auth.currentUser;
this.messagesRef.push({
  name:currentUser.displayName,
  text:this.msgInput.value,
  photoUrl: currentUser.photoURL || '/images/placeholder.jpg'
}).then(function(){
  TalkToMe.resetMaterialTextfield(this.msgInput);
  this.toggleButton();
}.bind(this)).catch(function(error){console.error('Couldnt write new msgs to firebase',error);
});
}
};

TalkToMe.prototype.setImageUrl = function(imageUri, imgElement) {
 if (imageUri.startsWith('gs://')) {
    imgElement.src = TalkToMe.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};


TalkToMe.prototype.saveImageMessage = function(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }

  if (this.checkSignedInWithMessage()) {

// We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.messagesRef.push({
      name: currentUser.displayName,
      imageUrl: TalkToMe.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/placeholder.jpg'
    }).then(function(data) {

      // Upload the image to Cloud Storage.
      var filePath = currentUser.uid + '/' + data.key + '/' + file.name;
      return this.storage.ref(filePath).put(file).then(function(snapshot) {

        // Get the file's Storage URI and update the chat message placeholder.
        var fullPath = snapshot.metadata.fullPath;
        return data.update({imageUrl: this.storage.ref(fullPath).toString()});
      }.bind(this));
    }.bind(this)).catch(function(error) {
      console.error('There was an error uploading a file to Cloud Storage:', error);
    });
  }
};


TalkToMe.prototype.addThread=function(e){

  if (this.checkSignedInWithMessage()) {
e.preventDefault();
var userName=this.threadInput.value;
var user=userName.split('.')[0];
if( user && this.checkSignedInWithMessage()){
var currentUser=this.auth.currentUser;
var usersRef=firebase.database().ref('Users');
var ThreadRef=firebase.database().ref('Threads');
usersRef.child(user).once('value',function(snapshot){
  if(user!==currentUser.email.split('.')[0] && snapshot.val()){
  
    var thread=ThreadRef.push({
    messages: {1:{name:"TalkToMe",photoUrl:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNqbFA1-f9BBcqXORpAEh-CzsJ3bEBh1BIYAH1J8r_O-z9ppuC",text:"Welcome User!"}},
    user1:currentUser.email.split('.')[0],
    user2:user
  });//.then(function(response){
   // if(response!==null){
      var threadnumb=thread.key;
    var th=snapshot.val().threads;
    var str=JSON.stringify(th).split('[')[1];
    var updatedThread=JSON.parse('['+str.split(']')[0]+','+JSON.stringify(threadnumb)+']');


    usersRef.child(user).update({ threads: updatedThread });

    usersRef.child(currentUser.email.split('.')[0]).once('value',function(snapshot){
      var thr=snapshot.val().threads;
      var string=JSON.stringify(thr).split('[')[1];
          var updateThread=JSON.parse('['+string.split(']')[0]+','+JSON.stringify(threadnumb)+']');
    usersRef.child(currentUser.email.split('.')[0]).update({ threads: updateThread });
  });
    
    }


    
  
  else{
    alert("Threads can only be created with other users on TalkToMe!");
  }
});
}}
};








TalkToMe.prototype.signIn = function(){
  // this.ref = this.database.ref("talktome-af3b8");

var provider = new firebase.auth.GoogleAuthProvider();
 firebase.auth().signInWithPopup(provider).then(function(result) {
  
  // This gives you a Google Access Token. You can use it to access the Google API.
  var token = result.credential.accessToken;
  // The signed-in user info.

  var currUser = result.user;
  // var usersRef = new Firebase(USERS_LOCATION);
  //var userRef=  this.database.ref('Users');
 return currUser;
  // ...
}).then(function(response){
  var usersRef=firebase.database().ref('Users');
  var userTag=response.email.split('.')[0];
  checkForFirstTime(userTag);
  function checkForFirstTime(userTag) {
  usersRef.child(userTag).once('value', function(snapshot) {
    var exists = (snapshot.val() !== null);
      userFirstTimeCallback(userTag, exists);
  });
}

function userFirstTimeCallback(userTag, exists) {

  if (exists) {
    // Do something here you want to do for non-firstime users...
  } else {
     usersRef.child(userTag).set({
    username: response.displayName,
    email: response.email,
    profile_picture : response.photoURL,
    threads:[0]
  });

    // Do something here you want to do for first time users (Store data in database?)
  }
}

})
.catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // The email of the user's account used.
  var email = error.email;
  // The firebase.auth.AuthCredential type that was used.
  var credential = error.credential;
  console.log(errorMessage);
  // ...
});
};

TalkToMe.prototype.signOut = function() {

this.auth.signOut();

  var removeParent=this.msgList;
removeParent.innerHTML='';
  var removeThread=this.threadList;
removeThread.innerHTML='';

TalkToMe.resetMaterialTextfield(this.threadInput);
};

TalkToMe.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
       var profilePicUrl = user.photoUrl;  
    var userName = user.displayName; 
    var userTag=user.email.split('.')[0];       

    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.SignOut.removeAttribute('hidden');

    
    this.SignIn.setAttribute('hidden', 'true');

   
   // this.loadMessages();
   this.loadThreads(user);

   
    this.saveMessagingDeviceToken();
  } else { 
    
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.SignOut.setAttribute('hidden', 'true');

    
    this.SignIn.removeAttribute('hidden');
  }
};

TalkToMe.prototype.checkSignedInWithMessage = function() {
 if (this.auth.currentUser) {
    return true;
  }
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

TalkToMe.prototype.saveMessagingDeviceToken = function() {

};

TalkToMe.prototype.requestNotificationsPermissions = function() {

};

TalkToMe.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

TalkToMe.MESSAGE_TEMPLATE =
    '<div class="message-container">' +
      '<div class="spacing"><div class="pic"></div></div>' +
      '<div class="message"></div>' +
      '<div class="name"></div>' +
    '</div>';


TalkToMe.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

TalkToMe.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = TalkToMe.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.msgList.appendChild(div);
  }

   if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { 
    messageElement.textContent = text;
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) { 
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      this.msgList.scrollTop = this.msgList.scrollHeight;
    }.bind(this));
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  setTimeout(function() {div.classList.add('visible')}, 1);
 // this.msgList.scrollTop = this.msgList.scrollHeight;
  this.msgInput.focus();
};

TalkToMe.prototype.toggleButton = function() {
  if (this.msgInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

TalkToMe.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

window.onload = function() {
  window.talkToMe = new TalkToMe();
};


