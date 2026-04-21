import API from "./api";

export const createOrder = (data) => API.post("/order", data);