import React from "react";

function Loadingbutton() {
  return (
    <div>
      Please wait
      <span className="btn-loader">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </span>
    </div>
  );
}

export default Loadingbutton;
