import api from '@/api/api';
import  { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface FriendRequest {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  name?: string;
}

const FriendRequestsSendByMe = () => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

const handleRemoveFriendRquest = async(id : string)=>{
    try {
        const data = await api.post("/users/remove-friend-request", {userId : id});
        if(data.data.success){
            setFriendRequests(pre=> pre.filter(item=> item._id !== id ));
        }
    } catch (error) {
        console.log(error)
    }
}
  useEffect(() => {
    (async () => {
      try {
        const res = await api.post("/users/get-sented-friend-request");
        setFriendRequests(res.data.requests || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


    return (
    <div className="min-h-screen bg-white px-4 py-6">
      <h1 className="text-2xl font-black text-gray-900 mb-6 text-center">
        Friend Requests
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : friendRequests.length === 0 ? (
        <p className="text-center text-gray-500">No requests 😴</p>
      ) : (
        <div className="space-y-4 max-w-md mx-auto">
          {friendRequests.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-2xl shadow-md border border-gray-100 bg-white"
            >
              {/* Left Side */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 rounded-xl">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {(user.username || 'U')[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-bold text-gray-900">
                    {user.name || user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    @{user.username}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {/* <Button
                  size="icon"
                  className="rounded-full bg-green-500 hover:bg-green-600 text-white"
                  onClick={()=>handleAcceptFriendRquest(user._id)}
                >
                  <Check className="w-4 h-4" />
                </Button> */}

                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-red-200 text-red-500 hover:bg-red-50"
                  onClick={()=> handleRemoveFriendRquest(user._id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequestsSendByMe;