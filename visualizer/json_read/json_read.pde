JSONArray json;

void setup() {
  // Load the JSON file
  json = loadJSONArray("data/audio_chart.json");
}

void draw() {
  // Drawing code goes here (if necessary)
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
