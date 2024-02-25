import React from 'react'
import './RectangularBar.css'
const RectangularBar = (props)=>{
    const fill_style = {
        backgroundImage: `linear-gradient(to ${props.direction?props.direction:"top"}, ${props.c1} ${props.level}% , ${props.c2} ${props.level}% ${props.level*2}%) `,
        height: props.height,
        width:props.width,
        display:"inline-block",
        transition:'1s ease-in-out'
        
    }


    return(
    <div className='RectangularBar'>
     <div className="RectangularBar" >
     
     </div>
     </div>
    )
    
}
export default RectangularBar;