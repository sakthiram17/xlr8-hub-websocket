
import "./Input.css"
import react from "react";
const Input = (props)=>{
    if(props.type=='number')
    {
        return (
            <div className={props.col?'form-input-col':'form-input'}>
                <span className='form-label'>{props.label}</span>
                <input type = "text" 
                className= {props.valid?"form-number":"form-number invalid"}
                onChange={props.handleChange}
                index = {props.ind}
                placeholder={props.placeholder}>

                </input>
                
            </div>
        )
    }
    else if(props.type === 'email')
    {
        return( 
            <div className={props.col?'form-input-col':'form-input'}>
            <span className='form-label'>{props.label}</span>
            <input type = "email" 
            className= {props.valid?"form-number":"form-number invalid"}
            onChange={props.handleChange}
            index = {props.ind}
            placeholder={props.placeholder}>
    
            </input>
            
            </div>)

    }
    else if(props.type === 'password')
    {
       return( 
        <div className={props.col?'form-input-col':'form-input'}>
        <span className='form-label'>{props.label}</span>
        <input type = "password" 
        className= {props.valid?"form-number":"form-number invalid"}
        onChange={props.handleChange}
        index = {props.ind}
        placeholder={props.placeholder}>

        </input>
        
        </div>)
    }
    else if(props.type==='slider' && props.small)
    {
        return(<div></div>)
    }
    else if(props.type==='slider')
    {
        return( 
            <div>
            <span>{props.label}</span>
            <input  type="range" orient="vertical"
            className= {props.valid?"form-number":"form-number invalid"}
            onChange={props.handleChange}
            index = {props.ind}
            placeholder={props.placeholder}
            defaultValue={props.value}
            >
    
            </input>
            </div>
            )

    }
    else if(props.type==='prompt')
    {

        return( 
            <div className={props.col?'prompt-input-col':'prompt-input'}>
            <span className='form-label'>{props.label}</span>
            <input type = "text" 
            className= {props.valid?"form-number":"form-number invalid"}
            onChange={props.handleChange}
            index = {props.ind}
            placeholder={props.placeholder}
            onKeyDown={props.onkeydown}
            >
        
            </input>
            </div>)

    }
    else{
        return( 
            <div className={props.col?'form-input-col':'form-input'}>
            <span className='form-label'>{props.label}</span>
            <input type = "text" 
            className= {props.valid?"form-number":"form-number invalid"}
            onChange={props.handleChange}
            index = {props.ind}
            placeholder={props.placeholder}>
    
            </input>
            
            </div>)



    }


}
export default Input;