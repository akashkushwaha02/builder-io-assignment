require("dotenv").config();

module.exports = {
  reactStrictMode: true,
  images: {
    domains: ["openweathermap.org"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/weather",
        permanent: true,
      },
    ];
  },
};
