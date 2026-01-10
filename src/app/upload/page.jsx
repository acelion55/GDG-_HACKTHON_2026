"use client";
import React, { useState } from "react";
import style from "../styles/uploadpage.module.css";
import { Camera, MapPin, ChevronRight, ArrowLeft, HelpCircle, Send } from "lucide-react";

const UploadReport = () => {
  // 1. State for Form Data
  const [formData, setFormData] = useState({
    description: "",
    areaImpact: "High",
    garbageType: "Plastic",
    location: null,
    image: null,
    imagePreview: null,
  });

  // 2. Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file), // Preview dikhane ke liye
      });
    }
  };

  // 3. Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Data to Server:", formData);
    alert("Report Submitted Successfully! You earned 100 ZAP points.");
    // Yahan aap apna Firebase ya API call daal sakte hain
  };

  return (
    <div className={style.uploadpage}>
      <div className={style.navbar}>
        <ArrowLeft className={style.navIcon} onClick={() => window.history.back()} />
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
              <img src={formData.imagePreview} alt="Preview" className={style.previewImg} />
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
              onChange={(e) => setFormData({...formData, description: e.target.value})}
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
              onChange={(e) => setFormData({...formData, areaImpact: e.target.value})}
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
              onChange={(e) => setFormData({...formData, garbageType: e.target.value})}
            >
              <option value="Plastic">Plastic</option>
              <option value="Organic">Organic</option>
              <option value="Metal">Metal</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className={style.submitButton}>
          SUBMIT REPORT <Send size={18} style={{marginLeft: '10px'}} />
        </button>
      </form>
    </div>
  );
};

export default UploadReport;