const WebSocket = require("ws");
const http = require("http");
const server = http.createServer();
const wss = new WebSocket.Server({ server });
const express = require("express");
const axios = require("axios");
const { SerialPort } = require("serialport");
const { createInterface } = require("readline");
const cors = require("cors");
const { parse } = require("path");
const exp = require("constants");
const fs = require("node:fs");
var arguments = process.argv;
let port;
if (arguments[2] !== "stand-alone") {

  try {
    port = new SerialPort({
      path: "COM5",
      baudRate: 1152000,
      stopBits: 1,
      parity: "none",
    });
  } catch (err) {
    console.log("STM NOT CONNECTED");
  }
}

const systemPrompt = `You are Connor a virtual assitant for a web app that allows remote control and monitoring of a High gain dc-dc boost converter. The boost converter
has the following gain expression (4-3D+D^2)/(1-D)^3.
output voltage will be Gain * input voltage
. At nominal conditions it can deliver 150W of power with output voltage begin 400V and input being 
at 18V. It has reduced current stress on the inductors and higher than expected gain in the VMC cell. It has 16 components in total with 3 switches, 3 inductors,5 diodes
rest begin capacitors. The voltage rating of output capacitor is rated at 450V. it operates at a duty ratio of 50% in nominal conditions at 50KHZ

Introduction:
Disclosed is a unique two-stage boost converter system designed for high-voltage applications, overcoming limitations of existing technologies by achieving higher voltage gain with fewer components. The first stage utilizes a Reduced Stress Cubic Gain (RSCG) configuration, providing cubic voltage amplification without resonant elements. The subsequent stage features a Novel Diode-Capacitor Gain cell (DCGC), resulting in unprecedented voltage amplification. The combined RSCG and DCGC stages produce a robust converter with minimal stress on magnetic and semiconductor components.

Converter Specifications:

Gain Expression: (4-3D+D^2)/(1-D)^3
Output voltage : Gain Expression * input voltage
Nominal Conditions: 150W, 400V output, 18V input, 50% duty ratio at 50kHz
Components: 16 in total (3 switches, 3 inductors, 5 diodes, rest capacitors)
Inductor Ratings: L1(10A, 100uH), L2(6A, 564uH), L3(3A, 3mH)
Capacitor Voltage Ratings: C1, C2, C3(250V, 4.7uF), C4(250V, 22uF), C5(450V, 47uF)
Switch Voltage Ratings: S1(100V), S2(200V), S3(600V)
Web Application:


Dashboard:

Plots: Output voltage, output current, output power, power voltage graph, gating pulses for S1, S2, S3.
Input Fields: Sample size, resolution.
Toggle Buttons: Autorefresh, Update resolution.
Control Panel:

Left Card: Display current parameters.
Right Part: Inputs for reference voltage, closed/open loop toggle, duty ratio, power limit, kp, ki (if closed loop is enabled), soft stop/start buttons, set parameters button.
Visual Progress Bars: Indicate voltage, current, and power with warnings for exceeding limits.
Outliers Page:

Display datapoints where power limit is exceeded or voltage is not within ±5% of 400V.
Toggle button for JSON or XLSX export.
Export buttons: All datapoints, outliers, PV curve.
Modes of Operations:

Mode 0: Open loop (set duty ratio from control panel).
Mode 1: Soft-start.
Mode 2: Soft-stop.
Mode 3: Closed loop.
Mode 5: Over-voltage protection (reduce voltage if it exceeds 420V even in open loop mode).
Normalized Voltage Gain:
Define normalized voltage gain as M = 2T/4, where T is the total number of components. The proposed RS-CBC achieves a normalized gain of 1.375, making it 37.5% more efficient in voltage boosting compared to conventional boost structures.

This improved structure aims to enhance clarity and make it easier to follow the details of the high gain DC-DC boost converter and its associated web application.
Input Current Formula:
The total input current (I_in) is given by the sum of individual inductor currents:
I_in = I_L1 + I_L2 + I_L3

Inductor Current Stress:

Inductor Current Stress:

L1  current stress: I_L1 * D
L2  current stress: I_L2 * D * (1-D)
L3  current stress: I_L3 * (1-D)^2
Voltage Stress Across Switches:

S1 voltage stress: VC1
S2 voltage stress: VC2
S3 voltage stress: VC3  130V at nominal condition 37% of output voltage

Diode Voltage Stress:

D1 voltage stress: Vin / (1-D)
D2 voltage stress: VC1 / (1-D)
D3 voltage stress: VC2 / (1-D)  260V at nominal conditions
D4 voltage stress: VC1 + VC2 + Vin  260V at nominal conditions
D5 voltage stress: V_out - VC1 + VC2 + Vin 260V at nominal conditions
Capacitor Voltage Formulas:

VC1 = Vin / (1-D)
VC2 = VC1 / (1-D)
VC3 = VC2 / (1-D)
VC4 = VC1 + VC2 + Vin
VC5 = V_out - VC1 + VC2 + Vin

Inductor current and capacitor current can be assumed constant and ripple
free
maximum input current is determined by maximum current at inductors
for example max input current is 20A with duty is 50% as IL1 will reach
10A
Sakthi Ram the creator of this app is a final year electrical engineering student 
at vit chennai with research experience in power electronics
having developed three novel power converters for high gain dc-dc applications

you can check out his github
https://github.com/sakthiram17

Frequently asked questions

what is the input current it draws under nominal conidtions?
ideally it should be drawing P/Iin = 150/18 but it draws around 9.5A with 85-90% efficiency
what is the safe duty ratio?
The converter is programmed to operate between 30-58% duty ratio but
the max safe duty ratio depends on input voltage such the output voltage is 
always below 450V










`;

