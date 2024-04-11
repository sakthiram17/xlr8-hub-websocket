import React from 'react'
import { useEffect,useState } from 'react';

import './Navbar.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useContext } from 'react';
import ToggleButton from '../Pages/ToggleButton.jsx';
import Input from '../Pages/Input.jsx';
import { useDarkMode } from '../Pages/DarkModeContext.jsx';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
/*
Guide to Use this Navbar
props 
 off function - required to disable this navbar when switching to
  small devices
 first - name in font type one
 last - name in font type two
 list - list of pages
 changePage - function to handle base switching in app.js or parent
 file
 

*/
const Navbar = (props)=>{
    const [width,getWidth] = useState(window.innerWidth)
    const {isDarkMode,toggleDarkMode} = useDarkMode();
    useEffect(()=>{
        window.addEventListener('resize',()=>{
            getWidth(window.innerWidth)
            if(window.innerWidth>=768)
            {
                props.off()
                props.setSmall(false)
            }
            else{
                props.setSmall (true)
            }
        })
      
    },
    [width,getWidth])


    useEffect(() => {
        // Modify CSS variables
        const root = document.documentElement;
    
        if(isDarkMode)
        {
            root.style.setProperty('--primary-nav', 'black');
            root.style.setProperty('--secondary-text', '#f5cac2');
            root.style.setProperty('--secondary-nav', '#8763ff');
            root.style.setProperty('--primary-color', '#303179');
            root.style.setProperty('--primary-color-50', 'rgba(48, 49, 121, 0.5)');
            root.style.setProperty('--secondary-color', 'rgb(20, 24, 80)');
            root.style.setProperty('--main-bg', '#ededed');
            root.style.setProperty('--secondary-nav-50', 'rgba(48, 0, 193, 0.5)');
            root.style.setProperty('--secondary-color-50', 'rgba(20, 24, 80, 0.5)');
            root.style.setProperty('--navtext', 'white');
            root.style.setProperty('--navtext-alt', '#8763ff');
            root.style.setProperty('--card-bg', 'rgba(247, 247, 255, 0.5)');
            root.style.setProperty('--primary-text', 'white');
            root.style.setProperty('--card-hover', '#ff1600');
            root.style.setProperty('--accent-color', '#8763ff');
            root.style.setProperty('--primary-card-bg', '#1F2124');
            root.style.setProperty('--main-bg', 'black');
          
        }
        else{
            root.style.setProperty('--primary-nav', 'white');
            root.style.setProperty('--secondary-text', '#f5cac2');
            root.style.setProperty('--secondary-nav', '#8763ff');
            root.style.setProperty('--primary-color', '#303179');
            root.style.setProperty('--primary-color-50', 'rgba(48, 49, 121, 0.5)');
            root.style.setProperty('--secondary-color', 'rgb(20, 24, 80)');
            root.style.setProperty('--main-bg', '#ededed');
            root.style.setProperty('--secondary-nav-50', 'rgba(48, 0, 193, 0.5)');
            root.style.setProperty('--secondary-color-50', 'rgba(20, 24, 80, 0.5)');
            root.style.setProperty('--navtext', 'black');
            root.style.setProperty('--navtext-alt', '#8763ff');
            root.style.setProperty('--card-bg', 'rgba(247, 247, 255, 0.5)');
          
            root.style.setProperty('--card-hover', '#ff1600');
            root.style.setProperty('--accent-color', '#8763ff');
            root.style.setProperty('--primary-card-bg', 'whitesmoke');
            root.style.setProperty('--main-bg', 'whitesmoke');
            root.style.setProperty('--primary-text', 'black');
        
        }
       
      }, [isDarkMode]);

    let is_small = width>768?false:true;
    let navElementList = props.list;
    let header = props.header;
    let navList = [];
    let menuButton = null;
  
    if(!is_small)
    {
        for(var i = 0;i<props.list.length;i++)
        {   if(props.list[i]==props.active)
            {
                navList.push(<li onClick = {props.changePage }key = {i} className='NavbarElement Active'>{props.list[i]}</li>)
            }
            else{
                navList.push(<li onClick = {props.changePage }key = {i} className='NavbarElement'>{props.list[i]}</li>)
        }}
    }
    else{
        menuButton = (<button className = "menu-button" key = {24} onClick = {props.expand}>

        
            <FontAwesomeIcon icon = {faBars} style={{ color: 'white' }}></FontAwesomeIcon>
       
        </button>
        )
    }
  

    const nav = (
        <div className='NavBar'>
        <div className= 'btn-grp'>
        {menuButton}
        </div>
        <div className = {!is_small?'navbar-header':'small_nav-header'}
        >
           
        <span className="header-f">{props.first}</span>
        <span className = "header-l">{props.last}</span>
        </div>
        
        <ul type = "none">
        {navList}
        <faMoon></faMoon>
        <ToggleButton
        label = {isDarkMode?<FontAwesomeIcon icon={faMoon}/> :<FontAwesomeIcon icon={faSun}></FontAwesomeIcon>}
        autorefresh ={isDarkMode}
        onChange={toggleDarkMode}
        ></ToggleButton>
        </ul>
        </div>
    );
    return nav;


}
export default Navbar