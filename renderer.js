const { remote, ipcRenderer, shell } = require('electron');
const { dialog, app } = remote;
const fs = require('fs');

const mainHeading = document.getElementById('main-heading');
const browseButton = document.getElementById('browse-button');
const ResizeButton = document.getElementById('resize-button');
const qualitySlider = document.getElementById('quality-slider');
const inputPathPara = document.getElementById('input-path-para');
const outputFolder = document.getElementById('output-path-text');
const fileSizePara = document.getElementById('file-size-para');
const modeToggle = document.getElementById('toggle-mode');

let darkMode = localStorage.getItem('darkMode');

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
        const fileSize = fs.statSync(result.filePaths[0]).size / 1000;
        fileSizePara.innerText = `Size: ${ fileSize } KB`;
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

if(darkMode === 'enabled') {
    document.body.classList.add('dark-mode');
    browseButton.style.backgroundColor = 'hotpink';
    browseButton.style.color = '#eee';
    mainHeading.style.color = 'hotpink';
    ResizeButton.classList.add('demo');
    modeToggle.classList.remove('fa-moon');
    modeToggle.classList.add('fa-sun');

}

const enableDarkMode = () => {
    document.body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
    browseButton.style.backgroundColor = 'hotpink';
    browseButton.style.color = 'black';
    mainHeading.style.color = 'hotpink';
    ResizeButton.classList.add('demo');
    modeToggle.classList.remove('fa-moon');
    modeToggle.classList.add('fa-sun');
}

const disableDarkMode = () => {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    browseButton.style.backgroundColor = '#800C49';
    browseButton.style.color = 'white';
    mainHeading.style.color = '#800C49';
    ResizeButton.style.backgroundColor = '#333';
    modeToggle.classList.remove('fa-sun');
    modeToggle.classList.add('fa-moon');
}

modeToggle.addEventListener('click', () => {
    darkMode = localStorage.getItem('darkMode');
    if(darkMode !== 'enabled') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
})