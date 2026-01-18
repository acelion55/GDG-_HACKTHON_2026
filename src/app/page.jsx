"use client";
import  "../app/styles/Navbar.module.css"
import Post from "./home/page1post";
import Navbartop from "./components/topnavbar";

const items = [
  "report 1 + profile",
  "report 2 + profile",
  "report 3 + profile",
  "report 4 + profile",
  "report 5 + profile",
  "report 6 + profile",
  "report 7 + profile",
];


export default function Home() {
  


  return (
    <>
    <Navbartop/>
    <div style={{height: "85vh",display: "flex", flexDirection: "column",height: "100vh",backgroundColor: "black"}} id="maindiv">
      
      <Post/>
     
    </div>
    </>
  );
}
