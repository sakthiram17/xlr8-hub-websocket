import React, { useEffect } from "react"
import { useState } from "react"
import EquationParser from "./EquationsParser.jsx"
import Button from "../UI/Button.jsx"
import axios from "axios"
import Input from "./Input.jsx"
import constants from "../Constants.jsx"
import dp from "../UI/dp.jpg"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "./Elements.css"
import kara from "./kara.png"
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
const SERVER = constants.SERVER;
const Guide = ()=>{
    const [currentPrompt,setCurrentPrompt] = useState("")
    const [promptRes,setPromptResult] = useState(null)
    const [responseObject, setResponseObject] = useState([]);
    useEffect(()=>{
      axios.post(SERVER+'prompt',{
        prompt:'introduce yourself'
      }).then(res=>{
        setPromptResult(res.data.message)
        let temp =[...responseObject];
        temp.push({question:'introduce yourself',response:res.data.message})
        setResponseObject(temp)
      }).catch((err)=>{
        setPromptResult(err.message)
      })
     

    },[])

    useEffect(() => {
      // Add the animation class after a short delay to ensure smooth transitions
      const timeoutId = setTimeout(() => {
        if(temp.length>=1)
        {
        const temp = [...responseObject];
        temp[temp.length - 1].animate = true;
        setResponseObject(temp);}
      },200);
  
      // Clear the timeout when the component unmounts
      return () => clearTimeout(timeoutId);
    }, [responseObject]);
    const promptChangeHandler = (event)=>{
        setCurrentPrompt(event.target.value);
      }
      const sendPrompt = ()=>{
        axios.post(SERVER+'prompt',{
          prompt:currentPrompt
        }).then(res=>{
          console.log(res.data.message)
          setPromptResult(res.data.message)
          let temp =[...responseObject];
          temp.push({question:currentPrompt,response:res.data.message})
          setResponseObject(temp)
        }).catch((err)=>{
          setPromptResult(err.message)
        })
  
      }


    return(
          <div className="guide-page">
        
     
          {responseObject?responseObject.map((ele,index)=>{
            return (
            <React.Fragment>
             <div className={`chat-container ${ele.animate ? 'fadeInAnimation active' : ''}`}>
              <div className="flex-box">
              <img src = {dp} className="avatar"></img>
              <p class="username">You</p>
              </div>
              <div>
              <EquationParser text ={ele.question}
              show = {promptRes?true:false}
              ></EquationParser>
              </div>
              </div>
              <div className={`chat-container ${ele.animate ? 'fadeInAnimation active' : ''}`}>
              <div className="flex-box">
              <img src = {kara} className="avatar"></img>
              <p class="username">Kara</p>
              </div>
              <div>
              <EquationParser text ={ele.response}
              show = {promptRes?true:false}
              ></EquationParser>
              </div>
              </div>

              </React.Fragment>
              )

          }): null}
               <div style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
          <Input
         type = "prompt"
         label = {`Enter your Question`}
         place = "Title "
         valid = {true}
         ind = {0}
        
         handleChange= {promptChangeHandler}
        
        >
          </Input>
          <p onClick = {sendPrompt}>
          <FontAwesomeIcon icon={faPaperPlane} />
          </p>
          </div>
          </div>
          
    )



}

export default Guide;