# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

# Usage
## Server
1. Clone and install  [mws-restaurant-stage-3](https://github.com/mangooose/mws-restaurant-stage-3)
2. Install Sails.js globally ```npm i sails -g```
3. Run ``` node server ```

## Client 
### Http:
1. Clone this repository&cd to the folder
2. Run ```python -m http.server 8000```
3. Go to  **http://localhost:8000** in your browser  

### Https:
1. Clone this repository&cd to the folder
2. Run 
    ```bash 
    $ brew tap GoogleChrome/simplehttp2server https://github.com/GoogleChrome/simplehttp2server
    $ brew install simplehttp2server
    ```
3. Run ``` simplehttp2server -listen :8000```
4. Go to  **https://localhost:8000** in your browser  

# For development purpose
### Install the gulp command
* Run ``` npm install --global gulp-cli ```
### Install dependencies
* Run ``` npm install ```
### Useful commands
* Run 
    ```bash 
    gulp images #Generate images at different sizes
    gulp minify-css #Optimize and minify css
    ```





