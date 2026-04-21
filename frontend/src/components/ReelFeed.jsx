import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../styles/reels.css'
import { loadReelActivity, saveReelActivity } from '../utils/userReelActivity.js'

function foodTitleName(item) {
  const n = item?.name
  if (n != null && String(n).trim() !== '') return String(n).trim()
  return 'Featured dish'
}

/** Shown as (⭐ x.x); uses item.rating when present, else a neutral default */
function formatFoodRating(item) {
  const r = item?.rating
  if (typeof r === 'number' && Number.isFinite(r)) return r.toFixed(1)
  const n = Number(r)
  if (!Number.isNaN(n) && r !== undefined && r !== null && r !== '') return n.toFixed(1)
  return '4.5'
}

// Reusable feed for vertical reels
// Props:
// - items: Array of video items { _id, video, description, likeCount, savesCount, commentsCount, comments, foodPartner }
// - onLike: (item) => void | Promise<void>
// - onSave: (item) => void | Promise<void>
// - onAddToCart: (item) => void | Promise<void>
// - emptyMessage: string
// - userId: string | null — per-user localStorage bucket reelbite_user_{id}
const ReelFeed = ({ items = [], onLike, onSave, onAddToCart, emptyMessage = 'No videos yet.', userId = null }) => {
  const videoRefs = useRef(new Map())
  const [hearts, setHearts] = useState([])
  const heartCounterRef = useRef(0)

  const [activeCommentItem, setActiveCommentItem] = useState(null)
  const [commentInput, setCommentInput] = useState('')
  const [localComments, setLocalComments] = useState(() => loadReelActivity(userId).commentsByVideoId)
  const [localLikes, setLocalLikes] = useState(() => loadReelActivity(userId).likeCounts)
  const [likedVideoIds, setLikedVideoIds] = useState(() => loadReelActivity(userId).likedVideoIds)
  const [localSaves, setLocalSaves] = useState(() => {
    try {
      const raw = localStorage.getItem("reelbite_saved")
      const arr = raw ? JSON.parse(raw) : []
      const map = {}
      if (Array.isArray(arr)) {
        arr.forEach((it) => {
          if (it?._id) map[it._id] = Math.max(it.savesCount ?? 0, 1)
        })
      }
      return map
    } catch {
      return {}
    }
  })
  const [localCartCounts, setLocalCartCounts] = useState({})
  const [likeAnimatedId, setLikeAnimatedId] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return

          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )

    videoRefs.current.forEach((vid) => observer.observe(vid))
    return () => observer.disconnect()
  }, [items])

  const skipPersistRef = useRef(true)

  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false
      return
    }
    saveReelActivity(userId, {
      likeCounts: localLikes,
      commentsByVideoId: localComments,
      likedVideoIds,
    })
  }, [userId, localLikes, localComments, likedVideoIds])

  const setVideoRef = (id) => (el) => {
    if (!el) {
      videoRefs.current.delete(id)
      return
    }
    videoRefs.current.set(id, el)
  }

  const handleLike = (item, event) => {
    const heartId = ++heartCounterRef.current
    setHearts((prev) => [...prev, { id: heartId, x: event.clientX, y: event.clientY }])

    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== heartId))
    }, 900)

    setLocalLikes((prev) => ({
      ...prev,
      [item._id]: (prev[item._id] ?? item.likes ?? item.likeCount ?? 0) + 1
    }))
    setLikedVideoIds((prev) => (prev.includes(item._id) ? prev : [...prev, item._id]))
    setLikeAnimatedId(item._id)
    setTimeout(() => setLikeAnimatedId(null), 320)

    if (onLike) onLike(item)
  }

  const handleSave = (item) => {
    try {
      const raw = localStorage.getItem("reelbite_saved")
      let arr = raw ? JSON.parse(raw) : []
      if (!Array.isArray(arr)) arr = []
      const idx = arr.findIndex((x) => x._id === item._id)
      if (idx >= 0) {
        arr.splice(idx, 1)
        setLocalSaves((prev) => ({
          ...prev,
          [item._id]: Math.max(0, (item.savesCount ?? 0) - 1),
        }))
      } else {
        arr.push({
          _id: item._id,
          video: item.video,
          description: item.description,
          likeCount: item.likeCount,
          savesCount: item.savesCount,
          commentsCount: item.commentsCount,
          foodPartner: item.foodPartner,
          name: item.name,
          price: item.price,
        })
        setLocalSaves((prev) => ({
          ...prev,
          [item._id]: (item.savesCount ?? 0) + 1,
        }))
      }
      localStorage.setItem("reelbite_saved", JSON.stringify(arr))
    } catch (e) {
      console.error(e)
    }

    if (onSave) onSave(item)
  }

  const handleAddToCart = (item) => {
    setLocalCartCounts((prev) => ({
      ...prev,
      [item._id]: (prev[item._id] ?? item.cartCount ?? 0) + 1
    }))

    if (onAddToCart) onAddToCart(item)
  }

  const getCommentsForItem = (item) => {
    const fromLocal = localComments[item._id]
    if (Array.isArray(fromLocal)) return fromLocal
    return Array.isArray(item.comments) ? item.comments : []
  }

  const openComments = (item) => {
    setActiveCommentItem(item)
    setCommentInput('')
    if (!localComments[item._id] && Array.isArray(item.comments)) {
      setLocalComments((prev) => ({ ...prev, [item._id]: item.comments }))
    }
  }

  const closeComments = () => {
    setActiveCommentItem(null)
    setCommentInput('')
  }

  const addComment = () => {
    if (!activeCommentItem) return
    const text = commentInput.trim()
    if (!text) return

    const nextComment = {
      _id: `local-${Date.now()}`,
      text,
      comment: text,
      content: text,
      user: 'You',
      userName: 'You',
      username: 'You'
    }

    setLocalComments((prev) => {
      const current = Array.isArray(prev[activeCommentItem._id])
        ? prev[activeCommentItem._id]
        : Array.isArray(activeCommentItem.comments)
          ? activeCommentItem.comments
          : []
      return { ...prev, [activeCommentItem._id]: [...current, nextComment] }
    })

    setCommentInput('')
  }

  const activeComments = useMemo(() => {
    if (!activeCommentItem) return []
    return getCommentsForItem(activeCommentItem)
  }, [activeCommentItem, localComments])

  const commentCountFor = (item) => {
    const local = localComments[item._id]
    if (Array.isArray(local)) return local.length
    return item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0)
  }

  const likeCountFor = (item) => {
    if (typeof localLikes[item._id] === 'number') return localLikes[item._id]
    return item.likes ?? item.likeCount ?? 0
  }

  const saveCountFor = (item) => {
    if (typeof localSaves[item._id] === 'number') return localSaves[item._id]
    return item.saves ?? item.savesCount ?? 0
  }

  const cartCountFor = (item) => {
    if (typeof localCartCounts[item._id] === 'number') return localCartCounts[item._id]
    return item.cartCount ?? 0
  }

  return (
    <div className="reels-page">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="floating-heart"
          style={{ left: `${heart.x}px`, top: `${heart.y}px` }}
        >
          ❤️
        </div>
      ))}

      <div className="reels-feed" role="list">
        {items.length === 0 && (
          <div className="empty-state">
            <p>{emptyMessage}</p>
          </div>
        )}

        {items.map((item) => (
          <section key={item._id} className="reel" role="listitem">
            <video
              ref={setVideoRef(item._id)}
              className="reel-video"
              src={item.video}
              muted
              playsInline
              loop
              preload="metadata"
            />

            <div className="reel-overlay">
              <div className="reel-overlay-gradient" aria-hidden="true" />

              <div className="reel-actions reel-actions-safe">
                <div className="reel-action-group">
                  <button
                    onClick={(e) => handleLike(item, e)}
                    className={`reel-action reel-action-like ${likeAnimatedId === item._id ? 'is-liked' : ''}`}
                    aria-label="Like"
                  >
                    <span className="reel-action__icon">❤️</span>
                  </button>
                  <div className="reel-action__count">{likeCountFor(item)}</div>
                </div>

                <div className="reel-action-group">
                  <button
                    className="reel-action"
                    onClick={() => handleSave(item)}
                    aria-label="Save"
                  >
                    <span className="reel-action__icon">🔖</span>
                  </button>
                  <div className="reel-action__count">{saveCountFor(item)}</div>
                </div>

                <div className="reel-action-group">
                  <button className="reel-action" onClick={() => openComments(item)} aria-label="Comments">
                    <span className="reel-action__icon">💬</span>
                  </button>
                  <div className="reel-action__count">{commentCountFor(item)}</div>
                </div>

                <div className="reel-action-group">
                  <button
                    className="reel-action"
                    onClick={() => handleAddToCart(item)}
                    aria-label="Add to Cart"
                  >
                    <span className="reel-action__icon">🛒</span>
                  </button>
                  <div className="reel-action__count">{cartCountFor(item)}</div>
                </div>
              </div>

              <div className="reel-content reel-content-safe">
                <h2 className="reel-food-title">
                  <span className="reel-food-name">{foodTitleName(item)}</span>
                  <span className="reel-food-rating">{' '}(⭐ {formatFoodRating(item)})</span>
                </h2>
                {item.description?.trim() ? (
                  <p className="reel-description">{item.description}</p>
                ) : null}
                {item.foodPartner && (
                  <Link
                    className="reel-btn"
                    to={'/food-partner/' + item.foodPartner}
                    aria-label={`Visit store for ${foodTitleName(item)}`}
                  >
                    Visit Store
                  </Link>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {activeCommentItem && (
        <div className="comments-sheet-backdrop" onClick={closeComments}>
          <div
            className="comments-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Comments"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="comments-sheet__header">
              <h3>Comments</h3>
              <button className="comments-sheet__close" onClick={closeComments} aria-label="Close comments">
                ✕
              </button>
            </div>

            <div className="comments-sheet__list">
              {activeComments.length === 0 ? (
                <p className="comments-sheet__empty">No comments yet.</p>
              ) : (
                activeComments.map((comment) => (
                  <div key={comment._id ?? Math.random()} className="comment-item">
                    <span className="comment-item__author">
                      {comment.userName || comment.username || comment.user || 'User'}
                    </span>
                    <span className="comment-item__text">
                      {comment.text || comment.comment || comment.content || ''}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="comments-sheet__inputRow">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
                className="comments-sheet__input"
              />
              <button className="comments-sheet__send" onClick={addComment} aria-label="Post comment">
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReelFeed