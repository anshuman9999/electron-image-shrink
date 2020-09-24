const { remote, ipcRenderer, shell } = require('electron');
const { dialog, app } = remote;
const browseButton = document.getElementById('browse-button');
const ResizeButton = document.getElementById('resize-button');
const qualitySlider = document.getElementById('quality-slider');
const tester = document.getElementById('testing-div');

browseButton.addEventListener('click', async () => {
    const result = await dialog.showOpenDialog({
        title: 'browse for an image',
        defaultPath: app.getPath('pictures'),
        filters: [
            { name: 'Images', extensions: ['jpg', 'png'] }
        ]
    })

    if (result.canceled) {
        ResizeButton.disabled = true;
    } else {
        ResizeButton.disabled = false;
        document.getElementById('input-path-para').innerText = result.filePaths[0];
    }

})


ResizeButton.addEventListener('click', () => {
    ipcRenderer.send('channel1', {
        filePath: document.getElementById('input-path-para').innerText,
        quality: qualitySlider.value
    })
    ResizeButton.disabled = true;

})