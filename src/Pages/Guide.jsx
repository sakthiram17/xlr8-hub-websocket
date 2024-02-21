import React, { useEffect } from "react";
import { useState } from "react";
import EquationParser from "./EquationsParser.jsx";
import Button from "../UI/Button.jsx";
import axios from "axios";
import Input from "./Input.jsx";
import constants from "../Constants.jsx";
import dp from "../UI/dp.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Elements.css";
import kara from "./kara.png";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import connor from "./connor.png";
const SERVER = constants.SERVER;
const Guide = () => {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [promptRes, setPromptResult] = useState(null);
  const [responseObject, setResponseObject] = useState([]);
  useEffect(() => {
    axios
      .post(SERVER + "prompt", {
        prompt: "introduce yourself",
      })
      .then((res) => {
        setPromptResult(res.data.message);
        let temp = [...responseObject];
        temp.push({
          question: "introduce yourself",
          response: res.data.message,
        });
        setResponseObject(temp);
      })
      .catch((err) => {
        setPromptResult(err.message);
      });
    return () => {
      setResponseObject([]);
    };
  }, []);

  useEffect(() => {
    // Add the animation class after a short delay to ensure smooth transitions
    const timeoutId = setTimeout(() => {
      if (responseObject.length >= 1) {
        const temp = [...responseObject];
        temp[temp.length - 1].animate = true;
        setResponseObject(temp);
      }
    }, 200);

    // Clear the timeout when the component unmounts
    return () => clearTimeout(timeoutId);
  }, [responseObject]);
  const promptChangeHandler = (event) => {
    setCurrentPrompt(event.target.value);
  };
  const submitForm = (event) => {
    if (event.key === "Enter") {
      sendPrompt();
    }
  };
  const sendPrompt = () => {
    let temp = [...responseObject];
    temp.push({ question: currentPrompt, response: null });
    setResponseObject(temp);
    axios
      .post(SERVER + "prompt", {
        prompt: currentPrompt,
      })
      .then((res) => {
        console.log(res.data.message);
        setPromptResult(res.data.message);
        let temp = [...responseObject];
        temp.push({ question: currentPrompt, response: res.data.message });
        setResponseObject(temp);
      })
      .catch((err) => {
        setPromptResult(err.message);
      });
  };

  return (
    <div className="guide-page">
      {responseObject
        ? responseObject.map((ele, index) => {
            return (
              <React.Fragment>
                <div
                  key={index * 2 + 1}
                  className={`chat-container ${
                    ele.animate ? "fadeInAnimation" : "fadeInAnimation-active"
                  }`}
                >
                  <div className="flex-box">
                    <img src={dp} className="avatar"></img>
                    <p class="username">You</p>
                  </div>
                  <div>
                    <EquationParser
                      text={ele.question}
                      show={promptRes ? true : false}
                    ></EquationParser>
                  </div>
                </div>
                {ele.response ? (
                  <div
                    className={`chat-container ${
                      ele.animate ? "fadeInAnimation" : "fadeInAnimation-active"
                    }`}
                  >
                    <div key={index * 2} className="flex-box">
                      <img src={connor} className="avatar"></img>
                      <p class="username">Connor</p>
                    </div>
                    <div>
                      <EquationParser
                        text={ele.response}
                        show={promptRes ? true : false}
                      ></EquationParser>
                    </div>
                  </div>
                ) : null}
              </React.Fragment>
            );
          })
        : null}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Input
          type="prompt"
          label={`Enter your Question`}
          place="Title "
          valid={true}
          ind={0}
          onkeydown={submitForm}
          handleChange={promptChangeHandler}
        ></Input>
        <Button onClick={sendPrompt}>
          {<FontAwesomeIcon icon={faPaperPlane}></FontAwesomeIcon>}
        </Button>
      </div>
    </div>
  );
};

export default Guide;
