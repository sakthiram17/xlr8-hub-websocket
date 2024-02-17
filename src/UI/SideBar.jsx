import React from 'react'
import { useEffect,useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import './SideBar.css'

const SideBar = (props)=>{
    let navElementList = props.list;
    let header = props.header;
    let navList = [];
    // if(props.disabled)
    // {
    //     return(<div className = 'SideBar'></div>)
    // }
    for(var i = 0;i<props.list.length;i++)
    {
        if(props.list[i]==props.active)
            {
                navList.push(<li onClick = {props.changePage }key = {props.list[i]} className='SideBarElement Active1'>{props.list[i]}</li>)
            }
        else{
                navList.push(<li onClick = {props.changePage }key = {props.list[i]} className='SideBarElement'>{props.list[i]}</li>)
            }
    }
  
    const closeClass =  props.disabled ? ' close' : ' open';
    const classes = closeClass + ' SideBar'; 
    const nav = (
      
        
        <div className={classes}>
        <ul>
        <li className ='close-icon' OnClick = {()=>{
            props.off();
            console.log("Closing sidebar")
        }}>
            <FontAwesomeIcon icon = {faClose}></FontAwesomeIcon>
        </li>
        {navList}
       
        </ul>
        </div>
    );
    return nav;


}
export default SideBar