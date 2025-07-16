import React, { useEffect, useState } from 'react'
import RightSide from '../components/home.component/rightSide'
import CenterSide from '../components/home.component/centerSide'
import UseGetAllPost from '../hooks/useGetAllPost.jsx'
import UseGetSuggestedUsers from '../hooks/useGetSuggestedUsers.jsx'

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Gọi hooks TRƯỚC bất kỳ return nào
  UseGetAllPost();
  UseGetSuggestedUsers();
  
  useEffect(() => {
    try {
      // Thêm một chút delay để test
      setTimeout(() => {
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error('home error ', error);
      setError(error.message);
      setLoading(false);
    }
  }, [])

  // Early returns sau khi gọi hooks
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div>Loading...</div>
    </div>
  );
  
  if (error) return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div>Error: {error}</div>
    </div>
  );

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