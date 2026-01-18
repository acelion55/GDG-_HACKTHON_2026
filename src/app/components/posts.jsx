"use client"
import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "../styles/posts.module.css";
import Profusernme from "./prof_usernme";
import { auth, db } from "../../../backend/login/signup";
import { collection, query, getDocs, orderBy, limit, doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { Heart } from "lucide-react";

const Posts = ({ username }) => {
  const [posts, setPosts] = useState([]);
  const [loadedPostIds, setLoadedPostIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [viewedPostIds, setViewedPostIds] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [postLikes, setPostLikes] = useState({});
  const observerRefs = useRef([]);
  const postRefMap = useRef({});
  const allFetchedPostsRef = useRef([]); // Store all fetched posts
  const allFetchedPostIdsRef = useRef(new Set()); // Track all fetched post IDs to avoid duplicates

  // Get current user ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle like/unlike post
  const handleLikePost = async (postId, isLiked) => {
    if (!currentUserId) return;

    try {
      const postRef = doc(db, "reports", postId);
      const userRef = doc(db, "users", currentUserId);
      
      if (isLiked) {
        // Unlike: remove user from likedBy array
        await updateDoc(postRef, {
          likedBy: arrayRemove(currentUserId),
          likesCount: increment(-1),
        });
        await updateDoc(userRef, {
          likes: increment(-1),
        });
      } else {
        // Like: add user to likedBy array
        await updateDoc(postRef, {
          likedBy: arrayUnion(currentUserId),
          likesCount: increment(1),
        });
        await updateDoc(userRef, {
          likes: increment(1),
        });
      }
      
      // Update local posts state to reflect the like/unlike
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const likedBy = post.likedBy || [];
            if (isLiked) {
              // Remove user from likedBy
              return {
                ...post,
                likedBy: likedBy.filter((uid) => uid !== currentUserId),
                likesCount: (post.likesCount || 1) - 1,
              };
            } else {
              // Add user to likedBy
              return {
                ...post,
                likedBy: [...likedBy, currentUserId],
                likesCount: (post.likesCount || 0) + 1,
              };
            }
          }
          return post;
        })
      );
    } catch (error) {
      console.error("Error updating like:", error);
    }
  };

  // Increment view count for a post
  const incrementPostView = async (postId) => {
    try {
      const postRef = doc(db, "reports", postId);
      await updateDoc(postRef, {
        views: increment(1),
      });
    } catch (error) {
      console.error("Error incrementing post views:", error);
    }
  };

  // Fetch random posts from all users
  const fetchRandomPosts = useCallback(async () => {
    // Don't fetch if currentUserId is not set yet or if already loading
    if (!currentUserId || loading) return;

    try {
      setLoading(true);
      const reportsRef = collection(db, "reports");
      
      // Query reports ordered by creation date (random-ish)
      const q = query(
        reportsRef,
        orderBy("createdAt", "desc"),
        limit(100) // Fetch more posts for randomness
      );
      
      const querySnapshot = await getDocs(q);
      let allPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter out posts from current user and already fetched posts
      allPosts = allPosts.filter((post) => 
        post.userId !== currentUserId && !allFetchedPostIdsRef.current.has(post.id)
      );

      if (allPosts.length === 0) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Fetch usernames for each post
      allPosts = await Promise.all(
        allPosts.map(async (post) => {
          try {
            const userRef = doc(db, "users", post.userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              return {
                ...post,
                username: userSnap.data().username,
              };
            }
          } catch (error) {
            console.error("Error fetching username:", error);
          }
          return post;
        })
      );

      // Initialize like counts and check which posts current user liked
      const likes = {};
      const liked = new Set();
      allPosts.forEach((post) => {
        likes[post.id] = post.likesCount || 0;
        if (post.likedBy && post.likedBy.includes(currentUserId)) {
          liked.add(post.id);
        }
        // Add to fetched posts tracking
        allFetchedPostIdsRef.current.add(post.id);
      });
      
      setPostLikes((prev) => ({ ...prev, ...likes }));
      setLikedPosts((prev) => new Set([...prev, ...liked]));

      // Shuffle posts for randomness
      const shuffledPosts = allPosts.sort(() => Math.random() - 0.5);
      
      // Append new posts to existing ones
      setPosts((prevPosts) => [...prevPosts, ...shuffledPosts]);
      
      // Add new posts to allFetchedPostsRef
      allFetchedPostsRef.current = [...allFetchedPostsRef.current, ...shuffledPosts];
      
      // Load all new posts immediately
      if (shuffledPosts.length > 0) {
        const newPostIds = new Set();
        shuffledPosts.forEach((post) => {
          newPostIds.add(post.id);
        });
        
        setLoadedPostIds((prev) => new Set([...prev, ...newPostIds]));
      }
      
      setHasMore(shuffledPosts.length >= 100);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setLoading(false);
    }
  }, [currentUserId]);

  // Load more posts on scroll
  const loadMorePosts = useCallback(() => {
    if (loading || !hasMore) return;
    // Fetch more posts when user scrolls
    fetchRandomPosts();
  }, [loading, hasMore, fetchRandomPosts]);

  // Setup Intersection Observer for lazy loading
  useEffect(() => {
    const observersList = [];
    
    observerRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Get post ID from the ref map
              const postId = postRefMap.current[index];
              
              if (postId && !viewedPostIds.has(postId)) {
                // console.log("Incrementing view for post:", postId);
                incrementPostView(postId);
                setViewedPostIds((prev) => new Set([...prev, postId]));
              }
              
              loadMorePosts();
            }
          });
        },
        { threshold: 0.5 } // Trigger when 50% of post is visible
      );

      observer.observe(ref);
      observersList.push(observer);
    });

    return () => {
      observersList.forEach((observer) => observer.disconnect());
    };
  }, [loadMorePosts, viewedPostIds, incrementPostView]);

  // Initial fetch - trigger when currentUserId is available
  useEffect(() => {
    if (currentUserId && posts.length === 0) {
      fetchRandomPosts();
    }
  }, [currentUserId, fetchRandomPosts, posts.length]);

  // Load more when user scrolls near bottom
  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage =
        (window.innerHeight + window.scrollY) / document.body.offsetHeight;
      if (scrollPercentage > 0.8 && !loading && hasMore) {
        // Fetch more posts when user reaches 80% of the page
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMorePosts, loading, hasMore]);

  return (
    <div className={styles.postsContainer}>
      {posts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <p className={styles.emptyText}>{loading ? "Loading posts..." : "No posts available"}</p>
        </div>
      ) : (
        posts
          .filter((post) => post.userId !== currentUserId)
          .map((post, index) => (
          <div
            key={post.id}
            className={styles.postWrapper}
            ref={(el) => {
              observerRefs.current[index] = el;
              if (el) {
                postRefMap.current[index] = post.id;
              }
            }} 
            id={`post-${post.id}`}
          >
            {loadedPostIds.has(post.id) ? (
              <div className={styles.postCard}>
                {/* Header with User Info */}
                <div className={styles.postHeader}>
                  <Profusernme username={post.username || "Anonymous"} />
                </div>

                {/* Image Section */}
                <div className={styles.postImageContainer}>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      className={styles.postImage}
                      alt="Post"
                    />
                  )}
                </div>

                {/* Content Section */}
                <div className={styles.postContent}>
                 

                  {/* Description */}
                  <div className={styles.description}>
                    {post.description}
                  </div>

                  {/* Location/Address */}
                  {post.address && (
                    <div className={styles.locationInfo}>
                      📍 {post.address}
                    </div>
                  )}

                  {/* Post Meta Info */}
                  <div className={styles.postMeta}>
                    <span className={styles.metaViews}>👁️ {post.views || 0} views</span>
                    <span className={styles.metaType}>{post.garbageType && `🗑️ ${post.garbageType}`}</span>
                  </div>

                 {/* Like Button with Stats */}
                   <div className={styles.likeSection}>
                    {currentUserId && (
                      <button
                        onClick={() => {
                          const isLiked = post.likedBy && post.likedBy.includes(currentUserId);
                          handleLikePost(post.id, isLiked);
                        }}
                        className={styles.likeButton}
                      >
                        {currentUserId && post.likedBy && post.likedBy.includes(currentUserId) ? (
                          <>
                            <Heart
                              size={22}
                              fill="#ff4444"
                              color="#ff4444"
                              className={styles.likeIcon}
                            />
                            <span className={`${styles.likeCount} ${styles.likeCountLiked}`}>
                              {post.likesCount || 0} {post.likesCount === 1 ? "Like" : "Likes"}
                            </span>
                          </>
                        ) : (
                          <>
                            <Heart
                              size={22}
                              fill="none"
                              color="#999"
                              className={styles.likeIcon}
                            />
                            <span className={`${styles.likeCount} ${styles.likeCountUnliked}`}>
                              {post.likesCount || 0} {post.likesCount === 1 ? "Like" : "Likes"}
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))
      )}
      {!hasMore && posts.length > 0 && (
        <div className={styles.endMessage}>
          <p>✓ No more posts to load</p>
        </div>
      )}
    </div>
  );
};

export default Posts;
