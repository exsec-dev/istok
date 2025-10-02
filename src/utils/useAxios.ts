import { useMemo } from "react";
import axios, { AxiosInstance } from "axios";

export const useAxios = (): AxiosInstance => {
  const instance = useMemo(() => {
    return axios.create({
      baseURL: "/api",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }, []);

  return instance;
};
