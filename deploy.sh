#!/bin/bash
set -e

echo "🚀 AI Poster Shop - Deployment Preparation"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 Checking prerequisites..."
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ .env.local exists - make sure it has production values${NC}"
else
    echo -e "${RED}❌ .env.local not found - copy from template${NC}"
    exit 1
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Building project..."
npm run build

echo ""
echo -e "${GREEN}✅ Build successful!${NC}"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push origin main"
echo "2. Go to https://vercel.com and import project"
echo "3. Add environment variables from .env.local"
echo "4. Deploy!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"