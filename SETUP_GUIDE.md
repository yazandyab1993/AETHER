# Aether AI Platform - Complete Setup Guide

This guide provides multiple approaches to deploy the Aether AI Platform on your Ubuntu 24 VPS server at aether.yazandyab.com.

## Available Deployment Methods

### 1. Automated Script Deployment (Recommended)
Use the `deploy.sh` script for a fully automated setup:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### 2. Manual Step-by-Step Installation
Follow the detailed instructions in `DEPLOYMENT_README.md` for manual setup.

### 3. Docker Deployment
For containerized deployment, use the Docker setup:

```bash
# Build and run with Docker Compose
docker-compose up -d --build
```

## Configuration Notes

### API Keys
The Freepik API key is already configured in `constants.ts`:
```javascript
export const FREEPIK_API_KEY = "FPSX4c1680c370101048308a7b2f9bf87721";
```

### Environment Variables
For production, update the ecosystem.config.js or systemd service file with your actual API keys:
- GEMINI_API_KEY: Replace 'your-gemini-api-key-here' with your actual Gemini API key

## Security Considerations

1. **API Key Security**: The Freepik API key is currently in client-side code, which is not secure for production. Consider implementing a backend proxy for API calls.

2. **SSL Certificate**: Always use HTTPS in production. The setup scripts include options for Let's Encrypt SSL certificates.

3. **Firewall**: The scripts configure UFW firewall to allow only necessary ports.

## Post-Deployment Tasks

### 1. Verify the Installation
```bash
# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# View application logs
pm2 logs aether-ai
```

### 2. Update DNS Settings
Ensure your domain aether.yazandyab.com points to your VPS server's IP address.

### 3. Set Up SSL (if not done during installation)
```bash
sudo certbot --nginx -d aether.yazandyab.com
```

### 4. Monitor the Application
```bash
# Monitor PM2
pm2 monit

# Check system resources
htop
```

## Troubleshooting

### Common Issues and Solutions

1. **Application not accessible**
   - Check if the service is running: `pm2 status`
   - Verify Nginx configuration: `sudo nginx -t`
   - Check firewall: `sudo ufw status`

2. **Build failures**
   - Ensure Node.js and npm are properly installed
   - Check available disk space: `df -h`
   - Review build logs for specific errors

3. **Nginx 404 or 502 errors**
   - Verify the backend service is running on port 3000
   - Check Nginx configuration syntax
   - Review Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

4. **Permission issues**
   - Ensure proper ownership of application directory
   - Verify user has necessary permissions for all operations

### Useful Commands

```bash
# Restart the application
pm2 restart aether-ai

# View application logs
pm2 logs aether-ai --lines 50

# Reload Nginx configuration
sudo nginx -t && sudo systemctl reload nginx

# Check disk usage
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

## Maintenance

### Updating the Application
```bash
# Navigate to application directory
cd /var/www/aether

# Pull latest code (if using git)
git pull origin main

# Install any new dependencies
npm install

# Rebuild the application
npm run build

# Restart the application
pm2 restart aether-ai
```

### Backup Strategy
```bash
# Backup application files
sudo tar -czf aether-backup-$(date +%Y%m%d).tar.gz /var/www/aether

# Backup PM2 configuration
pm2 dump
```

## Performance Optimization

### Nginx Optimization
The configuration includes:
- Proxy buffering settings
- Timeout configurations
- Security headers
- Compression settings (if enabled)

### PM2 Configuration
- Cluster mode for better performance
- Auto-restart on failure
- Process monitoring

## Domain Configuration

Ensure your domain aether.yazandyab.com is properly configured:

1. **DNS Records**: Point an A record to your VPS IP address
2. **SSL Certificate**: Use Let's Encrypt for free SSL certificates
3. **Subdomain**: If needed, configure www.aether.yazandyab.com as well

## Next Steps

1. Test the application functionality
2. Implement proper user authentication backend
3. Add database storage instead of local storage
4. Set up monitoring and alerting
5. Implement proper error logging and handling
6. Add automated backups
7. Consider CDN for static assets
8. Set up staging environment

## Support

If you encounter issues:
1. Check the logs first: `pm2 logs aether-ai`
2. Verify all services are running
3. Review the configuration files
4. Consult the troubleshooting section above
5. Reach out for additional support

Your Aether AI Platform should now be accessible at:
- http://aether.yazandyab.com
- https://aether.yazandyab.com (if SSL is configured)