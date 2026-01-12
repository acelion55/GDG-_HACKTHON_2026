"use client";
import  "../app/styles/Navbar.module.css"
import AnimatedList from "./components/animatedlist.jsx";
import Post from "./components/page1post";
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
    <div style={{height: "85vh",display: "flex", flexDirection: "column"}} id="maindiv">
      <AnimatedList
        items={items}
        onItemSelect={(item, index) => console.log(item, index)}
        showGradients={true}
        enableArrowNavigation={true}
        displayScrollbar={true}
      />
      
      <Post/>
     
    </div>
    </>
  );
}
