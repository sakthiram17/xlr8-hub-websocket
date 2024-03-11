import { useEffect, useState, useReducer } from "react";
import RectangularBar from "../UI/RectangularBar.jsx";
import Card from "../UI/Card.jsx";
import Guage from "../UI/Guage.jsx";
import { useDataContext } from "../dataContext.jsx";
import "./ControlPanel.css";
import ToggleButton from "./ToggleButton.jsx";
import Input from "./Input.jsx";
import React from "react";
import Button from "../UI/Button.jsx";
import axios from "axios";
import LoadingSpinner from "../UI/LoadingSpinner.jsx";
import Modal from "../UI/Modal.jsx";
import constants from "../Constants.jsx";
const BASE_URL = constants.FIREBASE;
const SERVER = constants.SERVER;
const ControlPanel = () => {
  const { dataPoints, dispatch } = useDataContext();
  const [closedLoop, setClosedLoop] = useState(false);
  const [modalState, setModalState] = useState(null);
  const [spinner, setSpinner] = useState(null);
  const [currentParamters, setCurrentParameters] = useState({});
  const [formData, setFormData] = useState([400, 150, 50, 8, 3]);
  const [isValid, setValidity] = useState([true, true, true, true, true]);
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
  let voltage = dataPoints.length && dataPoints[dataPoints.length - 1].voltage;
  let current = dataPoints.length && dataPoints[dataPoints.length - 1].current;
  let power = (voltage * current) / 1000;
  const onChangeHandler = (event) => {
    setClosedLoop(event.target.checked);
  };
  const formChangeHandler = (event) => {
    let index = event.target.getAttribute("index");
    let temp = [...formData];
    temp[index] = event.target.value;
    let tempV = [...isValid];
    tempV[index] = event.target.value > 0 ? true : false;
    if (index == 0) {
      let voltage = event.target.value;
      tempV[0] = true;
      if (voltage >= 420) {
        tempV[0] = false;
      }
      temp[0] = voltage;
    }
    if (index == 1) {
      let power = event.target.value;
      tempV[1] = true;
      if (power >= 225) {
        tempV[1] = false;
      }
      temp[1] = power;
    }
    if (index == 2) {
      tempV[2] = true;
      let duty = event.target.value;
      if (duty >= 60) {
        tempV[2] = false;
      }
      temp[2] = duty;
    }
    if (index == 3) {
      temp[3] = event.target.value;
    }

    setFormData(temp);
    setValidity(tempV);
  };
  const turnOffSpinner = () => {
    setTimeout(() => {
      setSpinner(null);
    }, 100);
  };
  const turnOnSpinner = () => {
    setSpinner(<LoadingSpinner asOverlay={true}></LoadingSpinner>);
  };
  const fetchData = async () => {
    let res;
    try {
      res = await axios.get(BASE_URL + "parameters.json?");
    } catch (err) {}
    return res;
  };
  const updateState = async () => {
    let res;
    try {
      res = await fetchData();

      if (res) {
        setCurrentParameters(res.data);
      }
    } catch (err) {}
  };
  useEffect(() => {
    setInterval(updateState, 500);
  }, []);


  return (
    <div className="control-page">
      {spinner}

      {currentParamters && (
        <div className="small-flex-box">
          <h2>Current Parameters</h2>
          <h3>Reference Voltage : {currentParamters.ref_voltage}V</h3>
          <h3>Duty Ratio : {currentParamters.duty_ratio}</h3>
          <h3>Power Limit :{currentParamters.power_limit}W </h3>
          <h3>
            {" "}
            K<sub>p</sub> : {currentParamters.kp}{" "}
          </h3>
          <h3>
            K<sub>i</sub> : {currentParamters.ki}{" "}
          </h3>
          {currentParamters.mode === 5 ? (
            <Modal code="error">OverVoltage Detected Manual Reset Needed</Modal>
          ) : null}
        </div>
      )}

      <div className="control-panel">
        <ToggleButton
          label="Closed Loop"
          onChange={onChangeHandler}
          autorefresh={closedLoop}
        ></ToggleButton>

        <Input
          type="number"
          label="Ref Voltage (V)  "
          place="Reference Voltage "
          ind={0}
          handleChange={formChangeHandler}
          value={formData[0]}
          valid={isValid[0]}
        ></Input>

        <Input
          type="number"
          label="Power Limit (W) "
          place="Reference Voltage "
          value={formData[1]}
          handleChange={formChangeHandler}
          ind={1}
          valid={isValid[1]}
        ></Input>
        {!closedLoop ? (
          <Input
            type="number"
            label="Duty Ratio "
            place="Duty Cycle "
            ind={2}
            value={formData[2]}
            handleChange={formChangeHandler}
            valid={isValid[2]}
          ></Input>
        ) : null}

        {closedLoop ? (
          <React.Fragment>
            <Input
              type="number"
              label="Proportinal Constant"
              valid={true}
              ind={3}
              value={formData[3]}
              handleChange={formChangeHandler}
            ></Input>
            <Input
              type="number"
              handleChange={formChangeHandler}
              ind={4}
              label="Integral Constant"
              valid={true}
              value = {formData[4]}
            ></Input>
          </React.Fragment>
        ) : null}
        {modalState}
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <Button
            onClick={() => {
              turnOnSpinner();
              axios
                .get(SERVER + "soft-stop")
                .then((res) => {
                  turnOffSpinner();
                  if (res && res.data) {
                    if (res.data.message === "done") {
                      handleModalTimeout("success","successfully stopped the converter")
                    }
                    else{
                      handleModalTimeout("error","could not stop converter")
                    }
                  } else {
                    handleModalTimeout("error","could not stop converter")
                  }
                })
                .catch((ele) => {
                  handleModalTimeout("error","no response from server")
                });
            }}
          >
            Soft Stop
          </Button>
          <Button
            disabled ={!(isValid[0] && isValid[1] &&isValid[2])}
            onClick={() => {
              turnOnSpinner();
              setTimeout(() => {
                turnOffSpinner();
              }, 2000);

              axios
                .post(SERVER + "parameters", {
                  ref_voltage: formData[0] || 300,
                  power_limit: formData[1] || 200,
                  duty_ratio: formData[2] || 30,
                  kp: formData[3],
                  mode: closedLoop ? 1 : 0,
                  ki: 0,
                })
                .then((res) => {
                  if (res && res.data) {
                    if (res.data.message === "done") {
                 
                        handleModalTimeout("success","successfully set parameters")
                      
                    }
                  } else {
                    handleModalTimeout("error","cannot not update parameters")
                  }
                })
                .catch((ele) => {
                  handleModalTimeout("error","No Response from server")
                });
            }}
            inverse={true}
          >
            Set Parameters
          </Button>
          <Button
            onClick={() => {
           
              turnOnSpinner();
              axios
                .get(SERVER + "soft-start")
                .then((res) => {
                  
                  if (res && res.data) {
                    if (res.data.message === "done") {
                      handleModalTimeout("success","successfully started the converter")
                    }
                    else{
                      handleModalTimeout("error","already started")
                    }
                  } else {
                    
                    handleModalTimeout("error","already started")
                  }
                })
                .catch((ele) => {
                  handleModalTimeout("error","No Response from server")
                });
            }}
          >
            Soft Start
          </Button>
        </div>
      </div>
      <div className="widgets-2">
      
        <Card
          header="Load Current"
          title="Current "
          danger={voltage >= 750}
          message={"current exceeds maximum limit"}
        >
          <Guage
            unit="mA"
            bg = "gold"
            max = "750"
            value={current ? parseFloat(current).toFixed(2) : 0}
          ></Guage>
        </Card>


        <Card
          header=" DC Bus Voltage "
          title="Voltage "
          danger={voltage >= 420 || voltage <= 380}
          message={"Voltage not within 95-105% of 400V"}
        >
          <Guage
            unit="V"
            max = "450"
            value={voltage ? parseFloat(voltage).toFixed(2) : 0}
          ></Guage>
        </Card>
        <Card
          header=" DC Power "
          title="Power "
          danger={power >= 200}
          message={"Power Limit exceded"}
        >
          <Guage
            unit="W"
            value={power ? power.toFixed(2) : null}
            type={true}
            max = "225"
          ></Guage>
        </Card>
      </div>
    </div>
  );
};
export default ControlPanel;
