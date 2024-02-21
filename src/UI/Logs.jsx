import { useEffect,useState } from "react"
import { useDataContext } from "../dataContext.jsx"
import Log from "./Log";
import "./Logs.css"
import * as XLSX from "xlsx"
import Button from "./Button.jsx";

import ToggleButton from "../Pages/ToggleButton";
import Input from "../Pages/Input.jsx";

const Logs = ()=>{
    const {dataPoints,dispatch} = useDataContext();
    const [json,setJson] = useState(false);
    const [fileteredData,setFilteredData] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    
    const switchHandler = (event) =>
    {
        setJson(event.target.checked)
    }
    const handleDateChange = (event)=>{
        setDateObject(new Date(event.target.value))
      }
      const dataFilter = ()=>{
       
        dispatch({type : 'FILTER',date : dateObject})
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
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        console.log(event.target.files[0]);
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
              
              const lines = fileContents.split('^');
  
              // Parse each line as JSON
              
              parsedData = [];
              for(let i = 0;i<lines.length;i++)
              {
                
                try{
                  let dataPoint = JSON.parse(lines[i]);
                  parsedData.push(dataPoint)
                }
                catch(err)
                {
                console.log(err)
                }
              }
  
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
            console.log(parsedData)
            if(parsedData)
            {
              dispatch({type :'FETCH',data:parsedData})
            }
          }
        }
          
      };
      

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
        <div className="data-card">
        <span className="checkbox-label">
            Data Fetcher
        </span>
        <Input type = 'file'
         label = 'Import Data'
         handleChange = {handleFileChange}
         ></Input>
        <p className="generic-text-label">Start Time</p>
        <p className="generic-text-label">End Time</p>
        <input type = "datetime-local" onChange = {handleDateChange}>
        </input>
        <Button
        onClick = {dataFilter}
        >Filter by Time</Button>
        <p>Selected File : {selectedFile?selectedFile.name:'--'}</p>
        </div>

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
