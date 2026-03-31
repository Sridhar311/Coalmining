#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

// ──────────────────────────────────────────────────────────────────────────────
//  ⚙️  CONFIGURE THESE  ⚙️
// ──────────────────────────────────────────────────────────────────────────────
const char* WIFI_SSID     = "PRASATH";
const char* WIFI_PASSWORD = "prasaths";
const char* SERVER_IP     = "10.228.221.32";
const int   SERVER_PORT   = 3000;
// ──────────────────────────────────────────────────────────────────────────────

const int   GAS_PIN       = A0;       // analog pin
const int   BUZZER_PIN    = D6;       // digital pin (GPIO 4)
const int   GAS_THRESHOLD = 100;      // ADC value — adjust for your sensor
const int   SEND_INTERVAL = 2000;     // ms between HTTP sends

unsigned long lastSend = 0;

// ── Setup ─────────────────────────────────────────────────────────────────────
void setup() {
  Serial.begin(115200);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("\n[Boot] Coal Mine Gas Monitor");

  // ── Clear stale WiFi cache (fixes most ESP8266 connection issues) ──
  WiFi.persistent(false);   // don't save credentials to flash
  WiFi.disconnect(true);    // disconnect and clear old config
  WiFi.mode(WIFI_OFF);
  delay(1000);
  WiFi.mode(WIFI_STA);
  delay(500);

  // Scan and list visible WiFi networks
  Serial.println("[WiFi] Scanning for networks...");
  int n = WiFi.scanNetworks();
  if (n == 0) {
    Serial.println("[WiFi] No networks found!");
  } else {
    Serial.println("[WiFi] Networks found: " + String(n));
    for (int i = 0; i < n; i++) {
      Serial.println("  " + String(i+1) + ") " + WiFi.SSID(i) + "  RSSI:" + WiFi.RSSI(i));
    }
  }
  Serial.println();

  // Connect to WiFi — using BSSID for reliable connection
  uint8_t bssid[6] = {0x6a, 0x5d, 0x01, 0x50, 0x0d, 0xda};  // Sridhar hotspot MAC
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD, 0, bssid);
  Serial.print("[WiFi] Connecting to: ");
  Serial.println(WIFI_SSID);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected! IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[WiFi] FAILED to connect after 20s!");
    Serial.println("[WiFi] Check: Is hotspot ON? Correct SSID/password?");
    Serial.println("[WiFi] Will retry in loop...");
  }
}

// ── Loop ──────────────────────────────────────────────────────────────────────
void loop() {
  int gasADC = analogRead(GAS_PIN);

  // Buzzer control
  bool danger = (gasADC >= GAS_THRESHOLD);
  digitalWrite(BUZZER_PIN, danger ? HIGH : LOW);

  Serial.print("[Gas] ADC = ");
  Serial.print(gasADC);
  Serial.print("  Status: ");
  Serial.println(danger ? "DANGER" : "safe");

  // Send to server every SEND_INTERVAL ms
  unsigned long now = millis();
  if (now - lastSend >= SEND_INTERVAL) {
    lastSend = now;
    sendToServer(gasADC, danger);
  }

  delay(200);
}

// ── HTTP send ─────────────────────────────────────────────────────────────────
void sendToServer(int gasValue, bool buzzerOn) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] WiFi disconnected — skipping send");
    return;
  }

  WiFiClient client;
  HTTPClient http;

  String url = "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT)
               + "/update?gas=" + String(gasValue)
               + "&buzzer="     + String(buzzerOn ? 1 : 0);

  Serial.print("[HTTP] GET " + url + " → ");

  http.begin(client, url);
  http.setTimeout(3000);          // 3-second timeout
  int code = http.GET();

  if (code > 0) {
    Serial.println(code);         // 200 = OK
  } else {
    Serial.println("Error: " + String(http.errorToString(code)));
  }

  http.end();
}
