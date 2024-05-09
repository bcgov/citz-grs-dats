import fs from 'fs'

function createFolder(folderPath: string) {
    if (!fs.existsSync(folderPath)){
        //console.log('Cannot find the folder:'+folderPath)
        fs.mkdirSync(folderPath);
    }else {
        //console.log('Found the folder:'+folderPath);
    }
}

export default createFolder;