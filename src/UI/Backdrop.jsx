import React from "react";
import "./Backdrop.css"
//props on = state from parent indication where it is on
//props off = function the sets parents on state to of
const Backdrop = (props)=>{
    if(props.on)
    {
        return(
            <div className="Backdrop" onClick = {props.off}></div>
        )
    }
    else{
        return(<div></div>)
    }

}
export default Backdrop;