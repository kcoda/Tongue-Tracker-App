var canvas = document.querySelector('canvas');
var statusText = document.querySelector('#statusText');
var historycheckbox = document.getElementById("history");
var durationselection = document.getElementById("Duration");
var beginTEbutton = document.getElementById("BeginTE");
var timer = document.getElementById("timer");
var xycoordtext = document.getElementById("xycoord");
var context;
var gridImage = new Image(315, 380);
var eventArray = [];
var logging = false;
var loggingStartTime;

class LocationEvent{
  constructor(x, y, starttime){
    this.x = x;
    this.y = y;
    var today = new Date();
    this.time = (today.getTime() - starttime);
  }
}

statusText.addEventListener('click', function() {
  statusText.textContent = 'Connecting to capled';
  TongueTracker.connect()
  .then(() => TongueTracker.startNotificationsLocation().then(handleLocationUpdate))
  .catch(error => {
    statusText.textContent = error;
	console.log(error);  
  });
});

beginTEbutton.addEventListener('click', function(){
  if(statusText.textContent == 'Click Here to Connect'){
    statusText.textContent = 'Not Connected! Click Here to Connect';
    return;
  }
  if(!logging){
    eventArray = [];
    logging = true;
    var today = new Date();
    loggingStartTime = today.getTime();
    beginTEbutton.textContent = 'Stop Timed Exploration';
    startTimedExploration();
  }
  else{
    logging = false;
    beginTEbutton.textContent = 'Begin Timed Exploration';
    clearInterval(timerInterval); 
    saveTextAsFile(); 
  }
});

historycheckbox.addEventListener('click', function(){
  if(!historycheckbox.checked)
    context.drawImage(gridImage, 0, 0);
});

function startup(){
  canvas.width = 315;
  canvas.height = 380;   
  context = canvas.getContext('2d');
  gridImage.src = 'img/grid.png';
  context.drawImage(gridImage, 0, 0);
}

function handleLocationUpdate(Location) {
  Location.addEventListener('characteristicvaluechanged', event => {
  var xlocation = (event.target.value.getUint8(0) + (event.target.value.getUint8(1) << 8));
  var ylocation = ((event.target.value.getUint8(2) + (event.target.value.getUint8(3) << 8)));
  drawPoints(xlocation, ylocation);	
  if(logging){
    eventArray.push(new LocationEvent(xlocation, ylocation, loggingStartTime));    
  }
	});
}

function drawPoints(x, y){
  console.log('X: ' + x + ' Y: ' + y);
  xycoordtext.textContent = ('X: ' + x + ' Y: ' + y);

  if(!historycheckbox.checked){
    context.clearRect(0,0,315, 380);
    context.drawImage(gridImage, 0, 0);
  }
  context.fillStyle = 'blue';        
  context.fillRect(canvas.width-x-5,canvas.height-y-5,10,10);
}

function startTimedExploration(){
  var TIME_LIMIT = parseInt(durationselection.value/1000);
  var timeLeft = TIME_LIMIT;
  var timePassed = 0;
  timerInterval = setInterval(() => {
          
      // The amount of time passed increments by one
      timePassed = timePassed += 1;
      timeLeft = TIME_LIMIT - timePassed;      
      // The time left label is updated
      timer.textContent = Math.floor(timeLeft/60) + ':' + ((timeLeft%60) < 10 ? ('0' + (timeLeft%60)) : (timeLeft%60));
      if(timeLeft <= 0){
        timer.textContent = '0:00';
        beginTEbutton.textContent = 'Begin Timed Exploration';
        clearInterval(timerInterval);  
        var logging = false;
        saveTextAsFile();  
      }      
    }, 1000);
  
}

function saveTextAsFile(){
    var outputtext = 'X, Y, ms \n';
    for(var i=0; i < eventArray.length; i++){
      outputtext += eventArray[i].x + ', ' + eventArray[i].y + ', ' + eventArray[i].time + '\n';
      console.log('writing output: ' + outputtext);
    }
    var textToWrite = outputtext;
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    var today = new Date();
    var fileNameToSaveAs = '' + today.toLocaleString();
      var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null)
    {
        // Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else
    {
        // Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}




