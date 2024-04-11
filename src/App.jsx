import logo from "./logo.svg";
import "./App.css";
import DashBoard from "./Pages/Dashboard.jsx";
import Navbar from "./UI/Navbar.jsx";
import { useState,useEffect } from "react";
import ControlPanel from "./Pages/ControlPanel.jsx";
import { CounterProvider } from "./dataContext.jsx";
import Backdrop from "./UI/Backdrop.jsx";
import SideBar from "./UI/SideBar.jsx";
import Logs from "./UI/Logs.jsx";
import Guide from "./Pages/Guide.jsx";
import { useControlContext, ControlProvider } from "./Pages/controlContext.jsx";
import WebSocketClient from "./Pages/WebSocketClient.jsx";
import ToggleButton from "./Pages/ToggleButton.jsx";
import Input from "./Pages/Input.jsx";
import { DarkModeProvider } from "./Pages/DarkModeContext.jsx";
import { useDarkMode } from "./Pages/DarkModeContext.jsx";
function App() {
  const [sidebaron, setSidebaron] = useState(false);
  const [small, setSmall] = useState(false);
  const [currentPage, setPage] = useState(
    <DashBoard small={small}></DashBoard>
  );

  const [activePage, setActivePage] = useState("Dashboard");
  const [autofresh, setAutoRefresh] = useState(false);
  const [Channel,setChannel] = useState("Converter-1")

  const offSideBar = () => {
    setSidebaron(false);
  };
  const turnOnSideBar = () => {
    setSidebaron(true);
  };
  const updateIsSmall = (flag) => {
    setSmall(flag);
  };
  const toggleButtonHandler = (event) => {
    setAutoRefresh(event.target.checked);
    console.log(autofresh);
  };
  const handleChange = (event)=>{
    setChannel(event.target.value)
    console.log(event.target.value)
  }
  useEffect(() => {
    // Modify CSS variables
    const root = document.documentElement;

    root.style.setProperty('--primary-nav', 'black');
    root.style.setProperty('--secondary-text', '#f5cac2');
    root.style.setProperty('--secondary-nav', '#8763ff');
    root.style.setProperty('--primary-color', '#303179');
    root.style.setProperty('--primary-color-50', 'rgba(48, 49, 121, 0.5)');
    root.style.setProperty('--secondary-color', 'rgb(20, 24, 80)');
    root.style.setProperty('--main-bg', '#ededed');
    root.style.setProperty('--secondary-nav-50', 'rgba(48, 0, 193, 0.5)');
    root.style.setProperty('--secondary-color-50', 'rgba(20, 24, 80, 0.5)');
    root.style.setProperty('--navtext', 'rgb(0, 0, 0)');
    root.style.setProperty('--navtext-alt', '#8763ff');
    root.style.setProperty('--card-bg', 'rgba(247, 247, 255, 0.5)');
    root.style.setProperty('--primary-text', 'white');
    root.style.setProperty('--card-hover', '#ff1600');
    root.style.setProperty('--accent-color', '#8763ff');
    root.style.setProperty('--primary-card-bg', 'whitesmoke');

  }, []);

  const pageSwitchHandler = (event) => {
    let page = event.target.innerHTML;
    setActivePage(page);

    switch (page) {
      case "Dashboard":
        setPage(<DashBoard small={small}></DashBoard>);
        break;
      case "Control Panel":
        setPage(<ControlPanel></ControlPanel>);
        break;
      case "DataHub":
        setPage(<Logs></Logs>);
        break;
      case "Guide":
        setPage(<Guide></Guide>);
        break;
      default:
        setPage(<DashBoard small={small}></DashBoard>);
    }
  };

  return (
    <div className="App">
      <DarkModeProvider>
      <ControlProvider>
        <CounterProvider>
          <WebSocketClient Channel= {Channel}></WebSocketClient>
          <Navbar
            list={["Dashboard", "Control Panel", "DataHub", "Guide"]}
            off={offSideBar}
            first="XLR8"
            last="Hub"
            expand={turnOnSideBar}
            active={activePage}
            changePage={pageSwitchHandler}
            setSmall={updateIsSmall}
            handleChange={handleChange}
          ></Navbar>
          <SideBar
            list={["Dashboard", "Control Panel", "DataHub", "Guide"]}
            off={offSideBar}
            first="XLR8"
            last="Hub"
            expand={turnOnSideBar}
            header="Xelerate-HUB"
            disabled={!sidebaron}
            active={activePage}
            changePage={pageSwitchHandler}
          ></SideBar>

      
          {currentPage}
          <Backdrop off={offSideBar} on={sidebaron}></Backdrop>
        </CounterProvider>
      </ControlProvider>
      </DarkModeProvider>
    </div>
  );
}

export default App;
