import style from "../styles/profile.module.css";

export default function StatsCard() {
  return (
    <div className={style.postcard}>
      <img
        alt="not found"
        style={{
          height: "12vh",
          marginLeft: "2vw",
          marginTop: "0.5vh",
          borderRadius: "0.8rem",
          position: "absolute",
          width: "12vh",
        }}/>
        
        <p className={style.postcardpara}>caption</p>
    </div>
  );
}
