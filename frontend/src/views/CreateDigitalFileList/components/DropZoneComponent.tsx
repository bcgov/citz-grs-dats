import { useCallback, FunctionComponent, Dispatch } from "react"
import { useDropzone } from "react-dropzone" 
const DropZoneComponent : FunctionComponent<{setFile:Dispatch<any>}>= ({setFile}) => { 

  const onDrop= useCallback( 
    (acceptedFiles: any[]) => {
      setFile(acceptedFiles[0])
    },
    [],
  )
  const {getRootProps, getInputProps, isDragAccept, isDragReject}= useDropzone({onDrop,
  multiple:false,
  });

  return (
      <div {...getRootProps()} className="box p-6 w-full">
        <input {...getInputProps()}/>
        <div className="flex flex-col items-center justify-center border-2 dark:border-white border-purple-900  rounded-xl">
          <img src="/images/folder.png" alt="folder" className="image" />
{
  isDragReject? <p>Sorry unaccepted file format</p>
  :
  <>
      <p className="dark:text-gray-300 text-gray-800">DRAG AND DROP HERE!</p>
        <p className="mt-2 text-base dark:text-gray-300 text-gray-800">Drop you files except PDFs :(!</p>
  </>

}
        
        </div>
      </div>
  )
}

export default DropZoneComponent