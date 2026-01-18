import { useEffect, useState } from "react";
import Posts from "../components/posts";
import { motion} from "framer-motion";

export default function page() {
  

  return (
      <div
        style={{
          height: "90vh",
          width: "100vw",
          marginTop: "3vh",
          borderRadius: "2.5%",
          position: "absolute",
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <Posts />
        
    </div>
  );                                                                                                           
}
