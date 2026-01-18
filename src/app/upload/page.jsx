"use client";
import React, { useState } from "react";
import { auth, db } from "../../../backend/login/signup";
import style from "../styles/uploadpage.module.css";
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
    address: null,
    fullAddress: null,
    area: null,
    city: null,
    state: null,
    image: null,
    imagePreview: null,
  });
  const [manualLocationInput, setManualLocationInput] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLon, setManualLon] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [addressDetails, setAddressDetails] = useState({
    shortadd: "",
  });


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

  const buildFullAddress = (shortadd, area, city, state) => {
    return [shortadd, area, city, state]
      .filter(Boolean)
      .join(", ");
  };

  // converting image to string 
  const convertToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(file);
    });
  };

  // Get full address from coordinates and parse into components
  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      console.log("[Location] Fetching address from coordinates...");

      // Using OpenStreetMap Nominatim API (free, no API key required)
      // Using zoom=18 for maximum detail (building level accuracy)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&extratags=1&namedetails=1`,
        {
          headers: {
            'User-Agent': 'GDG-Hack-App/1.0', // Required by Nominatim
            'Accept-Language': 'en' // Request English language results
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      console.log("[Location] Address data received:", data);

      if (!data || !data.address) {
        // Fallback to coordinates if address not available
        return {
          area: null,
          city: null,
          state: null
        };
      }

      const address = data.address;

      // Parse address components
      // Different countries have different address structures
      // This handles common formats (India, US, etc.)
      let area = null;
      let city = null;
      let state = null;
      let fullAddress = data.display_name || "";

      // Try to extract area/colony (prioritize more specific locations first)
      area = address.road ||                    // Street name
        address.house_number ||             // House/building number
        address.suburb ||                   // Suburb/neighborhood
        address.neighbourhood ||            // Neighborhood
        address.village ||                  // Village
        address.locality ||                 // Locality
        address.quarter ||                  // Quarter
        address.district ||                // District
        address.area ||
        null;

      // Try to extract city (prioritize city over town)
      city = address.city ||                     // City
        address.town ||                     // Town
        address.district ||                 // District (if no city)
        address.county ||                   // County
        address.postcode ||                 // Postal code area
        null;

      // Try to extract state (could be state, region, province, etc.)
      state = address.state ||                   // State
        address.region ||                  // Region
        address.province ||                // Province
        address.state_district ||          // State district
        null;

      // If city is not found but area is, use area as city
      if (!city && area) {
        city = area;
      }

      // Build a more detailed area string if we have road/house number
      if (address.road) {
        const roadInfo = [address.house_number, address.road].filter(Boolean).join(' ');
        if (roadInfo && !area) {
          area = roadInfo;
        } else if (roadInfo && area !== roadInfo) {
          area = `${roadInfo}, ${area}`;
        }
      }

      console.log("[Location] Parsed address:", {
        fullAddress,
        area,
        city,
        state
      });

      return {
        fullAddress,
        area,
        city,
        state
      };
    } catch (error) {
      console.error('[Location] Error fetching address:', error);
      // Fallback to coordinates if address fetch fails
      return {
        fullAddress: `${latitude}, ${longitude}`,
        area: null,
        city: null,
        state: null
      };
    }
  };

  const getLocation = async () => {
    // Prevent multiple simultaneous requests
    if (isGettingLocation) {
      console.log("[Location] Already fetching location, ignoring request");
      return;
    }

    setIsGettingLocation(true);
    console.log("[Location] Starting geolocation capture...");
    console.log("[Location] Protocol:", window.location.protocol);
    console.log("[Location] Host:", window.location.host);

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.error("[Location] Geolocation not supported");
      alert("❌ Geolocation is not supported by your browser.\n\nPlease:\n1. Use HTTPS (not HTTP)\n2. Or manually enter coordinates\n3. Or check browser permissions");
      setIsGettingLocation(false);
      return;
    }

    // Check if running on HTTP (not HTTPS or localhost)
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.warn("[Location] Running on HTTP - geolocation may not work");
      const proceed = confirm("⚠️ Geolocation requires HTTPS.\n\nYou're currently on HTTP. Location may not work.\n\nDo you want to try anyway?");
      if (!proceed) {
        setIsGettingLocation(false);
        setManualLocationInput(true);
        return;
      }
    }

    console.log("[Location] Requesting getCurrentPosition...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
          // Log with full precision and accuracy info
          console.log("[Location] Got position - Full precision:", {
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            latitudeRaw: latitude,
            longitudeRaw: longitude,
            accuracy: `${accuracy} meters`,
            altitude: altitude || 'N/A',
            heading: heading || 'N/A',
            speed: speed || 'N/A'
          });

          // Warn if accuracy is poor
          if (accuracy > 100) {
            console.warn(`[Location] Low accuracy: ${accuracy}m. Location may not be exact.`);
          } else if (accuracy <= 10) {
            console.log(`[Location] High accuracy: ${accuracy}m. Location is very precise.`);
          }

          // Get full address from coordinates
          const addressData = await getAddressFromCoordinates(latitude, longitude);

          setFormData((prevData) => ({
            ...prevData,
            location: {
              latitude: latitude,  // Store original full precision
              longitude: longitude // Store original full precision
            },
            address: `${latitude.toString()}, ${longitude.toString()}`,
            fullAddress: addressData.fullAddress,
            area: addressData.area,
            city: addressData.city,
            state: addressData.state,
          }));
          setManualLocationInput(false);
          setIsGettingLocation(false);
          setShowAddressDetails(true); // Show address details input form

          // Show success notification
          const locationInfo = [addressData.area, addressData.city, addressData.state]
            .filter(Boolean)
            .join(", ");
          alert(`✅ Location captured!\n\n📍 ${locationInfo || `${latitude}, ${longitude}`}`);

        } catch (err) {
          console.error("[Location] Error processing position:", err);
          alert("Error processing location: " + err.message);
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("[Location] Geolocation error:", error);
        console.error("[Location] Error code:", error.code);
        console.error("[Location] Error message:", error.message);

        let errorMsg = "❌ Unable to fetch location";
        let helpText = "";

        if (error.code === 1) {
          errorMsg = "Permission denied";
          helpText = "\n\n✓ Solution:\n• Click location icon in address bar\n• Select 'Allow' for location access\n• Reload page and try again\n\n• OR use manual entry below";
        } else if (error.code === 2) {
          errorMsg = "Position unavailable";
          helpText = "\n\n✓ Try:\n• Enable location on your device\n• Move to an open area\n• Use manual entry as fallback";
        } else if (error.code === 3) {
          errorMsg = "Location request timed out";
          helpText = "\n\n✓ Try:\n• Check internet connection\n• Try again in a few seconds\n• Use manual entry as fallback";
        }

        alert(errorMsg + helpText);
        setManualLocationInput(true);
        setIsGettingLocation(false);
      },
      {
        timeout: 30000, // 30 seconds timeout for better accuracy
        enableHighAccuracy: true, // Use GPS if available for better accuracy
        maximumAge: 0 // Always get fresh location, don't use cached
      }
    );
  };

  const handleManualLocationSubmit = async () => {
    if (!manualLat || !manualLon) {
      alert("Please enter both latitude and longitude");
      return;
    }

    try {
      const lat = parseFloat(manualLat);
      const lon = parseFloat(manualLon);

      if (isNaN(lat) || isNaN(lon)) {
        alert("Please enter valid numbers");
        return;
      }

      if (lat < -90 || lat > 90) {
        alert("Latitude must be between -90 and 90");
        return;
      }

      if (lon < -180 || lon > 180) {
        alert("Longitude must be between -180 and 180");
        return;
      }

      console.log("[Location] Using manual coordinates - Full precision:", {
        lat: lat.toString(),
        lon: lon.toString(),
        latRaw: lat,
        lonRaw: lon
      });


      // Get full address from coordinates
      const addressData = await getAddressFromCoordinates(lat, lon);

      setFormData((prevData) => ({
        ...prevData,
        location: {
          latitude: lat,  // Store original full precision
          longitude: lon  // Store original full precision
        },
        address: `${lat.toString()}, ${lon.toString()}`,
        fullAddress: addressData.fullAddress,
        area: addressData.area,
        city: addressData.city,
        state: addressData.state,
      }));

      setManualLocationInput(false);
      setManualLat("");
      setManualLon("");
      setShowAddressDetails(true); // Show address details input form

      // Show success notification
      const locationInfo = [addressData.area, addressData.city, addressData.state]
        .filter(Boolean)
        .join(", ");
      alert(`✅ Location set!\n\n📍 ${locationInfo || `${lat}, ${lon}`}`);
    } catch (error) {
      console.error("[Location] Error setting manual location:", error);
      alert("Error: " + error.message);
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary credentials missing in .env.local");
    }

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

    if (!res.ok) {
      throw new Error(`Cloudinary upload failed: ${res.statusText}`);
    }

    const fileData = await res.json();

    if (!fileData.secure_url) {
      throw new Error("Cloudinary did not return image URL");
    }

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

      // Call API to check if image contains garbage
      const checkRes = await fetch("/api/check-garbage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: base64Data,
          mimeType: formData.image.type,
        }),
      });

      const checkData = await checkRes.json();
      console.log("AI Analysis Result:", checkData);

      if (!checkRes.ok) {
        throw new Error(checkData.explanation || "AI Analysis failed");
      }

      // IMPORTANT: Only upload if garbage IS detected
      if (!checkData.isGarbage) {
        alert(
          "No garbage detected! Please upload a clear photo of waste/garbage."
        );
        setIsUploading(false);
        return;
      }

      alert("Garbage detected! Proceeding with upload...");

      // Step 2: Cloudinary Upload
      console.log("Uploading image to Cloudinary...");
      const imageUrl = await uploadToCloudinary(formData.image);
      if (!imageUrl) throw new Error("Image upload failed");

      // Step 3: Firestore Database Save
      const finalFullAddress = buildFullAddress(
        addressDetails.shortadd,
        formData.area,
        formData.city,
        formData.state
      );

      const reportData = {
        userId: user.uid,
        description: formData.description,
        areaImpact: formData.areaImpact,
        garbageType: formData.garbageType,
        imageUrl,

        location: formData.location,

        shortadd: addressDetails.shortadd || null,
        area: formData.area,
        city: formData.city,
        state: formData.state,

        // 🔥 FINAL ADDRESS
        fullAddress: finalFullAddress,

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

      alert("Success! 100 Points earned!");
      setFormData({
        description: "",
        areaImpact: "High",
        garbageType: "Plastic",
        location: null,
        address: null,
        fullAddress: null,
        area: null,
        city: null,
        state: null,
        image: null,
        imagePreview: null,
      });
      setAddressDetails({
        shortadd: "",
      });
      setShowAddressDetails(false);
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

        {/* GPS Location Section */}
        <div
          className={style.locationBox}
          onClick={!isGettingLocation ? getLocation : undefined}
          style={{
            opacity: isGettingLocation ? 0.6 : 1,
            cursor: isGettingLocation ? "wait" : "pointer",
            pointerEvents: isGettingLocation ? "none" : "auto"
          }}
        >
          <div className={style.iconWrapper}>
            <MapPin size={24} color={isGettingLocation ? "#FFA500" : "#39FF14"} />
          </div>
          <div className={style.locationTextWrapper}>

            {formData.location
              ? <p className={style.locationTitle}>
                Location fetched ✓
              </p>
              : <p className={style.locationTitle}>
                {isGettingLocation ? "FETCHING LOCATION..." : "SEND GPS LOCATION"}
              </p>}

            <p className={style.locationSub}>
              {isGettingLocation
                ? "Please allow location access in your browser..."
                : formData.location
                  ? (() => {
                    const locationParts = [formData.area, formData.city, formData.state].filter(Boolean);
                    return locationParts.length > 0
                      ? locationParts.join(", ")
                      : `Lat: ${formData.location.latitude.toString()}, Lon: ${formData.location.longitude.toString()}`;
                  })()
                  : "Tap to auto-detect current position"}
            </p>

            {formData.location && (formData.area || formData.city || formData.state) && (
              <p className={style.locationCoords} style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                📍 {buildFullAddress(
                  addressDetails.shortadd,
                  formData.area,
                  formData.city,
                  formData.state
                )}

                Lat: {formData.location.latitude.toFixed(6)} |
                Lon: {formData.location.longitude.toFixed(6)}
              </p>
            )}

          </div>

          <ChevronRight size={20} color={isGettingLocation ? "#FFA500" : "#666"} />
        </div>

        {/* Address Details Input Form */}
        {showAddressDetails && formData.location && (
          <div className={style.section} style={{
            backgroundColor: "rgba(57, 255, 20, 0.1)",
            padding: "1rem",
            borderRadius: "12px",
            border: "1px solid rgba(57, 255, 20, 0.3)",
            marginTop: "1rem"
          }}>
            <label className={style.sectionLabel}>📍 ADD ADDRESS IN DETAILED</label>
            <p style={{ fontSize: "0.85rem", color: "#39FF14", marginBottom: "1rem" }}>
              {[formData.area, formData.city, formData.state].filter(Boolean).join(", ")}
            </p>

            <input
              type="text"
              placeholder="Gali No., House No., etc....."
              value={addressDetails.shortadd}
              onChange={(e) => setAddressDetails({ ...addressDetails, shortadd: e.target.value })}
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "0.5rem",
                backgroundColor: "#1e293b",
                border: "1px solid #39FF14",
                borderRadius: "8px",
                color: "white",
              }}
            />


            <button
              type="button"
              onClick={() => setShowAddressDetails(false)}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "transparent",
                color: "#39FF14",
                border: "1px solid #39FF14",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ✓ Done
            </button>
          </div>
        )}

        {/* Manual Location Input */}
        {manualLocationInput && (
          <div className={style.section} style={{
            backgroundColor: "rgba(255, 107, 107, 0.1)",
            padding: "1rem",
            borderRadius: "12px",
            border: "1px solid rgba(255, 107, 107, 0.3)"
          }}>
            <label className={style.sectionLabel}>🧭 ENTER LOCATION MANUALLY</label>
            <input
              type="number"
              step="0.00001"
              placeholder="Latitude (-90 to 90)"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "0.5rem",
                backgroundColor: "#1e293b",
                border: "1px solid #39FF14",
                borderRadius: "8px",
                color: "white",
              }}
            />
            <input
              type="number"
              step="0.00001"
              placeholder="Longitude (-180 to 180)"
              value={manualLon}
              onChange={(e) => setManualLon(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                marginBottom: "0.75rem",
                backgroundColor: "#1e293b",
                border: "1px solid #39FF14",
                borderRadius: "8px",
                color: "white",
              }}
            />
            <button
              type="button"
              onClick={handleManualLocationSubmit}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "#39FF14",
                color: "black",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ✓ Set Location
            </button>
          </div>
        )}

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