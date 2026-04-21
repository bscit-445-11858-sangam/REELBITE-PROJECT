import React, { useState, useEffect } from 'react'
import '../../styles/profile.css'
import { useParams } from 'react-router-dom'
import axios from 'axios'

const AVATAR_FALLBACK =
  'https://images.unsplash.com/photo-1754653099086-3bddb9346d37?w=500&auto=format&fit=crop&q=60'

const Profile = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [videos, setVideos] = useState([])

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/food-partner/${id}`, { withCredentials: true })
      .then((response) => {
        setProfile(response.data.foodPartner)
        setVideos(response.data.foodPartner.foodItems ?? [])
      })
  }, [id])

  const totalMeals =
    profile != null
      ? profile.totalMeals != null
        ? profile.totalMeals
        : videos.length
      : 0
  const customersServed = profile?.customersServed ?? 0

  return (
    <main className="profile-page">
      <section className="profile-card" aria-label="Partner profile">
        <div className="profile-card__top">
          <div className="profile-card__avatar-wrap">
            <img
              className="profile-avatar"
              src={profile?.imageUrl || profile?.logoUrl || AVATAR_FALLBACK}
              alt=""
            />
          </div>
          <div className="profile-card__info">
            <h1 className="profile-card__name">{profile?.name ?? 'Restaurant'}</h1>
            <p className="profile-card__location">
              <span className="profile-card__location-icon" aria-hidden="true">
                📍
              </span>
              {profile?.address ?? 'Location not set'}
            </p>
          </div>
        </div>

        <div className="profile-stats" role="list" aria-label="Partner statistics">
          <div className="profile-stat" role="listitem">
            <span className="profile-stat__value">{totalMeals}</span>
            <span className="profile-stat__label">Total Meals</span>
          </div>
          <div className="profile-stat profile-stat--divider" aria-hidden="true" />
          <div className="profile-stat" role="listitem">
            <span className="profile-stat__value">{customersServed}</span>
            <span className="profile-stat__label">Customers Served</span>
          </div>
        </div>
      </section>

      <section className="profile-food" aria-label="Food items">
        <h2 className="profile-food__title">Your dishes</h2>
        <div className="profile-grid">
          {videos.map((v) => (
            <article key={v._id ?? v.id} className="profile-grid-item">
              <div className="profile-grid-media">
                <video
                  className="profile-grid-video"
                  src={v.video}
                  muted
                  playsInline
                  loop
                  preload="metadata"
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default Profile
