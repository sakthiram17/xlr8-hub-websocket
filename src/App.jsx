import logo from "./logo.svg";
import "./App.css";
import DashBoard from "./Pages/Dashboard.jsx";
import Navbar from "./UI/Navbar.jsx";
import { useState } from "react";
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
 console.log(Channel)

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

          <Input
            type="select"
            label="Choose Data Channel"
            options={["Reduced-Stress Cubic Boost Converter", "IBC with Enhanced QBC"]}
            values = {["Converter-1","Converter-2"]}
            handleChange = {handleChange}
          ></Input>
          {currentPage}
          <Backdrop off={offSideBar} on={sidebaron}></Backdrop>
        </CounterProvider>
      </ControlProvider>
    </div>
  );
}

export default App;
