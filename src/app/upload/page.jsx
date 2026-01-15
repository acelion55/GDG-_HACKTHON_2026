"use client";
import React, { useState } from "react";
import { auth, db } from "../../../backend/login/signup";
import style from "../styles/uploadpage.module.css";
import checkIsGarbage from "../../../backend/login/aigarbagecheck"; // Server Action
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";
import {
  Camera,
  MapPin,
  ChevronRight,
  ArrowLeft,
  HelpCircle,
  Send,
} from "lucide-react";

const UploadReport = () => {
  const [formData, setFormData] = useState({
    description: "",
    areaImpact: "High",
    garbageType: "Plastic",
    location: null,
    image: null,
    imagePreview: null,
  });
  const [isUploading, setIsUploading] = useState(false);

  // --- Helpers ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file),
      });
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: data,
      }
    );
    const fileData = await res.json();
    return fileData.secure_url;
  };

  // --- Main Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) return alert("Please login first!");
    if (!formData.image) return alert("Please upload a photo first!");

    setIsUploading(true);

    try {
      // Step 1: AI Analysis
      console.log("AI Scanning for garbage...");
      const base64Data = await convertToBase64(formData.image);
      const isGarbageFound = await checkIsGarbage(
        base64Data,
        formData.image.type
      );

      const { isGarbage, explanation } = await checkIsGarbage(base64Data, formData.image.type);

      alert("AI Analysis: " + explanation);

      if (!isGarbageFound) {
        alert(
          "AI Alert: Garbage not detected! Please upload a clear photo of waste."
        );
        setIsUploading(false);
        return;
      }

      // Step 2: Cloudinary Upload
      console.log("Uploading image...");
      const imageUrl = await uploadToCloudinary(formData.image);
      if (!imageUrl) throw new Error("Image upload failed");

      // Step 3: Firestore Database Save
      const reportData = {
        userId: user.uid,
        description: formData.description,
        areaImpact: formData.areaImpact,
        garbageType: formData.garbageType,
        imageUrl: imageUrl,
        status: "pending",
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "reports"), reportData);

      // Step 4: Update User Profile (ZAP Points)
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        posts: increment(1),
        zapPoints: increment(100),
      });

      alert("Success! 100 Points earned! 🚀");
      setFormData({
        description: "",
        areaImpact: "High",
        garbageType: "Plastic",
        location: null,
        image: null,
        imagePreview: null,
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={style.uploadpage}>
      <div className={style.navbar}>
        <ArrowLeft
          className={style.navIcon}
          onClick={() => window.history.back()}
        />
        <h1 className={style.navTitle}>NEW REPORT</h1>
        <HelpCircle className={style.navIcon} />
      </div>

      <form className={style.formContainer} onSubmit={handleSubmit}>
        {/* Evidence Photo Section */}
        <div className={style.section}>
          <label className={style.sectionLabel}>EVIDENCE PHOTO</label>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
          <label htmlFor="imageInput" className={style.photoUploadBox}>
            {formData.imagePreview ? (
              <img
                src={formData.imagePreview}
                alt="Preview"
                className={style.previewImg}
              />
            ) : (
              <>
                <div className={style.cameraCircle}>
                  <Camera size={32} color="black" />
                </div>
                <p className={style.uploadText}>Tap to upload photo</p>
                <span className={style.uploadSubtext}>JPG, PNG up to 10MB</span>
              </>
            )}
          </label>
        </div>

        {/* GPS Location Section (Simulation) */}
        <div
          className={style.locationBox}
          onClick={() => alert("Fetching GPS Location...")}
        >
          <div className={style.iconWrapper}>
            <MapPin size={24} color="#39FF14" />
          </div>
          <div className={style.locationTextWrapper}>
            <p className={style.locationTitle}>Send GPS Location</p>
            <p className={style.locationSub}>Auto-detect current position</p>
          </div>
          <ChevronRight size={20} color="#666" />
        </div>

        {/* Description Section */}
        <div className={style.section}>
          <label className={style.sectionLabel}>DESCRIPTION</label>
          <div className={style.inputWrapper}>
            <textarea
              name="description"
              placeholder="Describe the issue in detail..."
              className={style.textArea}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className={style.statsRow}>
          <div className={style.statBox}>
            <label className={style.statLabel}>AREA IMPACT</label>
            <select
              className={style.selectInput}
              value={formData.areaImpact}
              onChange={(e) =>
                setFormData({ ...formData, areaImpact: e.target.value })
              }
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className={style.statBox}>
            <label className={style.statLabel}>GARBAGE TYPE</label>
            <select
              className={style.selectInput}
              value={formData.garbageType}
              onChange={(e) =>
                setFormData({ ...formData, garbageType: e.target.value })
              }
            >
              <option value="Plastic">Plastic</option>
              <option value="Organic">Organic</option>
              <option value="Metal">Metal</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={style.submitButton}
          disabled={isUploading}
        >
          {isUploading ? "UPLOADING..." : "SUBMIT REPORT"}
          {!isUploading && <Send size={18} style={{ marginLeft: "10px" }} />}
        </button>
      </form>
    </div>
  );
};

export default UploadReport;
