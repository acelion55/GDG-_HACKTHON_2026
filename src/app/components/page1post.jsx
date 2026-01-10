import { useEffect, useState } from "react";
import Posts from "./posts";
import { motion} from "framer-motion";

export default function page() {
  // const [updown, setupdown] = useState(second);

  // const sheetVariants = {
  //   down: { y: "60vh" },
  //   up: { y: "5vh" },
  // };

  return (
    <motion.div
      // variants={sheetVariants}
      // animate={updown ? "up" : "down"}
      // transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{
        height: "50vh",
          backgroundColor: "#121212", // Clean Dark Theme
          width: "100vw",
          borderRadius: "30px",
          position: "absolute",
          marginTop: "30vh",      
          border: "1px solid rgba(57, 255, 20, 0.3)",
          boxShadow: "0 -10px 30px rgba(0,0,0,0.5)",
          
      }}
    >
      <button
      // onClick={() => setupdown(!updown)}
        style={{
            background: "none",
            border: "none",
            padding: "5px 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#39FF14",
            fontSize: "3vh",
            marginLeft: '43%'
        }}
      >
        down
      </button>
      <div
        style={{
          height: "50vh",
          backgroundColor: "yellowgreen",
          width: "95vw",
          marginLeft: "2.5vw",
          borderRadius: "2.5%",
          position: "absolute",
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        <Posts />
        <Posts />
        <Posts />
        <Posts />
        <Posts />
      </div>
    </motion.div>
  );
}
