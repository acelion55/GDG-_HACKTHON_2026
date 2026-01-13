"use client";
import { useState, useEffect } from "react";
import { fetchUserReports } from "../../../backend/login/profilepost";
import style from "../styles/profile.module.css";

export default function StatsCard() {
    const [myPosts, setMyPosts] = useState([]); 
     const [loading, setLoading] = useState(true);

   useEffect(() => {
      const loadData = async  () => {
        const reports = await fetchUserReports();
        setMyPosts(reports);
        setLoading(false);
      }
      loadData();
    }, []);

    if (loading) return <p>Loading your reports...</p>;

  return (
   <div className={style.container}>
      <h1>My Reports ({myPosts.length})</h1>
      
      <div className={style.grid}>
        {myPosts.length > 0 ? (
          myPosts.map((post) => (
            <div key={post.id} className={style.card}>
              <div className={style.imgbox}>
              <img src={post.imageUrl} alt="Waste" className={style.postImg} />
              </div>
              <p className={style.postcardpara}>{post.description}</p>
              
            </div>
          ))
        ) : (
          <p>Aapne abhi tak koi report submit nahi ki hai.</p>
        )}
      </div>
    </div>
    
  );
}
