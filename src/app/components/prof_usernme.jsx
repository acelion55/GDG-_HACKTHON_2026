"use client";
import React from "react";
import style from "../styles/main.module.css";

function profusernme(props) {

  return (
    <div style={{width: "60vw",display: "flex",gap: "5vw",height: "8vh"}}>
      <div className={style.profile}>
        <img
          style={{ borderRadius: "50%", objectFit: "cover" }}
          src="./globe.svg"
          alt="Profile"
        />
      </div>

      <h1 className={style.username}>{props.username}</h1>
    </div>
  );
}

export default profusernme;
