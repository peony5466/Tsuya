#!/bin/bash
# Tsuya App — development environment setup

echo "Setting up Tsuya..."

echo "Installing dependencies..."
npm install

echo "Checking Expo configuration..."
npx expo doctor

echo ""
echo "Setup complete."
echo ""
echo "Copy .env.example to .env and fill in your Supabase credentials:"
echo "  cp .env.example .env"
echo ""
echo "Then run: npm start"
