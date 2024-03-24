import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from "recharts";
import Input from "./Input";
import React from "react";
const lineWidth = 3;

const toolTipStyle = {
  backgroundColor: "rgba(135, 99, 255,0.5)",
  color: "#8763ff",
  backdropFilter: "blur(4px)",
  border: "none",
  borderRadius: "1rem",
  fontWeight: "bold",
  padding: "0.5rem",
  paddingLeft: "1rem",
  paddingRight: "1rem",
};
function formatTimeUnits(value) {
  if (value < 1000) {
    return value + "ms";
  } else if (value < 60000) {
    return (value / 1000).toFixed(2) + "s";
  } else {
    return (value / 60000).toFixed(2) + "min";
  }
}
const CustomTooltip = (props) => {
  if (props.active && props.payload && props.payload.length) {
    return (
      <div className="custom-tooltip" style={toolTipStyle}>
        <p> {formatTimeUnits(parseFloat(props.label).toFixed(2))}</p>
        <p>
          {" "}
          {parseFloat(props.payload[0].value).toFixed(2)}
          {props.y}
        </p>
      </div>
    );
  }

  return null;
};

const PVToolTip = (props) => {
  if (props.active && props.payload && props.payload.length) {
    return (
      <div className="custom-tooltip" style={toolTipStyle}>
        <p> {parseFloat(props.label).toFixed(2)}W</p>
        <p> {parseFloat(props.payload[0].value).toFixed(2)}V</p>
      </div>
    );
  }

  return null;
};
const GraphContainer = ({
  graphHeight,
  graphRange,
  is_small,
  data,
  yLabel,
  handleSliderChange,
  handleZoomChange,
  Color,
  unit,
  type,
  index,
  dataKey
}) => {
  let axisData = (
    <React.Fragment>
      <XAxis
        dataKey="name"
        tickFormatter={(tick) => {
          return formatTimeUnits(tick);
        }}
      />
      <YAxis unit={unit} domain={[graphRange.min, graphRange.max]} />
      <Tooltip
        contentStyle={toolTipStyle}
        content={<CustomTooltip y={unit}></CustomTooltip>}
      />
    </React.Fragment>
  );
  if (type && type === "PV") {
    axisData = (
      <React.Fragment>
        <XAxis dataKey="name" unit = "W" />
        <YAxis unit={"V"} domain={[graphRange.min, graphRange.max]} />
        <Tooltip
          contentStyle={toolTipStyle}
          content={<PVToolTip y={"W"}></PVToolTip>}
        />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <div>
        <h2>{yLabel} </h2>
      </div>
      <div className="graph-container">
         {!is_small? 
         <React.Fragment>
        <Input
          label="Zoom"
          place="asdf"
          valid={true}
          ind={index}
          value={graphHeight}
          type="slider"
          small={is_small}
          handleChange={(event) => {
            handleSliderChange(index, parseInt(event.target.value * 8));
          }}
        ></Input>
        <Input
          label="min"
          place="min"
          valid={true}
          ind={0}
          small={is_small}
          value={graphRange.min}
          type="slider"
          handleChange={(event) => {
            handleZoomChange(index, parseInt(event.target.value * 6), "min");
          }}
        ></Input>
        <Input
          label="max"
          place="asdf"
          small={is_small}
          valid={true}
          ind={0}
          value={graphRange.max}
          type="slider"
          handleChange={(event) => {
            handleZoomChange(index, parseInt(event.target.value * 6), "max");
          }}
        ></Input></React.Fragment> :null}
        <ResponsiveContainer width="90%" height={graphHeight}>
          <LineChart
            width={1000}
            height={300}
            syncId="anyid"
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
          
            <Brush></Brush>
            {axisData}
            <CartesianGrid strokeDasharray="3 3" />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={Color}
              strokeWidth={lineWidth}
              activeDot={{ r: 8 }}
              dot={false}
            />
          </LineChart>
         
        </ResponsiveContainer>
      </div>
    </React.Fragment>
  );
};
export default GraphContainer;
