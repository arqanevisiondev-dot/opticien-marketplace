#!/bin/bash

# 🚀 Script de démarrage rapide Arqane Vision
# Ce script configure et lance le projet automatiquement

echo "🎯 Arqane Vision - Configuration Rapide"
echo "===================================="
echo ""

# Vérifier si .env existe
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp env.example .env
    echo "⚠️  IMPORTANT: Modifiez le fichier .env avec vos informations de base de données"
    echo ""
    read -p "Appuyez sur Entrée après avoir configuré .env..."
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
pnpm install

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
pnpm db:generate

# Demander si l'utilisateur veut initialiser la DB
read -p "❓ Voulez-vous initialiser la base de données? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🗄️  Initialisation de la base de données..."
    pnpm db:push
    
    read -p "❓ Voulez-vous ajouter des données de test? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        echo "🌱 Ajout des données de test..."
        pnpm db:seed
        echo ""
        echo "✅ Données de test ajoutées!"
        echo "📧 Admin: admin@Arqane Vision.com / admin123"
        echo "👓 Opticien: optique.paris@example.com / optician123"
    fi
fi

echo ""
echo "✅ Configuration terminée!"
echo ""
echo "🚀 Lancement du serveur de développement..."
echo "📍 URL: http://localhost:3000"
echo ""

# Lancer le serveur
pnpm dev
