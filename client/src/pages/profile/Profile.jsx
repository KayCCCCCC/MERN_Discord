import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { colors, getColor } from '@/lib/utils';
import { useAppStore } from '@/store/store'

import React, { useState } from 'react';
import { IoArrowBack } from "react-icons/io5";
import { FaTrash, FaPlus } from "react-icons/fa"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api.client';
import { UPDATE_PROFILE_ROUTE } from '@/utils/constant';
import { useNavigate } from 'react-router-dom';
const Profile = () => {
    const { userInfo, setUserInfo } = useAppStore();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [image, setImage] = useState(null);
    const [hovered, setHovered] = useState(false);
    const [selectedColor, setSelectedColor] = useState(0);
    const [updateProfileClicked, setUpdateProfileClicked] = useState(false);
    const navigate = useNavigate();

    const validateProfile = () => {
        if (!firstName.length) {
            toast.error("First Name is required")
            return false
        }
        if (!lastName.length) {
            toast.error("Last Name is required")
            return false
        }
        return true
    }

    const saveChanges = async () => {
        setUpdateProfileClicked(true)
        if (validateProfile()) {
            try {
                const response = await apiClient.post(UPDATE_PROFILE_ROUTE, { firstName, lastName, color: selectedColor }, { withCredentials: true })
                if (response.status === 200 && response.data) {
                    setUserInfo({ ...response.data.user })
                    toast.success("Update Profile Success!")
                    navigate("/chat")
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Update Profile Fail!");
            }
        }
    }

    return (
        <div className='bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10'>
            <div className='flex flex-col gap-10 w-[80vw] md:w-max'>
                <div>
                    <IoArrowBack className='text-4xl lg:text-6xl text-white/90 cursor-pointer' />
                </div>
                <div className='grid grid-cols-2'>
                    <div className='h-full w-32 md:w-48 md:h-48 relative flex items-center justify-center'
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}>
                        <Avatar className='h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden'>
                            {
                                image ?
                                    (<AvatarImage src={image} alt="avatar" className="object-cover w-full h-full bg-black" />)
                                    :
                                    (
                                        <div className={`uppercase h-32 w-32 md:w-48 md:h-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(selectedColor)}`} >
                                            {firstName ? firstName.split("").shift() : userInfo?.email.split("").shift()}
                                        </div>
                                    )
                            }
                        </Avatar>
                        {hovered && (
                            <div className='absolute inset-0 flex items-center justify-center bg-black/50 ring-fuchsia-50 rounded-full'>
                                {image ? <FaTrash className='text-white text-3xl cursor-pointer' />
                                    : <FaPlus className='text-white text-3xl cursor-pointer' />}
                            </div>
                        )}

                    </div>
                    <div className='flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center'>
                        <div className='w-full'>
                            <Input placeholder="Email" type="email" disabled value={userInfo.email} className="rounded-lg p-6 bg-[#2c2e3b] border-none" />
                        </div>
                        <div className='w-full'>
                            <Input onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" type="text" value={firstName} className="rounded-lg p-6 bg-[#2c2e3b] border-none" />
                            {updateProfileClicked && !firstName.length && <span className='text-red-500 ml-2'>First Name is required!</span>}
                        </div>
                        <div className='w-full'>
                            <Input onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" type="text" value={lastName} className="rounded-lg p-6 bg-[#2c2e3b] border-none" />
                            {updateProfileClicked && !lastName.length && <span className='text-red-500 ml-2'>Last Name is required!</span>}
                        </div>
                        <div className='w-full flex gap-5'>
                            {
                                colors.map((color, index) => (
                                    <div key={index} className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300 
                                    ${selectedColor === index ? "outline outline-white/50 outline-2" : ""
                                        }
                                    `}
                                        onClick={() => setSelectedColor(index)}
                                    ></div>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div className='w-full'>
                    <Button className="h-12 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-500" onClick={saveChanges}>
                        Save Change
                    </Button>
                </div>
            </div >
        </div >
    )
}

export default Profile