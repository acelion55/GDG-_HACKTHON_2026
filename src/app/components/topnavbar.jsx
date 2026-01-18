"use client";
import {useState, useEffect} from "react";
import { auth,db } from "../../../backend/login/signup"; 
import React from "react";
import {doc, getDoc} from "firebase/firestore";
import CreatePost from "../components/createpost";
import Prafuser from "./prof_usernme"
import style from "../styles/main.module.css";
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
 

    return (
      <div className={style.topintro}>
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
           
            <Prafuser username={username}/>
          
         
            <div >
               <CreatePost />
                       
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
