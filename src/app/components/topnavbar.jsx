"use client";
import {useState, useEffect} from "react";
import { auth } from "../../../backend/login/signup"; 
import React from "react";
import "../styles/main.css"
import CreatePost from "../components/createpost";
import "../styles/Navbar.module.css";
import Link from "next/link";

const topnavbar = () => {
  const [user, setUser] = useState(null);
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged((currentUser) => {setUser(currentUser)
       });

       return () => unsubscribe();
    }, []);
  return (
    <div id="topintro">
      {user ? (
        <h1>hi <h1>{username}</h1></h1>
      ) : (
        <h1>hi <Link href="./login">login/signup</Link></h1>
      )}

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
