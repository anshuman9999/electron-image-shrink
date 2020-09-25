const { app, BrowserWindow, Menu, globalShortcut, ipcMain, shell } = require('electron');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');

process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV === 'production' ? true : false;

// CHECK FOR PLATFORM: 

// MAC -> DARWIN
// WINDOWS -> WIN32
// LINUX -> LINUX

// CHECK FOR WINDOWS: 

const isWin = process.platform === 'Win32' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;
const isLinux = process.platform === 'linux' ? true : false;

let mainWindow;
let aboutWindow;

let imagePath;
let quality;

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: 'ImageShrinker',
        width: 500,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        },
        resizable: isDev ? true : false,
        backgroundColor: 'white'
    })

    mainWindow.loadFile('./app/index.html');


}

const createAboutWindow = () => {
    aboutWindow = new BrowserWindow({
        title: 'About ImageShrinker',
        width: 400,
        height: 500,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false,
        backgroundColor: 'white'
    })

    aboutWindow.loadFile('./app/about.html');

    const aboutMenu = [
        { 
            label: 'File', 
            submenu:[
                { 
                    label: 'Exit', click: () => aboutWindow.destroy() 
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(aboutMenu);
    aboutWindow.setMenu(menu);

}

const menu = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'fileMenu' },
    ...(isDev ? [
        {
            label: 'Developer Opions',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { type: 'separator' },
                { role: 'toggledevtools' }
            ]
        }
    ] : []),
    { label: 'About', click: () => { createAboutWindow() } }

]

ipcMain.on('outputFolderClicked', (e, args) => {
    shell.openPath(args);
})

ipcMain.on('openImageExternally', (e, args) => {
    shell.openPath(args);
})

ipcMain.on('channel1', (e, args) => {
    args.imageDestination = `${app.getPath('home')}\\imageShrinker`;
    args.quality = parseInt(args.quality);
    e.reply('ResizingImage', 'Processing...')
    shrinkImage(e, args);
})

const shrinkImage = async (e, args) => {
    try {
        const pngQuality = args.quality / 100;
        let files = await imagemin([slash(args.filePath)], {
            destination: slash(args.imageDestination),
            plugins: [
                imageminMozjpeg({ quality: args.quality }),
                imageminPngquant({
                    quality: [pngQuality, pngQuality] 
                })
            ]
        });

        const imageDest = files[0].destinationPath;

        e.reply('imageResized', imageDest);

        mainWindow.reload();

        shell.showItemInFolder(imageDest);
        //shell.openPath(args.imageDestination)

    } catch(err) {
        console.log(err);
    }
}

app.on('ready', () => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    //  REGISTERING A GLOBAL SHORTCUT FOR RELOAD WHEN MY WINDOW IS READY:
    globalShortcut.register('CmdOrCtrl+R', () => mainWindow.reload());
    isDev ?  globalShortcut.register(isMac ? 'Cmd+Alt+I' : 'Ctrl+Shift+I', () => mainWindow.toggleDevTools()) : null;

    //  SETTING THE MAINWINDOW AS NULL WHEN MY MAINWINDOW IS READY:
    mainWindow.on('ready', () => mainWindow = null);

});

// WHEN THE PLATFORM IS MAC, IT IS COMMON FOR APPS TO STAY ACTIVE
// EVEN AFTER THE USER QUITS THE APP.
// CLOSES AFTER THE USER DOES COMMAND+Q

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})