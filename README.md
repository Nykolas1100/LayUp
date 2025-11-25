# Layup

Layup is a functional programming language for spreadsheets

## Install

git clone https://github.com/Nykolas1100/LayUp.git  
git clone https://github.com/williams-cs/parsecco

## Run

### IDE

node layupParser.js

### Web

python -m http.server

## Rebuild

tsc layupParser.ts
npx esbuild webParser.js --bundle --outfile=dist/bundle.js --format=iife