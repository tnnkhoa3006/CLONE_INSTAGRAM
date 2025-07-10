import { useRef } from 'react';
import PostCard from '../post.component/postCard.jsx'; 
import { useSelector } from 'react-redux';

const CenterSide = () => {
  const scrollRef = useRef(null)
  const { posts } = useSelector(store => store.post);
  let isDown = false
  let startX
  let scrollLeft

  const handleMouseDown = (e) => {
    isDown = true
    scrollRef.current.classList.add('active')
    startX = e.pageX - scrollRef.current.offsetLeft
    scrollLeft = scrollRef.current.scrollLeft
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e) => {
    if (!isDown) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1 // tốc độ kéo
    scrollRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    isDown = false
    scrollRef.current.classList.remove('active')
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Header section: Stories */}
      <div 
        className="overflow-x-auto hide-scrollbar w-full max-w-2xl mt-8 pl-12"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        style={{ cursor: 'grab', userSelect: 'none' }}
      >
        <div className="flex items-center w-max space-x-5">
          {[...Array(15)].map((_, index) => (
            <div key={index} className="flex flex-col items-center w-[85px]">
              <div className="w-[85px] h-[85px] rounded-full overflow-hidden border-4 border-r-pink-500 border-b-purple-400 border-l-yellow-400 border-t-orange-400">
                <img
                  src="https://ts3.mm.bing.net/th?id=OIP.0LKDeICeagHJN54PrY-EcwHaEK&pid=15.1"
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-white text-xs w-full text-center truncate mt-1">Donald Trump</div>
            </div>
          ))}
        </div>
      </div>
      {/* Post section */}
      <div className="flex flex-col items-center gap-6 mt-8 w-full max-w-2xl pr-20">
        {posts?.map((post) => (
          <PostCard key={post._id} postId={post._id} />
        ))}
      </div>
    </div>
  )
}

export default CenterSide
