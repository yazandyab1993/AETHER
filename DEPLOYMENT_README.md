# Deployment Guide for Aether AI Platform on Ubuntu 24 VPS

This guide will walk you through deploying the Aether AI platform on your Ubuntu 24 VPS server to run at aether.yazandyab.com.

## Prerequisites

- Ubuntu 24.04 VPS server
- Domain name (aether.yazandyab.com) pointing to your server's IP
- Basic knowledge of Linux command line

## Step-by-Step Deployment Instructions

### 1. Update your system
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js and npm
```bash
# Install Node.js 20.x (LTS) using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install PM2 (Process Manager for Node.js applications)
```bash
sudo npm install -g pm2
```

### 4. Install Nginx
```bash
sudo apt install nginx -y
```

### 5. Clone or copy your application files
If you're copying files directly to the server:
```bash
# Create application directory
sudo mkdir -p /var/www/aether
sudo chown $USER:$USER /var/www/aether
cd /var/www/aether
```

### 6. Install application dependencies
```bash
cd /var/www/aether
npm install
```

### 7. Build the application
```bash
npm run build
```

### 8. Configure PM2 to serve the application
```bash
# Create a PM2 ecosystem file
cat > /var/www/aether/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'aether-ai',
    script: 'npx',
    args: 'serve dist -l 3000',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      GEMINI_API_KEY: 'your-gemini-api-key-here'
    }
  }]
};
EOF
```

### 9. Start the application with PM2
```bash
cd /var/www/aether
npm install -g serve
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 10. Configure Nginx as a reverse proxy
```bash
# Create Nginx configuration file
sudo tee /etc/nginx/sites-available/aether << 'EOF'
server {
    listen 80;
    server_name aether.yazandyab.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/aether /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 11. (Optional) Set up SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d aether.yazandyab.com
```

### 12. Configure Firewall (if UFW is enabled)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## Managing Your Application

### View application status
```bash
pm2 status
```

### View application logs
```bash
pm2 logs aether-ai
```

### Restart application after updates
```bash
cd /var/www/aether
npm run build
pm2 restart aether-ai
```

### Stop application
```bash
pm2 stop aether-ai
```

## Environment Configuration

Your Freepik API key is already included in the application code (`constants.ts` file) as:
```javascript
export const FREEPIK_API_KEY = "FPSX4c1680c370101048308a7b2f9bf87721";
```

For production, consider moving this to an environment variable by:
1. Creating a `.env` file in your application directory
2. Adding `FREEPIK_API_KEY=FPSX4c1680c370101048308a7b2f9bf87721`
3. Modifying the application to read from environment variables instead of the constants file

## Troubleshooting

### If Nginx shows a default page:
- Check that your configuration file is in `/etc/nginx/sites-enabled/`
- Verify there's no conflicting configuration
- Run `sudo nginx -t` to test configuration

### If the application doesn't start:
- Check PM2 logs: `pm2 logs aether-ai`
- Verify that port 3000 is available: `sudo netstat -tlnp | grep 3000`
- Make sure the build was successful: `npm run build`

### If you encounter permission issues:
- Ensure your user has proper permissions for the application directory
- Make sure Nginx can access the files

## Security Considerations

1. **API Keys**: The Freepik API key is currently in the source code, which is not ideal for production. Consider implementing a backend service to handle API calls securely.

2. **SSL Certificate**: Always use SSL in production to encrypt data transmission.

3. **Regular Updates**: Keep your system and dependencies updated.

4. **Firewall**: Always use a firewall to limit access to necessary ports only.

## Additional Notes

- The application is currently configured to run on port 3000 (as defined in `vite.config.ts`)
- The application uses mock backend services for user management and storage
- For production use, you should implement a proper backend with database storage
- The current implementation has CORS limitations when calling external APIs directly from the browser