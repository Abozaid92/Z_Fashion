"use client"
import React from 'react'

const ProfileSkeleton = () => {
  return (
    <div className="flex items-center justify-center min-h-[200px] w-full">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
    </div>
  )
}

export default ProfileSkeleton