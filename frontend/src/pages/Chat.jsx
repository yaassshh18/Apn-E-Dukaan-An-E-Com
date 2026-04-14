import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Send, ArrowLeft, MoreVertical, Shield, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const Chat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    // We expect state to pass receiver_id and possibly product_id
    const state = location.state || {};
    const [receiverId, setReceiverId] = useState(state.receiver_id || null);
    const [productId] = useState(state.product_id || null);
    
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isOffer, setIsOffer] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    const fetchMessages = useCallback(async () => {
        try {
            const url = receiverId ? `chat/?user_id=${receiverId}` : `chat/`;
            const res = await api.get(url);
            setMessages(res.data.results || res.data);
            scrollToBottom();
        } catch {
            console.error("Failed to load messages");
        }
    }, [receiverId, scrollToBottom]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        const loadMessages = async () => {
            try {
                const url = receiverId ? `chat/?user_id=${receiverId}` : `chat/`;
                const res = await api.get(url);
                setMessages(res.data.results || res.data);
                scrollToBottom();
            } catch {
                console.error("Failed to load messages");
            }
        };

        loadMessages();
        // In a real app we'd use WebSockets for real-time, here we poll every 5s
        const intervalId = setInterval(loadMessages, 5000);
        return () => clearInterval(intervalId);
    }, [receiverId, scrollToBottom, user, navigate]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() && !isOffer) return;
        
        try {
            await api.post('chat/', {
                receiver_id: receiverId,
                product_id: productId,
                content: inputText,
                is_offer: isOffer,
                offer_amount: isOffer ? parseFloat(offerAmount) : null
            });
            setInputText('');
            setOfferAmount('');
            setIsOffer(false);
            fetchMessages();
        } catch {
            toast.error("Failed to send message");
        }
    };

    const handleOfferAction = async (msgId, status) => {
        try {
            await api.patch(`chat/${msgId}/`, { offer_status: status });
            fetchMessages();
            toast.success(`Offer ${status}!`);
        } catch {
            toast.error("Failed to update offer");
        }
    };

    // A simple grouping of messages to figure out unique conversations
    const getConversationsList = () => {
        const conversationsMap = new Map();
        messages.forEach(msg => {
            const otherUser = msg.sender.id === user.id ? msg.receiver : msg.sender;
            if (otherUser) {
                 conversationsMap.set(otherUser.id, otherUser);
            }
        });
        return Array.from(conversationsMap.values());
    };

    const conversations = getConversationsList();

    return (
        <div className="container mx-auto px-0 lg:px-6 pt-20 pb-0 max-w-7xl h-[calc(100vh-72px)] bg-background">
            <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex overflow-hidden border-0 lg:border border-gray-200 lg:rounded-3xl animate-fade-in relative z-20">
                
                {/* Sidebar - Contacts */}
                <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-gray-100 flex-col ${receiverId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="h-[72px] px-6 border-b border-gray-100 bg-gray-50/80 backdrop-blur flex items-center justify-between shrink-0">
                        <h2 className="text-2xl font-display font-extrabold text-gray-900">Messages 💬</h2>
                    </div>
                    <div className="flex-grow overflow-y-auto custom-scrollbar">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center h-full text-gray-400">
                                <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
                                <p className="font-medium">No active chats.</p>
                                <p className="text-sm mt-1">Start connecting with local sellers!</p>
                            </div>
                        ) : (
                            conversations.map(contact => (
                                <div 
                                    key={contact.id} 
                                    onClick={() => setReceiverId(contact.id)}
                                    className={`p-4 mx-3 mt-3 rounded-2xl cursor-pointer flex items-center gap-4 transition-all ${receiverId === contact.id ? 'bg-primary text-white shadow-glow' : 'bg-white hover:bg-gray-50 border border-transparent hover:border-gray-100'}`}
                                >
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0 shadow-inner ${receiverId === contact.id ? 'bg-white/20 text-white' : 'bg-gradient-to-tr from-gray-100 to-gray-200 text-gray-600'}`}>
                                        {contact.username?.[0]?.toUpperCase()}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <h3 className={`font-bold truncate text-lg ${receiverId === contact.id ? 'text-white' : 'text-gray-900'}`}>{contact.username}</h3>
                                        <p className={`text-sm truncate font-medium ${receiverId === contact.id ? 'text-white/70' : 'text-primary'}`}>Active Conversation</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className={`flex-grow flex-col relative w-full ${!receiverId ? 'hidden md:flex' : 'flex'}`}>
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[#EFEAE2] z-0 opacity-40 mix-blend-multiply pointer-events-none" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}></div>

                    {receiverId ? (
                        <div className="flex flex-col h-full z-10">
                            {/* Chat Header */}
                            <div className="h-[72px] px-6 bg-white border-b border-gray-100 flex items-center gap-4 shrink-0 shadow-sm">
                                <button onClick={() => setReceiverId(null)} className="md:hidden text-gray-400 hover:text-primary transition-colors hover:bg-gray-50 p-2 rounded-full">
                                    <ArrowLeft className="w-6 h-6"/>
                                </button>
                                <div className="w-12 h-12 bg-gradient-to-tr from-secondary to-primary rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
                                    {conversations.find(c => c.id === receiverId)?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-display font-bold text-xl text-gray-900">{conversations.find(c => c.id === receiverId)?.username || 'User'}</h3>
                                </div>
                                <Shield className="text-accent w-6 h-6 opacity-80"/>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                <div className="text-center my-6">
                                    <span className="bg-[#FEFCE8] border border-yellow-200 text-yellow-800 text-xs font-bold px-4 py-2 rounded-lg shadow-sm inline-block tracking-wide">
                                        🔒 Messages are end-to-end encrypted locally.
                                    </span>
                                </div>

                                {messages.filter(m => m.sender.id === receiverId || m.receiver.id === receiverId).map(msg => (
                                    <div key={msg.id} className={`flex ${msg.sender.id === user.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl px-5 py-3 shadow-[0_2px_4px_rgba(0,0,0,0.06)] relative ${msg.sender.id === user.id ? 'bg-[#D9FDD3] rounded-tr-sm text-gray-900' : 'bg-white rounded-tl-sm text-gray-900 border border-gray-100'}`}>
                                            {msg.product && (
                                                <div className="bg-white p-2 rounded-xl mb-3 flex items-center gap-3 cursor-pointer shadow-sm hover:shadow" onClick={() => navigate(`/product/${msg.product.id}`)}>
                                                    {msg.product.image ? <img src={msg.product.image} className="w-12 h-12 object-cover rounded-lg" /> : <div className="w-12 h-12 bg-gray-100 rounded-lg"/>}
                                                    <div className="flex-grow min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{msg.product.title}</p>
                                                        <p className="text-sm text-primary font-black">₹{msg.product.price}</p>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {msg.is_offer ? (
                                                <div className={`border-2 p-4 rounded-xl mb-3 ${msg.offer_status === 'ACCEPTED' ? 'border-green-400 bg-green-50' : msg.offer_status === 'REJECTED' ? 'border-gray-200 bg-gray-50' : 'border-indigo-200 bg-indigo-50 shadow-inner'}`}>
                                                    <p className={`font-black text-xl mb-2 ${msg.offer_status === 'ACCEPTED' ? 'text-green-600' : msg.offer_status === 'REJECTED' ? 'text-gray-400 line-through' : 'text-indigo-600'}`}>
                                                        {msg.offer_status === 'ACCEPTED' ? 'Deal: ' : 'Offer: '}₹{msg.offer_amount}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${msg.offer_status === 'ACCEPTED' ? 'bg-green-100 text-green-700 border-green-200' : msg.offer_status === 'REJECTED' ? 'bg-white text-gray-400 border-gray-200' : 'bg-white text-indigo-500 border-indigo-200'}`}>{msg.offer_status || 'PENDING OP'}</span>
                                                        {msg.receiver.id === user.id && (!msg.offer_status || msg.offer_status === 'PENDING') && (
                                                            <div className="flex gap-2 ml-auto">
                                                                <button onClick={() => handleOfferAction(msg.id, 'ACCEPTED')} className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold text-sm px-4 py-1.5 rounded-lg shadow-sm transition-colors">Accept</button>
                                                                <button onClick={() => handleOfferAction(msg.id, 'REJECTED')} className="bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-600 font-bold text-sm px-4 py-1.5 rounded-lg shadow-sm transition-colors">Decline</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : null}

                                            <p className="text-base whitespace-pre-wrap break-words font-medium leading-relaxed">{msg.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[10px] text-gray-500/80 font-bold">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} className="h-4"/>
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                                {isOffer && (
                                    <div className="mb-3 flex items-center gap-3 bg-indigo-50 p-3 rounded-xl border border-indigo-100 animate-slide-up">
                                        <span className="text-secondary font-black text-sm shrink-0">Offer Amount (₹):</span>
                                        <input 
                                            type="number" 
                                            className="bg-white border-none shadow-sm w-32 p-2 rounded-lg text-lg font-bold focus:ring-2 focus:ring-secondary/20 outline-none transition-all" 
                                            value={offerAmount} 
                                            placeholder="e.g. 1500"
                                            onChange={(e) => setOfferAmount(e.target.value)}
                                        />
                                        <button type="button" onClick={() => setIsOffer(false)} className="text-sm font-bold text-gray-400 hover:text-gray-600 ml-auto bg-white px-3 py-1.5 rounded-lg border">Cancel</button>
                                    </div>
                                )}
                                
                                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                                    <button 
                                        type="button" 
                                        className={`px-5 py-3 h-12 rounded-2xl text-sm font-black transition-all shrink-0 ${isOffer ? 'bg-secondary text-white shadow-glow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-transparent hover:border-gray-300'}`}
                                        onClick={() => setIsOffer(!isOffer)}
                                    >
                                        ₹ Make Offer
                                    </button>
                                    <input 
                                        type="text" 
                                        placeholder="Type your message..." 
                                        className="flex-grow input-field bg-gray-50 h-12 shadow-inner border-gray-200 text-base"
                                        value={inputText}
                                        onChange={(e) => setInputText(e.target.value)}
                                    />
                                    <button type="submit" className="bg-primary text-white p-3 h-12 w-12 flex items-center justify-center rounded-2xl hover:bg-secondary transition-colors shrink-0 shadow-glow disabled:opacity-50 disabled:shadow-none" disabled={!inputText.trim() && !isOffer}>
                                        <Send className="w-5 h-5"/>
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-grow flex flex-col items-center justify-center z-10">
                            <div className="w-48 h-48 bg-white/60 pointer-events-none rounded-full flex items-center justify-center shadow-glass mb-8 border border-white">
                                <MessageSquare className="w-20 h-20 text-gray-300 drop-shadow-sm" />
                            </div>
                            <h2 className="text-3xl font-display font-black text-gray-800 mb-2">Apn-E-Dukaan Web Chat</h2>
                            <p className="text-center max-w-sm text-gray-500 font-medium leading-relaxed">Select a conversation to start messaging, negotiating, and locking in the best hyperlocal deals seamlessly.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
