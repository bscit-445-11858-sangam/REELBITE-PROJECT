import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import '../../styles/reels.css'
import ReelFeed from '../../components/ReelFeed'
import { CartContext } from '../../context/CartContext';


const Home = () => {
    const location = useLocation()
    const [ videos, setVideos ] = useState([])
    const [ savedItems, setSavedItems ] = useState([])
    const [ viewerId, setViewerId ] = useState(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user') || 'null')
            return u?._id ?? null
        } catch {
            return null
        }
    })
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user') || 'null')
            setViewerId(u?._id ?? null)
        } catch {
            setViewerId(null)
        }
    }, [location.pathname])
    // Autoplay behavior is handled inside ReelFeed

    
    useEffect(() => {
        axios.get("http://localhost:3000/api/food", { withCredentials: true })
            .then(response => {

                console.log(response.data);

                setVideos(response.data.foodItems)
            })
            .catch(() => { /* noop: optionally handle error */ })
    }, [])

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user") || "null")
        if (!user?._id) return

        axios.get(`/api/food/save?userId=${user._id}`, { withCredentials: true })
            .then((response) => {
                setSavedItems(response.data)
            })
            .catch(() => { /* noop */ })
    }, [])

    // Using local refs within ReelFeed; keeping map here for dependency parity if needed

    async function likeVideo(item) {
        const user = JSON.parse(localStorage.getItem("user") || "null")

        if (!user?._id || !item?._id) {
            console.log("Missing like data", { userId: user?._id, foodId: item?._id })
            return
        }

        console.log("LIKE DATA:", {
            userId: user._id,
            foodId: item._id
        });

        axios.post("/api/food/like", {
            userId: user._id,
            foodId: item._id
        }, { withCredentials: true })
            .then((response) => {
                if (response.data.liked) {
                    console.log("Video liked");
                    setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: (v.likeCount || 0) + 1 } : v))
                } else {
                    console.log("Video unliked");
                    setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, likeCount: Math.max((v.likeCount || 0) - 1, 0) } : v))
                }
            })
            .catch(err => console.log(err.response?.data))
        
    }

    async function saveVideo(item) {
        const user = JSON.parse(localStorage.getItem("user") || "null")
        if (!user?._id || !item?._id) return

        axios.post("/api/food/save", {
            userId: user._id,
            foodId: item._id
        }, { withCredentials: true })
            .then((response) => {
                if (response.data.saved) {
                    setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: (v.savesCount || 0) + 1 } : v))
                } else {
                    setVideos((prev) => prev.map((v) => v._id === item._id ? { ...v, savesCount: Math.max((v.savesCount || 0) - 1, 0) } : v))
                }
            })
            .catch(err => console.log(err.response?.data))
    }

    return (
        <ReelFeed
            key={String(viewerId ?? 'guest')}
            userId={viewerId}
            items={videos}
            onLike={likeVideo}
            onSave={saveVideo}
            onAddToCart={addToCart}
            emptyMessage="No videos available."
        />
    )
}

export default Home