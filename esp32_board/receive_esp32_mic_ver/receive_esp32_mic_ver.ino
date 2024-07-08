#include <driver/i2s.h>


#if defined(ESP8266)
#include <ESP8266WiFi.h>
#else
#include <WiFi.h>
#endif
#include <WiFiUdp.h>
#include <OSCMessage.h>

 
// Connections to INMP441 I2S microphone
#define I2S_WS 25
#define I2S_SD 33
#define I2S_SCK 32
 
// Use I2S Processor 0
#define I2S_PORT I2S_NUM_0
 
// Define input buffer length
#define bufferLen 64
int16_t sBuffer[bufferLen];


void i2s_install() {
  // Set up I2S Processor configuration
  const i2s_config_t i2s_config = {
    .mode = i2s_mode_t(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = 44100,
    .bits_per_sample = i2s_bits_per_sample_t(16),
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = i2s_comm_format_t(I2S_COMM_FORMAT_STAND_I2S),
    .intr_alloc_flags = 0,
    .dma_buf_count = 8,
    .dma_buf_len = bufferLen,
    .use_apll = false
  };
 
  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
}


 
void i2s_setpin() {
  // Set I2S pin configuration
  const i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = -1,
    .data_in_num = I2S_SD
  };
 
  i2s_set_pin(I2S_PORT, &pin_config);
}



char ssid[] = "SoundLab";          // your network SSID (name)
char pass[] = "kkkk8888";                    // your network password

WiFiUDP Udp;                                // A UDP instance to let us send and receive packets over UDP
const IPAddress outIp(192,168,1,2);        // remote IP of your computer
const unsigned int outPort = 12000;          // remote port to receive OSC
const unsigned int localPort = 8888;        // local port to listen for OSC packets (actually not used for sending)

float current_vol = 0;

void setup() {
  Serial.begin(115200); // Start the Serial communication to the computer
  // Start the Serial2 at 9600 baud rate
  // Default pins for UART2 are 16 (RX), 17 (TX)
  Serial2.begin(115200, SERIAL_8N1, 16, 17);

   // Connect to WiFi network
    Serial.println();
    Serial.println();
    Serial.print("Connecting to bhbhbh");
    Serial.println(ssid);
    WiFi.begin(ssid, pass);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");

    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());

    Serial.println("Starting UDP");
    Udp.begin(localPort);
    Serial.print("Local port: ");
#ifdef ESP32
    Serial.println(localPort);
#else
    Serial.println(Udp.localPort());
#endif

  i2s_install();
  i2s_setpin();
  i2s_start(I2S_PORT);
   delay(500);

}

void loop() {
  // Check if the Serial2 has received any data
  if (Serial2.available()) {
    String receivedMessage = Serial2.readStringUntil('\n');
    Serial.println(receivedMessage); // Print the received message to the Serial Monitor
    sendmessage(receivedMessage);
  }
}



void update_vol(){

  // False print statements to "lock range" on serial plotter display
  // Change rangelimit value to adjust "sensitivity"
  int rangelimit = 2;


  // Get I2S data and place in data buffer
  size_t bytesIn = 0;
  esp_err_t result = i2s_read(I2S_PORT, &sBuffer, bufferLen * sizeof(int16_t), &bytesIn, portMAX_DELAY);

  if (result == ESP_OK)
  {
    // Read I2S data buffer
    int16_t samples_read = bytesIn / sizeof(int16_t);
    if (samples_read > 0) {
      float sum_of_squares = 0;
      for (int16_t i = 0; i < samples_read; ++i) {
        sum_of_squares += pow(sBuffer[i], 2); // Add the square of each sample to the sum
      }

      // Calculate the mean of the squares
      float mean_of_squares = sum_of_squares / samples_read;

      // Calculate the Root Mean Square (RMS), which is the square root of the mean of the squares
      float rms = sqrt(mean_of_squares);

      // Optional: Convert RMS to a dB scale. Assuming 16-bit signed samples, max RMS is 32768.
      float rms_db = 20 * log10(rms / 32768);

      current_vol = rms_db;

      // Print the RMS value to the serial plotter
      Serial.println(rms/10000);
    }
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
    msg.add(current_vol);

    Udp.beginPacket(outIp, outPort);
    msg.send(Udp);
    Udp.endPacket();
    msg.empty();


}


