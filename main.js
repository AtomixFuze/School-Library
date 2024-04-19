const { app, BrowserWindow, ipcMain } = require('electron');
const XLSX = require('xlsx');
const path = require('node:path');
const fs = require('node:fs');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        //fullscreen: true,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, '64x64.png')
    });

    win.loadFile(path.join(__dirname, 'app', 'pages', 'home.html'));
}

app.on('ready', () => {
    ipcMain.handle('navigate', (ipc, file) => {
        const filePath = path.join(__dirname, 'app', 'pages', file);
        win.loadFile(filePath);
    });

    ipcMain.handle('read-file', (ipc, file) => {
        const filePath = path.join(__dirname, 'data', file);
        const content = fs.readFileSync(filePath, { encoding: 'utf-8' });
        return content;
    });

    ipcMain.handle('write-file', (ipc, file, content) => {
        const filePath = path.join(__dirname, 'data', file);
        fs.writeFileSync(filePath, content, { encoding: 'utf-8' });
    });

    let Storage = {};

    ipcMain.handle('set-value', (ipc, name, value) => {
        Storage[name] = value;
    });

    ipcMain.handle('get-value', (ipc, name) => {
        return Storage[name];
    });

    createWindow();
})