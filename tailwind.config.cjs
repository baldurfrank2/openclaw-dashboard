module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          950: "#050810",
          900: "#0a0f1f",
          850: "#0c1225",
          800: "#0f152b",
          750: "#121a32",
          700: "#161d38",
          600: "#1f2747",
          500: "#2a3358"
        },
        aurora: {
          300: "#93c5fd",
          400: "#7dd3fc",
          500: "#60a5fa",
          600: "#4f46e5",
          700: "#4338ca"
        },
        neon: {
          cyan: "#22d3ee",
          blue: "#3b82f6",
          purple: "#a78bfa",
          pink: "#f472b6",
          green: "#4ade80"
        },
        glass: {
          white: "rgba(255, 255, 255, 0.06)",
          border: "rgba(255, 255, 255, 0.08)",
          highlight: "rgba(255, 255, 255, 0.12)"
        }
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        "glass-sm": "0 4px 16px rgba(0, 0, 0, 0.3)",
        "glass-lg": "0 12px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        glow: "0 0 40px rgba(96, 165, 250, 0.2)",
        "glow-sm": "0 0 20px rgba(96, 165, 250, 0.15)",
        "glow-lg": "0 0 60px rgba(96, 165, 250, 0.25)",
        "glow-cyan": "0 0 30px rgba(34, 211, 238, 0.2)",
        "glow-purple": "0 0 30px rgba(167, 139, 250, 0.2)",
        "neon-line": "0 0 10px rgba(96, 165, 250, 0.5), 0 0 20px rgba(96, 165, 250, 0.3)",
        inner: "inset 0 2px 4px rgba(0, 0, 0, 0.3)"
      },
      fontFamily: {
        display: ["Montserrat", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"]
      },
      backgroundImage: {
        grid: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
        "grid-dense": "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
        glow: "radial-gradient(ellipse at top, rgba(99,102,241,0.15), transparent 50%)",
        "glow-bottom": "radial-gradient(ellipse at bottom, rgba(34,211,238,0.1), transparent 50%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "shimmer": "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)"
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "scale-in": "scale-in 0.2s ease-out"
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      backdropBlur: {
        xs: "2px"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem"
      }
    }
  },
  plugins: []
};
