import { LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer ,Brush} from "recharts";
import {useState,useReducer,useEffect} from "react"
import { createContext,useContext } from "react";
import axios from "axios";
import React from "react";
import "./Elements.css"
import ToggleButton from "./ToggleButton.jsx";
import Input from "./Input.jsx";
import Card from "../UI/Card.jsx"
import Button from "../UI/Button.jsx";
import { useDataContext } from "../dataContext.jsx";
import WebSocketClient from './WebSocketClient.jsx';
import LoadingSpinner from "../UI/LoadingSpinner.jsx";
import dp from "../UI/dp.jpg"
import Modal from "../UI/Modal.jsx"
import WordAnimation from "./WordAnimation.jsx";
import EquationParser from "./EquationsParser.jsx";
import constants from "../Constants.jsx";

const SERVER = constants.SERVER;
const BASE_URL = constants.SERVER;
const lineWidth = 2;

const brightColors = [
  '#FF6384', // Salmon Pink
  '#FFD700', // Gold
  '#32CD32', // Lime Green
  '#00BFFF', // Dodger Blue
  '#DA70D6', // Orchid
  '#FFA500'  // Orange
  ,  '#1E90FF'
];

function formatTimeUnits(value) {
  if (value < 1000) {
    return value + 'ms';
  } else if (value < 60000) {
    return (value / 1000).toFixed(2) + 's';
  } else {
    return (value / 60000).toFixed(2) + 'min';
  }
}

function reduceArrayToFixedSize(originalArray, fixedSize) {
  // Step 1: Group data by time interval (e.g., hourly)

  const groupedData = originalArray.reduce((accumulator, current) => {
    const key = current.current_time;
    /* Calculate the grouping key based on current.current_time */;
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(current);
    return accumulator;
  }, {});

  // Step 2: Calculate the average for each group
  const averagedData = Object.keys(groupedData).map((key) => {
    const group = groupedData[key];
    const totalVoltage = group.reduce((sum, data) => sum + data.voltage, 0);
    const totalCurrent = group.reduce((sum, data) => sum + data.current, 0);
    const totalDutyRaio = group.reduce((sum, data) => sum + data.duty_ratio, 0);

    const averageVoltage = totalVoltage / group.length;
    const averageCurrent = totalCurrent / group.length;
    const avgDuty = totalDutyRaio/group.length;
 
    return {
      current_time: key,
      voltage : averageVoltage,
      current: averageCurrent,
      duty_ratio:avgDuty
    };
  });

  // Step 3: Create a new array with the reduced size (500)
  const step = Math.ceil(averagedData.length / fixedSize);
  const reducedArray = [];
  for (let i = 0; i < averagedData.length; i += step) {
    reducedArray.push(averagedData[i]);
  }

  

  return reducedArray;
 
}








  const initialGraphRanges = [
    { min: 0, max: 600 },
    { min: 0, max: 1000 },
    { min: 0, max: 300 },
    { min: 0, max: 600 },
    { min: 0, max: 100 },
    { min: 0, max: 100 },
    { min: 0, max: 100 },
  ];

