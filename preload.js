const { contextBridge, ipcRenderer } = require('electron');

console.log(window)

contextBridge.exposeInMainWorld('shared', {
    navigate: (page) => ipcRenderer.invoke('navigate', page),
    readData: (file) => ipcRenderer.invoke('read-file', file),
    writeData: (file, content) => ipcRenderer.invoke('write-file', file, content),
    setValue: (name, value) => ipcRenderer.invoke('set-value', name, value),
    getValue: (name) => ipcRenderer.invoke('get-value', name),
})
