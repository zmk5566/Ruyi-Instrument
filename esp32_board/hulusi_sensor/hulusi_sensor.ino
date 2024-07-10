// Include I2S driver
#include <driver/i2s.h>
 

// Connections to INMP441 I2S microphone
#define I2S_WS 22
#define I2S_SD 21
#define I2S_SCK 26
 
// Use I2S Processor 0
#define I2S_PORT I2S_NUM_0
 
// Define input buffer length
#define bufferLen 64
int16_t sBuffer[bufferLen];

int myArray[] = {0,0,0,0,0,0,0,0};
int myPins[] = {27, 14, 12, 13, 4, 32, 15};

unsigned long previousMillis = 0;        // stores last time LED was updated
const long interval = 20;              // interval at which to blink (milliseconds)
 
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
 
void setup() {
 
  // Set up Serial Monitor
  Serial.begin(115200);
  delay(1000);
 
  // Set up I2S
  i2s_install();
  i2s_setpin();
  i2s_start(I2S_PORT);
  Serial2.begin(115200, SERIAL_8N1, 16, 17);
 
  delay(500);
}
 
void loop() {

  unsigned long currentMillis = millis();
  
  main_loop();

  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;   // save the last time you blinked the LED
    
    // if the LED is off turn it on and vice-versa:
    array_printing();
  }


  
}

void array_printing(){
  for(int i = 0; i < 8; i++) {
    Serial.print(myArray[i]);
    Serial.print(" "); // Print a space after each number
    Serial2.print(myArray[i]);
    Serial2.print(" "); // Print a space after each number
  }
  // Change the line after the last element has been printed
  Serial.println(); // This moves the cursor to the next line
  Serial2.println(); // This moves the cursor to the next line
}


void main_loop(){

  for(int i = 0; i < 7; i++) {
    myArray[i] = sensor_mapping(myPins[i]);
  }


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
       

      // Print the RMS value to the serial plotter
      //Serial.println(rms_db);
      myArray[7] = constrain(map(rms_db,-50,-5,0,255),0,255);
      
      //Serial.println(temp_sensor);


    }
  }

  
}




int sensor_mapping(int input_pin){

  return constrain(map(touchRead(input_pin),18,10,0,255),0,255);
}
