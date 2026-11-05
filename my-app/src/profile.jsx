
import { useEffect, useState } from "react";

async function fetchProfile() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        throw new Error("Please log in");
    }

    const response = await fetch(
        "http://127.0.0.1:8000/api/me",
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Could not load profile");
    }

    return data;
}
export default fetchProfile;
