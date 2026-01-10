import style from "../styles/profile.module.css"
import { db, auth } from "../../../backend/login/signup"; 
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";


export default function Follower() {
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [posts, setPosts] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const user = auth.currentUser; // Pata lagao kaunsa user login hai
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // 2. Database se likes nikaalo aur state mein daal do
          setLikes(docSnap.data().likes || 0); 
          setViews(docSnap.data().views || 0);
          setPosts(docSnap.data().posts || 0);
        }
      }
    };
    getData();
  }, []);

 
  return (
    <div className={style.followbox}>
       <div className={style.postcount}>posts <h1 style={{fontWeight: "bolder",fontSize: "1.5rem"}}> {posts}</h1></div>
       <div className={style.postcount}>views <h1 style={{fontWeight: "bolder",fontSize: "1.5rem"}}> {views}</h1></div>
       <div className={style.postcount}>likes <h1 style={{fontWeight: "bolder",fontSize: "1.5rem"}}> {likes}</h1></div>
    </div>
  );
}
