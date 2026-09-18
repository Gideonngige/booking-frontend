// Api/api.js

import axios from "axios";
import { API_URL } from "../config/env";

const api = axios.create({
  baseURL: API_URL,
});

/* =========================================================
   REQUEST INTERCEPTOR
========================================================= */

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token");

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================================
   RESPONSE INTERCEPTOR
========================================================= */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    /*
      If there is no original request,
      simply reject.
    */

    if (!originalRequest) {
      return Promise.reject(error);
    }

    /* =====================================================
       ACCESS TOKEN EXPIRED
    ===================================================== */

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem(
          "refresh_token"
        );

      /*
        No refresh token means the user
        cannot be authenticated again.
      */

      if (!refreshToken) {
        logoutUser();

        return Promise.reject(error);
      }

      try {
        /* ===============================================
           REQUEST NEW ACCESS TOKEN

           Use plain axios here, NOT `api`,
           otherwise the interceptor can create a loop.
        =============================================== */

        const res = await axios.post(
          `${API_URL}/refresh_token/`,
          {
            refresh_token:
              refreshToken,
          }
        );

        const newAccessToken =
          res.data.access_token;

        if (!newAccessToken) {
          throw new Error(
            "No access token returned."
          );
        }

        /* ===============================================
           SAVE NEW ACCESS TOKEN
        =============================================== */

        localStorage.setItem(
          "access_token",
          newAccessToken
        );

        /* ===============================================
           UPDATE FAILED REQUEST
        =============================================== */

        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        /* ===============================================
           RETRY ORIGINAL REQUEST
        =============================================== */

        return api(originalRequest);

      } catch (refreshError) {
        /*
          Refresh token expired,
          invalid or revoked.
        */

        logoutUser();

        return Promise.reject(
          refreshError
        );
      }
    }

    return Promise.reject(error);
  }
);

/* =========================================================
   LOGOUT HELPER
========================================================= */

function logoutUser() {
  localStorage.removeItem(
    "access_token"
  );

  localStorage.removeItem(
    "refresh_token"
  );

  localStorage.removeItem(
    "user"
  );

  /*
    Avoid redirect loop if already
    on the login page.
  */

  if (
    window.location.pathname !==
    "/login"
  ) {
    window.location.href =
      "/login";
  }
}

export default api;