const Guage = (props)=>{
    let style = {width : '250px'}
    if(props.bg)
    {
        style.backgroundColor = props.bg
    }
    return(
        <div className={props&& props.type?'gauge  gauge-2':'gauge '}
        style = {style}

        >
        <div className="percentage"
         style = {{transition : '0.5s',rotate :'' + parseInt((props.value/props.max) * (180)-180)+'deg' }}></div>
        <div className="mask"></div>
        
        <span className="value" style = {{transition : '0.5s'}}>{props.value}{props.unit}</span>
        </div>
    )
}
export default Guage;