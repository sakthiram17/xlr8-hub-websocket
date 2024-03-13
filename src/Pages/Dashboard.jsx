
import { useState, useReducer, useEffect } from "react";

import axios from "axios";
import React from "react";
import "./Elements.css";
import ToggleButton from "./ToggleButton.jsx";
import Input from "./Input.jsx";
import Button from "../UI/Button.jsx";
import { useDataContext } from "../dataContext.jsx";
import LoadingSpinner from "../UI/LoadingSpinner.jsx";
import Modal from "../UI/Modal.jsx";
import constants from "../Constants.jsx";
import { useControlContext } from "./controlContext.jsx";
import GraphContainer from "./GraphContainer.jsx";

const SERVER = constants.SERVER;
const BASE_URL = constants.SERVER;
const MAX_LENGTH = 750;
const brightColors = [
  "#FF6384", // Salmon Pink
  "#FFD700", // Gold
  "#32CD32", // Lime Green
  "#00BFFF", // Dodger Blue
  "#DA70D6", // Orchid
  "#FFA500", // Orange
  "#1E90FF",
];


const initialGraphRanges = [
  { min: 0, max: 600 },
  { min: 0, max: 1000 },
  { min: 0, max: 300 },
  { min: 0, max: 600 },
  { min: 0, max: 100 },
  { min: 0, max: 100 },
  { min: 0, max: 100 },
];function reduceArrayToFixedSize(dataArray, fixedSize) {
  // Step 1: Group data by time interval (e.g., hourly)
  const stepSize = Math.ceil(dataArray.length / fixedSize);
  let avgVoltage = 0;
  let avgCurrent = 0;
  let avgDutyRatio = 0;
  const reducedArray = [];
  const startTime = new Date(dataArray[0].current_time).getTime();
  for (var i = 0; i < dataArray.length; i++) {
    if (i % stepSize == 0) {
      let temp = { ...dataArray[i] };
      temp.time = new Date(dataArray[i].current_time).getTime() - startTime;
      temp.current = avgCurrent;
      temp.voltage = avgVoltage;
      temp.duty_ratio = avgDutyRatio;
      avgCurrent = avgDutyRatio = avgVoltage = 0;
      reducedArray.push(temp);
    } else {
      avgVoltage = avgVoltage + dataArray[i].voltage / stepSize;
      avgCurrent = avgCurrent + dataArray[i].current / stepSize;
      avgDutyRatio = avgDutyRatio + dataArray[i].duty_ratio / stepSize;
    }
  }



  return reducedArray;
}

