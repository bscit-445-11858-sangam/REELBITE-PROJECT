import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/reels.css";
import axios from "axios";
import ReelFeed from "../../components/ReelFeed";

function readLocalSaved() {
  try {
    const raw = localStorage.getItem("reelbite_saved");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function mapToVideo(it) {
  return {
    _id: it._id,
    video: it.video,
    description: it.description,
    likeCount: it.likeCount ?? 0,
    savesCount: it.savesCount ?? 0,
    commentsCount: it.commentsCount ?? 0,
    foodPartner: it.foodPartner,
    name: it.name,
    price: it.price,
  };
}

const Saved = () => {
  const location = useLocation();
  const [videos, setVideos] = useState([]);
  const [viewerId, setViewerId] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?._id ?? null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      setViewerId(u?._id ?? null);
    } catch {
      setViewerId(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const local = readLocalSaved().map(mapToVideo);
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user?._id) {
      setVideos(local);
      return;
    }

    axios
      .get(`/api/food/save?userId=${user._id}`, { withCredentials: true })
      .then((response) => {
        const savedFoods = response.data.map((item) => ({
          _id: item.food._id,
          video: item.food.video,
          description: item.food.description,
          likeCount: item.food.likeCount,
          savesCount: item.food.savesCount,
          commentsCount: item.food.commentsCount,
          foodPartner: item.food.foodPartner,
          name: item.food.name,
          price: item.food.price,
        }));
        const apiIds = new Set(savedFoods.map((v) => v._id));
        const merged = [
          ...savedFoods,
          ...local.filter((l) => !apiIds.has(l._id)),
        ];
        setVideos(merged);
      })
      .catch(() => {
        setVideos(local);
      });
  }, []);

  const removeSaved = async (item) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?._id && item?._id) {
      try {
        await axios.post(
          "/api/food/save",
          {
            userId: user._id,
            foodId: item._id,
          },
          { withCredentials: true }
        );
      } catch {
        /* noop */
      }
    }

    try {
      const raw = localStorage.getItem("reelbite_saved");
      let arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) arr = [];
      arr = arr.filter((x) => x._id !== item._id);
      localStorage.setItem("reelbite_saved", JSON.stringify(arr));
    } catch {
      /* noop */
    }

    setVideos((prev) => prev.filter((v) => v._id !== item._id));
  };

  if (videos.length === 0) {
    return (
      <div className="reels-page saved-page-empty">
        <div className="saved-empty">
          <div className="saved-empty__icon" aria-hidden="true">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
              <path d="M12 8v6" />
              <path d="M9 11h6" />
            </svg>
          </div>
          <p className="saved-empty__title">No saved videos yet</p>
          <button
            type="button"
            className="saved-empty__btn"
            onClick={() => navigate("/")}
          >
            Explore Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <ReelFeed
      key={String(viewerId ?? "guest")}
      userId={viewerId}
      items={videos}
      onSave={removeSaved}
      emptyMessage="No saved videos yet."
    />
  );
};

export default Saved;
