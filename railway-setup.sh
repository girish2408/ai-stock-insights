#!/bin/bash

# Railway Setup Script
# This script helps prepare your project for Railway deployment

echo "🚀 Railway Deployment Setup"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env from env.sample..."
    cp backend/env.sample backend/.env
    echo "✅ Created backend/.env"
    echo "⚠️  Please edit backend/.env and add your API keys"
else
    echo "✅ backend/.env already exists"
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << EOF
node_modules/
.env
.env.local
*.log
dist/
build/
.DS_Store
EOF
    echo "✅ Created .gitignore"
else
    echo "✅ .gitignore already exists"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Edit backend/.env and add your API keys"
echo "2. Push your code to GitHub:"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git remote add origin https://github.com/yourusername/ai-stock-insights.git"
echo "   git push -u origin main"
echo ""
echo "3. Follow the Railway deployment guide:"
echo "   See RAILWAY.md for detailed instructions"
echo ""
echo "✅ Setup complete!"

