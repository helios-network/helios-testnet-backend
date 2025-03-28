import app from './app';
import config from './config';

const PORT = config.PORT || 3000;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Helios Testnet API running on port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});