const initialGraphHeights = [400, 400, 400, 400, 400, 400, 400];
const DashBoard = (props) => {
  const [spinner, setSpinner] = useState(null);
  const { dataPoints, dispatch } = useDataContext();
  const [fileteredData, setFilteredData] = useState([]);
  const [isValid, setValidity] = useState(true);
  const [isValid2, setValidity2] = useState(true);
  const [graphHeights, setGraphHeights] = useState(initialGraphHeights);
  const [graphRanges, setGraphRanges] = useState(initialGraphRanges);
  const [modalState, setModalState] = useState(null);
  const [width, getWidth] = useState(window.innerWidth);
  const [is_small, setIsSmall] = useState(false);
  const [small,setSmall] = useState(false);
  const [maxSamples,setMaxSamples]= useState(750);
  const { controlParameters, controlUpdates } = useControlContext();
  const duration = controlParameters.duration;
  const sampleSize = controlParameters.sampleSize;
  const autofresh = controlParameters.autofresh;
  useEffect(() => {
    window.addEventListener("resize", () => {
      getWidth(window.innerWidth);
      if (width >= 768) {
        setIsSmall(false);
      } else {
        setIsSmall(true);
      }
    });
  }, [width, getWidth]);

  const toggleButtonHandler = (isChecked) => {
    controlUpdates({ type: 'update', data: { ...controlParameters, autofresh: isChecked } });
  };
  const disableKnobsHandler = (event) => {
    setSmall(event);
  };
  const handleMaxSampleChange = (event)=>{
    setMaxSamples(event.target.value);
  }

  const turnOffSpinner = () => {
    setTimeout(() => {
      setSpinner(null);
    }, 100);
  };
  const turnOnSpinner = () => {
    setSpinner(<LoadingSpinner asOverlay={true}></LoadingSpinner>);
  };
  const showErrorModal = async (code, message,disabled = false) => {
    setModalState(<Modal code={code} disabled={disabled}> {message}</Modal>);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };
  const handleModalTimeout = async (code,message) => {
    await showErrorModal(code, message,true);
    await showErrorModal(code,message);
    await showErrorModal(code, message,true);
    setModalState(null)
    setSpinner(null)
  };
  const postResolution = () => {
    turnOnSpinner();
    setTimeout(() => {
      turnOffSpinner();
    }, 2000);

    axios
      .post(SERVER + "resolution", {
        resolution: sampleSize,
      })
      .then((res) => {
        if (res && res.data) {
          if (res.data.message === "done") {
            handleModalTimeout("success","Successfully updated parameters")
          
          }
          else {
            console.log(res.data)
            handleModalTimeout("error",res.data.message)
          }
        } 
      })
      .catch((ele) => {
        handleModalTimeout("error","something went wrong")
      });
  };

  const durationChangeHandler = (event) => {
    setValidity(event.target.value > 0);
    if (event.target.value > 0) {
      let prev = { ...controlParameters };
      console.log(prev);
      prev.duration = event.target.value;
      controlUpdates({ type: "update", data: prev });
    }
  };

  const handleZoomChange = (index, value, mod) => {
    const newGraphRanges = [...graphRanges];
    if (mod == "max") {
      newGraphRanges[index] = { ...newGraphRanges[index], max: value };
    } else {
      newGraphRanges[index] = { ...newGraphRanges[index], min: value };
    }

    setGraphRanges(newGraphRanges);
  };

  const handleSampleSizeChange = (event) => {
    let prev = { ...controlParameters };
    prev.sampleSize = event.target.value;
    controlUpdates({ type: "update", data: prev });
    setValidity2(event.target.value >= 1);
  };
  const handleSliderChange = (index, value) => {
    const newGraphHeights = [...graphHeights];
    newGraphHeights[index] = value;
    setGraphHeights(newGraphHeights);
  };

  let startingPoint;
  useEffect(() => {
    setFilteredData((prev) => {
      let temp = [];

      // temp = dataPoints.filter(ele=>{
      // //   return  new Date(ele.current_time).getTime() <= (new Date(dataPoints[dataPoints.length - 1].current_time).getTime() - duration*1000)
      // // })
      temp = dataPoints;
      if (temp.length >= 1) {
        temp = temp.slice(temp.length - duration, temp.length);
        if (temp.length >= 1 && temp.length) {
          const startTime = new Date(temp[0].current_time).getTime();

          for (let i = 0; i < temp.length; i++) {
            const currentTime = new Date(temp[i].current_time).getTime();
            temp[i].time = currentTime - startTime;
          }
          temp[0].time = 0;
        }
        let averagedData;
        if (duration > maxSamples) {
          averagedData = [...reduceArrayToFixedSize(temp, maxSamples)];
          return averagedData;
        }
      }
      return temp;
    });
  }, [dataPoints, duration]);

  let chartData;
  if (fileteredData && fileteredData.length >= 1) {
    chartData = fileteredData.map((ele) => {
      return {
        name: ele.time,
        current: ele.current,
        voltage: ele.voltage,
        amt: ele.voltage,
      };
    });
  }

  return (
    <div className="Dashboard-Page">
      {spinner}
      <div
  
        style={{
          display: "flex",
          flexFlow: "row",
          justifyContent: "center",
          alignItems: "center",
          flexWrap:'wrap'
        }}
      >
   
      <div className="data-card">
        <div className="generic-text-label">Resolution : {sampleSize} ms</div>
        <div className="generic-text-label">DataPoints : {duration}</div>
        {duration > maxSamples ? (
          <div className="generic-text-label">
            Data Compression on
            <br></br>
            Ratio : {Math.ceil(duration / maxSamples)}
          </div>
        ) : null}
      </div>
      <div
        style={{
          display: "flex",
          flexFlow: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
        className="data-card"
      >
        <ToggleButton
          label="AutoRefresh"
          autorefresh={autofresh}
          onChange={toggleButtonHandler}
        ></ToggleButton>
        <Input
          type="number"
          label={`No of Samples (${sampleSize} ms each)`}
          place="Title "
          valid={isValid}
          ind={0}
          handleChange={durationChangeHandler}
          value={controlParameters.duration}
        ></Input>

        <Input
          type="number"
          label="Resolution"
          place="Title "
          valid={isValid2}
          ind={1}
          handleChange={handleSampleSizeChange}
          value={controlParameters.sampleSize}
        ></Input>
        <Input
          type="number"
          label="Maximum DataPoints Before Compression"
          place="Title "
          valid={isValid2}
          ind={2}
          handleChange={handleMaxSampleChange}
          value={maxSamples}
        ></Input>


        <Button onClick={postResolution}>Set Resolution</Button>
        {modalState}
      </div>
      </div>

      <div>
        <h1>Performance Parameters </h1>
      </div>

      <div></div>
      <ToggleButton
        label="Disable Knobs"
        autofresh={is_small}
        onChange={disableKnobsHandler}
      ></ToggleButton>
      <GraphContainer
        handleSliderChange={handleSliderChange}
        handleZoomChange={handleZoomChange}
        is_small={is_small||small}
        data={fileteredData.map((ele) => {
          return {
            name: ele.time,
            voltage: ele.voltage,
          };
        })}
        color="red"
        graphHeight={graphHeights[0]}
        graphRange={graphRanges[0]}
        Color={brightColors[0]}
        yLabel={"Voltage"}
        unit="V"
        index={0}
        dataKey={"voltage"}
      ></GraphContainer>
      <GraphContainer
        handleSliderChange={handleSliderChange}
        handleZoomChange={handleZoomChange}
        is_small={is_small||small}
        data={fileteredData.map((ele) => {
          return {
            name: ele.time,
            current: ele.current,
          };
        })}
        graphHeight={graphHeights[1]}
        graphRange={graphRanges[1]}
        Color={brightColors[1]}
        yLabel={"Load Current"}
        unit="mA"
        index={1}
        dataKey={"current"}
      ></GraphContainer>
      <GraphContainer
        handleSliderChange={handleSliderChange}
        handleZoomChange={handleZoomChange}
        is_small={is_small||small}
        data={fileteredData.map((ele) => {
          return {
            name: ele.time,
            power: (ele.current * ele.voltage) / 1000,
          };
        })}
        graphHeight={graphHeights[2]}
        graphRange={graphRanges[2]}
        Color={brightColors[2]}
        yLabel={"Power"}
        unit="W"
        index={2}
        dataKey={"power"}
      ></GraphContainer>
      <GraphContainer
        handleSliderChange={handleSliderChange}
        handleZoomChange={handleZoomChange}
        is_small={is_small||small}
        data={fileteredData
          .map((ele) => {
            return {
              voltage: ele.voltage,
              name: ((ele.current * ele.voltage) / 1000).toFixed(2),
            };
          })
          .sort((a, b) => {
            return a.name - b.name;
          })}
        graphHeight={graphHeights[3]}
        graphRange={graphRanges[3]}
        Color={brightColors[3]}
        yLabel={"Power - Voltage Curve"}
        unit="W"
        type="PV"
        dataKey={"voltage"}
        index={3}
      ></GraphContainer>

      <div>
        <h1>Gating Pulses</h1>
      </div>
      <GraphContainer
        handleSliderChange={handleSliderChange}
        handleZoomChange={handleZoomChange}
        is_small={is_small||small}
        data={fileteredData.map((ele) => {
          return {
            name: ele.time,
            duty: ele.duty_ratio,
          };
        })}
        graphHeight={graphHeights[4]}
        graphRange={graphRanges[4]}
        Color={brightColors[4]}
        yLabel={"Switch S\u2081"}
        unit="%"
        index={4}
        dataKey={"duty"}
      ></GraphContainer>
      <GraphContainer
        handleSliderChange={handleSliderChange}
        handleZoomChange={handleZoomChange}
        is_small={is_small||small}
        data={fileteredData.map((ele) => {
          return {
            name: ele.time,
            duty: ele.duty_ratio,
          };
        })}
        graphHeight={graphHeights[5]}
        graphRange={graphRanges[5]}
        Color={brightColors[5]}
        yLabel={"Switch S\u2082"}
        unit="%"
        dataKey={"duty"}
        index={5}
      ></GraphContainer>
      <GraphContainer
        handleSliderChange={handleSliderChange}
        handleZoomChange={handleZoomChange}
        is_small={is_small||small}
        data={fileteredData.map((ele) => {
          return {
            name: ele.time,
            duty: ele.duty_ratio,
          };
        })}
        graphHeight={graphHeights[6]}
        graphRange={graphRanges[6]}
        Color={brightColors[6]}
        yLabel={"Switch S\u2083"}
        unit="%"
        index={6}
        dataKey={"duty"}
      ></GraphContainer>
    </div>
  );
};
export default DashBoard;
