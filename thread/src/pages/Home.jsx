import React from 'react'
import RightSide from '../components/home.component/rightSide'
import CenterSide from '../components/home.component/centerSide'
import UseGetAllPost from '../hooks/useGetAllPost.jsx'
import UseGetSuggestedUsers from '../hooks/useGetSuggestedUsers.jsx'

const Home = () => {
  UseGetAllPost();
  UseGetSuggestedUsers();
  return (
    <div
      className="flex h-screen bg-black text-white"
      style={{ marginLeft: 240 }}
    >
      <div className="flex mx-auto w-full max-w-5xl justify-center gap-8">
        <div className="flex-1 max-w-2xl">
          <CenterSide />
        </div>
        <div className="hidden md:block w-[360px]">
          <RightSide />
        </div>
      </div>
    </div>
  )
}

export default Home
