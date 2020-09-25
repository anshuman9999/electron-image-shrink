const { app, BrowserWindow, Menu, globalShortcut, ipcMain, shell } = require('electron');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const slash = require('slash');

process.env.NODE_ENV = 'development';

// VARIABLE IS DEVELOPMENT MODE ON: 

const isDev = process.env.NODE_ENV === 'development' ? true : false;

// CHECK FOR PLATFORM: 

// MAC -> DARWIN
// WINDOWS -> WIN32
// LINUX -> LINUX

// CHECK FOR WINDOWS: 

const isWin = process.platform === 'Win32' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;
const isLinux = process.platform === 'linux' ? true : false;

let mainWindow;
//  INITIALIZING THE ABOUT WINDOW: 
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

    //  Load a file with the file protocol
    //mainWindow.loadURL(`file://${__dirname}/app/index.html`);

    // LOAD A FILE WITH LOADFILE:
    mainWindow.loadFile('./app/index.html');


}

const createAboutWindow = () => {
    aboutWindow = new BrowserWindow({
        title: 'About ImageShrinker',
        width: 250,
        height: 300,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false,
        backgroundColor: 'white'
    })

    //  Load a file with the file protocol
    //aboutWindow.loadURL(`file://${__dirname}/app/index.html`);

    // LOAD A FILE WITH LOADFILE:
    aboutWindow.loadFile('./app/about.html');

}

//  In the menu: 

//  ACCELERATOR IS FOR SHORTCUTS
//  CLICK IS SELF EXPLAINATORY
//  AND THE ROLE IS FOR MAC OS PROBLEM THAT IT DOES NOT SHOW FILE.

// const menu = [
//     ...(isMac ? [
//         {
//             role: 'appMenu'
//         }
//     ] : []),
//     {
//         label: 'File',
//         submenu: [
//             {
//                 label: 'Test',
//                 //accelerator: isMac ? 'Command+W' : 'Ctrl+W',
//                 // CAN ALSO BE DONE LIKE THIS: 
//                 accelerator: 'CmdOrCtrl+W',
//                 click: () => console.log('Test Passed!')
//             },

//             {
//                 label: 'Quit',
//                 click: () => app.quit()
//             }
//         ]
//     }
// ];

const menu = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    { role: 'fileMenu' },
    { role: 'viewMenu' },
    ...(isDev ? [
        {
            label: 'Developer Opions',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { type: 'separator' },
                { role: 'toggledevtools' },
                { label: 'about', click: () => { createAboutWindow() } }
            ]
        }
    ] : []),

]

ipcMain.on('openImageExternally', (e, args) => {
    shell.openPath(args);
})

ipcMain.on('channel1', (e, args) => {
    args.imageDestination = `${app.getPath('home')}\\imageShrinker`;
    args.quality = parseInt(args.quality);
    //console.log(args);
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
    globalShortcut.register(isMac ? 'Cmd+Alt+I' : 'Ctrl+Shift+I', () => mainWindow.toggleDevTools());

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