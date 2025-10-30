const getApiBaseUrl = () => {
    const envValue = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();

    // Default to same-origin Next.js API when not provided
    if (!envValue) {
        return '/api/';
    }

    // Normalize: remove all trailing slashes, then add a single slash
    const withoutTrailing = envValue.replace(/\/+$/, '');
    return `${withoutTrailing}/`;
};

const config = {
    apiBaseUrl: getApiBaseUrl(),
}

export default config;