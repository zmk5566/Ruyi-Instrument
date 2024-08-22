//SinOsc sine;
 
 
import oscP5.*;
import netP5.*;
int[] sensor_value = {0,0,0,0,0,0,0,0};
JSONArray json;
String[] pitchNames = { "C", "bD", "D", "bE", "E", "F", "bG", "G", "bA","A", "bB","B"};
int pitchShift = -2;

// start defining the situation

OscP5 oscP5;
NetAddress myRemoteLocation;

float r = 0;
float g = 0;
float b = 0;

int empty_state_counter = 0;
boolean isTriggered = false;

void setup() {
  size(400,400);
  frameRate(25);
  textAlign(CENTER,CENTER);
  json = loadJSONArray("../../data/audio_chart.json");

  /* start oscP5, listening for incoming messages at port 12000 */
  oscP5 = new OscP5(this,12000);
  
  /* myRemoteLocation is a NetAddress. a NetAddress takes 2 parameters,
   * an ip address and a port number. myRemoteLocation is used as parameter in
   * oscP5.send() when sending osc packets to another computer, device, 
   * application. usage see below. for testing purposes the listening port
   * and the port of the remote location address are the same, hence you will
   * send messages back to this sketch.
   */
  myRemoteLocation = new NetAddress("127.0.0.1",7790);
  

  //sinewave_update();
}


void draw() {
  background(122); 
  textSize(12); // 
  display_sensors();
  display_others();
  displayScale();
  display_meter();
  
  
}

void displayScale(){
  textSize(120); // 
  String temp = getCurrentName(pitchShift);
  text(temp,300,300);
}

void mousePressed() {
  /* in the following different ways of creating osc messages are shown by example */
  OscMessage myMessage = new OscMessage("/arduino/sensors");
  
  myMessage.add(mouseX*10); /* add an int to the osc message */
  myMessage.add(mouseY*10); /* add an int to the osc message */
  myMessage.add(mouseX); /* add an int to the osc message */
  myMessage.add(mouseY); /* add an int to the osc message */

  println("message sent");
  /* send the message */
  oscP5.send(myMessage, myRemoteLocation); 
}


void updatePitch(int pitch_value, int breath){
  OscMessage myMessage = new OscMessage("/Hulusi/Basic_Parameters/midiPitch");
  myMessage.add(pitch_value);

  /* send the message */
  oscP5.send(myMessage, myRemoteLocation); 
  OscMessage myMessage3 = new OscMessage("/Hulusi/Physical_and_Nonlinearity/Physical_Parameters/Pressure");

  myMessage3.add(map(breath,0,50,0.7,1.0));
  oscP5.send(myMessage3, myRemoteLocation); 
}


void sendNoteOff(int pitch_value, int breath){
  OscMessage myMessage = new OscMessage("/Hulusi/Basic_Parameters/midiPitch");
  myMessage.add(pitch_value);

  /* send the message */
  oscP5.send(myMessage, myRemoteLocation); 
  OscMessage myMessage3 = new OscMessage("/Hulusi/Physical_and_Nonlinearity/Physical_Parameters/Pressure");

  myMessage3.add(map(breath,0,255,0.7,1.0));
  oscP5.send(myMessage3, myRemoteLocation); 
}


void setGateStatus(float status){
  
  OscMessage myMessage2 = new OscMessage("/Hulusi/Basic_Parameters/gate");
  myMessage2.add(status);

  oscP5.send(myMessage2, myRemoteLocation);
  
}


/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {
  /* print the address pattern and the typetag of the received OscMessage */
  println("### received an osc message.");
  
  
  NetAddress senderAdd = theOscMessage.netAddress();
  
  String ipa = senderAdd.address();
  
  
  
  if (ipa.contains("50.206")){
  try{
  update_the_sensor(sensor_value,theOscMessage);
    println(sensor_value);

  } catch(Exception e){
    println("something wrong");
  }
  }else{
    // do nothing
  }

}

void update_the_sensor(int[] sensor_value,OscMessage theOscMessage){
   
    for (int i = 0; i < sensor_value.length;i++){
      if (i<7){
        if (theOscMessage.get(i).intValue()>200){
            sensor_value[i]=1;
        }else{
            sensor_value[i]=0; 
        }
      }else{
        sensor_value[i]= theOscMessage.get(i).intValue();
        

        if (sensor_value[i]<=5){
          empty_state_counter =empty_state_counter+1;
          // do nothing 
        }else{
          // trigger it 
          empty_state_counter=0;
        }
      }
    }
    // do the actually send logic

    int[] temp_condition = findConditionName(sensor_value,json);
    int temp_n = temp_condition[0];
    int temp_low = temp_condition[1];
    println(temp_low);
    float temp_value  = sensor_value[7]*1.5;
    if (temp_value>195){
            updatePitch(temp_n+pitchShift+36,int(temp_value));
    }else{
              updatePitch(temp_low+pitchShift+36,int(temp_value));
    }
    updateGate(255);
    
  
}


void updateGate(int input_breath){
  if (isTriggered == false && input_breath>0){
    // set the gate on
    isTriggered = true;
    OscMessage myMessage2 = new OscMessage("/Hulusi/Basic_Parameters/gate");
    myMessage2.add(1);
    oscP5.send(myMessage2, myRemoteLocation);
  }
  
  if (isTriggered==true && empty_state_counter>5){
    isTriggered = false;
    OscMessage myMessage2 = new OscMessage("/Hulusi/Basic_Parameters/gate");
    myMessage2.add(0);
    oscP5.send(myMessage2, myRemoteLocation);
  }
}

void display_sensors(){
  
  for (int i = 0; i < sensor_value.length-2;i++){
    fill(255+122*sensor_value[i]);
    ellipse(50+sensor_value[i]/5,50+50*(sensor_value.length-2-i),20,20); 
    fill(0);
    text(i,50+sensor_value[i]/5,50+50*(sensor_value.length-2-i));
  }
  
  
}


void display_others(){
  fill(100-sensor_value[6]*50);
  ellipse(50,50,20,20);
  fill(255);
  text("b",50,50);
  
}

void display_meter(){
  fill(200);
  rect(100,40,255,20);
  fill(150);
  rect(100,40,sensor_value[7],20);
  
  
}
int[] findConditionName(int[] conditions,JSONArray jsonArr) {
  int [] temp = {-1,-1};
  for (int i = 0; i < jsonArr.size(); i++) {
    JSONObject jsonObj = jsonArr.getJSONObject(i);
    JSONArray conditionInfo = jsonObj.getJSONArray("condition_info");
    
    boolean match = true;
    for (int j = 0; j < conditionInfo.size(); j++) {
      if (conditions[j] != conditionInfo.getInt(j)) {
        match = false;
        break;
      }
    }
    
    if (match) {
      temp[0] = jsonObj.getInt("condition_name");
      temp[1]=  jsonObj.getInt("low_wind_condition");
      
      //return {jsonObj.getInt("condition_name"),jsonObj.getInt("low_wind_condition")]};
      return temp;
    }
  }
  
  return temp; // Return -1 or any other value to indicate that no match was found
}

String getCurrentName(int number){
  int index = Math.floorMod(number, pitchNames.length); 
  int scalenumber = 3+int(number/12);
  return pitchNames[index]+scalenumber;
}




void keyPressed() {
  if (pitchShift <= 13 && pitchShift >= -13){
  if (keyCode == UP) { // 如果按下的是上箭头键
    pitchShift++; // 增加pitch shift的值
  } else if (keyCode == DOWN) { // 如果按下的是下箭头键
    pitchShift--; // 减少pitch shift的值
  }
  }
}
