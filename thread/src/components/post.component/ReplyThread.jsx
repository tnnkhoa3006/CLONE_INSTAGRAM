import { useState } from "react";
import CommentBox from "../post.component/commentBox";
import { useSelector } from 'react-redux';

const ReplyThread = ({ allComments, parentId, level = 1, onReply, user }) => {
  const replies = allComments.filter(cmt => cmt.parentId === parentId);
  const [visibleCount, setVisibleCount] = useState(0);
  const { user: currentUser } = useSelector(store => store.auth);

  if (replies.length === 0) return null;

  const handleViewMore = () => {
    setVisibleCount(prev => Math.min(prev + 5, replies.length));
  };

  const handleHide = () => {
    setVisibleCount(0);
  };

  return (
    <div style={{ marginLeft: level * 16 }}>
      {/* Nút View/Hide luôn ở trên */}
      {visibleCount === 0 ? (
        <span
          className="text-gray-400 text-xs cursor-pointer hover:underline"
          onClick={handleViewMore}
        >
          View replies ({replies.length})
        </span>
      ) : (
        <span
          className="text-gray-400 text-xs cursor-pointer hover:underline"
          onClick={handleHide}
        >
          Hide replies
        </span>
      )}

      {/* Hiển thị replies nếu visibleCount > 0 */}
      {visibleCount > 0 && (
        <>
          {replies.slice(0, visibleCount).map(reply => (
            <div key={reply._id}>
              <CommentBox comment={reply} onReply={onReply} user={user} />
              <ReplyThread
                allComments={allComments}
                parentId={reply._id}
                level={level + 1}
                onReply={onReply}
                user={user}
              />
            </div>
          ))}
          {/* Nếu còn nhiều reply chưa hiện, thêm nút View more ở dưới cùng */}
          {visibleCount < replies.length && (
            <span
              className="text-gray-400 text-xs cursor-pointer hover:underline"
              onClick={handleViewMore}
            >
              View more replies ({replies.length - visibleCount})
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default ReplyThread;
