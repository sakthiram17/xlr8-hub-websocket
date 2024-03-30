import { useEffect, useState } from "react";
import { useDataContext } from "../dataContext.jsx";
import Log from "./Log";
import "./Logs.css";
import * as XLSX from "xlsx";
import Button from "./Button.jsx";
import Modal from "./Modal.jsx";
import ToggleButton from "../Pages/ToggleButton";
import Input from "../Pages/Input.jsx";
import { useControlContext } from "../Pages/controlContext.jsx";
const TABLE_LENGTH = 20;

const Logs = () => {
  const SECTION_SIZE = 8;
  const { dataPoints, dispatch } = useDataContext();
  const [json, setJson] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isOutliersOnly, setOutliersOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSection, setCurrentSection] = useState(1);
  const [isValid, setValidity] = useState(true);
  const [filterZeros, setFilterZeros] = useState(false);
  const { controlParameters, controlUpdates } = useControlContext();
  const [errorModal, setErrorModal] = useState(null);
  const [disabletable,setDisabletable]= useState('disabled-anim')
  const [disabledClass,setDisabledClass] = useState('disabled-anim')
  const switchHandler = (event) => {
    setJson(event.target.checked);
  };
  const DateToString =(date)=>
  {
    let dateTime = new Date(date);
    const year = dateTime.getFullYear();
    const month = String(dateTime.getMonth() + 1).padStart(2, "0"); // Month starts from 0
    const day = String(dateTime.getDate()).padStart(2, "0");
    const hours = String(dateTime.getHours()).padStart(2, "0");
    const minutes = String(dateTime.getMinutes()).padStart(2, "0");

    // Construct the formatted date string
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    return formattedDateTime;
  }

  const filterZerosHandler = (event) => {
    setFilterZeros(event);
  };
  const dataPointsSwitchHandler = (event) => {
    setOutliersOnly(event.target.checked);
  };
  const handleDateChange = (event) => {
    setStartDate(new Date(event.target.value));
    localStorage.setItem("start-date", JSON.stringify(event.target.value));
  };
  const handleEndDateChange = (event) => {
    setEndDate(new Date(event.target.value));
    localStorage.setItem("end-date", JSON.stringify(event.target.value));
  };
  const dataFilter = () => {
    if (startDate && endDate) {
      dispatch({ type: "FILTER", startDate: startDate, endDate: endDate });
      if (filterZeros) {
        dispatch({ type: "ZERO-FILTER" });
      }
    } else {
      setErrorModal(
        <Modal code="error" disabled={true}>
          {" "}
          Please Select Valid Start and End Time
        </Modal>
      );
      setTimeout(() => {
        setErrorModal(
          <Modal code="error"> Please Select Valid Start and End Time</Modal>
        );
        setTimeout(() => {
          setErrorModal(
            <Modal code="error" disabled={true}>
              {" "}
              Please Select Valid Start and End Time
            </Modal>
          );
          setTimeout(() => {
            setErrorModal(null);
          }, 500);
        }, 500);
      }, 500);
    }
  };
  let logs = dataPoints.filter((ele) => {
    let outlier = false;
    if (ele.voltage > 420 || ele.voltage < 380) {
      outlier = true;
    }
    if (ele.current >= 600) {
      outlier = true;
    }
    if ((ele.current * ele.voltage) / 1000 >= 220) {
      outlier = true;
    }
    return outlier == true;
  });

  if (!isOutliersOnly) {
    logs = dataPoints;
  }
  let filteredLogs = logs.slice(
    (currentPage - 1) * TABLE_LENGTH,
    currentPage * TABLE_LENGTH
  );
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = (e) => {
        let parsedData;
        // The result property contains the file's contents as a data URL
        const fileContents = e.target.result;

        try {
          // Adding Square Brackets to make it a array

          const lines = fileContents.split("^");

          // Parse each line as JSON

          parsedData = [];
          for (let i = 0; i < lines.length; i++) {
            try {
              let dataPoint = JSON.parse(lines[i]);
              parsedData.push(dataPoint);
            } catch (err) {
              console.log(err);
            }
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
        if (parsedData) {
          dispatch({ type: "FETCH", data: parsedData });
        }
      };
    }
    setTimeout(() => {
      setSelectedFile(null);
    }, 1000);
  };

  // Function to handle the export button click
  const handleExportClick = () => {
    const startTime = new Date(dataPoints[0].current_time);
    const extractedData = dataPoints.map(
      ({ current_time, voltage, current }) => ({
        time: (new Date(current_time).getTime() - startTime.getTime()) / 1000,
        voltage: voltage,
        power: (current * voltage) / 1000,
      })
    );

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    // Create a new worksheet
    const ws = XLSX.utils.json_to_sheet(extractedData);
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    // Save the workbook as an Excel file
    XLSX.writeFile(wb, "exported_data.xlsx");
  };

  const handleExportToJson = (action) => {
    let data;
    if (action.type === "all") {
      data = dataPoints;
    } else {
      data = logs;
    }
    const startTime = new Date(dataPoints[0].current_time).getTime();
    const extractedData = data.map((ele) => {
      let temp = { ...ele };
      temp.time = (new Date(ele.current_time).getTime() - startTime) / 1000;
      return temp;
    });
    let blob;
    if (json) {
      const jsonData = JSON.stringify(extractedData, null, 2);
      blob = new Blob([jsonData], { type: "application/json" });
    } else {
      const wb = XLSX.utils.book_new();
      // Create a new worksheet
      const ws = XLSX.utils.json_to_sheet(extractedData);
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      // Save the workbook as an Excel file
      XLSX.writeFile(wb, "exported_data.xlsx");
    }
  };
  let pageCrumbs = [
    <Button
      onClick={() => {
        if (currentSection > 1) {
          setCurrentSection((prev) => {
            return prev - 1;
          });
        }
      }}
    >
      Prev
    </Button>,
    <Button
      onClick={() => {
        if (currentSection > 10) {
          setCurrentSection((prev) => {
            return prev - 10;
          });
        }
      }}
    >
      {"<<"}
    </Button>,
  ];
  let maxVal =
    ((currentSection + 1) * SECTION_SIZE) % (logs.length / TABLE_LENGTH);

  for (
    let i = (currentSection - 1) * SECTION_SIZE;
    i < currentSection * SECTION_SIZE;
    i++
  ) {
    pageCrumbs.push(
      <li
        onClick={() => {
          setCurrentPage(i + 1);
        }}
        className={currentPage == i + 1 ? "active" : "crumb"}
      >
        {i + 1}
      </li>
    );
  }
  pageCrumbs.push(
    <Button
      onClick={() => {
        if (
          Math.floor(logs.length / TABLE_LENGTH) >
          currentSection * SECTION_SIZE + 10
        ) {
          setCurrentSection((prev) => {
            return prev + 10;
          });
        }
      }}
    >
      {">>"}
    </Button>
  );
  pageCrumbs.push(
    <Button
      onClick={() => {
        if (currentSection * SECTION_SIZE <= logs.length / TABLE_LENGTH) {
          setCurrentSection((prev) => {
            return prev + 1;
          });
        }
      }}
    >
      Next
    </Button>
  );
  useEffect(() => {
    let startDa = JSON.parse(localStorage.getItem("start-date"));
    let endDa = JSON.parse(localStorage.getItem("end-date"));
    setStartDate(new Date(startDa));
    setEndDate(new Date(endDa));
    if (endDate) {
      console.log(DateToString(endDa));
    }
  }, []);
  useEffect(()=>{
    setTimeout(()=>{
      setDisabledClass('enabled-anim')
      setDisabletable('enabled-anim')
    },100)
  })
  useEffect(()=>{
    setDisabletable('disabled-anim')
    setTimeout(()=>{
      setDisabletable('enabled-anim')
    },100)

  },[currentPage])

  return (
    <div className={"logs "+disabledClass}>
      <div className={"data-card "+disabledClass}>
        <span className="checkbox-label">Data Fetcher</span>
        <Input
          type="file"
          label="Import Data"
          handleChange={handleFileChange}
        ></Input>

        <p className="generic-text-label">Start Time</p>
        <input
          type="datetime-local"
          onChange={handleDateChange}
          style={{ margin: "1rem" }}
          value={startDate ? DateToString(startDate) : null}
        ></input>
        <p className="generic-text-label">End Time</p>
        <input
          type="datetime-local"
          onChange={handleEndDateChange}
          style={{ margin: "1rem" }}
          value={endDate ? DateToString(endDate) : null}
        ></input>
        <ToggleButton
          label="Filter Zeros at End"
          autorefresh={filterZeros}
          onChange={filterZerosHandler}
        ></ToggleButton>
        {errorModal}
        <Button onClick={dataFilter}>Filter by Time</Button>
        <p>Selected File : {selectedFile ? selectedFile.name : "--"}</p>
        <p>Total Data Points : {dataPoints.length}</p>
        <p>Total Pages : {Math.ceil(logs.length / TABLE_LENGTH)}</p>
      </div>

      <h1>Data Points in Tabular Form</h1>
      <ToggleButton
        label={isOutliersOnly ? "Outliers" : "Entire Data"}
        autorefresh={isOutliersOnly}
        onChange={dataPointsSwitchHandler}
      ></ToggleButton>
      <table class={"styled-table " +disabletable}>
        <thead>
          <tr>
            <th>Voltage</th>
            <th>Current</th>
            <th>Input Voltage</th>
            <th>Power</th>
            <th>Date</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((ele) => {
            const dateObj = new Date(ele.current_time);
            const formattedDate = `${dateObj
              .getDate()
              .toString()
              .padStart(2, "0")}-${(dateObj.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${dateObj.getFullYear()}`;
            const formattedTime = `${dateObj.getHours()} : ${dateObj.getMinutes()} : ${dateObj.getSeconds()}`;
            return (
              <Log
                voltage={ele.voltage ? parseFloat(ele.voltage).toFixed(2) : 0}
                current={ele.current ? ele.current.toFixed(2) : null}
                power={
                  ele.voltage
                    ? parseFloat((ele.voltage * ele.current) / 1000).toFixed(2)
                    : null
                }
                duty_ratio={ele.duty_ratio}
                date={formattedDate}
                time={formattedTime}
                vin = {ele.vin?parseFloat(ele.vin).toFixed(2):0}
                key={Math.random().toString(36).substring(2, 7)}
              ></Log>
            );
          })}
        </tbody>
      </table>
      <ul className={"page-crumbs "+disabledClass}>
        {pageCrumbs}
        <Input
          type="number"
          label="Manually Select Page"
          valid={true}
          handleChange={(event) => {
            const pageNo = event.target.value;

            if (pageNo <= logs.length) {
              if (pageNo < SECTION_SIZE) {
                setCurrentPage(pageNo);
                setCurrentSection(1);
              } else {
                setCurrentPage(event.target.value);
                setCurrentSection(Math.ceil(event.target.value / SECTION_SIZE));
              }
            }
          }}
        ></Input>
      </ul>

      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          marginBottom: "5rem",
          width: "min(95vw,1200px)",
        }}
        className={disabledClass}
      >
        <ToggleButton
          label={json ? "json" : "xlsx"}
          autorefresh={json}
          onChange={switchHandler}
        ></ToggleButton>
        <Button
          onClick={() => {
            handleExportToJson({ type: "false" });
          }}
        >
          Export Outliers
        </Button>
        <Button
          inverse={true}
          onClick={() => {
            handleExportToJson({ type: "all" });
          }}
        >
          Export All data Points
        </Button>
        <Button onClick={handleExportClick}>Export PV Curve</Button>
      </div>
    </div>
  );
};
export default Logs;
