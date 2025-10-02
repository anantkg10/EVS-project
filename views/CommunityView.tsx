
import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import HolographicButton from '../components/HolographicButton';
import { Post, Reply, HistoryItem } from '../types';

const initialPosts: Post[] = [
    {
        id: '1', author: 'Farmer John', avatar: 'https://i.pravatar.cc/150?u=farmerjohn', time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        title: 'Unexpected spots on my tomato leaves, any ideas?',
        content: 'I\'ve been seeing these strange yellow spots with dark centers on my heirloom tomatoes. Never had this issue before. Uploading a scan now, but wanted to see if anyone has seen this.',
        replies: [{
            id: 'r1', author: 'AgriExpert_Anna', avatar: 'https://i.pravatar.cc/150?u=agrianna', time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            content: "It sounds like it could be early blight. Does it start on the lower, older leaves? Check the humidity levels in your greenhouse."
        }],
        views: 42,
    },
    {
        id: '2', author: 'AgriExpert_Anna', avatar: 'https://i.pravatar.cc/150?u=agrianna', time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        title: 'PSA: High humidity warning for fungal infections this week!',
        content: 'With the recent rainfall and high humidity levels in the region, be extra vigilant for signs of powdery mildew and late blight. Ensure good air circulation around your plants.',
        replies: [], views: 157,
    },
];

const randomUser = () => {
    const id = Math.floor(Math.random() * 1000);
    return { name: `Farmer_${id}`, avatar: `https://i.pravatar.cc/150?u=user${id}` };
};