const gptMessages = [{ role: "system", content: systemPrompt }];
let parameters = {
  ref_voltage: 350,
  power_limit: 150,
  duty_ratio: 30,
  kp: 10,
  ki: 1,
  mode: 0,
};

let webSocketDataDispatcher;

let buffer = "";
if(process.argv[2]!=='stand-alone')
{
  const parser = port.pipe(new createInterface({ input:port,delimiter: '\n' }));
}
let dataObject = {
  voltage: 0,
  current: 0,
  duty_ratio: 0,
  duty_ratio_2:null,
  duty_ratio_3:null,
  vin:0
};

const BASE_URL = " https://controlhub-881eb-default-rtdb.firebaseio.com/";
console.log(BASE_URL)
function sendDataToSTM32(data) {
  // Assuming 'data' is an object with properties corresponding to the struct entireData
  const buffer = Buffer.alloc(28); // Allocate a buffer of the appropriate size

  // Write each property to the buffer using the correct data type and offset
  buffer.writeFloatLE(data.ref_voltage, 0);
  buffer.writeFloatLE(data.power_limit, 4);
  buffer.writeFloatLE(data.duty_ratio, 8);
  buffer.writeFloatLE(data.kp, 12);
  buffer.writeFloatLE(data.mode, 16);
  buffer.writeFloatLE(data.ki, 20);
  buffer.writeFloatLE(data.ref_current, 24);
  // Send the binary data to the STM32
  port.write(buffer, (err) => {
    if (err) {
      console.error("Error writing to port:", err.message);
    } else {
    }
  });
}

if (arguments[2] !== "stand-alone") {
  const parser = port.pipe(
    new createInterface({ input: port, delimiter: "\n" })
  );
}

