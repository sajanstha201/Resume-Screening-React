import { useState } from 'react'
import {JobDescription,ResumeUploading,UploadedResume,Rating} from '../components/ResumeScreening'
import { ActivateLoader, ShowAlert } from '../components/AlertLoader'
import axios from 'axios'
export const ResumeScreening=()=>{
    const [jobDescriptionDetail,setJobDescriptionDetail]=useState('')
    const [resumeDetail,setResumeDetail]=useState({})
    const [rating,setRating]=useState([])
    const requestToken=async()=>{
        try{
            const response=await axios.get('http://sajanstha20155.pythonanywhere.com/get-token/')
            return response.data.token
        }
        catch(error){
            ShowAlert(error,'red');
            console.log(error)
        }
    }
    const requestPosting=async()=>{
        try{
            ActivateLoader(true)
            if(jobDescriptionDetail===''){
                ShowAlert('Empty Job Description','red')
                return
            }
            const response = await axios.post(
                'https://sajanstha20155.pythonanywhere.com/get-rating/',
                {
                    job_description: jobDescriptionDetail,
                    resume_detail: resumeDetail,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            setRating(response.data)
            }
        catch(error){
            ShowAlert(error,'red')
            console.log(error)
        }
        finally{
            ActivateLoader(false)
        }
    }
    return(
        <div className=''>
            <div className='h-screen flex flex-col'>
                <div className='w-full h-[30%] flex flex-row'>
                    <div className='w-[50%] h-full '>
                    <JobDescription jobDescriptionDetail={jobDescriptionDetail} setJobDescriptionDetail={setJobDescriptionDetail}/>
                    </div>
                    <div className='w-[50%] h-full '>
                    <ResumeUploading resumeDetail={resumeDetail} setResumeDetail={setResumeDetail}/>
                    </div>
                </div>
                <div className='w-full h-[70%] flex flex-row'>
                    <div className='w-[50%] h-full '>
                        {Object.keys(resumeDetail).length!==0&&<UploadedResume setRating={setRating} resumeDetail={resumeDetail} setResumeDetail={setResumeDetail}  requestPosting={requestPosting}/>}

                    </div >
                    <div className='w-[50%] h-full '>
                        {Object.keys(rating).length!==0&&<Rating rating={rating} setRating={setRating} />}

                    </div>
                </div>
            </div>
        </div>
    )
}