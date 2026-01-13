"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import style from "../styles/login.module.css";
import { User, Lock, ArrowRight, Mail, Loader2 } from "lucide-react";

import { auth, db } from "../../../backend/login/signup"; 

import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  // Username availability check
  const checkUsernameExists = async (uname) => {
    try {
      const q = query(collection(db, "users"), where("username", "==", uname));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (err) {
      console.error("Firestore Error:", err);                   
      return false;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault(); // Page refresh hone se rokta hai
    setLoading(true);

    try {
      if (isRegistering) {
        // --- SIGN UP LOGIC ---
        if (!username.trim()) {
          alert("Please enter a username");
          setLoading(false);
          return;
        }

        const exists = await checkUsernameExists(username);
        if (exists) {
          alert("Username taken! Choose another.");
          setLoading(false);
          return;
        }

        // Firebase Auth User Creation
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firestore mein entry
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          points: 0,
          views: 0,
          posts: 0,
          likes: 0,
          uid : user.uid,
          createdAt: new Date(),
        });

        router.push("/");
      } else {
        // --- LOGIN LOGIC ---
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user data from Firestore
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          router.push("/");
        } else {
          // Fallback agar Firestore data delete ho gaya ho
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Auth Error:", error.code);
      // Friendly Error Messages
      if (error.code === 'auth/user-not-found') alert("User not found. Please Sign Up.");
      else if (error.code === 'auth/wrong-password') alert("Incorrect Password.");
      else if (error.code === 'auth/email-already-in-use') alert("Email already registered.");
      else alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.container}>
      <div className={style.logoWrapper}>
        <div className={style.logoIcon}>
          <svg viewBox="0 0 24 24" width="32" height="32" fill="black">
            <path d="M3 6h18v2H3V6m2 3h14v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9m3 3v6h2v-6H8m4 0v6h2v-6h-2m4 0v6h2v-6h-2M9 2h6v2H9V2z" />
          </svg>
        </div>
      </div>

      <h1 className={style.title}>{isRegistering ? "Create Account" : "Welcome Back"}</h1>
      <p className={style.subtitle}>Report garbage, earn rewards.</p>

      <form className={style.form} onSubmit={handleAuth}>
        {/* Email Input */}
        <div className={style.inputGroup}>
          <label className={style.label}>EMAIL</label>
          <div className={style.inputWrapper}>
            <Mail size={18} className={style.icon} />
            <input
              type="email"
              placeholder="Enter your email"
              className={style.input}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Username Input (Sign Up Only) */}
        {isRegistering && (
          <div className={style.inputGroup}>
            <label className={style.label}>USERNAME</label>
            <div className={style.inputWrapper}>
              <User size={18} className={style.icon} />
              <input
                type="text"
                placeholder="Pick a unique username"
                className={style.input}
                required={isRegistering}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Password Input */}
        <div className={style.inputGroup}>
          <label className={style.label}>PASSWORD</label>
          <div className={style.inputWrapper}>
            <Lock size={18} className={style.icon} />
            <input
              type="password"
              placeholder="••••••••"
              className={style.input}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {!isRegistering && <p className={style.forgotText}>Forgot Password?</p>}
        </div>

        {/* Action Button */}
        <button type="submit" className={style.loginBtn} disabled={loading}>
          {loading ? <Loader2 className={style.spin} size={20} /> : (isRegistering ? "SIGN UP" : "LOGIN")}
          {!loading && <ArrowRight size={18} />}
        </button>

        {/* Switch Mode Button */}
        <button 
          type="button" 
          className={style.signupBtn} 
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "ALREADY HAVE AN ACCOUNT? LOGIN" : "CREATE NEW ACCOUNT"}
        </button>
      </form>

    </div>
  );
}