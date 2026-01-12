"use client";
import {useState, useEffect} from "react";
import { auth,db } from "../../../backend/login/signup"; 
import React from "react";
import {doc, getDoc} from "firebase/firestore";
import "../styles/main.css"
import CreatePost from "../components/createpost";
import style from "../styles/Navbar.module.css";
import Link from "next/link";

const topnavbar = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  
  useEffect(() =>{
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUsername(docSnap.data().username);
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
    })
    return() => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUsername("");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
   
  

    return (
      <div id="topintro">
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h1 style={{color: "white"}}>Hi, {username}</h1>
          
          <button onClick={handleLogout} className={style.logoutBtn}>
            Logout
          </button>
          
          <div style={{position: "relative", marginLeft: "8vh" , height: "8vh",marginTop: "1vh",width: "50vw",}}>
            <div style={{marginTop: "2vh",}}>
               <CreatePost />
            </div>
             <Link href="/profile">
            <div id="profile" >
              <img
                style={{ borderRadius: "50%", objectFit: "cover",}}
                src="./globe.svg"
                alt="Profile"
              />
            </div>
          </Link>
          </div>
        </div>
      ) : (
        <div  style={{marginLeft: "60vw"}}>
          <Link href="/login">
            <button style={{fontWeight: "1000",fontSize: "1.6rem"}}>
              Login / Sign Up
            </button>
          </Link>
        </div>
      )}
    </div>
    )};

export default topnavbar;
