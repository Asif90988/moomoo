/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'monospace'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xxs': '0.625rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      colors: {
        // Enhanced Neural Core brand colors - More sophisticated palette
        neural: {
          dark: '#0a0a0f',      // Slightly blue-tinted black
          darker: '#050508',     // Deep space black
          panel: '#1a1a24',     // Dark blue-gray panels
          border: '#2a2a3a',    // Subtle blue-gray borders
          accent: '#4f46e5',    // Rich indigo accent
          surface: '#151520',   // Card surfaces
          muted: '#6b7280',     // Muted text
        },
        
        // Refined neon color palette - More harmonious
        neon: {
          blue: '#3b82f6',      // Softer electric blue
          green: '#10b981',     // Emerald green (less harsh)
          purple: '#8b5cf6',    // Violet purple
          pink: '#ec4899',      // Hot pink
          orange: '#f59e0b',    // Amber orange
          yellow: '#eab308',    // Golden yellow
          red: '#ef4444',       // Coral red
          cyan: '#06b6d4',      // Sky cyan
          mint: '#34d399',      // Mint green
          lavender: '#a78bfa',  // Soft lavender
        },
        
        // Enhanced trading specific colors
        trading: {
          profit: '#10b981',    // Emerald green (easier on eyes)
          loss: '#f87171',      // Softer red
          neutral: '#9ca3af',   // Neutral gray
          warning: '#f59e0b',   // Amber warning
          info: '#3b82f6',      // Blue info
          bullish: '#059669',   // Deep green
          bearish: '#dc2626',   // Deep red
        },
        
        // Enhanced status colors
        status: {
          active: '#10b981',    // Emerald active
          inactive: '#6b7280',  // Gray inactive
          error: '#ef4444',     // Red error
          warning: '#f59e0b',   // Amber warning
          pending: '#eab308',   // Yellow pending
          success: '#059669',   // Green success
        },
        
        // Ticker-specific color palette
        ticker: {
          ai: {
            bg: 'rgba(139, 92, 246, 0.15)',      // Purple background
            border: 'rgba(139, 92, 246, 0.4)',   // Purple border
            text: '#a78bfa',                      // Lavender text
            accent: '#8b5cf6',                    // Purple accent
          },
          whale: {
            bg: 'rgba(16, 185, 129, 0.15)',      // Emerald background
            border: 'rgba(16, 185, 129, 0.4)',   // Emerald border
            text: '#34d399',                      // Mint text
            accent: '#10b981',                    // Emerald accent
          },
          news: {
            bg: 'rgba(107, 114, 128, 0.15)',     // Gray background
            border: 'rgba(107, 114, 128, 0.4)',  // Gray border
            text: '#d1d5db',                      // Light gray text
            accent: '#9ca3af',                    // Gray accent
          },
          breaking: {
            bg: 'rgba(239, 68, 68, 0.15)',       // Red background
            border: 'rgba(239, 68, 68, 0.4)',    // Red border
            text: '#fca5a5',                      // Light red text
            accent: '#ef4444',                    // Red accent
          }
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-out': 'fadeOut 0.8s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-out',
        'rotate-slow': 'rotate 8s linear infinite',
        'market-pulse': 'marketPulse 2s ease-in-out infinite',
        'neural-activity': 'neuralActivity 1.5s ease-in-out infinite',
        'data-flow': 'dataFlow 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 20px currentColor, 0 0 30px currentColor' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.9)', opacity: '0' }
        },
        marketPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 0 0 rgba(0, 255, 136, 0.7)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 0 8px rgba(0, 255, 136, 0)',
            transform: 'scale(1.02)'
          }
        },
        neuralActivity: {
          '0%, 100%': { opacity: '0.6', transform: 'scaleY(1)' },
          '50%': { opacity: '1', transform: 'scaleY(1.5)' }
        },
        dataFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'neon': '0 0 20px currentColor',
        'neon-lg': '0 0 40px currentColor',
        'trading': '0 4px 20px rgba(0, 0, 0, 0.5)',
        'trading-lg': '0 8px 40px rgba(0, 0, 0, 0.7)',
        'neural': '0 0 30px rgba(59, 130, 246, 0.3)',
        'glass': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.16)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neural-grid': 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
        'holographic': 'linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(16, 185, 129, 0.1) 25%, rgba(139, 92, 246, 0.1) 50%, rgba(236, 72, 153, 0.1) 75%, rgba(59, 130, 246, 0.1) 100%)',
      },
      backgroundSize: {
        'neural-grid': '20px 20px',
        'holographic': '400% 400%',
      },
      perspective: {
        '1000': '1000px',
        '1500': '1500px',
        '2000': '2000px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
