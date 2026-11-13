
const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://grocery-trackerzm.onrender.com/api";

// Get the stored JWT access token.
function getAccessToken() {
    return localStorage.getItem("access");
}

// Get the stored JWT refresh token.
function getRefreshToken() {
    return localStorage.getItem("refresh");
}

// Clear authentication and redirect to login.
function logoutAndRedirect() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    // Avoid unnecessary redirects.
    if (window.location.pathname !== "/login") {
        window.location.replace("/login");
    }
}

// Attempt to obtain a new access token.
async function refreshAccessToken() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        return null;
    }

    try {
        const response = await fetch(
            `${API_URL}/token/refresh/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    refresh: refreshToken,
                }),
            }
        );

        if (!response.ok) {
            return null;
        }

        const data = await response.json();

        if (!data.access) {
            return null;
        }

        // Save the renewed access token.
        localStorage.setItem("access", data.access);

        // Support refresh-token rotation if enabled.
        if (data.refresh) {
            localStorage.setItem("refresh", data.refresh);
        }

        return data.access;

    } catch (error) {
        console.error("Unable to refresh access token:", error);
        return null;
    }
}

// Share an in-progress refresh between simultaneous requests.
let refreshPromise = null;

function getRefreshedToken() {
    if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}

// Make an authenticated request to Django.
export async function apiRequest(endpoint, options = {}) {
    const isAuthEndpoint =
        endpoint.startsWith("/token/") ||
        endpoint.startsWith("/register/");

    const makeRequest = (token) => {
        const headers = new Headers(options.headers || {});

        // Preserve existing content-type behavior.
        if (!headers.has("Content-Type") &&
            options.body != null &&
            !(options.body instanceof FormData)) {
            headers.set("Content-Type", "application/json");
        }

        if (token && !isAuthEndpoint) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        return fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });
    };

    const token = getAccessToken();

    let response = await makeRequest(token);

    // If an authenticated request fails with 401,
    // attempt to renew the session.
    if (response.status === 401 && !isAuthEndpoint) {
        // Another request may have already refreshed the token.
        const latestToken = getAccessToken();

        const newToken =
            latestToken && latestToken !== token
                ? latestToken
                : await getRefreshedToken();

        if (newToken) {
            response = await makeRequest(newToken);
        }

        // Refresh failed or the retry was unauthorized.
        if (!newToken || response.status === 401) {
            logoutAndRedirect();

            // Do not expose Django's JWT error message.
            throw new Error("Session expired. Redirecting to login.");
        }
    }

    // DELETE requests may return no content.
    if (response.status === 204) {
        return null;
    }

    // Read the response as text first.
    const responseText = await response.text();

    let data = null;

    if (responseText.trim()) {
        try {
            data = JSON.parse(responseText);
        } catch {
            if (!response.ok) {
                throw new Error(
                    `API request failed (${response.status}) for ${endpoint}. ` +
                    "The server returned a non-JSON response."
                );
            }

            throw new Error(
                `Expected JSON from ${endpoint}, but received a non-JSON response.`
            );
        }
    }

    // Handle unsuccessful responses.
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

    return data;
}
