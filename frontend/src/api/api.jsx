
// Base URL of our Django backend.
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api";

// Get the JWT access token from browser storage.
function getAccessToken() {
    return localStorage.getItem("access");
}

// Make an authenticated request to the Django API.
export async function apiRequest(endpoint, options = {}) {
    const token = getAccessToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,

        headers: {
            "Content-Type": "application/json",

            // Send the JWT access token to Django.
            ...(token && {
                Authorization: `Bearer ${token}`,
            }),

            // Preserve any additional headers.
            ...options.headers,
        },
    });

    // DELETE requests can return 204 with no response body.
    if (response.status === 204) {
        return null;
    }

    // Read the response as text first.
    const responseText = await response.text();

    // Convert JSON responses into JavaScript objects.
    let data = null;

    if (responseText.trim()) {
        try {
            data = JSON.parse(responseText);
        } catch {
            // The server returned HTML or another non-JSON response.
            if (!response.ok) {
                throw new Error(
                    `API request failed (${response.status}) for ${endpoint}. ` +
                    `The server returned a non-JSON response. ` +
                    "Check the Django terminal for the actual error."
                );
            }

            throw new Error(
                `Expected JSON from ${endpoint}, but received a non-JSON response.`
            );
        }
    }

    // Handle unsuccessful HTTP responses.
    if (!response.ok) {
        const errorMessage =
            data?.detail ||
            data?.message ||
            data?.error ||
            (typeof data === "string" ? data : null) ||
            `Request failed with status ${response.status}.`;

        throw new Error(
            typeof errorMessage === "string"
                ? errorMessage
                : JSON.stringify(errorMessage)
        );
    }

    // Return the parsed JSON response.
    return data;
}
