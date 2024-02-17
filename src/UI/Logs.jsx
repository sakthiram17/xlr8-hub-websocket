import { useEffect,useState } from "react"
import { useDataContext } from "../dataContext.jsx"
import Log from "./Log";
import "./Logs.css"
import * as XLSX from "xlsx"
import Button from "./Button.jsx";

import ToggleButton from "../Pages/ToggleButton";
const Logs = ()=>{
    const {dataPoints,dispatch} = useDataContext();
    const [json,setJson] = useState(false);
    const [fileteredData,setFilteredData] = useState([]);
    const switchHandler = (event) =>
    {
        setJson(event.target.checked)
    }
    let logs = dataPoints.filter(ele=>{
        let outlier = false;
        if (ele.voltage>420 || ele.voltage<380)
        {
            outlier = true;
        }
        if(ele.current>=600)
        {
            outlier = true;
        }
        if(ele.current*ele.voltage/1000  >=220)
        {
            outlier = true;
        }
        return outlier == true;
    }).slice(0,40);

      

      // Function to handle the export button click
      const handleExportClick = () => {
        const startTime = new Date(dataPoints[0].current_time);
       const extractedData = dataPoints.map(({ current_time, voltage, current }) => ({
            time : (new Date(current_time).getTime() - startTime.getTime())/1000,
            voltage:voltage,
            power:current*voltage/1000
          }));
   
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        // Create a new worksheet
        const ws = XLSX.utils.json_to_sheet(extractedData);
        // Add the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        // Save the workbook as an Excel file
        XLSX.writeFile(wb, 'exported_data.xlsx');
      };
      
    const handleExportToJson = (action) => {
        let data;
        if(action.type === 'all')
        {
            data = dataPoints;
        }
        else{
            data = logs;
        }
        let blob;
        if(json)
        {
        const jsonData = JSON.stringify(data, null, 2);
         blob = new Blob([jsonData], { type: 'application/json' });
        
        }
        else{
            const wb = XLSX.utils.book_new();
            // Create a new worksheet
            const ws = XLSX.utils.json_to_sheet(dataPoints);
            // Add the worksheet to the workbook
            XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
            // Save the workbook as an Excel file
            XLSX.writeFile(wb, 'exported_data.xlsx');
        }

      };
      



        return(
            <div className = "logs">
            <table class="styled-table">
               <thead>
                <tr>
                    <th>Voltage</th>
                    <th>Current</th>
                    <th>Power</th>
                    <th>Date</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
            {logs.map((ele)=>{
                const dateObj = new Date(ele.current_time);
                const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getFullYear()}`;
                const formattedTime = `${dateObj.getHours()} : ${dateObj.getMinutes()} : ${dateObj.getSeconds()}`;
              return (
              <Log
              voltage = {ele.voltage?(ele.voltage/100)*100:0}
              current = {ele.current?ele.current.toFixed(2):null}
              power = {ele.voltage?((ele.voltage*ele.current)/1000).toFixed(2):null}
              duty_ratio = {ele.duty_ratio}
              date = {formattedDate}

              time = {formattedTime}

              key = {Math.random().toString(36).substring(2,7)}
              >
      
              </Log>)
            })}
            </tbody>
            </table>
            <div  style = { {display : "flex", justifyContent : "space-evenly"}}>
            <ToggleButton
            label = {json?"json":"xlsx"}
            autorefresh = {json}
            onChange = {switchHandler}
            >

            </ToggleButton>
            <Button onClick = {()=>{
                handleExportToJson({type:'false'})
            }}>Export Outliers</Button>
            <Button inverse= {true} onClick = {()=>{
                handleExportToJson({type : 'all'})
            }}>Export All data Points</Button>
            <Button onClick = {handleExportClick}>
                Export PV Curve
            </Button>
            </div>
            </div>
    
            
          
    )


}
export default Logs;
