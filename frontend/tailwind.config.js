/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1E3A8A', // Indigo-900
                    light: '#312E81',
                    dark: '#172554',
                },
                accent: {
                    DEFAULT: '#3B82F6', // Blue-500
                    hover: '#2563EB',
                },
                slate: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                },
                // Status Colors
                success: '#10B981', // Emerald-500
                warning: '#F59E0B', // Amber-500
                danger: '#EF4444', // Red-500
                info: '#3B82F6',   // Blue-500
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
