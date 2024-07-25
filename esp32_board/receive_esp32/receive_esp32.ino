#if defined(ESP8266)
#include <ESP8266WiFi.h>
#else
#include <WiFi.h>
#endif
#include <WiFiUdp.h>
#include <OSCMessage.h>

char ssid[] = "SoundLab";          // your network SSID (name)
char pass[] = "kkkk8888";                    // your network password

WiFiUDP Udp;                                // A UDP instance to let us send and receive packets over UDP
const IPAddress outIp(192,168,50,255);        // remote IP of your computer
const unsigned int outPort = 12000;          // remote port to receive OSC
const unsigned int localPort = 8888;        // local port to listen for OSC packets (actually not used for sending)

void setup() {
  Serial.begin(115200); // Start the Serial communication to the computer
  // Start the Serial1 at 9600 baud rate
  // Default pins for UART2 are 16 (RX), 17 (TX)
  Serial1.begin(115200, SERIAL_8N1, 20, 21);

  //  // Connect to WiFi network
  //   Serial.println();
  //   Serial.println();
  //   Serial.print("Connecting to bhbhbh");
  //   Serial.println(ssid);
    WiFi.begin(ssid, pass);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        //Serial.print(".");
    }
    // Serial.println("");

    // Serial.println("WiFi connected");
    // Serial.println("IP address: ");
    // Serial.println(WiFi.localIP());

    // Serial.println("Starting UDP");
    Udp.begin(localPort);
    //Serial.print("Local port: ");
#ifdef ESP32
    //Serial.println(localPort);
#else
    //Serial.println(Udp.localPort());
#endif
}

void loop() {
  // Check if the Serial1 has received any data
  if (Serial1.available()) {
    String receivedMessage = Serial1.readStringUntil('\n');
    sendmessage(receivedMessage);
  }
}



void sendmessage(String str) {
  OSCMessage msg("/arduino/sensors");

  int fromIndex = 0; // Starting index for each substring search
  
  // Find the first space, then keep finding spaces and extracting integers until there are no more spaces
  while (str.indexOf(' ', fromIndex) != -1) {
    int spaceIndex = str.indexOf(' ', fromIndex);
    
    // Extract substring from fromIndex up to but not including spaceIndex
    String numberStr = str.substring(fromIndex, spaceIndex);
    
    // Print the current number after converting it to an integer
    msg.add(numberStr.toInt());
    
    // Update fromIndex to start searching for the next space after the current one
    fromIndex = spaceIndex + 1;
  }

  // After the loop, there's still one last number (or the only number if no spaces were found) to convert and print
  if (fromIndex < str.length()) {
    String lastNumberStr = str.substring(fromIndex);
    msg.add(lastNumberStr.toInt());
    //Serial.println(lastNumberStr.toInt());
  }

    Udp.beginPacket(outIp, outPort);
    msg.send(Udp);
    Udp.endPacket();
    msg.empty();


}
