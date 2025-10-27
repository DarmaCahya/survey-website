const getApiBaseUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    
    // Remove trailing slashes to avoid double slashes
    const cleanUrl = baseUrl.replace(/\/$/, '');
    
    // If baseUrl is empty or not set, use relative path
    return cleanUrl || '';
};

const config = {
    apiBaseUrl: getApiBaseUrl(),
}

export default config;