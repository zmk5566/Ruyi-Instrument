/**
 * oscP5sendreceive by andreas schlegel
 * example shows how to send and receive osc messages.
 * oscP5 website at http://www.sojamo.de/oscP5
 */
 
 
import processing.sound.*;

SinOsc sine;
 
 
import oscP5.*;
import netP5.*;
int[] sensor_value = {0,0,0,0,0,0,0,0};
JSONArray json;

// start defining the situation


  
OscP5 oscP5;
NetAddress myRemoteLocation;

float r = 0;
float g = 0;
float b = 0;

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
  myRemoteLocation = new NetAddress("127.0.0.1",12000);
  
    // create and start the sine oscillator.
  sine = new SinOsc(this);
  sine.play();
  sinewave_update();
}


void draw() {
  background(122);  
  display_sensors();
  display_others();
  sinewave_update();
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


/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {
  /* print the address pattern and the typetag of the received OscMessage */
  println("### received an osc message.");

  try{
  update_the_sensor(sensor_value,theOscMessage);
    println(sensor_value);

  } catch(Exception e){
    println("something wrong");
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
      }
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
  fill(50+sensor_value[6]/5,50,50);
  ellipse(50,50,20,20);
  fill(255);
  text("b",50,50);
  
}


int findConditionName(int[] conditions,JSONArray jsonArr) {
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
      return jsonObj.getInt("condition_name");
    }
  }
  
  return -1; // Return -1 or any other value to indicate that no match was found
}


void sinewave_update(){
  
  float amplitude = map(sensor_value[7], 0, 255, 0, 1);
  sine.amp(amplitude);

  // Map mouseX from 20Hz to 1000Hz for frequency  
  float frequency =midiNoteToFrequency(findConditionName(sensor_value,json));
  sine.freq(frequency);
}


float midiNoteToFrequency(int midiNote) {
  return pow(2, (midiNote - 69+36) / 12.0) * 440;
}
