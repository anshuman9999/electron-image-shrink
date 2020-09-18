const { remote, ipcRenderer } = require('electron');
const { dialog, app } = remote;

const browseButton = document.getElementById('browse-button');
const ResizeButton = document.getElementById('resize-button');
const qualitySlider = document.getElementById('quality-slider');


browseButton.addEventListener('click', async () => {
    const result =  await dialog.showOpenDialog({
        title: 'browse for an image',
        defaultPath: app.getPath('pictures'),
        filters: [
            { name: 'Images', extensions: [ 'jpg', 'png' ] }
        ]
    })

    if(result.canceled) {
        ResizeButton.disabled = true;
    } else {
        ResizeButton.disabled = false;
    }

    ResizeButton.addEventListener('click', () => {
        result.quality = qualitySlider.value;
        ipcRenderer.send('channel1', {
            filePath: result.filePaths[0],
            quality: result.quality
        })
    })
})


// ResizeButton.addEventListener('click', () => {
//     qualitySlider
// })