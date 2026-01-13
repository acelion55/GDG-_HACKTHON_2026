"use client";
import React, { useState } from "react";
import { auth,db } from "../../../backend/login/signup";
import style from "../styles/uploadpage.module.css";
import { collection, addDoc, serverTimestamp, updateDoc, doc, increment} from "firebase/firestore";
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

  const uploadToCloudinary = async (file) => {
    const cloudName=process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset=process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
    
    if (!cloudName || !uploadPreset) {
      console.error("Cloudinary credentials missing in .env file!");
      return null;
    }

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: data }
    );
    const fileData = await res.json();
    return fileData.secure_url;
  };

  const handleSubmit = async (e) => {
 
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("please login first to submit a report!")
      return;
    }

    // checking if image is inserted or not
    if (!formData.image) {
      alert("Please upload a photo first!");
      return;
    }

    setIsUploading(true); 

    try {
      // sending image to cloudinary
      console.log("Uploading image to Cloudinary...");
      const imageUrl = await uploadToCloudinary(formData.image);

      if (!imageUrl) throw new Error("Image upload failed");

     const finalReportData = {
      userId: user.uid,
        description: formData.description,
        areaImpact: formData.areaImpact,
        garbageType: formData.garbageType,
        imageUrl: imageUrl, 
        status: "pending",
        createdAt: serverTimestamp(),
      };


      alert("Report Submitted Successfully!");
      
      await addDoc(collection(db, "reports"), finalReportData);

      // 3. User ka post count badhayein (+1)
  const userRef = doc(db, "users", auth.currentUser.uid); // User ka rasta
  
  await updateDoc(userRef, {
    posts: increment(1), // Automatic +1 ho jayega
     //zapPoints: increment(100) Sath mein points bhi badha sakte hain!
  });

  alert("Post updated and 100 points earned!");
      setFormData({
        description: "", areaImpact: "High", garbageType: "Plastic",
        location: null, image: null, imagePreview: null,
      });

    } catch (error) {
      console.error("Error during submission:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsUploading(false); // Loading stop
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
