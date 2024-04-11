import { useDarkMode } from "./DarkModeContext";
const ToggleButton = (props)=>{
  const { isDarkMode, toggleDarkMode } = useDarkMode();
    const handleChange = (event) => {
        if (props.onChange) {
          props.onChange(event.target.checked);
          console.log(event.target.checked)
        }
      };
    const sliderBg= props.autorefresh?'#8763ff' : isDarkMode ? 'white' : '#ccc'
    const sliderStyle = {backgroundColor : sliderBg}
    return(
        <div className={!isDarkMode?"checkbox-wrapper-22 light":"checkbox-wrapper-22"}>
        <span className="checkbox-label">
            {props.label}
        </span>
        <label className ="switch">
        <input type="checkbox" className="checkbox"  
        onChange={handleChange} 
        value = {props.autorefresh}/>
        <span className ="slider round" style = {sliderStyle}></span>
        </label>
        </div>
    )
}
export default ToggleButton;