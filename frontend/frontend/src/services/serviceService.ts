import api from "../lib/axios";

export const getAllServices = async ()                    => (await api.get("/services")).data;
export const getServiceById = async (id: number)          => (await api.get(`/services/${id}`)).data;
export const createService  = async (data: object)        => (await api.post("/services", data)).data;
export const updateService  = async (id: number, data: object) => (await api.put(`/services/${id}`, data)).data;
export const deleteService  = async (id: number)          => (await api.delete(`/services/${id}`)).data;import api from "../lib/axios";

export const getAllServices = async ()                    => (await api.get("/services")).data;
export const getServiceById = async (id: number)          => (await api.get(`/services/${id}`)).data;
export const createService  = async (data: object)        => (await api.post("/services", data)).data;
export const updateService  = async (id: number, data: object) => (await api.put(`/services/${id}`, data)).data;
export const deleteService  = async (id: number)          => (await api.delete(`/services/${id}`)).data;