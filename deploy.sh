#!/bin/bash

# Aether AI Platform Deployment Script for Ubuntu 24 VPS
# This script automates the deployment process for aether.yazandyab.com

set -e  # Exit immediately if a command exits with a non-zero status

echo "==========================================="
echo "Aether AI Platform Deployment Script"
echo "Target: aether.yazandyab.com"
echo "==========================================="

# Function to log messages
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log "Please do not run this script as root. Run as a regular user with sudo access."
    exit 1
fi

# Update system packages
log "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x (LTS)
log "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
log "Installing PM2..."
sudo npm install -g pm2

# Install Nginx
log "Installing Nginx..."
sudo apt install nginx -y

# Create application directory
log "Creating application directory..."
sudo mkdir -p /var/www/aether
sudo chown $USER:$USER /var/www/aether
cd /var/www/aether

# Copy application files (assuming they are in the current directory)
log "Copying application files..."
cp -r /workspace/* /var/www/aether/
cp -r /workspace/.[^.]* /var/www/aether/ 2>/dev/null || true  # Copy hidden files like .gitignore

# Install application dependencies
log "Installing application dependencies..."
cd /var/www/aether
npm install

# Build the application
log "Building the application..."
npm run build

# Install serve globally to serve the built files
log "Installing serve..."
npm install -g serve

# Create PM2 ecosystem file
log "Creating PM2 ecosystem file..."
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

# Start the application with PM2
log "Starting application with PM2..."
cd /var/www/aether
pm2 start ecosystem.config.js
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
pm2 save

# Create Nginx configuration
log "Configuring Nginx..."
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
        proxy_read_timeout 300s;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/aether /etc/nginx/sites-enabled/
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Optional: Set up SSL with Let's Encrypt
read -p "Do you want to set up SSL with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Installing Certbot..."
    sudo apt install certbot python3-certbot-nginx -y
    
    log "Setting up SSL certificate..."
    sudo certbot --nginx -d aether.yazandyab.com
fi

# Configure firewall
log "Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Wait a moment for services to start
sleep 5

# Check if services are running
log "Checking application status..."
pm2 status

log "Checking Nginx status..."
sudo systemctl status nginx

# Final status check
log "==========================================="
log "DEPLOYMENT COMPLETED!"
log "Your Aether AI platform should now be accessible at:"
log "  http://aether.yazandyab.com"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "  https://aether.yazandyab.com (with SSL)"
fi
log ""
log "Useful PM2 commands:"
log "  pm2 status - Check application status"
log "  pm2 logs aether-ai - View application logs"
log "  pm2 restart aether-ai - Restart application"
log "  pm2 stop aether-ai - Stop application"
log ""
log "Nginx configuration is in: /etc/nginx/sites-available/aether"
log "Application files are in: /var/www/aether"
log "==========================================="

echo "Deployment completed successfully!"