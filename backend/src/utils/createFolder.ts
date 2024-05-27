import fs from 'fs'

function createFolder(folderPath: string) {
    // console.log('creating folder..' + folderPath)
    if (!fs.existsSync(folderPath)){
        //console.log('Cannot find the folder:'+folderPath)
        //fs.mkdirSync(folderPath);
        fs.mkdirSync(folderPath, { recursive: true });
    }else {
       // console.log('Found the folder:'+folderPath);
    }
}

export default createFolder;