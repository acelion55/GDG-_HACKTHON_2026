import React from "react";
import "../styles/main.css"
import CreatePost from "../components/createpost";
import "../styles/Navbar.module.css";
import Link from "next/link";

const topnavbar = () => {
  return (
    <div id="topintro">
      <h1>username</h1>
      <div
        style={{ marginTop: "5vh", marginLeft: "68vw", position: "absolute" }}
      >
        <CreatePost />
      </div>
      <Link href="/profile">
        <div id="profile">
          <img
            style={{
              borderRadius: "50%",
              objectFit: "cover",
            }}
            src="./globe.svg"
            alt=""
          />
        </div>
      </Link>
    </div>
  );
};

export default topnavbar;
