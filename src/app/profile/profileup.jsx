import style from "../styles/profile.module.css";
import Createpost from "../components/createpost";

export default function profileup() {
  return (
    <div className={style.profileup}>
      <div className={style.imgbar}>
        
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
                color: "black",
                marginTop: "2vh",
                fontWeight: "bolder",
              }}
            >
              hi {" "}
            </h1>
            
          </div>
        </div>
      </div>
    </div>
  );
}
