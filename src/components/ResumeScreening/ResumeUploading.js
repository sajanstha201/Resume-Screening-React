import { useState } from "react"
import mammoth from "mammoth"
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import {ShowAlert,ActivateLoader} from '../AlertLoader/index'
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;


export const ResumeUploading=({resumeDetail,setResumeDetail})=>{
    const [isUploadOptionActivate,setIsUploadOptionActivate]=useState(true);
    const isDuplicateFile=(file)=>{
        Object.keys(resumeDetail).forEach((key)=>{
            if(key===file.name){
                ShowAlert('Duplicate File Name: '+file.name,'red')
                return true
            }
        })
        return false
    }
    const UploadResumeDetail=()=>{
        try{
            ActivateLoader(true)
            console.log('uploading the resume')
            if(!isUploadOptionActivate){
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0'); 
                const day = String(now.getDate()).padStart(2, '0');
                const hour = String(now.getHours()).padStart(2, '0');
                const minute = String(now.getMinutes()).padStart(2, '0');
                const second = String(now.getSeconds()).padStart(2, '0');
                const formattedDateTime = `${year}-${month}-${day}_${hour}-${minute}-${second}`;
                const resumeText=document.getElementById('resume-text').value.trim()
                if(resumeText){
                    setResumeDetail(prevData=>({...prevData,['Resume No'+formattedDateTime]:resumeText}))
                    document.getElementById('resume-text').value=''
                }
                else{
                    ShowAlert('Empty Resume Text','red')
                }
            }
            else{
                const resumeFiles=Array.from(document.getElementById('resume-input').files);
                resumeFiles.forEach((file)=>{
                    if(!isDuplicateFile(file)){
                        const reader=new FileReader();
                        reader.onload=async (event)=>{
                            let fullText=''
                            if(file.name.endsWith('.doc')||file.name.endsWith('.docx')){
                                const doc=await mammoth.extractRawText({arrayBuffer:event.target.result})
                                fullText=doc.value
                            }
                            else if(file.name.endsWith('.pdf')){
                                const pdf = await getDocument({ data: event.target.result }).promise;
                                for (let i = 1; i <= pdf.numPages; i++) {
                                    const page = await pdf.getPage(i);
                                    const textContent = await page.getTextContent();
                                    textContent.items.forEach(item => {
                                        fullText += item.str + ' ';
                                    });
                                }
                            }
                            setResumeDetail(prevData=>({...prevData,[file.name]:fullText}))
                        }
                        reader.readAsArrayBuffer(file)
                    }
                })
            }
        }
        catch(error){
            console.log(error)
        }
        finally{
            ActivateLoader(false)
            console.log(resumeDetail)
        }
    }
    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
      };
    
      const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer.files;
        if (files.length > 0) {
          document.getElementById('resume-input').files = files;
          UploadResumeDetail();
        }
      };
    return(
        <div className='h-[40%] flex  flex-col items-center justify-center relative'>
            <h1>Upload Resume</h1>
            <div className="h-[60%] w-[40%] bg-[#adcbe3] border border-black border-dotted rounded-md flex flex-col justify-center items-center relative">
                {!isUploadOptionActivate&&<>
                    <textarea id='resume-text' className="h-[90%] w-[90%] bg-[#adcbe3] rounded-md focus:outline-none " placeholder="Type or Copy Paste Resume here" ></textarea>
                    <div className="absolute bottom-1 bg-white px-1 rounded-md" onClick={()=>{setIsUploadOptionActivate(true)}}>upload</div>
                </>}
                {isUploadOptionActivate&&<> 
                <label 
                    htmlFor='resume-input' 
                    className=" h-[40%] bg-[#dfe3ee] border border-black w-[60%] rounded-md flex flex-col items-center justify-center hover:border-2"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}>
                    <span>Upload or Drop Resume</span>
                    <span>as .pdf or .docx file</span>
                 </label>
                <input id='resume-input' type='file' accept='.pdf,.doc,.docx' className="hidden" onChange={UploadResumeDetail} multiple></input>
                <div className="absolute bottom-1 bg-white px-1 rounded-md" onClick={()=>{setIsUploadOptionActivate(false)}}>copy past</div>
                </>}
            </div>
            <button  className={`${isUploadOptionActivate?'hidden':''} absolute bottom-0 w-28 h-10 mt-2 bg-[#d4edda] rounded-md border-2 border border-black shadow-sm`} onClick={UploadResumeDetail}>Add</button>
        </div>
    )
}