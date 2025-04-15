const { spawn } = require('child_process');
const localtunnel = require('localtunnel');
const config = require('./config');

async function startServer() {
  // Start the server
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit'
  });

  // Handle server exit
  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });

  try {
    // Start localtunnel
    const tunnel = await localtunnel({ 
      port: config.PORT,
      subdomain: 'notion-webhook' // Bạn có thể thay đổi subdomain này
    });

    console.log('=================================');
    console.log('Tunnel created!');
    console.log(`Public URL: ${tunnel.url}`);
    console.log('=================================');
    console.log('Use this URL in your Notion integration settings:');
    console.log(`${tunnel.url}/api/webhooks/notion-webhook`);
    console.log('=================================');

    // Update webhook URL in environment
    process.env.WEBHOOK_URL = tunnel.url;

    tunnel.on('close', () => {
      console.log('Tunnel closed');
      process.exit(1);
    });

  } catch (error) {
    console.error('Error starting tunnel:', error);
    process.exit(1);
  }
}

startServer(); 