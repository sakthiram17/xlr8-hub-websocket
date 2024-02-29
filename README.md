

# Xelerate-Hub a Remote real time Control System for DC-DC Converters

## Overview
This web application provides a sophisticated control interface for a groundbreaking DC-DC converter, specifically designed for high-voltage applications. The converter employs a novel two-stage approach, featuring a Reduced Stress Cubic Gain (RSCG) configuration in the first stage and a Voltage Multiplier Circuit (VMC) in the second stage. This unique combination ensures exceptional voltage amplification while minimizing stress on critical components, such as inductors.
## Features of RS-CBC
1. High Voltage Gain: The RS-CBC provides effective cubic voltage amplification, achieving a remarkable gain expressed as (4-3D+D^2)/(1 - D)^3, where D is the duty ratio.
2. Reduced Component Count: With only 16 components, the converter offers a compact and cost-effective solution for PV integration.
3. Stress Reduction: Operating in parallel during the RS-CBC stage reduces input current stress on inductors, minimizing losses and simplifying magnetic design.
4. Flexibility: The converter's gain can be adjusted to operated in a wide range of input thanks to its cubic voltage gain scaling.

## Key Features

### 1. Dashboard (Page 1)

- **Waveform Display:** Visualize 7 essential waveforms including voltage vs. time, current vs. time, power vs. time, PV-curve, and duty ratio of three power switches.

- **Real-Time Control:** Enable users to control the time interval at which data packets are sent from the WebSocket server.

- **Dynamic Data Points:** Adjust the number of data points in real-time, with automatic data compression kicking in after reaching a maximum of 750 points.

- **Auto-Refresh:** Implement an auto-refresh feature allowing users to pause or continue the reception of real-time data.

### 2. Data Hub (Page 2)

- **File Import:** Use a file picker to import data files, facilitating easy integration of external data sources.

- **Date Filtering:** Set start and end dates to precisely filter data within a specified time interval.

- **Data Export:** Buttons to export all data, outliers, or PV curve in JSON or XLSX format, enhancing data portability and analysis capabilities.

- **Data Visualization:** Display data points in a table with pagination, highlighting outliers that fall outside predefined voltage and current limits.

### 3. Control Panel (Page 3)

- **Control Modes:** Toggle between closed and open-loop control modes, providing flexibility based on user preferences.

- **Parameter Adjustment (Open Loop):** Input fields for reference voltage and duty ratio, allowing users to fine-tune parameters in open-loop mode.

- **Parameter Adjustment (Closed Loop):** Input fields for power limit, proportional (kp), and integral (ki) constants, providing comprehensive control in closed-loop mode.

- **Visual Representations:** Utilize gauge-type widgets with fluid animations to offer an intuitive and dynamic representation of voltage, current, and power data.

### 4. Guide Page

- **ChatGPT Integration:** Leverage the ChatGPT API to create a guide page that responds to user queries, offering assistance and guidance related to the project.

## Getting Started

1. **Clone the Repository:** Begin by cloning this repository to your local machine.

2. **Installing nodes js** : download and install the latest version of node                              js <br>

                                

3. **install vite:** npm create vite@latest

4. **Installing  dependencies** : open terminal and type npm install in the master folder as well as back-end folder to install all the necessary libraries for the server and web app
5. **Set up DataBase** : set the URL for your server and Firebase in the Constants.jsx folder by default the server runs at PORT 5000 the URL is "http://localhost:5000/"" and if you want local access within your network you can set it as "http://server-ip-address :5000/"" (you can find that out by using ipconfing command). Make sure to change the URL in websocketclient.jsx file as well.
6. **run the web application :** run the web application with the command npm run dev or npm run dev -- --host (for access within local network)
7. **Configure server** : create a .env in the same folder as server and set up OPEN_API_KEY and BASE_URL {url to firebase database} . Adjust COM Ports or UART configuration if necessary
8. **Start Server** : you can test the server with random data and without stm32 connected to the device using the command node app.js stand-alone . if you have stm connected then you using node app.js command.
9. **Set up the STM32** : set up STM32 with suitable timer configurations to generate the desired PWM in STM32 Cube IDE and use the main.c in stm-code folder.
10.  **Your Setup must be ready to go**

## Usage

- **Dashboard Navigation:** Visit the dashboard to monitor real-time waveforms and make adjustments to settings.

- **Data Hub Functionality:** Utilize the data hub to import, filter, and analyze data files seamlessly. Export data in JSON or XLSX format for further analysis.

- **Control Panel Configuration:** Configure the control panel to switch between closed and open-loop modes, adjusting relevant parameters as needed.

## Support and Contribution

For any issues, suggestions, or contributions, please feel free to open an issue or submit a pull request on the GitHub repository. Your input is highly valued, and we appreciate your interest in our high-gain DC-DC converter control web application!

---