const initialGraphHeights = [400, 400, 400, 400, 400, 400,400];
const DashBoard = (props)=>{
    const [spinner,setSpinner ] = useState(null)
    const {dataPoints,dispatch} = useDataContext();
    const [fileteredData,setFilteredData ] = useState([]);
    const [duration,setDuration] = useState(500);
    const [autofresh,setAutoRefresh] = useState(false);
    const [isValid,setValidity] = useState(true);
    const [isValid2,setValidity2] = useState(true)
    const [sampleSize,setSampleSize] = useState(10);
    const [graphHeights, setGraphHeights] = useState(initialGraphHeights);
    const [graphRanges, setGraphRanges] = useState(initialGraphRanges);
    const [modalState,setModalState] = useState(null)
    const [width,getWidth] = useState(window.innerWidth)
    const [is_small,setIsSmall] = useState(false)
   
        
   
    useEffect(()=>{
        window.addEventListener('resize',()=>{
            getWidth(window.innerWidth)
            if(width>=768)
            {
              setIsSmall(false)
            }
            else{
              setIsSmall(true)
            }
  
        })
      
    },
    [width,getWidth])

   
    const toggleButtonHandler = (event)=>{
      setAutoRefresh(event.target.checked)
    
    }
    const disableKnobsHandler = (event)=>{
     setIsSmall(event.target.checked)
    
    }

    const turnOffSpinner = ()=>{
      setTimeout(()=>{
        setSpinner(null);
      },100)
    }
    const turnOnSpinner = ()=>{
      setSpinner(<LoadingSpinner asOverlay={true}></LoadingSpinner>)
    }
    const postResolution = ()=>{
     
        turnOnSpinner()
        setTimeout(()=>{
          turnOffSpinner();
        },2000)
        
        axios.post(SERVER+'resolution',{
          resolution:sampleSize
        }).then((res)=>{
          
          if(res && res.data)
          {
            if(res.data.message==='done')
            {
              setModalState(<Modal code = "success" disabled = {false}>
                Successfully updated Parameters
            </Modal>)
            setTimeout(() => {
              setModalState(null)
          }, 1000);
              
            }
          }
          else{
            turnOffSpinner()
          setModalState(<Modal code = "error" disabled = {false}>
                couldnt update parmeters
            </Modal>)
            setTimeout(() => {
              setModalState(null)
          }, 1000);

        
          }


        }).catch(ele=>{
          turnOffSpinner()
          setModalState(<Modal code = "error" disabled = {false}>
                something went wrong!!
            </Modal>)
            setTimeout(() => {
              setModalState(null)
          }, 1000);

        })
   
      
      
    }

    const durationChangeHandler = (event)=>{
      setValidity(event.target.value>0)
      if(event.target.value>0)
      {
        setDuration(event.target.value)
      }
  }


  const handleZoomChange= (index, value,mod) => {
    const newGraphRanges = [...graphRanges];
    if(mod=='max')
    {newGraphRanges[index] = { ...newGraphRanges[index], max: value };
  }
  else{
    newGraphRanges[index] = { ...newGraphRanges[index], min: value };
  }

    setGraphRanges(newGraphRanges);
  };

  const handleSampleSizeChange = (event)=>{
    setSampleSize(event.target.value)
    setValidity2(event.target.value>=1);
  }
  const handleSliderChange = (index, value) => {
    const newGraphHeights = [...graphHeights];
    newGraphHeights[index] = value;
    setGraphHeights(newGraphHeights);
  };


 
     let startingPoint;
     useEffect(()=>{
      setFilteredData((prev)=>{
        let temp = [];

        // temp = dataPoints.filter(ele=>{
        // //   return  new Date(ele.current_time).getTime() <= (new Date(dataPoints[dataPoints.length - 1].current_time).getTime() - duration*1000)
        // // })
       temp = dataPoints;
       temp = temp.slice(temp.length-duration,temp.length)
       if (temp.length >= 1) {
        const startTime = new Date(temp[0].current_time).getTime();
  
        for (let i = 0; i < temp.length; i++) {
          const currentTime = new Date(temp[i].current_time).getTime();
          temp[i].time = currentTime - startTime;
        }
        temp[0].time=0;
        }
        

        //   if(temp.length>=sampleSize)
        // {
        //   temp = reduceArrayToFixedSize(temp,sampleSize);
        // }
         return temp;
        
      }) 
    
     },[dataPoints,duration])
     let chartData;
     if(fileteredData && fileteredData.length>=1)
     {
     chartData = fileteredData.map(ele=>{
        return {
            name : ele.time , 
            current:ele.current,
            voltage:ele.voltage,
            amt:ele.voltage
        }
    })
  }

    return(
        
        <div className="Dashboard-Page">
      
          {spinner}
          <WebSocketClient duration = {duration} autofresh = {autofresh}
          resolution = {sampleSize}
          ></WebSocketClient>
        <div style  = {{display:'flex',flexFlow :'column',justifyContent:'center',alignItems:'center'}}>
        
        <ToggleButton label = "AutoRefresh"
        autofresh = {autofresh}
        onChange = {toggleButtonHandler}
        
        >
        </ToggleButton>
        <Input
         type = "text"
         label = {`No of Samples (${sampleSize} ms each)`}
         place = "Title "
         valid = {isValid}
         ind = {0}
         handleChange= {durationChangeHandler}
        
        >
         
       
        </Input>

       
        <Input
         type = "text"
         label = "Resolution"
         place = "Title "
         valid = {isValid2}
         ind = {1}
         handleChange= {handleSampleSizeChange}
        
        >
        </Input>
        
        <Button
        onClick = {postResolution}
        >Set Resolution</Button>
        {modalState}
     
       </div>
        
        
        
        <div>
          <h1>Performance Parameters </h1>
        </div>
        <div>
          <h2>Voltage  </h2>
        </div>
        <div>
 
          </div>
          <ToggleButton label = "Disable Knobs"
        autofresh = {is_small}
        onChange = {disableKnobsHandler}
        
        >
        </ToggleButton>
          <div className="graph-container">
          <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[0]}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleSliderChange(0,parseInt(event.target.value*8))
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          small  = {is_small}
          value = {graphRanges[0].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(0,parseInt(event.target.value*6),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          small  = {is_small}
          valid = {true}
          ind = {0}
          value = {graphRanges[0].max}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(0,parseInt(event.target.value*6),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[0]}>
          
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.time,
              voltage: ele.voltage
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >  <Brush></Brush>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit ="V" domain= {[graphRanges[0].min,graphRanges[0].max]} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(135, 99, 255,0.5)', color: '#8763ff',
          backdropFilter:'blur(10px)'  
        }}
  
          />
          <Legend />
          <Line type="monotone" dataKey="voltage" stroke={brightColors[0]} strokeWidth={lineWidth
          } activeDot={{ r: 8 }} dot={false} />
        </LineChart>
        </ResponsiveContainer>
        </div>
        <div>
          <h2>Current </h2>
        </div>
        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[0]}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleSliderChange(1,parseInt(event.target.value*8))
          }}
          >
          </Input>
          <Input 
             small  = {is_small}
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          value = {graphRanges[1].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(1,parseInt(event.target.value*10),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[1].max}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleZoomChange(1,parseInt(event.target.value*10),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[1]}>
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.time,
              current:ele.current
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit =  "mA" domain= {[graphRanges[1].min,graphRanges[1].max]}/>
          <Tooltip contentStyle={{ backgroundColor: 'rgba(135, 99, 255,0.5)', color: '#8763ff',
          backdropFilter:'blur(10px)'  
        }}
  
          />
          <Legend />
          <Line type="monotone" dataKey="current"stroke={brightColors[1]} strokeWidth={lineWidth
          
          }
          activeDot={{ r: 8 } } dot={false}  />
        </LineChart>
        
        </ResponsiveContainer>
        </div>
        <div>
          <h2>Power</h2>
        </div>
        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[2]}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleSliderChange(2,parseInt(event.target.value*8))
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          small  = {is_small}
          value = {graphRanges[2].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(2,parseInt(event.target.value*3),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[2].max}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleZoomChange(2,parseInt(event.target.value*3),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[2]}>
          
          
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.time,
              power:ele.current * ele.voltage/1000
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        > 
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit =  "W" domain={[graphRanges[2].min,graphRanges[2].max]} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(135, 99, 255,0.5)', color: '#8763ff',
          backdropFilter:'blur(10px)'  
        }}
  
          />
          <Legend />
          <Line type="monotone" dataKey="power"  stroke={brightColors[2]} strokeWidth={lineWidth
          }activeDot={{ r: 8 }} dot ={false} />
        </LineChart>
       
        </ResponsiveContainer>
        </div>
        <div>
          <h2>Power-Voltage Curve</h2>
        </div>

        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          small  = {is_small}
          valid = {true}
          ind = {0}
          value = {graphHeights[3]}
          type ='slider'
          handleChange ={(event)=>{
            handleSliderChange(3,parseInt(event.target.value*8))
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          small  = {is_small}
          value = {graphRanges[3].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(3,parseInt(event.target.value*6),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[3].max}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleZoomChange(3,parseInt(event.target.value*6),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[3]}>
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              voltage : ele.voltage,
              name:(ele.current * ele.voltage/1000).toFixed(2)
            }
          }).sort((a,b)=>{
               return a.name - b.name
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" unit = "W" />
          <YAxis unit =  "V" domain={[graphRanges[3].min,graphRanges[3].max]}/>
          <Tooltip contentStyle={{ backgroundColor: 'rgba(135, 99, 255,0.5)', color: '#8763ff',
          backdropFilter:'blur(10px)'  
        }}
  
          />
          <Legend />
          <Line type="monotone" dataKey="voltage" stroke={brightColors[3]} strokeWidth={lineWidth
          } activeDot={{ r: 8 }} dot = {false} />
        </LineChart>
        
        </ResponsiveContainer>
        </div>

        <div>
          <h1>Gating Pulses</h1>

        </div>
        <div>
          <h2>Switch S<sub>1</sub></h2>
        </div>
        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[4]}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleSliderChange(4,parseInt(event.target.value)*8)
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          value = {graphRanges[4].min}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleZoomChange(4,parseInt(event.target.value),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[4].max}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleZoomChange(4,parseInt(event.target.value),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[4]}>
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.time,
              duty_ratio:(ele.duty_ratio*100).toFixed(2)
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit =  "%" domain={[graphRanges[4].min,graphRanges[4].max]}/>
          <Tooltip contentStyle={{ backgroundColor: 'rgba(135, 99, 255,0.5)', color: '#8763ff',
          backdropFilter:'blur(10px)'  
        }}
  
          />
          <Legend />
          <Line type="monotone" dataKey="duty_ratio" 
          stroke={brightColors[4]} strokeWidth={lineWidth
          } 
          activeDot={{ r: 8 }} dot = {false} />
        </LineChart>
        
        </ResponsiveContainer>
        </div>
        <div>
        <h2>Switch S<sub>2</sub></h2>
        </div>
        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          small  = {is_small}
          ind = {0}
          value = {graphHeights[5]}
          type ='slider'
          handleChange ={(event)=>{
            handleSliderChange(5,parseInt(event.target.value)*8)
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          small  = {is_small}
          ind = {0}
          value = {graphRanges[5].min}
          type ='slider'
          handleChange ={(event)=>{
            handleZoomChange(5,parseInt(event.target.value),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[5].max}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleZoomChange(5,parseInt(event.target.value),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[5]}>
          
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.time,
              duty_ratio:(ele.duty_ratio*100).toFixed(2)
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit =  "%" domain={[graphRanges[5].min,graphRanges[5].max]}/>
          <Tooltip contentStyle={{ backgroundColor: 'rgba(135, 99, 255,0.5)', color: '#8763ff',
          backdropFilter:'blur(10px)'  
        }}
  
          />
          <Legend />
          <Line type="monotone" dataKey="duty_ratio" 
           stroke={brightColors[5]} strokeWidth={lineWidth
           } 
          dot ={false} activeDot = {{r:8}} />
        </LineChart>
        <Brush></Brush>
        </ResponsiveContainer>
        </div>
        <div>
        <h2>Switch S<sub>3</sub></h2>
        </div>
        <div className="graph-container">
        <Input 
          label = "Zoom"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphHeights[6]}
          small  = {is_small}
          type ='slider'
          handleChange ={(event)=>{
            handleSliderChange(6,parseInt(event.target.value)*8)
          }}
          >
          </Input>
          <Input 
          label = "min"
          place = "min"
          valid = {true}
          ind = {0}
          value = {graphRanges[6].min}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleZoomChange(6,parseInt(event.target.value),'min')
          }}
          >
          </Input>
          <Input 
          label = "max"
          place = "asdf"
          valid = {true}
          ind = {0}
          value = {graphRanges[6].max}
          type ='slider'
          small  = {is_small}
          handleChange ={(event)=>{
            handleZoomChange(6,parseInt(event.target.value),'max')
          }}
          >
          </Input>
        <ResponsiveContainer  width="90%" height={graphHeights[6]}>
        <LineChart
          width={1000}
          height={300}
          syncId= 'anyid'
          data={fileteredData.map((ele)=>{
            return {
              name : ele.time,
              duty_ratio:(ele.duty_ratio*100).toFixed(2)
            }
          })}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickFormatter={(tick)=>{
            return formatTimeUnits(tick)
          }} />
          <YAxis unit =  "%" domain={[graphRanges[6].min,graphRanges[6].max]}/>
          <Tooltip contentStyle={{ backgroundColor: 'rgba(135, 99, 255,0.5)', color: '#8763ff',
          backdropFilter:'blur(10px)'  
        }}
  
          />
          <Legend />
          <Line type="monotone" 
           dataKey="duty_ratio" 
          stroke={brightColors[6]} strokeWidth={lineWidth
          } 
          activeDot={{ r: 8 }} dot = {false} />
        </LineChart>
        <Brush></Brush>
        </ResponsiveContainer>
        
        </div>
       
        
        </div>
    )

}
export default DashBoard;