const PostThreadView: React.FC<{ post: Post; onBack: () => void; onReply: (postId: string, content: string) => void; }> = ({ post, onBack, onReply }) => {
    const [replyContent, setReplyContent] = useState('');

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        onReply(post.id, replyContent);
        setReplyContent('');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <HolographicButton onClick={onBack} className="mb-8 py-2 px-4 text-sm">&larr; Back to Forum</HolographicButton>
            
            <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border mb-8">
                <div className="flex items-start space-x-4">
                    <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-full border-2 border-green-500/50" />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-green-300">{post.title}</h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                            <span>Posted by <span className="font-semibold text-gray-300">{post.author}</span></span>
                            <span>&bull;</span>
                            <span>{new Date(post.time).toLocaleString()}</span>
                        </div>
                        <p className="mt-4 text-gray-200 whitespace-pre-wrap">{post.content}</p>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-4">Replies ({post.replies.length})</h3>
            <div className="space-y-6 mb-8">
                {post.replies.map(reply => (
                    <div key={reply.id} className="bg-black/20 p-4 rounded-xl holographic-border ml-8">
                        <div className="flex items-start space-x-4">
                            <img src={reply.avatar} alt={reply.author} className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 text-sm text-gray-400">
                                    <span className="font-semibold text-gray-300">{reply.author}</span>
                                    <span>&bull;</span>
                                    <span>{new Date(reply.time).toLocaleString()}</span>
                                </div>
                                <p className="mt-2 text-gray-300">{reply.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
                 {post.replies.length === 0 && <p className="text-gray-400 ml-8">No replies yet. Be the first to respond!</p>}
            </div>

            <form onSubmit={handleReplySubmit} className="bg-black/30 p-4 rounded-xl holographic-border">
                <h4 className="font-semibold text-white mb-2">Post a Reply</h4>
                <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full bg-black/40 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                    rows={4}
                    required
                />
                <div className="text-right mt-4">
                    <HolographicButton type="submit" className="py-2 px-4 text-base">Submit Reply</HolographicButton>
                </div>
            </form>
        </div>
    );
};

interface CommunityViewProps {
  navigationState: any;
  clearNavigationState: () => void;
}

const CommunityView: React.FC<CommunityViewProps> = ({ navigationState, clearNavigationState }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');

    useEffect(() => {
        const storedPosts = JSON.parse(localStorage.getItem('forumPosts') || 'null');
        setPosts(storedPosts || initialPosts);
    }, []);
    
    useEffect(() => {
        if (navigationState?.action === 'CREATE_POST_FROM_SCAN') {
            const scanData: HistoryItem = navigationState.data;
            
            const title = `Seeking advice on: ${scanData.diseaseName}`;
            const content = `Hello community,

I just received an AI diagnosis and would appreciate a second opinion.

**Diagnosis:** ${scanData.diseaseName}
**Confidence:** ${scanData.confidence.toFixed(1)}%
**Severity:** ${scanData.severity}

**AI's Summary:**
> ${scanData.summary.split('\n').join('\n> ')}

Any thoughts or similar experiences? Thanks in advance!

*(Note: Image from scan is not attached to this post yet.)*`;

            setNewPostTitle(title);
            setNewPostContent(content);
            setIsCreatingPost(true);
            
            clearNavigationState(); // Consume the state so it doesn't re-trigger
        }
    }, [navigationState, clearNavigationState]);


    const savePosts = (updatedPosts: Post[]) => {
        setPosts(updatedPosts);
        localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
    };

    const handleCreatePost = (e: React.FormEvent) => {
        e.preventDefault();
        const user = randomUser();
        const newPost: Post = {
            id: new Date().toISOString(),
            author: user.name,
            avatar: user.avatar,
            time: new Date().toISOString(),
            title: newPostTitle,
            content: newPostContent,
            replies: [],
            views: 0,
        };
        savePosts([newPost, ...posts]);
        setNewPostTitle('');
        setNewPostContent('');
        setIsCreatingPost(false);
    };

    const handleReply = (postId: string, content: string) => {
        const user = randomUser();
        const newReply: Reply = {
            id: new Date().toISOString(),
            author: user.name,
            avatar: user.avatar,
            time: new Date().toISOString(),
            content: content,
        };
        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                const updatedPost = { ...p, replies: [...p.replies, newReply] };
                setSelectedPost(updatedPost); // Update the view immediately
                return updatedPost;
            }
            return p;
        });
        savePosts(updatedPosts);
    };

    if (selectedPost) {
        return <PostThreadView post={selectedPost} onBack={() => setSelectedPost(null)} onReply={handleReply} />;
    }
    
    return (
        <div className="container mx-auto p-4">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-green-300 mb-4">Community Forum</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Connect with other farmers, share your experiences, and get advice from agricultural experts.
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto flex justify-between items-center mb-8">
                <h3 className="text-2xl font-semibold text-white">Recent Discussions</h3>
                <HolographicButton onClick={() => setIsCreatingPost(true)}>
                    <span className="text-base">Start a New Topic</span>
                </HolographicButton>
            </div>

            {isCreatingPost && (
                 <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[100] p-4" onClick={() => setIsCreatingPost(false)}>
                    <form onSubmit={handleCreatePost} className="bg-black/50 holographic-border rounded-2xl w-full max-w-2xl p-8" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-green-300 mb-6">Create New Post</h3>
                        <div className="space-y-4">
                             <input type="text" value={newPostTitle} onChange={e => setNewPostTitle(e.target.value)} placeholder="Post Title" className="w-full bg-black/40 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400" required/>
                             <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder="What's on your mind?" className="w-full bg-black/40 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400" rows={8} required />
                        </div>
                        <div className="flex justify-end space-x-4 mt-6">
                            <HolographicButton type="button" onClick={() => setIsCreatingPost(false)} className="py-2 px-4 text-base bg-gray-500/20 border-gray-400/50 hover:bg-gray-500/40">Cancel</HolographicButton>
                            <HolographicButton type="submit" className="py-2 px-4 text-base">Post</HolographicButton>
                        </div>
                    </form>
                 </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">
                {posts.map(post => (
                    <div key={post.id} className="bg-black/30 backdrop-blur-md p-6 rounded-xl holographic-border hover:border-green-400 transition-colors duration-300">
                        <div className="flex items-start space-x-4">
                            <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-full border-2 border-green-500/50" />
                            <div className="flex-1">
                                <h4 className="text-xl font-bold text-green-300 hover:underline cursor-pointer" onClick={() => setSelectedPost(post)}>{post.title}</h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                                    <span>Posted by <span className="font-semibold text-gray-300">{post.author}</span></span>
                                    <span>&bull;</span>
                                    <span>{new Date(post.time).toLocaleString()}</span>
                                </div>
                                <p className="mt-3 text-gray-300 line-clamp-2">{post.content}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end space-x-6 mt-4 text-gray-400 text-sm">
                            <span>{post.replies.length} Replies</span>
                            <span>{post.views} Views</span>
                            <button onClick={() => setSelectedPost(post)} className="font-semibold text-green-400 hover:text-white">View Thread</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunityView;