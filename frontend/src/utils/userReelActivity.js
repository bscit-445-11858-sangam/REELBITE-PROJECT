/**
 * Per-user reel activity (likes display counts, comments, liked video ids).
 * Key: reelbite_user_{userId} — use "guest" when not logged in.
 */

export function getReelActivityKey(userId) {
  const id =
    userId != null && String(userId).length > 0 ? String(userId) : "guest";
  return `reelbite_user_${id}`;
}

export function loadReelActivity(userId) {
  try {
    const raw = localStorage.getItem(getReelActivityKey(userId));
    if (!raw) return emptyActivity();
    const d = JSON.parse(raw);
    return {
      likeCounts:
        d.likeCounts && typeof d.likeCounts === "object" ? d.likeCounts : {},
      commentsByVideoId:
        d.commentsByVideoId && typeof d.commentsByVideoId === "object"
          ? d.commentsByVideoId
          : {},
      likedVideoIds: Array.isArray(d.likedVideoIds) ? d.likedVideoIds : [],
    };
  } catch {
    return emptyActivity();
  }
}

export function saveReelActivity(userId, data) {
  try {
    localStorage.setItem(
      getReelActivityKey(userId),
      JSON.stringify({
        likeCounts: data.likeCounts || {},
        commentsByVideoId: data.commentsByVideoId || {},
        likedVideoIds: Array.isArray(data.likedVideoIds)
          ? data.likedVideoIds
          : [],
      })
    );
  } catch (e) {
    console.error(e);
  }
}

function emptyActivity() {
  return { likeCounts: {}, commentsByVideoId: {}, likedVideoIds: [] };
}
