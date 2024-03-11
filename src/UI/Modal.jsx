import "./Modal.css"
import Card from "./Card.jsx"

const Modal = (props)=>{
    if(!props.disabled)
    {
       
    return(
        <div className  = {`modal ${props.code}`} >
            {props.children}
            <br></br>
        </div>
        
    )}
    else{
        return (<div className={`modal ${props.code} disabled`}>
                  {props.children}
                    <br></br>
                </div>);
    }
    
}
export default Modal;