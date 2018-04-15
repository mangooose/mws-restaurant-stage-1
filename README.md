# Mobile Web Specialist Certification Course
---

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





