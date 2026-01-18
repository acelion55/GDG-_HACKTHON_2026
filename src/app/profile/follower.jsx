import style from "../styles/profile.module.css"
import { db, auth } from "../../../backend/login/signup"; 
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";


export default function Follower() {
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [posts, setPosts] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setLikes(docSnap.data().likes || 0); 
            setPosts(docSnap.data().posts || 0);
          }

          // Fetch all posts by this user and sum their views
          const reportsRef = collection(db, "reports");
          const q = query(reportsRef, where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          
          let totalViews = 0;
          querySnapshot.forEach((doc) => {
            totalViews += doc.data().views || 0;
          });
          
          setViews(totalViews);
        } catch (error) {
          console.error("Error fetching data:", error);
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
