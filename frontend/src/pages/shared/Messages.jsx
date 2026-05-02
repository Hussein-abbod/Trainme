import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import CompanyNavbar from '../../components/CompanyNavbar.jsx';
import Footer from '../../components/Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Messages as MessagesAPI } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner, formatDate } from '../../utils/helpers.jsx';

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [contacts, setContacts] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  // Parse initial user from URL
  const urlUserId = searchParams.get('user_id');

  const fetchContacts = async () => {
    try {
      const data = await MessagesAPI.contacts();
      
      // If we have a URL user_id that isn't in contacts, add a temporary contact entry
      if (urlUserId) {
        const uid = parseInt(urlUserId);
        if (!data.find(c => c.id === uid)) {
          data.unshift({
            id: uid,
            name: searchParams.get('name') || 'New Conversation',
            last_message: 'Send your first message...',
            last_message_at: new Date().toISOString(),
            unread: 0
          });
        }
        if (!activeUserId) setActiveUserId(uid);
      }
      
      setContacts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const data = await MessagesAPI.getConversation(userId);
      setMessages(data);
    } catch (err) {
      toast('Failed to load messages', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // Poll for new messages/contacts every 10 seconds
    const interval = setInterval(() => {
      fetchContacts();
      if (activeUserId) {
        MessagesAPI.getConversation(activeUserId).then(data => setMessages(data)).catch(() => {});
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [activeUserId]);

  useEffect(() => {
    if (activeUserId) {
      setLoadingMessages(true);
      fetchMessages(activeUserId);
      
      // Clear unread count for this contact immediately in UI
      setContacts(prev => prev.map(c => c.id === activeUserId ? { ...c, unread: 0 } : c));
    }
  }, [activeUserId]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!inputText.trim() || !activeUserId) return;

    const content = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const newMsg = await MessagesAPI.send({ receiver_id: activeUserId, content });
      setMessages(prev => [...prev, newMsg]);
      
      // Update contacts list last message
      setContacts(prev => {
        let exists = false;
        const updated = prev.map(c => {
          if (c.id === activeUserId) {
            exists = true;
            return { ...c, last_message: content, last_message_at: new Date().toISOString() };
          }
          return c;
        });
        if (!exists) {
          // It was a brand new conversation
          fetchContacts();
        }
        return updated.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
      });

    } catch (err) {
      toast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  }

  const activeContact = contacts.find(c => c.id === activeUserId);

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      {user?.role === 'company' ? <CompanyNavbar /> : <Navbar />}
      
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-gutter py-lg flex flex-col h-[calc(100vh-64px)]">
        
        <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl flex flex-col md:flex-row flex-grow overflow-hidden shadow-sm">
          
          {/* Sidebar: Contacts */}
          <div className={`w-full md:w-80 border-r border-surface-variant flex flex-col ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-surface-variant">
              <h2 className="font-h3 text-on-surface">Conversations</h2>
            </div>
            
            <div className="flex-grow overflow-y-auto">
              {loadingContacts ? (
                <div className="flex justify-center p-md"><Spinner className="text-primary w-6 h-6" /></div>
              ) : contacts.length === 0 ? (
                <div className="p-md text-center text-on-surface-variant text-sm">No conversations yet.</div>
              ) : (
                <div className="flex flex-col">
                  {contacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => setActiveUserId(contact.id)}
                      className={`flex items-start gap-3 p-4 text-left border-b border-surface-variant/50 hover:bg-surface-container transition-colors ${activeUserId === contact.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold shrink-0">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-label-md text-on-surface truncate">{contact.name}</h4>
                          <span className="text-[10px] text-outline shrink-0 ml-2">
                            {new Date(contact.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${contact.unread > 0 ? 'text-on-surface font-semibold' : 'text-on-surface-variant'}`}>
                          {contact.last_message}
                        </p>
                      </div>
                      {contact.unread > 0 && (
                        <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {contact.unread}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 flex flex-col ${!activeUserId ? 'hidden md:flex' : 'flex'}`}>
            {activeUserId && activeContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-surface-variant bg-surface flex items-center gap-3 shadow-sm z-10">
                  <button onClick={() => setActiveUserId(null)} className="md:hidden material-symbols-outlined text-on-surface-variant">arrow_back</button>
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {activeContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-h3 text-on-surface">{activeContact.name}</h3>
                    <p className="text-xs text-on-surface-variant capitalize">{activeContact.role || 'User'}</p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-md bg-surface-container-lowest flex flex-col gap-sm">
                  {loadingMessages ? (
                    <div className="flex justify-center p-xl"><Spinner className="text-primary w-8 h-8" /></div>
                  ) : messages.length === 0 ? (
                    <div className="m-auto text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">forum</span>
                      <p>No messages yet. Send a message to start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMe = msg.sender_id === user.id;
                      const showDate = idx === 0 || new Date(messages[idx-1].created_at).toDateString() !== new Date(msg.created_at).toDateString();
                      
                      return (
                        <div key={msg.id} className="flex flex-col">
                          {showDate && (
                            <div className="text-center my-4">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-outline bg-surface-container px-3 py-1 rounded-full">
                                {new Date(msg.created_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${isMe ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-surface-container text-on-surface rounded-tl-sm'}`}>
                              <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                              <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-container/80' : 'text-outline'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSend} className="p-4 border-t border-surface-variant bg-surface flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-surface-tint disabled:opacity-50 disabled:hover:bg-primary transition-colors shrink-0"
                  >
                    {sending ? <Spinner className="w-5 h-5" /> : <span className="material-symbols-outlined">send</span>}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-lowest/50">
                <span className="material-symbols-outlined text-[64px] text-outline-variant mb-4">chat_bubble_outline</span>
                <p className="font-h3 text-on-surface mb-2">Your Messages</p>
                <p className="text-sm">Select a conversation from the sidebar to start chatting.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
