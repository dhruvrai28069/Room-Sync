require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Smart Hostel Backend running on port ${PORT}`);
  console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
