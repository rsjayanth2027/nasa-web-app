# NASA Climate Assistant - Deployment Guide

## Railway Deployment

### Prerequisites
- GitHub account with code pushed to repository
- Railway account connected to GitHub

### Steps

1. **Connect to Railway**
   - Go to [Railway](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Environment Variables**
   - Go to your project in Railway
   - Click "Variables" tab
   - Add the following environment variables:
     ```
     PORT (auto-set by Railway)
     NASA_API_KEY=iyJSYZGvocAPedgTECmpuizoLJCxEidgpgKBfNga
     LOCATIONIQ_API_KEY=pk.e7a04104abcd5be2356b4a700e3da660
     NODE_ENV=production
     ```

3. **Deployment Settings**
   - Railway will automatically detect the Node.js project
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Monitor Deployment**
   - Check the "Deployments" tab for build logs
   - Monitor the "Metrics" tab for performance

### Custom Domain (Optional)
1. Go to your project in Railway
2. Click "Settings" tab
3. Scroll to "Custom Domains"
4. Add your domain

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Auto-set |
| `NASA_API_KEY` | NASA POWER API key | Yes |
| `LOCATIONIQ_API_KEY` | Geocoding API key | Yes |
| `NODE_ENV` | Environment mode | Yes |

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/travel/:location` - Travel analysis
- `GET /api/agriculture/rice/:location` - Agriculture insights
- `GET /api/solar/:location` - Solar potential
- `GET /api/risk/:location` - Climate risk assessment

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node.js version compatibility
   - Verify all dependencies in package.json

2. **API Timeouts**
   - NASA API might be slow, demo data will be used as fallback
   - Check Railway logs for specific errors

3. **CORS Issues**
   - CORS is configured for common frontend URLs
   - Update CORS configuration in server.js if needed