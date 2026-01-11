"use client";
import Follower from "./follower";
import Postcard from "./postcard";
import Login from "../login/page"
import style from "../styles/profile.module.css";
import Createpost from "../components/createpost";
import { useState } from "react";

export default function ProfilePage() {

  const [username, setUsername] = useState("");

   if (username == "") {
       return(<Login onLogin={(name) => setUsername(name)}/>);
   }else return (
    <div className={style.profilepage}>
      <div className={style.profileup}>
        <div className={style.imgbar}>
          <div className={style.back}>back</div>
          <div
            style={{
              marginTop: "4vh",
              marginLeft: "88vw",
              position: "absolute",
              height: "10vh",
            }}
          >
            <Createpost />
          </div>
          <div className={style.imguserbox}>
            <div className={style.img}></div>
            <div className={style.profilename}>
              <h1
                style={{
                  fontSize: "2rem",
                  position: "absolute",
                  color: "black",
                  fontWeight: "bolder",
                }}
              >
                hi{username}
              </h1>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bolder",
                  position: "absolute",
                  top: "20vh",
                  left: "4vw",
                  color: "black",
                }}
              ></h1>
            </div>
          </div>
        </div>
      </div>
      <Follower />
      <div style={{ height: "6vh" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bolder" }}>
          Recently Posted
        </h1>
      </div>

      <Postcard />
    </div>
  );
}
