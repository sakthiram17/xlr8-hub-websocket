import "./Input.css";
import react from "react";
import Button from "../UI/Button";
const Input = (props) => {
  if (props.type == "number") {
    return (
      <div className={props.col ? "form-input-col" : "form-input"}>
        <span className="form-label">{props.label}</span>
        <input
          type="number"
          className={props.valid ? "form-number" : "form-number invalid"}
          onChange={props.handleChange}
          index={props.ind}
          placeholder={props.placeholder}
          value={props.value}
 
        ></input>
      </div>
    );
  } else if (props.type === "email") {
    return (
      <div className={props.col ? "form-input-col" : "form-input"}>
        <span className="form-label">{props.label}</span>
        <input
          type="email"
          className={props.valid ? "form-number" : "form-number invalid"}
          onChange={props.handleChange}
          index={props.ind}
          placeholder={props.placeholder}
        ></input>
      </div>
    );
  } else if (props.type === "password") {
    return (
      <div className={props.col ? "form-input-col" : "form-input"}>
        <span className="form-label">{props.label}</span>
        <input
          type="password"
          className={props.valid ? "form-number" : "form-number invalid"}
          onChange={props.handleChange}
          index={props.ind}
          placeholder={props.placeholder}
        ></input>
      </div>
    );
  } else if (props.type === "slider" && props.small) {
    return <div></div>;
  } else if (props.type === "slider") {
    return (
      <div>
        <span>{props.label}</span>
        <input
          type="range"
          orient="vertical"
          className={props.valid ? "form-number" : "form-number invalid"}
          onChange={props.handleChange}
          index={props.ind}
          placeholder={props.placeholder}
          defaultValue={props.value}
        ></input>
      </div>
    );
  } else if (props.type === "prompt") {
    return (
      <div className={props.col ? "prompt-input-col" : "prompt-input"}>
        <span className="form-label">{props.label}</span>
        <input
          type="text"
          className={props.valid ? "form-number" : "form-number invalid"}
          onChange={props.handleChange}
          index={props.ind}
          placeholder={props.placeholder}
          onKeyDown={props.onkeydown}
        ></input>
      </div>
    );
  } else if (props.type === "file") {
    return (
      <div className={props.col ? "form-input-col" : "form-input"}>
        <input
          type="file"
          id="myfile"
          name="myfile"
          onChange={props.handleChange}
          index={props.ind}
          placeholder={props.placeholder}
        ></input>
        <div style={{ margin: "1rem" }}>
          <Button
            onClick={() => {
              document.getElementById("myfile").click();
            }}
          >
            Import Data
          </Button>
        </div>
      </div>
    );}
  else if(props.type==='select')
  {
    let options = [];
    for(var i =0 ;i<props.options.length;i++)
    {
      options.push(<option value={props.values[i]}>{props.options[i]}</option>)
    }
    return(
      <div className={props.col ? "form-input-col" : "form-input"}>
       <span className="form-label">{props.label}</span>
       <select name = {props.label} value = {props.value} onChange={props.handleChange}>
        {options}
       </select>
        
      </div>

    )

  }

   else {
    return (
      <div className={props.col ? "form-input-col" : "form-input"}>
        <span className="form-label">{props.label}</span>
        <input
          type="text"
          className={props.valid ? "form-number" : "form-number invalid"}
          onChange={props.handleChange}
          index={props.ind}
          placeholder={props.placeholder}
          value = {props.value}
        ></input>
      </div>
    );
  }
};
export default Input;
