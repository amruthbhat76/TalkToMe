'use strict'
function TalkToMe(){
this.checkSetup();

this.msgList=document.getElementById("msgs");
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

//this.msgForm.addEventListener('submit', this.saveMessage.bind(this));
this.SignOut.addEventListener('click', this.signOut.bind(this));
this.SignIn.addEventListener('click', this.signIn.bind(this));

var buttonTogglingHandler = this.toggleButton.bind(this);
  this.msgInput.addEventListener('keyup', buttonTogglingHandler);
  this.msgInput.addEventListener('change', buttonTogglingHandler);


  this.submitImageButton.addEventListener('click', function(e) {
    e.preventDefault();
    this.mediaCapture.click();
  }.bind(this));
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  this.initFirebase();



}

TalkToMe.prototype.initFirebase=function(){

}

TalkToMe.prototype.loadMessages=function(){

}

TalkToMe.prototype.saveMessage()=function(e){
e.preventDefault();
if(this.msgInput.value && this.checkSignedInWithMessage()){

}
};

TalkToMe.prototype.setImageUrl = function(imageUri, imgElement) {
  imgElement.src = imageUri;
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


  }
};

TalkToMe.prototype.signIn = function() {

  

};

TalkToMe.prototype.signOut = function() {


};

TalkToMe.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    var profilePicUrl = user.photoUrl;  
    var userName = user.displayName;        

    this.userPic.style.backgroundImage = 'url(' + profilePicUrl + ')';
    this.userName.textContent = userName;

    
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    
    this.signInButton.setAttribute('hidden', 'true');

   
    this.loadMessages();

   
    this.saveMessagingDeviceToken();
  } else { 
    
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');

    
    this.signInButton.removeAttribute('hidden');
  }
};

TalkToMe.prototype.checkSignedInWithMessage = function() {
 

 

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
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
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
  this.msgList.scrollTop = this.msgList.scrollHeight;
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
  window.talkToMe = new FriendlyChat();
};


