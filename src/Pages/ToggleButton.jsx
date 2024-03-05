const ToggleButton = (props)=>{
    const handleChange = (event) => {
        if (props.onChange) {
          props.onChange(event.target.checked);
        }
      };

    return(
        <div className="checkbox-wrapper-22">
        <span className="checkbox-label">
            {props.label}
        </span>
        <label className ="switch">
        <input type="checkbox" className="checkbox" 
        onChange={handleChange} 
        value = {props.autorefresh}/>

        
        <span className ="slider round"></span>
        </label>
        </div>
    )
}
export default ToggleButton;