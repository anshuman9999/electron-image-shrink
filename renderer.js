const { remote, ipcRenderer, shell } = require('electron');
const { dialog, app } = remote;
const browseButton = document.getElementById('browse-button');
const ResizeButton = document.getElementById('resize-button');
const qualitySlider = document.getElementById('quality-slider');
const inputPathPara = document.getElementById('input-path-para');
const outputFolder = document.getElementById('output-path-text');

outputFolder.innerText = `${app.getPath('home')}\\imageShrinker`;
outputFolder.addEventListener('click', () => {
    ipcRenderer.send('outputFolderClicked', outputFolder.innerText);
});

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

inputPathPara.addEventListener('click', () => {
    ipcRenderer.send('openImageExternally', inputPathPara.innerText);
})

ipcRenderer.on('ResizingImage', (e, args) => {
    document.body.style.opacity = 0.6;
    document.getElementById('main').classList.add('spinner');
    document.getElementById('main').style.pointerEvents = 'none'
})

ipcRenderer.on('imageResized', (e, args) => {
    console.log(args);
})