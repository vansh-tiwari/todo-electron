const electron = require("electron");
const path = require("path");
const url = require("url");

// SET ENV
process.env.NODE_ENV = "development";

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainScreen;
let addScreen;

// Listen for app to be ready
app.on("ready", function() {
  // Create new window
  mainScreen = new BrowserWindow({});
  // Load html in window
  mainScreen.loadURL(
    url.format({
      pathname: path.join(__dirname, "templates/mainScreen.html"),
      protocol: "file:",
      slashes: true
    })
  );
  // Quit app when closed
  mainScreen.on("closed", function() {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle add item window
function createAddWindow() {
  addScreen = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Add ToDo item"
  });
  addScreen.loadURL(
    url.format({
      pathname: path.join(__dirname, "templates/addScreen.html"),
      protocol: "file:",
      slashes: true
    })
  );

  // Handle garbage collection
  addScreen.on("close", function() {
    addScreen = null;
  });
}

// Catch item:add
ipcMain.on("item:add", function(e, item) {
  mainScreen.webContents.send("item:add", item);
  addScreen.close();
  //addScreen = null;
});

// Create menu template
const mainMenuTemplate = [
  // Each object is a dropdown
  {
    label: "Menu",
    submenu: [
      {
        label: "Add Item",
        accelerator: process.platform == "darwin" ? "Command+N" : "Ctrl+N",
        click() {
          createAddWindow();
        }
      },
      {
        label: "Clear All",
        click() {
          mainScreen.webContents.send("item:clear");
        }
      },
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        }
      }
    ]
  }
];

// If OSX, add empty object to menu
if (process.platform == "darwin") {
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        role: "reload"
      },
      {
        label: "Toggle DevTools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
