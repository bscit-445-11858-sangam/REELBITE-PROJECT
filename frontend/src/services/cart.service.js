import API from "./api";

export const addToCart = (data) => API.post("/cart/add", data);
export const getCart = () => API.get("/cart");
export const removeFromCart = (id) => API.delete(`/cart/${id}`);