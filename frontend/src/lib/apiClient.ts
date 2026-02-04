import { API_ENDPOINTS } from '@/config/api';
import { logoutUser, simpleLogout } from '@/services/authService';

let isRefreshing = false;

interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

/**
 * Enhanced fetch wrapper that handles token refreshing automatically
 */
export const apiFetch = async (url: string, options: RequestOptions = {}) => {
    // Get current access token
    const token = localStorage.getItem('accessToken');

    // Prepare headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    // If body is FormData, let the browser set the Content-Type header
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    const config = {
        ...options,
        headers,
    };

    let response = await fetch(url, config);

    // Handle 401 Unauthorized (Token Expired)
    if (response.status === 401) {
        let shouldRefresh = false;
        try {
            const clonedResponse = response.clone();
            const errorData = await clonedResponse.json();
            const errorMessage = errorData?.message || '';

            // Backend returns "Invalid or expired token", "Token expired", or "Invalid token"
            if (errorMessage.includes('Invalid or expired token')) {
                shouldRefresh = true;
            }
        } catch (e) {
            shouldRefresh = false;
        }

        if (shouldRefresh) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    // Attempt to refresh token
                    const refreshResponse = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        // Credentials include cookies (refreshToken)
                        credentials: 'include',
                    });

                    if (refreshResponse.ok) {
                        const data = await refreshResponse.json();
                        const newAccessToken = data.data.accessToken;

                        // Update local storage
                        localStorage.setItem('accessToken', newAccessToken);

                        // Retry original request with new token
                        const newHeaders = {
                            ...headers,
                            Authorization: `Bearer ${newAccessToken}`,
                        };

                        const newConfig = {
                            ...options,
                            headers: newHeaders,
                        };

                        response = await fetch(url, newConfig);
                    } else {
                        // Refresh failed (e.g. refresh token expired), logout user
                        try {
                            await logoutUser();
                        } catch (error) {
                            simpleLogout();
                        }
                        // Don't throw, return the original 401
                    }
                } catch (error) {
                    // Refresh failed completely
                    try {
                        await logoutUser();
                    } catch (error) {
                        simpleLogout();
                    }
                    // Don't throw, return the original 401 or network error
                } finally {
                    isRefreshing = false;
                }
            }
        }
    }

    return response;
};