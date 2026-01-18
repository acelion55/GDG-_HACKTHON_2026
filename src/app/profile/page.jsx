"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Follower from "./follower";
import Postcard from "./postcard";
import style from "../styles/profile.module.css";
import Createpost from "../components/createpost";

import { auth, db } from "../../../backend/login/signup";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [userdata, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUsername(data.username);
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        window.location.href = "/login";
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50vh" }}>Loading...</div>
    );
  }

  return (
    <div className={style.profilepage}>
      <div className={style.profileup}>
        <div className={style.imgbar}>
          <div className={style.back} onClick={handleLogout} style={{ cursor: "pointer" }}>log out</div>
          <div
            style={{
              marginTop: "3vh",
              marginLeft: "75vw",
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
                  position: "absolute",
                  color: "black",
                  fontWeight: "bolder",
                }}
              >
                Hi, {username}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <Follower />
      <div style={{ height: "6vh" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bolder" }}>
          Recently Posted
        </h1>
      </div>

      <Postcard />
    </div>
  );
}