const dataDispatcher = (dataObject) => {
  if (
    dataObject &&
    dataObject.voltage &&
    dataObject.current &&
    dataObject.duty_ratio
  ) {
    dataObject.current_time = new Date();

    dataObject.duty_ratio = dataObject.duty_ratio / 100;
    dataObject.voltage = dataObject.voltage;
    dataObject.current = dataObject.current;

    axios
      .post(BASE_URL + "readings.json", dataObject)
      .then(() => {
        if (parameters.mode == 3) {
          setTimeout(() => {
            parameters.mode = 0;
          }, 100);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
  axios
    .patch(BASE_URL + "parameters.json", parameters)
    .then((res1) => {
      if (res1) {
        console.log("data sent");
      }
    })
    .catch((err) => {});
};

if (arguments[2] != "stand-alone") {
  setInterval(() => {
    sendDataToSTM32(parameters);
  }, 400);
}
if (arguments[2] != "stand-alone") {
  SerialPort.list().then((ports) => {
    ports.forEach((port) => {
      console.log(port.path);
    });
  });
  port.on("open", () => {
    console.log("Port opened successfully!!");
  });

  parser.on("data", (data) => {
    const sensorData = parseSensorData(data);
    if (sensorData) {
      
    }
  });
  port.on("data", (data) => {
    let result = parseSensorData(data);
    let voltage, current, duty_ratio,duty_ratio_2,duty_ratio_3,vin;
    if (result) {
      voltage = result.voltage;
      current = result.current;
      duty_ratio = result.duty_ratio;
      duty_ratio_2 = result.duty_ratio_2;
      duty_ratio_3 = result.duty_ratio_3;
      vin = result.vin;

      if (result.mode === 3) {
        parameters.mode = 0;
      }
    }

    let sensorData = {
      voltage: voltage,
      current: current,
      duty_ratio: duty_ratio,
      duty_ratio_2:duty_ratio_2,
      duty_ratio_3:duty_ratio_3,
      vin : vin
    };

    if (sensorData && !isNaN(sensorData.voltage)) {
      dataObject = { ...sensorData };
    }


  });
}

const parseSensorData = (data) => {
  // Convert the binary data into a SensorData object
  const buffer = Buffer.from(data, "hex");
  // Assuming the binary data is transmitted in hex format

  if (buffer.length === 40) {
    const data = {
      voltage: buffer.readFloatLE(0),
      current: buffer.readFloatLE(4),
      set_duty: buffer.readFloatLE(8),
      ref_voltage: buffer.readFloatLE(12),
      duty_ratio: buffer.readFloatLE(16),
      mode: buffer.readFloatLE(20),
      kp: buffer.readFloatLE(24),
      power_limit: buffer.readFloatLE(28),
      ki:buffer.readFloatLE(32),
      ref_current:buffer.readFloatLE(36),
    };
    return data;
  } else {
    // Handle the case when the buffer is too small

    return null;
  }
};

const app = express();
const express_port = 5000;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());

app.get("/sensor-data", (req, res) => {
  dataObject.voltage = Math.random() * 20 + 400;
  dataObject.current = Math.random() * 100 + 200;
  dataObject.duty_ratio = 50;
  dataObject.duty_ratio_1 = 48;
  dataObject.duty_ratio_2 = 45;
  dataObject.vin = Math.random()*2+18;
  dataObject.current_time = new Date();
  res.json({ dataObject });
});

app.get("/soft-start", (req, res) => {
  res.send({ message: "done" });
  parameters.mode = 3;
});
app.get("/soft-stop", (req, res) => {
  res.send({ message: "done" });
  parameters.mode = 2;
});

setInterval(() => {
  axios
    .patch(BASE_URL + "parameters.json", parameters)
    .then((res1) => {
      if (res1) {
        console.log("data sent");
      }
    })
    .catch((err) => {});
}, 1000);

app.post("/parameters", (req, res) => {
  const data = req.body;
  console.log(data);
  if (data) {
    parameters.ref_voltage = parseFloat(data.ref_voltage);
    parameters.power_limit = parseFloat(data.power_limit);
    parameters.duty_ratio = parseFloat(data.duty_ratio);
    parameters.kp = parseFloat(data.kp);
    parameters.ki = parseFloat(data.kp);
    parameters.mode = data.mode;
    parameters.ref_current = parseFloat(data.ref_current);

    axios
      .patch(BASE_URL + "parameters.json", parameters)
      .then((res1) => {
        if (res1) {
          console.log("data sent");
        }
      })
      .catch((err) => {});

    res.status(200).send({ message: "done" });
  } else {
    res.status(404).send({ message: "Parameters not within Range" });
  }
});

resolution = 200;
const connectedClients = [];
wss.on("connection", (socket) => {
  console.log("A user connected");
  clearInterval(webSocketDataDispatcher);
  connectedClients.push(socket);
  webSocketDataDispatcher = setupWebSocketDataDispatcher(socket);
  client = socket;

  socket.on("close", (code, reason) => {
    console.log("User disconnected:", reason);
    const index = connectedClients.indexOf(socket);
    if (index !== -1) {
      connectedClients.splice(index, 1);
    }
    clearInterval(webSocketDataDispatcher);
  });
});

app.post("/resolution", (req, res) => {
  let r = req.body;
 
  if (r.resolution <= 1000 && r.resolution >= 1) {
    clearInterval(webSocketDataDispatcher);

    // Update resolution
    resolution = r.resolution;

    // Set up a new interval
    webSocketDataDispatcher = setupWebSocketDataDispatcher(client);
    res.status(200).send({ message: "done" });
  }
  else{
    res.status(200).send({ message: "Resolution must be integer and must be between 1ms and 1s" });
  }


});

app.post("/prompt", (req, res) => {
  let r = req.body;

  sendQuery(r.prompt)
    .then((result) => {
      if (typeof result === "string") res.status(200).send({ message: result });
      else {
        res.status(200).send({ message: "Something Went Wrong" });
      }
    })
    .catch((err) => {
      res.status(200).send({ message: "cant reach kara right now" });
    });
});

const filePath = "data.txt";

function setupWebSocketDataDispatcher(socket) {
  return setInterval(() => {
    dataObject.current_time = new Date();

    let newDataString = JSON.stringify(dataObject, null, 2);
    newDataString = newDataString.trim();

    if (process.argv[2] == "stand-alone") {
      dataObject.voltage = Math.random() * 100 + 280;
      dataObject.current = Math.random() * 100 + 300;
      dataObject.duty_ratio = 50;
      dataObject.duty_ratio_2 = 70;
      dataObject.duty_ratio_3 = 85;
      dataObject.vin = Math.random()*2+18;
      dataObject.current_time = new Date();
    }

    if (!fs.existsSync(filePath)) {
      // If the file doesn't exist, create it and write the data
      fs.writeFile(filePath, newDataString + "^", (err) => {
        if (err) {
          console.error("Error creating and writing data:", err);
        } else {
          console.log("File created and data written successfully!");
        }
      });
    } else {
      // If the file exists, append the data

      fs.appendFile(filePath, newDataString + "^", (err) => {
        if (err) {
          console.error("Error appending data:", err);
        } else {
          console.log("Data appended successfully!");
          
        }
      });
    }
    connectedClients.forEach((client) => {
      client.send(JSON.stringify(dataObject));
    });
  }, resolution);
}

server.listen(8080, () => {
  console.log("WebSocket server listening on port 8080");
});

const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI(process.env.OPENAI_API_KEY);
async function sendQuery(prompt) {
  gptMessages.push({ role: "user", content: prompt });
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: gptMessages,
    });

    const assistantReply = response;
    console.log(assistantReply.choices[0].message.content);
    gptMessages.push({
      role: "assistant",
      content: assistantReply.choices[0].message.content,
    });
    return assistantReply.choices[0].message.content;
  } catch (error) {
    console.error("Error making API call:", error);
  }
}

app.listen(express_port);
