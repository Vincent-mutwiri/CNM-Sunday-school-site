import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from 'lucide-react';

// Mock data - in a real app this would come from the API
const mockConversations = [
  { id: '1', name: 'Ms. Johnson', lastMessage: 'See you tomorrow!', unread: 0 },
  { id: '2', name: 'Mr. Smith', lastMessage: 'Thanks for the update', unread: 2 },
  { id: '3', name: 'Mrs. Williams', lastMessage: 'Can we schedule a meeting?', unread: 0 }
];

const mockMessages = [
  { id: '1', sender: 'Ms. Johnson', content: 'Hi there! Just wanted to let you know that Emma did great in class today.', timestamp: '10:30 AM' },
  { id: '2', sender: 'You', content: "That's great to hear! Thank you for letting me know.", timestamp: '10:32 AM' },
  { id: '3', sender: 'Ms. Johnson', content: 'No problem! Have a great day!', timestamp: '10:33 AM' }
];

const MessagingView: React.FC = () => {
  const [activeConversation, setActiveConversation] = useState('1');
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      // In a real implementation, you would send this to the backend
      console.log('Message sent:', newMessage);
      setNewMessage('');
    }
  };

  const handleRequestAppointment = () => {
    // Open appointment request dialog
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Messages</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Conversations List */}
        <Card className="md:w-1/3">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {mockConversations.map(conversation => (
                <div 
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    activeConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setActiveConversation(conversation.id)}
                >
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{conversation.name}</h3>
                    {conversation.unread > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                </div>
              ))}
            </div>
            
            <div className="p-4">
              <Button className="w-full">
                New Message
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Chat Window */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ms. Johnson</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleRequestAppointment}>
                  <Calendar className="mr-2 h-4 w-4" /> Request Appointment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason for meeting</label>
                    <Textarea placeholder="Enter reason for appointment..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Proposed Date</label>
                    <Input type="date" />
                  </div>
                  <Button>Submit Request</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
              {mockMessages.map(message => (
                <div 
                  key={message.id} 
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.sender === 'You' 
                      ? 'bg-blue-100 ml-auto' 
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="font-semibold text-sm">{message.sender}</div>
                  <div className="mt-1">{message.content}</div>
                  <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessagingView;