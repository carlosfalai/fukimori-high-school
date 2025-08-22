import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse response as JSON for better error messages
      const jsonData = await res.json();
      console.error('API Error:', {
        status: res.status,
        statusText: res.statusText,
        url: res.url,
        data: jsonData
      });
      throw new Error(jsonData.message || `${res.status}: ${res.statusText}`);
    } catch (e) {
      // If parsing as JSON fails, use text response
      const text = await res.text() || res.statusText;
      console.error('API Error:', {
        status: res.status,
        statusText: res.statusText,
        url: res.url,
        text
      });
      throw new Error(`${res.status}: ${text}`);
    }
  }
}

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://fukimori-high-school.onrender.com' 
  : '';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const fullUrl = `${API_BASE_URL}${url}`;
  console.log(`API Request: ${method} ${fullUrl}`, data ? { data } : '');
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    // For authentication endpoints, don't throw errors automatically
    if (url.includes('/auth/') && !url.includes('/auth/me')) {
      return res;
    }
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API Request failed: ${method} ${url}`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = `${API_BASE_URL}${url}`;
    console.log(`Query: GET ${fullUrl}`);
    
    try {
      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log(`Query: GET ${url} - Unauthorized (401), returning null`);
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      console.log(`Query: GET ${url} - Success`, data);
      return data;
    } catch (error) {
      console.error(`Query: GET ${url} - Failed`, error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
